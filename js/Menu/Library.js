/*				LIBRARY.JS
    Creates Graphical Library of Faust Modules
    Connects with faust.grame.fr to receive the json description of available modules

    Interface structure
    ===================
    DIV --> PARENT
        DIV --> libraryDiv
            DIV --> libraryTitle
            DIV --> imageNode
            DIV --> fFooter
            UL --> section 1
                LI --> subsection 1
                LI --> subsection 2
                etc
            UL --> section 2
                LI --> subsection 1
                LI --> subsection 2
                etc
    ===================

    The library Div gets opened when passed over with the mouse

    DEPENDENCIES :
        - faust.grame.fr/www/pedagogie/index.json
*/
/// <reference path="../App.ts"/>
/// <reference path="../Main.ts"/>
var Library = (function () {
    function Library() {
    }
    Library.prototype.fillLibrary = function () {
        var _this = this;
        var url = "faust-modules/index.json";
        App.getXHR(url, function (json) { _this.fillLibraryCallBack(json); }, function (errorMessage) { ErrorFaust.errorCallBack(errorMessage); });
    };
    Library.prototype.fillLibraryCallBack = function (json) {
        var jsonObject = JSON.parse(json);
        jsonObject.effet = "effetLibrarySelect";
        jsonObject.effetSupprStructure = "faust-modules/effects/";
        jsonObject.instrument = "instrumentLibrarySelect";
        jsonObject.instrumentSupprStructure = "faust-modules/generators/";
        jsonObject.exemple = "exempleLibrarySelect";
        jsonObject.exempleSupprStructure = "faust-modules/combined/";
        this.fillSubMenu(jsonObject.instruments, jsonObject.instrument, jsonObject.instrumentSupprStructure);
        this.fillSubMenu(jsonObject.effets, jsonObject.effet, jsonObject.effetSupprStructure);
        this.fillSubMenu(jsonObject.exemples, jsonObject.exemple, jsonObject.exempleSupprStructure);
    };
    Library.prototype.fillSubMenu = function (options, subMenuId, stringStructureRemoved) {
        var subMenu = document.getElementById(subMenuId);
        //subMenu.ondrag = App.preventdefault;
        for (var i = 0; i < options.length; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.onclick = App.preventdefault;
            a.ondblclick = function () { alert(); };
            //option.ondrag = this.selectDrag;
            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li);
        }
    };
    Library.prototype.dbleTouchMenu = function (touchEvent) {
        var anchor = touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
        }
        else if (anchor.href == this.previousTouchUrl) {
            this.isLibraryTouch = false;
        }
        else {
            this.isLibraryTouch = false;
        }
    };
    Library.prototype.initScroll = function () {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    };
    Library.prototype.cleanNameElement = function (elementComplete, stringStructureRemoved) {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    };
    return Library;
})();
//# sourceMappingURL=Library.js.map