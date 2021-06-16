import { isArray, isNumber, isString } from "./JSUtils";
const hdf5 = window.hdf5;

const h5GetData = (url, file, callback) => {
  if (!isString(file) || !isString(url)) return null;

  console.log('fetching...')
  fetch(url + file)
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
const valuesToLonLat = (options) => {
  const { values, rlon, rlat } = options;
  const lonlats = [];
  if (!isArray(values) || !isNumber(+rlon) ||
    !isNumber(rlat)) {
    return null
  }
  for (let t = 0; t < 360; t++) {
    for (let r = 0; r < 425; r++) {
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