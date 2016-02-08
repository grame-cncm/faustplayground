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
    var app = new App();
    try {
        App.audioContext = new AudioContext();
    }
    catch (e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    App.isPedagogie = App.isAppPedagogique();
    app.createAllScenes();
    app.showFirstScene();
}
var App = (function () {
    function App() {
    }
    App.prototype.showFirstScene = function () {
        App.scene.showScene();
    };
    App.prototype.createAllScenes = function () {
        this.scenes = [];
        if (App.isPedagogie) {
            this.scenes[0] = new Scene("Accueil", this);
            SceneAccueilView.initWelcomeScene(this.scenes[0]);
            App.scene = this.scenes[0];
            this.scenes[1] = new Scene("Pedagogie", this, ScenePedagogieView.onloadPedagogieScene, ScenePedagogieView.onunloadPedagogieScene);
            ScenePedagogieView.initPedagogieScene(this.scenes[1]);
            var sceneExportView = new SceneExportView();
            this.scenes[2] = new Scene("Export", this, function (scene) { sceneExportView.onloadExportScene(scene, sceneExportView); }, sceneExportView.onunloadExportScene);
        }
        else {
            var scenePlaygroundView = new ScenePlaygroundView();
            this.scenes[0] = new Scene("Normal", this, scenePlaygroundView.onloadNormalScene, scenePlaygroundView.onunloadNormalScene);
            App.scene = this.scenes[0];
            scenePlaygroundView.initNormalScene(this.scenes[0]);
        }
        App.currentScene = 0;
    };
    /********************************************************************
    **********************  NAVIGATION BETWEEN SCENES *******************
    ********************************************************************/
    App.prototype.nextScene = function () {
        var index = App.currentScene;
        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();
        App.scene = this.scenes[index + 1];
        App.currentScene = index + 1;
        console.log("WINDOW CURRENT SCENE");
        console.log(this.scenes[index + 1].getSceneContainer());
        this.scenes[index + 1].showScene();
        this.scenes[index + 1].loadScene();
    };
    App.prototype.previousScene = function () {
        var index = App.currentScene;
        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();
        this.scenes[index - 1].showScene();
        this.scenes[index - 1].loadScene();
        App.scene = this.scenes[index - 1];
        App.currentScene = index - 1;
    };
    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/
    App.prototype.activateAudioInput = function (app) {
        var navigatorLoc = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }
        if (navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia({ audio: true }, function (mediaStream) { app.getDevice(mediaStream, app); }, function (e) {
                alert('Error getting audio input');
            });
        }
        else {
            alert('Audio input API not available');
        }
    };
    App.prototype.getDevice = function (device, app) {
        // Create an AudioNode from the stream.
        App.src = document.getElementById("input");
        App.src.audioNode = App.audioContext.createMediaStreamSource(device);
        var drag = new Drag();
        var inputDiv = document.createElement("div");
        inputDiv.className = "node node-output";
        inputDiv.addEventListener("mousedown", function () { drag.startDraggingConnector; }, true);
        App.scene.getAudioInput().setInputOutputNodes(null, inputDiv);
        inputDiv.innerHTML = "<span class='node-button'>&nbsp;</span>";
        App.src.appendChild(inputDiv);
        var connect = new Connect();
        connect.connectModules(App.src, App.scene.fAudioInput);
    };
    App.prototype.activateAudioOutput = function (sceneOutput) {
        App.out = document.createElement("div");
        App.out.id = "audioOutput";
        App.out.audioNode = App.audioContext.destination;
        document.body.appendChild(App.out);
        //var connect: Connect = new Connect();
        //connect.connectModules(sceneOutput, App.out);
    };
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    App.prototype.compileFaust = function (name, sourcecode, x, y, callback) {
        //  Temporarily Saving parameters of compilation
        this.tempModuleName = name;
        this.tempModuleSourceCode = sourcecode;
        this.tempModuleX = x;
        this.tempModuleY = y;
        var currentScene = this.scenes[App.currentScene];
        // To Avoid click during compilation
        if (currentScene)
            currentScene.muteScene();
        //var args = ["-I", "http://faust.grame.fr/faustcode/"];
        //var args = ["-I", "http://ifaust.grame.fr/faustcode/"];
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args = ["-I", "http://" + location.hostname + "/faustcode/"];
        this.factory = faust.createDSPFactory(sourcecode, args);
        callback(this.factory, App.scene, this);
        if (currentScene)
            currentScene.unmuteScene();
    };
    App.prototype.createFaustModule = function (factory, scene, app) {
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
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- Init drag and drop reactions
    App.prototype.setGeneralDragAndDrop = function (app) {
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        window.ondrop = function (e) {
            app.uploadFile(e);
            return true;
        };
    };
    //-- Init drag and drop reactions
    App.prototype.resetGeneralDragAndDrop = function (div) {
        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        window.ondrop = function (e) { return false; };
    };
    //-- Prevent Default Action of the browser from happening
    App.prototype.preventDefaultAction = function (e) {
        e.preventDefault();
    };
    App.prototype.terminateUpload = function () {
        var uploadTitle = document.getElementById("upload");
        uploadTitle.textContent = "";
        if (App.isTooltipEnabled && Tooltips.sceneHasInstrumentAndEffect(this.scenes[App.currentScene]))
            Tooltips.toolTipForConnections(this.scenes[App.currentScene]);
    };
    //-- Finds out if the drop was on an existing module or creating a new one
    App.prototype.uploadFile = function (e) {
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
            this.uploadOn(this, null, x, y, e);
        }
    };
    //-- Upload content dropped on the page and create a Faust DSP with it
    App.prototype.uploadOn = function (app, module, x, y, e) {
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
            };
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
            else {
                var files = e.dataTransfer.files; //e.target.files ||
                var file = files[0];
                if (location.host.indexOf("sitepointstatic") >= 0)
                    return;
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
        else {
            app.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
    };
    //Check in Url if the app should be for kids
    App.isAppPedagogique = function () {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true;
        }
        else {
            return false;
        }
    };
    App.baseImg = "img/";
    return App;
})();
//# sourceMappingURL=main.js.map