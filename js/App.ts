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
/// <reference path="Lib/webaudio-asm-worker-wrapper.d.ts"/>
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
/// <reference path="Lib/qrcode.d.ts"/>
/// <reference path="Ressources.ts"/>
/// <reference path="Messages.ts"/>
/// <reference path="Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>

//object containg info necessary to compile faust code

class App {
    menu: Menu;
    scenes: Scene[];

    tempModuleName: string;
    tempPatchId: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    tempParams: IJsonParamsSave;

    inputs: any[];
    outputs: any[];
    params: any[];

    factory: Factory;

    createAllScenes(): void {
        var sceneView: SceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this.compileFaust, sceneView);
        this.setGeneralAppListener(this);
    }

    createMenu(): void {
        this.menu = new Menu(document.getElementsByTagName('body')[0])
        //pass the scene to the menu to allow it to access the scene
        this.menu.setMenuScene(Utilitary.currentScene);

        //add eventlistener on the scene to hide menu when clicked or touched
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.newMenuChoices)
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null
                this.menu.menuHandler(this.menu.newMenuChoices)
            }
        }, true);
    }

    //create div to append messages and confirms
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

        if (currentScene) { currentScene.muteScene() };

        //locate libraries used in libfaust compiler
        var libpath = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + "/faustlibraries/";
        var args: string[] = ["-I", libpath, "-ftz", "2"];

        //try to create the wasm code/factory with the given Faust code. Then callback to function passing the factory.
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, (factory) => { compileFaust.callback(factory) });
        } catch (error) {
            new Message(error)
        }

        if (currentScene) { currentScene.unmuteScene() };
    }

    //create Module, set the source faust code to its moduleFaust, set the faust interface , add the input output connection nodes
    //
    private createModule(factory: Factory): void {
        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory + faust.getErrorMessage());
            Utilitary.hideFullPageLoading();
            return;
        }

        var module: ModuleClass = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => { Utilitary.currentScene.removeModule(module) }, this.compileFaust);
        module.moduleFaust.setSource(this.tempModuleSourceCode);

        module.createDSP(factory, () => {
        	module.setFaustInterfaceControles();
        	module.createFaustInterface();
        	module.addInputOutputNodes();

       	 	//set listener to recompile when dropping faust code on the module
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
        	// the current scene add the module and hide the loading page
        	Utilitary.currentScene.addModule(module);
        	if (!Utilitary.currentScene.isInitLoading) {
            	Utilitary.hideFullPageLoading()
        	}
        });
    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- custom event to load file from the load menu with the file explorer
    //Init drag and drop reactions, scroll event and body resize event to resize svg element size,
    // add custom double touch event to load dsp from the library menu
    setGeneralAppListener(app: App): void {

        //custom event to load file from the load menu with the file explorer
        document.addEventListener("fileload", (e: CustomEvent) => { this.loadFileEvent(e) })

        //All drog and drop events
        window.ondragover = function () { return false; };
        window.ondragend  = function () { return false; };
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

        //scroll event to check the size of the document
        document.onscroll = () => {
            this.checkRealWindowSize()
        };

        //resize event
        var body: HTMLBodyElement = document.getElementsByTagName("body")[0]
        body.onresize = () => { this.checkRealWindowSize() };

        window.ondrop = (e) => {
            this.styleOnDragEnd()
            var x = e.clientX;
            var y = e.clientY;
            this.uploadOn(this, null, x, y, e);
        };

        //custom double touch from library menu to load an effect or an intrument.
        document.addEventListener("dbltouchlib", (e: CustomEvent) => { this.dblTouchUpload(e) });
    }

    //-- Upload content dropped on the page and allocate the content to the right function
    uploadOn(app: App, module: ModuleClass, x: number, y: number, e: DragEvent) {
        Utilitary.showFullPageLoading();
        e.preventDefault();

        if (e.dataTransfer.files.length > 0) {
			// we are dropping a file
			for (var i = 0; i < e.dataTransfer.files.length; i = i + 1) {
				var f = e.dataTransfer.files[i];
				console.log("FILES DROP : "+ i + " : " + f.name);
                this.loadFile(f, module, x+10*i, y+10*i);
			}

		} else if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            // CASE 1 : the dropped object is a url to some faust code
            var url = e.dataTransfer.getData('URL');
            console.log("URL DROP : "+ url);
            this.uploadUrl(app, module, x, y, url);

        } else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code: string = e.dataTransfer.getData('text');
            console.log("Text DROP : " + dsp_code);
            // CASE 2 : the dropped object is some faust code
            if (dsp_code) {
                 console.log("DROP: CASE 2 ");
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            } else {
                // CASE 3 : the dropped object is a file containing some faust code or jfaust/json
                console.log("DROP: CASE 3 ");
                try {
                    this.uploadFileFaust(app, module, x, y, e, dsp_code);
                } catch (error) {
                    new Message(error);
                    Utilitary.hideFullPageLoading();
                }
            }

        } else { // CASE 4 : any other strange thing
            console.log("DROP: CASE 4 STRANGE ");
            new Message(Utilitary.messageRessource.errorObjectNotFaustCompatible);
            Utilitary.hideFullPageLoading();
        }
    }

    //used for Url pointing at a dsp file
    uploadUrl(app: App, module: ModuleClass, x: number, y: number, url: string) {
        var filename: string = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        Utilitary.getXHR(url, (codeFaust)=>{
            var dsp_code: string = "process = vgroup(\"" + filename + "\",environment{" + codeFaust + "}.process);";

            if (module == null) {
                app.compileFaust({ name:filename, sourceCode:dsp_code, x:x, y:y, callback:(factory) => { app.createModule(factory) }});
            } else {
                 module.update(filename, dsp_code);
            }
        }, Utilitary.errorCallBack)
    }

    // used for dsp code faust
    uploadCodeFaust(app: App, module: ModuleClass, x: number, y: number, e: DragEvent, dsp_code:string) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: (factory) => { app.createModule(factory) }});
        } else {
            module.update("TEXT", dsp_code);
        }
    }

    //used for File containing code faust or jfaust/json scene descriptor get the file then pass it to loadFile()
    uploadFileFaust(app: App, module: ModuleClass, x: number, y: number, e: DragEvent, dsp_code: string) {
        var files: FileList = e.dataTransfer.files;
        var file: File = files[0];
        this.loadFile(file, module, x, y);
    }

    //Load file dsp or jfaust
    loadFile(file: File, module: ModuleClass, x: number, y: number) {
        var dsp_code: string;
        var reader: FileReader = new FileReader();
        var ext: string = file.name.toString().split('.').pop();
        var filename: string = file.name.toString().split('.').shift();
        var type: string;

        if (ext == "dsp") {
            type = "dsp";
            reader.readAsText(file);
        } else if (ext == "json"||ext=="jfaust") {
            type = "json";
            reader.readAsText(file);
        } else {
            throw new Error(Utilitary.messageRessource.errorObjectNotFaustCompatible);
        }

        reader.onloadend =(e)=>{
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";

            if (!module && type == "dsp") {
                this.compileFaust({ name:filename, sourceCode:dsp_code, x:x, y:y, callback:(factory) => { this.createModule(factory) }});
            } else if (type == "dsp") {
                module.update(filename, dsp_code);
            } else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
        };
    }
    //used when a custom event from loading file with the browser dialogue
    loadFileEvent(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var file: File = <File>e.detail;
        var position: PositionModule = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y)

    }
    //used with the library double touch custom event
    dblTouchUpload(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var position: PositionModule = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);
    }

    ////////////////////////////// design on drag or drop //////////////////////////////////////

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
        this.menu.menuView.menuContainer.classList.remove("no_pointer");

        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules: ModuleClass[] = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow ="0 5px 10px rgba(0, 0, 0, 0.4)"
        }
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

    errorCallBack(message: string) {}
}
