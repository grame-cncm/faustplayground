/*     APP.JS


Class App

Create the scenes
Activate Physical input/ output
Handle Drag and Drop
Create Factories and Modules


    */
/// <reference path="Scenes/Scene.ts"/>
/// <reference path="Modules/Module.ts"/>
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
/// <reference path="Messages.ts"/>
/// <reference path="Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>

//object containg info necessary to compile faust code


class App {
    //private static currentScene: number;
    menu: Menu;
    scene: Scene;
    tempModuleName: string;
    tempModuleSourceCode: string;
    tempModuleX: number;
    tempModuleY: number;
    audioContext: AudioContext;
    players: Players;
    private data_transfer: DataTransfer;

    constructor() {
        //create div which will contain all Messages and Confirm
        App.createDialogue();
        this.audioContext = new AudioContext();

        Utilitary.addFullPageLoading();

        this.players = new Players(this);
        this.createAllScenes();
        this.createMenu();

        var accHandler: AccelerometerHandler = new AccelerometerHandler();
        Utilitary.accHandler = accHandler;
        accHandler.getAccelerometerValue();

        Utilitary.driveApi = new DriveAPI();
        this.menu.setDriveApi(Utilitary.driveApi);
        Utilitary.driveApi.checkAuth();


        //error catcher
        window.addEventListener("error", (e: ErrorEvent) => {
            if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
                new Message(_("An error has occured:") + e.message);
                Utilitary.hideFullPageLoading();
            }
            if (e.message == "Uncaught Error: Upload2Error") {
                Utilitary.hideFullPageLoading();
                e.preventDefault();
            }
        });
    }

    createAllScenes(): void {
        this.scene = new Scene(this);
        //TODO: remove
        Utilitary.currentScene = this.scene;
        this.setGeneralAppListener();
    }

    createMenu(): void {
        this.menu = new Menu(document.getElementsByTagName('body')[0], this);
        //pass the scene to the menu to allow it to access the scene
        this.menu.setMenuScene(this.scene);

        //add eventlistener on the scene to hide menu when clicked or touched
        this.scene.getSceneContainer().addEventListener("mousedown", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null;
                this.menu.menuHandler(this.menu.newMenuChoices);
            }
        }, true);
        this.scene.getSceneContainer().addEventListener("touchstart", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null;
                this.menu.menuHandler(this.menu.newMenuChoices);
            }
        }, true);
    }

    //create div to append messages and confirms
    static createDialogue() {
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

        if (this.scene)
            this.scene.muteScene();

        //locate libraries used in libfaust compiler
        var args: string[] = ["-I", /[^#]*/.exec(location.href) + "faustcode/"];

        //try to create the asm.js code/factory with the faust code given. Then callback to function passing the factory.
        try {
            faust.createDSPFactory(compileFaust.sourceCode, args, (factory) => {
                compileFaust.callback(factory)
            });
        } catch (error) {
            new Message(error)
        }

        if (this.scene)
            this.scene.unmuteScene();

    }


    //create Module, set the source faust code to its moduleFaust, set the faust interface , add the input output connection nodes
    //
    private createModule(factory: Factory): void {
        if (!factory) {
            new Message(_("The provided Faust code is not correct: ") + faust.getErrorMessage());
            Utilitary.hideFullPageLoading();
            return null;
        }

        var module: Module = new Module(Utilitary.idX++,
                                        this.tempModuleX,
                                        this.tempModuleY,
                                        this.tempModuleName,
                                        document.getElementById("modules"),
                                        (module) => { this.scene.removeModule(module) },
                                        this.compileFaust,
                                        this.audioContext);
        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();

        //set listener to recompile when dropping faust code on the module
        if (this.tempModuleName != "input" && this.tempModuleName != "output") {
            module.moduleView.fModuleContainer.ondrop =
                (e) => this.onDrop(e, module);
        }
        module.moduleView.fModuleContainer.ondragover = () => {
            this.highlightPossibleTarget(module, 'Module', true);
        };
        module.moduleView.fModuleContainer.ondragleave = () => {
            this.highlightPossibleTarget(module, 'Module', false)
        };
        // the current scene add the module and hide the loading page
        this.scene.addModule(module);
        if (!this.scene.isInitLoading)
            Utilitary.hideFullPageLoading();

    }

    private highlightPossibleTarget(module: Module, module_type: string, over: boolean) {
        if(!over)
            return module.moduleView.fModuleContainer.classList.remove('dragover');

        var highlight: boolean = false;
        switch (this.data_transfer.getData('ddtype')) {
            case 'faustcodeurl' :
                if (module_type === 'Module')
                    highlight = true;
                break;
            case 'player' :
                if (module_type === 'Player')
                    highlight = true;
                break;
        }
        if(highlight)
            module.moduleView.fModuleContainer.classList.add('dragover');
    }

    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/

    //-- custom event to load file from the load menu with the file explorer
    //Init drag and drop reactions, scroll event and body resize event to resize svg element size,
    // add custom double touch event to load dsp from the library menu
    setGeneralAppListener(): void {

        //custom event to load file from the load menu with the file explorer
        document.addEventListener("fileload", (e: CustomEvent) => { this.loadFileEvent(e) });

        window.addEventListener('dragover',
                                (e: DragEvent) => e.preventDefault());
        window.addEventListener('dragstart',
                                (e: DragEvent) => this.onDragStart(e));
        window.addEventListener('dragend',
                                (e: DragEvent) => this.onDragEnd());
        window.addEventListener('drop',
                                (e: DragEvent) => this.onDrop(e));

        document.body.addEventListener('mousedown',
                                (e: MouseEvent) => this.onMouseDown(e));
        document.body.addEventListener('mouseup',
                                (e: MouseEvent) => this.onMouseUp(e));

        //scroll event to check the size of the document
        document.onscroll = () => {
            this.checkRealWindowSize()
        };

        //resize event
        window.onresize = () => { this.checkRealWindowSize() };

        //custom double touch from library menu to load an effect or an intrument.
        document.addEventListener("dbltouchlib", (e: CustomEvent) => { this.dblTouchUpload(e) });
        document.addEventListener("dbltouchplayer", (e: CustomEvent) => {
            var pos: PositionModule = this.scene.positionDblTapModule();
            this.createPlayerModule(pos.x, pos.y, (<PlayerMenuItem>(e.detail)).player.ident);
            });
    }


    //used for Url pointing at a dsp file
    private createModuleFromUrl(module: Module, x: number, y: number, url: string): void {
        var filename: string = url.split('/').pop();
        filename = filename.split('.').shift();
        Utilitary.getXHR(url,
            (codeFaust)=>{
                var dsp_code: string = "process = vgroup(\"" + filename + "\",environment{" + codeFaust + "}.process);";
                if (module == null) {
                    this.compileFaust({ name:filename,
                                       sourceCode:dsp_code,
                                       x:x,
                                       y:y,
                                       callback:(factory) => {
                                           this.createModule(factory)
                                       }
                                      });
                } else {
                     module.update(filename, dsp_code);
                }
        }, Utilitary.errorCallBack)
    }


    // used for dsp code faust
    uploadCodeFaust(module: Module, x: number, y: number, dsp_code:string) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            this.compileFaust(
                { name: "TEXT",
                    sourceCode: dsp_code,
                    x: x,
                    y: y,
                    callback: (factory) => { this.createModule(factory) }});
        } else {
            module.update("TEXT", dsp_code);
        }
    }

    //used for File containing code faust or jfaust/json scene descriptor get the file then pass it to loadFile()
    uploadFileFaust(module: Module, x: number, y: number, e: DragEvent) {
        var files: FileList = e.dataTransfer.files;
        var file: File = files[0];
        this.loadFile(file, module, x, y);
    }

    //Load file dsp or jfaust
    private loadFile(file: File, module: Module, x: number, y: number) {
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
            throw new Error(_("Content is not compatible with Faust"));
        }

        reader.onloadend = () => {
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";

            if (!module && type == "dsp") {
                this.compileFaust({ name:filename, sourceCode:dsp_code, x:x, y:y, callback:(factory) => { this.createModule(factory) }});
            } else if (type == "dsp") {
                module.update(filename, dsp_code);
            } else if (type == "json") {
                this.scene.recallScene(reader.result);
            }
        };
    }
    //used when a custom event from loading file with the browser dialogue
    loadFileEvent(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var file: File = <File>e.detail;
        var position: PositionModule = this.scene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y)

    }
    //used with the library double touch custom event
    dblTouchUpload(e: CustomEvent) {
        Utilitary.showFullPageLoading();
        var position: PositionModule = this.scene.positionDblTapModule();
        this.createModuleFromUrl(null, position.x, position.y, e.detail);

    }


    ////////////////////////////// design on drag or drop //////////////////////////////////////

    // manage style during a drag and drop event
    private onDragStart(evt: DragEvent) {
        var target: HTMLElement = <HTMLElement>evt.target;
        var link: HTMLAnchorElement = target.getElementsByTagName('a')[0];
        /* keep reference of dataTransfer because we need to access it
           during the drag operation and dataTransfer is not reachable
           on dragover / draleave events.
         */
        this.data_transfer = evt.dataTransfer;
        evt.dataTransfer.setData('text', '');
        evt.dataTransfer.setData('URL', link.href);
        evt.dataTransfer.setData('ddtype', target.getAttribute('data-ddtype'));

        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        this.scene.sceneView.dropElementScene.style.display = "block";
        this.scene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules: Module[] = this.scene.getModules();
        //for (var i = 0; i < modules.length; i++) {
        //    modules[i].moduleView.fModuleContainer.style.opacity="0.5"
        //}
    }

    private onDragEnd() {
        this.data_transfer = null;
        this.menu.menuView.menuContainer.classList.remove("no_pointer");
        this.menu.menuView.menuContainer.style.opacity = "1";
        this.scene.sceneView.dropElementScene.style.display = "none";
        this.scene.getSceneContainer().style.boxShadow = "none";
        var modules: Module[] = this.scene.getModules();
        for(var module of this.scene.getModules())
            (<Module>module).moduleView.fModuleContainer.classList.remove('dragover');
        this.menu.closeMenu();
    }

    private onDrop(e: DragEvent, module?: Module): void {
        e.preventDefault();
        e.stopPropagation();
        this.onDragEnd();
        var x = e.clientX;
        var y = e.clientY;
        var dtfiles: FileList = e.dataTransfer.files;

        Utilitary.showFullPageLoading();

        if (module && dtfiles.length === 1)
            return this.updateModuleFromFile(dtfiles[0], module);

        else if (dtfiles.length)
            return this.createModulesFromFiles(dtfiles, x, y);

        else {
            switch (e.dataTransfer.getData('ddtype')) {
                case 'faustcodeurl' :
                    return this.createModuleFromUrl(module, x, y, e.dataTransfer.getData('URL'));

                case 'player' :
                    Utilitary.hideFullPageLoading();
                    if (!module)
                        return this.createPlayerModule(x, y, e.dataTransfer.getData('URL'));
                    else
                        // return (<PlayerModule>module).rtcConnectPlayer(
                        //     this.players.getPlayer(
                        //         e.dataTransfer.getData('URL')));
                        break;

                default :
                    var dttext: string = e.dataTransfer.getData('text');
                    if (dttext)
                        return this.uploadCodeFaust(module, x, y, dttext);
                    else {
                        console.error("DROP: CASE 4 STRANGE ");
                        new Message(_("Content is not compatible with Faust"));
                        Utilitary.hideFullPageLoading();
                    }
            }
        }

    }

    private updateModuleFromFile(file: File, module: Module): void {
        this.loadFile(file, module, 0, 0);
    }

    private createModulesFromFiles(files: FileList, x: number, y: number): void {
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            console.log("FILES DROP : "+ i + " : " + f.name);
            this.loadFile(f, null, x+10*i, y+10*i);
        }
    }

    private createPlayerModule(x:number, y:number, url:string) {
        var player: Player = this.players.getPlayer(url);
        var pm: PlayerModule = new PlayerModule(Utilitary.idX++,
                                                x,
                                                y,
                                                'player',
                                                document.getElementById('modules'),
                                                () => {
                                                    pm.onremove(this);
                                                    this.scene.removeModule(pm);
                                                },
                                                this.compileFaust,
                                                this.audioContext,
                                                player);
        this.players.startRTCWith(player);
        pm.patchID = 'player' + url;
        pm.compileFaust({name: pm.patchID,
                         sourceCode: 'process=_,_;',
                         x: x,
                         y: y,
                         callback:(factory) => {
                             pm.moduleFaust.setSource('process=_,_;');
                             pm.createDSP(factory);
                             pm.moduleView.setOutputNode();
                             pm.moduleView.fOutputNode.addEventListener("mousedown", pm.eventConnectorHandler);
                             pm.moduleView.fOutputNode.addEventListener("touchstart", pm.eventConnectorHandler);
                             pm.moduleView.fOutputNode.addEventListener("touchmove", pm.eventConnectorHandler);
                             pm.moduleView.fOutputNode.addEventListener("touchend", pm.eventConnectorHandler);
                         }
        });

        pm.moduleView.fModuleContainer.ondrop =
            (e:DragEvent) => this.onDrop(e, pm);

        pm.moduleView.fModuleContainer.ondragover =
            () => this.highlightPossibleTarget(pm, 'Player', true);
        pm.moduleView.fModuleContainer.ondragleave =
            () => this.highlightPossibleTarget(pm, 'Player', false);

        this.scene.addModule(pm);
    }

    private onMouseDown(e: MouseEvent) {
        var target: HTMLElement = <HTMLElement>e.target;
        while(!target.draggable && target != document.body)
            target = <HTMLElement>target.parentNode;
        if (target.draggable)
            target.classList.add('dragging');
    }

    private onMouseUp(e: MouseEvent) {
        for(let node of [].map.call(document.querySelectorAll('.dragging'), (n: HTMLElement) => n))
            node.classList.remove('dragging');
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


    public getRTCConfiguration() : RTCConfiguration {

        /* uncomment and edit the following lines to activate STUN and TURN servers */
        // var stun_server: RTCIceServer = {
        //     urls : 'stun:your.stun.server.com:3478'
        // };
        // var turn_server: RTCIceServer = {
        //     urls : 'turn:your.turn.server.com:3478?transport=udp',
        //     username : 'username',
        //     credential : 'password'
        // };
        // var conf: RTCConfiguration = {
        //     iceServers : [stun_server, turn_server]
        // };
        //
        // return conf;
        return null;
    }
}


