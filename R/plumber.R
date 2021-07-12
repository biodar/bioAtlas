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

#' @section TODO:
#' The plumber endpoint should not be there. Currently mapping React build to /
#' at assets causes the swagger endpoint to be 404. Support is limited.
#'
#' @get /__swagger__/
swagger = function(req, res){
  fname = system.file("swagger-ui/index.html", package = "plumber") # serve the swagger page.
  plumber::include_html(fname, res)
}

#' .h5 directory
dir.path = Sys.getenv("H5FILES_PATH")

#' list files
#' @serializer unboxedJSON
#' @get /api/files
get_file_names = function(){
  if(!dir.exists(dir.path)){
    return(list(message="No Files to return"))
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
#' @assets ./build /
list()
