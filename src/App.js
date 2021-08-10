import React, { useEffect, useState } from 'react';
import Eatlas from 'eatlas';

import './App.css';
import { fetchJSON, InputSlider } from './utils';

// const files = require('./files.json');

const turf = window.turf;
const API_ROOT = process.env.REACT_APP_API_ROOT
  || "http://localhost:8000/api"

function App() {
  const [xyz, setXYZ] = useState([])
  const [dates, setDates] = useState([])
  const [lonlats, setLonLats] = useState([])

  useEffect(() => {
    // files.map(e => processH5("https://raw.githubusercontent.com/biodar/bdformats/master/" + e, e));
    fetchJSON(API_ROOT + '/lonlats', (ll, error) => {
      if (!error) {
        setLonLats(ll)
        getAggDataWithSlot();
      }
    })
    fetchJSON(API_ROOT + '/timeline', (data, error) => {
      if (!error) {
        setDates(data);
      }
    })
  }, [])

  // console.log(xyz);
  // TODO: clearly not best for xyz
  const getBio = (v) => v < 0.5 ? 1 : v < 1 ? 2 :
    v < 1.5 ? 3 : 4
  const geojson = xyz.data && turf.featureCollection(
    xyz.data.map((e, i) => turf.point(
      [lonlats.lons[i], lonlats.lats[i], xyz.z[i]],
      {
        alt: xyz.z[i],
        value: getBio(e),
        date: xyz.time
      }))
  )
  // console.log(geojson.features.slice(0,10));
  if (!xyz || !xyz.data) return (
    <div className="App">
      <div className="App-header"> No data to visualize </div>
    </div>
  )

  function getAggDataWithSlot(time = '') {
    fetchJSON(API_ROOT + '/aggregate/' + time, (json, error) => {
      if (!error) {
        // console.log(json)
        setXYZ(json);
      }
    });
  }

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
          marginRight: 60,
          height: 140,
          padding: 15
        }}>
        <InputSlider dates={dates}
          callback={(newTime) => {
            const hh = newTime
              .slice(newTime.length - 8, newTime.length - 6)
            const mm = newTime
              .slice(newTime.length - 5, newTime.length - 4)
            // Because the date in the where and aggregate slots
            // are different we do:
            // get hours + 
            // get minutes and break them according to lp/sp
            // for now just sp
            const newSlot = hh + (+mm >= 5 ? 5 : 0) + "0"
            console.log(newSlot)
            getAggDataWithSlot(newSlot)
          }} />
      </div>}
    </>
  );
}

export default App;
