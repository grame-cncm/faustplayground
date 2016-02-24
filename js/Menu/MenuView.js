//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
var MenuView = (function () {
    function MenuView() {
        this.HTMLElementsMenu = [];
        this.HTMLButtonsMenu = [];
        this.menuColorDefault = "rgba(227, 64, 80, 0.73)";
        this.menuColorSelected = "rgb(234, 37, 58)";
    }
    MenuView.prototype.init = function (htmlContainer) {
        var menuContainer = document.createElement('div');
        menuContainer.id = "menuContainer";
        //create menu's buttons and there containers
        var buttonsMenu = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";
        var libraryButtonMenu = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode("Biblio"));
        this.libraryButtonMenu = libraryButtonMenu;
        var exportButtonMenu = document.createElement("div");
        exportButtonMenu.id = "exportButtonMenu";
        exportButtonMenu.className = "buttonsMenu";
        exportButtonMenu.appendChild(document.createTextNode("Export"));
        this.exportButtonMenu = exportButtonMenu;
        var helpButtonMenu = document.createElement("div");
        helpButtonMenu.id = "helpButtonMenu";
        helpButtonMenu.className = "buttonsMenu";
        helpButtonMenu.appendChild(document.createTextNode("Aide"));
        this.helpButtonMenu = helpButtonMenu;
        buttonsMenu.appendChild(libraryButtonMenu);
        buttonsMenu.appendChild(exportButtonMenu);
        buttonsMenu.appendChild(helpButtonMenu);
        this.HTMLButtonsMenu.push(libraryButtonMenu, exportButtonMenu, helpButtonMenu);
        var myScene = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        myScene.textContent = "Patch";
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
        var exportView = new ExportView();
        var exportContent = exportView.initExportView();
        exportContent.style.display = "none";
        this.exportView = exportView;
        var helpView = new HelpView();
        var helpContent = helpView.initHelpView();
        helpContent.style.display = "none";
        this.helpView = helpView;
        contentsMenu.appendChild(CloseButtonContainer);
        contentsMenu.appendChild(libraryContent);
        contentsMenu.appendChild(exportContent);
        contentsMenu.appendChild(helpContent);
        menuContainer.appendChild(buttonsMenu);
        menuContainer.appendChild(contentsMenu);
        htmlContainer.appendChild(menuContainer);
        this.HTMLElementsMenu.push(libraryContent, exportContent, helpContent);
        this.libraryContent = libraryContent;
        this.exportContent = exportContent;
        this.helpContent = helpContent;
        this.contentsMenu = contentsMenu;
    };
    return MenuView;
})();
//# sourceMappingURL=MenuView.js.map