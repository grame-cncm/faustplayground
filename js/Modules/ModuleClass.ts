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


"use strict";

interface IInterfaceContainer extends HTMLElement {
    src: any;
}
interface IfEdit extends HTMLImageElement {
    area: HTMLTextAreaElement;
}
interface IinterfaceElement extends HTMLElement {
    label: any;
}
interface IModule {
    id: number;
    x: number;
    y: number;
    name: string;
    sceneParent: Scene;
    htmlElementModuleContainer: HTMLElement;
    removeModuleCallBack: (m: ModuleClass) => void;

}
class ModuleClass implements IModule {
    drag: Drag = new Drag()
    patchID: string;
    fModuleContainer: HTMLElement;
    sceneParent: Scene;
    fDSP: any;
    deleteCallback: any
    fName: string;
    fSource:string;
    fTempSource:string;
    fTempName:string;
    fParams: any[];
    fInputNode:any;
    fOutputNode: any;
    fOutputConnections: Connector[] = null;
    fInputConnections: Connector[] = null;
    fInterfaceContainer: HTMLElement;
    fEditImg: IfEdit;
    fTitle: HTMLElement;
    x: number;
    y: number;
    course: ModuleClass[];
    recursiveFlag: boolean;
    moduleInputs: any[];
    sourceCode: any;
    id: number;
    name: string;
    htmlElementModuleContainer: HTMLElement;
    removeModuleCallBack: (m: ModuleClass) => void;
    eventHandler: (event: Event) => void; 



    constructor(id: number, x: number, y: number, name: string, sceneParent: Scene, htmlElementModuleContainer: HTMLElement, removeModuleCallBack: (m: ModuleClass) => void) {

        this.createModule(id, x, y, name, htmlElementModuleContainer, removeModuleCallBack);
        this.sceneParent = sceneParent;
        this.x = x;
        this.y = y;
    }




    createModule(ID, x, y, name, parent, callback) {
	
        // ---- Capturing module instance
        var that: ModuleClass=this;
	
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

        this.fInterfaceContainer = document.createElement("div");
        this.fInterfaceContainer.className = "content";
        this.fModuleContainer.appendChild(this.fInterfaceContainer);
        var self = this
        this.eventHandler = function (event) { self.dragCallback(event, self) };
        //var eventHandler = function (event) { self.dragCallback(event, self) }
        this.fModuleContainer.addEventListener("mousedown", self.eventHandler, true);

        var fCloseButton = document.createElement("a");
        fCloseButton.href = "#";
        fCloseButton.className = "close";
        fCloseButton.onclick = function () { that.deleteModule(); };
        this.fModuleContainer.appendChild(fCloseButton);

        var fFooter = document.createElement("footer");
        fFooter.id = "moduleFooter";

        this.fEditImg = <IfEdit>document.createElement("img");
        this.fEditImg.src = App.baseImg + "edit.png";
        this.fEditImg.onclick = function () { that.edit(); };

        fFooter.appendChild(this.fEditImg);
        this.fModuleContainer.appendChild(fFooter);

        // add the node into the soundfield
        parent.appendChild(this.fModuleContainer);
        
        //---- Redirect drop to main.js
        this.fModuleContainer.ondrop = function (e) {

            that.sceneParent.parent.uploadOn(that.sceneParent.parent,that, 0, 0, e);
            return true;
        };
        this.fName = name;

        //------ FIELDS OF THE MODULE
        ;

    };
    /***************  PRIVATE METHODS  ******************************/

    dragCallback(event, module: ModuleClass) {

		console.log("drag Callback");
        if (event.type == "mousedown")
            module.drag.startDraggingModule(event, module);
        else if (event.type == "mouseup")
            module.drag.stopDraggingModule(event, module);
        else if (event.type == "mousemove")
            module.drag.whileDraggingModule(event, module);
	};
	
