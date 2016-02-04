/*				MAIN.JS
	Entry point of the Program

	Create the scenes
	Navigate between scenes
	Activate Physical input/output
	Handle Drag and Drop
	Create Factories and Modules

	DEPENDENCIES :
		- Accueil.js
		- Finish.js
		- Playground.js
		- Pedagogie.js
		- SceneClass.js

		- ModuleClass.js
		- Connect.js
		- libfaust.js
		- webaudio-asm-wrapper.js
		- Pedagogie/Tooltips.js

*/
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Connect.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="webaudio-asm-wrapper.d.ts"/>
/// <reference path="Modules/FaustInterface.ts"/>
/// <reference path="Scenes/Accueil.ts"/>
/// <reference path="Scenes/Finish.ts"/>
/// <reference path="Scenes/Pedagogie.ts"/>
/// <reference path="Scenes/Playground.ts"/>
/// <reference path="Export.ts"/>
/// <reference path="ExportLib.ts"/>
/// <reference path="EquivalentFaust.ts"/>
/// <reference path="Pedagogie/Tooltips.ts"/>
/// <reference path="qrcode.d.ts"/>



"use strict";


window.addEventListener('load', init, false);



   



function init() {

    var app: App = new App();

    try {
        App.audioContext = new AudioContext();
    } catch(e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    App.isPedagogie = App.isAppPedagogique();
	app.createAllScenes();
	app.showFirstScene();
}


    /********************************************************************
    **************************  CLASS  *********************************
    ********************************************************************/

//interface Navigator {
//    getUserMedia(
//        options: { video?: boolean; audio?: boolean; },
//        success: (stream: any) => void,
//        error?: (error: string) => void
//    ): void;
//    webkitGetUserMedia(
//        options: { video?: boolean; audio?: boolean; },
//        successCallback: (stream: any) => void,
//        errorCallback: (error: Error) => void)
//        : any;
//}
interface MediaStream {
    id: string;
    active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {

}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    state: string;
    close: () => void;
    createMediaStreamSource: (m: MediaStream) => AudioContext;
    createMediaStreamDestination: () => any;
    resume: () => void;
    suspend: () => void;
}
interface IHTMLDivElementSrc extends HTMLDivElement {
    audioNode: AudioContext;
}
interface IHTMLDivElementOut extends HTMLDivElement{
    audioNode: AudioDestinationNode;
}
interface Factory {
    factoryName: string;
    shaKe: string;
}
class App {

    //************* Fields
    static audioContext: AudioContext;
    static idX: number;
    scenes: Scene[];
    static scene: Scene;
    static isPedagogie: boolean;
    static baseImg: string="img/";
    static isTooltipEnabled: boolean;
    static currentScene: number;
    static src: IHTMLDivElementSrc ;
    static out: IHTMLDivElementOut ;
    tempModuleName: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    currentNumberDSP: number;
    inputs: any[];
    outputs: any[];
    params: any[];
    static buttonVal: number;
    static libraryContent: string;
    static recursiveMap: ModuleRecursive[];
    static jsonText: string;
    static exportURL: string;
    factory: Factory;

    showFirstScene() {
        App.scene.showScene();
    }

    createAllScenes() {
        this.scenes = [];

        if (App.isPedagogie) {

            this.scenes[0] = new Scene("Accueil",this);
            SceneAccueilView.initWelcomeScene(this.scenes[0]);
            App.scene = this.scenes[0]
            this.scenes[1] = new Scene("Pedagogie",this, ScenePedagogieView.onloadPedagogieScene, ScenePedagogieView.onunloadPedagogieScene);
            ScenePedagogieView.initPedagogieScene(this.scenes[1]);
            var sceneExportView: SceneExportView = new SceneExportView();
            this.scenes[2] = new Scene("Export", this, sceneExportView.onloadExportScene, sceneExportView.onunloadExportScene);
            // 		Export Page doesn't need initialization
        }
        else {
            var scenePlaygroundView: ScenePlaygroundView = new ScenePlaygroundView();
            this.scenes[0] = new Scene("Normal", this, scenePlaygroundView.onloadNormalScene, scenePlaygroundView.onunloadNormalScene);
            App.scene = this.scenes[0];
            scenePlaygroundView.initNormalScene(this.scenes[0]);

        }
        App.currentScene = 0;
    }

    /********************************************************************
    **********************  NAVIGATION BETWEEN SCENES *******************
    ********************************************************************/

    nextScene() {

        var index: number = App.currentScene;

        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();

        App.scene = this.scenes[index + 1];
        App.currentScene = index + 1;

        console.log("WINDOW CURRENT SCENE");
        console.log(this.scenes[index + 1].getSceneContainer());

        this.scenes[index + 1].showScene();
        this.scenes[index + 1].loadScene();
    }

    previousScene() {

        var index = App.currentScene;

        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();

        this.scenes[index - 1].showScene();
        this.scenes[index - 1].loadScene();
        App.scene = this.scenes[index - 1];
        App.currentScene = index - 1;
    }

    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/

    activateAudioInput() {

        var navigatorLoc = <any>navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }

        if (navigatorLoc.getUserMedia) {

            navigatorLoc.getUserMedia({ audio: true }, this.getDevice, function (e) {
                alert('Error getting audio input');
            });
        } else {
            alert('Audio input API not available');
        }
    }

    getDevice(device: MediaStream,app:App) {

        // Create an AudioNode from the stream.
        App.src = <IHTMLDivElementSrc> document.getElementById("input");
        App.src.audioNode = App.audioContext.createMediaStreamSource(device);
        var drag: Drag = new Drag();
        var inputDiv = document.createElement("div");
        inputDiv.className = "node node-output";
        inputDiv.addEventListener("mousedown", <any>function () { drag.startDraggingConnector }, true);
        inputDiv.innerHTML = "<span class='node-button'>&nbsp;</span>";
        App.src.appendChild(inputDiv);
        var connect: Connect = new Connect();
        connect.connectModules(App.src, App.scene.audioInput());
    }

    activateAudioOutput(sceneOutput) {

        App.out = <IHTMLDivElementOut> document.createElement("div");
        App.out.id = "audioOutput";
        App.out.audioNode = App.audioContext.destination;
        document.body.appendChild(App.out);
        var connect: Connect = new Connect();
        connect.connectModules(sceneOutput, App.out);
    }

    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/

    compileFaust(name, sourcecode, x, y, callback) {

        //  Temporarily Saving parameters of compilation
        this.tempModuleName = name;
        this.tempModuleSourceCode = sourcecode;
        this.tempModuleX = x;
        this.tempModuleY = y;

        var currentScene = this.scenes[App.currentScene];

        // To Avoid click during compilation
        if (currentScene) currentScene.muteScene();

        //var args = ["-I", "http://faust.grame.fr/faustcode/"];
        //var args = ["-I", "http://ifaust.grame.fr/faustcode/"];
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args = ["-I", "http://" + location.hostname + "/faustcode/"];
        this.factory = faust.createDSPFactory(sourcecode, args);
        callback(this.factory, App.scene, this);

        if (currentScene) currentScene.unmuteScene();

    }

    createFaustModule(factory: Factory, scene: Scene, app: App) {

        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }

        var faustModule;

        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        faustModule = new ModuleClass(App.idX++, app.tempModuleX, app.tempModuleY, app.tempModuleName, scene, document.getElementById("modules"), scene.removeModule);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);

        faustModule.setSource(app.tempModuleSourceCode);
        faustModule.createDSP(factory);
        faustModule.createFaustInterface();
        faustModule.addInputOutputNodes();

        scene.addModule(faustModule);
    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- Init drag and drop reactions
    setGeneralDragAndDrop(app:App) {

        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };

        window.ondrop = function (e) {

            app.uploadFile(e);
            return true;
        };
    }

    //-- Init drag and drop reactions
    resetGeneralDragAndDrop(div) {

        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        window.ondrop = function (e) { return false; };
    }


    //-- Prevent Default Action of the browser from happening
    preventDefaultAction(e) {
        e.preventDefault();
    }

    terminateUpload() {

        var uploadTitle = document.getElementById("upload");
        uploadTitle.textContent = "";

        if (App.isTooltipEnabled && Tooltips.sceneHasInstrumentAndEffect(this.scenes[App.currentScene]))
            Tooltips.toolTipForConnections(this.scenes[App.currentScene]);
    }

    //-- Finds out if the drop was on an existing module or creating a new one
    uploadFile(e) {

        if (!e)
            e = window.event;

        var alreadyInNode = false;

        var modules = this.scenes[App.currentScene].getModules();

        for (var i = 0; i < modules.length; i++) {
            if (modules[i].isPointInNode(e.clientX, e.clientY))
                alreadyInNode = true;
        }

        if (!alreadyInNode) {

            var x = e.clientX;
            var y = e.clientY;

            this.uploadOn(this,null, x, y, e);
        }
    }

    //-- Upload content dropped on the page and create a Faust DSP with it
    uploadOn(app:App,module:ModuleClass, x, y, e) {

        this.preventDefaultAction(e);

        var uploadTitle = document.getElementById("upload");

        uploadTitle.textContent = "CHARGEMENT EN COURS ...";

        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url = e.dataTransfer.getData('URL');

            var filename = url.toString().split('/').pop();
            filename = filename.toString().split('.').shift();

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";

                    if (module == null)
                        app.compileFaust(filename, dsp_code, x, y, app.createFaustModule);
                    else
                        module.update(filename, dsp_code);
                }

                app.terminateUpload();
            }

            xmlhttp.open("GET", url);
            // 	Avoid error "mal formé" on firefox
            xmlhttp.overrideMimeType('text/html');
            xmlhttp.send();
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {

            var dsp_code = e.dataTransfer.getData('text');

            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";

                if (!module)
                    app.compileFaust("TEXT", dsp_code, x, y, app.createFaustModule);
                else
                    module.update("TEXT", dsp_code);

                app.terminateUpload();
            }
            // CASE 3 : THE DROPPED OBJECT IS A FILE CONTAINING SOME FAUST CODE
            else {
                var files = e.target.files || e.dataTransfer.files;

                var file = files[0];

                if (location.host.indexOf("sitepointstatic") >= 0) return

                var request = new XMLHttpRequest();
                if (request.upload) {

                    var reader = new FileReader();

                    var ext = file.name.toString().split('.').pop();

                    var filename = file.name.toString().split('.').shift();

                    var type;

                    if (ext == "dsp") {
                        type = "dsp";
                        reader.readAsText(file);
                    }
                    else if (ext == "json") {
                        type = "json";
                        reader.readAsText(file);
                    }
                    else
                        this.terminateUpload();

                    reader.onloadend = function (e) {
                        dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";

                        if (!module && type == "dsp")
                            app.compileFaust(filename, dsp_code, x, y, app.createFaustModule);
                        else if (type == "dsp")
                            module.update(filename, dsp_code);
                        else if (type == "json")
                            app.scenes[App.currentScene].recallScene(reader.result);

                        app.terminateUpload();
                    };
                }
            }
        }
        // CASE 4 : ANY OTHER STRANGE THING
        else {
            app.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
    }
    //Check in Url if the app should be for kids
    static isAppPedagogique(): boolean {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true
        } else {
            return false
        }

    }
}

