# bioAtlas 
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
## July 5th

Meeting notes & 3D radar image. More later.


## June 24th

We can now translate all azimuth and range values of the radar to xyz. The DeckGL pointcloudlayer and the scatterplotlayers can visualize the points. Attention now is on zdr values to detect insects. Then we can look at how we can detect their shapes from the radar beam heights. 

## Start 11th June
So far, we have been able to translate each value in a ODIM format hdf5 `dataset1/data1/data`'s 360x425 table (total of 153k) into lon/lat pairs from the radar's origin (so far just a 2D plane) thanks to Dr Christopher Hassall.

In this eAtlas repo, the aim is getting [that R code](https://github.com/biodar/bdformats/blob/e77bee40fb6ebf5e76cd9c68691d0c67f3d110fa/Reading%20HDF5%20in%20R.R) into JS using [jsfive](https://github.com/usnistgov/jsfive).

## Note
This is a template repository to use the Turing Geo-visualization Engine (TGVE or eAtlas) in a React app and deploying it in github pages. Most of the dev work is done using TGVE/npm branch locally and could be pushed here too.

