/*				MODULECLASS.JS
	HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE AND ITS INTERFACE

*/

/// <reference path="../Dragging.ts"/>
/// <reference path="../CodeFaustParser.ts"/>
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/FaustInterface.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ModuleFaust.ts"/>
/// <reference path="ModuleView.ts"/>

interface DSPCallback 	{ (): void; }

class ModuleClass  {
    static isNodesModuleUnstyle: boolean = true;
    //drag object to handle dragging of module and connection
    drag: Drag = new Drag()
    dragList: Drag[] = [];
    //used only for save or recall
    patchID: string;

    moduleView: ModuleView;
    moduleFaust: ModuleFaust;
    moduleControles: FaustInterfaceControler[] = [];

    private deleteCallback: (module: ModuleClass) => void;
    private fModuleInterfaceParams: { [label: string]: string } = {};

    eventDraggingHandler: (event: MouseEvent) => void;
    eventConnectorHandler: (event: Event) => void;
    eventOpenEditHandler: () => void;
    eventCloseEditHandler: (event: Event) => void;
    compileFaust: (conpileFaust: CompileFaust) => void;

    constructor(id: number, x: number, y: number, name: string, htmlElementModuleContainer: HTMLElement, removeModuleCallBack: (m: ModuleClass) => void, compileFaust: (compileFaust: CompileFaust) => void) {
        this.eventConnectorHandler = (event: MouseEvent) => { this.dragCnxCallback(event, this) };
        this.eventCloseEditHandler = (event: MouseEvent) => { this.recompileSource(event, this) }
        this.eventOpenEditHandler = () => { this.edit() }
        this.compileFaust = compileFaust;

        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = (event) => { this.dragCallback(event, this) };

        this.moduleView = new ModuleView();
        this.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer);
        this.moduleFaust = new ModuleFaust(name);
        this.addEvents();
    }

    //add all event listener to the moduleView
    addEvents() {
        this.moduleView.getModuleContainer().addEventListener("mousedown", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchstart", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchmove", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchend", this.eventDraggingHandler, false);
        if (this.moduleView.textArea != undefined) {
            this.moduleView.textArea.addEventListener("touchstart", (e) => { e.stopPropagation() });
            this.moduleView.textArea.addEventListener("touchend", (e) => { e.stopPropagation() });
            this.moduleView.textArea.addEventListener("touchmove", (e) => { e.stopPropagation() });
            this.moduleView.textArea.addEventListener("mousedown", (e) => { e.stopPropagation() });
        }
        if (this.moduleView.closeButton != undefined) {
            this.moduleView.closeButton.addEventListener("click", () => { this.deleteModule(); });
            this.moduleView.closeButton.addEventListener("touchend", () => { this.deleteModule(); });
        }
        if (this.moduleView.miniButton != undefined) {
            this.moduleView.miniButton.addEventListener("click", () => { this.minModule(); });
            this.moduleView.miniButton.addEventListener("touchend", () => { this.minModule(); });
        }
        if (this.moduleView.maxButton != undefined) {
            this.moduleView.maxButton.addEventListener("click", () => { this.maxModule(); });
            this.moduleView.maxButton.addEventListener("touchend", () => { this.maxModule(); });
        }
        if (this.moduleView.fEditImg != undefined) {
            this.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
            this.moduleView.fEditImg.addEventListener("touchend",  this.eventOpenEditHandler);
        }
    }

    /***************  PRIVATE METHODS  ******************************/

    private dragCallback(event: Event, module: ModuleClass): void {

        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module, e) => { module.drag.startDraggingModule(el, x, y, module, e) });
        } else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module, e) => { module.drag.stopDraggingModule(el, x, y, module, e) });
        } else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module, e) => { module.drag.whileDraggingModule(el, x, y, module, e) });
        } else if (event.type == "touchstart") {
            module.drag.getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module, e) => { module.drag.startDraggingModule(el, x, y, module, e) });
        } else if (event.type == "touchmove") {
            module.drag.getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module, e) => { module.drag.whileDraggingModule(el, x, y, module, e) });
        } else if (event.type == "touchend") {
            module.drag.getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module, e) => { module.drag.stopDraggingModule(el, x, y, module, e) });
        }
    }

    private dragCnxCallback(event: Event, module: ModuleClass): void {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module, e) => { module.drag.startDraggingConnector(el, x, y, module, e) });
        } else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module) => { module.drag.stopDraggingConnector(el, x, y, module) });
        } else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(<MouseEvent>event, module, (el, x, y, module, e) => { module.drag.whileDraggingConnector(el, x, y, module, e) });
        } else if (event.type == "touchstart") {
            var newdrag = new Drag();
            newdrag.isDragConnector = true;
            newdrag.originTarget = <HTMLElement>event.target;
            module.dragList.push(newdrag);
            var index = module.dragList.length - 1
            module.dragList[index].getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module, e) => { module.dragList[index].startDraggingConnector(el, x, y, module, e) });

        } else if (event.type == "touchmove") {

            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module, e) => { module.dragList[i].whileDraggingConnector(el, x, y, module, e) })
                }
            }
        } else if (event.type == "touchend") {
            var customEvent = new CustomEvent("unstylenode");
            document.dispatchEvent(customEvent);
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module) => { module.dragList[i].stopDraggingConnector(el, x, y, module) });
                }
            }
            document.dispatchEvent(customEvent);
        }
    }

    /*******************************  PUBLIC METHODS  **********************************/
    deleteModule(): void {

        var connector: Connector = new Connector()
        connector.disconnectModule(this);

        this.deleteFaustInterface();

        // Then delete the visual element
        if (this.moduleView) {
            this.moduleView.fModuleContainer.parentNode.removeChild(this.moduleView.fModuleContainer);
        }

        this.deleteDSP(this.moduleFaust.fDSP);
        this.moduleFaust.fDSP = null;
        faust.deleteDSPFactory(this.moduleFaust.factory);
        this.moduleFaust.factory = null;
        this.deleteCallback(this);
    }
	//make module smaller
    minModule() {
        this.moduleView.fInterfaceContainer.classList.add("mini");
        this.moduleView.fTitle.classList.add("miniTitle");
        this.moduleView.miniButton.style.display = "none";
        this.moduleView.maxButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    }
	//restore module size
    maxModule() {
        this.moduleView.fInterfaceContainer.classList.remove("mini");
        this.moduleView.fTitle.classList.remove("miniTitle");
        this.moduleView.maxButton.style.display = "none";
        this.moduleView.miniButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    }

    //--- Create and Update are called once a source code is compiled and the factory exists
    createDSP(factory: Factory, callback: DSPCallback): void {
        this.moduleFaust.factory = factory;
        try {
            if (factory != null) {
            	var moduleFaust = this.moduleFaust;
                faust.createDSPInstance(factory, Utilitary.audioContext, 1024,
                  function(dsp) {
                    if (dsp != null) {
                      moduleFaust.fDSP = dsp;
                      callback();
                    } else {
                      new Message(Utilitary.messageRessource.errorCreateDSP);
                      Utilitary.hideFullPageLoading();
                    }
                  });
                // To activate the AudioWorklet mode
                //faust.createDSPWorkletInstance(factory, Utilitary.audioContext, function(dsp) { moduleFaust.fDSP = dsp; callback(); });
            } else {
                throw new Error("create DSP Error : null factory");
            }
        } catch (e) {
            new Message(Utilitary.messageRessource.errorCreateDSP + " : " + e)
            Utilitary.hideFullPageLoading();
        }
    }

    //--- Update DSP in module
    private updateDSP(factory: Factory, module: ModuleClass): void {

        var toDelete: IfDSP = module.moduleFaust.fDSP;

        // 	Save Cnx
        var saveOutCnx: Connector[] = new Array().concat(module.moduleFaust.fOutputConnections);
        var saveInCnx: Connector[] = new Array().concat(module.moduleFaust.fInputConnections);

        // Delete old ModuleClass
        var connector: Connector = new Connector();
        connector.disconnectModule(module);

        module.deleteFaustInterface();
        module.moduleView.deleteInputOutputNodes();

        // Create new one
		module.createDSP(factory, function() {
        	module.moduleFaust.fName = module.moduleFaust.fTempName;
        	module.moduleFaust.fSource = module.moduleFaust.fTempSource
        	module.setFaustInterfaceControles()
        	module.createFaustInterface();
        	module.addInputOutputNodes();

        	module.deleteDSP(toDelete);

        	// Recall Cnx
        	if (saveOutCnx && module.moduleView.getOutputNode()) {
          	  	for (var i = 0; i < saveOutCnx.length; i++) {
               	 	if (saveOutCnx[i])
                   		connector.createConnection(module, module.moduleView.getOutputNode(), saveOutCnx[i].destination, saveOutCnx[i].destination.moduleView.getInputNode());
            	}
        	}
        	if (saveInCnx && module.moduleView.getInputNode()) {
           	 	for (var i = 0; i < saveInCnx.length; i++) {
                	if (saveInCnx[i])
                    	connector.createConnection(saveInCnx[i].source, saveInCnx[i].source.moduleView.getOutputNode(), module, module.moduleView.getInputNode());
            	}
        	}
        	Utilitary.hideFullPageLoading();
        });
    }

    private deleteDSP(todelete: IfDSP): void {
        if (todelete)
            faust.deleteDSPInstance(todelete);
    }
    /******************** EDIT SOURCE & RECOMPILE *************************/
    edit(): void {

        this.saveInterfaceParams();

        var event: CustomEvent = new CustomEvent("codeeditevent")
        document.dispatchEvent(event);

        this.deleteFaustInterface();

        this.moduleView.textArea.style.display = "block";
        this.moduleView.textArea.value = this.moduleFaust.fSource;
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
        this.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "enter.png)";
        this.moduleView.fEditImg.addEventListener("click", this.eventCloseEditHandler);
        this.moduleView.fEditImg.addEventListener("touchend", this.eventCloseEditHandler);
        this.moduleView.fEditImg.removeEventListener("click", this.eventOpenEditHandler);
        this.moduleView.fEditImg.removeEventListener("touchend", this.eventOpenEditHandler);
    }

    //---- Update ModuleClass with new name/code source
    update(name: string, code: string): void {

        var event: CustomEvent = new CustomEvent("codeeditevent")
        document.dispatchEvent(event);
        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module: ModuleClass = this;
        this.compileFaust({ name: name, sourceCode: code, x: this.moduleView.x, y: this.moduleView.y, callback: (factory) => { module.updateDSP(factory, module) }});
    }

    //---- React to recompilation triggered by click on icon
    private recompileSource(event: MouseEvent, module: ModuleClass): void {
        Utilitary.showFullPageLoading();
        var dsp_code: string = this.moduleView.textArea.value;
        this.moduleView.textArea.style.display = "none";
        Connector.redrawOutputConnections(this, this.drag);
        Connector.redrawInputConnections(this, this.drag)
        module.update(this.moduleView.fTitle.textContent, dsp_code);
        module.recallInterfaceParams();

        module.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "edit.png)";
        module.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
        module.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        module.moduleView.fEditImg.removeEventListener("click", this.eventCloseEditHandler);
        module.moduleView.fEditImg.removeEventListener("touchend", this.eventCloseEditHandler);
    }

    /***************** CREATE/DELETE the DSP Interface ********************/

    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    setFaustInterfaceControles(): void {

        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        var moduleFaustInterface = new FaustInterfaceControler(
            (faustInterface) => { this.interfaceSliderCallback(faustInterface) },
            (adress, value) => { this.moduleFaust.fDSP.setParamValue(adress, value) }
            );
        this.moduleControles = moduleFaustInterface.parseFaustJsonUI(JSON.parse(this.moduleFaust.fDSP.getJSON()).ui, this);
    }

    // Create FaustInterfaceControler, set its callback and add its AccelerometerSlider
    createFaustInterface() {
        for (var i = 0; i < this.moduleControles.length; i++) {
            var faustInterfaceControler = this.moduleControles[i];
            faustInterfaceControler.setParams();
            faustInterfaceControler.faustInterfaceView = new FaustInterfaceView(faustInterfaceControler.itemParam.type)
            this.moduleView.getInterfaceContainer().appendChild(faustInterfaceControler.createFaustInterfaceElement());
            faustInterfaceControler.interfaceCallback = this.interfaceSliderCallback.bind(this);
            faustInterfaceControler.updateFaustCodeCallback = this.updateCodeFaust.bind(this);
            faustInterfaceControler.setEventListener();
            faustInterfaceControler.createAccelerometer();
        }
    }

    // Delete all FaustInterfaceControler
    private deleteFaustInterface(): void {
        this.deleteAccelerometerRef();

        while (this.moduleView.fInterfaceContainer.childNodes.length != 0) {
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
        }
    }

    // Remove AccelerometerSlider ref from AccelerometerHandler
    private deleteAccelerometerRef() {
        for (var i = 0; i < this.moduleControles.length; i++) {
            if (this.moduleControles[i].accelerometerSlider != null && this.moduleControles[i].accelerometerSlider != undefined) {
                var index = AccelerometerHandler.faustInterfaceControler.indexOf(this.moduleControles[i]);
                AccelerometerHandler.faustInterfaceControler.splice(index, 1);
                delete this.moduleControles[i].accelerometerSlider ;
            }
        }
        this.moduleControles = [];
    }

    // set DSP value to all FaustInterfaceControlers
    setDSPValue() {
        for (var i = 0; i < this.moduleControles.length; i++){
            this.moduleFaust.fDSP.setParamValue(this.moduleControles[i].itemParam.address, this.moduleControles[i].value)
        }
    }

    // set DSP value to specific FaustInterfaceControlers
    setDSPValueCallback(address: string, value: string) {
        this.moduleFaust.fDSP.setParamValue(address, value)
    }

    // Updates Faust Code with new accelerometer metadata
    updateCodeFaust(details: ElementCodeFaustParser) {
        var m = forgeAccMetadata(details.newAccValue, details.isEnabled);
        var s = updateAccInFaustCode(this.moduleFaust.fSource, details.sliderName, m );
        this.moduleFaust.fSource = s;
    }

    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    interfaceSliderCallback(faustControler: FaustInterfaceControler): any {
        var val: string
        if (faustControler.faustInterfaceView.slider) {
            var input: HTMLInputElement = faustControler.faustInterfaceView.slider;
            val = Number((parseFloat(input.value) * parseFloat(faustControler.itemParam.step)) + parseFloat(faustControler.itemParam.min)).toFixed(parseFloat(faustControler.precision));
        } else if (faustControler.faustInterfaceView.button) {
            var input: HTMLInputElement = faustControler.faustInterfaceView.button;
            if (faustControler.value == undefined || faustControler.value == "0") {
                faustControler.value = val = "1"
            } else {
                faustControler.value = val = "0"
            }
        }
        var text: string = faustControler.itemParam.address;
        faustControler.value = val;

        var output: HTMLElement = faustControler.faustInterfaceView.output;

        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + faustControler.unit;

        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setParamValue(text, val);
    }
    interfaceButtonCallback(faustControler: FaustInterfaceControler, val?: number): any {

        var text: string = faustControler.itemParam.address;
        faustControler.value = val.toString();

        var output: HTMLElement = faustControler.faustInterfaceView.output;

        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + faustControler.unit;

        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setParamValue(text, val.toString());
    }

    // Save graphical parameters of a Faust Node
    private saveInterfaceParams(): void {

        var controls = this.moduleControles;
        for (var j = 0; j < controls.length; j++) {
            var text: string = controls[j].itemParam.address;
            this.fModuleInterfaceParams[text] = controls[j].value;
        }
    }
    recallInterfaceParams(): void {

        for (var key in this.fModuleInterfaceParams)
            this.moduleFaust.fDSP.setParamValue(key, this.fModuleInterfaceParams[key]);
    }
    getInterfaceParams(): { [label: string]:string }{
        return this.fModuleInterfaceParams;
    }
    setInterfaceParams(parameters: { [label: string]: string }): void {
        this.fModuleInterfaceParams = parameters;
    }
    addInterfaceParam(path: string, value: number): void {
        this.fModuleInterfaceParams[path] = value.toString();
    }

    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    addInputOutputNodes(): void {
        if (this.moduleFaust.fDSP.getNumInputs() > 0 && this.moduleView.fName != "input") {
            this.moduleView.setInputNode();
            this.moduleView.fInputNode.addEventListener("mousedown", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchstart", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchmove", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchend", this.eventConnectorHandler);
        }

        if (this.moduleFaust.fDSP.getNumOutputs() > 0 && this.moduleView.fName != "output") {
            this.moduleView.setOutputNode();
            this.moduleView.fOutputNode.addEventListener("mousedown", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchstart", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchmove", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchend", this.eventConnectorHandler);
        }
    }
    //manage style of node when touchover will dragging
    //make the use easier for connections
    styleInputNodeTouchDragOver(el: HTMLElement) {
        el.style.border = "15px double rgb(0, 211, 255)"
        el.style.left = "-32px"
        el.style.marginTop = "-32px"
        ModuleClass.isNodesModuleUnstyle = false;
    }
    styleOutputNodeTouchDragOver(el: HTMLElement) {
        el.style.border = "15px double rgb(0, 211, 255)"
        el.style.right = "-32px"
        el.style.marginTop = "-32px"
        ModuleClass.isNodesModuleUnstyle = false;
    }
}
