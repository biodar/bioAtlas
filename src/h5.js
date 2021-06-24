import { isArray, isNumber, isString } from "./JSUtils";
const hdf5 = window.hdf5;

const h5GetData = (url, file, callback) => {
  if (!isString(file) || !isString(url)
    || !url || !file) return null;

  // console.log('fetching...')
  fetch(url)
    .then(function (response) {
      // console.log(response)
      return response.arrayBuffer()
    })
    .then(function (buffer) {
      var f = new hdf5.File(buffer, file);
      const data = f.get('dataset1/data1/data').value;
      const where = f.get('where').attrs;
      const what = f.get('dataset1/data1/what').attrs;
      // TODO [...new Set(items)]
      const elangles = f.get('dataset1/how/elangles').value;
      // console.log('data: ', data);
      typeof callback === 'function' &&
        callback({ data: data.filter(e => e !== 0), 
          where, what, elangles});
      // data.slice(0, 500).map( e => console.log(e >= 618))
      // console.log('what: ', what)
      // console.log('data10: ', f.get('dataset1/data10'))
      // console.log('where: ', f.get('where'))
      // do something with f;
      // let g = f.get('group');
      // let d = f.get('group/dataset');
      // let v = d.value;
      // let a = d.attrs;
    });
}
/**
 * Function to translate radar values to xyz points in geographic space.
 * More documentation will be written on the method fod going it. 
 * 
 * Currently the code is written as JS version fo the R code
 * written by Dr Chris Hassall here:
 * https://github.com/biodar/bdformats/blob/master/Reading%20HDF5%20in%20R.R
 * 
 * @param {Object} options 
 * @returns 
 */
const valuesToLonLat = (options) => {
  const { values, rlon, rlat, range = 50 } = options;
  const lonlats = [];
  if (!isArray(values) || !isNumber(+rlon) ||
    !isNumber(rlat)) {
    return null
  }
  for (let t = 0; t < 360; t++) {
    for (let r = 0; r < range; r++) {
      // for each theta radar goes 425 ranges
      // values[a*r] 
      if(values[t*r] < 0) continue
      lonlats.push([
        //delta / 111320 * cos (rlat)
        rlon + ((r * Math.sin(t)) / 110540),
        rlat + ((r * Math.cos(t)) / 111320 * Math.cos(rlat)),
        // TODO 
        // z
        beamHeight({range, elevation: 1, lat: rlat})
      ])
    }
  }
  return lonlats;
}

const beamHeight = (options) => {
  const {range, elevation, k = 4/3, lat, re = 6378, rp = 6357} = options;
  if(!isNumber(range) || !isNumber(k) || !isNumber(elevation) || !isNumber(lat)
  || !isNumber(re) || !isNumber(rp)) return null;
  
  //from https://github.com/adokter/bioRad/blob/master/R/beam.R
  const earthRadius = (a, b, lat) => {
    lat = lat * Math.PI / 180
    const r = +(1000 * Math.sqrt(
      ((a**2 * Math.cos(lat))**2 + (b**2 * Math.sin(lat))**2) /
        ((a * Math.cos(lat))**2 + (b * Math.sin(lat))**2)
    )).toFixed(2)
    return r;
  }

  // sqrt(
  //   range^2 + (k * earth_radius(re, rp, lat))^2 +
  //     2 * range * (k * earth_radius(re, rp, lat)) * sin(elev * pi / 180)
  // ) - k * earth_radius(re, rp, lat)
  const er = earthRadius(re, rp, lat);
  const bh = Math.sqrt(
    range ** 2 + (k * er) ** 2 +
    2 * range * (k * er) * Math.sin(elevation * Math.PI / 180)
  ) - k * er;

  return +bh.toFixed(2)
}

export {
  valuesToLonLat,
  beamHeight,
  h5GetData
}