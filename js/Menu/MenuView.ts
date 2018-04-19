//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
/// <reference path="LoadView.ts"/>
/// <reference path="SaveView.ts"/>

class MenuView {
    menuContainer: HTMLElement;
    libraryButtonMenu: HTMLElement;
    exportButtonMenu: HTMLElement;
    helpButtonMenu: HTMLElement;
    editButtonMenu: HTMLElement;
    fullScreenButton: HTMLElement;
    cleanButton: HTMLElement;
    accButton: HTMLElement;
    loadButton: HTMLElement;
    saveButton: HTMLElement;
    libraryContent: HTMLElement;
    loadContent: HTMLElement;
    exportContent: HTMLElement;
    saveContent: HTMLElement;
    helpContent: HTMLElement;
    contentsMenu: HTMLElement;
    closeButton: HTMLElement;
    HTMLElementsMenu: HTMLElement[] = [];
    HTMLButtonsMenu: HTMLElement[] = []
    patchNameScene: HTMLElement;
    libraryView: LibraryView;
    loadView: LoadView;
    saveView: SaveView;
    exportView: ExportView;
    helpView: HelpView;
    accEditView: AccelerometerEditView;
    menuColorDefault: string = "rgba(227, 64, 80, 0.73)";
    menuColorSelected: string = "rgb(209, 64, 80)";

    init(htmlContainer: HTMLElement): void {
        var menuContainer: HTMLElement = document.createElement('div');
        menuContainer.id = "menuContainer";
        this.menuContainer = menuContainer;

        /////////////////////////create menu's buttons and there containers

        var buttonsMenu: HTMLElement = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";

        var libraryButtonMenu: HTMLElement = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLibrary));
        this.libraryButtonMenu = libraryButtonMenu;

        var exportButtonMenu: HTMLElement = document.createElement("div");
        exportButtonMenu.id = "exportButtonMenu";
        exportButtonMenu.className = "buttonsMenu";
        exportButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonExport));
        this.exportButtonMenu = exportButtonMenu;

        var helpButtonMenu: HTMLElement = document.createElement("div");
        helpButtonMenu.id = "helpButtonMenu";
        helpButtonMenu.className = "buttonsMenu";
        helpButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonHelp));
        this.helpButtonMenu = helpButtonMenu;

        var editButtonMenu: HTMLElement = document.createElement("div");
        editButtonMenu.id = "EditButtonMenu";
        editButtonMenu.className = "buttonsMenu";
        editButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonEdit));
        this.editButtonMenu = editButtonMenu;

        var loadButtonMenu: HTMLElement = document.createElement("div");
        loadButtonMenu.id = "loadButtonMenu";
        loadButtonMenu.className = "buttonsMenu";
        loadButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLoad));
        this.loadButton = loadButtonMenu;

        var saveButtonMenu: HTMLElement = document.createElement("div");
        saveButtonMenu.id = "saveButtonMenu";
        saveButtonMenu.className = "buttonsMenu";
        saveButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonSave));
        this.saveButton = saveButtonMenu;

        var fullScreenButton: HTMLElement = document.createElement("div");
        fullScreenButton.id = "fullScreenButton";
        fullScreenButton.className = "buttonsLittleMenu";
        this.fullScreenButton = fullScreenButton;

        var accButton: HTMLElement = document.createElement("div");
        accButton.id = "accButton";
        accButton.className = "buttonsLittleMenu";
        this.accButton = accButton;

        var cleanButton: HTMLElement = document.createElement("div");
        cleanButton.id = "cleanButton";
        cleanButton.className = "buttonsLittleMenu";
        this.cleanButton = cleanButton;

        if (!Utilitary.isAccelerometerOn) {
            accButton.style.opacity = "0.2";
        }

        buttonsMenu.appendChild(libraryButtonMenu);
        buttonsMenu.appendChild(loadButtonMenu)
        buttonsMenu.appendChild(editButtonMenu);
        buttonsMenu.appendChild(saveButtonMenu);
        buttonsMenu.appendChild(exportButtonMenu);
        buttonsMenu.appendChild(helpButtonMenu);
        buttonsMenu.appendChild(fullScreenButton);
        buttonsMenu.appendChild(accButton);
        buttonsMenu.appendChild(cleanButton);

        this.HTMLButtonsMenu.push(libraryButtonMenu, loadButtonMenu, saveButtonMenu, exportButtonMenu, helpButtonMenu);

        var myScene: HTMLDivElement = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        myScene.textContent = Utilitary.currentScene.sceneName;
        buttonsMenu.appendChild(myScene);
        this.patchNameScene = myScene;

        //////////////////create menu's Contents and there containers

        var contentsMenu: HTMLElement = document.createElement("div");
        contentsMenu.id = "contentsMenu";
        contentsMenu.style.display = "none";

        var closeButton: HTMLElement = document.createElement("div")
        closeButton.id = "closeButton";
        this.closeButton = closeButton;

        var CloseButtonContainer: HTMLElement = document.createElement("div");
        CloseButtonContainer.id = "closeButtonContainer";
        CloseButtonContainer.appendChild(closeButton);

        var libraryView: LibraryView = new LibraryView();
        var libraryContent: HTMLElement = libraryView.initLibraryView();
        libraryContent.style.display = "none";
        this.libraryView = libraryView;

        var loadView: LoadView = new LoadView();
        var loadContent: HTMLElement = loadView.initLoadView();
        loadContent.style.display = "none";
        this.loadView = loadView;

        var saveView: SaveView = new SaveView();
        var saveContent = saveView.initSaveView();
        saveContent.style.display = "none";
        this.saveView = saveView;

        var exportView: ExportView = new ExportView();
        var exportContent: HTMLElement = exportView.initExportView();
        exportContent.style.display = "none";
        this.exportView = exportView;

        var helpView: HelpView = new HelpView();
        var helpContent: HTMLElement = helpView.initHelpView();
        helpContent.style.display = "none";
        this.helpView = helpView;

        var accEditView: AccelerometerEditView = new AccelerometerEditView();
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
        this.HTMLElementsMenu.push(libraryContent, loadContent, saveContent, exportContent, helpContent)

        this.libraryContent = libraryContent;
        this.loadContent = loadContent;
        this.saveContent = saveContent;
        this.exportContent = exportContent;
        this.helpContent = helpContent;
        this.contentsMenu = contentsMenu;
    }
}
