//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
var MenuView = (function () {
    function MenuView() {
    }
    MenuView.prototype.init = function (htmlContainer) {
        var buttonsMenu = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";
        var libraryButtonMenu = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode("Bibliothèque"));
        this.libraryButtonMenu = libraryButtonMenu;
        buttonsMenu.appendChild(libraryButtonMenu);
        var contentsMenu = document.createElement("div");
        contentsMenu.id = "contentsMenu";
        contentsMenu.style.display = "none";
        var library = new LibraryView();
        var libraryContent = library.initLibrary();
        contentsMenu.appendChild(libraryContent);
        htmlContainer.appendChild(buttonsMenu);
        htmlContainer.appendChild(contentsMenu);
        this.libraryContent = libraryContent;
        this.contentsMenu = contentsMenu;
    };
    return MenuView;
})();
//# sourceMappingURL=MenuView.js.map