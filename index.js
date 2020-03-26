const total = {
  suspects: cities.reduce((prev, next) => {
    const newQuantity = next.suspects ? next.suspects : 0;
    return prev + newQuantity;
  }, 0),
  confirmed: cities.reduce((prev, next) => {
    const newQuantity = next.confirmed ? next.confirmed : 0;
    return prev + newQuantity;
  }, 0),
  deaths: cities.reduce((prev, next) => {
    const newQuantity = next.deaths ? next.deaths : 0;
    return prev + newQuantity;
  }, 0),
};

const getRadius = (quantity = 0, total = 0, maxSize = 0, minSize = null) => {
  minSize = minSize ? minSize : maxSize / 10;
  const result = (quantity * maxSize) / total;

  if (result === 0) {
    return 0;
  }

  if (result < minSize) {
    const increment = result / minSize;
    return minSize + ((minSize * increment) * 5);
  }

  if (Number.isNaN(result)) {
    return 0;
  }

  return result;
}

mapboxgl.accessToken = "pk.eyJ1Ijoiam9zZWZyZWl0dGFzIiwiYSI6ImNpcm1reHI4czAwY3FmZm02NHR3Z2N4YnEifQ.UQ9qtqcgob5PjZONlhK-zA";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/josefreittas/ck840k34g2skg1io71k2t5hkw",
  center: [-36.680672, -9.574678],
  maxZoom: 10,
  minZoom: 7,
  zoom: 8,
});

map.on("load", function () {
  map.addSource("points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: cities.map((city, index) => {

        const radius = {
          suspects: getRadius(city.suspects, total.suspects, 100),
          confirmed: getRadius(city.confirmed, total.confirmed, 50),
          deaths: getRadius(city.deaths, total.deaths, 25),
        };

        const sortedRadius = [radius.suspects, radius.confirmed, radius.deaths].sort((a, b) => a - b);

        console.log(total.suspects);

        return {
          id: index + 1,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: city.coordinates.reverse(),
          },
          properties: {
            title: city.name,
            orgRadius: radius.suspects,
            redRadius: radius.confirmed,
            blkRadius: radius.deaths,
            biggerRadius: sortedRadius[sortedRadius.length - 1],
            suspects: city.suspects,
            confirmed: city.confirmed,
            deaths: city.deaths,
          }
        };
      })
    }
  });

  map.addLayer({
    id: "suspects",
    source: "points",
    type: "circle",
    paint: {
      "circle-radius": ["get", "orgRadius"],
      "circle-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgb(250, 225, 175)",
        "rgba(250, 225, 175, 0.75)",
      ],
      "circle-stroke-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgb(200, 150, 75)",
        "rgba(200, 150, 75, 0.6)",
      ],
      "circle-stroke-width": 1,
    },
  });

  map.addLayer({
    id: "confirmed",
    source: "points",
    type: "circle",
    paint: {
      "circle-radius": ["get", "redRadius"],
      "circle-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgb(250, 175, 175)",
        "rgba(250, 175, 175, 0.5)",
      ],
      "circle-stroke-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgb(200, 125, 125)",
        "rgba(200, 125, 125, 0.5)",
      ],
      "circle-stroke-width": 1,
    },
  });

  map.addLayer({
    id: "death",
    source: "points",
    type: "circle",
    paint: {
      "circle-radius": ["get", "blkRadius"],
      "circle-color": "rgba(150, 150, 150, 0.6)",
      "circle-stroke-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgb(110, 110, 110)",
        "rgba(110, 110, 110, 0.6)",
      ],
      "circle-stroke-width": 1,
    },
  });

  map.addLayer({
    id: "hover-interact",
    source: "points",
    type: "circle",
    paint: {
      "circle-radius": ["get", "biggerRadius"],
      "circle-color": "rgba(250, 225, 175, 0)",
      "circle-stroke-color": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        "rgba(200, 150, 100, 1)",
        "rgba(0, 0, 0, 0)",
      ],
      "circle-stroke-width": [
        "case",
        [
          "boolean",
          ["feature-state", "hover"],
          false,
        ],
        5,
        0,
      ],
    },
  });

});

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

let pointId;

map.on("mousemove", "hover-interact", (event) => {

  map.getCanvas().style.cursor = "pointer";

  var coordinates = event.features[0].geometry.coordinates.slice();
  var description = `
    <h1>${event.features[0].properties.title}</h1>
    <div class="counter suspects">
      <div>Suspeitos:</div>
      <div>~${event.features[0].properties.suspects}</div>
    </div>
    <div class="counter confirmed">
      <div>Confirmados:</div>
      <div>${event.features[0].properties.confirmed}</div>
    </div>
    <div class="counter deaths">
      <div>Mortes:</div>
      <div>${event.features[0].properties.deaths}</div>
    </div>
  `;

  while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Populate the popup and set its coordinates
  // based on the feature found.
  popup
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);

  if (event.features.length > 0) {
    if (pointId) {
      map.removeFeatureState({
        source: "points",
        id: pointId
      });
    }

    pointId = event.features[0].id;

    map.setFeatureState(
      {
        source: "points",
        id: pointId,
      },
      {
        hover: true
      }
    );

  }
});

map.on("mouseleave", "hover-interact", function () {
  if (pointId) {
    map.setFeatureState(
      {
        source: "points",
        id: pointId
      },
      {
        hover: false
      }
    );
  }

  pointId = null;

  popup.remove();
  map.getCanvas().style.cursor = "";
});