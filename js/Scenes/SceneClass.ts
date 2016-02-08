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

    
    getSceneContainer(): HTMLDivElement { return this.fSceneContainer; }

    /************************* SHOW/HIDE SCENE ***************************/
    showScene(): void { this.fSceneContainer.style.visibility = "visible"; }
    hideScene(): void { this.fSceneContainer.style.visibility = "hidden"; }
    /*********************** LOAD/UNLOAD SCENE ***************************/
    loadScene(): void {
        this.onload(this);
    }
    unloadScene():void {
        this.onunload(this)
    }
    /*********************** MUTE/UNMUTE SCENE ***************************/
    muteScene():void {
        var out = document.getElementById("audioOutput");
        var connect: Connect = new Connect();
        connect.disconnectModules(this.fAudioOutput, out);
    }
    unmuteScene(): void {
        var out = document.getElementById("audioOutput");
        var connect: Connect = new Connect();
        connect.connectModules(this.fAudioOutput, out);
    }
    /******************** HANDLE MODULES IN SCENE ************************/
    getModules(): ModuleClass[] { return this.fModuleList; }
    addModule(module: ModuleClass): void { this.fModuleList.push(module); }
    removeModule(module: ModuleClass, scene: Scene):void { scene.fModuleList.splice(scene.fModuleList.indexOf(module), 1); }
	
    cleanModules():void {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i],this);
        }
    }
    /*******************************  PUBLIC METHODS  **********************************/
    deleteScene():void {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    }
    
    integrateSceneInBody():void {
        document.body.appendChild(this.fSceneContainer);
    }

    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput(callBackIntegrateOutput:()=>void) {

        this.fAudioInput = new ModuleClass(App.idX++, 0, 0, "input", this, this.fSceneContainer,  this.removeModule);
        this.fAudioInput.hideModule();
        var scene: Scene = this;
        this.parent.compileFaust("input", "process=_,_;", 0, 0, function callback (factory, scene) { scene.integrateAudioInput(factory,scene) });
        callBackIntegrateOutput();
    }
    integrateOutput(callBackKeepGoingOnWithInit: (sceneView?: ScenePlaygroundView) => void) {
        var scene: Scene = this;
        this.fAudioOutput = new ModuleClass(App.idX++, 0, 0, "output", this, this.fSceneContainer, this.removeModule );
        this.fAudioOutput.hideModule();
        this.parent.compileFaust("output", "process=_,_;", 0, 0, function callback (factory, scene) { scene.integrateAudioOutput(factory,scene) });

        callBackKeepGoingOnWithInit();
    }

    integrateAudioOutput(factory: Factory, scene: Scene): void {
        if (App.isPedagogie) {
            scene = scene.parent.scenes[1];
        }
        if (scene.fAudioOutput) {
            scene.fAudioOutput.setSource("process=_,_;");
            scene.fAudioOutput.createDSP(factory);
            scene.parent.activateAudioOutput(document.getElementById("sceneOutput"));
        }
    }
    integrateAudioInput(factory: Factory, scene: Scene):void {
        if (scene.fAudioInput) {
            scene.fAudioInput.setSource("process=_,_;");
            scene.fAudioInput.createDSP(factory);
            scene.parent.activateAudioInput(scene.parent);
        }
    }

    getAudioOutput(): ModuleClass { return this.fAudioOutput; }
    getAudioInput(): ModuleClass { return this.fAudioInput; }
     

    /*********************** SAVE/RECALL SCENE ***************************/
    ///////////////////////////////////////////////////
    //not used for now and not seriously typescripted//
    ///////////////////////////////////////////////////

    saveScene():string {

        for (var i = 0; i < this.fModuleList.length; i++) {
            this.fModuleList[i].patchID = String(i + 1);
        }

        this.fAudioOutput.patchID = String(0);

        var json:string = '{';

        for (var i = 0; i < this.fModuleList.length; i++) {
            if (i != 0)
                json += ',';

            json += '"' + this.fModuleList[i].patchID.toString() + '":['

            json += '{"x":"' + this.fModuleList[i].getModuleContainer().getBoundingClientRect().left + '"},';
            json += '{"y\":"' + this.fModuleList[i].getModuleContainer().getBoundingClientRect().top + '"},';
            json += '{"name\":"' + this.fModuleList[i].getName() + '"},';
            json += '{"code":' + JSON.stringify(this.fModuleList[i].getSource()) + '},';

            var inputs: Connector[] = this.fModuleList[i].getInputConnections();

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

    recallScene(json: string):void {

        this.parent.currentNumberDSP = this.fModuleList.length;
        var data: JSON = JSON.parse(json);
        for (var sel in data) {

            var dataCopy = data[sel];

            var newsel;
            var name: string, code: string, x: number, y: number;

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
	
    createModuleAndConnectIt(factory:Factory):void {

        //---- This is very similar to "createFaustModule" from Main.js
        //---- But as we need to set Params before calling "createFaustInterface", it is copied
        //---- There probably is a better way to do this !!
        if (!factory) {
            alert(faust.getErrorMessage());
            return;
        }

        var faustModule: ModuleClass = new ModuleClass(App.idX++, this.parent.tempModuleX, this.parent.tempModuleY, window.name, this, document.getElementById("modules"), this.removeModule);
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

