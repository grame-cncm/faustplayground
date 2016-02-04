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



class Export{


//------ Handle Combo Boxes
    addItem(id, itemText)
    {
        var platformsSelect = <HTMLSelectElement> document.getElementById(id);
	    var option = document.createElement('option');
	    option.text = itemText;
        platformsSelect.options.add(option);
    }

    clearComboBox(id): boolean
    {
        if (document.getElementById(id) != undefined) {
            while (document.getElementById(id).childNodes.length > 0) {
                document.getElementById(id).removeChild(document.getElementById(id).childNodes[0]);
            }
            return true
        } else {
            return false
        }
    }

    //------ Update Architectures with Plateform change
    updateArchitectures(self: Export):any
    {
        if (!self.clearComboBox('architectures')) {
            return
        } else {


            var data = JSON.parse(App.jsonText);

            var platformsSelect = <HTMLSelectElement>document.getElementById('platforms');//get the combobox
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
    }

    uploadTargets()
    {
	    this.clearComboBox('platforms');
	    this.clearComboBox('architectures');
        var input: HTMLInputElement = <HTMLInputElement>document.getElementById("faustweburl")
        App.exportURL = input.value;
        var self = this;
        ExportLib.getTargets(App.exportURL, function (json) {
			    App.jsonText = json;
				    		
			    var data = JSON.parse(App.jsonText);

			    for (var event in data) {
                    self.addItem('platforms', event);
        	    }

                self.updateArchitectures(self);
	    }, function(json){
		    alert('Impossible to get FaustWeb targets');
	    });
    }		

    /******************************************************************** 
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/

    exportPatch(event, expor: Export)
    {
        var sceneName = document.getElementById("PatchName").innerHTML;
        var equivalentFaust: EquivalentFaust = new EquivalentFaust();
        var faustCode = equivalentFaust.getFaustEquivalent(App.scene, sceneName);
        ExportLib.getSHAKey((<HTMLInputElement>document.getElementById("faustweburl")).value, sceneName, faustCode, expor.exportFaustCode);
    }

    /******************************************************************** 
    **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
    ********************************************************************/

    exportFaustCode(shaKey)
    {
	    var xhr = new XMLHttpRequest();

        var platformsSelect = <HTMLSelectElement> document.getElementById("platforms");//get the combobox
        var selPlatform = platformsSelect.options[platformsSelect.selectedIndex].value;
			    
        var architecturesSelect = <HTMLSelectElement>document.getElementById("architectures");//get the combobox
        var selArch = architecturesSelect.options[architecturesSelect.selectedIndex].value;

        var serverUrl = (<HTMLInputElement> document.getElementById("faustweburl")).value;
 		
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
	    link.href = serverUrl + "/" + shaKey +"/"+ selPlatform + "/" + selArch + "/"+appType;
	    qrDiv.appendChild(link);

	    var myWhiteDiv = ExportLib.getQrCode(serverUrl, shaKey, selPlatform, selArch, appType, 120);
	    link.appendChild(myWhiteDiv);
    }
}


