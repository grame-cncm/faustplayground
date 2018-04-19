//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView

	/// <reference path="Library.ts"/>
	/// <reference path="LibraryView.ts"/>
	/// <reference path="Export.ts"/>
	/// <reference path="ExportView.ts"/>
	/// <reference path="Help.ts"/>
    /// <reference path="HelpView.ts"/>
    /// <reference path="Load.ts"/>
    /// <reference path="Save.ts"/>
    /// <reference path="AccelerometerEdit.ts"/>
    /// <reference path="../DriveAPI.ts"/>
    /// <reference path="../Messages.ts"/>

interface Document {
    cancelFullScreen: () => any;
    mozCancelFullScreen: () => any;
}

interface HTMLElement {
    mozRequestFullScreen: () => any;
}

enum MenuChoices { library, export, help, kids, edit, save, load, null }

class Menu {
    isMenuDriveLoading: boolean = false;
    sceneCurrent: Scene;
    newMenuChoices: MenuChoices;
    currentMenuChoices: MenuChoices = MenuChoices.null;
    menuView: MenuView;
    library: Library;
    load: Load
    save: Save;
    expor: Export;
    accEdit: AccelerometerEdit;
    help: Help;
    isFullScreen: boolean = false;
    isAccelerometer: boolean = Utilitary.isAccelerometerOn;
    drive: DriveAPI;

    constructor(htmlContainer: HTMLElement) {
        //create and init menu view wich gone create and init all sub menus views
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);

