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
/// <reference path="../main.ts"/>


"use strict";



class Scene {
    parent: App;
    //-- Graphical Scene container
    fSceneContainer: HTMLDivElement;
    //-- Audio Input/Output
    fAudioOutput: ModuleClass;
    fAudioInput: ModuleClass;
    //-- Modules contained in the scene
    fModuleList: ModuleClass[]=[];

    onload(s: Scene) { }
    onunload(s: Scene) { }
    audioInput(): Object {
        return null;
    }
    getSceneContainer(): HTMLDivElement { return this.fSceneContainer; }


    constructor(identifiant: string, parent: App, onload?: (s: Scene) => void, onunload?: (s: Scene) => void) {
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

    

    /************************* SHOW/HIDE SCENE ***************************/
    showScene() { this.fSceneContainer.style.visibility = "visible"; }
    hideScene() { this.fSceneContainer.style.visibility = "hidden"; }
    /*********************** LOAD/UNLOAD SCENE ***************************/
    loadScene() {
        this.onload(this);
    }
    unloadScene() {
        this.onunload(this)
    }
    /*********************** MUTE/UNMUTE SCENE ***************************/
    muteScene() {
        var out = document.getElementById("audioOutput");
        var connect: Connect = new Connect();
        connect.disconnectModules(this.fAudioOutput, out);
    }
    unmuteScene (){
        var out = document.getElementById("audioOutput");
        var connect: Connect = new Connect();
        connect.connectModules(this.fAudioOutput, out);
    }
    /******************** HANDLE MODULES IN SCENE ************************/
    getModules() { return this.fModuleList; }
    addModule(module: ModuleClass) { this.fModuleList.push(module); }
    removeModule(module: ModuleClass, scene: Scene) { scene.fModuleList.splice(scene.fModuleList.indexOf(module), 1); }
	
    cleanModules () {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i],this);
        }
    }
    /*******************************  PUBLIC METHODS  **********************************/
    deleteScene() {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    }
    
    integrateSceneInBody() {
        document.body.appendChild(this.fSceneContainer);
    }

    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput(afterWork) {

        this.fAudioInput = new ModuleClass(App.idX++, 0, 0, "input", this, this.fSceneContainer, function () { this.removeModule() });
        this.fAudioInput.hideModule();

        this.parent.compileFaust("input", "process=_,_;", 0, 0, this.integrateAudioInput);
        afterWork();
    }
    integrateOutput(afterWork) {

        this.fAudioOutput = new ModuleClass(App.idX++, 0, 0, "output", this, this.fSceneContainer, function () { this.removeModule });
        this.fAudioOutput.hideModule();
        this.parent.compileFaust("output", "process=_,_;", 0, 0, this.integrateAudioOutput);

        afterWork();
    }

    integrateAudioOutput(factory,scene:Scene) {
        if (scene.fAudioOutput) {
            scene.fAudioOutput.setSource("process=_,_;");
            scene.fAudioOutput.createDSP(factory);
            scene.parent.activateAudioOutput(document.getElementById("sceneOutput"));
        }
    }
    integrateAudioInput(factory, scene: Scene) {
        if (scene.fAudioInput) {
            scene.fAudioInput.setSource("process=_,_;");
            scene.fAudioInput.createDSP(factory);
            scene.parent.activateAudioInput();
        }
    }
	
    getAudioOutput() { return this.fAudioOutput; }
    getAudioInput() { return this.fAudioInput; }
     

    /*********************** SAVE/RECALL SCENE ***************************/
    saveScene() {

        for (var i = 0; i < this.fModuleList.length; i++) {
            this.fModuleList[i].patchID = String(i + 1);
        }

        this.fAudioOutput.patchID = String(0);

        var json = '{';

        for (var i = 0; i < this.fModuleList.length; i++) {
            if (i != 0)
                json += ',';

            json += '"' + this.fModuleList[i].patchID.toString() + '":['

            json += '{"x":"' + this.fModuleList[i].getModuleContainer().getBoundingClientRect().left + '"},';
            json += '{"y\":"' + this.fModuleList[i].getModuleContainer().getBoundingClientRect().top + '"},';
            json += '{"name\":"' + this.fModuleList[i].getName() + '"},';
            json += '{"code":' + JSON.stringify(this.fModuleList[i].getSource()) + '},';

            var inputs = this.fModuleList[i].getInputConnections();

            if (inputs) {

                json += '{"inputs":[';
                for (var j = 0; j < inputs.length; j++) {
                    if (j != 0)
                        json += ',';

                    json += '{"src":"' + inputs[j].source.patchID.toString() + '"}';
                }
                json += ']},';
            }

            var outputs = this.fModuleList[i].getOutputConnections();
            if (outputs) {
                json += '{"outputs":[';

                for (var j = 0; j < outputs.length; j++) {
                    if (j != 0)
                        json += ',';

                    json += '{"dst":"' + outputs[j].destination.patchID.toString() + '"}';
                }

                json += ']},';
            }

            var params = this.fModuleList[i].getDSP().controls();
            if (params) {
                json += '{"params":[';

                for (var j = 0; j < params.length; j++) {
                    if (j != 0)
                        json += ',';

                    json += '{"path":"' + params[j] + '"},';
                    json += '{"value":"' + this.fModuleList[i].getDSP().getValue(params[j]) + '"}';
                }

                json += ']}';
            }

            json += ']';
        }

        json += '}';
        
        // 	console.log(json);
        return json;
    }
    
    recallScene(json) {

        this.parent.currentNumberDSP = this.fModuleList.length;
        var data = JSON.parse(json);
        var sel;

        for (sel in data) {

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
    }
	
    createModuleAndConnectIt(factory) {

        //---- This is very similar to "createFaustModule" from Main.js
        //---- But as we need to set Params before calling "createFaustInterface", it is copied
        //---- There probably is a better way to do this !!
        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }

        var faustModule = new ModuleClass(App.idX++, this.parent.tempModuleX, this.parent.tempModuleY, window.name,this, document.getElementById("modules"), this.removeModule);
        faustModule.setSource(this.parent.tempModuleSourceCode);
        faustModule.createDSP(factory);

        if (this.parent.params) {
            for (var i = 0; i < this.parent.params.length; i++) {
                //console.log("WINDOW.PARAMS");
                //console.log(this.parent.params.length);
                if (this.parent.params[i] && this.parent.params[i + 1]) {
                    faustModule.addParam(this.parent.params[i]["path"], this.parent.params[i + 1]["value"]);
                    i + 1;
                }
            }
        }

        faustModule.recallParams();
        faustModule.createFaustInterface();
        faustModule.addInputOutputNodes();
        this.addModule(faustModule);
	
        // WARNING!!!!! Not right in an asynchroneous call of this.parent.compileFaust
        if (this.parent.inputs) {
            for (var i = 0; i < this.parent.inputs.length; i++) {
                var src = this.getModules()[this.parent.inputs[i]["src"] - 1 + this.parent.currentNumberDSP];
                if (src)
                    var connect: Connect = new Connect();
                    connect.createConnection(src, src.getOutputNode(), faustModule, faustModule.getInputNode());
            }
        }

        if (this.parent.outputs) {
            for (var i = 0; i < this.parent.outputs.length; i++) {
                var dst = this.getModules()[this.parent.outputs[i]["dst"] + this.parent.currentNumberDSP - 1];
                var connect: Connect = new Connect();
                if (this.parent.outputs[i]["dst"] == 0)
                    connect.createConnection(faustModule, faustModule.getOutputNode(), this.fAudioOutput, this.fAudioOutput.getInputNode());
                else if (dst)
                    connect.createConnection(faustModule, faustModule.getOutputNode(), dst, dst.getInputNode());
            }
        }
    }
}

