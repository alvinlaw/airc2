var builder = require('xmlbuilder');
var fs = require('fs');
var airSdk = require('node-air-sdk');

var config;

fs.readFile(__dirname + '/lib/default-config.json', function(err, data) {
  config = JSON.parse(data);

  config["flex-config"].compiler[0]["external-library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/air/airglobal.swc");
  config["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/asc-support.swc");
  config["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/core.swc");
  config["flex-config"].compiler[0]["library-path"][0]["path-element"].push(airSdk.AIR_HOME+"/frameworks/libs/air/servicemonitor.swc");

  /*
  var files = fs.readdirSync(__dirname + "/ane");
  for (var i = 0, len = files.length; i < len; i++) {
    config["flex-config"].compiler[0]["external-library-path"][0]["path-element"].push(__dirname+"/ane/"+files[i]);
	}

  var files = fs.readdirSync(__dirname + "/libs");
  for (var i = 0, len = files.length; i < len; i++) {
    config["flex-config"].compiler[0]["library-path"][0]["path-element"].push(__dirname+"/libs/"+files[i]);
	}
  */

  addLibrary("ane", "external-library-path");
  addLibrary("libs", "library-path");

  var xml = builder.create(config, {headless:true});

  console.log(xml.end({ pretty: true}));

});

var addLibrary = function addLibrary(dir, library) {
  try {
    var files = fs.readdirSync(__dirname + "/" + dir);
    for (var i = 0, len = files.length; i < len; i++) {
      config["flex-config"].compiler[0][library][0]["path-element"].push(__dirname+"/"+dir+"/"+files[i]);
  	}
  } catch (e) {
    console.log("Read library path error.");
  }
}
