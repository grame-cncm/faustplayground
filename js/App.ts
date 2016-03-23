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



class App {

    //************* Fields
    static appTest: number = 0;
    static audioContext: AudioContext;
    static idX: number=0;
    static scene: Scene;
    static baseImg: string = "img/";
    static isTooltipEnabled: boolean;
    static buttonVal: number;
    static libraryContent: string;
    static recursiveMap: ModuleTree[];
    static jsonText: string;
    static exportURL: string;
    static isAccelerometerOn: boolean = false;
    static isAccelerometerEditOn: boolean = false;
    static accHandler: AccelerometerHandler;
    private static currentScene: number;
    private static src: IHTMLDivElementSrc;
    private static out: IHTMLDivElementOut;
    menu: Menu

    tempModuleName: string;
    tempPatchId: string;
    scenes: Scene[];
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    currentNumberDSP: number;
    inputs: any[];
    outputs: any[];
    params: any[];
    factory: Factory;

    constructor() {
        

    }

    showFirstScene(): void {
        App.scene.showScene();
    }

    createAllScenes(): void {


        var sceneView: SceneView = new SceneView();
        App.scene = new Scene("Normal", this, sceneView);
        //App.scene.sceneView = sceneView;
        this.setGeneralAppListener(this);
        //sceneView.initNormalScene(App.scene);
            

        
        App.currentScene = 0;
    }

