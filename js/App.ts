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
    private static currentScene: number;
    private static src: IHTMLDivElementSrc;
    private static out: IHTMLDivElementOut;


    private tempModuleName: string;
    scenes: Scene[];
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    currentNumberDSP: number;
    inputs: any[];
    outputs: any[];
    params: any[];
    factory: Factory;

    showFirstScene(): void {
        App.scene.showScene();
    }

    createAllScenes(): void {


        var sceneView: SceneView = new SceneView();
        App.scene = new Scene("Normal", this, sceneView.onloadNormalScene, sceneView.onunloadNormalScene, sceneView);
        App.scene.sceneView = sceneView;
        sceneView.initNormalScene(this.scenes[0]);
            

        
        App.currentScene = 0;
    }



    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/

    activateAudioInput(app: App): void {

        var navigatorLoc: Navigator = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }

        if (navigatorLoc.getUserMedia) {

            navigatorLoc.getUserMedia({ audio: true }, function (mediaStream) { app.getDevice(mediaStream, app) }, function (e) {
                alert('Error getting audio input');
            });
        } else {
            alert('Audio input API not available');
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

    compileFaust(name: string, sourcecode: string, x: number, y: number, callback: (Factory: Factory, scene: Scene, app: App) => void) {

        //  Temporarily Saving parameters of compilation
        this.tempModuleName = name;
        this.tempModuleSourceCode = sourcecode;
        this.tempModuleX = x;
        this.tempModuleY = y;

        var currentScene: Scene = this.scenes[App.currentScene];

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
        this.factory = faust.createDSPFactory(sourcecode, args);
        callback(this.factory, App.scene, this);

        if (currentScene) { currentScene.unmuteScene() };

    }

    private createModule(factory: Factory, scene: Scene, app: App): void {

        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }


        // can't it be just window.scenes[window.currentScene] ???
        //if (App.isTooltipEnabled)
        var module: ModuleClass = new ModuleClass(App.idX++, app.tempModuleX, app.tempModuleY, app.tempModuleName, scene, document.getElementById("modules"), scene.removeModule);
        //else
        //    faustModule = new ModuleClass(this.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), this.scenes[0].removeModule);

        module.moduleFaust.setSource(app.tempModuleSourceCode);
        module.createDSP(factory);
        module.createFaustInterface();
        module.addInputOutputNodes();

        scene.addModule(module);
        App.hideFullPageLoading()
    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- Init drag and drop reactions
    setGeneralDragAndDrop(app: App): void {

        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };

        window.ondrop = function (e) {

            app.uploadFile(e);
            return true;
        };
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

        var uploadTitle: HTMLElement = document.getElementById("upload");
        uploadTitle.textContent = "";

    }

    //-- Finds out if the drop was on an existing module or creating a new one
    private uploadFile(e: DragEvent): void {

        if (!e) {
            e = <DragEvent>window.event;
        }

        var alreadyInNode: Boolean = false;

        var modules: ModuleClass[] = this.scenes[App.currentScene].getModules();

        for (var i = 0; i < modules.length; i++) {
            if (modules[i].moduleView.isPointInNode(e.clientX, e.clientY)) {
                alreadyInNode = true;
            }
        }

        if (!alreadyInNode) {
            var x = e.clientX;
            var y = e.clientY;
            this.uploadOn(this, null, x, y, e);
        }
    }

    //-- Upload content dropped on the page and create a Faust DSP with it
    uploadOn(app: App, module: ModuleClass, x: number, y: number, e: DragEvent) {
        App.showFullPageLoading();
        //worker.postMessage("go");
        this.preventDefaultAction(e);

        var uploadTitle: HTMLElement = document.getElementById("upload");

        uploadTitle.textContent = "CHARGEMENT EN COURS ...";

        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url: string = e.dataTransfer.getData('URL');
            var filename: string = url.toString().split('/').pop();
            filename = filename.toString().split('.').shift();

            var xmlhttp: XMLHttpRequest = new XMLHttpRequest
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var dsp_code: string = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";

                    if (module == null) {
                        app.compileFaust(filename, dsp_code, x, y, app.createModule);
                    } else {
                        module.update(filename, dsp_code);
                    }
                }

                app.terminateUpload();
            }

            xmlhttp.open("GET", url);
            // 	Avoid error "mal formé" on firefox
            xmlhttp.overrideMimeType('text/html');
            xmlhttp.send();
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {

            var dsp_code: string = e.dataTransfer.getData('text');

            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";

                if (!module) {
                    app.compileFaust("TEXT", dsp_code, x, y, app.createModule);
                } else {
                    module.update("TEXT", dsp_code);
                }

                app.terminateUpload();
            }
            // CASE 3 : THE DROPPED OBJECT IS A FILE CONTAINING SOME FAUST CODE
            else {
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
                            app.compileFaust(filename, dsp_code, x, y, app.createModule);
                        } else if (type == "dsp") {
                            module.update(filename, dsp_code);
                        } else if (type == "json") {
                            app.scenes[App.currentScene].recallScene(reader.result);
                        }
                        app.terminateUpload();
                    };
                }
            }
        }
        // CASE 4 : ANY OTHER STRANGE THING
        else {
            app.terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
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

    static addLoadingLogo(divTarget: string) {
        var loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = App.baseImg + "logoAnim.gif"
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent="Chargement..."

        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);

        document.getElementById(divTarget).appendChild(loadingDiv);
    }
    static removeLoadingLogo() {
        document.getElementById("loadingDiv").remove();
    }
    static showFullPageLoading() {
        
        var loadingPage = document.createElement("div");
        loadingPage.id = "loadingPage";
        var body = document.getElementsByTagName('body')[0];
        var loadingText = document.createElement("div");
        loadingText.id="loadingTextBig"
        loadingText.textContent = "Chargement en cours";
        loadingPage.appendChild(loadingText);
        body.appendChild(loadingPage);
        document.getElementById("Normal").style.filter = "blur(2px)"
        document.getElementById("Normal").style.webkitFilter = "blur(2px)"



        //App.addLoadingLogo(loadingPage.id);
    }
    static hideFullPageLoading() {
        document.getElementById("loadingPage").remove();
        document.getElementById("Normal").style.filter = "none"
        document.getElementById("Normal").style.webkitFilter = "none"


    }
}
