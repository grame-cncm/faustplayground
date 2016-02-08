/*				MODULECLASS.JS
	HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE AND ITS INTERFACE
	
	Interface structure
	===================
	DIV --> this.fModuleContainer
    H6 --> fTitle
    DIV --> fInterfaceContainer
    DIV --> fCloseButton
    DIV --> fFooter
    IMG --> fEditImg
	===================
		
	DEPENDENCIES :
		- Connect.js
		- Dragging.js
		- Main.js
		- webaudio-asm-wrapper.js
*/

/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Dragging.ts"/>
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/FaustInterface.ts"/>
/// <reference path="../main.ts"/>



"use strict";
interface IfDSP {
    json: () => string;
    getValue: (text: string) => string;
    setValue: (text: string, val: number) => void;
    getNumInputs: () => number;
    getNumOutputs: () => number;
    controls: () => any;
    getProcessor: () => ScriptProcessorNode;
}

interface HTMLfEdit extends HTMLImageElement {
    area: HTMLTextAreaElement;
}
interface HTMLinterfaceElement extends HTMLElement {
    label: string;
}
interface IModule {
    id: number;
    x: number;
    y: number;
    name: string;
    sceneParent: Scene;
    htmlElementModuleContainer: HTMLElement;
    removeModuleCallBack: (module: ModuleClass, scene: Scene) => void;
}
interface HTMLInterfaceContainer extends HTMLDivElement {
    unlitClassname: string;
    lastLit: any;

}
class ModuleClass implements IModule {
    drag: Drag = new Drag()
    patchID: string;
    fModuleContainer: HTMLElement;
    sceneParent: Scene;
    fDSP: IfDSP;
    deleteCallback: (module: ModuleClass) => void;
    fName: string;
    fSource: string;
    fTempSource: string;
    fTempName: string;
    fParams: number[] = [];
    fInputNode: HTMLDivElement;
    fOutputNode: HTMLDivElement;
    fOutputConnections: Connector[] = [];
    fInputConnections: Connector[] = [];
    fInterfaceContainer: HTMLInterfaceContainer;
    fEditImg: HTMLfEdit;
    fTitle: HTMLElement;
    x: number;
    y: number;
    course: ModuleClass[];
    recursiveFlag: boolean;
    moduleInputs: ModuleRecursive[];
    sourceCode: any;
    id: number;
    name: string;
    htmlElementModuleContainer: HTMLElement;
    removeModuleCallBack: (module: ModuleClass, scene: Scene) => void;
    eventDraggingHandler: (event: MouseEvent) => void;
    eventConnectorHandler: (event: Event) => void;



    constructor(id: number, x: number, y: number, name: string, sceneParent: Scene, htmlElementModuleContainer: HTMLElement, removeModuleCallBack: (m: ModuleClass, scene: Scene) => void) {
        var module: ModuleClass = this;
        this.createModule(id, x, y, name, htmlElementModuleContainer, function () { removeModuleCallBack(module, sceneParent) });
        this.sceneParent = sceneParent;
        this.x = x;
        this.y = y;
    }




    createModule(ID, x, y, name, parent, callback): void {
        var self: ModuleClass = this
        this.eventConnectorHandler = function (event: MouseEvent) { self.dragCnxCallback(event, self) };

        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it
        this.deleteCallback = callback;

        //------- GRAPHICAL ELEMENTS OF MODULE
        this.fModuleContainer = document.createElement("div");
        this.fModuleContainer.className = "moduleFaust";
        this.fModuleContainer.id = "module" + ID;
        this.fModuleContainer.style.left = "" + x + "px";
        this.fModuleContainer.style.top = "" + y + "px";

        this.fTitle = document.createElement("h6");
        this.fTitle.className = "module-title";
        this.fTitle.textContent = "";
        this.fModuleContainer.appendChild(this.fTitle);

        this.fInterfaceContainer = <HTMLInterfaceContainer>document.createElement("div");
        this.fInterfaceContainer.className = "content";
        this.fModuleContainer.appendChild(this.fInterfaceContainer);
        this.eventDraggingHandler = function (event) { self.dragCallback(event, self) };
        //var eventHandler = function (event) { self.dragCallback(event, self) }
        this.fModuleContainer.addEventListener("mousedown", self.eventDraggingHandler, true);

        var fCloseButton: HTMLAnchorElement = document.createElement("a");
        fCloseButton.href = "#";
        fCloseButton.className = "close";
        fCloseButton.onclick = function () { self.deleteModule(); };
        this.fModuleContainer.appendChild(fCloseButton);

        var fFooter: HTMLElement = document.createElement("footer");
        fFooter.id = "moduleFooter";

        this.fEditImg = <HTMLfEdit>document.createElement("img");
        this.fEditImg.src = App.baseImg + "edit.png";

        this.fEditImg.onclick = function () { self.edit(self); };

        fFooter.appendChild(this.fEditImg);
        this.fModuleContainer.appendChild(fFooter);

        // add the node into the soundfield
        parent.appendChild(this.fModuleContainer);
        
        //---- Redirect drop to main.js
        this.fModuleContainer.ondrop = function (e) {
            self.sceneParent.parent.uploadOn(self.sceneParent.parent, self, 0, 0, e);
            return true;
        };
        this.fName = name;

    }
    /***************  PRIVATE METHODS  ******************************/

