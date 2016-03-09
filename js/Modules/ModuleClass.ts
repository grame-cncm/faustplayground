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
/// <reference path="../Main.ts"/>
/// <reference path="../App.ts"/>



"use strict";



interface IModule {
    sceneParent: Scene;
}



class ModuleClass implements IModule {
    static isNodesModuleUnstyle: boolean = true;
    drag: Drag = new Drag()
    dragList: Drag[] = [];
    patchID: string;
    sceneParent: Scene;
    moduleView: ModuleView;
    moduleFaust: ModuleFaust;
    moduleFaustInterface: FaustInterface;
    private deleteCallback: (module: ModuleClass, scene: Scene) => void;
    private fModuleInterfaceParams: string[] = [];
    eventDraggingHandler: (event: MouseEvent) => void;
    eventConnectorHandler: (event: Event) => void;
    eventOpenEditHandler: () => void;
    eventCloseEditHandler: (event: Event) => void;





    constructor(id: number, x: number, y: number, name: string, sceneParent: Scene, htmlElementModuleContainer: HTMLElement, removeModuleCallBack: (m: ModuleClass, scene: Scene) => void) {
        this.sceneParent = sceneParent;
        var self: ModuleClass = this
        this.eventConnectorHandler = (event: MouseEvent) => { this.dragCnxCallback(event, this) };
        this.eventCloseEditHandler = (event: MouseEvent) => { this.recompileSource(event, this) }
        this.eventOpenEditHandler = () => { this.edit() }

        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it
        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = function (event) { self.dragCallback(event, self) };

        self.moduleView = new ModuleView();
        self.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer, self);
        self.moduleFaust = new ModuleFaust(name);

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
            this.sceneParent.unstyleNode()
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(<TouchEvent>event, module, (el, x, y, module) => { module.dragList[i].stopDraggingConnector(el, x, y, module) });
                }
            }
            this.sceneParent.unstyleNode();
        }
    }

    



    /*******************************  PUBLIC METHODS  **********************************/


    deleteModule(): void {
        var connector: Connector = new Connector()
        connector.disconnectModule(this);
        this.deleteFaustInterface();	
    
        // Then delete the visual element
        if (this.moduleView)
            this.moduleView.fModuleContainer.parentNode.removeChild(this.moduleView.fModuleContainer);

        this.deleteDSP(this.moduleFaust.fDSP);
        this.deleteCallback(this, this.sceneParent);
    }
	
	



	
    //--- Create and Update are called once a source code is compiled and the factory exists
    createDSP(factory: Factory): void {
        this.moduleFaust.fDSP = faust.createDSPInstance(factory, App.audioContext, 1024);
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

        module.createDSP(factory);
        module.moduleFaust.fName = module.moduleFaust.fTempName;
        module.moduleFaust.fSource = module.moduleFaust.fTempSource;
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
        App.hideFullPageLoading()

    }

    private deleteDSP(todelete: IfDSP): void {
        // 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
        // 		if(todelete)
        // 		    faust.deleteDSPInstance(todelete);
    }
    /******************** EDIT SOURCE & RECOMPILE *************************/
    edit(): void {

        this.saveInterfaceParams();

        this.deleteFaustInterface();

        var textArea: HTMLTextAreaElement = document.createElement("textarea");
        textArea.rows = 15;
        textArea.cols = 60;
        textArea.value = this.moduleFaust.fSource;
        this.moduleView.fInterfaceContainer.appendChild(textArea);

        //module.moduleView.fEditImg.src = App.baseImg + "enter.png";
        this.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "enter.png)";
        this.moduleView.fEditImg.addEventListener("click", this.eventCloseEditHandler);
        this.moduleView.fEditImg.addEventListener("touchend", this.eventCloseEditHandler);
        this.moduleView.fEditImg.removeEventListener("click", this.eventOpenEditHandler);
        this.moduleView.fEditImg.removeEventListener("touchend", this.eventOpenEditHandler);
        this.moduleView.fEditImg.area = textArea;
    }

    //---- Update ModuleClass with new name/code source
    update(name: string, code: string): void {


        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module: ModuleClass = this;
        this.sceneParent.parent.compileFaust(name, code, this.moduleView.x, this.moduleView.y, function (factory) { module.updateDSP(factory, module) });
    }
	
    //---- React to recompilation triggered by click on icon
    private recompileSource(event: MouseEvent, module: ModuleClass): void {
        App.showFullPageLoading();
        var buttonImage: HTMLfEdit = <HTMLfEdit>event.target;
        var dsp_code: string = buttonImage.area.value;

        module.update(this.moduleView.fTitle.textContent, dsp_code);
        module.recallInterfaceParams();

        module.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "edit.png)";
        module.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
        module.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        module.moduleView.fEditImg.removeEventListener("click", this.eventCloseEditHandler);
        module.moduleView.fEditImg.removeEventListener("touchend", this.eventCloseEditHandler);
    }
	
    /***************** CREATE/DELETE the DSP Interface ********************/

    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    createFaustInterface(): void {

        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        this.moduleFaustInterface = new FaustInterface()
        this.moduleFaustInterface.parse_ui(JSON.parse(this.moduleFaust.fDSP.json()).ui, this);
    }
    private deleteFaustInterface(): void {

        while (this.moduleView.fInterfaceContainer.childNodes.length != 0)
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
    }




    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    interfaceCallback(event: Event, module: ModuleClass): any {

        var input: HTMLInputElement = <HTMLInputElement>event.target
        var groupInput: HTMLinterfaceElement = <HTMLinterfaceElement>input.parentElement;
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
        module.moduleFaust.fDSP.setValue(text, val);
    }
	
    // Save graphical parameters of a Faust Node
    private saveInterfaceParams(): void {

        var interfaceElements: NodeList = this.moduleView.fInterfaceContainer.childNodes;

        for (var j = 0; j < interfaceElements.length; j++) {
            var interfaceElement: HTMLinterfaceElement = <HTMLinterfaceElement>interfaceElements[j];
            if (interfaceElement.className == "control-group") {

                var text: string = interfaceElement.label;

                this.fModuleInterfaceParams[text] = this.moduleFaust.fDSP.getValue(text);
            }
        }
    }
    recallInterfaceParams(): void {

        for (var key in this.fModuleInterfaceParams)
            this.moduleFaust.fDSP.setValue(key, this.fModuleInterfaceParams[key]);
    }
    getInterfaceParams(): string[] {
        return this.fModuleInterfaceParams;
    }
    setInterfaceParams(parameters: string[]): void {
        this.fModuleInterfaceParams = parameters;
    }
    addInterfaceParam(path: string, value: number): void {
        this.fModuleInterfaceParams[path] = value;
    }
		
    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    addInputOutputNodes(): void {
        var module: ModuleClass = this;
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

	
    /****************** ADD/REMOVE ACTION LISTENERS **********************/
    //addListener(type: string, module: ModuleClass): void {
    //    document.addEventListener(type, module.eventDraggingHandler, false);
    //}
    //removeListener(type: string, div?: HTMLElement, document?: Document): void {
    //    var module: ModuleClass = this;
    //    if (!document) {
    //        div.removeEventListener(type, module.eventDraggingHandler, false)
    //    } else {
    //        document.removeEventListener(type, module.eventDraggingHandler, false)
    //    }
    //}
    //addCnxListener(div: HTMLElement, type: string, module: ModuleClass): void {
    //    if (type == "mousedown" || type == "touchstart" || type == "touchmove" || type == "touchend"  ) {
    //        div.addEventListener(type, module.eventConnectorHandler, false);
    //    } else {
    //        document.addEventListener(type, module.eventConnectorHandler, false);
    //    }
    //}
    removeCnxListener(div: HTMLElement, type:string, module: ModuleClass):void {
        document.removeEventListener(type, module.eventConnectorHandler, false);
    }
		
    /**********************************************************************/


}

