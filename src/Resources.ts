import frURL from "../resources/resources_fr-FR.json?url";
import enURL from "../resources/resources_en-EN.json?url";

import type { App } from "./App";
import { resumeInit } from "./Main";
import { Utilitary } from "./Utilitary";

//contains all the key of resources json files in folders resources

export class Resources {
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
    titleDownloadExport: string;
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

    //get resource depending on the location, default is french
    static getResources(app: App) {
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR(frURL, (resource) => { Resources.loadMessages(resource, app) }, Utilitary.errorCallBack)
        } else {
            Utilitary.getXHR(enURL, (resource) => { Resources.loadMessages(resource, app) }, Utilitary.errorCallBack)
        }
    }
    // load the json object
    static loadMessages(resourceJson: string, app: App) {
        Utilitary.messageResource = JSON.parse(resourceJson);
        resumeInit(app);
    }
}
