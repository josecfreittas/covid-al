import { getRadius, getTotals } from "./utils.js";


export const loadMap = ({ token, data, style, center }) => {

  const totals = getTotals(data);
  const normalizedData = data.map((item) => {
    return {
      ...item,
      suspects: item.suspects ? item.suspects : 0,
      confirmed: item.confirmed ? item.confirmed : 0,
      deaths: item.deaths ? item.deaths : 0,
    };
  })

  mapboxgl.accessToken = token;
  var map = new mapboxgl.Map({
    style,
    center,
    container: "map",
    maxZoom: 10,
    minZoom: 7,
    zoom: 8,
  });

  map.on("load", function () {
    map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: normalizedData.map((city, index) => {
          return {
            id: index + 1,
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: city.coordinates.reverse(),
            },
            properties: {
              title: city.name,
              deaths: city.deaths,
              suspects: city.suspects,
              confirmed: city.confirmed,
              deathsRadius: getRadius(city.deaths, totals.deaths, 30, normalizedData.length),
              suspectsRadius: getRadius(city.suspects, totals.suspects, 75, normalizedData.length),
              confirmedRadius: getRadius(city.confirmed, totals.confirmed, 50, normalizedData.length),
              get biggerRadius() {
                const radius = [this.suspectsRadius, this.confirmedRadius, this.deathsRadius];
                const sortedRadius = radius.sort((a, b) => a - b)
                return sortedRadius[sortedRadius.length - 1];
              },
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
        "circle-radius": ["get", "suspectsRadius"],
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
        "circle-radius": ["get", "confirmedRadius"],
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
        "circle-radius": ["get", "deathsRadius"],
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

    popup.setLngLat(coordinates).setHTML(description).addTo(map);

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
};
