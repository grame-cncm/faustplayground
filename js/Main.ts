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

"use strict";


window.addEventListener('load', init, false);



   



function init() {

    var app: App = new App();

    try {
        app.audioContext = new AudioContext();
    } catch(e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }

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
interface ISrc {
    htmlElement: HTMLElement
    audioNode: AudioContext;
}
interface IOut {
    htmlElement: HTMLElement;
    audioNode: AudioDestinationNode;
}
class App {

    //************* Fields
    audioContext: AudioContext;
    static idX: number;
    scenes: Scene[];
    isPedagogie: boolean;
    static baseImg: string;
    static isTooltipEnabled: boolean;
    static currentScene: number;
    src: ISrc;
    out: IOut;
    tempModuleName: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    currentNumberDSP: number;
    inputs: any[];
    outputs: any[];
    params: any[];
    static buttonVal: number;

    showFirstScene() {
        this.scenes[0].showScene();
    }

    createAllScenes() {
        this.scenes = [];

        if (this.isPedagogie) {

            this.scenes[0] = new Scene("Accueil",this);
            SceneAccueilView.initWelcomeScene(this.scenes[0]);
            this.scenes[1] = new Scene("Pedagogie",this, ScenePedagogieView.onloadPedagogieScene, ScenePedagogieView.onunloadPedagogieScene);
            ScenePedagogieView.initPedagogieScene(this.scenes[1]);
            this.scenes[2] = new Scene("Export",this, SceneExportView.onloadExportScene, SceneExportView.onunloadExportScene);
            // 		Export Page doesn't need initialization
        }
        else {
            this.scenes[0] = new Scene("Normal",this, onloadNormalScene, onunloadNormalScene);
            ScenePlaygroundView.initNormalScene(this.scenes[0]);
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

        App.currentScene = index - 1;
    }

    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/

    activateAudioInput() {

        var navigator = <any>navigator;
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        }

        if (navigator.getUserMedia) {

            navigator.getUserMedia({ audio: true }, this.getDevice, function (e) {
                alert('Error getting audio input');
            });
        } else {
            alert('Audio input API not available');
        }
    }

    getDevice(device: MediaStream) {

        // Create an AudioNode from the stream.
        this.src.htmlElement = document.getElementById("input");
        this.src.audioNode = this.audioContext.createMediaStreamSource(device);
        var drag: Drag = new Drag();
        var i = document.createElement("div");
        i.className = "node node-output";
        i.addEventListener("mousedown", <any>drag.startDraggingConnector, true);
        i.innerHTML = "<span class='node-button'>&nbsp;</span>";
        this.src.htmlElement.appendChild(i);
        var connect: Connect = new Connect();
        connect.connectModules(this.src, this.scenes[App.currentScene].audioInput());
    }

    activateAudioOutput(sceneOutput) {

        this.out.htmlElement = document.createElement("div");
        this.out.htmlElement.id = "audioOutput";
        this.out.audioNode = this.audioContext.destination;
        document.body.appendChild(this.out.htmlElement);
        var connect: Connect = new Connect();
        connect.connectModules(sceneOutput, this.out);
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
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args = ["-I", "http://" + location.hostname + "/faustcode/"];
        var factory = faust.createDSPFactory(sourcecode, args);
        callback(factory);

        if (currentScene) currentScene.unmuteScene();

    }

    createFaustModule(factory) {

        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }

        var faustModule;

        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        faustModule = new Module(App.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, this.scenes[App.currentScene], document.getElementById("modules"), this.scenes[App.currentScene].removeModule);
        //else
        //    faustModule = new Module(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);

        faustModule.setSource(this.tempModuleSourceCode);
        faustModule.createDSP(factory);
        faustModule.createFaustInterface();
        faustModule.addInputOutputNodes();

        this.scenes[App.currentScene].addModule(faustModule);
    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- Init drag and drop reactions
    setGeneralDragAndDrop() {

        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };

        window.ondrop = function (e) {

            this.uploadFile(e);
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
            toolTipForConnections();
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

            this.uploadOn(null, x, y, e);
        }
    }

    //-- Upload content dropped on the page and create a Faust DSP with it
    uploadOn(module, x, y, e) {

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
                        this.compileFaust(filename, dsp_code, x, y, this.createFaustModule);
                    else
                        module.update(filename, dsp_code);
                }

                this.terminateUpload();
            }

            xmlhttp.open("GET", url, false);
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
                    this.compileFaust("TEXT", dsp_code, x, y, this.createFaustModule);
                else
                    module.update("TEXT", dsp_code);

                this.terminateUpload();
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
                            this.compileFaust(filename, dsp_code, x, y, this.createFaustModule);
                        else if (type == "dsp")
                            module.update(filename, dsp_code);
                        else if (type == "json")
                            this.scenes[App.currentScene].recallScene(reader.result);

                        this.terminateUpload();
                    };
                }
            }
        }
        // CASE 4 : ANY OTHER STRANGE THING
        else {
            this.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
    }
}