    createMenu(): void {
        this.menu = new Menu(document.getElementsByTagName('body')[0])
        this.menu.setMenuScene(App.scene);
        App.scene.getSceneContainer().addEventListener("mousedown", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.menuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.menuChoices)
            }
        }, true);
        App.scene.getSceneContainer().addEventListener("touchstart", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.menuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.menuChoices)
            }
        }, true);
    }

    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/

    activateAudioInput(scene: Scene): void {

        var navigatorLoc: Navigator = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }

        if (navigatorLoc.getUserMedia) {

            navigatorLoc.getUserMedia({ audio: true },  (mediaStream)=> { this.getDevice(mediaStream, this) }, function (e) {
                scene.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)"
                scene.fAudioInput.moduleView.fInterfaceContainer.title = "Error getting audio input";
            });
        } else {
            scene.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)"
            scene.fAudioInput.moduleView.fInterfaceContainer.title = "Audio input API not available";
        }
    }

    private getDevice(device: MediaStream, app: App): void {

        // Create an AudioNode from the stream.
        App.src = <IHTMLDivElementSrc>document.getElementById("input");
        App.src.audioNode = App.audioContext.createMediaStreamSource(device);
        var drag: Drag = new Drag();
        var connect: Connector = new Connector();
        connect.connectInput(App.scene.fAudioInput, App.src);
    }


    activateAudioOutput(sceneOutput: ModuleClass): void {

        App.out = <IHTMLDivElementOut>document.createElement("div");
        App.out.id = "audioOutput";
        App.out.audioNode = App.audioContext.destination;
        document.body.appendChild(App.out);
        var connect: Connector = new Connector();
        connect.connectOutput(sceneOutput, App.out);
    }

    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/

    compileFaust(name: string, sourcecode: string, x: number, y: number, callback: (Factory: Factory) => void) {

        //  Temporarily Saving parameters of compilation
        this.tempModuleName = name;
        this.tempModuleSourceCode = sourcecode;
        this.tempModuleX = x;
        this.tempModuleY = y;

        var currentScene: Scene = App.scene;

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
            this.factory = faust.createDSPFactory(sourcecode, args, (factory) => { callback(factory) });
        } catch (error) {
            alert(error)
        }
        
        //callback(this.factory)
        if (currentScene) { currentScene.unmuteScene() };

    }

    private createModule(factory: Factory): void {

        if (!factory) {
            alert(faust.getErrorMessage());
            this.terminateUpload();
            return null;
        }


        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        var module: ModuleClass = new ModuleClass(App.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, App.scene, document.getElementById("modules"), App.scene.removeModule);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);

        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
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
        App.scene.addModule(module);
        if (!App.scene.isInitLoading) {
            App.hideFullPageLoading()
        }

    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- Init drag and drop reactions
    setGeneralAppListener(app: App): void {

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

        App.hideFullPageLoading();

    }

    //-- Finds out if the drop was on an existing module or creating a new one


    //-- Upload content dropped on the page and create a Faust DSP with it
    uploadOn(app: App, module: ModuleClass, x: number, y: number, e: DragEvent) {
        App.showFullPageLoading();
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
                    throw new Error("Upload2Error");
                }
            }
        } else { // CASE 4 : ANY OTHER STRANGE THING
            app.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
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
                    app.compileFaust(filename, dsp_code, x, y, (factory) => { app.createModule(factory) });
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
            app.compileFaust("TEXT", dsp_code, x, y, (factory) => { app.createModule(factory) });
        } else {
            module.update("TEXT", dsp_code);
        }

        //app.terminateUpload();
    }

    uploadFile2(app: App, module: ModuleClass, x: number, y: number, e: DragEvent, dsp_code: string) {
        var files: FileList = e.dataTransfer.files;//e.target.files ||

        var file: File = files[0];

        if (location.host.indexOf("sitepointstatic") >= 0) { return }

        var request: XMLHttpRequest = new XMLHttpRequest();
        if (request.upload) {

            var reader: FileReader = new FileReader();

            var ext: string = file.name.toString().split('.').pop();

            var filename: string = file.name.toString().split('.').shift();

            var type: string;

            if (ext == "dsp") {
                type = "dsp";
                reader.readAsText(file);
            }
            else if (ext == "json") {
                type = "json";
                reader.readAsText(file);
            } else {
                this.terminateUpload();
            }

            reader.onloadend = function (e) {
                dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";

                if (!module && type == "dsp") {
                    app.compileFaust(filename, dsp_code, x, y, (factory) => { app.createModule(factory) });
                } else if (type == "dsp") {
                    module.update(filename, dsp_code);
                } else if (type == "json") {
                    App.scene.recallScene(reader.result);
                }
                //app.terminateUpload();
            };
        }
    }

    dblTouchUpload(e: CustomEvent) {
        App.showFullPageLoading();
        var position: PositionModule = App.scene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);

    }

    //Check in Url if the app should be for kids
    static isAppPedagogique(): boolean {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true
        } else {
            return false
        }
    }
    //generic function to make XHR request
    static getXHR(url: string, callback: (any) => any,errCallback:(any)=>any) {

        var getrequest: XMLHttpRequest = new XMLHttpRequest();

        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                callback(getrequest.responseText);
            } else if (getrequest.readyState == 4 && getrequest.status == 400){
                errCallback(getrequest.responseText);
            }
        }

        getrequest.open("GET", url, true);
        getrequest.send(null);
    }


    static preventdefault(e: Event) {
        e.preventDefault();
    }

    ////////////////////////////// LOADINGS //////////////////////////////////////

    //add loading logo and text on export
    static addLoadingLogo(divTarget: string) {
        var loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = App.baseImg + "logoAnim.gif"
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent = "Compilation en cours..."
        loadingText.id = "loadingText";
        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);

        document.getElementById(divTarget).appendChild(loadingDiv);
    }
    static removeLoadingLogo() {
        document.getElementById("loadingDiv").remove();
    }

    static addFullPageLoading() {
        
        var loadingPage = document.createElement("div");
        loadingPage.id = "loadingPage";
        loadingPage.className = "loadingPage";
        var body = document.getElementsByTagName('body')[0];
        var loadingText = document.createElement("div");
        loadingText.id="loadingTextBig"
        loadingText.textContent = "Chargement en cours";
        loadingPage.appendChild(loadingText);
        body.appendChild(loadingPage);
        loadingPage.style.display = "none"
    }

    static showFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "visible";
        //too demanding for mobile firefox...
        //document.getElementById("Normal").style.filter = "blur(2px)"
        //document.getElementById("Normal").style.webkitFilter = "blur(2px)"
        //document.getElementById("menuContainer").style.filter = "blur(2px)"
        //document.getElementById("menuContainer").style.webkitFilter = "blur(2px)"
    }
    static hideFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "hidden";
            //document.getElementById("Normal").style.filter = "none"
            //document.getElementById("Normal").style.webkitFilter = "none"
            //document.getElementById("menuContainer").style.filter = "none"
            //document.getElementById("menuContainer").style.webkitFilter = "none"
        
    }

    static createDropAreaGraph() {
        
    }
    // manage style during a drag and drop event
    styleOnDragStart() {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        App.scene.sceneView.dropElementScene.style.display = "block";
        App.scene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules: ModuleClass[] = App.scene.getModules();
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
        App.scene.sceneView.dropElementScene.style.display = "none";
        App.scene.getSceneContainer().style.boxShadow = "none";
        var modules: ModuleClass[] = App.scene.getModules();
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
    static replaceAll(str: String, find: string, replace: string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
