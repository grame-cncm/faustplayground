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
var ModuleClass = (function () {
    function ModuleClass(id, x, y, name, sceneParent, htmlElementModuleContainer, removeModuleCallBack) {
        this.drag = new Drag();
        this.fModuleInterfaceParams = [];
        this.sceneParent = sceneParent;
        var self = this;
        this.eventConnectorHandler = function (event) { self.dragCnxCallback(event, self); };
        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it
        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = function (event) { self.dragCallback(event, self); };
        self.moduleView = new ModuleView();
        self.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer, self);
        self.moduleFaust = new ModuleFaust(name);
    }
    /***************  PRIVATE METHODS  ******************************/
    ModuleClass.prototype.dragCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.startDraggingModule(event, module);
        }
        else if (event.type == "mouseup") {
            module.drag.stopDraggingModule(event, module);
        }
        else if (event.type == "mousemove") {
            module.drag.whileDraggingModule(event, module);
        }
    };
    ModuleClass.prototype.dragCnxCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.startDraggingConnector(module, event);
        }
        else if (event.type == "mouseup") {
            module.drag.stopDraggingConnector(module, event);
        }
        else if (event.type == "mousemove") {
            module.drag.whileDraggingConnector(module, event);
        }
    };
    /*******************************  PUBLIC METHODS  **********************************/
    ModuleClass.prototype.deleteModule = function () {
        var connector = new Connector();
        connector.disconnectModule(this);
        this.deleteFaustInterface();
        // Then delete the visual element
        if (this.moduleView)
            this.moduleView.fModuleContainer.parentNode.removeChild(this.moduleView.fModuleContainer);
        this.deleteDSP(this.moduleFaust.fDSP);
        this.deleteCallback(this, this.sceneParent);
    };
    //--- Create and Update are called once a source code is compiled and the factory exists
    ModuleClass.prototype.createDSP = function (factory) {
        this.moduleFaust.fDSP = faust.createDSPInstance(factory, App.audioContext, 1024);
    };
    //--- Update DSP in module 
    ModuleClass.prototype.updateDSP = function (factory, module) {
        var toDelete = module.moduleFaust.fDSP;
        // 	Save Cnx
        var saveOutCnx = new Array().concat(module.moduleFaust.fOutputConnections);
        var saveInCnx = new Array().concat(module.moduleFaust.fInputConnections);
        // Delete old ModuleClass 
        var connector = new Connector();
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
        App.hideFullPageLoading();
    };
    ModuleClass.prototype.deleteDSP = function (todelete) {
        // 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
        // 		if(todelete)
        // 		    faust.deleteDSPInstance(todelete);
    };
    /******************** EDIT SOURCE & RECOMPILE *************************/
    ModuleClass.prototype.edit = function (module) {
        module.saveInterfaceParams();
        module.deleteFaustInterface();
        var textArea = document.createElement("textarea");
        textArea.rows = 15;
        textArea.cols = 60;
        textArea.value = this.moduleFaust.fSource;
        module.moduleView.fInterfaceContainer.appendChild(textArea);
        //module.moduleView.fEditImg.src = App.baseImg + "enter.png";
        module.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "enter.png)";
        module.moduleView.fEditImg.onclick = function (event) { module.recompileSource(event, module); };
        module.moduleView.fEditImg.area = textArea;
    };
    //---- Update ModuleClass with new name/code source
    ModuleClass.prototype.update = function (name, code) {
        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module = this;
        this.sceneParent.parent.compileFaust(name, code, this.moduleView.x, this.moduleView.y, function (factory) { module.updateDSP(factory, module); });
    };
    //---- React to recompilation triggered by click on icon
    ModuleClass.prototype.recompileSource = function (event, module) {
        App.showFullPageLoading();
        var buttonImage = event.target;
        var dsp_code = buttonImage.area.value;
        module.update(this.moduleView.fTitle.textContent, dsp_code);
        module.recallInterfaceParams();
        module.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "edit.png)";
        module.moduleView.fEditImg.onclick = function () { module.edit(module); };
    };
    /***************** CREATE/DELETE the DSP Interface ********************/
    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    ModuleClass.prototype.createFaustInterface = function () {
        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        var faustInterface = new FaustInterface();
        faustInterface.parse_ui(JSON.parse(this.moduleFaust.fDSP.json()).ui, this);
    };
    ModuleClass.prototype.deleteFaustInterface = function () {
        while (this.moduleView.fInterfaceContainer.childNodes.length != 0)
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
    };
    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    ModuleClass.prototype.interfaceCallback = function (event, module) {
        var input = event.target;
        var groupInput = input.parentNode;
        var elementInInterfaceGroup = groupInput.childNodes[0];
        var text = groupInput.label;
        var val = input.value;
        val = Number((parseFloat(input.value) * parseFloat(elementInInterfaceGroup.getAttribute('step'))) + parseFloat(elementInInterfaceGroup.getAttribute('min'))).toFixed(parseFloat(elementInInterfaceGroup.getAttribute('precision')));
        if (event.type == "mousedown")
            val = "1";
        else if (event.type == "mouseup")
            val = "0";
        //---- TODO: yes, this is lazy coding, and fragile. - Historical from Chris Web Audio Playground
        //var output = event.target.parentNode.children[0].children[1];
        var output = groupInput.getElementsByClassName("value")[0];
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
    };
    // Save graphical parameters of a Faust Node
    ModuleClass.prototype.saveInterfaceParams = function () {
        var interfaceElements = this.moduleView.fInterfaceContainer.childNodes;
        for (var j = 0; j < interfaceElements.length; j++) {
            var interfaceElement = interfaceElements[j];
            if (interfaceElement.className == "control-group") {
                var text = interfaceElement.label;
                this.fModuleInterfaceParams[text] = this.moduleFaust.fDSP.getValue(text);
            }
        }
    };
    ModuleClass.prototype.recallInterfaceParams = function () {
        for (var key in this.fModuleInterfaceParams)
            this.moduleFaust.fDSP.setValue(key, this.fModuleInterfaceParams[key]);
    };
    ModuleClass.prototype.getInterfaceParams = function () {
        return this.fModuleInterfaceParams;
    };
    ModuleClass.prototype.setInterfaceParams = function (parameters) {
        this.fModuleInterfaceParams = parameters;
    };
    ModuleClass.prototype.addInterfaceParam = function (path, value) {
        this.fModuleInterfaceParams[path] = value;
    };
    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    ModuleClass.prototype.addInputOutputNodes = function () {
        var module = this;
        if (this.moduleFaust.fDSP.getNumInputs() > 0 && this.moduleView.fName != "input") {
            this.moduleView.setInputNode();
            this.addCnxListener(this.moduleView.fInputNode, "mousedown", module);
        }
        if (this.moduleFaust.fDSP.getNumOutputs() > 0 && this.moduleView.fName != "output") {
            this.moduleView.setOutputNode();
            this.addCnxListener(this.moduleView.fOutputNode, "mousedown", module);
        }
    };
    // Added for physical Input and Output which are create outside of ModuleClass (--> see Playground.js or Pedagogie.js)
    ModuleClass.prototype.setInputOutputNodes = function (input, output) {
        var module = this;
        this.moduleView.fInputNode = input;
        if (this.moduleView.fInputNode)
            this.addCnxListener(this.moduleView.fInputNode, "mousedown", module);
        this.moduleView.fOutputNode = output;
        if (this.moduleView.fOutputNode)
            this.addCnxListener(this.moduleView.fOutputNode, "mousedown", module);
    };
    /****************** ADD/REMOVE ACTION LISTENERS **********************/
    ModuleClass.prototype.addListener = function (type, module) {
        document.addEventListener(type, module.eventDraggingHandler, true);
    };
    ModuleClass.prototype.removeListener = function (type, div, document) {
        var module = this;
        if (!document) {
            div.removeEventListener(type, module.eventDraggingHandler, true);
        }
        else {
            document.removeEventListener(type, module.eventDraggingHandler, true);
        }
    };
    ModuleClass.prototype.addCnxListener = function (div, type, module) {
        if (type == "mousedown") {
            div.addEventListener(type, module.eventConnectorHandler, true);
        }
        else {
            document.addEventListener(type, module.eventConnectorHandler, true);
        }
    };
    ModuleClass.prototype.removeCnxListener = function (div, type, module) {
        document.removeEventListener(type, module.eventConnectorHandler, true);
    };
    return ModuleClass;
})();
//# sourceMappingURL=ModuleClass.js.map