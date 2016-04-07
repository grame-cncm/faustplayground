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
/// <reference path="../Messages.ts"/>
"use strict";
var ModuleClass = (function () {
    function ModuleClass(id, x, y, name, htmlElementModuleContainer, removeModuleCallBack, compileFaust) {
        var _this = this;
        this.drag = new Drag();
        this.dragList = [];
        this.moduleControles = [];
        this.fModuleInterfaceParams = {};
        this.eventConnectorHandler = function (event) { _this.dragCnxCallback(event, _this); };
        this.eventCloseEditHandler = function (event) { _this.recompileSource(event, _this); };
        this.eventOpenEditHandler = function () { _this.edit(); };
        this.compileFaust = compileFaust;
        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it
        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = function (event) { _this.dragCallback(event, _this); };
        this.moduleView = new ModuleView();
        this.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer, this);
        this.moduleFaust = new ModuleFaust(name);
        this.init();
    }
    ModuleClass.prototype.init = function () {
        var _this = this;
        this.moduleView.getModuleContainer().addEventListener("mousedown", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchstart", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchmove", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchend", this.eventDraggingHandler, false);
        if (this.moduleView.textArea != undefined) {
            this.moduleView.textArea.addEventListener("touchstart", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchend", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchmove", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("mousedown", function (e) { e.stopPropagation(); });
        }
        if (this.moduleView.closeButton != undefined) {
            this.moduleView.closeButton.addEventListener("click", function () { _this.deleteModule(); });
            this.moduleView.closeButton.addEventListener("touchend", function () { _this.deleteModule(); });
        }
        if (this.moduleView.miniButton != undefined) {
            this.moduleView.miniButton.addEventListener("click", function () { _this.minModule(); });
            this.moduleView.miniButton.addEventListener("touchend", function () { _this.minModule(); });
        }
        if (this.moduleView.maxButton != undefined) {
            this.moduleView.maxButton.addEventListener("click", function () { _this.maxModule(); });
            this.moduleView.maxButton.addEventListener("touchend", function () { _this.maxModule(); });
        }
        if (this.moduleView.fEditImg != undefined) {
            this.moduleView.fEditImg.addEventListener("click", function () { _this.eventOpenEditHandler(); });
            this.moduleView.fEditImg.addEventListener("touchend", function () { _this.eventOpenEditHandler(); });
        }
    };
    /***************  PRIVATE METHODS  ******************************/
    ModuleClass.prototype.dragCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchend") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
    };
    ModuleClass.prototype.dragCnxCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module) { module.drag.stopDraggingConnector(el, x, y, module); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            var newdrag = new Drag();
            newdrag.isDragConnector = true;
            newdrag.originTarget = event.target;
            module.dragList.push(newdrag);
            var index = module.dragList.length - 1;
            module.dragList[index].getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.dragList[index].startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.dragList[i].whileDraggingConnector(el, x, y, module, e); });
                }
            }
        }
        else if (event.type == "touchend") {
            var customEvent = new CustomEvent("unstylenode");
            document.dispatchEvent(customEvent);
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, function (el, x, y, module) { module.dragList[i].stopDraggingConnector(el, x, y, module); });
                }
            }
            document.dispatchEvent(customEvent);
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
        this.deleteCallback(this);
    };
    ModuleClass.prototype.minModule = function () {
        this.moduleView.fInterfaceContainer.classList.add("mini");
        this.moduleView.fTitle.classList.add("miniTitle");
        this.moduleView.miniButton.style.display = "none";
        this.moduleView.maxButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    };
    ModuleClass.prototype.maxModule = function () {
        this.moduleView.fInterfaceContainer.classList.remove("mini");
        this.moduleView.fTitle.classList.remove("miniTitle");
        this.moduleView.maxButton.style.display = "none";
        this.moduleView.miniButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    };
    //--- Create and Update are called once a source code is compiled and the factory exists
    ModuleClass.prototype.createDSP = function (factory) {
        this.moduleFaust.factory = factory;
        try {
            if (factory != null) {
                this.moduleFaust.fDSP = faust.createDSPInstance(factory, App.audioContext, 1024);
            }
            else {
                throw new Error("create DSP Error factory null");
            }
        }
        catch (e) {
            new Message(App.messageRessource.errorCreateDSP + " : " + e);
            App.hideFullPageLoading();
        }
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
        module.setFaustInterfaceControles();
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
    ModuleClass.prototype.edit = function () {
        this.saveInterfaceParams();
        var event = new CustomEvent("codeeditevent");
        document.dispatchEvent(event);
        this.deleteFaustInterface();
        this.moduleView.textArea.style.display = "block";
        this.moduleView.textArea.value = this.moduleFaust.fSource;
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
        this.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "enter.png)";
        this.moduleView.fEditImg.addEventListener("click", this.eventCloseEditHandler);
        this.moduleView.fEditImg.addEventListener("touchend", this.eventCloseEditHandler);
        this.moduleView.fEditImg.removeEventListener("click", this.eventOpenEditHandler);
        this.moduleView.fEditImg.removeEventListener("touchend", this.eventOpenEditHandler);
    };
    //---- Update ModuleClass with new name/code source
    ModuleClass.prototype.update = function (name, code) {
        var event = new CustomEvent("codeeditevent");
        document.dispatchEvent(event);
        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module = this;
        this.compileFaust({ name: name, sourceCode: code, x: this.moduleView.x, y: this.moduleView.y, callback: function (factory) { module.updateDSP(factory, module); } });
    };
    //---- React to recompilation triggered by click on icon
    ModuleClass.prototype.recompileSource = function (event, module) {
        App.showFullPageLoading();
        var buttonImage = event.target;
        var dsp_code = this.moduleView.textArea.value;
        this.moduleView.textArea.style.display = "none";
        Connector.redrawOutputConnections(this, this.drag);
        Connector.redrawInputConnections(this, this.drag);
        module.update(this.moduleView.fTitle.textContent, dsp_code);
        module.recallInterfaceParams();
        module.moduleView.fEditImg.style.backgroundImage = "url(" + App.baseImg + "edit.png)";
        module.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
        module.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        module.moduleView.fEditImg.removeEventListener("click", this.eventCloseEditHandler);
        module.moduleView.fEditImg.removeEventListener("touchend", this.eventCloseEditHandler);
    };
    /***************** CREATE/DELETE the DSP Interface ********************/
    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    ModuleClass.prototype.setFaustInterfaceControles = function () {
        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        var moduleFaustInterface = new FaustInterfaceControler();
        this.moduleControles = moduleFaustInterface.parseFaustJsonUI(JSON.parse(this.moduleFaust.fDSP.json()).ui, this);
    };
    ModuleClass.prototype.createFaustInterface = function () {
        var _this = this;
        for (var i = 0; i < this.moduleControles.length; i++) {
            var faustInterfaceControler = this.moduleControles[i];
            faustInterfaceControler.setParams();
            faustInterfaceControler.faustInterfaceView = new FaustInterfaceView(faustInterfaceControler.itemParam.type);
            this.moduleView.getInterfaceContainer().appendChild(faustInterfaceControler.createFaustInterfaceElement());
            faustInterfaceControler.setEventListener(function (event) { _this.interfaceCallback(event, faustInterfaceControler); });
        }
    };
    ModuleClass.prototype.deleteFaustInterface = function () {
        this.deleteAccelerometerRef();
        while (this.moduleView.fInterfaceContainer.childNodes.length != 0) {
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
        }
    };
    ModuleClass.prototype.deleteAccelerometerRef = function () {
        for (var i = 0; i < this.moduleControles.length; i++) {
            if (this.moduleControles[i].accelerometerSlider != null && this.moduleControles[i].accelerometerSlider != undefined) {
                var index = AccelerometerHandler.accelerometerSliders.indexOf(this.moduleControles[i].accelerometerSlider);
                AccelerometerHandler.accelerometerSliders.splice(index, 1);
                delete this.moduleControles[i].accelerometerSlider;
            }
        }
        this.moduleControles = [];
    };
    ModuleClass.prototype.setDSPValue = function () {
        for (var i = 0; i < this.moduleControles.length; i++) {
            this.moduleFaust.fDSP.setValue(this.moduleControles[i].itemParam.address, this.moduleControles[i].value);
        }
    };
    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    ModuleClass.prototype.interfaceCallback = function (event, faustControler) {
        var input = faustControler.faustInterfaceView.slider;
        var text = faustControler.itemParam.address;
        var val = Number((parseFloat(input.value) * parseFloat(faustControler.itemParam.step)) + parseFloat(faustControler.itemParam.min)).toFixed(parseFloat(faustControler.precision));
        faustControler.value = val;
        var output = faustControler.faustInterfaceView.output;
        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + output.getAttribute("units");
        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setValue(text, val);
    };
    // Save graphical parameters of a Faust Node
    ModuleClass.prototype.saveInterfaceParams = function () {
        var interfaceElements = this.moduleView.fInterfaceContainer.childNodes;
        var controls = this.moduleControles;
        for (var j = 0; j < controls.length; j++) {
            var text = controls[j].itemParam.address;
            this.fModuleInterfaceParams[text] = controls[j].value;
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
        this.fModuleInterfaceParams[path] = value.toString();
    };
    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    ModuleClass.prototype.addInputOutputNodes = function () {
        var module = this;
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
    };
    ModuleClass.prototype.styleInputNodeTouchDragOver = function (el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.left = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    };
    ModuleClass.prototype.styleOutputNodeTouchDragOver = function (el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.right = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    };
    ModuleClass.isNodesModuleUnstyle = true;
    return ModuleClass;
}());
//# sourceMappingURL=ModuleClass.js.map