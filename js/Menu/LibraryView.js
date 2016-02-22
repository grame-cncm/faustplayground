//LibraryView.ts : LibraryView Class which contains all the graphical parts of the library
/// <reference path="../Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
var LibraryView = (function () {
    function LibraryView() {
    }
    LibraryView.prototype.initLibraryView = function () {
        var libraryContent = document.createElement("div");
        libraryContent.id = "libraryContent";
        libraryContent.className = "menuContent";
        var instrumentLibraryContent = document.createElement("div");
        instrumentLibraryContent.id = "instrumentLibraryContent";
        instrumentLibraryContent.className = "submenuLibraryContent";
        var instrumentLibraryTitle = document.createElement("span");
        instrumentLibraryTitle.id = "instrumentLibraryTitle";
        instrumentLibraryTitle.className = "libraryTitles";
        instrumentLibraryTitle.appendChild(document.createTextNode("Instruments"));
        var intrumentLibrarySelect = document.createElement("ul");
        intrumentLibrarySelect.id = "instrumentLibrarySelect";
        intrumentLibrarySelect.className = "librarySelects";
        Ps.initialize(intrumentLibrarySelect);
        this.intrumentLibrarySelect = intrumentLibrarySelect;
        instrumentLibraryContent.appendChild(instrumentLibraryTitle);
        instrumentLibraryContent.appendChild(intrumentLibrarySelect);
        var effetLibraryContent = document.createElement("div");
        effetLibraryContent.id = "effetLibraryContent";
        effetLibraryContent.className = "submenuLibraryContent";
        var effetLibraryTitle = document.createElement("span");
        effetLibraryTitle.id = "effetLibraryTitle";
        effetLibraryTitle.className = "libraryTitles";
        effetLibraryTitle.appendChild(document.createTextNode("Effets"));
        var effetLibrarySelect = document.createElement("ul");
        effetLibrarySelect.id = "effetLibrarySelect";
        effetLibrarySelect.className = "librarySelects";
        Ps.initialize(effetLibrarySelect);
        this.effetLibrarySelect = effetLibrarySelect;
        effetLibraryContent.appendChild(effetLibraryTitle);
        effetLibraryContent.appendChild(effetLibrarySelect);
        var exempleLibraryContent = document.createElement("div");
        exempleLibraryContent.id = "exempleLibraryContent";
        exempleLibraryContent.className = "submenuLibraryContent";
        var exempleLibraryTitle = document.createElement("span");
        exempleLibraryTitle.id = "exempleLibraryTitle";
        exempleLibraryTitle.className = "libraryTitles";
        exempleLibraryTitle.appendChild(document.createTextNode("Exemples"));
        var exempleLibrarySelect = document.createElement("ul");
        exempleLibrarySelect.id = "exempleLibrarySelect";
        exempleLibrarySelect.className = "librarySelects";
        Ps.initialize(exempleLibrarySelect);
        this.exempleLibrarySelect = exempleLibrarySelect;
        exempleLibraryContent.appendChild(exempleLibraryTitle);
        exempleLibraryContent.appendChild(exempleLibrarySelect);
        libraryContent.appendChild(instrumentLibraryContent);
        libraryContent.appendChild(effetLibraryContent);
        libraryContent.appendChild(exempleLibraryContent);
        return libraryContent;
    };
    return LibraryView;
})();
