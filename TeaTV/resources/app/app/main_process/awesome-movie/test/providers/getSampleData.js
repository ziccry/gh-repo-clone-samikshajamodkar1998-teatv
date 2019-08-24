const libs            = require("../../libs/index.node");
const { httpRequest } = libs;
const fs              = require('fs');

const getPopularMovie = async () => {
  const URL = "https://api.themoviedb.org/3/movie/popular?api_key=07824c019b81ecf7ad094a66f6410cc9&language=en-US&page=1";
  let json  = await httpRequest.getJSON(URL);
  return json.results.map(val => ({
    type  : "movie",
    title : val.title,
    year  : +val.release_date.substring(0, 4)
  }));
}

const getPopularTV    = async () => {
  const URL = "https://api.themoviedb.org/3/tv/popular?api_key=07824c019b81ecf7ad094a66f6410cc9&language=en-US&page=1";
  let json  = await httpRequest.getJSON(URL);
  return json.results.map(val => ({
    type    : "tv",
    title   : val.name,
    season  : 1,
    episode : 1,
    year    : +val.first_air_date.substring(0, 4)
  }));
}

const start = async () => {
  let movie = await getPopularMovie();
  let tv    = await getPopularTV();
  // fs.writeFileSync("movieSample.json", JSON.stringify(movie, undefined, 4))
  fs.writeFileSync("tvSample.json", JSON.stringify(tv, undefined, 4))
  process.exit(0);
}

start();