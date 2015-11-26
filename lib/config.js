var fs = require("fs");
var airSdk = require('node-air-sdk');
var builder = require('xmlbuilder');
var airConfigData;

exports.init = function init() {
  var _data = fs.readFileSync(__dirname + '/../json/default-config.json', "utf8");
  fs.writeFileSync(process.cwd() + '/config.json', _data);
}

exports.initBuild = function initCompile() {
  var _conf = fs.readFileSync(process.cwd() + '/config.json', "utf8");
  var configData = JSON.parse(_conf);

  var _airConf = fs.readFileSync(__dirname + '/../json/default-air-config.json', "utf8");
  airConfigData = JSON.parse(_airConf);

  airConfigData["flex-config"].compiler[0]["external-library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/air/airglobal.swc");
  airConfigData["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/asc-support.swc");
  airConfigData["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/core.swc");
  airConfigData["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/air/servicemonitor.swc");

  addLibrary(configData.ane, "external-library-path");
  addLibrary(configData.libs, "library-path");

  var xml = builder.create(airConfigData, {headless:true});

  fs.writeFileSync(process.cwd() + '/air-config.json', xml.end({ pretty: true}));

}

var addLibrary = function addLibrary(dir, library) {
  try {
    var files = fs.readdirSync(process.cwd() + "/" + dir);
    for (var i = 0, len = files.length; i < len; i++) {
      airConfigData["flex-config"].compiler[0][library][0]["path-element"].push(process.cwd()+"/"+dir+"/"+files[i]);
  	}
  } catch (e) {
    console.log("Read library path error.");
  }
}
