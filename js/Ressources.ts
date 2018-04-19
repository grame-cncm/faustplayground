/// <reference path="App.ts"/>
/// <reference path="Utilitary.ts"/>

//contains all the key of resources json files in folders ressources

class Ressources {
  //scene messages
    defaultSceneName: string;
    reference: string;
    chrisWilson: string;
    loading: string;
    drop: string;

    //drive Api message
    noFileOnCloud: string;

    //error
    errorObjectNotFaustCompatible: string;
    errorLoading: string;
    errorGettingAudioInput: string;
    errorInputAPINotAvailable: string;
    errorAccSliderNotFound: string;
    errorAccelerometerNotFound: string;
    errorNoWebAudioAPI: string;
    errorOccuredMessage: string;
    errorFactory: string;
    errorJsonCorrupted: string;
    errorCreateDSP: string;
    errorCreateModuleRecall: string;
    errorConnectionRecall: string;
    errorLocalStorage: string;
    errorConnectionCloud: string;

    //SaveView messages
    saveDownload: string;
    rulesSceneName: string;
    precompileOption: string;
    buttonDownloadApp: string;
    sucessSave: string;
    buttonSuppress: string;
    buttonLocalSave: string;
    buttonConnectCloud: string;
    buttonCloudSave: string;
    buttonLogoutCloud: string;

     //Save message
    confirmSuppr: string;
    confirmReplace: string;

    //MenuView messages
    buttonLibrary: string;
    buttonLoad: string;
    buttonEdit: string;
    buttonSave: string;
    buttonExport: string;
    buttonHelp: string;

    //Menu
    confirmEmptyScene: string;

    //LoadView messages
    buttonLoadFile: string;
    buttonLoadLocal: string;
    buttonLoadCloud: string;

    //LibraryView
    titleInstruments: string;
    titleEffects: string;
    titleExemples: string;

    //Library
    hoverLibraryElement: string;

    //ExportView
    appNameExport: string;
    buttonChangeSceneName: string;
    lessOptions: string;
    moreOptions: string;
    titleExportOptions: string;
    buttonRefresh: string;
    buttonExportScene: string;
    titleDownlaodExport: string;
    invalidSceneName: string;
    successRenameScene: string;

    //AccelerometerEditView
    curve1: string;
    curve2: string;
    curve3: string;
    curve4: string;
    axisX: string;
    axisY: string;
    axisZ: string;
    axis0: string;
    checkBox: string;
    noDeviceMotion: string;

    //get ressource depending on the location, default is french
    getRessources(app:App) {
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", (ressource) => { this.loadMessages(ressource,app) }, Utilitary.errorCallBack)
        } else {
            Utilitary.getXHR("ressources/ressources_en-EN.json", (ressource) => { this.loadMessages(ressource,app) }, Utilitary.errorCallBack)
        }
    }
    // load the json object
    loadMessages(ressourceJson: string,app:App) {
        Utilitary.messageRessource = JSON.parse(ressourceJson);
        resumeInit(app);
    }
}
