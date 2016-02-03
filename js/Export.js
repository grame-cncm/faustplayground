/*				EXPORT.JS
    Handles Graphical elements for the Export Feature of the normal Playground
        
    DEPENDENCIES :
        - ExportLib.js
        - qrcode.js
*/
/// <reference path="ExportLib.ts"/>
/// <reference path="EquivalentFaust.ts"/>
/// <reference path="main.ts"/>
"use strict";
/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/
var Export = (function () {
    function Export() {
    }
    //------ Handle Combo Boxes
    Export.prototype.addItem = function (id, itemText) {
        var platformsSelect = document.getElementById(id);
        var option = document.createElement('option');
        option.text = itemText;
        platformsSelect.options.add(option);
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
    //------ Update Architectures with Plateform change
    Export.prototype.updateArchitectures = function (self) {
        if (!self.clearComboBox('architectures')) {
            return;
        }
        else {
            var data = JSON.parse(App.jsonText);
            var platformsSelect = document.getElementById('platforms'); //get the combobox
            var selPlatform = platformsSelect.options[platformsSelect.selectedIndex].value;
            var dataCopy = data[selPlatform];
            var iterator = 0;
            for (data in dataCopy) {
                if (iterator < dataCopy.length) {
                    var mainData = dataCopy[data];
                    this.addItem('architectures', mainData);
                    iterator = iterator + 1;
                }
            }
        }
    };
    Export.prototype.uploadTargets = function () {
        this.clearComboBox('platforms');
        this.clearComboBox('architectures');
        var input = document.getElementById("faustweburl");
        App.exportURL = input.value;
        var self = this;
        ExportLib.getTargets(App.exportURL, function (json) {
            App.jsonText = json;
            var data = JSON.parse(App.jsonText);
            for (var event in data) {
                self.addItem('platforms', event);
            }
            self.updateArchitectures(self);
        }, function (json) {
            alert('Impossible to get FaustWeb targets');
        });
    };
    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/
    Export.prototype.exportPatch = function (event) {
        var sceneName = document.getElementById("PatchName").innerHTML;
        var equivalentFaust = new EquivalentFaust();
        var faustCode = equivalentFaust.getFaustEquivalent(App.scene, sceneName);
        ExportLib.getSHAKey(document.getElementById("faustweburl").value, sceneName, faustCode, this.exportFaustCode);
    };
    /********************************************************************
    **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
    ********************************************************************/
    Export.prototype.exportFaustCode = function (shaKey) {
        var xhr = new XMLHttpRequest();
        var platformsSelect = document.getElementById("platforms"); //get the combobox
        var selPlatform = platformsSelect.options[platformsSelect.selectedIndex].value;
        var architecturesSelect = document.getElementById("architectures"); //get the combobox
        var selArch = architecturesSelect.options[architecturesSelect.selectedIndex].value;
        var serverUrl = document.getElementById("faustweburl").value;
        var appType = "binary.zip";
        if (selArch == "android")
            appType = "binary.apk";
        // 	Delete existing content if existing
        var qrcodeSpan = document.getElementById('qrcodeDiv');
        if (qrcodeSpan)
            qrcodeSpan.parentNode.removeChild(qrcodeSpan);
        var qrDiv = document.createElement('div');
        qrDiv.id = "qrcodeDiv";
        document.getElementById("sceneOutput").appendChild(qrDiv);
        var link = document.createElement('a');
        link.href = serverUrl + "/" + shaKey + "/" + selPlatform + "/" + selArch + "/" + appType;
        qrDiv.appendChild(link);
        var myWhiteDiv = ExportLib.getQrCode(serverUrl, shaKey, selPlatform, selArch, appType, 120);
        link.appendChild(myWhiteDiv);
    };
    return Export;
})();
//# sourceMappingURL=Export.js.map