    dragCallback(event: MouseEvent, module: ModuleClass): void {

        if (event.type == "mousedown") {
            module.drag.startDraggingModule(event, module);
        } else if (event.type == "mouseup") {
            module.drag.stopDraggingModule(event, module);
        } else if (event.type == "mousemove") {
            module.drag.whileDraggingModule(event, module);
        }
    }

    dragCnxCallback(event: MouseEvent, module: ModuleClass): void {

        if (event.type == "mousedown") {
            module.drag.startDraggingConnector(module, event);
        } else if (event.type == "mouseup") {
            module.drag.stopDraggingConnector(module, event);
        } else if (event.type == "mousemove") {
            module.drag.whileDraggingConnector(module, event);
        }
    }





    /*******************************  PUBLIC METHODS  **********************************/


    deleteModule(): void {
        var connect: Connect = new Connect()
        connect.disconnectModule(this);
        this.deleteFaustInterface();	
    
        // Then delete the visual element
        if (this.fModuleContainer)
            this.fModuleContainer.parentNode.removeChild(this.fModuleContainer);

        this.deleteDSP(this.fDSP);
        this.deleteCallback(this);
    }
	
    /*************** ACTIONS ON IN/OUTPUT NODES ***************************/
    // ------ Returns Graphical input and output Node
    getOutputNode(): HTMLElement { return this.fOutputNode; }
    getInputNode(): HTMLElement { return this.fInputNode; }

    // ------ Returns Connection Array OR null if there are none
    getInputConnections(): Connector[] {
        return this.fInputConnections;
    }
    getOutputConnections(): Connector[] {
        return this.fOutputConnections;
    }

    //-- The Creation of array is only done when a new connection is added 
    //-- (to be able to return null when there are none)	
    addOutputConnection(connector: Connector): void {
        this.fOutputConnections.push(connector);
    }
    addInputConnection(connector: Connector): void {
        this.fInputConnections.push(connector);
    }

    removeOutputConnection(connector: Connector): void {
        this.fOutputConnections.splice(this.fOutputConnections.indexOf(connector), 1);
    }
    removeInputConnection(connector: Connector): void {
        this.fInputConnections.splice(this.fInputConnections.indexOf(connector), 1);
    }
	
    /********************* SHOW/HIDE MODULE IN SCENE **********************/
    showModule(): void { this.fModuleContainer.style.visibility = "visible"; }
    hideModule(): void { this.fModuleContainer.style.visibility = "hidden"; }
	
    /********************** GET/SET SOURCE/NAME/DSP ***********************/
    setSource(code: string): void {
        this.fSource = code;
    }
    getSource(): string { return this.fSource; }

    getName(): string { return this.fName; }

    getDSP(): IfDSP {
        return this.fDSP;
    }
	
    //--- Create and Update are called once a source code is compiled and the factory exists
    createDSP(factory: Factory): void {
        this.fDSP = faust.createDSPInstance(factory, App.audioContext, 1024);
    }

