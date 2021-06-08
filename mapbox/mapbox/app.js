import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

//mapboxgl.accessToken = 'pk.eyJ1IjoiZWpsMjQiLCJhIjoiY2twam15eTIyMDRnMjJ2cGJpcDMydW5maCJ9.IO0Yzvqazsbc86dlBv4B4g';
mapboxgl.accessToken = 'pk.eyJ1IjoibmtyMTAiLCJhIjoiY2tvdHFzcGtqMDVlNzJwcGl5dGxud241cyJ9.4Js3QvmYAkJyvsoGZCUP8A';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
//const data = '2012-2019.json';
const data = 'traffic.json';

const INITIAL_VIEW_STATE = {
  longitude: 174.8860,
  latitude: -40.9006,
  zoom: 6,
  minZoom: 3,
  maxZoom: 20,
  pitch: 150,
  bearing: -50
};

const colorRange = [
[213, 224, 137],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];

const colorRangeLight = [
  [240,230,140],
  [240,230,140],
  [240,230,140],
  [240,230,140],
  [240,230,140],
  [240,230,140]
];

const colorRangeHeavy = [
  [0,0,255],
  [0,0,255],
  [0,0,255],
  [0,0,255],
  [0,0,255],
  [0,0,255]
];

//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
//const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';
const MAP_STYLE = 'mapbox://styles/nkr10/ckpn8p2l608tl17ogxyzgclv4';

const map = new mapboxgl.Map({
  container: 'map',
  style: MAP_STYLE,
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: true,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

var deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },

  layers: [
    new HexagonLayer({
      id: 'heatmap2012', 
      colorRange: colorRange, 
      data: data,
      getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
      getElevationWeight: d => Math.ceil(parseFloat(d.AADT2012)/100),
      elevationScale: 250,
      extruded: true,
      pickable: true,
      opacity: 0.8,
      radius: 1000,
      coverage: 1,
    }),

    new ScatterplotLayer({
      id: 'scatter2012',
      data: data,
      opacity: 0.5,
      filled: true,
      radiusMinPixels: 4,
      radiusMaxPixels: 4,
      getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
      getFillColor: [151, 230, 165],
      pickable: true,

      onHover: ({object, x, y}) => {
        const el = document.getElementById('tooltip');
        if (object) {
            const { Description, AADT2012,  AADT2013} = object;
            
            var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
            
            el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
            <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
            el.style.display = 'block';
            el.style.opacity = 0.9;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        } else {
            el.style.opacity = 0.0;
        }
      }
    }),

    new HeatmapLayer({
      id: 'heat2012',
      data: data,
      getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
      getWeight: d => parseInt(d.AADT2012),
      radiusPixels: 50,
    }),
  ]
});

