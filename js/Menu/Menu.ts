//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView


enum MenuChoices {library,export,tuto,null}
class Menu {
    menuChoices: MenuChoices;
    currentMenuChoices: MenuChoices = MenuChoices.null;
    menuView: MenuView;
    constructor(htmlContainer: HTMLElement) {
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        this.menuView.libraryButtonMenu.onclick = () => { this.menuHandler(this.menuChoices = MenuChoices.library) };
    }

    menuHandler(menuChoises: MenuChoices):any {
        switch (this.menuChoices) {
            case MenuChoices.library:
                this.libraryMenu();
                break;
            case MenuChoices.export:
                break;
        }
    }

    libraryMenu() {
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
        
    }

}