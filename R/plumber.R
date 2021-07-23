packages = c("curl", "data.table", "jsonlite")
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
print(dir.path)
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
