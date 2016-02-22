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



class Scene {

    parent: App;
    //-- Audio Input/Output
    fAudioOutput: ModuleClass;
    fAudioInput: ModuleClass;
    //-- Modules contained in the scene
    private fModuleList: ModuleClass[] = [];
    //-- Graphical Scene container
    private fSceneContainer: HTMLDivElement;
    sceneView: SceneView;
    menu: Menu;
    static sceneName: string = "Patch";

    


    constructor(identifiant: string, parent: App, onload?: (s: Scene) => void, onunload?: (s: Scene) => void, sceneView?: SceneView) {
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

    private onload(s: Scene) { }
    private onunload(s: Scene) { }


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
    muteScene(): void {
        var out: IHTMLDivElementOut = <IHTMLDivElementOut>document.getElementById("audioOutput");
        out.audioNode.context.suspend();
    }
    unmuteScene(): void {
        var out: IHTMLDivElementOut = <IHTMLDivElementOut>document.getElementById("audioOutput");
        out.audioNode.context.resume();
    }
    /******************** HANDLE MODULES IN SCENE ************************/
    getModules(): ModuleClass[] { return this.fModuleList; }
    addModule(module: ModuleClass): void { this.fModuleList.push(module); }
    removeModule(module: ModuleClass, scene: Scene):void { scene.fModuleList.splice(scene.fModuleList.indexOf(module), 1); }
	
    private cleanModules():void {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i],this);
        }
    }
    /*******************************  PUBLIC METHODS  **********************************/
    private deleteScene():void {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    }
    
    integrateSceneInBody():void {
        document.body.appendChild(this.fSceneContainer);
    }

    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput(callBackIntegrateOutput: () => void) {
        var positionInput: PositionModule = this.positionInputModule();
        this.fAudioInput = new ModuleClass(App.idX++, positionInput.x, positionInput.y, "input", this, this.sceneView.inputOutputModuleContainer, this.removeModule);
        //this.fAudioInput.hideModule();
        var scene: Scene = this;
        this.parent.compileFaust("input", "process=_,_;", positionInput.x, positionInput.y, function callback(factory, scene) { scene.integrateAudioInput(factory, scene) });
        this.fAudioInput.addInputOutputNodes();
        callBackIntegrateOutput();
    }
    integrateOutput(callBackKeepGoingOnWithInit: (sceneView?: SceneView) => void) {
        var positionOutput: PositionModule = this.positionOutputModule();
        var scene: Scene = this;
        this.fAudioOutput = new ModuleClass(App.idX++, positionOutput.x, positionOutput.y, "output", this, this.sceneView.inputOutputModuleContainer, this.removeModule);
        
        //this.fAudioOutput.hideModule()
        this.parent.compileFaust("output", "process=_,_;", positionOutput.x, positionOutput.y, function callback(factory, scene) { scene.integrateAudioOutput(factory, scene) });
        this.fAudioOutput.addInputOutputNodes();
        callBackKeepGoingOnWithInit();
    }

    private integrateAudioOutput(factory: Factory, scene: Scene): void {
        if (scene.fAudioOutput) {
            scene.fAudioOutput.moduleFaust.setSource("process=_,_;");
            scene.fAudioOutput.createDSP(factory);
            scene.parent.activateAudioOutput(scene.fAudioOutput);
        }
    }
    private integrateAudioInput(factory: Factory, scene: Scene):void {
        if (scene.fAudioInput) {
            scene.fAudioInput.moduleFaust.setSource("process=_,_;");
            scene.fAudioInput.createDSP(factory);
            scene.parent.activateAudioInput(scene.parent);
        }
    }

    getAudioOutput(): ModuleClass { return this.fAudioOutput; }
    getAudioInput(): ModuleClass { return this.fAudioInput; }
     
    /*********************** INITIALISE MENU *****************************/
    initMenu(menuContainer) {
        this.menu = new Menu(menuContainer);

    }

    /*********************** SAVE/RECALL SCENE ***************************/
    ///////////////////////////////////////////////////
    //not used for now and not seriously typescripted//
    ///////////////////////////////////////////////////

    private saveScene():string {

        for (var i = 0; i < this.fModuleList.length; i++) {
            this.fModuleList[i].patchID = String(i + 1);
        }

        this.fAudioOutput.patchID = String(0);

        var json:string = '{';

        for (var i = 0; i < this.fModuleList.length; i++) {
            if (i != 0)
                json += ',';

            json += '"' + this.fModuleList[i].patchID.toString() + '":['

            json += '{"x":"' + this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().left + '"},';
            json += '{"y\":"' + this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().top + '"},';
            json += '{"name\":"' + this.fModuleList[i].moduleFaust.getName() + '"},';
            json += '{"code":' + JSON.stringify(this.fModuleList[i].moduleFaust.getSource()) + '},';

            var inputs: Connector[] = this.fModuleList[i].moduleFaust.getInputConnections();

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
	
    private createModuleAndConnectIt(factory:Factory):void {

        //---- This is very similar to "createFaustModule" from App.js
        //---- But as we need to set Params before calling "createFaustInterface", it is copied
        //---- There probably is a better way to do this !!
        if (!factory) {
            alert(faust.getErrorMessage());
            return;
        }

        var faustModule: ModuleClass = new ModuleClass(App.idX++, this.parent.tempModuleX, this.parent.tempModuleY, window.name, this, document.getElementById("modules"), this.removeModule);
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
                    var connector: Connector = new Connector();
                connector.createConnection(src, src.moduleView.getOutputNode(), faustModule, faustModule.moduleView.getInputNode());
            }
        }

        if (this.parent.outputs) {
            for (var i = 0; i < this.parent.outputs.length; i++) {
                var dst = this.getModules()[this.parent.outputs[i]["dst"] + this.parent.currentNumberDSP - 1];
                var connector: Connector = new Connector();
                if (this.parent.outputs[i]["dst"] == 0)
                    connector.createConnection(faustModule, faustModule.moduleView.getOutputNode(), this.fAudioOutput, this.fAudioOutput.moduleView.getInputNode());
                else if (dst)
                    connector.createConnection(faustModule, faustModule.moduleView.getOutputNode(), dst, dst.moduleView.getInputNode());
            }
        }
    }
    positionInputModule(): PositionModule {
        var position: PositionModule = new PositionModule();
        position.x = 10;
        position.y = window.innerHeight / 2;
        return position
    }
    positionOutputModule(): PositionModule {
        var position: PositionModule = new PositionModule();
        position.x = window.innerWidth - 98;
        position.y = window.innerHeight / 2;
        return position
    }
}

