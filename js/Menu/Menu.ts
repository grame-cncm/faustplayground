//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView

	/// <reference path="Library.ts"/>
	/// <reference path="LibraryView.ts"/>
	/// <reference path="Export.ts"/>
	/// <reference path="ExportView.ts"/>
	/// <reference path="Help.ts"/>
/// <reference path="HelpView.ts"/>
interface Document {
    cancelFullScreen: () => any;
    mozCancelFullScreen: () => any;
}

interface HTMLElement {
    mozRequestFullScreen: () => any;
}

enum MenuChoices { library, export, help, kids,edit, null }

class Menu {
    sceneCurrent: Scene;
    menuChoices: MenuChoices;
    currentMenuChoices: MenuChoices = MenuChoices.null;
    menuView: MenuView;
    library: Library;
    expor: Export;
    accEdit: AccelerometerEdit;
    help: Help;
    mouseOverLowerMenu: (event: MouseEvent) => void;
    isMenuLow: boolean = false;
    isFullScreen: boolean = false;
    isAccelerometer: boolean = App.isAccelerometerOn;

    constructor(htmlContainer: HTMLElement) {
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.library) };
        this.menuView.exportButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.export) };
        this.menuView.helpButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.help) };
        this.menuView.editButtonMenu.addEventListener("click", () => { this.menuHandler(this.menuChoices = MenuChoices.edit) });
        this.menuView.closeButton.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.null) };
        this.menuView.fullScreenButton.addEventListener("click", () => { this.fullScreen() });
        this.menuView.accButton.addEventListener("click", () => { this.accelerometer() });
        this.library = new Library();
        this.library.libraryView = this.menuView.libraryView;
        this.library.fillLibrary();
        this.expor = new Export();
        this.expor.exportView = this.menuView.exportView;
        this.expor.uploadTargets();
        this.expor.setEventListeners();
        this.help = new Help();
        this.help.helpView = this.menuView.helpView;
        this.menuView.exportView.inputNameApp.onchange = (e) => { this.updatePatchNameToInput(e) }
        this.mouseOverLowerMenu = (event: MouseEvent) => { this.raiseLibraryMenuEvent(event) }
        this.accEdit = new AccelerometerEdit(this.menuView.accEditView);
        document.addEventListener("codeeditevent", ()=> { this.customeCodeEditEvent() });
        //this.accEdit.accelerometerEditView = this.menuView.accEditView

    }

    menuHandler(menuChoices: MenuChoices): any {
        this.help.stopVideo();

        switch (menuChoices) {
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
            case MenuChoices.null:
                this.cleanMenu();
                this.closeMenu();
                break;
        }
    }

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
                this.raiseLibraryMenu();

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
    closeMenu() {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.raiseLibraryMenu();
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    }
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
            this.raiseLibraryMenu();
        }
    }
    updatePatchNameToInput(e: Event) {
        this.menuView.patchNameScene.textContent = Scene.sceneName;
    }

    lowerLibraryMenu() {
        this.library.libraryView.effetLibrary.style.height = "150px";
        this.library.libraryView.exempleLibrary.style.height = "150px";
        this.library.libraryView.intrumentLibrary.style.height = "150px";
    }

    raiseLibraryMenuEvent(event: MouseEvent) {
        //event.preventDefault();
        this.raiseLibraryMenu();
    }
    raiseLibraryMenu() {
        console.log("mouse over menu")
        if (this.isMenuLow) {
            this.library.libraryView.effetLibrary.style.height = "300px";
            this.library.libraryView.exempleLibrary.style.height = "300px";
            this.library.libraryView.intrumentLibrary.style.height = "300px";
            this.menuView.menuContainer.removeEventListener("mouseover", this.mouseOverLowerMenu)
            this.isMenuLow = false;
        }
    }
    fullScreen() {
        var body = <HTMLBodyElement>document.getElementsByTagName("body")[0];
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
    accelerometer() {
        var checkboxs = document.getElementsByClassName("accCheckbox")
        if (this.isAccelerometer) {
            this.isAccelerometer = false;
            App.isAccelerometerOn = false;
            this.menuView.accButton.style.opacity = "0.3";            
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                AccelerometerHandler.accelerometerSliders[i].isActive = false;
                //AccelerometerHandler.accelerometerSliders[i].mySlider.style.opacity = "1";
                AccelerometerHandler.accelerometerSliders[i].mySlider.classList.remove("not-allowed");
                AccelerometerHandler.accelerometerSliders[i].mySlider.classList.add("allowed");
                if (!App.isAccelerometerEditOn) {
                    AccelerometerHandler.accelerometerSliders[i].mySlider.disabled = false;
                }
            }
        } else if (!this.isAccelerometer) {
            this.menuView.accButton.style.opacity = "1";
            this.isAccelerometer = true;
            App.isAccelerometerOn = true;
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                AccelerometerHandler.accelerometerSliders[i].isActive = true;
                //AccelerometerHandler.accelerometerSliders[i].mySlider.style.opacity = "0.5";
                AccelerometerHandler.accelerometerSliders[i].mySlider.classList.add("not-allowed");
                AccelerometerHandler.accelerometerSliders[i].mySlider.classList.remove("allowed");
                if (!App.isAccelerometerEditOn) {
                    AccelerometerHandler.accelerometerSliders[i].mySlider.disabled = true;
                }
            }                
        }
    }
    customeCodeEditEvent() {

        this.menuHandler(MenuChoices.null);
    }
}