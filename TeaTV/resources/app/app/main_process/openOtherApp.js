const { exec } = require('child_process');
module.exports = (command, callback) => {
  exec(command, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return console.log(err);
    }
    typeof callback === "function" && callback(stdout, stderr);
  });
}