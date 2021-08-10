(this.webpackJsonpbioAtlas=this.webpackJsonpbioAtlas||[]).push([[0],{1155:function(t,n,e){t.exports=e(2201)},1160:function(t,n,e){},1190:function(t,n){},137:function(t,n){var e=function(t){return null!==t&&void 0!==t&&t.constructor===String},a=function(t){return null!==t&&void 0!==t&&t.constructor===Number},r=function(t){return null!==t&&void 0!==t&&t.constructor===Boolean};n.randomToNumber=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return Math.floor(Math.random()*t)},n.isBoolean=r,n.isString=e,n.isNumber=a,n.isObject=function(t){return null!==t&&void 0!==t&&t.constructor===Object},n.isArray=function(t){return null!==t&&void 0!==t&&t.constructor===Array},n.isDate=function(t){return"[object Date]"===Object.prototype.toString.call(t)&&!isNaN(t.getTime())},n.sanitizeFloat=function(t){if(a(t))return t;if(e(t)){var n=parseFloat(t);return isNaN(n)?null:n}return null},n.sanitizeInt=function(t){return a(t)?t:e(t)?parseInt(t):null},n.sanitizeString=function(t){return e(t)?t:a(t)?t.toString():null},n.sanitizeStringNonNull=function(t){return e(t)?t:a(t)?t.toString():""},n.sanitizeBool=function(t){return r(t)?t:a(t)?Boolean(t):null},n.isEmptyOrSpaces=function(t){return null===t||null!==t.match(/^ *$/)}},1695:function(t,n){},2191:function(t,n,e){},2201:function(t,n,e){"use strict";e.r(n);var a=e(1),r=e.n(a),o=e(65),i=e.n(o),u=(e(1160),e(49)),c=e(1115),l=e.n(c),s=(e(2191),e(137)),f=window.hdf5,d=function(t){var n=t.range,e=t.elevation,a=t.k,r=void 0===a?4/3:a,o=t.lat,i=t.re,u=void 0===i?6378:i,c=t.rp,l=void 0===c?6357:c;if(!Object(s.isNumber)(n)||!Object(s.isNumber)(r)||!Object(s.isNumber)(e)||!Object(s.isNumber)(o)||!Object(s.isNumber)(u)||!Object(s.isNumber)(l))return null;var f=function(t,n,e){return e=e*Math.PI/180,+(1e3*Math.sqrt((Math.pow(Math.pow(t,2)*Math.cos(e),2)+Math.pow(Math.pow(n,2)*Math.sin(e),2))/(Math.pow(t*Math.cos(e),2)+Math.pow(n*Math.sin(e),2)))).toFixed(2)}(u,l,o);return+(Math.sqrt(Math.pow(n,2)+Math.pow(r*f,2)+2*n*(r*f)*Math.sin(e*Math.PI/180))-r*f).toFixed(2)},h=window.turf,b=["202007170002_polar_pl_radar20b2_augzdr_lp.h5"];var v=function(){var t=Object(a.useState)([]),n=Object(u.a)(t,2),e=n[0],o=n[1],i=Object(a.useState)(!0),c=Object(u.a)(i,2),v=c[0],p=c[1];Object(a.useEffect)((function(){b.map((function(t){var n;!function(t,n,e){if(!Object(s.isString)(n)||!Object(s.isString)(t)||!t||!n)return null;fetch(t).then((function(t){return t.ok?t.arrayBuffer():null})).then((function(t){var a=new f.File(t,n),r=a.get("dataset1/data1/data").value,o=a.get("where").attrs,i=a.get("dataset1/data1/what").attrs,u=a.get("dataset1/how/elangles").value;"function"===typeof e&&e({data:r.filter((function(t){return 0!==t})),where:o,what:i,elangles:u})})).catch((function(t){console.log(t)}))}("https://raw.githubusercontent.com/biodar/bdformats/master/"+t,n=t,(function(t){var e=t.data,a=t.where,r=t.what,i=+r.gain,u=+r.offset,c=e.map((function(t){return+(t*i+u).toFixed(4)})),l=n.substr(0,n.indexOf("_polar_pl")),f=new Date(l.slice(0,4),+l.slice(4,6)-1,l.slice(6,8),l.slice(8,10),l.slice(10)),h=function(t){var n=t.values,e=t.rlon,a=t.rlat,r=t.range,o=void 0===r?80:r,i=t.elangle,u=void 0===i?1:i,c=t.date,l=[];if(!Object(s.isArray)(n)||!Object(s.isNumber)(+e)||!Object(s.isNumber)(a))return null;for(var f=0;f<360;f++)for(var h=0;h<o;h++)if(!(n[f*h]>2||n[f*h]<.25)){var b=600*h,v=d({range:b,elevation:u,lat:a});l.push([e+b*Math.sin(f)/110540,a+b*Math.cos(f)/111320*Math.cos(a),+v.toFixed(0),n[f*h],c])}return l}({values:c,rlon:a.lon,rlat:a.lat,elangle:t.elangles[0],date:Object(s.isDate)(f)&&f.toISOString()});p(!1),o((function(t){return h.concat(t)}))}))}))}),[]);var g=h.featureCollection(e.map((function(t){return h.point(t.slice(0,3),{alt:t.slice(2,3)[0],value:(n=t.slice(3,4)[0],n<.5?1:n<1?2:n<1.5?3:4),date:t.slice(4)[0]});var n})));return e&&e.length?r.a.createElement(r.a.Fragment,null,r.a.createElement(l.a,{layerName:"pointcloud",data:g,column:"value"})):r.a.createElement("div",{className:"App"},r.a.createElement("div",{className:"App-header"}," ",v?"Loading...":"No data"," "))},p=function(t){t&&t instanceof Function&&e.e(3).then(e.bind(null,2234)).then((function(n){var e=n.getCLS,a=n.getFID,r=n.getFCP,o=n.getLCP,i=n.getTTFB;e(t),a(t),r(t),o(t),i(t)}))};i.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(v,null)),document.getElementById("root")),p()},397:function(t,n){},691:function(t,n){}},[[1155,1,2]]]);
//# sourceMappingURL=main.a51b5135.chunk.js.map