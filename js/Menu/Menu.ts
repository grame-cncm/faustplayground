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

enum MenuChoices { library, export, help, kids, null }

class Menu {
    menuChoices: MenuChoices;
    currentMenuChoices: MenuChoices = MenuChoices.null;
    menuView: MenuView;
    library: Library;
    expor: Export;
    help: Help;
    mouseOverLowerMenu: (event: MouseEvent) => void;
    isMenuLow: boolean = false;
    isFullScreen: boolean = false;

    constructor(htmlContainer: HTMLElement) {
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.library) };
        this.menuView.exportButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.export) };
        this.menuView.helpButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.help) };
        this.menuView.closeButton.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.null) };
        this.menuView.fullScreenButton.addEventListener("click", () => { this.fullScreen() });
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

    }

    menuHandler(menuChoises: MenuChoices): any {
        this.help.stopVideo();

        switch (this.menuChoices) {
            case MenuChoices.library:
                this.libraryMenu();
                break;
            case MenuChoices.export:
                this.exportMenu();
                break;
            case MenuChoices.help:
                this.helpMenu();
                break;
            case MenuChoices.null:
                this.closeMenu();
                this.cleanMenu();
                break;
        }
    }

    libraryMenu() {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
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
            case MenuChoices.null:
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
            case MenuChoices.null:
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
    closeMenu() {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.raiseLibraryMenu();
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    }
    cleanMenu() {
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
}