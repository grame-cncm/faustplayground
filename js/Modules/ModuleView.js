/*				MODULEVIEW.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE  INTERFACE
    
    Interface structure
    ===================
    DIV --> this.fModuleContainer
    H6 --> fTitle
    DIV --> fInterfaceContainer
    DIV --> fCloseButton
    DIV --> fFooter
    IMG --> fEditImg
    ===================*/
var ModuleView = (function () {
    function ModuleView() {
        this.inputOutputNodeDimension = 32;
    }
    ModuleView.prototype.createModuleView = function (ID, x, y, name, htmlParent, module) {
        var self = this;
        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it
        //------- GRAPHICAL ELEMENTS OF MODULE
        var fModuleContainer = document.createElement("div");
        fModuleContainer.className = "moduleFaust";
        fModuleContainer.style.left = "" + x + "px";
        fModuleContainer.style.top = "" + y + "px";
        var fTitle = document.createElement("h6");
        fTitle.className = "module-title";
        fTitle.textContent = "";
        fModuleContainer.appendChild(fTitle);
        var fInterfaceContainer = document.createElement("div");
        fInterfaceContainer.className = "content";
        fModuleContainer.appendChild(fInterfaceContainer);
        //var eventHandler = function (event) { self.dragCallback(event, self) }
        this.fInterfaceContainer = fInterfaceContainer;
        fModuleContainer.addEventListener("mousedown", module.eventDraggingHandler, true);
        if (name == "input") {
            fModuleContainer.id = "moduleInput";
        }
        else if (name == "output") {
            fModuleContainer.id = "moduleOutput";
        }
        else {
            var fFooter = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;
            var fCloseButton = document.createElement("a");
            fCloseButton.href = "#";
            fCloseButton.draggable = false;
            fCloseButton.className = "close";
            fCloseButton.onclick = function () { module.deleteModule(); };
            fModuleContainer.appendChild(fCloseButton);
            var fEditImg = document.createElement("img");
            fEditImg.src = App.baseImg + "edit.png";
            fEditImg.onclick = function () { module.edit(module); };
            fEditImg.draggable = false;
            fFooter.appendChild(fEditImg);
            fModuleContainer.appendChild(fFooter);
        }
        //fModuleContainer.ondrop = function (e) {
        //    module.sceneParent.parent.uploadOn(module.sceneParent.parent, module, 0, 0, e);
        //    return true;
        //};
        // add the node into the soundfield
        htmlParent.appendChild(fModuleContainer);
        //---- Redirect drop to main.js
        this.fName = name;
        this.fModuleContainer = fModuleContainer;
        this.fInterfaceContainer = fInterfaceContainer;
        this.fEditImg = fEditImg;
        this.fTitle = fTitle;
        this.x = x;
        this.y = y;
    };
    // ------ Returns Graphical input and output Node
    ModuleView.prototype.getOutputNode = function () { return this.fOutputNode; };
    ModuleView.prototype.getInputNode = function () { return this.fInputNode; };
    ModuleView.prototype.getModuleContainer = function () {
        return this.fModuleContainer;
    };
    ModuleView.prototype.getInterfaceContainer = function () {
        return this.fInterfaceContainer;
    };
    ModuleView.prototype.setInputNode = function () {
        this.fInputNode = document.createElement("div");
        this.fInputNode.className = "node node-input";
        this.fInputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        this.fModuleContainer.appendChild(this.fInputNode);
    };
    ModuleView.prototype.setOutputNode = function () {
        this.fOutputNode = document.createElement("div");
        this.fOutputNode.className = "node node-output";
        this.fOutputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        this.fModuleContainer.appendChild(this.fOutputNode);
    };
    ModuleView.prototype.deleteInputOutputNodes = function () {
        if (this.fInputNode) {
            this.fModuleContainer.removeChild(this.fInputNode);
            this.fInputNode = null;
        }
        if (this.fOutputNode) {
            this.fModuleContainer.removeChild(this.fOutputNode);
            this.fOutputNode = null;
        }
    };
    ModuleView.prototype.isPointInOutput = function (x, y) {
        if (this.fOutputNode && this.fOutputNode.getBoundingClientRect().left < x && x < this.fOutputNode.getBoundingClientRect().right && this.fOutputNode.getBoundingClientRect().top < y && y < this.fOutputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    };
    ModuleView.prototype.isPointInInput = function (x, y) {
        if (this.fInputNode && this.fInputNode.getBoundingClientRect().left <= x && x <= this.fInputNode.getBoundingClientRect().right && this.fInputNode.getBoundingClientRect().top <= y && y <= this.fInputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    };
    ModuleView.prototype.isPointInNode = function (x, y) {
        if (this.fModuleContainer && this.fModuleContainer.getBoundingClientRect().left < x && x < this.fModuleContainer.getBoundingClientRect().right && this.fModuleContainer.getBoundingClientRect().top < y && y < this.fModuleContainer.getBoundingClientRect().bottom) {
            console.log("isInNode");
            return true;
        }
        console.log(x);
        return false;
    };
    return ModuleView;
})();
//# sourceMappingURL=ModuleView.js.map