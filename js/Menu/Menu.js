//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView
/// <reference path="Library.ts"/>
/// <reference path="LibraryView.ts"/>
/// <reference path="Export.ts"/>
/// <reference path="ExportView.ts"/>
/// <reference path="Help.ts"/>
/// <reference path="HelpView.ts"/>
var MenuChoices;
(function (MenuChoices) {
    MenuChoices[MenuChoices["library"] = 0] = "library";
    MenuChoices[MenuChoices["export"] = 1] = "export";
    MenuChoices[MenuChoices["help"] = 2] = "help";
    MenuChoices[MenuChoices["kids"] = 3] = "kids";
    MenuChoices[MenuChoices["null"] = 4] = "null";
})(MenuChoices || (MenuChoices = {}));
var Menu = (function () {
    function Menu(htmlContainer) {
        var _this = this;
        this.currentMenuChoices = MenuChoices.null;
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.library); };
        this.menuView.exportButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.export); };
        this.menuView.helpButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.help); };
        this.menuView.closeButton.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.null); };
        this.library = new Library();
        this.library.libraryView = this.menuView.libraryView;
        this.library.fillLibrary();
        this.expor = new Export();
        this.expor.exportView = this.menuView.exportView;
        this.expor.uploadTargets();
        this.expor.setEventListeners();
        this.help = new Help();
        this.help.helpView = this.menuView.helpView;
    }
    Menu.prototype.menuHandler = function (menuChoises) {
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
                break;
        }
    };
    Menu.prototype.libraryMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                this.library.initScroll();
                break;
            case MenuChoices.library:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.libraryContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
                    this.menuView.HTMLElementsMenu[i].style.display = "none";
                }
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                break;
        }
    };
    Menu.prototype.exportMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.exportContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.export;
                break;
            case MenuChoices.export:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.exportContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
                    this.menuView.HTMLElementsMenu[i].style.display = "none";
                }
                this.menuView.exportContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.export;
                break;
        }
    };
    Menu.prototype.helpMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.helpContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.help;
                break;
            case MenuChoices.help:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.helpContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
                    this.menuView.HTMLElementsMenu[i].style.display = "none";
                }
                this.menuView.helpContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.help;
                break;
        }
    };
    Menu.prototype.closeMenu = function () {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    };
    return Menu;
})();
//# sourceMappingURL=Menu.js.map