    //--- Update DSP in module 
    updateDSP(factory: Factory, module: ModuleClass): void {

        var toDelete = module.fDSP;
	
        // 	Save Cnx
        var saveOutCnx = new Array().concat(module.fOutputConnections);
        var saveInCnx = new Array().concat(module.fInputConnections);
			
        // Delete old ModuleClass 
        var connect: Connect = new Connect();
        connect.disconnectModule(module);

        module.deleteFaustInterface();
        module.deleteInputOutputNodes();	
 		
        // Create new one

        module.createDSP(factory);
        module.fName = module.fTempName;
        module.fSource = module.fTempSource;
        module.createFaustInterface();
        module.addInputOutputNodes();

        module.deleteDSP(toDelete);

        // Recall Cnx
        if (saveOutCnx && module.getOutputNode()) {

            for (var i = 0; i < saveOutCnx.length; i++) {
                if (saveOutCnx[i])
                    connect.createConnection(module, module.getOutputNode(), saveOutCnx[i].destination, saveOutCnx[i].destination.getInputNode());
            }
        }
        if (saveInCnx && module.getInputNode()) {
            for (var i = 0; i < saveInCnx.length; i++) {
                if (saveInCnx[i])
                    connect.createConnection(saveInCnx[i].source, saveInCnx[i].source.getOutputNode(), module, module.getInputNode());
            }
        }
    }

    deleteDSP(todelete: IfDSP): void {
        // 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
        // 		if(todelete)
        // 		    faust.deleteDSPInstance(todelete);
    }
    /******************** EDIT SOURCE & RECOMPILE *************************/
    edit(module: ModuleClass): void {

        module.saveParams();

        module.deleteFaustInterface();

        var textArea: HTMLTextAreaElement = document.createElement("textarea");
        textArea.rows = 15;
        textArea.cols = 60;
        textArea.value = this.fSource;
        module.fInterfaceContainer.appendChild(textArea);

        module.fEditImg.src = App.baseImg + "enter.png";
        module.fEditImg.onclick = function (event) { module.recompileSource(event, module) };
        module.fEditImg.area = textArea;
    }

    //---- Update ModuleClass with new name/code source
    update(name: string, code: string): void {


        this.fTempName = name;
        this.fTempSource = code;
        var module: ModuleClass = this;
        this.sceneParent.parent.compileFaust(name, code, this.x, this.y, function (factory) { module.updateDSP(factory, module) });
    }
	
    //---- React to recompilation triggered by click on icon
    recompileSource(event: MouseEvent, module: ModuleClass): void {
        var buttonImage: HTMLfEdit = <HTMLfEdit>event.target;
        var dsp_code: string = buttonImage.area.value;

        module.update(this.fTitle.textContent, dsp_code);
        module.recallParams();

        module.fEditImg.src = App.baseImg + "edit.png";
        module.fEditImg.onclick = function () { module.edit(module) };
    }
	
    /***************** CREATE/DELETE the DSP Interface ********************/

    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    createFaustInterface(): void {

        this.fTitle.textContent = this.fName;
        var faustInterface: FaustInterface = new FaustInterface()
        faustInterface.parse_ui(JSON.parse(this.fDSP.json()).ui, this);
    }
    deleteFaustInterface(): void {

        while (this.fInterfaceContainer.childNodes.length != 0)
            this.fInterfaceContainer.removeChild(this.fInterfaceContainer.childNodes[0]);
    }

    getModuleContainer(): HTMLElement {
        return this.fModuleContainer;
    }
    getInterfaceContainer(): HTMLInterfaceContainer {
        return this.fInterfaceContainer;
    }

    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    interfaceCallback(event: Event, module: ModuleClass): void {

        var input: HTMLInputElement = <HTMLInputElement>event.target
        var groupInput: HTMLinterfaceElement = <HTMLinterfaceElement>input.parentNode;
        var elementInInterfaceGroup: HTMLElement = <HTMLElement>groupInput.childNodes[0];
        var text: string = groupInput.label;



        var val = input.value;

        val = Number((parseFloat(input.value) * parseFloat(elementInInterfaceGroup.getAttribute('step'))) + parseFloat(elementInInterfaceGroup.getAttribute('min'))).toFixed(parseFloat(elementInInterfaceGroup.getAttribute('precision')));

        if (event.type == "mousedown")
            val = "1";
        else if (event.type == "mouseup")
            val = "0";
		
        //---- TODO: yes, this is lazy coding, and fragile. - Historical from Chris Web Audio Playground
        //var output = event.target.parentNode.children[0].children[1];
        var output: HTMLElement = <HTMLElement>groupInput.getElementsByClassName("value")[0];

        //---- update the value text
        if (output)
            output.innerHTML = "" + val.toString() + " " + output.getAttribute("units");

        if (input.type == "submit")
            val = String(App.buttonVal);

        if (App.buttonVal == 0)
            App.buttonVal = 1;
        else
            App.buttonVal = 0;

        // 	Search for DSP then update the value of its parameter.
        module.fDSP.setValue(text, parseFloat(val));
    }
	
