import { isArray, isNumber, isString } from "./JSUtils";
const hdf5 = window.hdf5;

const h5GetData = (url, file, callback) => {
  if (!isString(file) || !isString(url)
    || !url || !file) return null;

  // console.log('fetching...')
  fetch(url)
    .then(function (response) {
      // console.log(response)
      if(!response.ok) return null
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
    })
    .catch(error => {
      console.log(error)
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
const valuesToLonLatAltdBZ = (options) => {
  // See Maryna's email range up to 50km
  // that is 50000/600 ~ 80 out of the 425 ranges
  const { values, rlon, rlat, range = 80, elangle = 1,
  date } = options;
  const xyzs = [];
  if (!isArray(values) || !isNumber(+rlon) ||
    !isNumber(rlat)) {
    return null
  }
  for (let t = 0; t < 360; t++) {
    for (let r = 0; r < range; r++) {
      // for each theta radar goes 425 ranges
      // values[a*r] 
      // see https://www.weather.gov/media/lmk/soo/Dual_Pol_Overview.pdf
      if(values[t*r] > 2 || values[t*r] < 0.25) continue
      const rm = r * 600;
      const ralt = beamHeight({range: rm, elevation: elangle, lat: rlat})
      // console.log(ralt);
      xyzs.push([
        //delta / 111320 * cos (rlat)
        rlon + ((rm * Math.sin(t)) / 110540),
        rlat + ((rm * Math.cos(t)) / 111320 * Math.cos(rlat)),
        // TODO 
        // z
        +ralt.toFixed(0),
        //zdr
        values[t*r],
        // convertRange(+values[t*r].toFixed(1), {
        //   oldMin:0.25, oldMax: 2, newMin: 1, newMax: 10
        // }),
        //date
        date
      ])
    }
  }
  return xyzs;
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
  valuesToLonLatAltdBZ as valuesToLonLatAlt,
  beamHeight,
  h5GetData
}