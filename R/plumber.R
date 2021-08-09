packages = c("curl", "data.table", "jsonlite", 
             "magrittr", "rhdf5", "bioRad")
lapply(packages, library, character.only = TRUE)

# if(is.null(curl::nslookup("r-project.org", error = FALSE))) {
#   stop(message(
#     "No connection",
#     "Please re-run when you are connected."
#   ))
# }

# Enable CORS -------------------------------------------------------------
#' CORS enabled for now. See docs of plumber
#' for disabling it for any endpoint we want in future
#' https://www.rplumber.io/docs/security.html#cross-origin-resource-sharing-cors
#' @filter cors
cors = function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

#' .h5 directory
dir.path = Sys.getenv("H5FILES_PATH")
h5.public = "../build/bioatlas"

if(!dir.exists(dir.path)){
  # try the local path
  # this is where we can dump & read .h5 files
  # in the current WIP of the application.
  dir.path = h5.public
} else {
  # good for dev work
  # TODO: remove/consolidate for release/production
  ##' To check if files (incl. directories) are symbolic links:
  is.symlink <- function(paths) isTRUE(nzchar(Sys.readlink(paths), keepNA=TRUE))
  if(!is.symlink(h5.public)) {
    file.symlink(dir.path, h5.public)
  }
}
# print(dir.path)
# print(list.files(dir.path))

#' list files
#' @serializer unboxedJSON
#' @get /api/files
get_file_names = function(){
  if(!dir.exists(dir.path)){
    return(list(message="No Files to return. Check files path."))
  }
  # we can then cater for CI here and elsewhere
  list.files(dir.path)
}

files = get_file_names()

# get dates+times off the files
# all from same radar?
# length(grep("_polar_pl_radar20", files)) == length(files)
# TRUE
l = gregexpr("_polar_pl_radar20", files[1])
dates = substr(files, 1, l[[1]][1] - 1)
dates = as.POSIXct(dates, format = "%Y%m%d%H%M")
# plot(dates, type = "l")
# skimr::skim(dates)

#' list files
#' @serializer unboxedJSON
#' @get /api/timeline
get_scan_timelines = function(){
  dates
}

#' Tell plumber where our public facing directory is to SERVE.
#' No need to map / to the build or public index.html. This will do.
#'
#' @assets ../build /
list()

#' TODO: is there a rplumber way of serving binary files? Cannot see it:
#' https://www.rplumber.io/articles/rendering-output.html
#' For now, to get a .h5 file from `files` from the above `list()`,
#' the internal server needs to be setup with the appropriate path.
#' For instance to get `domain.com/path/file.h5`, then `path` needs to
#' be setup using Nginx or similar proxy file server which is supercedes
#' rplumber APIs here in this plumber.R file.

agg.dir = "../data"
agg.file = "20180101_polar_pl_radar21_aggregate.h5"

#' Get intervals for sp/lp which are strings of 24hrs of 0000, 0010 ... 2300
#' either 10 or 5 min intervals
#' 
get_intervals = function(lp = FALSE) {
  hh = 0:23; mm = 0:5 * 10
  if(lp) mm = 0:11 * 5
  unlist(lapply(hh, function(x) lapply(mm, function(y) {
    paste0(
      sprintf("%02d", x), 
      sprintf("%02d", y)
    )
  })))
}

intervals = get_intervals()

