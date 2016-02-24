/*				PLAYGROUND.JS
	Init Normal Scene with all its graphical elements

	This is the unique scene of the Normal Playground
		
	DEPENDENCIES :
		- Scene.js
		- Connect.js
		- Main.js
		- Export.js
*/
/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Menu/Export.ts"/>


"use strict";
class SceneView{

/******************************************************************** 
**************************  INITIALIZATION **************************
********************************************************************/
    //expor: Export = new Export()
    inputOutputModuleContainer: HTMLDivElement;
    sceneSensor: HTMLDivElement;

    initNormalScene(scene: Scene) {
        var container: HTMLDivElement = scene.getSceneContainer();


        var sceneSensor: HTMLDivElement = document.createElement("div");
        sceneSensor.id = "sceneSensor";
        this.sceneSensor = sceneSensor;

        var svgCanvas = <SVGElement>document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.id = "svgCanvas";
        //svgCanvas.version="1.1";
        sceneSensor.appendChild(svgCanvas);
        container.appendChild(sceneSensor);

        //--------- HEADER
        var head: HTMLElement = document.createElement("header");
        head.id = "header";
        container.appendChild(head);


        //head.appendChild(myScene);

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
        linkWilson.textContent = "Extension of the WebAudio Playground by ";
        container.appendChild(linkWilson);

        var alink: HTMLAnchorElement = document.createElement("a");
        alink.href = "https://github.com/cwilso/WebAudio";
        alink.textContent = "Chris Wilson";
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




        
        scene.integrateSceneInBody();
        var playgroundView: SceneView = this;
        scene.integrateInput(function () {
            scene.integrateOutput(function () {
                //scene.getAudioOutput().setInputOutputNodes(node, null);

                playgroundView.onloadNormalScene(scene);
                //playgroundView.expor.uploadTargets();
            });
        });



    }



    onEnterKey = (e: KeyboardEvent) =>{    
        if (!e) { e = <KeyboardEvent>window.event; } 
	
	    if (e.keyCode == 13){ 
            e.preventDefault();
            //this.expor.uploadTargets();
	    }
    }

// On Load And UnLoad Playground Scene
    onloadNormalScene(scene: Scene):void {
        scene.parent.setGeneralDragAndDrop(scene.parent);
	    scene.unmuteScene();
    }

    onunloadNormalScene(scene:Scene):void{
	    scene.muteScene();
    }

}

