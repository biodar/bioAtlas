import React, { useEffect, useState } from 'react';
import Eatlas from 'eatlas';

import './App.css';
import { h5GetData, valuesToLonLat } from './h5';

const turf = window.turf;

function App() {
  const [geojson, setGeojson] = useState({})
  useEffect(() => {
    h5GetData("http://localhost:8080/", "file.h5", (obj) => {
    // console.log(obj)
    const {data, where} = obj;
    // obj == {data: Array, where: Object, elangles: Array}
    // obj.where => 
    // height: 222
    // lat: 51.29417
    // lon: 0.60639
    // source_local_grid_easting: 5817
    // source_local_grid_northing: 1583
    const radarLonLats = valuesToLonLat({
      // values, rlon, rlat 
      values: data, rlon: where.lon, rlat: where.lat
    })
    const gj = turf.featureCollection(
      radarLonLats.map(e => turf.point(e))
    )
    if(Object.keys(geojson).length === 0) {
      setGeojson(gj)
    }
    // console.log(radarLonLats)
  })
  // convert the points to geojson :(
  // TODO: 88k of them?
  })
  // console.log(geojson)
  return (
    <Eatlas data={geojson} />
  );
}

export default App;
