/*     APP.JS


Class App

Create the scenes
Navigate between scenes
Activate Physical input/ output
Handle Drag and Drop
Create Factories and Modules

DEPENDENCIES:
- Accueil.js
    - Finish.js
    - Playground.js
    - Pedagogie.js
    - SceneClass.js

    - ModuleClass.js
    - Connect.js
    - libfaust.js
    - webaudio - asm - wrapper.js
    - Pedagogie / Tooltips.js

    */
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Modules/ModuleView.ts"/>
/// <reference path="Modules/ModuleFaust.ts"/>
/// <reference path="Connect.ts"/>
/// <reference path="Error.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="webaudio-asm-wrapper.d.ts"/>
/// <reference path="Modules/FaustInterface.ts"/>
/// <reference path="Scenes/SceneView.ts"/>
/// <reference path="Menu/Export.ts"/>
/// <reference path="Menu/ExportView.ts"/>
/// <reference path="Menu/Library.ts"/>
/// <reference path="Menu/LibraryView.ts"/>
/// <reference path="Menu/Menu.ts"/>
/// <reference path="Menu/MenuView.ts"/>
/// <reference path="Menu/Help.ts"/>
/// <reference path="Menu/HelpView.ts"/>
/// <reference path="ExportLib.ts"/>
/// <reference path="EquivalentFaust.ts"/>
/// <reference path="qrcode.d.ts"/>
/// <reference path="Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
var App = (function () {
    function App() {
        var _this = this;
        document.ondragstart = function () { _this.styleOnDragStart(); };
        document.ondragenter = function () { _this.styleOnDragStart(); };
        document.ondrop = function () { _this.styleOnDragEnd(); };
        document.onscroll = function () { _this.checkRealWindowSize(); };
        var body = document.getElementsByTagName("body")[0];
        body.onresize = function () { _this.checkRealWindowSize(); };
    }
    App.prototype.showFirstScene = function () {
        App.scene.showScene();
    };
    App.prototype.createAllScenes = function () {
        var sceneView = new SceneView();
        App.scene = new Scene("Normal", this, sceneView.onloadNormalScene, sceneView.onunloadNormalScene, sceneView);
        App.scene.sceneView = sceneView;
        sceneView.initNormalScene(App.scene);
        App.currentScene = 0;
    };
    App.prototype.createMenu = function () {
        var _this = this;
        this.menu = new Menu(document.getElementsByTagName('body')[0]);
        App.scene.getSceneContainer().onmousedown = function () {
            _this.menu.menuChoices = MenuChoices.null;
            _this.menu.menuHandler(_this.menu.menuChoices);
        };
    };
    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/
    App.prototype.activateAudioInput = function (app) {
        var navigatorLoc = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }
        if (navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia({ audio: true }, function (mediaStream) { app.getDevice(mediaStream, app); }, function (e) {
                App.scene.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
                App.scene.fAudioInput.moduleView.fInterfaceContainer.title = "Error getting audio input";
            });
        }
        else {
            App.scene.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
            App.scene.fAudioInput.moduleView.fInterfaceContainer.title = "Audio input API not available";
        }
    };
    App.prototype.getDevice = function (device, app) {
        // Create an AudioNode from the stream.
        App.src = document.getElementById("input");
        App.src.audioNode = App.audioContext.createMediaStreamSource(device);
        var drag = new Drag();
        var connect = new Connector();
        connect.connectInput(App.scene.fAudioInput, App.src);
    };
    App.prototype.activateAudioOutput = function (sceneOutput) {
        App.out = document.createElement("div");
        App.out.id = "audioOutput";
        App.out.audioNode = App.audioContext.destination;
        document.body.appendChild(App.out);
        var connect = new Connector();
        connect.connectOutput(sceneOutput, App.out);
    };
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    App.prototype.compileFaust = function (name, sourcecode, x, y, callback) {
        //  Temporarily Saving parameters of compilation
        this.tempModuleName = name;
        this.tempModuleSourceCode = sourcecode;
        this.tempModuleX = x;
        this.tempModuleY = y;
        var currentScene = App.scene;
        // To Avoid click during compilation
        if (currentScene) {
            currentScene.muteScene();
        }
        ;
        //var args = ["-I", "http://faust.grame.fr/faustcode/"];
        //var args = ["-I", "http://ifaust.grame.fr/faustcode/"];
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args = ["-I", "http://" + location.hostname + "/faustcode/"];
        //var messageJson = JSON.stringify({
        //    sourcecode, args
        //})
        //worker.postMessage(messageJson)
        this.factory = faust.createDSPFactory(sourcecode, args);
        callback(this.factory, App.scene, this);
        if (currentScene) {
            currentScene.unmuteScene();
        }
        ;
    };
    App.prototype.createModule = function (factory, scene, app) {
        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }
        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        var module = new ModuleClass(App.idX++, app.tempModuleX, app.tempModuleY, app.tempModuleName, scene, document.getElementById("modules"), scene.removeModule);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);
        module.moduleFaust.setSource(app.tempModuleSourceCode);
        module.createDSP(factory);
        module.createFaustInterface();
        module.addInputOutputNodes();
        if (app.tempModuleName != "input" && app.tempModuleName != "output") {
            module.moduleView.fModuleContainer.ondrop = function (e) {
                e.stopPropagation();
                app.styleOnDragEnd();
                app.uploadOn(app, module, 0, 0, e);
            };
        }
        module.moduleView.fModuleContainer.ondragover = function () {
            module.moduleView.fModuleContainer.style.opacity = "1";
            module.moduleView.fModuleContainer.style.boxShadow = "0 0 40px rgb(255, 0, 0)";
        };
        module.moduleView.fModuleContainer.ondragleave = function () {
            module.moduleView.fModuleContainer.style.opacity = "0.5";
            module.moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        };
        scene.addModule(module);
        App.hideFullPageLoading();
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- Init drag and drop reactions
    App.prototype.setGeneralDragAndDrop = function (app) {
        var _this = this;
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        window.ondrop = function (e) {
            var x = e.clientX;
            var y = e.clientY;
            _this.uploadOn(_this, null, x, y, e);
        };
    };
    //-- Init drag and drop reactions
    App.prototype.resetGeneralDragAndDrop = function (div) {
        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        window.ondrop = function (e) { return false; };
    };
    //-- Prevent Default Action of the browser from happening
    App.prototype.preventDefaultAction = function (e) {
        e.preventDefault();
    };
    App.prototype.terminateUpload = function () {
        var uploadTitle = document.getElementById("upload");
        uploadTitle.textContent = "";
    };
    //-- Finds out if the drop was on an existing module or creating a new one
    //-- Upload content dropped on the page and create a Faust DSP with it
    App.prototype.uploadOn = function (app, module, x, y, e) {
        App.showFullPageLoading();
        //worker.postMessage("go");
        this.preventDefaultAction(e);
        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            this.uploadUrl(app, module, x, y, e);
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code = e.dataTransfer.getData('text');
            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            }
            else {
                var files = e.dataTransfer.files; //e.target.files ||
                var file = files[0];
                if (location.host.indexOf("sitepointstatic") >= 0) {
                    return;
                }
                var request = new XMLHttpRequest();
                if (request.upload) {
                    var reader = new FileReader();
                    var ext = file.name.toString().split('.').pop();
                    var filename = file.name.toString().split('.').shift();
                    var type;
                    if (ext == "dsp") {
                        type = "dsp";
                        reader.readAsText(file);
                    }
                    else if (ext == "json") {
                        type = "json";
                        reader.readAsText(file);
                    }
                    else {
                        this.terminateUpload();
                    }
                    reader.onloadend = function (e) {
                        dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";
                        if (!module && type == "dsp") {
                            app.compileFaust(filename, dsp_code, x, y, app.createModule);
                        }
                        else if (type == "dsp") {
                            module.update(filename, dsp_code);
                        }
                        else if (type == "json") {
                            app.scenes[App.currentScene].recallScene(reader.result);
                        }
                        app.terminateUpload();
                    };
                }
            }
        }
        else {
            app.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
    };
    //Upload Url
    App.prototype.uploadUrl = function (app, module, x, y, e) {
        var url = e.dataTransfer.getData('URL');
        var filename = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        var xmlhttp = new XMLHttpRequest;
        xmlhttp.overrideMimeType('text/plain; charset=utf-8');
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";
                if (module == null) {
                    app.compileFaust(filename, dsp_code, x, y, app.createModule);
                }
                else {
                    module.update(filename, dsp_code);
                }
            }
            app.terminateUpload();
        };
        xmlhttp.open("GET", url);
        // 	Avoid error "mal formé" on firefox
        xmlhttp.overrideMimeType('text/html');
        xmlhttp.send();
    };
    App.prototype.uploadCodeFaust = function (app, module, x, y, e, dsp_code) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust("TEXT", dsp_code, x, y, app.createModule);
        }
        else {
            module.update("TEXT", dsp_code);
        }
        app.terminateUpload();
    };
    App.prototype.uploadFile2 = function (app, module, x, y, e, dsp_code) {
    };
    //Check in Url if the app should be for kids
    App.isAppPedagogique = function () {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true;
        }
        else {
            return false;
        }
    };
    //generic function to make XHR request
    App.getXHR = function (url, callback, errCallback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                callback(getrequest.responseText);
            }
            else if (getrequest.readyState == 4 && getrequest.status == 400) {
                errCallback(getrequest.responseText);
            }
        };
        getrequest.open("GET", url, true);
        getrequest.send(null);
    };
    App.preventdefault = function (e) {
        e.preventDefault();
    };
    ////////////////////////////// LOADINGS //////////////////////////////////////
    //add loading logo and text on export
    App.addLoadingLogo = function (divTarget) {
        var loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = App.baseImg + "logoAnim.gif";
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent = "Compilation en cours...";
        loadingText.id = "loadingText";
        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);
        document.getElementById(divTarget).appendChild(loadingDiv);
    };
    App.removeLoadingLogo = function () {
        document.getElementById("loadingDiv").remove();
    };
    App.showFullPageLoading = function () {
        var loadingPage = document.createElement("div");
        loadingPage.id = "loadingPage";
        var body = document.getElementsByTagName('body')[0];
        var loadingText = document.createElement("div");
        loadingText.id = "loadingTextBig";
        loadingText.textContent = "Chargement en cours";
        loadingPage.appendChild(loadingText);
        body.appendChild(loadingPage);
        document.getElementById("Normal").style.filter = "blur(2px)";
        document.getElementById("Normal").style.webkitFilter = "blur(2px)";
        document.getElementById("menuContainer").style.filter = "blur(2px)";
        document.getElementById("menuContainer").style.webkitFilter = "blur(2px)";
        //App.addLoadingLogo(loadingPage.id);
    };
    App.hideFullPageLoading = function () {
        if (document.getElementById("loadingPage") != null) {
            document.getElementById("loadingPage").remove();
            document.getElementById("Normal").style.filter = "none";
            document.getElementById("Normal").style.webkitFilter = "none";
            document.getElementById("menuContainer").style.filter = "none";
            document.getElementById("menuContainer").style.webkitFilter = "none";
        }
    };
    App.createDropAreaGraph = function () {
    };
    // manage style during a drag and drop event
    App.prototype.styleOnDragStart = function () {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        App.scene.sceneView.dropElementScene.style.display = "block";
        App.scene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules = App.scene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "0.5";
        }
    };
    App.prototype.styleOnDragEnd = function () {
        //var body: HTMLBodyElement = <HTMLBodyElement>document.getElementById("body")[0];
        //body.removeEventListener("ondragleave");
        //document.getElementById("body")[0].style.zIndex = "100";
        this.menu.menuView.menuContainer.style.opacity = "1";
        App.scene.sceneView.dropElementScene.style.display = "none";
        App.scene.getSceneContainer().style.boxShadow = "none";
        var modules = App.scene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        }
    };
    //manage the window size
    App.prototype.checkRealWindowSize = function () {
        if (window.scrollX > 0) {
            console.log(document.getElementsByTagName("html")[0]);
            document.getElementsByTagName("html")[0].style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("svgCanvas").style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("menuContainer").style.width = window.innerWidth + window.scrollX + "px";
        }
        else {
            document.getElementsByTagName("html")[0].style.width = "100%";
            document.getElementById("svgCanvas").style.width = "100%";
            document.getElementById("menuContainer").style.width = "100%";
        }
        if (window.scrollY > 0) {
            document.getElementsByTagName("html")[0].style.height = window.innerHeight + window.scrollY + "px";
            document.getElementById("svgCanvas").style.height = window.innerHeight + window.scrollY + "px";
        }
        else {
            document.getElementsByTagName("html")[0].style.height = "100%";
            document.getElementById("svgCanvas").style.height = "100%";
        }
    };
    App.idX = 0;
    App.baseImg = "img/";
    return App;
})();
//# sourceMappingURL=App.js.map