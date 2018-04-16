/*				EXPORT.JS
	Handles Graphical elements for the Export Feature of the normal Playground

*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ExportView.ts"/>
/// <reference path="../Utilitary.ts"/>

/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/

class Export{
    exportView: ExportView;
    static exportUrl: string = "https://faustservice.grame.fr"
    static targetsUrl: string = "https://faustservice.grame.fr/targets"
    jsonText: string;
    eventExport: (event: Event) => void;

    // Set EventListener
    setEventListeners() {
        this.exportView.refreshButton.onclick = () => { this.uploadTargets() };
        this.exportView.selectPlatform.onchange = () => { this.updateArchitectures() };
        this.exportView.inputServerUrl.onkeypress = (e: KeyboardEvent) => { if (e.which == 13) { this.uploadTargets() } };
        this.eventExport = (event) => { this.exportPatch(event, this) }
        this.exportView.exportButton.addEventListener("click", this.eventExport);
        this.exportView.buttonNameApp.onclick = () => { this.renameScene() };
        this.exportView.inputNameApp.onkeypress = (e: KeyboardEvent) => { if (e.which == 13) { this.renameScene() } };
        this.exportView.moreOptionDiv.addEventListener("click", () => { this.exportView.moreOptionDiv.style.display = "none"; this.exportView.lessOptionDiv.style.display = this.exportView.optionContainer.style.display = "block" }, false);
        this.exportView.lessOptionDiv.addEventListener("click", () => { this.exportView.moreOptionDiv.style.display = "block"; this.exportView.lessOptionDiv.style.display = this.exportView.optionContainer.style.display = "none" }, false);
    }
    // add options into select boxes
    addItem(id: string, itemText:string):void
    {
        var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById(id);
        var option: HTMLOptionElement = document.createElement('option');
	      option.text = itemText;
        platformsSelect.add(option);
    }
    //clear select boxes
    clearSelectBox(id: string): boolean
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
        if (!this.clearSelectBox('architectures')) {
            return
        } else {

            var data:string[] = JSON.parse(this.jsonText);
            var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById('platforms');//get the combobox
            var options = <HTMLOptionElement>platformsSelect.options[platformsSelect.selectedIndex]
            var selPlatform: string = options.value;
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
    //callback to get Target on server
    public uploadTargets=()=>
    {
        this.clearSelectBox('platforms');
        this.clearSelectBox('architectures');
        var input: HTMLInputElement = <HTMLInputElement>document.getElementById("faustweburl");
        Export.exportUrl = input.value;
        Export.targetsUrl = Export.exportUrl+"/targets";

        Utilitary.getXHR(Export.targetsUrl, (json: string) => { this.uploadTargetCallback(json) }, (errorMessage: string) => { Utilitary.errorCallBack(errorMessage) });
    }

    //callback to refresh Target
    uploadTargetCallback(json: string) {
        this.jsonText = json;

        var data: string[] = JSON.parse(this.jsonText);

        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    }

    //set selection to default, currently android
    setDefaultSelect() {
        var platefromSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("platforms");
        var options = platefromSelect.options
        for (var i = 0; i < options.length; i++){
            if (options[i].textContent == "android") {
                platefromSelect.selectedIndex = i;
            }
        }
    }

    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/

    exportPatch(event:Event, expor: Export)
    {
        this.exportView.exportButton.removeEventListener("click", this.eventExport)
        this.exportView.exportButton.style.opacity = "0.3";
        var sceneName: string = Utilitary.currentScene.sceneName;
        if (sceneName == null || sceneName == "") {
            sceneName = "MonApplication";
        }
        this.removeQRCode();
        Utilitary.addLoadingLogo("exportResultContainer");
        var equivalentFaust: EquivalentFaust = new EquivalentFaust();
        var faustCode: string = equivalentFaust.getFaustEquivalent(Utilitary.currentScene, Utilitary.currentScene.sceneName);
        ExportLib.getSHAKey((<HTMLInputElement>document.getElementById("faustweburl")).value, Utilitary.currentScene.sceneName, faustCode, expor.exportFaustCode);
    }

    /********************************************************************
    **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
    ********************************************************************/

    exportFaustCode=(shaKey: string)=>
    {
        var platformsSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("platforms");//get the combobox
        var optionPlateform = <HTMLOptionElement>platformsSelect.options[platformsSelect.selectedIndex];
        var platforme: string = optionPlateform.value;
        var architecturesSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("architectures");//get the combobox
        var optionArchi = <HTMLOptionElement>architecturesSelect.options[architecturesSelect.selectedIndex];
        var architecture: string = optionArchi.value;
        var serverUrl: string = (<HTMLInputElement>document.getElementById("faustweburl")).value;
        var appType: string = "binary.zip";

        if (architecture == "android")
            appType = "binary.apk";

        var exportLib: ExportLib = new ExportLib();
        exportLib.sendPrecompileRequest(serverUrl, shaKey, platforme, architecture, appType, (serverUrl: string, shaKey: string, plateforme: string, architecture: string, appType: string) => { this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType) });

        // 	Delete existing content if existing
    }

    //set download QR Code and Button
    setDownloadOptions = (serverUrl: string, shaKey: string, plateforme: string, architecture: string, appType: string) => {
        if (shaKey.indexOf("ERROR") == -1) {
            var disposableExportDiv: HTMLDivElement = document.createElement("div");
            disposableExportDiv.id = "disposableExportDiv"
            var qrDiv: HTMLElement = document.createElement('div');
            qrDiv.id = "qrcodeDiv";
            var myWhiteDiv: HTMLElement = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
            qrDiv.appendChild(myWhiteDiv);

            var downloadBottomButtonContainer: HTMLElement = document.createElement("div");
            downloadBottomButtonContainer.className = "bottomButtonContainer";

            var linkDownload: HTMLButtonElement = document.createElement('button');
            linkDownload.value = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
            linkDownload.id = "linkDownload";
            linkDownload.className = "button";
            linkDownload.textContent = Utilitary.messageRessource.buttonDownloadApp;
            downloadBottomButtonContainer.appendChild(linkDownload);
            this.exportView.downloadButton = linkDownload;
            this.exportView.downloadButton.onclick = () => { window.location.href = this.exportView.downloadButton.value };

            document.getElementById("exportResultContainer").appendChild(disposableExportDiv);
            disposableExportDiv.appendChild(qrDiv);
            disposableExportDiv.appendChild(downloadBottomButtonContainer);

            this.exportView.exportButton.addEventListener("click", this.eventExport)
            this.exportView.exportButton.style.opacity = "1";
            Utilitary.removeLoadingLogo("exportResultContainer");
        } else {
            new Message(shaKey)
        }
        this.exportView.exportButton.addEventListener("click", this.eventExport)
        this.exportView.exportButton.style.opacity = "1";
       Utilitary.removeLoadingLogo("exportResultContainer");
    }

    removeQRCode() {
        var disposableExportDiv: HTMLElement = document.getElementById('disposableExportDiv');
        if (disposableExportDiv) {
            disposableExportDiv.remove();
        }
    }
    renameScene() {
        Scene.rename(this.exportView.inputNameApp, this.exportView.rulesName, this.exportView.dynamicName);
    }
}