#' A helper function to create a current environment object (a dataframe).
#' This object is used so that only the data/dbzh column is updated/served.
#' The function uses the local `agg.dir` and `agg.file` to generate the
#' path of the aggregate .h5 file.
init_data = function(hhmm = intervals[1], lp = FALSE) {
  slot = file.path("sp", hhmm)
  if(lp) {
    slot = file.path("lp", hhmm)
  }
  stopifnot(grepl("^sp|^lp", slot))
  datagroup = file.path(slot, "dataset1/data1/data")
  eanglegroup = file.path(slot, "dataset1/where")
  p = file.path(agg.dir, agg.file)
  stopifnot(file.exists(p))
  
  d = h5read(p, datagroup)
  a = h5readAttributes(p, eanglegroup)$elangle
  
  ranges = dim(d)[1]; cols = dim(d)[2]
  
  dt = data.frame(value=as.vector(d), 
                  theta=rep(c(1:cols), ranges), 
                  radius=rep(c(1:ranges)*600,each=cols), 
                  a=rep(a, each=(cols*ranges)))
  dt = as.data.table(dt)
  
  rl = h5readAttributes(p, paste0(slot, "/where"))
  
  # get x,y,z
  dt$x = dt$radius*sin(90-dt$a)*cos(dt$theta)
  dt$y = dt$radius*sin(90-dt$a)*sin(dt$theta)
  dt$z = (beam_height(dt$radius, dt$a, k = 4/3, lat = rl$lat, re = 6378, rp = 6357) + rl$height) %>% round
  
  # continue Chris's comments/code
  # Now calculate the change in latitude and longitude for each of those points
  # https://stackoverflow.com/questions/2187657/calculate-second-point-knowing-the-starting-point-and-distance
  delta_lon = dt$x/(111320*cos(rl$lat))  # dx, dy in meters
  delta_lat = dt$y/110540                       # result in degrees long/lat
  # Calculate the lat and long of each point in the radar scan
  dt$lat  = rl$lat + delta_lat
  dt$long = rl$lon + delta_lon
  
  # get gain & offset
  go = h5readAttributes(p, file.path(slot, "dataset1/data1/what"))
  
  dt$gain = go$gain
  dt$offset = go$offset
  
  # calc Z/dbZ
  dt$value = (dt$value * dt$gain) + dt$offset
  
  dt$x = NULL
  dt$y = NULL
  rm(delta_lon, delta_lat, go)
  h5closeAll()
  dt
}

dt = init_data()

#' Read the aggregate and serve a time slot's dbzh?
#' @serializer unboxedJSON
#' @get /api/aggregate/hhmm
#' @get /api/aggregate/hhmm/lp
#' @get /api/aggregate
get_aggregate = function(res, hhmm = intervals[1], lp = FALSE) {
  slot = file.path("sp", hhmm)
  if(lp) {
    slot = file.path("lp", hhmm)
  }
  p = file.path(agg.dir, agg.file)
  if(!file.exists(p)) {
    print("file not found")
    res$status = 500
    return(list(error = "An error occurred. Please contact your administrator."))
  }
  if(!grepl("^sp|^lp", slot)) {
    print("Slot does not start with sp|lp")
    res$status = 500
    return(list(error = "An error occurred. Please contact your administrator."))
  }
  # add in the dates (time really)
  # hard-coded
  l = gregexpr("_polar_pl_radar21", basename(p))
  date = substr(basename(p), 1, l[[1]][1] - 1)
  date = as.POSIXct(paste0(date, hhmm), format = "%Y%m%d%H%M")
  
  # data from slot
  datagroup = file.path(slot, "dataset1/data1/data")
  eanglegroup = file.path(slot, "dataset1/where")
  
  # update data
  dt$value = as.vector(h5read(p, datagroup))
  dt$value = (dt$value * dt$gain) + dt$offset
  
  # update z
  # these should be fast
  a = h5readAttributes(p, eanglegroup)$elangle
  rl = h5readAttributes(p, paste0(slot, "/where"))
  dt$z = (beam_height(dt$radius, a, k = 4/3, lat = rl$lat, re = 6378, rp = 6357) + rl$height) %>% round
  
  # clean up
  dt = dt[dt$value != 0]
  
  # print(skimr::skim(dt))

  h5closeAll()
  list(
    data=dt$value, a=a, z=dt$z, time=date, l=c(rl$lon, rl$lat)
  )
}

# dt.all = lapply(get_intervals()[1:10], function(x) get_aggregate(hhmm = x))

#' Return the lon lats from the initial dt
#' @serializer unboxedJSON
#' @get /api/lonlats
get_lonlats = function() {
  list(
    lons=dt$long,
    lats=dt$lat
  )
}

#' Return only the radar's lon lat
#' @serializer unboxedJSON
#' @get /api/radarwhere
get_radar_lonlat = function() {
  p = file.path(agg.dir, agg.file)
  if(!file.exists(p)) {
    print("file not found")
    res$status = 500
    return(list(error = "An error occurred. Please contact your administrator."))
  }
  h5readAttributes(p, "sp/0000/where")
}

h5closeAll()