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
        var sceneSensor = document.createElement("div");
        sceneSensor.id = "sceneSensor";
        this.sceneSensor = sceneSensor;
        var svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.id = "svgCanvas";
        //svgCanvas.version="1.1";
        sceneSensor.appendChild(svgCanvas);
        container.appendChild(sceneSensor);
        //--------- HEADER
        var head = document.createElement("header");
        head.id = "header";
        container.appendChild(head);
        //head.appendChild(myScene);
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
//# sourceMappingURL=SceneView.js.map