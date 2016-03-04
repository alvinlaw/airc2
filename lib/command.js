var childProcess = require('child_process');
var airSdk = require('node-air-sdk');
var fs = require("fs");
var del = require('del');
var unzip = require("unzip");
var xml2js = require('xml2js');

var checkFileExist = function checkFileExist(path) {
    try {
        fs.statSync(path);
    } catch (err) {
        if (err.code == 'ENOENT') return false;
    }
    return true;
}

var configData = {};
if (checkFileExist(process.cwd() + '/config.json')) {
    var _conf = fs.readFileSync(process.cwd() + '/config.json', "utf8");
    configData = JSON.parse(_conf);
}

exports.build = function build() {
    var parser = new xml2js.Parser();
    var xml = fs.readFileSync(process.cwd() + "/" + configData.xml, "utf8");
    parser.parseString(xml, function(err, result) {
        var xmlData = result;

        var cmd = airSdk.bin.mxmlc;
        var args = [];
        args.push("-load-config", 'air-config.xml');
        args.push("-output", process.cwd() + "/" + configData["bin-path"] + "/" + xmlData.application.initialWindow[0].content[0]);
        args.push(configData.src);

        var _command = childProcess.execFile(cmd, args, {
            cwd: process.cwd()
        });

        _command.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        _command.stderr.on('data', function(data) {
            process.stdout.write(data);
        });

        _command.on('exit', function(code) {
            console.log('adl process exited with code ' + code);
        });
    });
};

exports.run = function run(screenSize) {
    del.sync([process.cwd() + '/tmp']);
    fs.mkdirSync(process.cwd() + '/tmp');
    fs.mkdirSync(process.cwd() + '/tmp/ane');

    var files = fs.readdirSync(process.cwd() + "/" + configData["ane-path"]);
    for (var i = 0, len = files.length; i < len; i++) {
        if (!files[i].match("^\\.")) {
            if ((/\.(ane)$/i).test(files[i])) {
                fs.createReadStream(process.cwd() + "/ane/" + files[i]).pipe(unzip.Extract({
                    path: process.cwd() + '/tmp/ane/' + files[i]
                }));
            }
        }
    }

    var cmd = airSdk.bin.adl;
    var args = [];
    args.push("-profile", 'mobileDevice');
    args.push("-screensize", screenSize);
    args.push("-extdir", process.cwd() + "/tmp/ane");
    args.push(process.cwd() + "/" + configData.xml);
    args.push(process.cwd() + "/" + configData["bin-path"]);

    var _command = childProcess.execFile(cmd, args, {
        cwd: process.cwd()
    });

    _command.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    _command.stderr.on('data', function(data) {
        process.stdout.write(data);
    });

    _command.on('exit', function(code) {
        console.log('adl process exited with code ' + code);
    });
};

exports.package = function package(platform, build) {

    var parser = new xml2js.Parser();
    var xml = fs.readFileSync(process.cwd() + "/" + configData.xml, "utf8");
    parser.parseString(xml, function(err, result) {
        var xmlData = result;

        del.sync([process.cwd() + '/dist']);
        fs.mkdirSync(process.cwd() + '/dist');

        var target;
        var ext;
        switch (platform) {
            case "ios":
                if (build == "debug") {
                    target = "ipa-debug";
                } else {
                    target = "ipa-app-store";
                }
                ext = "ipa";
                break;
            case "android":
                if (build == "debug") {
                    target = "apk-debug";
                } else {
                    target = "apk-captive-runtime";
                }
                ext = "apk";
                break;
        }

        var cmd = airSdk.bin.adt;
        var args = [];
        args.push("-package", "-target", target);
        args.push("-storetype", "pkcs12");

        var signing = configData[platform];
        args.push("-keystore", process.cwd() + "/" + signing.keystore);
        args.push("-storepass", signing.keypass);
        if (platform == "ios") {
            args.push("-provisioning-profile", process.cwd() + "/" + signing["provisioning-profile"]);
        }
        args.push(process.cwd() + '/dist/' + xmlData.application.name + "-" + xmlData.application.versionNumber + "-" + build + "." + ext);
        args.push(process.cwd() + "/" + configData.xml);
        args.push("-C", process.cwd() + "/" + configData["bin-path"], xmlData.application.initialWindow[0].content[0]);
        args.push("-C", process.cwd() + "/" + configData["res-path"], "");
        args.push("-extdir", process.cwd() + "/" + configData["ane-path"]);

        var _command = childProcess.execFile(cmd, args, {
            cwd: process.cwd()
        });

        _command.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        _command.stderr.on('data', function(data) {
            process.stdout.write(data);
        });

        _command.on('exit', function(code) {
            console.log('adl process exited with code ' + code);
        });

    });

}
