library(testthat)
source("R/plumber.R")

# test_that("1 + 1 = 2", {
#   expect_equal(1 + 1, 2)
# })
#> Test passed 😸

test_that("1 + 1 = 3 is false", {
  expect_true(1 + 1 == 3)
})

#> 1 + 1 == 3 is not TRUE
#> `actual`:   FALSE
#> `expected`: TRUE 

test_that("get_intervals is correct", {
  ints = get_intervals()
  expect_equal(length(ints), 24 * 6)
  ints = get_intervals(TRUE)
  expect_equal(length(ints), 24 * 12)
})
#> Test passed 🎊

test_that("get_aggregate returns data", {
  ints = get_intervals()
  agg1 = get_aggregate(hhmm = ints[sample(length(ints), 1)])
  expect_true(length(agg1) == 4)
  expect_true(length(agg1[[1]]) > 1e4)
})

test_that("get_aggregate gets different reflectivity", {
  ints = get_intervals()
  agg1 = get_aggregate(hhmm = ints[1])
  agg2 = get_aggregate(hhmm = ints[111])
  # highly unlikely to be true, though it is possible :)
  # 5 random points of scans in scan 1 and scan 111 of 144 scans
  # to be identical
  n = sample(length(agg1[[1]]), 5)
  print(paste0("reflectivity values agg1: ", paste0(agg1[[1]][n], collapse = ", ")))
  print(paste0("reflectivity values agg2: ", paste0(agg2[[1]][n], collapse = ", ")))
  expect_false(identical(agg1[[1]][n], agg2[[1]][n]))
})

#' looks like reading the entire slots into memory as currently formatted in `get_aggregate`
#' function without the lon lats derived from the .h5 is not that big
# dt.all = lapply(get_intervals(), function(x) get_aggregate(hhmm = x))
# pryr::object_size(dt.all)
#> 158 MB