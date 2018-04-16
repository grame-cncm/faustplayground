/*				SCENECLASS.JS
	HAND-MADE JAVASCRIPT CLASS CONTAINING THE API OF A GENERIC SCENE
*/
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/ModuleClass.ts"/>
/// <reference path="../Lib/webaudio-asm-worker-wrapper.d.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="SceneView.ts"/>

class Scene {
    //temporary arrays used to recall a scene from a jfaust file
    arrayRecalScene: JsonSaveModule[] = [];
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
    //used to keep loading page when loading the two input and output default modules
    isInitLoading: boolean = true;
    isOutputTouch: boolean = false;

    //used to store value of module being created
    tempModuleName: string;
    tempPatchId: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    tempParams: IJsonParamsSave;

    //callback function to compile faust code from App
    compileFaust: (compile: CompileFaust) => void

    constructor(identifiant: string, compileFaust: (compileFaust: CompileFaust) => void, sceneView?: SceneView) {
        this.compileFaust = compileFaust;
        this.sceneView = new SceneView();
        this.sceneView.initNormalScene(this)
        this.integrateSceneInBody();
        this.integrateOutput();
        document.addEventListener("unstylenode", () => { this.unstyleNode() });
    }

    getSceneContainer(): HTMLDivElement { return this.sceneView.fSceneContainer; }

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

    //custom doubl touch event to mute
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

    /*******************************  PUBLIC METHODS  **********************************/

