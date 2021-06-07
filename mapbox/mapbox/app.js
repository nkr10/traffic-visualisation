import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWpsMjQiLCJhIjoiY2twam15eTIyMDRnMjJ2cGJpcDMydW5maCJ9.IO0Yzvqazsbc86dlBv4B4g';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const data = '2012-2019.json';

const INITIAL_VIEW_STATE = {
  longitude: 174.8860,
  latitude: -40.9006,
  zoom: 6,
  minZoom: 3,
  maxZoom: 20,
  pitch: 150,
  bearing: -50
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';

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
  //getTooltip: ({object}) => object && {
      
      //html: `<p> <b>Year:</b> 2019 <br> <b>Location:</b> ${parseFloat(object.AADT2019)}`,

    //html: `<h2>${object.AADT2019}</h2><div>${object.AADT2019}</div>`,
      //style: {
      //backgroundColor: '#ffffff',
      //fontSize: '0.8em'
    //}
 // },

  layers: [
    new HexagonLayer({
      id: '3d-heatmap', 
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
      controller: true,
      onHover: ({object, x, y}) => {
        //console.log("testing:" + object.Description, object.AADT2019, object.AADT2018);
        const el = document.getElementById('tooltip');
        if (object) {
           
        }
    }
      //getTooltip: ({object}) => object && {
        //const el = document.getElementById('tooltip');
        //if (object) {
          //const { Description, AADT2014, AADT2015, AADT2016 } = object;

        //var prevPerc = ((object.AADT2014 - object.AADT2015) / object.AADT2015 * 100).toFixed(2); //previous AADT
        //var follPerc = ((object.AADT2016 - object.AADT2015) / object.AADT2015 * 100).toFixed(2); //following AADT
        
        /*html: `<p> <b>Year:</b> 2015 <br> <b>Location:</b> ${object.Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(object.AADT2015)} 
          <br> <br> <b>Previous AADT: </b> ${numberWithCommas(objectAADT2014)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(object.AADT2016)} (${(follPerc<0?"":"+") + follPerc}%) </p>`
        style: {
          display: 'block';
          opacity: '0.9';
        }*/
      //}
    })
  ]
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.dragPan.enable();
//map.touchPitch.enable();

map.on('load', () => {
  map.addLayer(new MapboxLayer({id:'3d-heatmap', deck}));

  var button2012 = document.getElementById("2012").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2012', 
          colorRange, 
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
                  const { Description, AADT2012, AADT2013, AADT2014 } = object;
                  
                  var prevPerc = ((AADT2012 - AADT2013) / AADT2013 * 100).toFixed(2); //previous AADT
                  var follPerc = ((AADT2014 - AADT2013) / AADT2013 * 100).toFixed(2); //following AADT
                  
                  el.innerHTML = `<p> <b>Year:</b> 2013 <br> <b>Location:</b> ${Description} <br> <b>Annual avg daily traffic (AADT): </b> ${numberWithCommas(AADT2013)} 
                  <br> <br> <b>Previous AADT: </b> ${numberWithCommas(AADT2012)} (${(prevPerc<0?"":"+") + prevPerc}%) <br> <b>Following AADT:</b> ${numberWithCommas(AADT2014)} (${(follPerc<0?"":"+") + follPerc}%) </p>`;
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

  var button2013 = document.getElementById("2013").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2013', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2013/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2014 = document.getElementById("2014").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2014', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2014/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2015 = document.getElementById("2015").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2015', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2015/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2016 = document.getElementById("2016").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2016', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2016/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2017 = document.getElementById("2017").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2017', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2017/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2018 = document.getElementById("2018").addEventListener("click", () => {
    deck.setProps({
      layers: [
        new HexagonLayer({
          id: '3d-heatmap2018', 
          colorRange, 
          data: data,
          getPosition: d => [parseFloat(d.Longitude), parseFloat(d.Latitude)],
          getElevationWeight: d => Math.ceil(d.AADT2018/100),
          elevationScale: 250,
          extruded: true,
          pickable: true,
          opacity: 0.8,
          radius: 1000,
          coverage: 1,
        })
      ],
    });
  })

  var button2019 = document.getElementById("2019").addEventListener("click", () => {
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
        })
      ],
    });
  })
})

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
