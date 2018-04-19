//LibraryView.ts : LibraryView Class which contains all the graphical parts of the library
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>

class LibraryView  {
    intrumentLibrarySelect: HTMLUListElement
    effetLibrarySelect: HTMLUListElement
    exempleLibrarySelect: HTMLUListElement
    intrumentLibrary: HTMLElement
    effetLibrary: HTMLElement
    exempleLibrary: HTMLElement

    initLibraryView(): HTMLElement {

        var libraryContent: HTMLElement = document.createElement("div");
        libraryContent.id = "libraryContent";
        libraryContent.className = "menuContent";

/////////////////Instruments

        var instrumentLibraryContent: HTMLElement = document.createElement("div");
        instrumentLibraryContent.id = "instrumentLibraryContent";
        instrumentLibraryContent.className = "submenuLibraryContent";
        this.intrumentLibrary = instrumentLibraryContent;

        var instrumentLibraryTitle: HTMLSpanElement = document.createElement("span");
        instrumentLibraryTitle.id = "instrumentLibraryTitle";
        instrumentLibraryTitle.className = "libraryTitles";
        instrumentLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleInstruments));

        var intrumentLibrarySelect: HTMLUListElement = document.createElement("ul");
        intrumentLibrarySelect.id = "instrumentLibrarySelect";
        intrumentLibrarySelect.className = "librarySelects";
        Ps.initialize(intrumentLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name' })
        this.intrumentLibrarySelect = intrumentLibrarySelect;

        instrumentLibraryContent.appendChild(instrumentLibraryTitle);
        instrumentLibraryContent.appendChild(intrumentLibrarySelect);

///////////////Effects

        var effetLibraryContent: HTMLElement = document.createElement("div");
        effetLibraryContent.id = "effetLibraryContent";
        effetLibraryContent.className = "submenuLibraryContent";
        this.effetLibrary = effetLibraryContent;

        var effetLibraryTitle: HTMLSpanElement = document.createElement("span");
        effetLibraryTitle.id = "effetLibraryTitle";
        effetLibraryTitle.className = "libraryTitles";
        effetLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleEffects));

        var effetLibrarySelect: HTMLUListElement = document.createElement("ul");
        effetLibrarySelect.id = "effetLibrarySelect";
        effetLibrarySelect.className = "librarySelects";
        Ps.initialize(effetLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name'})
        this.effetLibrarySelect = effetLibrarySelect;

        effetLibraryContent.appendChild(effetLibraryTitle);
        effetLibraryContent.appendChild(effetLibrarySelect);

/////////////Exemple

        var exempleLibraryContent: HTMLElement = document.createElement("div");
        exempleLibraryContent.id = "exempleLibraryContent";
        exempleLibraryContent.className = "submenuLibraryContent";
        this.exempleLibrary = exempleLibraryContent;

        var exempleLibraryTitle: HTMLSpanElement = document.createElement("span");
        exempleLibraryTitle.id = "exempleLibraryTitle";
        exempleLibraryTitle.className = "libraryTitles";
        exempleLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleExemples));

        var exempleLibrarySelect: HTMLUListElement = document.createElement("ul");
        exempleLibrarySelect.id = "exempleLibrarySelect";
        exempleLibrarySelect.className = "librarySelects";
        Ps.initialize(exempleLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.exempleLibrarySelect = exempleLibrarySelect;

        exempleLibraryContent.appendChild(exempleLibraryTitle);
        exempleLibraryContent.appendChild(exempleLibrarySelect);

        libraryContent.appendChild(instrumentLibraryContent)
        libraryContent.appendChild(effetLibraryContent)
        libraryContent.appendChild(exempleLibraryContent)

        return libraryContent;
    }
}