    integrateSceneInBody(): void {
        document.body.appendChild(this.sceneView.fSceneContainer);
    }

    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput() {
        var positionInput: PositionModule = this.positionInputModule();
        this.fAudioInput = new ModuleClass(Utilitary.idX++, positionInput.x, positionInput.y, "input", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module) }, this.compileFaust);
        this.fAudioInput.patchID = "input";
        var scene: Scene = this;
        this.compileFaust({ name:"input", sourceCode:"process=_,_;", x:positionInput.x, y:positionInput.y, callback:(factory)=>{ scene.integrateAudioInput(factory) }});
    }

    integrateOutput() {
        var positionOutput: PositionModule = this.positionOutputModule();
        var scene: Scene = this;
        this.fAudioOutput = new ModuleClass(Utilitary.idX++, positionOutput.x, positionOutput.y, "output", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module) }, this.compileFaust);
        this.fAudioOutput.patchID = "output";
        this.addMuteOutputListner(this.fAudioOutput);
        this.compileFaust({ name: "output", sourceCode: "process=_,_;", x: positionOutput.x, y: positionOutput.y, callback: (factory) => { scene.integrateAudioOutput(factory) } });
    }

    private integrateAudioOutput(factory: Factory): void {
        if (this.fAudioOutput) {
            this.fAudioOutput.moduleFaust.setSource("process=_,_;");
            var moduleFaust = this;
            this.fAudioOutput.createDSP(factory, function() {
            	moduleFaust.activateAudioOutput(moduleFaust.fAudioOutput);
            	moduleFaust.fAudioOutput.addInputOutputNodes();
            	moduleFaust.integrateInput();
            });
        }
    }

    private integrateAudioInput(factory: Factory): void {
        if (this.fAudioInput) {
            this.fAudioInput.moduleFaust.setSource("process=_,_;");
            var moduleFaust = this;
            this.fAudioInput.createDSP(factory, function() {
            	moduleFaust.activateAudioInput();
            	moduleFaust.fAudioInput.addInputOutputNodes();
       			Utilitary.hideFullPageLoading();
        		moduleFaust.isInitLoading = false;
        	});
        }
    }

    getAudioOutput(): ModuleClass { return this.fAudioOutput; }
    getAudioInput(): ModuleClass { return this.fAudioInput; }

    /********************************************************************
**********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
********************************************************************/

    activateAudioInput(): void {
        navigator.mediaDevices.getUserMedia({ audio: {echoCancellation:false} as any})
        // 'as any' is needed here because of a typo in lib.d.ts (echoCancellation is written echoCancelation)
        .then (
            (mediaStream) => {
                this.getDevice(mediaStream);
                console.log("audio track has settings:", mediaStream.getAudioTracks()[0].getSettings());
            }
        ).catch (
            (err) => {
                console.error(err);
                this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)"
                this.fAudioInput.moduleView.fInterfaceContainer.title = Utilitary.messageRessource.errorGettingAudioInput;
                new Message(Utilitary.messageRessource.errorGettingAudioInput);
            }
        );
    }

    private getDevice(device: MediaStream): void {

        // Create an AudioNode from the stream.
        var src = <IHTMLDivElementSrc>document.getElementById("input");
        src.audioNode = Utilitary.audioContext.createMediaStreamSource(device);
        document.body.appendChild(src);
        var connect: Connector = new Connector();
        connect.connectInput(this.fAudioInput, src);
    }

    activateAudioOutput(sceneOutput: ModuleClass): void {

        var out = <IHTMLDivElementOut>document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = Utilitary.audioContext.destination;
        document.body.appendChild(out);
        var connect: Connector = new Connector();
        connect.connectOutput(sceneOutput, out);
    }

    /*********************** SAVE/RECALL SCENE ***************************/

    // use a collection of JsonSaveModule describing the scene and the modules to save it in a json string
    // isPrecompiled is used to save or not the asm.js code
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
                jsonObjectCollection[this.fModuleList[i].patchID.toString()] = new JsonSaveModule();
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

                var params = this.fModuleList[i].moduleFaust.getDSP().getParams();
                var jsonParams: JsonParamsSave = new JsonParamsSave();
                jsonParams.sliders = []
                if (params) {
                    for (var j = 0; j < params.length; j++) {
                        var jsonSlider: JsonSliderSave = new JsonSliderSave();
                        jsonSlider.path = params[j];
                        jsonSlider.value = this.fModuleList[i].moduleFaust.getDSP().getParamValue(params[j]);
                        jsonParams.sliders.push(jsonSlider);
                    }

                }
                var faustIControler = this.fModuleList[i].moduleControles;
                var jsonAccs = new JsonAccSaves();

                jsonAccs.controles = [];
                for (var j = 0; j < faustIControler.length; j++) {
                    var jsonAcc: JsonAccSave = new JsonAccSave();
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

                var factorySave: JsonFactorySave = faust.writeDSPFactoryToMachine(this.fModuleList[i].moduleFaust.factory);

                if (factorySave && isPrecompiled) {
                    jsonObject.factory = new JsonFactorySave();
                    jsonObject.factory.name = factorySave.name;
                    jsonObject.factory.code = factorySave.code;
                    jsonObject.factory.code_source = factorySave.code_source;
                    jsonObject.factory.helpers = factorySave.helpers;
                    jsonObject.factory.name_effect = factorySave.name_effect;
                    jsonObject.factory.code_effect = factorySave.code_effect;
                    jsonObject.factory.code_source_effect = factorySave.code_source_effect;
                    jsonObject.factory.helpers_effect = factorySave.helpers_effect;
    	         }
            }
        }

        json = JSON.stringify(jsonObjectCollection)
        return json;
    }

    //recall scene from json/jfaust fill arrayRecalScene with each JsonSaveModule
    recallScene(json: string):void {
        if (json != null) {
            try {
                var jsonObjectCollection: JsonSaveCollection = JSON.parse(json);
            } catch (e) {
                new Message(Utilitary.messageRessource.errorJsonCorrupted)
                Utilitary.hideFullPageLoading();
            }
            //this.parent.currentNumberDSP = this.fModuleList.length;
            for (var index in jsonObjectCollection) {
                var jsonObject = jsonObjectCollection[index];
                this.arrayRecalScene.push(jsonObject);
            }
            this.launchModuleCreation();
        } else {
            Utilitary.hideFullPageLoading();
            new Message(Utilitary.messageRessource.errorLoading)
        }
    }

    // recall module at rank 0 of arrayRecalScene
    // direct use of the asm.js code if exist
    // or compile the faust code
    //
    // When arrayRecalScene empty, connect the modules in the scene

    launchModuleCreation() {
        if (this.arrayRecalScene.length != 0) {
            var jsonObject = this.arrayRecalScene[0]
            if (jsonObject.factory != undefined) {
                this.tempPatchId = jsonObject.patchId;
                faust.readDSPFactoryFromMachine(jsonObject.factory, (factory) => {
                	 this.updateAppTempModuleInfo(jsonObject);
               		 this.sceneName = jsonObject.sceneName;
               		 this.createModule(factory)});
            } else if (jsonObject.patchId != "output" && jsonObject.patchId != "input") {
                this.tempPatchId = jsonObject.patchId;
                this.sceneName = jsonObject.sceneName;
                var argumentCompile = { name:jsonObject.name,sourceCode: jsonObject.code,x: parseFloat(jsonObject.x),y: parseFloat(jsonObject.y), callback:(factory) => { this.createModule(factory) }}
                this.compileFaust(argumentCompile);
            } else {
                this.arrayRecalScene.shift();
                this.launchModuleCreation();
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
            Utilitary.hideFullPageLoading();
        }
    }

    //update temporary info for the module being created
    updateAppTempModuleInfo(jsonSaveObject: JsonSaveModule) {
        this.tempModuleX = parseFloat(jsonSaveObject.x);
        this.tempModuleY = parseFloat(jsonSaveObject.y);
        this.tempModuleName = jsonSaveObject.name;
        this.tempModuleSourceCode = jsonSaveObject.code;
        this.tempPatchId = jsonSaveObject.patchId;
        this.tempParams = jsonSaveObject.params;
    }

    //create Module then remove corresponding JsonSaveModule from arrayRecalScene at rank 0
    //re-lunch module of following Module/JsonSaveModule
    private createModule(factory:Factory):void {
        try {
            if (!factory) {
                new Message(faust.getErrorMessage());
                Utilitary.hideFullPageLoading();
                return;
            }

            var module: ModuleClass = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => {this.removeModule(module) }, this.compileFaust);
            module.moduleFaust.setSource(this.tempModuleSourceCode);
            module.createDSP(factory, () => {
            	module.patchID = this.tempPatchId;
            	if (this.tempParams) {
               		for (var i = 0; i < this.tempParams.sliders.length; i++) {
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
            	this.launchModuleCreation();
            });
        } catch (e) {
            new Message(Utilitary.messageRessource.errorCreateModuleRecall);
            this.arrayRecalScene.shift();
            this.launchModuleCreation()
        }
    }

    //recall of the accelerometer mapping parameters for each FaustInterfaceControler of the Module
    recallAccValues(jsonAccs: IJsonAccSaves, module: ModuleClass) {
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
                            } else {
                                if (acc.isActive) {
                                    slider.classList.add("not-allowed");
                                    slider.classList.remove("allowed");
                                    slider.disabled = true;
                                } else {
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
    }

    //connect Modules recalled
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
            new Message(Utilitary.messageRessource.errorConnectionRecall)
        }
    }

    //use to identify the module to be connected to when recalling connections between modules
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

    //use to replace all éèàù ' from string and replace it with eeau__
    static cleanName(newName:string): string {
        newName =Utilitary.replaceAll(newName, "é", "e");
        newName =Utilitary.replaceAll(newName, "è", "e");
        newName =Utilitary.replaceAll(newName, "à", "a");
        newName =Utilitary.replaceAll(newName, "ù", "u");
        newName =Utilitary.replaceAll(newName, " ", "_");
        newName =Utilitary.replaceAll(newName, "'", "_");
        return newName;
    }
    //check if string start only with letter (no accent)
    //and contains only letter (no accent) underscore and number for a lenght between 1 and 50 char
    static isNameValid(newName: string): boolean {
        var pattern: RegExp = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");
        if (pattern.test(newName)) {
            return true
        } else {
            return false
        }
    }

    //rename scene if format is correct and return true otherwise return false
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
            new Message(Utilitary.messageRessource.invalidSceneName);
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
    /***************** Unstyle node connection of all modules on touchscreen  ***************/
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

/*******************************************************************
********************  save/recall interface object *****************
********************************************************************/

interface IJsonSaveCollection {
    [patchId: string]: IJsonSaveModule;
}

class JsonSaveCollection implements IJsonSaveCollection {
    [patchId: string]: IJsonSaveModule;
}

interface IJsonSaveModule {
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

class JsonSaveModule implements IJsonSaveModule {
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
    name: string;
    code: object;
    code_source: string;
    helpers: string;
    name_effect: string;
    code_effect: string;
    code_source_effect: string;
    helpers_effect: string;
}
class JsonFactorySave implements IJsonFactorySave {
    name: string;
    code: object;
    code_source: string;
    helpers: string;
    name_effect: string;
    code_effect: string;
    code_source_effect: string;
    helpers_effect: string;
}
