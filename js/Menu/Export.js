/*				EXPORT.JS
   Handles Graphical elements for the Export Feature of the normal Playground
       
   DEPENDENCIES :
       - ExportLib.js
       - qrcode.js
*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../Main.ts"/>
/// <reference path="../Messages.ts"/>
"use strict";
/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/
var Export = (function () {
    function Export() {
        var _this = this;
        //------ Update Architectures with Plateform change
        this.updateArchitectures = function () {
            if (!_this.clearComboBox('architectures')) {
                return;
            }
            else {
                var data = JSON.parse(App.jsonText);
                var platformsSelect = document.getElementById('platforms'); //get the combobox
                var options = platformsSelect.options[platformsSelect.selectedIndex];
                var selPlatform = options.value;
                var dataCopy = data[selPlatform];
                var iterator = 0;
                for (var subData in dataCopy) {
                    if (iterator < dataCopy.length) {
                        var mainData = dataCopy[subData];
                        _this.addItem('architectures', mainData);
                        iterator = iterator + 1;
                    }
                }
            }
        };
        this.uploadTargets = function () {
            _this.clearComboBox('platforms');
            _this.clearComboBox('architectures');
            var input = document.getElementById("faustweburl");
            Export.targetsUrl = input.value + "/targets";
            App.getXHR(Export.targetsUrl, function (json) { _this.uploadTargetCallback(json); }, function (errorMessage) { ErrorFaust.errorCallBack(errorMessage); });
            //ExportLib.getTargets(App.exportURL, (json: string) => { this.uploadTargetCallback },  (json: string)=> {alert('Impossible to get FaustWeb targets')});
        };
        /********************************************************************
        **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
        ********************************************************************/
        this.exportFaustCode = function (shaKey) {
            var platformsSelect = document.getElementById("platforms"); //get the combobox
            var optionPlateform = platformsSelect.options[platformsSelect.selectedIndex];
            var platforme = optionPlateform.value;
            var architecturesSelect = document.getElementById("architectures"); //get the combobox
            var optionArchi = platformsSelect.options[platformsSelect.selectedIndex];
            var architecture = optionArchi.value;
            var serverUrl = document.getElementById("faustweburl").value;
            var appType = "binary.zip";
            if (architecture == "android")
                appType = "binary.apk";
            var exportLib = new ExportLib();
            exportLib.sendPrecompileRequest("http://faustservice.grame.fr", shaKey, platforme, architecture, appType, function (serverUrl, shaKey, plateforme, architecture, appType) { _this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType); });
            // 	Delete existing content if existing
        };
        this.setDownloadOptions = function (serverUrl, shaKey, plateforme, architecture, appType) {
            if (shaKey.indexOf("ERROR") == -1) {
                var disposableExportDiv = document.createElement("div");
                disposableExportDiv.id = "disposableExportDiv";
                var qrDiv = document.createElement('div');
                qrDiv.id = "qrcodeDiv";
                var myWhiteDiv = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
                qrDiv.appendChild(myWhiteDiv);
                var downloadBottomButtonContainer = document.createElement("div");
                downloadBottomButtonContainer.className = "bottomButtonContainer";
                var linkDownload = document.createElement('button');
                linkDownload.value = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
                linkDownload.id = "linkDownload";
                linkDownload.className = "button";
                linkDownload.textContent = App.messageRessource.buttonDownloadApp;
                downloadBottomButtonContainer.appendChild(linkDownload);
                _this.exportView.downloadButton = linkDownload;
                _this.exportView.downloadButton.onclick = function () { window.location.href = _this.exportView.downloadButton.value; };
                document.getElementById("exportResultContainer").appendChild(disposableExportDiv);
                disposableExportDiv.appendChild(qrDiv);
                disposableExportDiv.appendChild(downloadBottomButtonContainer);
                _this.exportView.exportButton.addEventListener("click", _this.eventExport);
                _this.exportView.exportButton.style.opacity = "1";
                App.removeLoadingLogo("exportResultContainer");
            }
            else {
                new Message(shaKey);
            }
            _this.exportView.exportButton.addEventListener("click", _this.eventExport);
            _this.exportView.exportButton.style.opacity = "1";
            App.removeLoadingLogo("exportResultContainer");
        };
    }
    //------ Handle Combo Boxes
    Export.prototype.setEventListeners = function () {
        var _this = this;
        this.exportView.refreshButton.onclick = function () { _this.uploadTargets(); };
        this.exportView.selectPlatform.onchange = function () { _this.updateArchitectures(); };
        this.exportView.inputServerUrl.onkeypress = function (e) { if (e.which == 13) {
            _this.uploadTargets();
        } };
        this.eventExport = function (event) { _this.exportPatch(event, _this); };
        this.exportView.exportButton.addEventListener("click", this.eventExport);
        this.exportView.buttonNameApp.onclick = function () { _this.renameScene(); };
        this.exportView.inputNameApp.onkeypress = function (e) { if (e.which == 13) {
            _this.renameScene();
        } };
        this.exportView.moreOptionDiv.addEventListener("click", function () { _this.exportView.moreOptionDiv.style.display = "none"; _this.exportView.lessOptionDiv.style.display = _this.exportView.optionContainer.style.display = "block"; }, false);
        this.exportView.lessOptionDiv.addEventListener("click", function () { _this.exportView.moreOptionDiv.style.display = "block"; _this.exportView.lessOptionDiv.style.display = _this.exportView.optionContainer.style.display = "none"; }, false);
    };
    Export.prototype.addItem = function (id, itemText) {
        var platformsSelect = document.getElementById(id);
        var option = document.createElement('option');
        option.text = itemText;
        platformsSelect.add(option);
    };
    Export.prototype.clearComboBox = function (id) {
        if (document.getElementById(id) != undefined) {
            while (document.getElementById(id).childNodes.length > 0) {
                document.getElementById(id).removeChild(document.getElementById(id).childNodes[0]);
            }
            return true;
        }
        else {
            return false;
        }
    };
    Export.prototype.uploadTargetCallback = function (json) {
        App.jsonText = json;
        var data = JSON.parse(App.jsonText);
        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    };
    Export.prototype.setDefaultSelect = function () {
        var platefromSelect = document.getElementById("platforms");
        var options = platefromSelect.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].textContent == "android") {
                platefromSelect.selectedIndex = i;
            }
        }
    };
    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/
    Export.prototype.exportPatch = function (event, expor) {
        this.exportView.exportButton.removeEventListener("click", this.eventExport);
        this.exportView.exportButton.style.opacity = "0.3";
        var sceneName = Utilitary.currentScene.sceneName;
        if (sceneName == null || sceneName == "") {
            sceneName = "MonApplication";
        }
        this.removeQRCode();
        App.addLoadingLogo("exportResultContainer");
        var equivalentFaust = new EquivalentFaust();
        var faustCode = equivalentFaust.getFaustEquivalent(Utilitary.currentScene, Utilitary.currentScene.sceneName);
        ExportLib.getSHAKey(document.getElementById("faustweburl").value, Utilitary.currentScene.sceneName, faustCode, expor.exportFaustCode);
    };
    Export.prototype.removeQRCode = function () {
        var disposableExportDiv = document.getElementById('disposableExportDiv');
        if (disposableExportDiv) {
            disposableExportDiv.remove();
        }
    };
    Export.prototype.renameScene = function () {
        Scene.rename(this.exportView.inputNameApp, this.exportView.rulesName, this.exportView.dynamicName);
    };
    Export.exportUrl = "http://faustservice.grame.fr";
    Export.targetsUrl = "http://faustservice.grame.fr/targets";
    return Export;
}());
//# sourceMappingURL=Export.js.map