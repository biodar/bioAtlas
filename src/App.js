import React, { useEffect, useState } from 'react';
import Eatlas from 'eatlas';

import './App.css';
import { h5GetData, valuesToLonLat } from './h5';

const turf = window.turf;
const url = "https://raw.githubusercontent.com/biodar/bdformats/master/202007170002_polar_pl_radar20b2_augzdr_lp.h5"
const file = "202007170002_polar_pl_radar20b2_augzdr_lp.h5"
function App() {
  const [geojson, setGeojson] = useState({})
  useEffect(() => {
    h5GetData(url, file, (obj) => {
      // console.log(obj)
      const { data, where, what } = obj;
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
      const gain = +what.gain, offset = +what.offset;
      const gj = turf.featureCollection(
        radarLonLats.map((e, i) => turf.point(e, 
          { value: +(((data[i] * gain) + offset).toFixed(4)) }))
      )
      if (Object.keys(geojson).length === 0) {
        setGeojson(gj)
      }
      // console.log(radarLonLats)
    })
    // convert the points to geojson :(
    // TODO: 88k of them?
  })
  // console.log(geojson)
  return (
    Object.keys(geojson).length !== 0
    && <Eatlas data={geojson} column={"value"}/>
  );
}

export default App;
