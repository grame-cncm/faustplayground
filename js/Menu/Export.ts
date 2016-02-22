﻿/*				EXPORT.JS
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
        this.exportView.exportButton.onclick = (event) => { this.exportPatch(event, this) };
        this.exportView.buttonNameApp.onclick = () => { this.renameScene() };
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
        var sceneName: string = Scene.sceneName;
        if (sceneName == null || sceneName == "") {
            sceneName = "MonApplication";
        }
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
        
        var disposableExportDiv: HTMLDivElement = document.createElement("div");
        disposableExportDiv.id = "disposableExportDiv"
        var qrDiv: HTMLElement = document.createElement('div');
        qrDiv.id = "qrcodeDiv";
        var myWhiteDiv: HTMLElement = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
        qrDiv.appendChild(myWhiteDiv);
        var linkDownload: HTMLAnchorElement = document.createElement('a');
        linkDownload.href = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
        linkDownload.textContent = "télécharger";

        document.getElementById("exportResultContainer").appendChild(disposableExportDiv);
        disposableExportDiv.appendChild(linkDownload);
        disposableExportDiv.appendChild(qrDiv);

        App.removeLoadingLogo();

    }


    removeQRCode() {
        var disposableExportDiv: HTMLElement = document.getElementById('disposableExportDiv');
        if (disposableExportDiv) {
            disposableExportDiv.remove();
        }
    }
    renameScene() {


        var newName: string = this.exportView.inputNameApp.value;

        newName = this.replaceAll(newName,"é", "e");
        newName = this.replaceAll(newName, "è", "e");
        newName = this.replaceAll(newName, "à", "a");
        newName = this.replaceAll(newName, "ù", "u");
        newName = this.replaceAll(newName, " ", "_");
        newName = this.replaceAll(newName, "'", "_");
        

        var pattern: RegExp = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");

        if (pattern.test(newName)) {
            Scene.sceneName = newName;
            this.exportView.dynamicName.textContent = Scene.sceneName;
            this.exportView.rulesName.style.opacity = "0.6";
            this.exportView.inputNameApp.style.boxShadow = "0 0 0 green inset"
        } else {
            this.exportView.rulesName.style.opacity = "1";
            this.exportView.inputNameApp.style.boxShadow ="0 0 6px red inset"
        }
       
    }
    replaceAll(str: String, find: string, replace: string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}

