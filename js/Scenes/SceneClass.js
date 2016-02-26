/*				SCENECLASS.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING THE API OF A GENERIC SCENE

    DEPENDENCIES :
        - ModuleClass.js
        - Main.js
        - Connect.js
*/
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/ModuleClass.ts"/>
/// <reference path="../Connect.ts"/>
/// <reference path="../webaudio-asm-wrapper.d.ts"/>
/// <reference path="../Main.ts"/>
/// <reference path="../App.ts"/>
"use strict";
var Scene = (function () {
    function Scene(identifiant, parent, onload, onunload, sceneView) {
        this.isMute = false;
        //-- Modules contained in the scene
        this.fModuleList = [];
        this.parent = parent;
        this.fSceneContainer = document.createElement("div");
        this.fSceneContainer.id = identifiant;
        if (onload) {
            this.onload = onload;
        }
        if (onunload) {
            this.onunload = onunload;
        }
    }
    /******************CALLBACKS FOR LOADING/UNLOADING SCENE **************/
    Scene.prototype.onload = function (s) { };
    Scene.prototype.onunload = function (s) { };
    Scene.prototype.getSceneContainer = function () { return this.fSceneContainer; };
    /************************* SHOW/HIDE SCENE ***************************/
    Scene.prototype.showScene = function () { this.fSceneContainer.style.visibility = "visible"; };
    Scene.prototype.hideScene = function () { this.fSceneContainer.style.visibility = "hidden"; };
    /*********************** LOAD/UNLOAD SCENE ***************************/
    Scene.prototype.loadScene = function () {
        this.onload(this);
    };
    Scene.prototype.unloadScene = function () {
        this.onunload(this);
    };
    /*********************** MUTE/UNMUTE SCENE ***************************/
    Scene.prototype.muteScene = function () {
        var out = document.getElementById("audioOutput");
        if (out != null) {
            out.audioNode.context.suspend();
            this.isMute = true;
            this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker-mute.png)";
        }
    };
    Scene.prototype.unmuteScene = function () {
        var _this = this;
        console.log("timeIn");
        window.setTimeout(function () { _this.delayedUnmuteScene(); }, 1000);
    };
    Scene.prototype.delayedUnmuteScene = function () {
        console.log("timeout");
        var out = document.getElementById("audioOutput");
        if (out != null) {
            if (out.audioNode.context.resume != undefined) {
                out.audioNode.context.resume();
                this.isMute = false;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker.png)";
            }
        }
    };
    //add listner on the output module to give the user the possibility to mute/onmute the scene
    Scene.prototype.addMuteOutputListner = function (moduleOutput) {
        var _this = this;
        moduleOutput.moduleView.fModuleContainer.ondblclick = function () {
            if (!_this.isMute) {
                _this.muteScene();
            }
            else {
                _this.unmuteScene();
            }
        };
    };
    /******************** HANDLE MODULES IN SCENE ************************/
    Scene.prototype.getModules = function () { return this.fModuleList; };
    Scene.prototype.addModule = function (module) { this.fModuleList.push(module); };
    Scene.prototype.removeModule = function (module, scene) { scene.fModuleList.splice(scene.fModuleList.indexOf(module), 1); };
    Scene.prototype.cleanModules = function () {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i], this);
        }
    };
    /*******************************  PUBLIC METHODS  **********************************/
    Scene.prototype.deleteScene = function () {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    };
    Scene.prototype.integrateSceneInBody = function () {
        document.body.appendChild(this.fSceneContainer);
    };
    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    Scene.prototype.integrateInput = function (callBackIntegrateOutput) {
        var positionInput = this.positionInputModule();
        this.fAudioInput = new ModuleClass(App.idX++, positionInput.x, positionInput.y, "input", this, this.sceneView.inputOutputModuleContainer, this.removeModule);
        var scene = this;
        this.parent.compileFaust("input", "process=_,_;", positionInput.x, positionInput.y, function callback(factory, scene) { scene.integrateAudioInput(factory, scene); });
        this.fAudioInput.addInputOutputNodes();
        callBackIntegrateOutput();
    };
    Scene.prototype.integrateOutput = function (callBackKeepGoingOnWithInit) {
        var positionOutput = this.positionOutputModule();
        var scene = this;
        this.fAudioOutput = new ModuleClass(App.idX++, positionOutput.x, positionOutput.y, "output", this, this.sceneView.inputOutputModuleContainer, this.removeModule);
        this.addMuteOutputListner(this.fAudioOutput);
        this.parent.compileFaust("output", "process=_,_;", positionOutput.x, positionOutput.y, function callback(factory, scene) { scene.integrateAudioOutput(factory, scene); });
        this.fAudioOutput.addInputOutputNodes();
        callBackKeepGoingOnWithInit();
    };
    Scene.prototype.integrateAudioOutput = function (factory, scene) {
        if (scene.fAudioOutput) {
            scene.fAudioOutput.moduleFaust.setSource("process=_,_;");
            scene.fAudioOutput.createDSP(factory);
            scene.parent.activateAudioOutput(scene.fAudioOutput);
        }
    };
    Scene.prototype.integrateAudioInput = function (factory, scene) {
        if (scene.fAudioInput) {
            scene.fAudioInput.moduleFaust.setSource("process=_,_;");
            scene.fAudioInput.createDSP(factory);
            scene.parent.activateAudioInput(scene.parent);
        }
    };
    Scene.prototype.getAudioOutput = function () { return this.fAudioOutput; };
    Scene.prototype.getAudioInput = function () { return this.fAudioInput; };
    /*********************** SAVE/RECALL SCENE ***************************/
    ///////////////////////////////////////////////////
    //not used for now and not seriously typescripted//
    ///////////////////////////////////////////////////
    Scene.prototype.saveScene = function () {
        for (var i = 0; i < this.fModuleList.length; i++) {
            this.fModuleList[i].patchID = String(i + 1);
        }
        this.fAudioOutput.patchID = String(0);
        var json = '{';
        for (var i = 0; i < this.fModuleList.length; i++) {
            if (i != 0)
                json += ',';
            json += '"' + this.fModuleList[i].patchID.toString() + '":[';
            json += '{"x":"' + this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().left + '"},';
            json += '{"y\":"' + this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().top + '"},';
            json += '{"name\":"' + this.fModuleList[i].moduleFaust.getName() + '"},';
            json += '{"code":' + JSON.stringify(this.fModuleList[i].moduleFaust.getSource()) + '},';
            var inputs = this.fModuleList[i].moduleFaust.getInputConnections();
            if (inputs) {
                json += '{"inputs":[';
                for (var j = 0; j < inputs.length; j++) {
                    if (j != 0)
                        json += ',';
                    json += '{"src":"' + inputs[j].source.patchID.toString() + '"}';
                }
                json += ']},';
            }
            var outputs = this.fModuleList[i].moduleFaust.getOutputConnections();
            if (outputs) {
                json += '{"outputs":[';
                for (var j = 0; j < outputs.length; j++) {
                    if (j != 0)
                        json += ',';
                    json += '{"dst":"' + outputs[j].destination.patchID.toString() + '"}';
                }
                json += ']},';
            }
            var params = this.fModuleList[i].moduleFaust.getDSP().controls();
            if (params) {
                json += '{"params":[';
                for (var j = 0; j < params.length; j++) {
                    if (j != 0)
                        json += ',';
                    json += '{"path":"' + params[j] + '"},';
                    json += '{"value":"' + this.fModuleList[i].moduleFaust.getDSP().getValue(params[j]) + '"}';
                }
                json += ']}';
            }
            json += ']';
        }
        json += '}';
        // 	console.log(json);
        return json;
    };
    Scene.prototype.recallScene = function (json) {
        this.parent.currentNumberDSP = this.fModuleList.length;
        var data = JSON.parse(json);
        for (var sel in data) {
            var dataCopy = data[sel];
            var newsel;
            var name, code, x, y;
            for (newsel in dataCopy) {
                var mainData = dataCopy[newsel];
                if (mainData["name"])
                    name = mainData["name"];
                else if (mainData["code"])
                    code = mainData["code"];
                else if (mainData["x"])
                    x = mainData["x"];
                else if (mainData["y"])
                    y = mainData["y"];
                else if (mainData["inputs"])
                    this.parent.inputs = mainData["inputs"];
                else if (mainData["outputs"])
                    this.parent.outputs = mainData["outputs"];
                else if (mainData["params"])
                    this.parent.params = mainData["params"];
            }
            this.parent.compileFaust(name, code, x, y, this.createModuleAndConnectIt);
        }
    };
    Scene.prototype.createModuleAndConnectIt = function (factory) {
        //---- This is very similar to "createFaustModule" from App.js
        //---- But as we need to set Params before calling "createFaustInterface", it is copied
        //---- There probably is a better way to do this !!
        if (!factory) {
            alert(faust.getErrorMessage());
            return;
        }
        var faustModule = new ModuleClass(App.idX++, this.parent.tempModuleX, this.parent.tempModuleY, window.name, this, document.getElementById("modules"), this.removeModule);
        faustModule.moduleFaust.setSource(this.parent.tempModuleSourceCode);
        faustModule.createDSP(factory);
        if (this.parent.params) {
            for (var i = 0; i < this.parent.params.length; i++) {
                //console.log("WINDOW.PARAMS");
                //console.log(this.parent.params.length);
                if (this.parent.params[i] && this.parent.params[i + 1]) {
                    faustModule.addInterfaceParam(this.parent.params[i]["path"], this.parent.params[i + 1]["value"]);
                    i + 1;
                }
            }
        }
        faustModule.recallInterfaceParams();
        faustModule.createFaustInterface();
        faustModule.addInputOutputNodes();
        this.addModule(faustModule);
        // WARNING!!!!! Not right in an asynchroneous call of this.parent.compileFaust
        if (this.parent.inputs) {
            for (var i = 0; i < this.parent.inputs.length; i++) {
                var src = this.getModules()[this.parent.inputs[i]["src"] - 1 + this.parent.currentNumberDSP];
                if (src)
                    var connector = new Connector();
                connector.createConnection(src, src.moduleView.getOutputNode(), faustModule, faustModule.moduleView.getInputNode());
            }
        }
        if (this.parent.outputs) {
            for (var i = 0; i < this.parent.outputs.length; i++) {
                var dst = this.getModules()[this.parent.outputs[i]["dst"] + this.parent.currentNumberDSP - 1];
                var connector = new Connector();
                if (this.parent.outputs[i]["dst"] == 0)
                    connector.createConnection(faustModule, faustModule.moduleView.getOutputNode(), this.fAudioOutput, this.fAudioOutput.moduleView.getInputNode());
                else if (dst)
                    connector.createConnection(faustModule, faustModule.moduleView.getOutputNode(), dst, dst.moduleView.getInputNode());
            }
        }
    };
    /***************** SET POSITION OF INPUT OUTPUT MODULE ***************/
    Scene.prototype.positionInputModule = function () {
        var position = new PositionModule();
        position.x = 10;
        position.y = window.innerHeight / 2;
        return position;
    };
    Scene.prototype.positionOutputModule = function () {
        var position = new PositionModule();
        position.x = window.innerWidth - 98;
        position.y = window.innerHeight / 2;
        return position;
    };
    Scene.sceneName = "Patch";
    return Scene;
})();
//# sourceMappingURL=SceneClass.js.map