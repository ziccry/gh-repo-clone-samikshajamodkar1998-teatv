/*
This unit test get most popular movie/tv from themoviedb, use them as sample data
*/
const libs            = require("../../libs/index.node");
const expect          = require('chai').expect;
const colors          = require('colors');
const exampleAddons   = require("../../addons_example/useExampleAddons");
const { providers }   = exampleAddons;
const movieData       = require("./movieSample.json");
const tvData          = require("./tvSample.json");


const expectTest = {
  isUrl: string => {
    const regUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    expect(string).to.match(regUrl);
  },
  isNotEmptyArray: array => {
    expect(array)//.to.not.be.empty;
    .to.be.an('array').that.is.not.empty;
  },
  hasCommonError: err => {
    let stringErr = String(err);
    let condition = stringErr == "undefined" || stringErr.includes("NOT_FOUND");
    if(condition === false) {
      // console.log(err);
      console.log(colors.red("        "+stringErr));
    }
    expect(condition).to.be.true;
  }
}

function uniTestOneProvider(providerName, func, movieInfo) {
  try {
    it(providerName, async () => {
      let data, err;
      try {
        data = await func(libs, movieInfo, { platform: "nodejs" });
        expectTest.isNotEmptyArray(data);
      } catch (err) {
        err = err;
        expectTest.hasCommonError(err);
      }
    })
  } catch(err) {
    console.log(err);
  }
  
};

const startTest = () => {
  // const data = movieData[0];
  for (let i = 0; i < movieData.length; i++) {
    describe("Testing movie: "+ movieData[i].title+"...", () => {
      for(let provider in providers) {
        uniTestOneProvider(provider, providers[provider].function, movieData[i]);
      }
    });
  }
  for (let i = 0; i < tvData.length; i++) {
    describe("Testing tv: "+ tvData[i].title+"...", () => {
      for(let provider in providers) {
        uniTestOneProvider(provider, providers[provider].function, tvData[i]);
      }
    });
  }
}

startTest();


/*
describe('Testing movies..', function() {
  // movieData.forEach(function(val) {
  //   console.log(val);
  //   describe("Test movie: "+ val.title, function() {
  //     for(let provider in providers) {
  //       uniTestOneProvider(provider, providers[provider].function, val);
  //     }
  //   })
  // });
  let movieData = [];
  beforeEach(function(done) {
    getPopularMovie().then(data => {
      movieData = data;
      console.log(movieData);
      done();
    });
  });

  afterEach(function() {
    describe("Test movie: " + movieData[0].title, function() {
      for(let provider in providers) {
        uniTestOneProvider(provider, providers[provider].function, movieData[0]);
      }
    })
  });
});
*/