        //add Event Listeners
        this.menuView.libraryButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.library) };
        this.menuView.exportButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.export) };
        this.menuView.helpButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.help) };
        this.menuView.editButtonMenu.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.edit) });
        this.menuView.closeButton.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.null) };
        this.menuView.saveButton.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.save) });
        this.menuView.loadButton.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.load) });
        this.menuView.fullScreenButton.addEventListener("click", () => { this.fullScreen() });
        this.menuView.accButton.addEventListener("click", () => { this.accelerometer() });
        this.menuView.cleanButton.addEventListener("click", () => { new Confirm(Utilitary.messageRessource.confirmEmptyScene, (callback) => { this.cleanScene(callback) }) });

        //add eventListern customs
        document.addEventListener("updatename", (e) => { this.updatePatchNameToInput(e) })
        document.addEventListener("codeeditevent", () => { this.customeCodeEditEvent() });
        document.addEventListener("updatelist", () => { this.updateSelectLocalEvent() });
        document.addEventListener("authon", () => { this.authOn() });
        document.addEventListener("authoff", () => { this.authOff() });
        document.addEventListener("fillselect", (optionEvent: CustomEvent) => { this.fillSelectCloud(optionEvent) })
        document.addEventListener("updatecloudselect", () => { this.updateSelectCloudEvent() });
        document.addEventListener("startloaddrive", () => { this.startLoadingDrive() })
        document.addEventListener("finishloaddrive", () => { this.finishLoadingDrive() })
        document.addEventListener("clouderror", (e: CustomEvent) => { this.connectionProblem(e) })

        //create and init all menus objects
        this.library = new Library();
        this.library.libraryView = this.menuView.libraryView;
        this.library.fillLibrary();
        this.load = new Load();
        this.load.loadView = this.menuView.loadView;
        this.drive = new DriveAPI();
        this.load.drive = this.drive;
        this.load.setEventListeners();
        this.fillSelectLocal(this.load.loadView.existingSceneSelect);
        this.save = new Save();
        this.save.saveView = this.menuView.saveView;
        this.save.setEventListeners();
        this.fillSelectLocal(this.save.saveView.existingSceneSelect);
        this.expor = new Export();
        this.expor.exportView = this.menuView.exportView;
        this.expor.uploadTargets();
        this.expor.setEventListeners();
        this.help = new Help();
        this.help.helpView = this.menuView.helpView;
        this.accEdit = new AccelerometerEdit(this.menuView.accEditView);
    }

    // dispatch the action of the menu buttons to the right submenu handler
    menuHandler(newMenuChoices: MenuChoices): any {
        this.help.stopVideo();

        switch (newMenuChoices) {
            case MenuChoices.library:
                this.libraryMenu();
                break;
            case MenuChoices.export:
                this.exportMenu();
                break;
            case MenuChoices.help:
                this.helpMenu();
                break;
            case MenuChoices.edit:
                this.editMenu();
                break;
            case MenuChoices.save:
                this.saveMenu();
                break;
            case MenuChoices.load:
                this.loadMenu();
                break;
            case MenuChoices.null:
                this.cleanMenu();
                this.closeMenu();
                break;
        }
    }

    //manage the library display
    libraryMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:// case MenuChoices.edit:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.libraryButtonMenu.style.zIndex = "1";
                this.library.initScroll();
                break;
            case MenuChoices.library:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.libraryContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.libraryButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.libraryButtonMenu.style.zIndex = "1";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                break;
        }
    }

    //manage the load display
    loadMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:// case MenuChoices.edit:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.loadContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.load;
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.loadButton.style.zIndex = "1";
                break;
            case MenuChoices.load:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.loadContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.loadButton.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.loadButton.style.zIndex = "1";
                this.menuView.loadContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.load;
                break;
        }
    }

    //manage the export display
    exportMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:// case MenuChoices.edit:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.exportContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.export;
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.exportButtonMenu.style.zIndex = "1";
                break;
            case MenuChoices.export:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.exportContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.exportButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.exportButtonMenu.style.zIndex = "1";
                this.menuView.exportContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.export;
                break;
        }
    }

    //manage the save display
    saveMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:// case MenuChoices.edit:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.saveContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.save;
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.saveButton.style.zIndex = "1";
                break;
            case MenuChoices.save:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.saveContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.saveButton.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.saveButton.style.zIndex = "1";
                this.menuView.saveContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.save;
                break;
        }
    }

    //manage the help display
    helpMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null: //case MenuChoices.edit:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.helpContent.style.display = "block";
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.helpButtonMenu.style.zIndex = "1";
                this.currentMenuChoices = MenuChoices.help;
                break;
            case MenuChoices.help:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.helpContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.helpButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.helpButtonMenu.style.zIndex = "1";
                this.menuView.helpContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.help;
                break;
        }
    }

    //manage the accelerometerEdit mode and display
    editMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.editButtonMenu.style.backgroundColor = "#00C50D";
                this.menuView.editButtonMenu.style.boxShadow = "yellow 0px 0px 51px inset";
                this.accEdit.editAction();
                this.currentMenuChoices = MenuChoices.edit;
                break;
            case MenuChoices.edit:
                this.accEdit.editAction();
                this.menuView.editButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.editButtonMenu.style.boxShadow = "none";
                this.menuView.contentsMenu.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                this.cleanMenu();
                this.menuView.editButtonMenu.style.backgroundColor = "#00C50D";
                this.menuView.editButtonMenu.style.boxShadow = "yellow 0px 0px 51px inset";
                this.accEdit.editAction();
                this.menuView.contentsMenu.style.display = "none";
                this.currentMenuChoices = MenuChoices.edit;
                break;
        }
    }

    //Close the menu
    closeMenu() {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    }

    //hide all elements currently displayed in the menu
    cleanMenu() {
        if (this.accEdit.isOn) {
            this.accEdit.editAction()
            this.menuView.editButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
            this.menuView.editButtonMenu.style.boxShadow = "none";
            this.menuView.contentsMenu.style.display = "block";
        }
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        for (var i = 0; i < this.menuView.HTMLButtonsMenu.length; i++) {
            this.menuView.HTMLButtonsMenu[i].style.backgroundColor = this.menuView.menuColorDefault;
            this.menuView.HTMLButtonsMenu[i].style.zIndex = "0";
        }
    }

    //update all element that display the scene name
    updatePatchNameToInput(e: Event) {
        this.menuView.patchNameScene.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.inputNameApp.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputDownload.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputLocalStorage.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputCloudStorage.value = Utilitary.currentScene.sceneName;
        new Message(Utilitary.messageRessource.successRenameScene, "messageTransitionOutFast", 2000, 500)
    }

    //handle fullscreen mode
    fullScreen() {
        if (this.isFullScreen) {
            if (document.cancelFullScreen) {
                document.cancelFullScreen()
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            this.isFullScreen = false;
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen()
            }
            this.isFullScreen = true;
        }
    }

    //handle the enabing/disabling of all slider having a accelerometer
    accelerometer() {
        if (this.isAccelerometer) {
            this.isAccelerometer = false;
            Utilitary.isAccelerometerOn = false;
            this.menuView.accButton.style.opacity = "0.3";
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var acc = AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider;
                var slider = AccelerometerHandler.faustInterfaceControler[i].faustInterfaceView.slider;
                acc.isActive = false;
                slider.classList.remove("not-allowed");
                slider.classList.add("allowed");
                if (!Utilitary.isAccelerometerEditOn) {
                    slider.disabled = false;
                }

            }
        } else if (!this.isAccelerometer) {
            this.isAccelerometer = true;
            Utilitary.isAccelerometerOn = true;
            this.menuView.accButton.style.opacity = "1";
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var acc = AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider;
                var slider = AccelerometerHandler.faustInterfaceControler[i].faustInterfaceView.slider;
                if (acc.isEnabled) {
                    acc.isActive = true;
                    slider.classList.add("not-allowed");
                    slider.classList.remove("allowed");
                    if (!Utilitary.isAccelerometerEditOn) {
                        slider.disabled = true;
                    }
                }
            }
        }
    }

    //removing all modules from the scene
    cleanScene(callBack: () => void) {

        var modules = this.sceneCurrent.getModules()

        while (modules.length != 0) {
            if (modules[0].patchID != "output" && modules[0].patchID != "input") {
                modules[0].deleteModule();
            } else if (modules[0].patchID == "output") {
                modules.shift();
            } else if (modules[0].patchID == "input") {
                modules.shift();
            }
        }
        callBack();
    }

    //close menu when editing a module's Faust code
    //the idea here is to disable the accelerometerEdit mode if enabled
    customeCodeEditEvent() {
        this.menuHandler(MenuChoices.null);
    }

    //refresh the select boxes of localstorage when adding or removing a saved scene
    updateSelectLocalEvent() {
        this.updateSelectLocal(this.menuView.loadView.existingSceneSelect);
        this.updateSelectLocal(this.menuView.saveView.existingSceneSelect)
    }

    //empty a selectBox
    clearSelect(select: HTMLSelectElement) {
        select.innerHTML = "";

    }

    //refresh a select box
    updateSelectLocal(select: HTMLSelectElement) {
        this.clearSelect(select);
        this.fillSelectLocal(select);
    }

    //get value of 'item_key'
    getStorageItem(item_key)  {
      return (localStorage.getItem(item_key)) ? JSON.parse(localStorage.getItem(item_key)): null;
    }

    //fill select box
    fillSelectLocal(select: HTMLSelectElement) {
      var fpg = this.getStorageItem('FaustPlayground');
      if (fpg) {
        for (var i = 0; i < fpg.length; i++) {
            var option = document.createElement("option");
            option.value = fpg[i][0];
            option.textContent = fpg[i][0];
            select.add(option);
        }
      }
    }
    //dispatch the current scene to the menus objects
    setMenuScene(scene: Scene) {
        this.sceneCurrent = scene;
        this.save.sceneCurrent = scene;
        this.load.sceneCurrent = scene;
    }
     //dispatch the drive API to the menus objects
    setDriveApi(drive: DriveAPI) {
        this.drive = drive;
        this.save.drive = drive;
        this.load.drive = drive;
    }
    //show element from cloud Drive when logged on
    authOn() {
        this.load.loadView.cloudSelectFile.style.display = "block";
        this.save.saveView.cloudSelectFile.style.display = "block";
        this.load.loadView.buttonChangeAccount.style.display = "block";
        this.save.saveView.buttonChangeAccount.style.display = "block";
        this.load.loadView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonCloudSuppr.style.display = "block";
        this.save.saveView.inputCloudStorage.style.display = "block";
    }

    //show element from cloud Drive when logged out
    authOff() {
        this.load.loadView.cloudSelectFile.style.display = "none";
        this.save.saveView.cloudSelectFile.style.display = "none";
        this.load.loadView.buttonChangeAccount.style.display = "none";
        this.save.saveView.buttonChangeAccount.style.display = "none";
        this.load.loadView.buttonConnectDrive.style.display = "block";
        this.save.saveView.buttonConnectDrive.style.display = "block";
        this.save.saveView.buttonCloudSuppr.style.display = "none";
        this.save.saveView.inputCloudStorage.style.display = "none";
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.clearSelect(this.load.loadView.cloudSelectFile);

        window.open("https://accounts.google.com/logout", "newwindow", "width=500,height=700")

    }
    //display Drive Connection error
    connectionProblem(event: CustomEvent) {
        new Message(Utilitary.messageRessource.errorConnectionCloud + " : " + event.detail)
    }

    fillSelectCloud(optionEvent: CustomEvent) {
        this.load.loadView.cloudSelectFile.add(<HTMLOptionElement>optionEvent.detail);
        var optionSave = <HTMLOptionElement>optionEvent.detail.cloneNode(true);
        this.save.saveView.cloudSelectFile.add(optionSave);
    }
    updateSelectCloudEvent() {
        this.clearSelect(this.load.loadView.cloudSelectFile);
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.drive.updateConnection();
    }

    startLoadingDrive() {
        if (!this.isMenuDriveLoading) {
            this.isMenuDriveLoading = true;
            this.save.saveView.driveContainer.style.display = "none";
            this.load.loadView.driveContainer.style.display = "none";
            Utilitary.addLoadingLogo("loadCloudContainer");
            Utilitary.addLoadingLogo("cloudSaveContainer");

        }
    }
    
    finishLoadingDrive() {
        if (this.isMenuDriveLoading) {
            this.isMenuDriveLoading = false;
            this.save.saveView.driveContainer.style.display = "block";
            this.load.loadView.driveContainer.style.display = "block";
           Utilitary.removeLoadingLogo("loadCloudContainer");
           Utilitary.removeLoadingLogo("cloudSaveContainer");

        }
    }
}