map.on('load', () => {
  map.addLayer(new MapboxLayer({id:'3d-heatmap', deck}));

  //get radio buttons
  var allTraffic = document.getElementById("total");
  var vehicles = document.getElementById('vehicles');
  var light = document.getElementById('light');
  var heavy = document.getElementById('heavy');
  var heat = document.getElementById('heatmap')

  var button2012 = document.getElementById("2012").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2012").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2012', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2012/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2012',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2012,  AADT2013} = object;
                    
                    var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
                    
                    el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
                    <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2012) - (parseFloat(d.Heavy2012)/100) * parseFloat(d.AADT2012))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2012) * (parseFloat(d.Heavy2012)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2012,  AADT2013} = object;
                      
                      var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
                      
                      el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
                      <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2012) - (parseFloat(d.Heavy2012)/100) * parseFloat(d.AADT2012))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2012,  AADT2013} = object;
                    
                    var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
                    
                    el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
                    <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2012) - (parseFloat(d.Heavy2012)/100) * parseFloat(d.AADT2012))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2012,  AADT2013} = object;
                    
                    var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
                    
                    el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
                    <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2012',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2012,  AADT2013} = object;
                    
                    var follPerc = (((AADT2013 - AADT2012) / AADT2012) * 100).toFixed(2); //following AADT
                    
                    el.innerHTML = `<p> <b>Year:</b> 2012 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${(AADT2012)} 
                    <br> <br> <b>Following AADT: </b> ${(parseInt(AADT2013))} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2012',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2012),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2013 = document.getElementById("2013").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2013").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2013', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2013/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2013',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2013', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2013) - (parseFloat(d.Heavy2013)/100) * parseFloat(d.AADT2013))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2013', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2013) * (parseFloat(d.Heavy2013)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2013',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2013', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2013) - (parseFloat(d.Heavy2013)/100) * parseFloat(d.AADT2013))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2013',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2013', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2013) - (parseFloat(d.Heavy2013)/100) * parseFloat(d.AADT2013))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2013',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2013',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2013',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2013),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2014 = document.getElementById("2014").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2014").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2014', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2014/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2014',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
              const el = document.getElementById('tooltip');
      
              if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
              } else {
                  el.style.opacity = 0.0;
              }
          }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2014', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2014) - (parseFloat(d.Heavy2014)/100) * parseFloat(d.AADT2014))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2014', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2014) * (parseFloat(d.Heavy2014)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2014',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
          
                  if (object) {
                    const { Description, AADT2013, AADT2014, AADT2015 } = object;
        
                    var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                  } else {
                    el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2014', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2014) - (parseFloat(d.Heavy2014)/100) * parseFloat(d.AADT2014))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2014',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2014', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2014) - (parseFloat(d.Heavy2014)/100) * parseFloat(d.AADT2014))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2014',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                  const { Description, AADT2013, AADT2014, AADT2015 } = object;
      
                  var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
                } else {
                  el.style.opacity = 0.0;
                }
            }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2014',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
        
                if (object) {
                    const { Description, AADT2013, AADT2014, AADT2015 } = object;
        
                    var prevPerc = ((AADT2013 - AADT2014) / AADT2014 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2015 - AADT2014) / AADT2014 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2014 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2014)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2013)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2015)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2014',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2014),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2015 = document.getElementById("2015").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2015").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2015', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2015/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2015',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2014, AADT2015, AADT2016 } = object;
        
                    var prevPerc = ((AADT2014 - AADT2015) / AADT2015 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2016 - AADT2015) / AADT2015 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2015)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2015', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2015) - (parseFloat(d.Heavy2015)/100) * parseFloat(d.AADT2015))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2015', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2015) * (parseFloat(d.Heavy2015)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2015',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2014, AADT2015, AADT2016 } = object;
          
                      var prevPerc = ((AADT2014 - AADT2015) / AADT2015 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2016 - AADT2015) / AADT2015 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2015)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2015', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2015) - (parseFloat(d.Heavy2015)/100) * parseFloat(d.AADT2014))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2014, AADT2015, AADT2016 } = object;
        
                    var prevPerc = ((AADT2014 - AADT2015) / AADT2015 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2016 - AADT2015) / AADT2015 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2015)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2015', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2015) - (parseFloat(d.Heavy2015)/100) * parseFloat(d.AADT2015))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2015',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2014, AADT2015, AADT2016 } = object;
        
                    var prevPerc = ((AADT2014 - AADT2015) / AADT2015 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2016 - AADT2015) / AADT2015 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2015)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2015',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2014, AADT2015, AADT2016 } = object;
        
                    var prevPerc = ((AADT2014 - AADT2015) / AADT2015 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2016 - AADT2015) / AADT2015 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2015)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2015',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2015),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2016 = document.getElementById("2016").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2016").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2016', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2016/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2016',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2015, AADT2016, AADT2017} = object;
                      console.log("test");
                      console.log("2012:" + AADT2015);
                      console.log(AADT2016);
          
                      var prevPerc = ((AADT2015 - AADT2016) / AADT2016 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2017 - AADT2016) / AADT2016 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2016 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2016)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2015)}  (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2017)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2016', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2016) - (parseFloat(d.Heavy2016)/100) * parseFloat(d.AADT2016))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2016', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2016) * (parseFloat(d.Heavy2016)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2016',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2015, AADT2016, AADT2017} = object;
                      console.log("test");
                      console.log("2012:" + AADT2015);
                      console.log(AADT2016);
          
                      var prevPerc = ((AADT2015 - AADT2016) / AADT2016 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2017 - AADT2016) / AADT2016 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2016 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2016)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2015)}  (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2017)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
              }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2016', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2016) - (parseFloat(d.Heavy2016)/100) * parseFloat(d.AADT2016))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2016',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2015, AADT2016, AADT2017} = object;
                      console.log("test");
                      console.log("2012:" + AADT2015);
                      console.log(AADT2016);
          
                      var prevPerc = ((AADT2015 - AADT2016) / AADT2016 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2017 - AADT2016) / AADT2016 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2016 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2016)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2015)}  (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2017)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2016', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2016) - (parseFloat(d.Heavy2016)/100) * parseFloat(d.AADT2016))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2016',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2015, AADT2016, AADT2017} = object;
                      console.log("test");
                      console.log("2012:" + AADT2015);
                      console.log(AADT2016);
          
                      var prevPerc = ((AADT2015 - AADT2016) / AADT2016 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2017 - AADT2016) / AADT2016 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2016 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2016)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2015)}  (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2017)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2016',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2015, AADT2016, AADT2017} = object;
                    console.log("test");
                    console.log("2012:" + AADT2015);
                    console.log(AADT2016);
        
                    var prevPerc = ((AADT2015 - AADT2016) / AADT2016 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2017 - AADT2016) / AADT2016 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2016 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2016)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2015)}  (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2017)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2016',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2016),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2017 = document.getElementById("2017").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2017").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2017', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2017/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2017',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2016, AADT2017, AADT2018 } = object;
        
                    var prevPerc = ((AADT2016 - AADT2017) / AADT2017 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2018 - AADT2017) / AADT2017 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2017 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2017)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2016)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2018)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2017', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2017) - (parseFloat(d.Heavy2017)/100) * parseFloat(d.AADT2017))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2017', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2017) * (parseFloat(d.Heavy2017)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2017',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2016, AADT2017, AADT2018 } = object;
          
                      var prevPerc = ((AADT2016 - AADT2017) / AADT2017 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2018 - AADT2017) / AADT2017 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2017 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2017)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2016)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2018)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2017', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2017) - (parseFloat(d.Heavy2017)/100) * parseFloat(d.AADT2017))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2017',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2016, AADT2017, AADT2018 } = object;
        
                    var prevPerc = ((AADT2016 - AADT2017) / AADT2017 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2018 - AADT2017) / AADT2017 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2017 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2017)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2016)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2018)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2017', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2017) - (parseFloat(d.Heavy2017)/100) * parseFloat(d.AADT2017))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2017',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2016, AADT2017, AADT2018 } = object;
        
                    var prevPerc = ((AADT2016 - AADT2017) / AADT2017 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2018 - AADT2017) / AADT2017 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2017 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2017)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2016)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2018)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2017',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2016, AADT2017, AADT2018 } = object;
        
                    var prevPerc = ((AADT2016 - AADT2017) / AADT2017 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2018 - AADT2017) / AADT2017 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2017 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2017)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2016)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2018)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2017',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2017),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2018 = document.getElementById("2018").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2018").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2018', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2018/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2018',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2017, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2017 - AADT2018) / AADT2018 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2019 - AADT2018) / AADT2018 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2018 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2018)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2017)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2019)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2018', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2018) - (parseFloat(d.Heavy2018)/100) * parseFloat(d.AADT2018))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2018', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2018) * (parseFloat(d.Heavy2018)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2018',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2017, AADT2018, AADT2019 } = object;
          
                      var prevPerc = ((AADT2017 - AADT2018) / AADT2018 * 100).toFixed(2); //previous AADT
                      var follPerc = ((AADT2019 - AADT2018) / AADT2018 * 100).toFixed(2); //following AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2018 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2018)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2017)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2019)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2018', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2018) - (parseFloat(d.Heavy2018)/100) * parseFloat(d.AADT2018))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2018',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2017, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2017 - AADT2018) / AADT2018 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2019 - AADT2018) / AADT2018 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2018 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2018)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2017)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2019)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2018', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2018) - (parseFloat(d.Heavy2018)/100) * parseFloat(d.AADT2018))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2018',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2017, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2017 - AADT2018) / AADT2018 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2019 - AADT2018) / AADT2018 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2018 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2018)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2017)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2019)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2018',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2017, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2017 - AADT2018) / AADT2018 * 100).toFixed(2); //previous AADT
                    var follPerc = ((AADT2019 - AADT2018) / AADT2018 * 100).toFixed(2); //following AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2018 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2018)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2017)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2019)} (${(follPerc<0?"":"+") + follPerc}%)</p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2018',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2018),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2019 = document.getElementById("2019").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");
    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2019").classList.add("selected");

    allTraffic.addEventListener("click", () => {
      if(allTraffic.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heatmap2019', 
              colorRange: colorRange, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil(d.AADT2019/100),
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 1000,
              coverage: 1,
            }), 

            new ScatterplotLayer({
              id: 'scatter2019',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    vehicles.addEventListener("click", () => {
      if(vehicles.checked == true) {
        deck.setProps({
          layers: [ 
              new HexagonLayer({
                id: '3d-heatmapLight2019', 
                colorRange: colorRangeLight, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2019) - (parseFloat(d.Heavy2019)/100) * parseFloat(d.AADT2019))/100),
                //elevationDomain: d => [0, max(d.AADT2012)],
                elevationScale: 250,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }), 

              new HexagonLayer({
                id: '3d-heatmapHeavy2019', 
                colorRange: colorRangeHeavy, 
                data: data,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getElevationWeight: d => Math.ceil((parseFloat(d.AADT2019) * (parseFloat(d.Heavy2019)/100))/100),
                elevationScale: 100,
                extruded: true,
                pickable: true,
                opacity: 0.8,
                radius: 2000,
                coverage: 0.8,
                pickable: true,
              }),

              new ScatterplotLayer({
                id: 'scatterVehicles2019',
                data: data,
                opacity: 0.5,
                filled: true,
                radiusMinPixels: 4,
                radiusMaxPixels: 4,
                getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
                getFillColor: [151, 230, 165],
                pickable: true,

                onHover: ({object, x, y}) => {
                  const el = document.getElementById('tooltip');
                  if (object) {
                      const { Description, AADT2018, AADT2019 } = object;
          
                      var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
          
                      el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                      <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                      el.style.display = 'block';
                      el.style.opacity = 0.9;
                      el.style.left = x + 'px';
                      el.style.top = y + 'px';
                  } else {
                      el.style.opacity = 0.0;
                  }
                }
              })
            ]
        });
      }
    })

    light.addEventListener("click", () => {
      if(light.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-lightOnly2019', 
              colorRange: colorRangeLight, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2019) - (parseFloat(d.Heavy2019)/100) * parseFloat(d.AADT2019))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 250,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatter2019',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heavy.addEventListener("click", () => {
      if(heavy.checked == true) {
        deck.setProps({
          layers: [
            new HexagonLayer({
              id: '3d-heavyOnly2019', 
              colorRange: colorRangeHeavy, 
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getElevationWeight: d => Math.ceil((parseFloat(d.AADT2019) - (parseFloat(d.Heavy2019)/100) * parseFloat(d.AADT2019))/100),
              //elevationDomain: d => [0, max(d.AADT2012)],
              elevationScale: 100,
              extruded: true,
              pickable: true,
              opacity: 0.8,
              radius: 2000,
              coverage: 0.8,
              pickable: true,
            }), 

            new ScatterplotLayer({
              id: 'scatterHeavy2019',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            })
          ]
        });
      }
    })

    heat.addEventListener("click", () => {
      if(heat.checked == true) {
        deck.setProps({
          layers:[
            new ScatterplotLayer({
              id: 'scatter2019',
              data: data,
              opacity: 0.5,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 4,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getFillColor: [151, 230, 165],
              pickable: true,

              onHover: ({object, x, y}) => {
                const el = document.getElementById('tooltip');
                if (object) {
                    const { Description, AADT2018, AADT2019 } = object;
        
                    var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
        
                    el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                    <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                    el.style.display = 'block';
                    el.style.opacity = 0.9;
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                } else {
                    el.style.opacity = 0.0;
                }
              }
            }),

            new HeatmapLayer({
              id:'heat2019',
              data: data,
              getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
              getWeight: d => parseInt(d.AADT2019),
              radiusPixels: 50,
            }),
          ]
        })
      }
    })
  })

  var button2019 = document.getElementById("2019").addEventListener("click", () => {
    var x = document.getElementsByClassName("button");

    for (let index = 0; index < x.length; index++) {
      const b = x[index];
      b.classList.remove("selected");
    }

    document.getElementById("2019").classList.add("selected");

    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2019', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2019/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        }),

        new ScatterplotLayer({
          id: 'scatter',
          data: data,
          opacity: 0.8,
          filled: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 5,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getFillColor: [151, 230, 165],
          pickable: true,
      
          onHover: ({object, x, y}) => {
              const el = document.getElementById('tooltip');
              if (object) {
                  const { Description, AADT2018, AADT2019 } = object;
      
                  var prevPerc = ((AADT2018 - AADT2019) / AADT2019 * 100).toFixed(2); //previous AADT
      
                  el.innerHTML = `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2019)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2018)} (${(prevPerc<0?"":"+") + prevPerc}%) </p>`;
                  el.style.display = 'block';
                  el.style.opacity = 0.9;
                  el.style.left = x + 'px';
                  el.style.top = y + 'px';
              } else {
                  el.style.opacity = 0.0;
              }
          }
      })
      ],
    });
  })
})

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
