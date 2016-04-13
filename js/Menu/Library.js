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

   DEPENDENCIES :
       - faust.grame.fr/www/pedagogie/index.json
*/
/// <reference path="../Utilitary.ts"/>
/// <reference path="LibraryView.ts"/>
var Library = (function () {
    function Library() {
        this.isSmaller = false;
        this.isDblTouch = false;
    }
    //get json with library infos
    Library.prototype.fillLibrary = function () {
        var _this = this;
        var url = "faust-modules/index.json";
        Utilitary.getXHR(url, function (json) { _this.fillLibraryCallBack(json); }, function (errorMessage) { Utilitary.errorCallBack(errorMessage); });
    };
    //dispatch library info to each submenu
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
    //fill submenu and attach events
    Library.prototype.fillSubMenu = function (options, subMenuId, stringStructureRemoved) {
        var _this = this;
        var subMenu = document.getElementById(subMenuId);
        for (var i = 0; i < options.length; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.title = Utilitary.messageRessource.hoverLibraryElement;
            a.addEventListener("click", function (e) { e.preventDefault(); });
            var dblckickHandler = this.dispatchEventLibrary.bind(this, a.href);
            a.ondblclick = dblckickHandler;
            a.ontouchstart = function (e) { _this.dbleTouchMenu(e); };
            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li);
        }
    };
    //custom doube touch event handler
    Library.prototype.dbleTouchMenu = function (touchEvent) {
        var _this = this;
        var anchor = touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
            this.previousTouchUrl = anchor.href;
            window.setTimeout(function () { _this.isLibraryTouch = false; _this.previousTouchUrl = ""; }, 300);
        }
        else if (anchor.href == this.previousTouchUrl) {
            Utilitary.showFullPageLoading();
            this.dispatchEventLibrary(anchor.href);
            this.isLibraryTouch = false;
        }
        else {
            this.isLibraryTouch = false;
        }
    };
    //dispatch custom double touch
    Library.prototype.dispatchEventLibrary = function (url) {
        var event = new CustomEvent("dbltouchlib", { 'detail': url });
        document.dispatchEvent(event);
    };
    // init scroll to show scroll from perfectScroll.js 
    Library.prototype.initScroll = function () {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    };
    //remove .dsp extention and uri from element to get title
    Library.prototype.cleanNameElement = function (elementComplete, stringStructureRemoved) {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    };
    return Library;
}());
//# sourceMappingURL=Library.js.map