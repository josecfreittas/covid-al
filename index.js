import { loadMap } from "./lib/map.js";
import mapboxToken from "./mapboxToken.js";

const start = async () => {

  const data = await fetch('./data.json?query=5').then(data => data.json());

  loadMap({
    token: mapboxToken,
    style: "mapbox://styles/josefreittas/ck840k34g2skg1io71k2t5hkw",
    center: data.center,
    data: data.cities,
  });

  const infoEl = document.getElementById("info").innerHTML = `
    <a href="https://github.com/josecfreittas/covid-al">Source code ♥</a>
    <span> | </span>
    <span>Atualizado em ${data.lastUpdate}</span>
    <span> | </span>
    <span>Fontes: </span>
    ${data.sources.map((source) => ` <a target="_blank" href="${source.url}">${source.title}</a>`)}
  `;
};

start();
