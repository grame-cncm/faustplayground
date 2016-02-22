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
var SceneView = (function () {
    function SceneView() {
        this.onEnterKey = function (e) {
            if (!e) {
                e = window.event;
            }
            if (e.keyCode == 13) {
                e.preventDefault();
            }
        };
    }
    SceneView.prototype.initNormalScene = function (scene) {
        var container = scene.getSceneContainer();
        var svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.id = "svgCanvas";
        //svgCanvas.version="1.1";
        container.appendChild(svgCanvas);
        //--------- HEADER
        var head = document.createElement("header");
        head.id = "header";
        container.appendChild(head);
        var myScene = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        //myScene.style.contentEditable = "true";
        myScene.textContent = "Patch";
        head.appendChild(myScene);
        var uploadDiv = document.createElement("div");
        uploadDiv.id = "upload";
        uploadDiv.className = "uploading";
        head.appendChild(uploadDiv);
        //----------- INPUT OUTPUT MODULES
        var inputOutputModuleContainer = document.createElement("div");
        inputOutputModuleContainer.id = "inputOutputModuleContainer";
        container.appendChild(inputOutputModuleContainer);
        this.inputOutputModuleContainer = inputOutputModuleContainer;
        //----------- MODULES
        var moduleContainer = document.createElement("section");
        moduleContainer.id = "modules";
        moduleContainer.className = "container";
        container.appendChild(moduleContainer);
        //------------ MENUS
        var menuContainer = document.createElement("div");
        menuContainer.id = "menuContainer";
        container.appendChild(menuContainer);
        this.menuContainer = menuContainer;
        //------------ INPUT/OUTPUT
        //var destDiv: HTMLDivElement = document.createElement("div");
        //destDiv.id = "sceneOutput";
        //destDiv.className = "destination";
        //container.appendChild(destDiv);
        //var fwurl: HTMLInputElement = document.createElement("input");
        //fwurl.id = "faustweburl";
        //fwurl.onkeyup = this.onEnterKey;
        //fwurl.value = "http://faustservice.grame.fr";
        //destDiv.appendChild(fwurl);
        //var subfooter: HTMLDivElement = document.createElement('div');
        //subfooter.id="optionExportContainer"
        //destDiv.appendChild(subfooter);
        //var refButton: HTMLDivElement = document.createElement("div");
        //refButton.id = "refreshButton";
        //refButton.onclick = this.expor.uploadTargets;
        //refButton.innerHTML = '<svg version="1.0" id="svgRefreshButton" xmlns="http://www.w3.org/2000/svg" width="50.000000pt" height="50.000000pt" viewBox="0 0 50.000000 50.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M186 309 c-37 -29 -37 -89 0 -118 28 -22 69 -27 93 -12 23 15 3 30 -33 24 -29 -4 -37 -1 -51 21 -16 24 -16 28 -1 51 18 27 63 34 84 13 17 -17 15 -31 -3 -24 -20 7 -19 1 6 -28 l22 -25 18 24 c20 25 25 40 9 30 -5 -3 -16 7 -24 23 -25 47 -75 56 -120 21z"/></g></svg>';
        //subfooter.appendChild(refButton);
        //var selectDiv: HTMLDivElement= document.createElement("div");
        //selectDiv.id = "selectDiv"
        //subfooter.appendChild(selectDiv);
        //var selectPlatform: HTMLSelectElement= document.createElement("select");
        //selectPlatform.id = "platforms";
        //selectPlatform.className = "platforms";
        //var self = this;
        //selectPlatform.addEventListener("change", function () { self.expor.updateArchitectures(self.expor) });
        //selectDiv.appendChild(selectPlatform);
        //var selectArch: HTMLSelectElement = document.createElement("select");
        //selectArch.id = "architectures";
        //selectArch.className = "architectures";
        //selectDiv.appendChild(selectArch);
        //var equButton: HTMLInputElement = document.createElement("input");
        //equButton.id = "exportButton";
        //equButton.type = "submit";
        //equButton.className = "grayButton";
        //var sceneView: SceneView = this;
        //equButton.onclick = function (event) { sceneView.expor.exportPatch(event, sceneView.expor) };
        //equButton.value = "Export";
        //subfooter.appendChild(equButton);
        var linkWilson = document.createElement("div");
        linkWilson.id = "ChrisLine";
        linkWilson.className = "link";
        linkWilson.textContent = "Extension of the WebAudio Playground by ";
        container.appendChild(linkWilson);
        var alink = document.createElement("a");
        alink.href = "https://github.com/cwilso/WebAudio";
        alink.textContent = "Chris Wilson";
        linkWilson.appendChild(alink);
        var srcDiv = document.createElement("div");
        srcDiv.id = "input";
        srcDiv.className = "source";
        container.appendChild(srcDiv);
        var imageDiv = document.createElement('div');
        imageDiv.id = "logoDiv";
        srcDiv.appendChild(imageDiv);
        var imageLogo = document.createElement('img');
        imageLogo.className = "logoGrame";
        imageLogo.src = "img/grame.png";
        imageDiv.appendChild(imageLogo);
        scene.integrateSceneInBody();
        var playgroundView = this;
        scene.integrateInput(function () {
            scene.integrateOutput(function () {
                //scene.getAudioOutput().setInputOutputNodes(node, null);
                playgroundView.onloadNormalScene(scene);
                //playgroundView.expor.uploadTargets();
            });
        });
        scene.initMenu(this.menuContainer);
    };
    // On Load And UnLoad Playground Scene
    SceneView.prototype.onloadNormalScene = function (scene) {
        scene.parent.setGeneralDragAndDrop(scene.parent);
        scene.unmuteScene();
    };
    SceneView.prototype.onunloadNormalScene = function (scene) {
        scene.muteScene();
    };
    return SceneView;
})();
