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
interface CompileFaust {
    name: string,
    sourceCode: string,
    x: number,
    y: number,
    callback: (factory: Factory) => void
}

class Scene {
    arrayRecalScene: JsonSaveObject[] = [];
    arrayRecalledModule: ModuleClass[] = [];
    isMute: boolean = false;
    //-- Audio Input/Output
    fAudioOutput: ModuleClass;
    fAudioInput: ModuleClass;
    //-- Modules contained in the scene
    private fModuleList: ModuleClass[] = [];
    //-- Graphical Scene container
    sceneView: SceneView;
    sceneName: string = "Patch";
    isInitLoading: boolean = true;
    isOutputTouch: boolean = false;
    eventEditAcc: (event: Event) => void;
    tempModuleName: string;
    tempPatchId: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    tempParams: IJsonParamsSave;
    compileFaust: (compile: CompileFaust) => void
    
    


    constructor(identifiant: string, parent: App, compileFaust: (compileFaust: CompileFaust) => void, sceneView?: SceneView) {
        this.compileFaust = compileFaust;
        this.sceneView = new SceneView();
        this.sceneView.initNormalScene(this)
        this.integrateSceneInBody();
        this.integrateOutput();
        document.addEventListener("unstylenode", () => { this.unstyleNode() });

    }
   /******************CALLBACKS FOR LOADING/UNLOADING SCENE **************/

    private onload(s: Scene) { }
    private onunload(s: Scene) { }


    getSceneContainer(): HTMLDivElement { return this.sceneView.fSceneContainer; }

    /************************* SHOW/HIDE SCENE ***************************/
    showScene(): void { this.sceneView.fSceneContainer.style.visibility = "visible"; }
    hideScene(): void { this.sceneView.fSceneContainer.style.visibility = "hidden"; }
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
        
