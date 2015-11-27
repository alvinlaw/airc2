var childProcess = require('child_process');
var airSdk = require('node-air-sdk');
var fs = require("fs");
var del = require('del');
var unzip = require("unzip");

var _conf = fs.readFileSync(process.cwd() + '/config.json', "utf8");
var configData = JSON.parse(_conf);

exports.build = function build() {
  var cmd = airSdk.bin.mxmlc;
  var args = [];
  args.push("-load-config", 'air-config.xml');
  args.push("-output", configData.swf);
  args.push(configData.src);

  childProcess.execFile(cmd, args, { cwd: process.cwd()}, function(error, stdout, stderr){
    if (error) {
      process.stdout.write(stderr);
    } else {
      process.stdout.write(stdout);
    }
  });
};

exports.run = function run(screenSize) {
  del.sync([process.cwd()+'/tmp']);

  var files = fs.readdirSync(process.cwd() + "/" + configData["ane-path"]);
	for (var i = 0, len = files.length; i < len; i++) {
		fs.createReadStream(process.cwd() + "/ane/" + files[i]).pipe(unzip.Extract({ path: process.cwd() + '/tmp/ane/' + files[i] }));
	}

  var cmd = airSdk.bin.adl;
  var args = [];
  args.push("-profile", 'mobileDevice');
  args.push("-screensize", screenSize);
  args.push("-extdir", process.cwd() + "/tmp/ane");
  args.push(process.cwd() + "/" + configData.xml);
  args.push(process.cwd() + "/" + configData["bin-path"]);

  _command = childProcess.execFile(cmd, args, { cwd: process.cwd()});

  _command.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  _command.stderr.on('data', function (data) {
    process.stdout.write(data);
  });

  _command.on('exit', function (code) {
    console.log('adl process exited with code ' + code);
  });

  // childProcess.execFile(cmd, args, { cwd: process.cwd()}, function(error, stdout, stderr){
  //   if (error) {
  //     console.log(stderr);
  //   } else {
  //     console.log(stdout);
  //   }
  // });
};
