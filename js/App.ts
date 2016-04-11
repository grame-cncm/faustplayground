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



class App {

    //************* Fields
    //static appTest: number = 0;
    //static scene: Scene;
    

    private static currentScene: number;
    private static src: IHTMLDivElementSrc;
    private static out: IHTMLDivElementOut;
    menu: Menu

    tempModuleName: string;
    tempPatchId: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    tempParams: IJsonParamsSave;

    scenes: Scene[];

    //currentNumberDSP: number;
    inputs: any[];
    outputs: any[];
    params: any[];
    factory: Factory;

    constructor() {
        

    }

    showFirstScene(): void {
        Utilitary.currentScene.showScene();
    }

    createAllScenes(): void {


        var sceneView: SceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this, this.compileFaust, sceneView);
        //App.scene.sceneView = sceneView;
        this.setGeneralAppListener(this);
        //sceneView.initNormalScene(App.scene);
            

        
        App.currentScene = 0;
    }

    createMenu(): void {
        this.menu = new Menu(document.getElementsByTagName('body')[0])
        this.menu.setMenuScene(Utilitary.currentScene);
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.menuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.menuChoices)
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.menuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.menuChoices)
            }
        }, true);
    }

    createDialogue() {
        var dialogue = document.createElement("div");
        dialogue.id = "dialogue";
        document.getElementsByTagName("body")[0].appendChild(dialogue)
    }



    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/

    compileFaust(compileFaust: CompileFaust) {

        //  Temporarily Saving parameters of compilation
        this.tempModuleName = compileFaust.name;
        this.tempModuleSourceCode = compileFaust.sourceCode;
        this.tempModuleX = compileFaust.x;
        this.tempModuleY = compileFaust.y;

        var currentScene: Scene = Utilitary.currentScene;

        // To Avoid click during compilation
        if (currentScene) { currentScene.muteScene() };

        //var args = ["-I", "http://faust.grame.fr/faustcode/"];
        //var args = ["-I", "http://ifaust.grame.fr/faustcode/"];
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args: string[] = ["-I", "http://" + location.hostname + "/faustcode/"];
        //var messageJson = JSON.stringify({
        //    sourcecode, args
        //})
        //worker.postMessage(messageJson)
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, (factory) => { compileFaust.callback(factory) });
        } catch (error) {
            new Message(error)
        }
        
        //callback(this.factory)
        if (currentScene) { currentScene.unmuteScene() };

    }

    private createModule(factory: Factory): void {

        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory+faust.getErrorMessage());
            this.terminateUpload();
            return null;
        }


        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        var module: ModuleClass = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => { Utilitary.currentScene.removeModule(module) }, this.compileFaust);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);

        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();
        if (this.tempModuleName != "input" && this.tempModuleName != "output") {
            module.moduleView.fModuleContainer.ondrop = (e) => {
                e.stopPropagation();
                this.styleOnDragEnd()
                this.uploadOn(this, module, 0, 0, e)
            };
        }
        module.moduleView.fModuleContainer.ondragover = () => {
            module.moduleView.fModuleContainer.style.opacity = "1";
            module.moduleView.fModuleContainer.style.boxShadow = "0 0 40px rgb(255, 0, 0)";
        }
        module.moduleView.fModuleContainer.ondragleave = () => {
            module.moduleView.fModuleContainer.style.opacity = "0.5";
            module.moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        }
        Utilitary.currentScene.addModule(module);
        if (!Utilitary.currentScene.isInitLoading) {
            Utilitary.hideFullPageLoading()
        }

    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- Init drag and drop reactions
    setGeneralAppListener(app: App): void {
        document.addEventListener("fileload", (e: CustomEvent) => { this.loadFileEvent(e) })
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        document.ondragstart = () => { this.styleOnDragStart() };
        document.ondragenter = (e) => {
            var srcElement = <HTMLElement>e.srcElement
            if (srcElement.className != null && srcElement.className == "node-button") {
            } else {
                this.styleOnDragStart()
            }
        };
        document.ondragleave = (e) => {
            var elementTarget = <HTMLElement>e.target
            if (elementTarget.id == "svgCanvas") {
                //alert("svg")
                this.styleOnDragEnd();
                e.stopPropagation();
                e.preventDefault()
            }
        }
        document.onscroll = () => {
            this.checkRealWindowSize()
        };
        var body: HTMLBodyElement = document.getElementsByTagName("body")[0]
        body.onresize = () => { this.checkRealWindowSize() };

        window.ondrop = (e) => {
            var target = <HTMLElement>e.target;
            this.styleOnDragEnd()
            var x = e.clientX;
            var y = e.clientY;
            this.uploadOn(this, null, x, y, e);
            this.menu.isMenuLow = true;            
        };
        

        document.addEventListener("dbltouchlib", (e: CustomEvent) => { this.dblTouchUpload(e) });
    }

    //-- Init drag and drop reactions
    private resetGeneralDragAndDrop(div: HTMLElement): void {

        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        window.ondrop = function (e) { return false; };
    }


    //-- Prevent Default Action of the browser from happening
    preventDefaultAction(e: Event): void {
        e.preventDefault();
    }

    private terminateUpload(): void {

        Utilitary.hideFullPageLoading();

    }

    //-- Finds out if the drop was on an existing module or creating a new one


    //-- Upload content dropped on the page and create a Faust DSP with it
    uploadOn(app: App, module: ModuleClass, x: number, y: number, e: DragEvent) {
        Utilitary.showFullPageLoading();
        //worker.postMessage("go");
        this.preventDefaultAction(e);


        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url = e.dataTransfer.getData('URL');
            this.uploadUrl(app, module, x, y, url);
        }else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {

            var dsp_code: string = e.dataTransfer.getData('text');

            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            }
            // CASE 3 : THE DROPPED OBJECT IS A FILE CONTAINING SOME FAUST CODE
            else {
                try {
                    this.uploadFile2(app, module, x, y, e, dsp_code)
                } catch (error) {
                    new Message(error);
                    Utilitary.hideFullPageLoading();
                }
            }
        } else { // CASE 4 : ANY OTHER STRANGE THING
            app.terminateUpload();
            new Message(Utilitary.messageRessource.errorObjectNotFaustCompatible);
        }
    }
    //Upload Url
    uploadUrl(app: App, module: ModuleClass, x: number, y: number, url: string) {
        var filename: string = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();

        var xmlhttp: XMLHttpRequest = new XMLHttpRequest
        xmlhttp.overrideMimeType('text/plain; charset=utf-8')

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var dsp_code: string = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";

                if (module == null) {
                    app.compileFaust({ name:filename, sourceCode:dsp_code, x:x, y:y, callback:(factory) => { app.createModule(factory) }});
                } else {
                    module.update(filename, dsp_code);
                }
            }

            //app.terminateUpload();
        }

        xmlhttp.open("GET", url);
        // 	Avoid error "mal formé" on firefox
        xmlhttp.overrideMimeType('text/html');
        xmlhttp.send();
    }

    uploadCodeFaust(app: App, module: ModuleClass, x: number, y: number, e: DragEvent, dsp_code:string) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";

        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: (factory) => { app.createModule(factory) }});
        } else {
            module.update("TEXT", dsp_code);
        }

        //app.terminateUpload();
    }

    uploadFile2(app: App, module: ModuleClass, x: number, y: number, e: DragEvent, dsp_code: string) {
        var files: FileList = e.dataTransfer.files;

        var file: File = files[0];

        if (location.host.indexOf("sitepointstatic") >= 0) { return }

        var request: XMLHttpRequest = new XMLHttpRequest();
        if (request.upload) {
            this.loadFile(file, module, x, y, app); 
        }
    }

    loadFile(file: File, module: ModuleClass, x: number, y: number,app:App) {
        var dsp_code: string;
        var reader: FileReader = new FileReader();

        var ext: string = file.name.toString().split('.').pop();

        var filename: string = file.name.toString().split('.').shift();

        var type: string;

        if (ext == "dsp") {
            type = "dsp";
            reader.readAsText(file);
          
        }
        else if (ext == "json"||ext=="jfaust") {
            type = "json";
            reader.readAsText(file);
        } else {
            throw new Error(Utilitary.messageRessource.errorObjectNotFaustCompatible);

            //this.terminateUpload();
        }

        reader.onloadend = function (e) {
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";

            if (!module && type == "dsp") {
                app.compileFaust({ name:filename, sourceCode:dsp_code, x:x, y:y, callback:(factory) => { app.createModule(factory) }});
            } else if (type == "dsp") {
                module.update(filename, dsp_code);
            } else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
            //app.terminateUpload();
        };
    }
    loadFileEvent(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var file: File = <File>e.detail;
        var position: PositionModule = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y, this)

    }
    dblTouchUpload(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var position: PositionModule = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);

    }

    //Check in Url if the app should be for kids
    




    ////////////////////////////// LOADINGS //////////////////////////////////////

    //add loading logo and text on export
   




    // manage style during a drag and drop event
    styleOnDragStart() {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "block";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules: ModuleClass[] = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity="0.5"
        }
    }
    styleOnDragEnd() {
        //var body: HTMLBodyElement = <HTMLBodyElement>document.getElementById("body")[0];
        //body.removeEventListener("ondragleave");
        //document.getElementById("body")[0].style.zIndex = "100";
        //this.menu.lowerLibraryMenu();
        this.menu.menuView.menuContainer.classList.remove("no_pointer");

        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules: ModuleClass[] = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow ="0 5px 10px rgba(0, 0, 0, 0.4)"
        }
        this.menu.menuView.menuContainer.addEventListener("mouseover", this.menu.mouseOverLowerMenu);
    }

    //manage the window size
    checkRealWindowSize() {
        
        if (window.scrollX > 0) {
            console.log(document.getElementsByTagName("html")[0]);
            document.getElementsByTagName("html")[0].style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("svgCanvas").style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("menuContainer").style.width = window.innerWidth + window.scrollX + "px";
        } else {

            document.getElementsByTagName("html")[0].style.width = "100%";
            document.getElementById("svgCanvas").style.width = "100%";
            document.getElementById("menuContainer").style.width = "100%";
        }
        if (window.scrollY > 0) {
            document.getElementsByTagName("html")[0].style.height = window.innerHeight + window.scrollY + "px";
            document.getElementById("svgCanvas").style.height = window.innerHeight + window.scrollY + "px";
        } else {
            document.getElementsByTagName("html")[0].style.height = "100%";
            document.getElementById("svgCanvas").style.height = "100%";
        } 
    }


    errorCallBack(message: string) {

    }
}
