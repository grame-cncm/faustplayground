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
/// <reference path="../Messages.ts"/>
"use strict";
var Scene = (function () {
    function Scene(identifiant, parent, compileFaust, sceneView) {
        var _this = this;
        this.arrayRecalScene = [];
        this.arrayRecalledModule = [];
        this.isMute = false;
        //-- Modules contained in the scene
        this.fModuleList = [];
        this.sceneName = "Patch";
        this.isInitLoading = true;
        this.isOutputTouch = false;
        this.compileFaust = compileFaust;
        this.sceneView = new SceneView();
        this.sceneView.initNormalScene(this);
        this.integrateSceneInBody();
        this.integrateOutput();
        document.addEventListener("unstylenode", function () { _this.unstyleNode(); });
    }
    /******************CALLBACKS FOR LOADING/UNLOADING SCENE **************/
    Scene.prototype.onload = function (s) { };
    Scene.prototype.onunload = function (s) { };
    Scene.prototype.getSceneContainer = function () { return this.sceneView.fSceneContainer; };
    /************************* SHOW/HIDE SCENE ***************************/
    Scene.prototype.showScene = function () { this.sceneView.fSceneContainer.style.visibility = "visible"; };
    Scene.prototype.hideScene = function () { this.sceneView.fSceneContainer.style.visibility = "hidden"; };
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
            if (out.audioNode.context.suspend != undefined) {
                out.audioNode.context.suspend();
                this.isMute = true;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker-mute.png)";
            }
        }
    };
    Scene.prototype.unmuteScene = function () {
        var _this = this;
        console.log("timeIn");
        window.setTimeout(function () { _this.delayedUnmuteScene(); }, 500);
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
        moduleOutput.moduleView.fModuleContainer.ontouchstart = function () { _this.dbleTouchOutput(); };
        moduleOutput.moduleView.fModuleContainer.ondblclick = function () { _this.dispatchEventMuteUnmute(); };
    };
    Scene.prototype.dbleTouchOutput = function () {
        var _this = this;
        if (!this.isOutputTouch) {
            this.isOutputTouch = true;
            window.setTimeout(function () { _this.isOutputTouch = false; }, 300);
        }
        else {
            this.dispatchEventMuteUnmute();
            this.isOutputTouch = false;
        }
    };
    Scene.prototype.dispatchEventMuteUnmute = function () {
        if (!this.isMute) {
            this.muteScene();
        }
        else {
            this.unmuteScene();
        }
    };
    /******************** HANDLE MODULES IN SCENE ************************/
    Scene.prototype.getModules = function () { return this.fModuleList; };
    Scene.prototype.addModule = function (module) { this.fModuleList.push(module); };
    Scene.prototype.removeModule = function (module) {
        this.fModuleList.splice(this.fModuleList.indexOf(module), 1);
    };
    Scene.prototype.cleanModules = function () {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i]);
        }
    };
    /*******************************  PUBLIC METHODS  **********************************/
    Scene.prototype.deleteScene = function () {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    };
    Scene.prototype.integrateSceneInBody = function () {
        document.body.appendChild(this.sceneView.fSceneContainer);
    };
    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    Scene.prototype.integrateInput = function () {
        var _this = this;
        var positionInput = this.positionInputModule();
        this.fAudioInput = new ModuleClass(App.idX++, positionInput.x, positionInput.y, "input", this.sceneView.inputOutputModuleContainer, function (module) { _this.removeModule(module); }, this.compileFaust);
        this.fAudioInput.patchID = "input";
        var scene = this;
        this.compileFaust({ name: "input", sourceCode: "process=_,_;", x: positionInput.x, y: positionInput.y, callback: function (factory) { scene.integrateAudioInput(factory); } });
    };
    Scene.prototype.integrateOutput = function () {
        var _this = this;
        var positionOutput = this.positionOutputModule();
        var scene = this;
        this.fAudioOutput = new ModuleClass(App.idX++, positionOutput.x, positionOutput.y, "output", this.sceneView.inputOutputModuleContainer, function (module) { _this.removeModule(module); }, this.compileFaust);
        this.fAudioOutput.patchID = "output";
        this.addMuteOutputListner(this.fAudioOutput);
        this.compileFaust({ name: "output", sourceCode: "process=_,_;", x: positionOutput.x, y: positionOutput.y, callback: function (factory) { scene.integrateAudioOutput(factory); } });
    };
    Scene.prototype.integrateAudioOutput = function (factory) {
        if (this.fAudioOutput) {
            this.fAudioOutput.moduleFaust.setSource("process=_,_;");
            this.fAudioOutput.createDSP(factory);
            this.activateAudioOutput(this.fAudioOutput);
        }
        this.fAudioOutput.addInputOutputNodes();
        this.integrateInput();
    };
    Scene.prototype.integrateAudioInput = function (factory) {
        if (this.fAudioInput) {
            this.fAudioInput.moduleFaust.setSource("process=_,_;");
            this.fAudioInput.createDSP(factory);
            this.activateAudioInput();
        }
        this.fAudioInput.addInputOutputNodes();
        App.hideFullPageLoading();
        this.isInitLoading = false;
    };
    Scene.prototype.getAudioOutput = function () { return this.fAudioOutput; };
    Scene.prototype.getAudioInput = function () { return this.fAudioInput; };
    /********************************************************************
**********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
********************************************************************/
    Scene.prototype.activateAudioInput = function () {
        var _this = this;
        var navigatorLoc = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }
        if (navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia({ audio: true }, function (mediaStream) { _this.getDevice(mediaStream); }, function (e) {
                _this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
                _this.fAudioInput.moduleView.fInterfaceContainer.title = App.messageRessource.errorGettingAudioInput;
                new Message(App.messageRessource.errorGettingAudioInput);
            });
        }
        else {
            this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
            new Message(App.messageRessource.errorInputAPINotAvailable);
            this.fAudioInput.moduleView.fInterfaceContainer.title = App.messageRessource.errorInputAPINotAvailable;
        }
    };
    Scene.prototype.getDevice = function (device) {
        // Create an AudioNode from the stream.
        var src = document.getElementById("input");
        src.audioNode = App.audioContext.createMediaStreamSource(device);
        document.body.appendChild(src);
        var drag = new Drag();
        var connect = new Connector();
        connect.connectInput(this.fAudioInput, src);
    };
    Scene.prototype.activateAudioOutput = function (sceneOutput) {
        var out = document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = App.audioContext.destination;
        document.body.appendChild(out);
        var connect = new Connector();
        connect.connectOutput(sceneOutput, out);
    };
    /*********************** SAVE/RECALL SCENE ***************************/
    Scene.prototype.saveScene = function (isPrecompiled) {
        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                this.fModuleList[i].patchID = String(i + 1);
            }
        }
        var json;
        var jsonObjectCollection = {};
        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                jsonObjectCollection[this.fModuleList[i].patchID.toString()] = new JsonSaveObject();
                var jsonObject = jsonObjectCollection[this.fModuleList[i].patchID.toString()];
                jsonObject.sceneName = this.sceneName;
                jsonObject.patchId = this.fModuleList[i].patchID.toString();
                jsonObject.code = this.fModuleList[i].moduleFaust.getSource();
                jsonObject.name = this.fModuleList[i].moduleFaust.getName();
                jsonObject.x = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().left.toString();
                jsonObject.y = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().top.toString();
                var inputs = this.fModuleList[i].moduleFaust.getInputConnections();
                var jsonInputs = new JsonInputsSave();
                jsonInputs.source = [];
                if (inputs) {
                    for (var j = 0; j < inputs.length; j++) {
                        jsonInputs.source.push(inputs[j].source.patchID.toString());
                    }
                }
                var outputs = this.fModuleList[i].moduleFaust.getOutputConnections();
                var jsonOutputs = new JsonOutputsSave();
                jsonOutputs.destination = [];
                if (outputs) {
                    for (var j = 0; j < outputs.length; j++) {
                        jsonOutputs.destination.push(outputs[j].destination.patchID.toString());
                    }
                }
                var params = this.fModuleList[i].moduleFaust.getDSP().controls();
                var jsonParams = new JsonParamsSave();
                jsonParams.sliders = [];
                if (params) {
                    for (var j = 0; j < params.length; j++) {
                        var jsonSlider = new JsonSliderSave();
                        jsonSlider.path = params[j];
                        jsonSlider.value = this.fModuleList[i].moduleFaust.getDSP().getValue(params[j]);
                        jsonParams.sliders.push(jsonSlider);
                    }
                }
                var faustIControler = this.fModuleList[i].moduleControles;
                var jsonAccs = new JsonAccSaves();
                jsonAccs.controles = [];
                for (var j = 0; j < faustIControler.length; j++) {
                    var jsonAcc = new JsonAccSave();
                    var acc = faustIControler[j].accelerometerSlider;
                    jsonAcc.axis = acc.axis.toString();
                    jsonAcc.curve = acc.curve.toString();
                    jsonAcc.amin = acc.amin.toString();
                    jsonAcc.amid = acc.amid.toString();
                    jsonAcc.amax = acc.amax.toString();
                    jsonAcc.adress = acc.address;
                    jsonAcc.isEnabled = acc.isEnabled;
                    jsonAccs.controles.push(jsonAcc);
                }
                jsonObject.inputs = jsonInputs;
                jsonObject.outputs = jsonOutputs;
                jsonObject.params = jsonParams;
                jsonObject.acc = jsonAccs;
                var factorySave = faust.writeDSPFactoryToMachine(this.fModuleList[i].moduleFaust.factory);
                if (factorySave && isPrecompiled) {
                    jsonObject.factory = new JsonFactorySave();
                    jsonObject.factory.name = factorySave.name;
                    jsonObject.factory.code = factorySave.code;
                }
            }
        }
        json = JSON.stringify(jsonObjectCollection);
        return json;
    };
    Scene.prototype.recallScene = function (json) {
        if (json != null) {
            try {
                var jsonObjectCollection = JSON.parse(json);
            }
            catch (e) {
                new Message(App.messageRessource.errorJsonCorrupted);
                App.hideFullPageLoading();
            }
            //this.parent.currentNumberDSP = this.fModuleList.length;
            for (var index in jsonObjectCollection) {
                var jsonObject = jsonObjectCollection[index];
                this.arrayRecalScene.push(jsonObject);
            }
            this.lunchModuleCreation();
        }
        else {
            App.hideFullPageLoading();
            new Message(App.messageRessource.errorLoading);
        }
    };
    Scene.prototype.lunchModuleCreation = function () {
        var _this = this;
        if (this.arrayRecalScene.length != 0) {
            var jsonObject = this.arrayRecalScene[0];
            if (jsonObject.factory != undefined) {
                this.tempPatchId = jsonObject.patchId;
                var factory = faust.readDSPFactoryFromMachine(jsonObject.factory);
                this.updateAppTempModuleInfo(jsonObject);
                this.sceneName = jsonObject.sceneName;
                this.createModule(factory);
            }
            else if (jsonObject.patchId != "output" && jsonObject.patchId != "input") {
                this.tempPatchId = jsonObject.patchId;
                this.sceneName = jsonObject.sceneName;
                var argumentCompile = { name: jsonObject.name, sourceCode: jsonObject.code, x: parseFloat(jsonObject.x), y: parseFloat(jsonObject.y), callback: function (factory) { _this.createModule(factory); } };
                this.compileFaust(argumentCompile);
            }
            else {
                this.arrayRecalScene.shift();
                this.lunchModuleCreation();
            }
        }
        else {
            for (var i = 0; i < this.arrayRecalledModule.length; i++) {
                this.connectModule(this.arrayRecalledModule[i]);
            }
            for (var i = 0; i < this.arrayRecalledModule.length; i++) {
                delete this.arrayRecalledModule[i].patchID;
            }
            this.arrayRecalledModule = [];
            var event = new CustomEvent("updatename");
            document.dispatchEvent(event);
            App.hideFullPageLoading();
        }
    };
    Scene.prototype.updateAppTempModuleInfo = function (jsonSaveObject) {
        this.tempModuleX = parseFloat(jsonSaveObject.x);
        this.tempModuleY = parseFloat(jsonSaveObject.y);
        this.tempModuleName = jsonSaveObject.name;
        this.tempModuleSourceCode = jsonSaveObject.code;
        this.tempPatchId = jsonSaveObject.patchId;
        this.tempParams = jsonSaveObject.params;
    };
    Scene.prototype.createModule = function (factory) {
        var _this = this;
        try {
            //---- This is very similar to "createFaustModule" from App.js
            //---- But as we need to set Params before calling "createFaustInterface", it is copied
            //---- There probably is a better way to do this !!
            if (!factory) {
                new Message(faust.getErrorMessage());
                App.hideFullPageLoading();
                return;
            }
            var module = new ModuleClass(App.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), function (module) { _this.removeModule(module); }, this.compileFaust);
            module.moduleFaust.setSource(this.tempModuleSourceCode);
            module.createDSP(factory);
            module.patchID = this.tempPatchId;
            if (this.tempParams) {
                for (var i = 0; i < this.tempParams.sliders.length; i++) {
                    //console.log("WINDOW.PARAMS");
                    //console.log(this.parent.params.length);
                    var slider = this.tempParams.sliders[i];
                    module.addInterfaceParam(slider.path, parseFloat(slider.value));
                }
            }
            module.moduleFaust.recallInputsSource = this.arrayRecalScene[0].inputs.source;
            module.moduleFaust.recallOutputsDestination = this.arrayRecalScene[0].outputs.destination;
            this.arrayRecalledModule.push(module);
            module.recallInterfaceParams();
            module.setFaustInterfaceControles();
            module.createFaustInterface();
            module.addInputOutputNodes();
            this.addModule(module);
            this.recallAccValues(this.arrayRecalScene[0].acc, module);
            this.arrayRecalScene.shift();
            this.lunchModuleCreation();
        }
        catch (e) {
            new Message(App.messageRessource.errorCreateModuleRecall);
            this.arrayRecalScene.shift();
            this.lunchModuleCreation();
        }
    };
    Scene.prototype.recallAccValues = function (jsonAccs, module) {
        if (jsonAccs != undefined) {
            for (var i in jsonAccs.controles) {
                var controle = jsonAccs.controles[i];
                if (controle != undefined) {
                    for (var j in module.moduleControles) {
                        var moduleControle = module.moduleControles[j];
                        if (moduleControle.itemParam.address == controle.adress) {
                            var group = moduleControle.faustInterfaceView.group;
                            var slider = moduleControle.faustInterfaceView.slider;
                            var acc = moduleControle.accelerometerSlider;
                            moduleControle.accelerometerSlider.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            moduleControle.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            acc.amax = parseFloat(controle.amax);
                            acc.amid = parseFloat(controle.amid);
                            acc.amin = parseFloat(controle.amin);
                            acc.axis = parseFloat(controle.axis);
                            acc.curve = parseFloat(controle.curve);
                            acc.isEnabled = controle.isEnabled;
                            AccelerometerHandler.curveSplitter(acc);
                            group.className = "control-group";
                            group.classList.add(Axis[controle.axis]);
                            if (!controle.isEnabled) {
                                group.classList.add("disabledAcc");
                                slider.classList.add("allowed");
                                slider.classList.remove("not-allowed");
                                slider.disabled = false;
                            }
                            else {
                                if (acc.isActive) {
                                    slider.classList.add("not-allowed");
                                    slider.classList.remove("allowed");
                                    slider.disabled = true;
                                }
                                else {
                                    slider.classList.add("allowed");
                                    slider.classList.remove("not-allowed");
                                    slider.disabled = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    Scene.prototype.connectModule = function (module) {
        try {
            for (var i = 0; i < module.moduleFaust.recallInputsSource.length; i++) {
                var moduleSource = this.getModuleByPatchId(module.moduleFaust.recallInputsSource[i]);
                if (moduleSource != null) {
                    var connector = new Connector();
                    connector.createConnection(moduleSource, moduleSource.moduleView.getOutputNode(), module, module.moduleView.getInputNode());
                }
            }
            for (var i = 0; i < module.moduleFaust.recallOutputsDestination.length; i++) {
                var moduleDestination = this.getModuleByPatchId(module.moduleFaust.recallOutputsDestination[i]);
                if (moduleDestination != null) {
                    var connector = new Connector();
                    connector.createConnection(module, module.moduleView.getOutputNode(), moduleDestination, moduleDestination.moduleView.getInputNode());
                }
            }
        }
        catch (e) {
            new Message(App.messageRessource.errorConnectionRecall);
        }
    };
    Scene.prototype.getModuleByPatchId = function (patchId) {
        if (patchId == "output") {
            return this.fAudioOutput;
        }
        else if (patchId == "input") {
            return this.fAudioInput;
        }
        else {
            var arrayModules = this.getModules();
            for (var i = 0; i < arrayModules.length; i++) {
                if (arrayModules[i].patchID == patchId) {
                    return arrayModules[i];
                }
            }
        }
        return null;
    };
    Scene.cleanName = function (newName) {
        newName = App.replaceAll(newName, "é", "e");
        newName = App.replaceAll(newName, "è", "e");
        newName = App.replaceAll(newName, "à", "a");
        newName = App.replaceAll(newName, "ù", "u");
        newName = App.replaceAll(newName, " ", "_");
        newName = App.replaceAll(newName, "'", "_");
        return newName;
    };
    Scene.isNameValid = function (newName) {
        var pattern = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");
        if (pattern.test(newName)) {
            return true;
        }
        else {
            return false;
        }
    };
    Scene.rename = function (input, spanRule, spanDynamic) {
        var newName = input.value;
        newName = Scene.cleanName(newName);
        if (Scene.isNameValid(newName)) {
            Utilitary.currentScene.sceneName = newName;
            spanDynamic.textContent = Utilitary.currentScene.sceneName;
            spanRule.style.opacity = "0.6";
            input.style.boxShadow = "0 0 0 green inset";
            input.style.border = "none";
            input.value = Utilitary.currentScene.sceneName;
            var event = new CustomEvent("updatename");
            document.dispatchEvent(event);
            return true;
        }
        else {
            spanRule.style.opacity = "1";
            input.style.boxShadow = "0 0 6px yellow inset";
            input.style.border = "3px solid red";
            new Message(App.messageRessource.invalidSceneName);
            return false;
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
    Scene.prototype.positionDblTapModule = function () {
        var position = new PositionModule();
        position.x = window.innerWidth / 2;
        position.y = window.innerHeight / 2;
        return position;
    };
    Scene.prototype.unstyleNode = function () {
        var modules = this.getModules();
        modules.push(this.fAudioInput);
        modules.push(this.fAudioOutput);
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].moduleView.fInputNode) {
                modules[i].moduleView.fInputNode.style.border = "none";
                modules[i].moduleView.fInputNode.style.left = "-16px";
                modules[i].moduleView.fInputNode.style.marginTop = "-18px";
            }
            if (modules[i].moduleView.fOutputNode) {
                modules[i].moduleView.fOutputNode.style.border = "none";
                modules[i].moduleView.fOutputNode.style.right = "-16px";
                modules[i].moduleView.fOutputNode.style.marginTop = "-18px";
            }
        }
        ModuleClass.isNodesModuleUnstyle = true;
    };
    return Scene;
}());
var JsonSaveCollection = (function () {
    function JsonSaveCollection() {
    }
    return JsonSaveCollection;
}());
var JsonSaveObject = (function () {
    function JsonSaveObject() {
    }
    return JsonSaveObject;
}());
var JsonOutputsSave = (function () {
    function JsonOutputsSave() {
    }
    return JsonOutputsSave;
}());
var JsonInputsSave = (function () {
    function JsonInputsSave() {
    }
    return JsonInputsSave;
}());
var JsonParamsSave = (function () {
    function JsonParamsSave() {
    }
    return JsonParamsSave;
}());
var JsonAccSaves = (function () {
    function JsonAccSaves() {
    }
    return JsonAccSaves;
}());
var JsonAccSave = (function () {
    function JsonAccSave() {
    }
    return JsonAccSave;
}());
var JsonSliderSave = (function () {
    function JsonSliderSave() {
    }
    return JsonSliderSave;
}());
var JsonFactorySave = (function () {
    function JsonFactorySave() {
    }
    return JsonFactorySave;
}());
//# sourceMappingURL=SceneClass.js.map