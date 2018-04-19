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

//--- Init graphical elements of library

/// <reference path="../Utilitary.ts"/>
/// <reference path="LibraryView.ts"/>

interface IImageNode extends HTMLImageElement {
    state: string;
    section: string;
    folder: HTMLUListElement;
}
interface jsonObjectLibrary {
    instrument: string;
    effet: string;
    exemple: string;
    instrumentSupprStructure: string;
    effetSupprStructure: string;
    exempleSupprStructure: string;
    instruments: string[];
    effets: string[];
    exemples: string[];
}

class Library{
    libraryView: LibraryView;
    isLibraryTouch: boolean;
    previousTouchUrl: string;
    isSmaller: boolean = false;
    isDblTouch: boolean = false;

    //get json with library infos
    fillLibrary() {
        var url: string = "faust-modules/index.json"
        Utilitary.getXHR(url, (json: string) => { this.fillLibraryCallBack(json) }, (errorMessage: string) => { Utilitary.errorCallBack(errorMessage) });
    }

    //dispatch library info to each submenu
    fillLibraryCallBack(json: string) {
        var jsonObject: jsonObjectLibrary = JSON.parse(json);
        jsonObject.effet = "effetLibrarySelect";
        jsonObject.effetSupprStructure = "faust-modules/effects/";
        jsonObject.instrument = "instrumentLibrarySelect";
        jsonObject.instrumentSupprStructure = "faust-modules/generators/";
        jsonObject.exemple = "exempleLibrarySelect";
        jsonObject.exempleSupprStructure = "faust-modules/combined/";
        this.fillSubMenu(jsonObject.instruments, jsonObject.instrument, jsonObject.instrumentSupprStructure);
        this.fillSubMenu(jsonObject.effets, jsonObject.effet, jsonObject.effetSupprStructure);
        this.fillSubMenu(jsonObject.exemples, jsonObject.exemple, jsonObject.exempleSupprStructure);
    }

    //fill submenu and attach events
    fillSubMenu(options: string[], subMenuId: string, stringStructureRemoved: string) {
        var subMenu: HTMLUListElement = <HTMLUListElement>document.getElementById(subMenuId);

        for (var i = 0; i < options.length; i++) {

            var li: HTMLLIElement = document.createElement("li");
            var a: HTMLAnchorElement = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.title = Utilitary.messageRessource.hoverLibraryElement;
            a.addEventListener("click", (e) => { e.preventDefault() });

            var dblckickHandler = this.dispatchEventLibrary.bind(this,a.href)
            a.ondblclick =  dblckickHandler;
            a.ontouchstart = (e) => { this.dbleTouchMenu(e) }

            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li)
        }
    }

    //custom doube touch event handler
    dbleTouchMenu(touchEvent: TouchEvent) {
        var anchor: HTMLAnchorElement = <HTMLAnchorElement>touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
            this.previousTouchUrl = anchor.href;
            window.setTimeout(()=>{ this.isLibraryTouch = false;this.previousTouchUrl = "" },300)
        } else if (anchor.href == this.previousTouchUrl) {
            Utilitary.showFullPageLoading();
            this.dispatchEventLibrary(anchor.href);
            this.isLibraryTouch = false;
        } else {
            this.isLibraryTouch = false;
        }
    }
    //dispatch custom double touch
    dispatchEventLibrary(url: string) {
        var event: CustomEvent = new CustomEvent("dbltouchlib", { 'detail': url })
        document.dispatchEvent(event);
    }
    // init scroll to show scroll from perfectScroll.js
    initScroll() {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    }

    //remove .dsp extention and uri from element to get title
    cleanNameElement(elementComplete: string, stringStructureRemoved: string): string {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    }
}
