const storage = require("electron-json-storage");

const getWindowSize = () =>
new Promise((resolve, reject) => {
  storage.get("window_size", function(error, data) {
    if (error) throw error;
    if (Object.keys(data).length === 0)
      return resolve({
        width: 1006,
        height: 711
      });
    resolve(data);
  });
});

const getWindowPosition = () =>
new Promise((resolve, reject) => {
  storage.get("window_position", function(error, data) {
    if (error) throw error;
    if (Object.keys(data).length === 0)
      return resolve({
        x: undefined,
        y: undefined
      });
    resolve({ x: data[0], y: data[1] });
  });
});

const getSizeAndPosition = async () => {
let size = await getWindowSize();
let position = await getWindowPosition();
var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

return _extends({}, size, position);
};

module.exports = {
    getWindowSize,
    getWindowPosition,
    getSizeAndPosition
}