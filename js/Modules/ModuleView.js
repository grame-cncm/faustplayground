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
        this.fInterfaceContainer = fInterfaceContainer;
        if (name == "input") {
            fModuleContainer.id = "moduleInput";
        }
        else if (name == "output") {
            fModuleContainer.id = "moduleOutput";
        }
        else {
            var textArea = document.createElement("textarea");
            textArea.rows = 15;
            textArea.cols = 60;
            textArea.className = "textArea";
            textArea.value = "";
            textArea.style.display = "none";
            textArea.contentEditable = "true";
            this.textArea = textArea;
            fModuleContainer.appendChild(textArea);
            var fFooter = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;
            var fCloseButton = document.createElement("div");
            fCloseButton.draggable = false;
            fCloseButton.className = "close";
            this.closeButton = fCloseButton;
            var fMinButton = document.createElement("div");
            fMinButton.draggable = false;
            fMinButton.className = "minus";
            this.miniButton = fMinButton;
            var fMaxButton = document.createElement("div");
            fMaxButton.draggable = false;
            fMaxButton.className = "max";
            this.maxButton = fMaxButton;
            fModuleContainer.appendChild(fCloseButton);
            fModuleContainer.appendChild(fMinButton);
            fModuleContainer.appendChild(fMaxButton);
            var fEditImg = document.createElement("div");
            fEditImg.className = "edit";
            fEditImg.draggable = false;
            this.fEditImg = fEditImg;
            fFooter.appendChild(fEditImg);
            fModuleContainer.appendChild(fFooter);
        }
        htmlParent.appendChild(fModuleContainer);
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
        this.fInputNode.draggable = false;
        //this.fInputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fInputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fInputNode);
    };
    ModuleView.prototype.setOutputNode = function () {
        this.fOutputNode = document.createElement("div");
        this.fOutputNode.className = "node node-output";
        this.fOutputNode.draggable = false;
        //this.fOutputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fOutputNode.appendChild(spanNode);
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
            return true;
        }
        return false;
    };
    return ModuleView;
}());
//# sourceMappingURL=ModuleView.js.map