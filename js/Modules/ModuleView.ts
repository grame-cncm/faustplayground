
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

/// <reference path="../Utilitary.ts"/>

interface HTMLfEdit extends HTMLDivElement {
    area: HTMLTextAreaElement;
}
interface HTMLinterfaceElement extends HTMLElement {
    label: string;
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
    closeButton: HTMLDivElement;
    x: number;
    y: number;

    createModuleView(ID: number, x: number, y: number, name: string, htmlParent: HTMLElement): void {

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
        this.fInterfaceContainer = fInterfaceContainer;
        //if modules are input or output scene module, no need for interface
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
            fModuleContainer.appendChild(textArea);

            var fFooter: HTMLElement = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;

            var fCloseButton: HTMLDivElement = document.createElement("div");
            fCloseButton.draggable = false;
            fCloseButton.className = "close";
            this.closeButton = fCloseButton;

            var fMinButton: HTMLDivElement = document.createElement("div");
            fMinButton.draggable = false;
            fMinButton.className = "minus";
            this.miniButton = fMinButton;

            var fMaxButton: HTMLDivElement = document.createElement("div");
            fMaxButton.draggable = false;
            fMaxButton.className = "max";
            this.maxButton = fMaxButton;

            fModuleContainer.appendChild(fCloseButton);
            fModuleContainer.appendChild(fMinButton);
            fModuleContainer.appendChild(fMaxButton);

            var fEditImg = <HTMLfEdit>document.createElement("div");
            fEditImg.className = "edit"
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
