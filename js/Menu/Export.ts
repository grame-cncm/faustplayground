/*				EXPORT.JS
	Handles Graphical elements for the Export Feature of the normal Playground
		
	DEPENDENCIES :
		- ExportLib.js
		- qrcode.js
*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../main.ts"/>


"use strict";

/******************************************************************** 
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/



class Export{


    //------ Handle Combo Boxes
    addItem(id: string, itemText:string):void
    {
        var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById(id);
        var option: HTMLOptionElement = document.createElement('option');
	    option.text = itemText;
        platformsSelect.options.add(option);
    }

    clearComboBox(id: string): boolean
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


            var data:string[] = JSON.parse(App.jsonText);

            var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById('platforms');//get the combobox
            var selPlatform: string = platformsSelect.options[platformsSelect.selectedIndex].value;

            var dataCopy :string[] = data[selPlatform];
            var iterator = 0;

            for (var subData in dataCopy) {

                if (iterator < dataCopy.length) {
                    var mainData: string = dataCopy[subData];

                    this.addItem('architectures', mainData);
                    iterator = iterator + 1;
                }
            }
        }
    }

    public uploadTargets=()=>
    {
	    this.clearComboBox('platforms');
	    this.clearComboBox('architectures');
        var input: HTMLInputElement = <HTMLInputElement>document.getElementById("faustweburl")
        App.exportURL = input.value;
        var self: Export = this;
        ExportLib.getTargets(App.exportURL, function (json:string) {
			    App.jsonText = json;
				    		
			    var data:string[] = JSON.parse(App.jsonText);

			    for (var platform in data) {
                    self.addItem('platforms', platform);
        	    }

                self.updateArchitectures(self);
        }, function (json: string) {
		    alert('Impossible to get FaustWeb targets');
	    });
    }		

    /******************************************************************** 
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/

    exportPatch(event:Event, expor: Export)
    {
        var sceneName:string = document.getElementById("PatchName").innerHTML;
        var equivalentFaust: EquivalentFaust = new EquivalentFaust();
        var faustCode:string = equivalentFaust.getFaustEquivalent(App.scene, sceneName);
        ExportLib.getSHAKey((<HTMLInputElement>document.getElementById("faustweburl")).value, sceneName, faustCode, expor.exportFaustCode);
    }

    /******************************************************************** 
    **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
    ********************************************************************/

    exportFaustCode(shaKey: string):void
    {
        var xhr: XMLHttpRequest = new XMLHttpRequest();

        var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("platforms");//get the combobox
        var selPlatform: string = platformsSelect.options[platformsSelect.selectedIndex].value;

        var architecturesSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("architectures");//get the combobox
        var selArch: string = architecturesSelect.options[architecturesSelect.selectedIndex].value;

        var serverUrl: string = (<HTMLInputElement>document.getElementById("faustweburl")).value;

        var appType: string = "binary.zip";
	
	    if (selArch == "android")
		    appType = "binary.apk";
	
        // 	Delete existing content if existing
        var qrcodeSpan: HTMLElement = document.getElementById('qrcodeDiv');
	    if (qrcodeSpan)
		    qrcodeSpan.parentNode.removeChild(qrcodeSpan);

        var qrDiv: HTMLElement = document.createElement('div');
	    qrDiv.id = "qrcodeDiv";
	    document.getElementById("sceneOutput").appendChild(qrDiv);

        var link: HTMLAnchorElement = document.createElement('a');
	    link.href = serverUrl + "/" + shaKey +"/"+ selPlatform + "/" + selArch + "/"+appType;
	    qrDiv.appendChild(link);

        var myWhiteDiv: HTMLElement = ExportLib.getQrCode(serverUrl, shaKey, selPlatform, selArch, appType, 120);
	    link.appendChild(myWhiteDiv);
    }
}


