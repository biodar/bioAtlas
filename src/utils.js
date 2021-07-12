const downloadJSON = (json, filename = 'filename.json') => {
  const fileData = JSON.stringify(json);
  const blob = new Blob([fileData], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

const convertRange = (oldValue = 2, values = 
  { oldMax: 10, oldMin: 1, newMax: 1, newMin: 0 }) => {
  const value = (((oldValue - values.oldMin) * (values.newMax - values.newMin))
    / (values.oldMax - values.oldMin)) + values.newMin
  return +(value.toFixed(2))
}

export {
  convertRange,
  downloadJSON
}