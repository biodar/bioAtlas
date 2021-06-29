import React, { useEffect, useState } from 'react';
import Eatlas from 'eatlas';

import './App.css';
import { h5GetData, valuesToLonLatAlt } from './h5';

const turf = window.turf;
const files = [
  // "202007170006_polar_pl_radar20b3_augzdr_lp.h5",
  // "202007170006_polar_pl_radar20b4_augzdr_lp.h5",
  // "202007170007_polar_pl_radar20b2_augzdr_lp.h5",
  // "202007170008_polar_pl_radar20b1_augzdr_lp.h5",
  // "202007170009_polar_pl_radar20b0_augzdr_lp.h5",
  // "202007170004_polar_pl_radar20b0_augzdr_lp.h5",
  // "202007170003_polar_pl_radar20b1_augzdr_lp.h5",
  // "202007170002_polar_pl_radar20b2_augzdr_lp.h5",
  "202007170002_polar_pl_radar20b3_augzdr_lp.h5",
  "202007170002_polar_pl_radar20b4_augzdr_lp.h5"
]
function App() {
  const [xyz, setXYZ] = useState([])
  useEffect(() => {
    files.map(e => processH5("http://localhost:8080/" + e, e));
  }, [])

  // console.log(xyz);
  // TODO: clearly not best for xyz
  const geojson = turf.featureCollection(
    
    xyz.map(e => turf.point(e.slice(0,3), {value: e.slice(3)[0]}))
  )
  // console.log(geojson.features);
  return (
    <> 
    {xyz && xyz.length
      && <Eatlas
      layerName="pointcloud"
      data={geojson} column="value" />}
    </>
  );

  function processH5(url, file) {
    h5GetData(url, file, (obj) => {
      // console.log(obj)
      const { data, where, what } = obj;
      // console.log(obj.elangles);
      const gain = +what.gain, offset = +what.offset;
      const dbz = data.map(e => +((e * gain) + offset).toFixed(4))
      // obj == {data: Array, where: Object, elangles: Array}
      // obj.where => 
      // height: 222
      // lat: 51.29417
      // lon: 0.60639
      // source_local_grid_easting: 5817
      // source_local_grid_northing: 1583
      const radarLonLats = valuesToLonLatAlt({
        // values, rlon, rlat 
        values: dbz, rlon: where.lon, rlat: where.lat,
        elangle: obj.elangles[0]
      });
      // const gj = turf.featureCollection(
      //   radarLonLats.map((e, i) => turf.point(e, { value: dbz[i] }))
      // );

      setXYZ(currXYZ => {
        return(radarLonLats.concat(currXYZ))
      })
    });
  }
}

export default App;
