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
/// <reference path="Ressources.ts"/>
/// <reference path="Messages.ts"/>
/// <reference path="Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
var App = (function () {
    function App() {
    }
    App.prototype.showFirstScene = function () {
        Utilitary.currentScene.showScene();
    };
    App.prototype.createAllScenes = function () {
        var sceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this, this.compileFaust, sceneView);
        //App.scene.sceneView = sceneView;
        this.setGeneralAppListener(this);
        //sceneView.initNormalScene(App.scene);
        App.currentScene = 0;
    };
    App.prototype.createMenu = function () {
        var _this = this;
        this.menu = new Menu(document.getElementsByTagName('body')[0]);
        this.menu.setMenuScene(Utilitary.currentScene);
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.menuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.menuChoices);
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.menuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.menuChoices);
            }
        }, true);
    };
    App.prototype.createDialogue = function () {
        var dialogue = document.createElement("div");
        dialogue.id = "dialogue";
        document.getElementsByTagName("body")[0].appendChild(dialogue);
    };
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    App.prototype.compileFaust = function (compileFaust) {
        //  Temporarily Saving parameters of compilation
        this.tempModuleName = compileFaust.name;
        this.tempModuleSourceCode = compileFaust.sourceCode;
        this.tempModuleX = compileFaust.x;
        this.tempModuleY = compileFaust.y;
        var currentScene = Utilitary.currentScene;
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
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, function (factory) { compileFaust.callback(factory); });
        }
        catch (error) {
            new Message(error);
        }
        //callback(this.factory)
        if (currentScene) {
            currentScene.unmuteScene();
        }
        ;
    };
    App.prototype.createModule = function (factory) {
        var _this = this;
        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory + faust.getErrorMessage());
            this.terminateUpload();
            return null;
        }
        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), function (module) { Utilitary.currentScene.removeModule(module); }, this.compileFaust);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);
        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();
        if (this.tempModuleName != "input" && this.tempModuleName != "output") {
            module.moduleView.fModuleContainer.ondrop = function (e) {
                e.stopPropagation();
                _this.styleOnDragEnd();
                _this.uploadOn(_this, module, 0, 0, e);
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
        Utilitary.currentScene.addModule(module);
        if (!Utilitary.currentScene.isInitLoading) {
            Utilitary.hideFullPageLoading();
        }
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- Init drag and drop reactions
    App.prototype.setGeneralAppListener = function (app) {
        var _this = this;
        document.addEventListener("fileload", function (e) { _this.loadFileEvent(e); });
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        document.ondragstart = function () { _this.styleOnDragStart(); };
        document.ondragenter = function (e) {
            var srcElement = e.srcElement;
            if (srcElement.className != null && srcElement.className == "node-button") {
            }
            else {
                _this.styleOnDragStart();
            }
        };
        document.ondragleave = function (e) {
            var elementTarget = e.target;
            if (elementTarget.id == "svgCanvas") {
                //alert("svg")
                _this.styleOnDragEnd();
                e.stopPropagation();
                e.preventDefault();
            }
        };
        document.onscroll = function () {
            _this.checkRealWindowSize();
        };
        var body = document.getElementsByTagName("body")[0];
        body.onresize = function () { _this.checkRealWindowSize(); };
        window.ondrop = function (e) {
            var target = e.target;
            _this.styleOnDragEnd();
            var x = e.clientX;
            var y = e.clientY;
            _this.uploadOn(_this, null, x, y, e);
            _this.menu.isMenuLow = true;
        };
        document.addEventListener("dbltouchlib", function (e) { _this.dblTouchUpload(e); });
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
        Utilitary.hideFullPageLoading();
    };
    //-- Finds out if the drop was on an existing module or creating a new one
    //-- Upload content dropped on the page and create a Faust DSP with it
    App.prototype.uploadOn = function (app, module, x, y, e) {
        Utilitary.showFullPageLoading();
        //worker.postMessage("go");
        this.preventDefaultAction(e);
        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url = e.dataTransfer.getData('URL');
            this.uploadUrl(app, module, x, y, url);
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code = e.dataTransfer.getData('text');
            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            }
            else {
                try {
                    this.uploadFile2(app, module, x, y, e, dsp_code);
                }
                catch (error) {
                    new Message(error);
                    Utilitary.hideFullPageLoading();
                }
            }
        }
        else {
            app.terminateUpload();
            new Message(Utilitary.messageRessource.errorObjectNotFaustCompatible);
        }
    };
    //Upload Url
    App.prototype.uploadUrl = function (app, module, x, y, url) {
        var filename = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        var xmlhttp = new XMLHttpRequest;
        xmlhttp.overrideMimeType('text/plain; charset=utf-8');
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";
                if (module == null) {
                    app.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
                }
                else {
                    module.update(filename, dsp_code);
                }
            }
            //app.terminateUpload();
        };
        xmlhttp.open("GET", url);
        // 	Avoid error "mal formé" on firefox
        xmlhttp.overrideMimeType('text/html');
        xmlhttp.send();
    };
    App.prototype.uploadCodeFaust = function (app, module, x, y, e, dsp_code) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
        }
        else {
            module.update("TEXT", dsp_code);
        }
        //app.terminateUpload();
    };
    App.prototype.uploadFile2 = function (app, module, x, y, e, dsp_code) {
        var files = e.dataTransfer.files;
        var file = files[0];
        if (location.host.indexOf("sitepointstatic") >= 0) {
            return;
        }
        var request = new XMLHttpRequest();
        if (request.upload) {
            this.loadFile(file, module, x, y, app);
        }
    };
    App.prototype.loadFile = function (file, module, x, y, app) {
        var dsp_code;
        var reader = new FileReader();
        var ext = file.name.toString().split('.').pop();
        var filename = file.name.toString().split('.').shift();
        var type;
        if (ext == "dsp") {
            type = "dsp";
            reader.readAsText(file);
        }
        else if (ext == "json" || ext == "jfaust") {
            type = "json";
            reader.readAsText(file);
        }
        else {
            throw new Error(Utilitary.messageRessource.errorObjectNotFaustCompatible);
        }
        reader.onloadend = function (e) {
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";
            if (!module && type == "dsp") {
                app.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
            }
            else if (type == "dsp") {
                module.update(filename, dsp_code);
            }
            else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
            //app.terminateUpload();
        };
    };
    App.prototype.loadFileEvent = function (e) {
        Utilitary.showFullPageLoading();
        var file = e.detail;
        var position = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y, this);
    };
    App.prototype.dblTouchUpload = function (e) {
        Utilitary.showFullPageLoading();
        var position = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);
    };
    //Check in Url if the app should be for kids
    ////////////////////////////// LOADINGS //////////////////////////////////////
    //add loading logo and text on export
    // manage style during a drag and drop event
    App.prototype.styleOnDragStart = function () {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "block";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "0.5";
        }
    };
    App.prototype.styleOnDragEnd = function () {
        //var body: HTMLBodyElement = <HTMLBodyElement>document.getElementById("body")[0];
        //body.removeEventListener("ondragleave");
        //document.getElementById("body")[0].style.zIndex = "100";
        //this.menu.lowerLibraryMenu();
        this.menu.menuView.menuContainer.classList.remove("no_pointer");
        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        }
        this.menu.menuView.menuContainer.addEventListener("mouseover", this.menu.mouseOverLowerMenu);
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
    App.prototype.errorCallBack = function (message) {
    };
    return App;
}());
//# sourceMappingURL=App.js.map