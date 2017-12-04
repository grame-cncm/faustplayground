/*				PLAYGROUND.JS
	Init Normal Scene with all its graphical elements

	This is the unique scene of the Normal Playground
*/
/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Menu/Export.ts"/>

class SceneView {

/********************************************************************
**************************  INITIALIZATION **************************
********************************************************************/
    //expor: Export = new Export()
    inputOutputModuleContainer: HTMLDivElement;
    sceneSensor: HTMLDivElement;
    dropElementScene: HTMLElement;
    fSceneContainer: HTMLDivElement;

    initNormalScene(scene: Scene) {
        var container = document.createElement("div");
        container.id = "Normal";

        var svgCanvas = <SVGElement>document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.id = "svgCanvas";
        container.appendChild(svgCanvas);

        //--------- HEADER
        var head: HTMLElement = document.createElement("header");
        head.id = "header";
        container.appendChild(head);

        var uploadDiv: HTMLDivElement = document.createElement("div");
        uploadDiv.id = "upload";
        uploadDiv.className = "uploading";
        head.appendChild(uploadDiv);
        //----------- INPUT OUTPUT MODULES

        var inputOutputModuleContainer: HTMLDivElement = document.createElement("div");
        inputOutputModuleContainer.id = "inputOutputModuleContainer";
        container.appendChild(inputOutputModuleContainer);
        this.inputOutputModuleContainer = inputOutputModuleContainer;

        //----------- MODULES
        var moduleContainer: HTMLElement = document.createElement("section");
        moduleContainer.id = "modules";
        moduleContainer.className = "container";
        container.appendChild(moduleContainer);

        //------------ MENUS

        var linkWilson: HTMLDivElement = document.createElement("div");
        linkWilson.id = "ChrisLine"
        linkWilson.className = "link";
        linkWilson.textContent = Utilitary.messageRessource.reference;
        container.appendChild(linkWilson);

        var alink: HTMLAnchorElement = document.createElement("a");
        alink.href = "https://github.com/cwilso/WebAudio";
        alink.textContent = Utilitary.messageRessource.chrisWilson;
        linkWilson.appendChild(alink);

        var srcDiv: HTMLDivElement = document.createElement("div");
        srcDiv.id = "input";
        srcDiv.className = "source";
        container.appendChild(srcDiv);

        var imageDiv: HTMLDivElement = document.createElement('div');
        imageDiv.id = "logoDiv";
        srcDiv.appendChild(imageDiv);

        var imageLogo: HTMLImageElement = document.createElement('img');
        imageLogo.className = "logoGrame";
        imageLogo.src = "img/grame.png";
        imageDiv.appendChild(imageLogo);

        var dropElementScene = document.createElement("div");
        dropElementScene.className = "dropElementGraph";
        dropElementScene.style.display = "none";
        this.dropElementScene = dropElementScene;

        var dropElementText = document.createElement("div");
        dropElementText.textContent = Utilitary.messageRessource.drop;
        dropElementText.className = "dropElementText";
        dropElementScene.appendChild(dropElementText);

        container.appendChild(dropElementScene);
        this.fSceneContainer = container;
    }
}
