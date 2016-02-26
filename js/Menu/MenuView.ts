//MenuView.ts : MenuView Class which contains all the graphical parts of the menu

class MenuView {
    menuContainer: HTMLElement;
    libraryButtonMenu: HTMLElement;
    exportButtonMenu: HTMLElement;
    helpButtonMenu: HTMLElement;
    libraryContent: HTMLElement;
    exportContent: HTMLElement;
    helpContent: HTMLElement;
    contentsMenu: HTMLElement;
    closeButton: HTMLElement;
    HTMLElementsMenu: HTMLElement[] = [];
    HTMLButtonsMenu: HTMLElement[] = []
    patchNameScene: HTMLElement;
    libraryView: LibraryView;
    exportView: ExportView;
    helpView: HelpView;
    menuColorDefault: string = "rgba(227, 64, 80, 0.73)";
    menuColorSelected: string = "rgb(209, 64, 80)";


    init(htmlContainer: HTMLElement): void {
        var menuContainer: HTMLElement = document.createElement('div');
        menuContainer.id = "menuContainer";
        this.menuContainer = menuContainer;

        //create menu's buttons and there containers
        var buttonsMenu: HTMLElement = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";

        var libraryButtonMenu: HTMLElement = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode("Biblio"));
        this.libraryButtonMenu = libraryButtonMenu;

        var exportButtonMenu: HTMLElement = document.createElement("div");
        exportButtonMenu.id = "exportButtonMenu";
        exportButtonMenu.className = "buttonsMenu";
        exportButtonMenu.appendChild(document.createTextNode("Export"));
        this.exportButtonMenu = exportButtonMenu;

        var helpButtonMenu: HTMLElement = document.createElement("div");
        helpButtonMenu.id = "helpButtonMenu";
        helpButtonMenu.className = "buttonsMenu";
        helpButtonMenu.appendChild(document.createTextNode("Aide"));
        this.helpButtonMenu = helpButtonMenu;

        buttonsMenu.appendChild(libraryButtonMenu);
        buttonsMenu.appendChild(exportButtonMenu);
        buttonsMenu.appendChild(helpButtonMenu);

        this.HTMLButtonsMenu.push(libraryButtonMenu, exportButtonMenu, helpButtonMenu);

        var myScene: HTMLDivElement = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        myScene.textContent = "Patch";
        buttonsMenu.appendChild(myScene);
        this.patchNameScene = myScene;

        //create menu's Contents and there containers

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

        var exportView: ExportView = new ExportView();
        var exportContent: HTMLElement = exportView.initExportView();
        exportContent.style.display = "none";
        this.exportView = exportView;

        var helpView: HelpView = new HelpView();
        var helpContent: HTMLElement = helpView.initHelpView();
        helpContent.style.display = "none";
        this.helpView = helpView;

        contentsMenu.appendChild(CloseButtonContainer);
        contentsMenu.appendChild(libraryContent);
        contentsMenu.appendChild(exportContent);
        contentsMenu.appendChild(helpContent);

        menuContainer.appendChild(buttonsMenu);
        menuContainer.appendChild(contentsMenu);

        htmlContainer.appendChild(menuContainer);
        this.HTMLElementsMenu.push(libraryContent, exportContent, helpContent)

        this.libraryContent = libraryContent;
        this.exportContent = exportContent;
        this.helpContent = helpContent;
        this.contentsMenu = contentsMenu;

    }
}

