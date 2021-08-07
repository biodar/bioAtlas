import React, { useEffect, useState } from 'react';
import Eatlas from 'eatlas';

import './App.css';
import { h5GetData, valuesToLonLatAlt } from './h5';
import { isDate } from './JSUtils';
import { InputSlider } from './utils';

// const files = require('./files.json');

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
  // "202007170002_polar_pl_radar20b3_augzdr_lp.h5",
  // "202007170002_polar_pl_radar20b4_augzdr_lp.h5"
  "202007170002_polar_pl_radar20b2_augzdr_lp.h5"
]
function App() {
  const [xyz, setXYZ] = useState([])
  const [dates, setDates] = useState([])

  useEffect(() => {
    files.map(e => processH5("https://raw.githubusercontent.com/biodar/bdformats/master/" + e, e));
    fetch('http://IP/api/timeline')
      .then(res => {
        if (res.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            res.status);
          return;
        }
        return res.json()
      })
      .then(d => setDates(d))
  }, [])

  // console.log(xyz);
  // TODO: clearly not best for xyz
  const getBio = (v) => v < 0.5 ? 1 : v < 1 ? 2 :
  v < 1.5 ? 3 : 4
  const geojson = turf.featureCollection(
    
    xyz.map(e => turf.point(e.slice(0,3), 
    {alt: e.slice(2,3)[0], value: getBio(e.slice(3,4)[0]),
      date: e.slice(4)[0]
    }))
  )
  // console.log(geojson.features.slice(0,10));
  if(!xyz || !xyz.length) return(
    <div className="App">
      <div className="App-header"> No data to visualize </div>
    </div>
  )
  console.log(dates);
  return (
    <> 
    <Eatlas
      layerName="pointcloud"
      data={geojson} column="value" />
    {dates && dates.length && <div 
      className="mapbox-legend mapboxgl-ctrl bottom-panel"
      style={{
        backgroundColor: '#242730',
        color: 'white',
        marginRight:60,
        height: 140,
        padding: 15
        }}>
        <InputSlider dates={dates}/>
    </div>}
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
      const d = file.substr(0, file.indexOf("_polar_pl"));
      const dd = new Date(
        d.slice(0,4), +d.slice(4,6) - 1, d.slice(6,8), d.slice(8,10),
        d.slice(10)
      )
      const radarLonLats = valuesToLonLatAlt({
        // values, rlon, rlat 
        values: dbz, rlon: where.lon, rlat: where.lat,
        elangle: obj.elangles[0], 
        date: isDate(dd) && dd.toISOString()
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
