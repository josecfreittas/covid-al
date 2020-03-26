import { loadMap } from './lib/map.js';

loadMap({
  token: "pk.eyJ1Ijoiam9zZWZyZWl0dGFzIiwiYSI6ImNpcm1reHI4czAwY3FmZm02NHR3Z2N4YnEifQ.UQ9qtqcgob5PjZONlhK-zA",
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