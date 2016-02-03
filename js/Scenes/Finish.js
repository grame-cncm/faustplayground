/*				FINISH.JS
    Init Export Scene with all its graphical elements
        
    This is the final scene of the Pedagogical Playground
        
    DEPENDENCIES :
        - Scene.js
        
*/
/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Pedagogie/Tooltips.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../ExportLib.ts"/>
/// <reference path="../main.ts"/>
"use strict";
/********************************************************************
******************* INIT/LOAD/UNLOAD EXPORT SCENE ******************
********************************************************************/
var SceneExportView = (function () {
    function SceneExportView() {
    }
    SceneExportView.prototype.onloadExportScene = function (scene) {
        // 	window.scenes[1].saveScene();
        scene.integrateSceneInBody();
        document.body.style.background = "url('" + App.baseImg + "output-bkg.gif') 0 0 repeat";
        var appName = prompt("Choisis le nom de ton application", "");
        if (appName == null)
            appName = "MonApplication";
        this.initExportScene(scene, appName);
    };
    SceneExportView.prototype.initExportScene = function (scene, name) {
        var container = scene.getSceneContainer();
        //--------- HEADER
        var head = document.createElement("header");
        head.id = "header";
        container.appendChild(head);
        var mySceneName = document.createElement("div");
        mySceneName.id = "exportName";
        mySceneName.className = "sceneTitle";
        mySceneName.textContent = "Télécharge " + name;
        head.appendChild(mySceneName);
        var mySceneSub = document.createElement("div");
        mySceneSub.id = "sceneSubtitle";
        mySceneSub.textContent = "Ton Application Android";
        head.appendChild(mySceneSub);
        //--------- QRCORE ZONE
        var androidApp = document.createElement("div");
        androidApp.id = "androidButton";
        container.appendChild(androidApp);
        var androidImg = document.createElement("img");
        androidImg.id = "androidImg";
        androidImg.src = App.baseImg + "loader.gif";
        androidApp.appendChild(androidImg);
        // -- Once you have been to the finish scene, you probably don't need tooltips anymore.
        if (App.isTooltipEnabled) {
            Tooltips.changeSceneToolTip(0);
            Tooltips.disableTooltips();
        }
        //--------- PREVIOUS SCENE BUTTON
        var backImg = document.createElement("img");
        backImg.id = "backImg";
        backImg.src = App.baseImg + "BACK.png";
        backImg.onclick = function () { scene.parent.previousScene(); };
        container.appendChild(backImg);
        //-------- GET FAUST EQUIVALENT & LAUNCH EXPORT
        var equivalentFaust = new EquivalentFaust();
        var faustSource = equivalentFaust.getFaustEquivalent(scene.parent.scenes[1], name);
        if (faustSource)
            this.getAndroidApp(name, faustSource);
    };
    SceneExportView.prototype.onunloadExportScene = function (scene) {
        //--- clean graphical elements
        var children = scene.getSceneContainer().childNodes;
        for (var i = children.length - 1; i >= 0; i--)
            scene.getSceneContainer().removeChild(children[i]);
    };
    /********************************************************************
    ***********************  EXPORT DSP ANDROID ***********************
    ********************************************************************/
    //--- Create QrCode once precompile request has finished
    SceneExportView.prototype.terminateAndroidMenu = function (sha) {
        if (document.getElementById("androidImg"))
            document.getElementById("androidButton").removeChild(document.getElementById("androidImg"));
        var url = "http://faustservice.grame.fr";
        if (document.getElementById("androidButton")) {
            var qrcodeDiv = ExportLib.getQrCode(url, sha, "android", "android", "binary.apk", 170);
            qrcodeDiv.id = "qrcode";
            document.getElementById("androidButton").appendChild(qrcodeDiv);
        }
    };
    SceneExportView.prototype.exportAndroidCallback = function (sha) {
        var exportLib = new ExportLib();
        exportLib.sendPrecompileRequest("http://faustservice.grame.fr", sha, "android", "android", this.terminateAndroidMenu);
    };
    SceneExportView.prototype.getAndroidApp = function (name, source) {
        ExportLib.getSHAKey("http://faustservice.grame.fr", name, source, this.exportAndroidCallback);
        return; //new MouseEvent("click");
    };
    return SceneExportView;
})();