	dragCnxCallback(event){
        var drag: Drag = new Drag();
		console.log("drag Cnx Callback");
	
		if(event.type == "mousedown")
			drag.startDraggingConnector(this, event);
		else if(event.type == "mouseup")
			drag.stopDraggingConnector(this, event);
		else if(event.type == "mousemove")	
			drag.whileDraggingConnector(this, event);
	};





/*******************************  PUBLIC METHODS  **********************************/
      
  
    deleteModule() {
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
        getOutputNode(){return this.fOutputNode; };
        getInputNode(){return this.fInputNode; };

// ------ Returns Connection Array OR null if there are none
	getInputConnections(){
		return this.fInputConnections;
        };
	getOutputConnections(){
		return this.fOutputConnections;
        };

//-- The Creation of array is only done when a new connection is added 
//-- (to be able to return null when there are none)	
	addOutputConnection(connector){
		if(!this.fOutputConnections)
		this.fOutputConnections = new Array();
			
		this.fOutputConnections.push(connector);
        };
	addInputConnection(connector){
	
		if(!this.fInputConnections)
			this.fInputConnections = new Array();
			
		this.fInputConnections.push(connector);
        };
	
	removeOutputConnection(connector){
		this.fOutputConnections.splice(this.fOutputConnections.indexOf(connector), 1);
        };
	removeInputConnection(connector){
			
		this.fInputConnections.splice(this.fInputConnections.indexOf(connector), 1);
        };
	
/********************* SHOW/HIDE MODULE IN SCENE **********************/
        showModule() { this.fModuleContainer.style.visibility = "visible"; };
        hideModule() { this.fModuleContainer.style.visibility = "hidden"; };
	
/********************** GET/SET SOURCE/NAME/DSP ***********************/
	setSource(code){
    	this.fSource = code;
        };
        getSource() { return this.fSource; };

        getName() { return this.fName; };
	
	getDSP(){
		return this.fDSP;
        };
	
//--- Create and Update are called once a source code is compiled and the factory exists
	createDSP(factory){
	
		//that = this;

        this.fDSP = faust.createDSPInstance(factory, App.audioContext, 1024);	
        };

//--- Update DSP in module 
	updateDSP(factory){
	
		var toDelete = this.fDSP;
	
// 	Save Cnx
		var saveOutCnx = new Array().concat(this.fOutputConnections);
		var saveInCnx = new Array().concat(this.fInputConnections);
			
        // Delete old ModuleClass 
        var connect: Connect = new Connect();
		connect.disconnectModule(this);
	
		this.deleteFaustInterface();
 		this.deleteInputOutputNodes();	
 		
    // Create new one

        this.createDSP(factory);
	 	this.fName = this.fTempName;
	 	this.fSource = this.fTempSource;
		this.createFaustInterface();
		this.addInputOutputNodes();
		
		this.deleteDSP(toDelete);

// Recall Cnx
		if(saveOutCnx && this.getOutputNode()){
		
			for(var i=0; i<saveOutCnx.length; i++){
                if (saveOutCnx[i])
                    connect.createConnection(this, this.getOutputNode(), saveOutCnx[i].destination, saveOutCnx[i].destination.getInputNode());
			}
		}
		if(saveInCnx && this.getInputNode()){
			for(var i=0; i<saveInCnx.length; i++){
                if (saveInCnx[i])
                    connect.createConnection(saveInCnx[i].source, saveInCnx[i].source.getOutputNode(), this, this.getInputNode());
			}
		}
        };
	
	deleteDSP(todelete){
	// 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
// 		if(todelete)
// 		    faust.deleteDSPInstance(todelete);
        };
/******************** EDIT SOURCE & RECOMPILE *************************/
	edit(){

		this.saveParams();
		
		this.deleteFaustInterface();
		
		var textArea = document.createElement("textarea");
		textArea.rows = 15;
		textArea.cols = 60;
		textArea.value = this.fSource;
		this.fInterfaceContainer.appendChild(textArea);
			
        this.fEditImg.src = App.baseImg + "enter.png";
        this.fEditImg.onclick = this.recompileSource;
		this.fEditImg.area = textArea;
        };

//---- Update ModuleClass with new name/code source
	update(name, code){
	
	
		this.fTempName = name;
		this.fTempSource = code;

        this.sceneParent.parent.compileFaust(name, code, this.x, this.y, this.updateDSP);
        };
	
//---- React to recompilation triggered by click on icon
	recompileSource(event){
	
		var dsp_code = event.target.area.value;

		this.update(this.fTitle.textContent, dsp_code);
		this.recallParams();
	
		this.fEditImg.src = App.baseImg + "edit.png";
		this.fEditImg.onclick = this.edit;
        };
	
/***************** CREATE/DELETE the DSP Interface ********************/

// Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
	createFaustInterface(){

        this.fTitle.textContent = this.fName;
        var faustInterface: FaustInterface = new FaustInterface()
        faustInterface.parse_ui(JSON.parse(this.fDSP.json()).ui, this); 
        };
        deleteFaustInterface() {

            while (this.fInterfaceContainer.childNodes.length != 0)
                this.fInterfaceContainer.removeChild(this.fInterfaceContainer.childNodes[0]);
        };
	
        getModuleContainer() {
            return this.fModuleContainer;
        };
        getInterfaceContainer() {
            return this.fInterfaceContainer;
        };

//---- Generic callback for Faust Interface
//---- Called every time an element of the UI changes value
	interfaceCallback(event){
	
		var text = event.target.parentNode.label;

		var val = event.target.value;
					
		val = Number((event.target.value*event.target.parentNode.childNodes[0].getAttribute('step')) + Number(event.target.parentNode.childNodes[0].getAttribute('min'))).toFixed(event.target.parentNode.childNodes[0].getAttribute('precision'));

		if(event.type == "mousedown")
			val = 1;
		else if(event.type == "mouseup")
			val = 0;
		
//---- TODO: yes, this is lazy coding, and fragile. - Historical from Chris Web Audio Playground
		var output = event.target.parentNode.children[0].children[1];

//---- update the value text
		if(output)
			output.innerHTML = "" + val.toString() + " " + output.getAttribute("units");

		if(event.target.type == "submit")
			val = App.buttonVal;

		if(App.buttonVal == 0)
			App.buttonVal = 1;
		else
			App.buttonVal = 0;

// 	Search for DSP then update the value of its parameter.
		this.fDSP.setValue(text, val);
        };
	
// Save graphical parameters of a Faust Node
	saveParams (){
		
		var interfaceElements = this.fInterfaceContainer.childNodes;
			
        for (var j = 0; j < interfaceElements.length; j++){
            var interfaceElement: IinterfaceElement = <IinterfaceElement>interfaceElements[j];
            if (interfaceElement.className == "control-group"){

                var text = interfaceElement.label;
				
				this.fParams[text] = this.fDSP.getValue(text);	
			}
		}
        };
	recallParams (){

		for (var key in this.fParams)
            this.fDSP.setValue(key, this.fParams[key]);
    };
    getParams() {
        return this.fParams;
    };
	setParams(parameters){
		this.fParams = parameters;
     };
	addParam(path, value){
		this.fParams[path] = value;
    };
		
/******************* GET/SET INPUT/OUTPUT NODES **********************/
	addInputOutputNodes  (){
		
		if(this.fDSP.getNumInputs() > 0) {
		
			this.fInputNode=document.createElement("div");
			this.fInputNode.className="node node-input";
	    	this.addCnxListener(this.fInputNode, "mousedown");
			this.fInputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
		
			this.fModuleContainer.appendChild(this.fInputNode);
		}
			
		if (this.fDSP.getNumOutputs() > 0) {
		
			this.fOutputNode=document.createElement("div");
			this.fOutputNode.className="node node-output";
            this.addCnxListener(this.fOutputNode, "mousedown");
			this.fOutputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
		
			this.fModuleContainer.appendChild(this.fOutputNode);
		}		
        };
	deleteInputOutputNodes (){
	
		if(this.fInputNode)
			this.fModuleContainer.removeChild(this.fInputNode);
	
		if(this.fOutputNode)
			this.fModuleContainer.removeChild(this.fOutputNode);	
        };
// Added for physical Input and Output which are create outside of ModuleClass (--> see Playground.js or Pedagogie.js)
	setInputOutputNodes  (input, output){
		
		this.fInputNode = input;
        if (this.fInputNode)
            this.addCnxListener(this.fInputNode, "mousedown");
	    	
		this.fOutputNode = output;	
		if(this.fOutputNode)
	    	this.addCnxListener(this.fOutputNode, "mousedown");
        };
	
        /****************** ADD/REMOVE ACTION LISTENERS **********************/
        addListener(type, module: ModuleClass) {
            var self = module
            document.addEventListener(type, module.eventHandler, true);
        };
        removeListener(div, type) {
            var module = this;
            div.removeEventListener(type, module.eventHandler, true);

        };
	addCnxListener (div, type){
		if(type == "mousedown")
			div.addEventListener(type, this.dragCnxCallback, true);
		else
			document.addEventListener(type, this.dragCnxCallback, true);
        };
	removeCnxListener (div, type){
		document.removeEventListener(type, this.dragCnxCallback, true);
        };
		
/**********************************************************************/
	isPointInOutput (x, y ){
	
		if(this.fOutputNode && this.fOutputNode.getBoundingClientRect().left < x && x < this.fOutputNode.getBoundingClientRect().right && this.fOutputNode.getBoundingClientRect().top < y && y< this.fOutputNode.getBoundingClientRect().bottom)
			return true;
			
		return false;
        };
	isPointInInput(x, y){			

		if(this.fInputNode && this.fInputNode.getBoundingClientRect().left <= x && x <= this.fInputNode.getBoundingClientRect().right && this.fInputNode.getBoundingClientRect().top <= y && y <= this.fInputNode.getBoundingClientRect().bottom)
			return true;
			
		return false;
        };

	isPointInNode (x, y ){
	
		if(this.fModuleContainer && this.fModuleContainer.getBoundingClientRect().left < x && x < this.fModuleContainer.getBoundingClientRect().right && this.fModuleContainer.getBoundingClientRect().top < y && y < this.fModuleContainer.getBoundingClientRect().bottom)
			return true;
			
		return false;
        };
};

