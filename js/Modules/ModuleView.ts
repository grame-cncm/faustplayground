
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

interface HTMLfEdit extends HTMLDivElement {
    area: HTMLTextAreaElement;
}
interface HTMLinterfaceElement extends HTMLElement {
    label: string;
}
interface HTMLInterfaceContainer extends HTMLDivElement {
    unlitClassname: string;
    lastLit: any;
}

class ModuleView {
    inputOutputNodeDimension: number = 32;
    fModuleContainer: HTMLElement;
    fName: string;
    fInterfaceContainer: HTMLInterfaceContainer;
    fEditImg: HTMLfEdit;
    fTitle: HTMLElement;
    fInputNode: HTMLDivElement;
    fOutputNode: HTMLDivElement;
    contentModule: HTMLElement;
    textArea: HTMLTextAreaElement;
    miniButton: HTMLDivElement;
    maxButton: HTMLDivElement;
    x: number;
    y: number;


    createModuleView(ID: number, x: number, y: number, name: string, htmlParent: HTMLElement, module: ModuleClass): void {
        var self: ModuleView = this

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

        var fInterfaceContainer = <HTMLInterfaceContainer>document.createElement("div");
        fInterfaceContainer.className = "content";
        fModuleContainer.appendChild(fInterfaceContainer);
        //var eventHandler = function (event) { self.dragCallback(event, self) }
        this.fInterfaceContainer = fInterfaceContainer;
        fModuleContainer.addEventListener("mousedown", module.eventDraggingHandler, false);
        fModuleContainer.addEventListener("touchstart", module.eventDraggingHandler, false);
        fModuleContainer.addEventListener("touchmove", module.eventDraggingHandler, false);
        fModuleContainer.addEventListener("touchend", module.eventDraggingHandler, false);

        if (name == "input") {
            fModuleContainer.id = "moduleInput";
        } else if (name == "output") {
            fModuleContainer.id = "moduleOutput";
        } else {
            var textArea: HTMLTextAreaElement = document.createElement("textarea");
            textArea.rows = 15;
            textArea.cols = 60;
            textArea.className="textArea"
            textArea.value = "";
            textArea.style.display = "none";
            textArea.contentEditable = "true";
            this.textArea = textArea;
            this.textArea.addEventListener("touchstart", (e) => { e.stopPropagation() });
            this.textArea.addEventListener("touchend", (e) => { e.stopPropagation() });
            this.textArea.addEventListener("touchmove", (e) => { e.stopPropagation() });
            this.textArea.addEventListener("mousedown", (e) => { e.stopPropagation() });
            fModuleContainer.appendChild(textArea);

            var fFooter: HTMLElement = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;

            var fCloseButton: HTMLDivElement = document.createElement("div");
            fCloseButton.draggable = false;
            fCloseButton.className = "close";
            fCloseButton.addEventListener("click", ()=> { module.deleteModule(); });
            fCloseButton.addEventListener("touchend", () => { module.deleteModule(); });

            var fMinButton: HTMLDivElement = document.createElement("div");
            fMinButton.draggable = false;
            fMinButton.className = "minus";
            fMinButton.addEventListener("click", () => { module.minModule(); });
            fMinButton.addEventListener("touchend", () => { module.minModule(); });
            this.miniButton = fMinButton;

            var fMaxButton: HTMLDivElement = document.createElement("div");
            fMaxButton.draggable = false;
            fMaxButton.className = "max";
            fMaxButton.addEventListener("click", () => { module.maxModule(); });
            fMaxButton.addEventListener("touchend", () => { module.maxModule(); });
            this.maxButton = fMaxButton;

            fModuleContainer.appendChild(fCloseButton);
            fModuleContainer.appendChild(fMinButton);
            fModuleContainer.appendChild(fMaxButton);

            var fEditImg = <HTMLfEdit>document.createElement("div");
            fEditImg.className = "edit"
            fEditImg.addEventListener("click",  module.eventOpenEditHandler);
            fEditImg.addEventListener("touchend",  module.eventOpenEditHandler);
            fEditImg.draggable = false;
            this.fEditImg = fEditImg;
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
    }
    // ------ Returns Graphical input and output Node
    getOutputNode(): HTMLElement { return this.fOutputNode; }
    getInputNode(): HTMLElement { return this.fInputNode; }

    getModuleContainer(): HTMLElement {
        return this.fModuleContainer;
    }
    getInterfaceContainer(): HTMLInterfaceContainer {
        return this.fInterfaceContainer;
    }

    setInputNode(): void {
        this.fInputNode = document.createElement("div");
        this.fInputNode.className = "node node-input";
        this.fInputNode.draggable = false;
        //this.fInputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        var spanNode: HTMLSpanElement = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fInputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fInputNode);
    }
    setOutputNode():void{
        this.fOutputNode = document.createElement("div");
        this.fOutputNode.className = "node node-output";
        this.fOutputNode.draggable = false;
        //this.fOutputNode.innerHTML = "<span class='node-button'>&nbsp;</span>";
        var spanNode: HTMLSpanElement = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fOutputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fOutputNode);
    }
    deleteInputOutputNodes(): void {
        if (this.fInputNode) {
            this.fModuleContainer.removeChild(this.fInputNode);
            this.fInputNode = null;
        }

        if (this.fOutputNode) {
            this.fModuleContainer.removeChild(this.fOutputNode);
            this.fOutputNode = null;

        }
    }



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