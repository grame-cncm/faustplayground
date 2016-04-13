/*     APP.JS


Class App

Create the scenes
Activate Physical input/ output
Handle Drag and Drop
Create Factories and Modules


   */
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Modules/ModuleView.ts"/>
/// <reference path="Modules/ModuleFaust.ts"/>
/// <reference path="Connect.ts"/>
/// <reference path="Error.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="Utilitary.ts"/>
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
//object containg info necessary to compile faust code
var App = (function () {
    function App() {
    }
    App.prototype.createAllScenes = function () {
        var sceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this.compileFaust, sceneView);
        this.setGeneralAppListener(this);
        App.currentScene = 0;
    };
    App.prototype.createMenu = function () {
        var _this = this;
        this.menu = new Menu(document.getElementsByTagName('body')[0]);
        //pass the scene to the menu to allow it to access the scene
        this.menu.setMenuScene(Utilitary.currentScene);
        //add eventlistener on the scene to hide menu when clicked or touched
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.newMenuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.newMenuChoices);
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.newMenuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.newMenuChoices);
            }
        }, true);
    };
    //create div to append messages and confirms
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
        if (currentScene) {
            currentScene.muteScene();
        }
        ;
        //locate libraries used in libfaust compiler
        var args = ["-I", location.origin + "/faustcode/"];
        //try to create the asm.js code/factory with the faust code given. Then callback to function passing the factory.
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, function (factory) { compileFaust.callback(factory); });
        }
        catch (error) {
            new Message(error);
        }
        if (currentScene) {
            currentScene.unmuteScene();
        }
        ;
    };
    //create Module, set the source faust code to its moduleFaust, set the faust interface , add the input output connection nodes
    //
    App.prototype.createModule = function (factory) {
        var _this = this;
        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory + faust.getErrorMessage());
            Utilitary.hideFullPageLoading();
            return null;
        }
        var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), function (module) { Utilitary.currentScene.removeModule(module); }, this.compileFaust);
        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();
        //set listener to recompile when dropping faust code on the module
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
        // the current scene add the module and hide the loading page 
        Utilitary.currentScene.addModule(module);
        if (!Utilitary.currentScene.isInitLoading) {
            Utilitary.hideFullPageLoading();
        }
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- custom event to load file from the load menu with the file explorer
    //Init drag and drop reactions, scroll event and body resize event to resize svg element size, 
    // add custom double touch event to load dsp from the library menu
    App.prototype.setGeneralAppListener = function (app) {
        var _this = this;
        //custom event to load file from the load menu with the file explorer
        document.addEventListener("fileload", function (e) { _this.loadFileEvent(e); });
        //All drog and drop events
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
        //scroll event to check the size of the document
        document.onscroll = function () {
            _this.checkRealWindowSize();
        };
        //resize event
        var body = document.getElementsByTagName("body")[0];
        body.onresize = function () { _this.checkRealWindowSize(); };
        window.ondrop = function (e) {
            var target = e.target;
            _this.styleOnDragEnd();
            var x = e.clientX;
            var y = e.clientY;
            _this.uploadOn(_this, null, x, y, e);
        };
        //custom double touch from library menu to load an effect or an intrument.
        document.addEventListener("dbltouchlib", function (e) { _this.dblTouchUpload(e); });
    };
    //-- Upload content dropped on the page and allocate the content to the right function
    App.prototype.uploadOn = function (app, module, x, y, e) {
        Utilitary.showFullPageLoading();
        e.preventDefault();
        // CASE 1 : the dropped object is a url to some faust code
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url = e.dataTransfer.getData('URL');
            this.uploadUrl(app, module, x, y, url);
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code = e.dataTransfer.getData('text');
            // CASE 2 : the dropped object is some faust code
            if (dsp_code) {
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            }
            else {
                try {
                    this.uploadFileFaust(app, module, x, y, e, dsp_code);
                }
                catch (error) {
                    new Message(error);
                    Utilitary.hideFullPageLoading();
                }
            }
        }
        else {
            new Message(Utilitary.messageRessource.errorObjectNotFaustCompatible);
            Utilitary.hideFullPageLoading();
        }
    };
    //used for Url pointing at a dsp file
    App.prototype.uploadUrl = function (app, module, x, y, url) {
        var filename = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        Utilitary.getXHR(url, function (codeFaust) {
            var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + codeFaust + "}.process);";
            if (module == null) {
                app.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
            }
            else {
                module.update(filename, dsp_code);
            }
        }, Utilitary.errorCallBack);
    };
    // used for dsp code faust
    App.prototype.uploadCodeFaust = function (app, module, x, y, e, dsp_code) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
        }
        else {
            module.update("TEXT", dsp_code);
        }
    };
    //used for File containing code faust or jfaust/json scene descriptor get the file then pass it to loadFile()
    App.prototype.uploadFileFaust = function (app, module, x, y, e, dsp_code) {
        var files = e.dataTransfer.files;
        var file = files[0];
        this.loadFile(file, module, x, y);
    };
    //Load file dsp or jfaust
    App.prototype.loadFile = function (file, module, x, y) {
        var _this = this;
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
                _this.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { _this.createModule(factory); } });
            }
            else if (type == "dsp") {
                module.update(filename, dsp_code);
            }
            else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
        };
    };
    //used when a custom event from loading file with the browser dialogue
    App.prototype.loadFileEvent = function (e) {
        Utilitary.showFullPageLoading();
        var file = e.detail;
        var position = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y);
    };
    //used with the library double touch custom event
    App.prototype.dblTouchUpload = function (e) {
        Utilitary.showFullPageLoading();
        var position = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);
    };
    ////////////////////////////// design on drag or drop //////////////////////////////////////
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
        this.menu.menuView.menuContainer.classList.remove("no_pointer");
        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules = Utilitary.currentScene.getModules();
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
    App.prototype.errorCallBack = function (message) {
    };
    return App;
}());
//# sourceMappingURL=App.js.map