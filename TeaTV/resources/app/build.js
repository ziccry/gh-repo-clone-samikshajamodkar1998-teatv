const packager = require('electron-packager');
const path = require('path');
const fse = require('fs-extra');
const { spawn } = require('child_process');

const platform = process.argv[2];
const arch = process.argv[3];
const appVersion = process.argv[4];

let options = {
  dir: __dirname,
  out: path.join(__dirname, './build/outputs'),
  name: "TeaTV",
  overwrite: true,
  packageManager: "yarn",
  platform: platform,
  arch: arch,
  icon: platform == "darwin" ? path.join(__dirname, './build/icon/icon.icns') : path.join(__dirname, './build/icon/icon.ico'),
  appCopyright: "TEATV.NET",
  appVersion: appVersion
}

if (platform == "darwin") {
  console.log('add codesign options');
  let iosOptions = {
    appBundleId: "com.tea.tv",
    appCategoryType: "public.app-category.entertainment",
    identity: "Mac Developer: Yen Dang (R7B5E4SF9M)",
    type: "development"
  }
  options = Object.assign(options, iosOptions);
  console.log(options);
}

getJSPath = (appPath, options) => {
  console.log(options.platform);
  switch (options.platform) {
    case "darwin": return path.join(appPath, `./${options.name}.app/Contents/Resources/app/`);
  }
}

const removeFolderNodeModules = (appPath) => {
  fse.removeSync(path.join(appPath, './node_modules'));
}

const startBuild = async () => {
  const pathArr = await packager(options);
  const appPath = pathArr[0];
  console.log(`App built at: ${appPath}`);
  const jsPath = getJSPath(appPath, options);
  console.log(jsPath);
  removeFolderNodeModules(jsPath);
};

(async () => {
  await startBuild();
  process.exit(0);
})();