        if (out != null) {
            if (out.audioNode.context.suspend != undefined) {//because of Edge not supporting audioContext.suspend() yet
                out.audioNode.context.suspend();
                this.isMute = true;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker-mute.png)"
            }
        }
    }
    unmuteScene(): void {
        console.log("timeIn");
        window.setTimeout(() => { this.delayedUnmuteScene() }, 500)
    }

    delayedUnmuteScene() {//because of probable Firefox bug with audioContext.resume() when resume to close from suspend
        console.log("timeout")
        var out: IHTMLDivElementOut = <IHTMLDivElementOut>document.getElementById("audioOutput");

        if (out != null) {
            if (out.audioNode.context.resume != undefined) {//because of Edge not supporting audioContext.resume() yet
                out.audioNode.context.resume();
                this.isMute = false;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker.png)"

            }
        }
    }
    //add listner on the output module to give the user the possibility to mute/onmute the scene
    addMuteOutputListner(moduleOutput: ModuleClass) {
        moduleOutput.moduleView.fModuleContainer.ontouchstart = () => { this.dbleTouchOutput() }
        moduleOutput.moduleView.fModuleContainer.ondblclick = () => { this.dispatchEventMuteUnmute()}
    }

    dbleTouchOutput() {
        if (!this.isOutputTouch) {
            this.isOutputTouch = true;
            window.setTimeout(() => { this.isOutputTouch = false }, 300)
        } else {
            this.dispatchEventMuteUnmute();
            this.isOutputTouch = false;
        }
    }
    dispatchEventMuteUnmute() {
        if (!this.isMute) {
            this.muteScene()
        } else {
            this.unmuteScene()
        }
    }
    /******************** HANDLE MODULES IN SCENE ************************/
    getModules(): ModuleClass[] { return this.fModuleList; }
    addModule(module: ModuleClass): void { this.fModuleList.push(module); }
    removeModule(module: ModuleClass): void {
        this.fModuleList.splice(this.fModuleList.indexOf(module), 1);

    }
	
    private cleanModules():void {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i]);
        }
    }
    /*******************************  PUBLIC METHODS  **********************************/
    private deleteScene():void {
        this.cleanModules();
        this.hideScene();
        this.muteScene();
    }
    
    integrateSceneInBody(): void {
        document.body.appendChild(this.sceneView.fSceneContainer);
    }

    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput() {
        var positionInput: PositionModule = this.positionInputModule();
        this.fAudioInput = new ModuleClass(App.idX++, positionInput.x, positionInput.y, "input", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module) }, this.compileFaust);
        this.fAudioInput.patchID = "input";
        var scene: Scene = this;
        this.compileFaust({ name:"input", sourceCode:"process=_,_;", x:positionInput.x, y:positionInput.y, callback:(factory)=>{ scene.integrateAudioInput(factory) }});
        
    }
    integrateOutput() {
        var positionOutput: PositionModule = this.positionOutputModule();
        var scene: Scene = this;
        this.fAudioOutput = new ModuleClass(App.idX++, positionOutput.x, positionOutput.y, "output", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module) }, this.compileFaust);
        this.fAudioOutput.patchID = "output";
        this.addMuteOutputListner(this.fAudioOutput);
        this.compileFaust({ name: "output", sourceCode: "process=_,_;", x: positionOutput.x, y: positionOutput.y, callback: (factory) => { scene.integrateAudioOutput(factory) } });
    }

    private integrateAudioOutput(factory: Factory): void {
        
        if (this.fAudioOutput) {
            this.fAudioOutput.moduleFaust.setSource("process=_,_;");
            this.fAudioOutput.createDSP(factory);
            this.activateAudioOutput(this.fAudioOutput);
        }
        this.fAudioOutput.addInputOutputNodes();
        this.integrateInput();
    }
    private integrateAudioInput(factory: Factory): void {
        if (this.fAudioInput) {
            this.fAudioInput.moduleFaust.setSource("process=_,_;");
            this.fAudioInput.createDSP(factory);
            this.activateAudioInput();
        }
        this.fAudioInput.addInputOutputNodes();
        App.hideFullPageLoading();
        this.isInitLoading = false;
    }

    getAudioOutput(): ModuleClass { return this.fAudioOutput; }
    getAudioInput(): ModuleClass { return this.fAudioInput; }

    /********************************************************************
**********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
********************************************************************/

    activateAudioInput(): void {

        var navigatorLoc: Navigator = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }

        if (navigatorLoc.getUserMedia) {

            navigatorLoc.getUserMedia({ audio: true }, (mediaStream) => { this.getDevice(mediaStream) },  (e)=>{
                this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)"
                this.fAudioInput.moduleView.fInterfaceContainer.title = App.messageRessource.errorGettingAudioInput;
                new Message(App.messageRessource.errorGettingAudioInput);
            });
        } else {
            this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)"
            new Message(App.messageRessource.errorInputAPINotAvailable);
            this.fAudioInput.moduleView.fInterfaceContainer.title = App.messageRessource.errorInputAPINotAvailable;
        }
    }

    private getDevice(device: MediaStream): void {

        // Create an AudioNode from the stream.
        var src = <IHTMLDivElementSrc>document.getElementById("input");
        src.audioNode = App.audioContext.createMediaStreamSource(device);
        document.body.appendChild(src);
        var drag: Drag = new Drag();
        var connect: Connector = new Connector();
        connect.connectInput(this.fAudioInput, src);
    }


    activateAudioOutput(sceneOutput: ModuleClass): void {

        var out = <IHTMLDivElementOut>document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = App.audioContext.destination;
        document.body.appendChild(out);
        var connect: Connector = new Connector();
        connect.connectOutput(sceneOutput, out);
    }


    /*********************** SAVE/RECALL SCENE ***************************/


    saveScene(isPrecompiled: boolean): string {

        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                this.fModuleList[i].patchID = String(i + 1);
            }
        }


        var json: string
        var jsonObjectCollection: JsonSaveCollection = {};

        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                jsonObjectCollection[this.fModuleList[i].patchID.toString()] = new JsonSaveObject();
                var jsonObject = jsonObjectCollection[this.fModuleList[i].patchID.toString()];
                jsonObject.sceneName = this.sceneName;
                jsonObject.patchId = this.fModuleList[i].patchID.toString();
                jsonObject.code = this.fModuleList[i].moduleFaust.getSource();
                jsonObject.name = this.fModuleList[i].moduleFaust.getName();
                jsonObject.x = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().left.toString();
                jsonObject.y = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().top.toString()


                var inputs: Connector[] = this.fModuleList[i].moduleFaust.getInputConnections();
                var jsonInputs: JsonInputsSave = new JsonInputsSave();
                jsonInputs.source = [];
                if (inputs) {

                    for (var j = 0; j < inputs.length; j++) {
                        jsonInputs.source.push(inputs[j].source.patchID.toString());
                    }
                }

                var outputs = this.fModuleList[i].moduleFaust.getOutputConnections();
                var jsonOutputs: JsonOutputsSave = new JsonOutputsSave();
                jsonOutputs.destination = [];

                if (outputs) {
                    for (var j = 0; j < outputs.length; j++) {
                        jsonOutputs.destination.push(outputs[j].destination.patchID.toString())
                    }

                }

                var params = this.fModuleList[i].moduleFaust.getDSP().controls();
                var jsonParams: JsonParamsSave = new JsonParamsSave();
                jsonParams.sliders = []
                if (params) {
                    for (var j = 0; j < params.length; j++) {
                        var jsonSlider: JsonSliderSave = new JsonSliderSave();
                        jsonSlider.path = params[j];
                        jsonSlider.value = this.fModuleList[i].moduleFaust.getDSP().getValue(params[j]);
                        jsonParams.sliders.push(jsonSlider);
                    }

                }
                var acc = this.fModuleList[i].moduleControles;
                var jsonAccs = new JsonAccSaves();
                jsonAccs.controles = [];
                for (var j = 0; j < acc.length; j++) {
                    var jsonAcc: JsonAccSave = new JsonAccSave();

                    jsonAcc.axis = acc[j].accelerometerSlider.axis.toString();
                    jsonAcc.curve = acc[j].accelerometerSlider.curve.toString();
                    jsonAcc.amin = acc[j].accelerometerSlider.amin.toString();
                    jsonAcc.amid = acc[j].accelerometerSlider.amid.toString();
                    jsonAcc.amax = acc[j].accelerometerSlider.amax.toString();
                    jsonAcc.adress = acc[j].accelerometerSlider.label;
                    jsonAcc.isEnabled = acc[j].accelerometerSlider.isEnabled;
                    jsonAccs.controles.push(jsonAcc);
                    //jsonParams.sliders.push(jsonSlider);
                }
                jsonObject.inputs = jsonInputs;
                jsonObject.outputs = jsonOutputs;
                jsonObject.params = jsonParams;
                jsonObject.acc = jsonAccs;

                var factorySave: JsonFactorySave = faust.writeDSPFactoryToMachine(this.fModuleList[i].moduleFaust.factory);

                if (factorySave && isPrecompiled) {
                    jsonObject.factory = new JsonFactorySave();
                    jsonObject.factory.name = factorySave.name;
                    jsonObject.factory.code = factorySave.code;
                }
            }
        }

        json = JSON.stringify(jsonObjectCollection)
        return json;
    }

    recallScene(json: string):void {
        if (json != null) {
            try {
                var jsonObjectCollection: JsonSaveCollection = JSON.parse(json);
            } catch (e) {
                new Message(App.messageRessource.errorJsonCorrupted)
                App.hideFullPageLoading();
            }
            //this.parent.currentNumberDSP = this.fModuleList.length;
            for (var index in jsonObjectCollection) {
                var jsonObject = jsonObjectCollection[index];
                this.arrayRecalScene.push(jsonObject);
            }
            this.lunchModuleCreation();
        } else {
            App.hideFullPageLoading();
            new Message(App.messageRessource.errorLoading)
        }
    }

    lunchModuleCreation() {
        if (this.arrayRecalScene.length != 0) {
            var jsonObject = this.arrayRecalScene[0]
            if (jsonObject.factory != undefined) {
                this.tempPatchId = jsonObject.patchId;
                var factory: Factory = faust.readDSPFactoryFromMachine(jsonObject.factory);
                this.updateAppTempModuleInfo(jsonObject);
                this.sceneName = jsonObject.sceneName;
                this.createModule(factory)
            } else if (jsonObject.patchId != "output" && jsonObject.patchId != "input") {
                this.tempPatchId = jsonObject.patchId;
                this.sceneName = jsonObject.sceneName;
                var argumentCompile = { name:jsonObject.name,sourceCode: jsonObject.code,x: parseFloat(jsonObject.x),y: parseFloat(jsonObject.y), callback:(factory) => { this.createModule(factory) }}
                this.compileFaust(argumentCompile);
            } else {
                this.arrayRecalScene.shift();
                this.lunchModuleCreation();
            }
        } else {
            for (var i = 0; i < this.arrayRecalledModule.length; i++){
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

    }
    updateAppTempModuleInfo(jsonSaveObject: JsonSaveObject) {
        this.tempModuleX = parseFloat(jsonSaveObject.x);
        this.tempModuleY = parseFloat(jsonSaveObject.y);
        this.tempModuleName = jsonSaveObject.name;
        this.tempModuleSourceCode = jsonSaveObject.code;
        this.tempPatchId = jsonSaveObject.patchId;
        this.tempParams = jsonSaveObject.params;
    }
    private createModule(factory:Factory):void {
        try {
            //---- This is very similar to "createFaustModule" from App.js
            //---- But as we need to set Params before calling "createFaustInterface", it is copied
            //---- There probably is a better way to do this !!
            if (!factory) {
                new Message(faust.getErrorMessage());
                App.hideFullPageLoading();
                return;
            }

            var module: ModuleClass = new ModuleClass(App.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => {this.removeModule(module) }, this.compileFaust);
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
            this.lunchModuleCreation()
        } catch (e) {
            new Message(App.messageRessource.errorCreateModuleRecall);
            this.arrayRecalScene.shift();
            this.lunchModuleCreation()
        }
    }
    recallAccValues(jsonAccs: IJsonAccSaves, module: ModuleClass) {
        if (jsonAccs != undefined) {
            for (var i in jsonAccs.controles) {
                var controle = jsonAccs.controles[i];
                if (controle != undefined) {
                    for (var j in module.moduleControles) {
                        var moduleControle = module.moduleControles[j];
                        if (moduleControle.itemParam.address == controle.adress) {
                            moduleControle.accelerometerSlider.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            moduleControle.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            moduleControle.accelerometerSlider.amax = parseFloat(controle.amax);
                            moduleControle.accelerometerSlider.amid = parseFloat(controle.amid);
                            moduleControle.accelerometerSlider.amin = parseFloat(controle.amin);
                            moduleControle.accelerometerSlider.axis = parseFloat(controle.axis);
                            moduleControle.accelerometerSlider.curve = parseFloat(controle.curve);
                            moduleControle.accelerometerSlider.isEnabled = controle.isEnabled;
                            AccelerometerHandler.curveSplitter(moduleControle.accelerometerSlider);
                            moduleControle.accelerometerSlider.mySlider.parentElement.className = "control-group";
                            moduleControle.accelerometerSlider.mySlider.parentElement.classList.add(Axis[controle.axis]);
                            if (!controle.isEnabled) {
                                moduleControle.accelerometerSlider.mySlider.parentElement.classList.add("disabledAcc");
                                moduleControle.accelerometerSlider.mySlider.classList.add("allowed");
                                moduleControle.accelerometerSlider.mySlider.classList.remove("not-allowed");
                                moduleControle.accelerometerSlider.mySlider.disabled = false;
                            } else {
                                if (moduleControle.accelerometerSlider.isActive) {
                                    moduleControle.accelerometerSlider.mySlider.classList.add("not-allowed");
                                    moduleControle.accelerometerSlider.mySlider.classList.remove("allowed");
                                    moduleControle.accelerometerSlider.mySlider.disabled = true;
                                } else {
                                    moduleControle.accelerometerSlider.mySlider.classList.add("allowed");
                                    moduleControle.accelerometerSlider.mySlider.classList.remove("not-allowed");
                                    moduleControle.accelerometerSlider.mySlider.disabled = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    connectModule(module: ModuleClass) {
        try {
            for (var i = 0; i < module.moduleFaust.recallInputsSource.length; i++) {
                var moduleSource = this.getModuleByPatchId(module.moduleFaust.recallInputsSource[i]);
                if (moduleSource != null) {
                    var connector: Connector = new Connector();
                    connector.createConnection(moduleSource, moduleSource.moduleView.getOutputNode(), module, module.moduleView.getInputNode());
                }
            }

            for (var i = 0; i < module.moduleFaust.recallOutputsDestination.length; i++) {
                var moduleDestination = this.getModuleByPatchId(module.moduleFaust.recallOutputsDestination[i]);
                if (moduleDestination != null) {
                    var connector: Connector = new Connector();
                    connector.createConnection(module, module.moduleView.getOutputNode(), moduleDestination, moduleDestination.moduleView.getInputNode());
                }
            }
        } catch (e) {
            new Message(App.messageRessource.errorConnectionRecall)
        }
    }

    getModuleByPatchId(patchId: string): ModuleClass {
        if (patchId == "output") {
            return this.fAudioOutput;
        } else if (patchId == "input") {
            return this.fAudioInput;
        } else {
            var arrayModules = this.getModules();
            for (var i = 0; i < arrayModules.length; i++) {
                if (arrayModules[i].patchID == patchId) {
                    return arrayModules[i];
                }
            }
        }
        return null;
    }

    static cleanName(newName:string): string {
        newName = App.replaceAll(newName, "é", "e");
        newName = App.replaceAll(newName, "è", "e");
        newName = App.replaceAll(newName, "à", "a");
        newName = App.replaceAll(newName, "ù", "u");
        newName = App.replaceAll(newName, " ", "_");
        newName = App.replaceAll(newName, "'", "_");
        return newName;
    }
    static isNameValid(newName: string): boolean {

    
        var pattern: RegExp = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");
        if (pattern.test(newName)) {
            return true
        } else {
            return false
        }
    }
    static rename(input: HTMLInputElement, spanRule: HTMLSpanElement, spanDynamic: HTMLSpanElement):boolean {
        var newName = input.value;
        newName = Scene.cleanName(newName);
        if (Scene.isNameValid(newName)) {
            Utilitary.currentScene.sceneName = newName;
            spanDynamic.textContent = Utilitary.currentScene.sceneName;
            spanRule.style.opacity = "0.6";
            input.style.boxShadow = "0 0 0 green inset";
            input.style.border = "none";
            input.value = Utilitary.currentScene.sceneName;
            var event: CustomEvent = new CustomEvent("updatename")
            document.dispatchEvent(event);
            return true;
        } else {
            spanRule.style.opacity = "1";
            input.style.boxShadow = "0 0 6px yellow inset";
            input.style.border = "3px solid red";
            return false;
        }
    }

    /***************** SET POSITION OF INPUT OUTPUT MODULE ***************/
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
    positionDblTapModule(): PositionModule {
        var position: PositionModule = new PositionModule();
        position.x = window.innerWidth / 2;
        position.y = window.innerHeight / 2;
        return position
    }
    unstyleNode() {
        var modules = this.getModules();
        modules.push(this.fAudioInput);
        modules.push(this.fAudioOutput);
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].moduleView.fInputNode) {
                modules[i].moduleView.fInputNode.style.border = "none";
                modules[i].moduleView.fInputNode.style.left = "-16px";
                modules[i].moduleView.fInputNode.style.marginTop = "-18px";
            }
            if (modules[i].moduleView.fOutputNode){
                modules[i].moduleView.fOutputNode.style.border = "none";
                modules[i].moduleView.fOutputNode.style.right = "-16px";
                modules[i].moduleView.fOutputNode.style.marginTop = "-18px";
            }
        }
        ModuleClass.isNodesModuleUnstyle = true;

    }


}

interface IJsonSaveCollection {
    [patchId: string]: IJsonSaveObject;
}



class JsonSaveCollection implements IJsonSaveCollection {
    [patchId: string]: IJsonSaveObject;
}


interface IJsonSaveObject {
    sceneName: string;
    patchId: string;
    name: string;
    code: string;
    x: string;
    y: string;
    inputs: IJsonInputsSave;
    outputs: IJsonOutputsSave;
    params: IJsonParamsSave;
    acc: IJsonAccSaves;
    factory: IJsonFactorySave;
}
class JsonSaveObject implements IJsonSaveObject {
    patchId: string;
    sceneName: string;
    name: string;
    code: string;
    x: string;
    y: string;
    inputs: IJsonInputsSave;
    outputs: IJsonOutputsSave;
    params: IJsonParamsSave
    acc: IJsonAccSaves;
    factory: IJsonFactorySave;

}

interface IJsonOutputsSave {
    destination: string[]
}
class JsonOutputsSave implements IJsonOutputsSave {
    destination: string[]
}

interface IJsonInputsSave {
    source: string[]
}
class JsonInputsSave implements IJsonInputsSave {
    source: string[]
}

interface IJsonParamsSave {
    sliders: IJsonSliderSave[]
}

class JsonParamsSave implements IJsonParamsSave {
    sliders: IJsonSliderSave[]
}
interface IJsonAccSaves {
    controles: IJsonAccSave[];
}
class JsonAccSaves implements IJsonAccSaves {
    controles: IJsonAccSave[]
}
interface IJsonAccSave {
    axis: string;
    curve: string;
    amin: string;
    amid: string;
    amax: string;
    adress: string;
    isEnabled: boolean;
}

class JsonAccSave implements IJsonAccSave {
    axis: string;
    curve: string;
    amin: string;
    amid: string;
    amax: string;
    adress: string;
    isEnabled: boolean;

}

interface IJsonSliderSave {
    path: string;
    value: string;

}
class JsonSliderSave implements IJsonSliderSave {
    path: string;
    value: string;

}

interface IJsonFactorySave {
    code: string;
    name: string;
}
class JsonFactorySave implements IJsonFactorySave {
    code: string;
    name: string;
}
