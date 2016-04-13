/// <reference path="QRCode.d.ts"/>
"use strict";
/************************************************************
***************** Interface to FaustWeb *********************
************************************************************/
var ExportLib = (function () {
    function ExportLib() {
    }
    //--- Send asynchronous POST request to FaustWeb to compile a faust DSP
    // @exportUrl : url of FaustWeb service to target
    // @name : name of DSP to compile
    // @source_code : Faust code to compile
    // @callback : function called once request succeeded 
    // 				- @param : the sha key corresponding to source_code
    ExportLib.getSHAKey = function (exportUrl, name, source_code, callback, errCallback) {
        var filename = name + ".dsp";
        var file = new File([source_code], filename);
        var newRequest = new XMLHttpRequest();
        var params = new FormData();
        params.append('file', file);
        var urlToTarget = exportUrl + "/filepost";
        newRequest.open("POST", urlToTarget, true);
        newRequest.onreadystatechange = function () {
            if (newRequest.readyState == 4 && newRequest.status == 200)
                callback(newRequest.responseText);
            else if (newRequest.readyState == 4 && newRequest.status == 400)
                errCallback(newRequest.responseText);
        };
        newRequest.send(params);
    };
    //--- Send asynchronous GET request to precompile target 
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP to precompile
    // @platform/architecture : platform/architecture to precompile
    // @callback : function called once request succeeded 
    // 				- @param : the sha key 
    ExportLib.prototype.sendPrecompileRequest = function (exportUrl, sha, platforme, architecture, appType, callback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            if (getrequest.readyState == 4) {
                callback(exportUrl, sha, platforme, architecture, appType);
            }
        };
        var compileUrl = exportUrl + "/" + sha + "/" + platforme + "/" + architecture + "/precompile";
        getrequest.open("GET", compileUrl, true);
        getrequest.send(null);
    };
    //--- Transform target 
    // WARNING = THIS FUNCTION REQUIRES QRCODE.JS TO BE INCLUDED IN YOUR HTML FILE
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP
    // @platform/architecture/target : platform/architecture/target compiled
    // @cote : width and height of the returned QrCode
    ExportLib.getQrCode = function (url, sha, plateform, architecture, target, size) {
        var downloadString = url + "/" + sha + "/" + plateform + "/" + architecture + "/" + target;
        var whiteContainer = document.createElement('div');
        whiteContainer.style.cssText = "width:" + size.toString() + "px; height:" + size.toString() + "px; background-color:white; position:relative; margin-left:auto; margin-right:auto; padding:3px;";
        var qqDiv = document.createElement('qrcode');
        var qq = new QRCode(qqDiv, {
            text: downloadString,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        whiteContainer.appendChild(qqDiv);
        return whiteContainer;
    };
    // Return the array of available platforms from the json description
    ExportLib.prototype.getPlatforms = function (json) {
        var platforms = [];
        var data = JSON.parse(json);
        var index = 0;
        for (var p in data) {
            platforms[index] = p;
            index++;
        }
        return platforms;
    };
    // Return the list of available architectures for a specific platform from the json description
    ExportLib.prototype.getArchitectures = function (json, platform) {
        var architectures = [];
        var data = JSON.parse(json);
        return data[platform];
    };
    return ExportLib;
}());
//# sourceMappingURL=ExportLib.js.map