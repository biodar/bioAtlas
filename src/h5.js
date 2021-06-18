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
      // TODO [...new Set(items)]
      const elangles = f.get('dataset1/how/elangles').value;
      // console.log('data: ', data);
      typeof callback === 'function' &&
        callback({ data , where, elangles});
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
      if (values[r * t] === 0) continue; // or undefined?
      // values[a*r] 
      lonlats.push([
        //delta / 111320 * cos (rlat)
        rlon + ((r * Math.sin(t)) / 110540),
        rlat + ((r * Math.cos(t)) / 111320 * Math.cos(rlat))
        // TODO 
        // z
      ])
    }
  }
  return lonlats;
}

export {
  valuesToLonLat,
  h5GetData
}