//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
/// <reference path="LoadView.ts"/>
/// <reference path="SaveView.ts"/>
var MenuView = (function () {
    function MenuView() {
        this.HTMLElementsMenu = [];
        this.HTMLButtonsMenu = [];
        this.menuColorDefault = "rgba(227, 64, 80, 0.73)";
        this.menuColorSelected = "rgb(209, 64, 80)";
    }
    MenuView.prototype.init = function (htmlContainer) {
        var menuContainer = document.createElement('div');
        menuContainer.id = "menuContainer";
        this.menuContainer = menuContainer;
        //create menu's buttons and there containers
        var buttonsMenu = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";
        var libraryButtonMenu = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLibrary));
        this.libraryButtonMenu = libraryButtonMenu;
        var exportButtonMenu = document.createElement("div");
        exportButtonMenu.id = "exportButtonMenu";
        exportButtonMenu.className = "buttonsMenu";
        exportButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonExport));
        this.exportButtonMenu = exportButtonMenu;
        var helpButtonMenu = document.createElement("div");
        helpButtonMenu.id = "helpButtonMenu";
        helpButtonMenu.className = "buttonsMenu";
        helpButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonHelp));
        this.helpButtonMenu = helpButtonMenu;
        var editButtonMenu = document.createElement("div");
        editButtonMenu.id = "EditButtonMenu";
        editButtonMenu.className = "buttonsMenu";
        editButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonEdit));
        this.editButtonMenu = editButtonMenu;
        var loadButtonMenu = document.createElement("div");
        loadButtonMenu.id = "loadButtonMenu";
        loadButtonMenu.className = "buttonsMenu";
        loadButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLoad));
        this.loadButton = loadButtonMenu;
        var saveButtonMenu = document.createElement("div");
        saveButtonMenu.id = "saveButtonMenu";
        saveButtonMenu.className = "buttonsMenu";
        saveButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonSave));
        this.saveButton = saveButtonMenu;
        var fullScreenButton = document.createElement("div");
        fullScreenButton.id = "fullScreenButton";
        fullScreenButton.className = "buttonsLittleMenu";
        this.fullScreenButton = fullScreenButton;
        var accButton = document.createElement("div");
        accButton.id = "accButton";
        accButton.className = "buttonsLittleMenu";
        this.accButton = accButton;
        var cleanButton = document.createElement("div");
        cleanButton.id = "cleanButton";
        cleanButton.className = "buttonsLittleMenu";
        this.cleanButton = cleanButton;
        //var accEditButton: HTMLElement = document.createElement("div");
        //accEditButton.id = "accEditButton";
        //accEditButton.className = "buttonsLittleMenu";
        //this.accEditButton = accEditButton;
        if (!Utilitary.isAccelerometerOn) {
            accButton.style.opacity = "0.2";
        }
        buttonsMenu.appendChild(libraryButtonMenu);
        buttonsMenu.appendChild(loadButtonMenu);
        buttonsMenu.appendChild(editButtonMenu);
        buttonsMenu.appendChild(saveButtonMenu);
        buttonsMenu.appendChild(exportButtonMenu);
        buttonsMenu.appendChild(helpButtonMenu);
        buttonsMenu.appendChild(fullScreenButton);
        buttonsMenu.appendChild(accButton);
        buttonsMenu.appendChild(cleanButton);
        this.HTMLButtonsMenu.push(libraryButtonMenu, loadButtonMenu, saveButtonMenu, exportButtonMenu, helpButtonMenu);
        var myScene = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        myScene.textContent = Utilitary.currentScene.sceneName;
        buttonsMenu.appendChild(myScene);
        this.patchNameScene = myScene;
        //create menu's Contents and there containers
        var contentsMenu = document.createElement("div");
        contentsMenu.id = "contentsMenu";
        contentsMenu.style.display = "none";
        var closeButton = document.createElement("div");
        closeButton.id = "closeButton";
        this.closeButton = closeButton;
        var CloseButtonContainer = document.createElement("div");
        CloseButtonContainer.id = "closeButtonContainer";
        CloseButtonContainer.appendChild(closeButton);
        var libraryView = new LibraryView();
        var libraryContent = libraryView.initLibraryView();
        libraryContent.style.display = "none";
        this.libraryView = libraryView;
        var loadView = new LoadView();
        var loadContent = loadView.initLoadView();
        loadContent.style.display = "none";
        this.loadView = loadView;
        var saveView = new SaveView();
        var saveContent = saveView.initSaveView();
        saveContent.style.display = "none";
        this.saveView = saveView;
        var exportView = new ExportView();
        var exportContent = exportView.initExportView();
        exportContent.style.display = "none";
        this.exportView = exportView;
        var helpView = new HelpView();
        var helpContent = helpView.initHelpView();
        helpContent.style.display = "none";
        this.helpView = helpView;
        var accEditView = new AccelerometerEditView();
        var accEditContent = accEditView.initAccelerometerEdit();
        accEditContent.style.display = "none";
        this.accEditView = accEditView;
        contentsMenu.appendChild(CloseButtonContainer);
        contentsMenu.appendChild(libraryContent);
        contentsMenu.appendChild(loadContent);
        contentsMenu.appendChild(saveContent);
        contentsMenu.appendChild(exportContent);
        contentsMenu.appendChild(helpContent);
        menuContainer.appendChild(buttonsMenu);
        menuContainer.appendChild(contentsMenu);
        menuContainer.appendChild(accEditContent);
        htmlContainer.appendChild(menuContainer);
        this.HTMLElementsMenu.push(libraryContent, loadContent, saveContent, exportContent, helpContent);
        this.libraryContent = libraryContent;
        this.loadContent = loadContent;
        this.saveContent = saveContent;
        this.exportContent = exportContent;
        this.helpContent = helpContent;
        this.contentsMenu = contentsMenu;
    };
    return MenuView;
}());
//# sourceMappingURL=MenuView.js.map