const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
  filename: "main.css"
  // disable: process.env.NODE_ENV === "development"
});

const C = {
  MAIN_SCSS: {
    INPUT: "./dev/styles/main.scss",
    OUTPUT: path.join(__dirname, "./app/renderer_process/css"),
    FILENAME: "main.css"
  },
  MAIN_JS: {
    INPUT: "./dev/src/app.js",
    OUTPUT: path.join(__dirname, "./app/renderer_process/js"),
    FILENAME: "main.js"
  },
  PLATFORM_JS: {
    INPUT: "./dev/platform/electron/index",
    OUTPUT: path.join(__dirname, "./app/renderer_process/js"),
    FILENAME: "platform.js"
  },
  WORKER_JS: {
    INPUT: "./dev/worker/getlink",
    OUTPUT: path.join(__dirname, "./app/renderer_process/js"),
    FILENAME: "getlink.js"
  }
}

let mainCSS = {
  entry: C.MAIN_SCSS.INPUT,
  output: {
    path: C.MAIN_SCSS.OUTPUT,
    filename: C.MAIN_SCSS.FILENAME
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{ loader: "css-loader" }, { loader: "sass-loader" }],
          // use style-loader in development
          fallback: "style-loader"
        })
      }
    ]
  },
  plugins: [extractSass]
};

let mainJS = {
  entry: C.MAIN_JS.INPUT,
  output: {
    path: C.MAIN_JS.OUTPUT,
    filename: C.MAIN_JS.FILENAME
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        query: {
          presets: ["stage-2", "es2017", "react"]
        }
      }
    ]
  }
};

let platformJS = {
  entry: C.PLATFORM_JS.INPUT,
  target: "electron",
  output: {
    path: C.PLATFORM_JS.OUTPUT,
    filename: C.PLATFORM_JS.FILENAME
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        query: {
          presets: ["stage-2", "es2017", "react"]
        }
      }
    ]
  }
};

let workerJS = {
  entry: C.WORKER_JS.INPUT,
  target: "electron",
  output: {
    path: C.WORKER_JS.OUTPUT,
    filename: C.WORKER_JS.FILENAME
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        query: {
          presets: ["stage-2", "es2017", "react"]
        }
      }
    ]
  }
};

module.exports = [mainCSS, mainJS, workerJS, platformJS];