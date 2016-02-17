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
    exportView: ExportView;
    static exportUrl: string = "http://faustservice.grame.fr"
    static targetsUrl: string = "http://faustservice.grame.fr/targets"

    //------ Handle Combo Boxes
    setEventListeners() {
        this.exportView.refreshButton.onclick = this.uploadTargets;
        this.exportView.selectPlatform.onchange = () => { this.updateArchitectures() };
        this.exportView.exportButton.onclick =  (event)=>{ this.exportPatch(event, this) };
    }
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
    updateArchitectures = () =>
    {
        if (!this.clearComboBox('architectures')) {
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

        App.getXHR(Export.targetsUrl, (json: string) => { this.uploadTargetCallback(json) }, (errorMessage: string) => { ErrorFaust.errorCallBack(errorMessage) });
        //ExportLib.getTargets(App.exportURL, (json: string) => { this.uploadTargetCallback },  (json: string)=> {alert('Impossible to get FaustWeb targets')});
    }	

    uploadTargetCallback(json: string) {
        App.jsonText = json;

        var data: string[] = JSON.parse(App.jsonText);

        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    }	
    setDefaultSelect() {
        var platefromSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("platforms");
        platefromSelect.selectedIndex = 3;
    }

    /******************************************************************** 
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/

    exportPatch(event:Event, expor: Export)
    {
        this.removeQRCode();
        App.addLoadingLogo("exportResultContainer");
        var equivalentFaust: EquivalentFaust = new EquivalentFaust();
        var faustCode:string = equivalentFaust.getFaustEquivalent(App.scene,Scene.sceneName);
        ExportLib.getSHAKey((<HTMLInputElement>document.getElementById("faustweburl")).value, Scene.sceneName, faustCode, expor.exportFaustCode);
    }

    /******************************************************************** 
    **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
    ********************************************************************/

    exportFaustCode=(shaKey: string)=>
    {

        var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("platforms");//get the combobox
        var platforme: string = platformsSelect.options[platformsSelect.selectedIndex].value;

        var architecturesSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("architectures");//get the combobox
        var architecture: string = architecturesSelect.options[architecturesSelect.selectedIndex].value;

        var serverUrl: string = (<HTMLInputElement>document.getElementById("faustweburl")).value;

        var appType: string = "binary.zip";
	
        if (architecture == "android")
            appType = "binary.apk";

        var exportLib: ExportLib = new ExportLib();
        exportLib.sendPrecompileRequest("http://faustservice.grame.fr", shaKey, platforme, architecture, appType, (serverUrl: string, shaKey: string, plateforme: string, architecture: string, appType: string) => { this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType) });

        // 	Delete existing content if existing
        
    }

    setDownloadOptions = (serverUrl: string, shaKey: string, plateforme: string, architecture: string, appType: string) => {
        

        var qrDiv: HTMLElement = document.createElement('div');
        qrDiv.id = "qrcodeDiv";
        document.getElementById("exportResultContainer").appendChild(qrDiv);

        var link: HTMLAnchorElement = document.createElement('a');
        link.href = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
        qrDiv.appendChild(link);
        
        var myWhiteDiv: HTMLElement = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
        link.appendChild(myWhiteDiv);
        App.removeLoadingLogo();

    }
    removeQRCode() {
        var qrcodeSpan: HTMLElement = document.getElementById('qrcodeDiv');
        if (qrcodeSpan)
            qrcodeSpan.parentNode.removeChild(qrcodeSpan);
    }
}


