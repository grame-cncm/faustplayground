//LibraryView.ts : LibraryView Class which contains all the graphical parts of the library

class LibraryView  {
    initLibrary(): HTMLElement {



        var libraryContent: HTMLElement = document.createElement("div");
        libraryContent.id = "libraryContent";
        libraryContent.className = "menuContent";

        var instrumentLibraryContent: HTMLElement = document.createElement("div");
        instrumentLibraryContent.id = "instrumentLibraryContent";
        instrumentLibraryContent.className = "submenuLibraryContent";

        var instrumentLibraryTitle: HTMLSpanElement = document.createElement("span");
        instrumentLibraryTitle.id = "instrumentLibraryTitle";
        instrumentLibraryTitle.className = "libraryTitles";
        instrumentLibraryTitle.appendChild(document.createTextNode("Instruments"));


        var intrumentLibrarySelect: HTMLSelectElement = document.createElement("select");
        intrumentLibrarySelect.multiple = true;
        intrumentLibrarySelect.id = "intrumentLibrarySelect";
        intrumentLibrarySelect.className = "librarySelects";

        instrumentLibraryContent.appendChild(instrumentLibraryTitle);
        instrumentLibraryContent.appendChild(intrumentLibrarySelect);

        var effetLibraryContent: HTMLElement = document.createElement("div");
        effetLibraryContent.id = "effetLibraryContent";
        effetLibraryContent.className = "submenuLibraryContent";

        var effetLibraryTitle: HTMLSpanElement = document.createElement("span");
        effetLibraryTitle.id = "effetLibraryTitle";
        effetLibraryTitle.className = "libraryTitles";
        effetLibraryTitle.appendChild(document.createTextNode("Effets"));

        var effetLibrarySelect: HTMLSelectElement = document.createElement("select");
        effetLibrarySelect.multiple = true;
        effetLibrarySelect.id = "effetLibrarySelect";
        effetLibrarySelect.className = "librarySelects";

        effetLibraryContent.appendChild(effetLibraryTitle);
        effetLibraryContent.appendChild(effetLibrarySelect);

        var exempleLibraryContent: HTMLElement = document.createElement("div");
        exempleLibraryContent.id = "exempleLibraryContent";
        exempleLibraryContent.className = "submenuLibraryContent";

        var exempleLibraryTitle: HTMLSpanElement = document.createElement("span");
        exempleLibraryTitle.id = "exempleLibraryTitle";
        exempleLibraryTitle.className = "libraryTitles";
        exempleLibraryTitle.appendChild(document.createTextNode("Exemples"));


        var exempleLibrarySelect: HTMLSelectElement = document.createElement("select");
        exempleLibrarySelect.multiple = true;
        exempleLibrarySelect.id = "exempleLibrarySelect";
        exempleLibrarySelect.className = "librarySelects";

        exempleLibraryContent.appendChild(exempleLibraryTitle);
        exempleLibraryContent.appendChild(exempleLibrarySelect);

        libraryContent.appendChild(instrumentLibraryContent)
        libraryContent.appendChild(effetLibraryContent)
        libraryContent.appendChild(exempleLibraryContent)


        return libraryContent;

    }

}
