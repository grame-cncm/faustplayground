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
var MenuChoices;
(function (MenuChoices) {
    MenuChoices[MenuChoices["library"] = 0] = "library";
    MenuChoices[MenuChoices["export"] = 1] = "export";
    MenuChoices[MenuChoices["help"] = 2] = "help";
    MenuChoices[MenuChoices["kids"] = 3] = "kids";
    MenuChoices[MenuChoices["edit"] = 4] = "edit";
    MenuChoices[MenuChoices["save"] = 5] = "save";
    MenuChoices[MenuChoices["load"] = 6] = "load";
    MenuChoices[MenuChoices["null"] = 7] = "null";
})(MenuChoices || (MenuChoices = {}));
var Menu = (function () {
    function Menu(htmlContainer) {
        var _this = this;
        this.currentMenuChoices = MenuChoices.null;
        this.isMenuLow = false;
        this.isFullScreen = false;
        this.isAccelerometer = App.isAccelerometerOn;
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.library); };
        this.menuView.exportButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.export); };
        this.menuView.helpButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.help); };
        this.menuView.editButtonMenu.addEventListener("click", function () { _this.menuHandler(_this.menuChoices = MenuChoices.edit); });
        this.menuView.closeButton.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.null); };
        this.menuView.saveButton.addEventListener("click", function () { _this.menuHandler(_this.menuChoices = MenuChoices.save); });
        this.menuView.loadButton.addEventListener("click", function () { _this.menuHandler(_this.menuChoices = MenuChoices.load); });
        this.menuView.fullScreenButton.addEventListener("click", function () { _this.fullScreen(); });
        this.menuView.accButton.addEventListener("click", function () { _this.accelerometer(); });
        this.menuView.cleanButton.addEventListener("click", function () { _this.cleanScene(); });
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
        //this.menuView.exportView.inputNameApp.onchange = (e) => { this.updatePatchNameToInput(e) }
        document.addEventListener("updatename", function (e) { _this.updatePatchNameToInput(e); });
        this.mouseOverLowerMenu = function (event) { _this.raiseLibraryMenuEvent(event); };
        this.accEdit = new AccelerometerEdit(this.menuView.accEditView);
        document.addEventListener("codeeditevent", function () { _this.customeCodeEditEvent(); });
        document.addEventListener("updatelist", function () { _this.updateSelectLocalEvent(); });
        document.addEventListener("authon", function () { _this.authOn(); });
        document.addEventListener("authoff", function () { _this.authOff(); });
        document.addEventListener("fillselect", function (optionEvent) { _this.fillSelectCloud(optionEvent); });
        document.addEventListener("updatecloudselect", function () { _this.updateSelectCloudEvent(); });
        //this.accEdit.accelerometerEditView = this.menuView.accEditView
    }
    Menu.prototype.setMenuScene = function (scene) {
        this.sceneCurrent = scene;
        this.save.sceneCurrent = scene;
        this.load.sceneCurrent = scene;
    };
    Menu.prototype.menuHandler = function (menuChoices) {
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
    };
    Menu.prototype.libraryMenu = function () {
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
    };
    Menu.prototype.loadMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
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
    };
    Menu.prototype.exportMenu = function () {
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
    };
    Menu.prototype.saveMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
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
    };
    Menu.prototype.helpMenu = function () {
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
    };
    Menu.prototype.editMenu = function () {
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
    };
    Menu.prototype.closeMenu = function () {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.raiseLibraryMenu();
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    };
    Menu.prototype.cleanMenu = function () {
        if (this.accEdit.isOn) {
            this.accEdit.editAction();
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
    };
    Menu.prototype.updatePatchNameToInput = function (e) {
        this.menuView.patchNameScene.textContent = Scene.sceneName;
        this.menuView.exportView.dynamicName.textContent = Scene.sceneName;
        this.menuView.exportView.inputNameApp.value = Scene.sceneName;
        this.menuView.saveView.dynamicName.textContent = Scene.sceneName;
        this.menuView.saveView.inputDownload.value = Scene.sceneName;
        this.menuView.saveView.inputLocalStorage.value = Scene.sceneName;
        this.menuView.saveView.inputCloudStorage.value = Scene.sceneName;
    };
    Menu.prototype.lowerLibraryMenu = function () {
        this.library.libraryView.effetLibrary.style.height = "150px";
        this.library.libraryView.exempleLibrary.style.height = "150px";
        this.library.libraryView.intrumentLibrary.style.height = "150px";
    };
    Menu.prototype.raiseLibraryMenuEvent = function (event) {
        //event.preventDefault();
        this.raiseLibraryMenu();
    };
    Menu.prototype.raiseLibraryMenu = function () {
        console.log("mouse over menu");
        if (this.isMenuLow) {
            this.library.libraryView.effetLibrary.style.height = "300px";
            this.library.libraryView.exempleLibrary.style.height = "300px";
            this.library.libraryView.intrumentLibrary.style.height = "300px";
            this.menuView.menuContainer.removeEventListener("mouseover", this.mouseOverLowerMenu);
            this.isMenuLow = false;
        }
    };
    Menu.prototype.fullScreen = function () {
        var body = document.getElementsByTagName("body")[0];
        if (this.isFullScreen) {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            this.isFullScreen = false;
        }
        else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            this.isFullScreen = true;
        }
    };
    Menu.prototype.accelerometer = function () {
        var checkboxs = document.getElementsByClassName("accCheckbox");
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
        }
        else if (!this.isAccelerometer) {
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
    };
    Menu.prototype.customeCodeEditEvent = function () {
        this.menuHandler(MenuChoices.null);
    };
    Menu.prototype.updateSelectLocalEvent = function () {
        this.updateSelectLocal(this.menuView.loadView.existingSceneSelect);
        this.updateSelectLocal(this.menuView.saveView.existingSceneSelect);
    };
    Menu.prototype.clearSelect = function (select) {
        select.innerHTML = "";
    };
    Menu.prototype.updateSelectLocal = function (select) {
        this.clearSelect(select);
        this.fillSelectLocal(select);
    };
    Menu.prototype.fillSelectLocal = function (select) {
        var _this = this;
        if (typeof sessionStorage != 'undefined') {
            for (var i = 0; i < localStorage.length; i++) {
                var option = document.createElement("option");
                option.value = localStorage.key(i);
                option.textContent = localStorage.key(i);
                var close = document.createElement("div");
                close.className = "supprOption";
                close.addEventListener("click", function (e) { _this.supprOption(e); });
                //option.appendChild(close);
                select.add(option);
            }
        }
    };
    Menu.prototype.supprOption = function (e) {
    };
    Menu.prototype.setDriveApi = function (drive) {
        this.drive = drive;
        this.save.drive = drive;
        this.load.drive = drive;
    };
    Menu.prototype.authOn = function () {
        this.load.loadView.cloudSelectFile.style.display = "block";
        this.save.saveView.cloudSelectFile.style.display = "block";
        this.load.loadView.buttonChangeAccount.style.display = "block";
        this.save.saveView.buttonChangeAccount.style.display = "block";
        this.load.loadView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonConnectDrive.style.display = "none";
    };
    Menu.prototype.authOff = function () {
        this.load.loadView.cloudSelectFile.style.display = "none";
        this.save.saveView.cloudSelectFile.style.display = "none";
        this.load.loadView.buttonChangeAccount.style.display = "none";
        this.save.saveView.buttonChangeAccount.style.display = "none";
        this.load.loadView.buttonConnectDrive.style.display = "block";
        this.save.saveView.buttonConnectDrive.style.display = "block";
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.clearSelect(this.load.loadView.cloudSelectFile);
        window.open("https://accounts.google.com/logout", "newwindow", "width=500,height=700");
    };
    Menu.prototype.fillSelectCloud = function (optionEvent) {
        this.load.loadView.cloudSelectFile.add(optionEvent.detail);
        var optionSave = optionEvent.detail.cloneNode(true);
        this.save.saveView.cloudSelectFile.add(optionSave);
    };
    Menu.prototype.updateSelectCloudEvent = function () {
        this.clearSelect(this.load.loadView.cloudSelectFile);
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.drive.checkAuth();
    };
    Menu.prototype.cleanScene = function () {
        this.sceneCurrent.muteScene();
        if (confirm("Voulez vous vraiment vider la scène ?")) {
            var modules = this.sceneCurrent.getModules();
            while (modules.length != 0) {
                if (modules[0].patchID != "output" && modules[0].patchID != "input") {
                    modules[0].deleteModule();
                }
            }
        }
        this.sceneCurrent.unmuteScene();
    };
    return Menu;
})();
//# sourceMappingURL=Menu.js.map