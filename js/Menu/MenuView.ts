//MenuView.ts : MenuView Class which contains all the graphical parts of the menu

class MenuView {
    libraryButtonMenu: HTMLElement;
    libraryContent: HTMLElement;
    contentsMenu: HTMLElement;


    init(htmlContainer: HTMLElement): void {

        var buttonsMenu: HTMLElement = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";

        var libraryButtonMenu: HTMLElement = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode("Bibliothèque"));
        this.libraryButtonMenu = libraryButtonMenu;

        buttonsMenu.appendChild(libraryButtonMenu);

        var contentsMenu: HTMLElement = document.createElement("div");
        contentsMenu.id = "contentsMenu";
        contentsMenu.style.display = "none";

        var library: LibraryView = new LibraryView();
        var libraryContent: HTMLElement = library.initLibrary();

        contentsMenu.appendChild(libraryContent)
        htmlContainer.appendChild(buttonsMenu);
        htmlContainer.appendChild(contentsMenu);

        this.libraryContent = libraryContent;
        this.contentsMenu = contentsMenu;

    }
}

