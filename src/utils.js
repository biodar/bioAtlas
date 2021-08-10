import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import SpeedIcon from '@material-ui/icons/Speed';

const downloadJSON = (json, filename = 'filename.json') => {
  const fileData = JSON.stringify(json);
  const blob = new Blob([fileData], { type: "text/plain" });
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

//https://codesandbox.io/s/329jy81rlm?file=/src/index.js:204-291
function useInterval(callback, delay) {
  const savedCallback = React.useRef();
  // Remember the latest function.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const useStyles = makeStyles({
  root: {
    width: 250,
  },
  input: {
    width: 42,
  },
});

const InputSlider = (props) => {
  const classes = useStyles();
  const step = 50, max = 5000, min = 500;

  const [value, setValue] = React.useState(1000);
  const [index, setIndex] = React.useState(0);
  const [dates, setDates] = React.useState(props.dates);
  const [delay, setDelay] = React.useState(null);
  const [amount, setAmount] = React.useState(1000);

  React.useEffect(() => {
    setDates(props.dates);
  }, [props])

  useInterval(() => {
    // Your custom logic here
    setIndex(i => {
      let newIndex = i + 1
      if (i + 1 >= dates.length) {
        setDelay(null)
        newIndex = i
      }
      typeof callback === 'function' &&
        callback(dates[newIndex]);
      return newIndex
    });
  }, delay);

  const { callback } = props;

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > max) {
      setValue(max);
    }
  };

  if (!dates || !dates.length) return null;

  return (
    <div className={classes.root} style={{ textAlign: 'center' }}>
      {index}
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <i
            style={{ maxHeight: 40, maxWidth: 40 }}
            onClick={() => {
              if (!delay) {
                setDelay(amount)
              } else {
                setDelay(null) //stop
              }
            }} >
            {
              !delay ?
                <i style={{ fontSize: '2em' }} className="fa fa-play"></i>
                : <i style={{ fontSize: '2em' }} className="fa fa-pause"></i>
            }
          </i>
        </Grid>
        <Grid item xs>
          <Slider
            value={index}
            min={0}
            step={1}
            max={dates.length - 1}
            getAriaValueText={(i) => dates[i]}
            valueLabelFormat={(i) => dates[i]}
            onChange={(v, n) => {
              setIndex(n);
              typeof callback === 'function' 
                && callback(dates[n]);
            }}
            valueLabelDisplay="auto"
            aria-labelledby="non-linear-slider"
          />
        </Grid>
      </Grid>
      <Typography id="input-slider" gutterBottom>
        Speed
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <SpeedIcon fontSize="large" />
        </Grid>
        <Grid item xs>
          <Slider
            min={min}
            max={max}
            step={step}
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>
          <Input
            style={{ background: '#242730', color: 'white' }}
            className={classes.input}
            value={value}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step,
              min,
              max,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}

/**
 * Thanks to https://stackoverflow.com/a/34695026/2332101
 * @param {*} str 
 */
const isURL = (str) => {
  var a = document.createElement('a');
  a.href = str;
  return (a.host && a.host !== window.location.host);
}

/**
 * Simple function to fetch JSON from URL
 * @param {*} url 
 * @param {*} callback 
 */
const fetchJSON = (url, callback) => {
  if (!url || !isURL(url)) {
    if (typeof callback === 'function') {
      callback(null, 'Please provide a valid URL.')
    } else {
      return null
    }
  }
  if (typeof callback !== 'function') return null
  fetch(url)
    .then((response) => response.text())
    .then((response) => {
      try {
        const json = JSON.parse(response);
        callback(json)
      } catch (error) {
        callback(null, error)
      }
    })
    .catch((error) => {
      console.error(error);
      callback(null, error)
    });
}

export {
  convertRange,
  downloadJSON,
  InputSlider,
  fetchJSON
}