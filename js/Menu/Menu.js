//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView
var MenuChoices;
(function (MenuChoices) {
    MenuChoices[MenuChoices["library"] = 0] = "library";
    MenuChoices[MenuChoices["export"] = 1] = "export";
    MenuChoices[MenuChoices["tuto"] = 2] = "tuto";
    MenuChoices[MenuChoices["null"] = 3] = "null";
})(MenuChoices || (MenuChoices = {}));
var Menu = (function () {
    function Menu(htmlContainer) {
        var _this = this;
        this.currentMenuChoices = MenuChoices.null;
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = function () { _this.menuHandler(_this.menuChoices = MenuChoices.library); };
    }
    Menu.prototype.menuHandler = function (menuChoises) {
        switch (this.menuChoices) {
            case MenuChoices.library:
                this.libraryMenu();
                break;
            case MenuChoices.export:
                break;
        }
    };
    Menu.prototype.libraryMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                break;
            case MenuChoices.library:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.libraryContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                break;
        }
    };
    return Menu;
})();
//# sourceMappingURL=Menu.js.map