    // Save graphical parameters of a Faust Node
    saveParams(): void {

        var interfaceElements: NodeList = this.fInterfaceContainer.childNodes;

        for (var j = 0; j < interfaceElements.length; j++) {
            var interfaceElement: HTMLinterfaceElement = <HTMLinterfaceElement>interfaceElements[j];
            if (interfaceElement.className == "control-group") {

                var text: string = interfaceElement.label;

                this.fParams[text] = this.fDSP.getValue(text);
            }
        }
    }
    recallParams(): void {

        for (var key in this.fParams)
            this.fDSP.setValue(key, this.fParams[key]);
    }
    getParams(): number[] {
        return this.fParams;
    }
    setParams(parameters: number[]):void {
		this.fParams = parameters;
    }
    addParam(path: string, value: number):void {
		this.fParams[path] = value;
    }
		
/******************* GET/SET INPUT/OUTPUT NODES **********************/
    addInputOutputNodes(): void{
        var module: ModuleClass = this;
		if(this.fDSP.getNumInputs() > 0) {
		
			this.fInputNode=document.createElement("div");
			this.fInputNode.className="node node-input";
	    	this.addCnxListener(this.fInputNode, "mousedown",module);
			this.fInputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
		
			this.fModuleContainer.appendChild(this.fInputNode);
		}
			
		if (this.fDSP.getNumOutputs() > 0) {
		
			this.fOutputNode=document.createElement("div");
			this.fOutputNode.className="node node-output";
            this.addCnxListener(this.fOutputNode, "mousedown",module);
			this.fOutputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
		
			this.fModuleContainer.appendChild(this.fOutputNode);
		}		
    }
    deleteInputOutputNodes(): void{
		if(this.fInputNode)
			this.fModuleContainer.removeChild(this.fInputNode);
	
		if(this.fOutputNode)
			this.fModuleContainer.removeChild(this.fOutputNode);	
    }
    // Added for physical Input and Output which are create outside of ModuleClass (--> see Playground.js or Pedagogie.js)
    setInputOutputNodes(input: HTMLDivElement, output: HTMLDivElement): void{
        var module: ModuleClass = this;
		this.fInputNode = input;
        if (this.fInputNode)
            this.addCnxListener(this.fInputNode, "mousedown",module);
	    	
		this.fOutputNode = output;	
		if(this.fOutputNode)
	    	this.addCnxListener(this.fOutputNode, "mousedown",module);
    }
	
    /****************** ADD/REMOVE ACTION LISTENERS **********************/
    addListener(type: string, module: ModuleClass): void {
        document.addEventListener(type, module.eventDraggingHandler, true);
    }
    removeListener(type: string, div?: HTMLElement, document?: Document): void {
        var module: ModuleClass = this;
        if (!document) {
            div.removeEventListener(type, module.eventDraggingHandler, true)
        } else {
            document.removeEventListener(type, module.eventDraggingHandler, true)
        }
    }
    addCnxListener(div: HTMLElement, type: string, module: ModuleClass): void {
        if (type == "mousedown") {
            div.addEventListener(type, module.eventConnectorHandler, true);
        } else {
            document.addEventListener(type, module.eventConnectorHandler, true);
        }
    }
    removeCnxListener(div: HTMLElement, type:string, module: ModuleClass):void {
        document.removeEventListener(type, module.eventConnectorHandler, true);
    }
		
    /**********************************************************************/
    isPointInOutput(x: number, y: number): boolean {
	
        if (this.fOutputNode && this.fOutputNode.getBoundingClientRect().left < x && x < this.fOutputNode.getBoundingClientRect().right && this.fOutputNode.getBoundingClientRect().top < y && y < this.fOutputNode.getBoundingClientRect().bottom) {
            return true;
        }		
		return false;
    }
    isPointInInput(x: number, y: number): boolean {			

        if (this.fInputNode && this.fInputNode.getBoundingClientRect().left <= x && x <= this.fInputNode.getBoundingClientRect().right && this.fInputNode.getBoundingClientRect().top <= y && y <= this.fInputNode.getBoundingClientRect().bottom) {
            return true;
        }
		return false;
    }

    isPointInNode(x: number, y: number): boolean {
	
        if (this.fModuleContainer && this.fModuleContainer.getBoundingClientRect().left < x && x < this.fModuleContainer.getBoundingClientRect().right && this.fModuleContainer.getBoundingClientRect().top < y && y < this.fModuleContainer.getBoundingClientRect().bottom) {
            return true;
        }
		return false;
    }
}

