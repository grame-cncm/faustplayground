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

//--- Init graphical elements of library

/// <reference path="../App.ts"/>
/// <reference path="../Main.ts"/>


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

    fillLibrary() {
        var url: string = "faust-modules/index.json"
        App.getXHR(url, (json: string) => { this.fillLibraryCallBack(json) }, (errorMessage: string) => { ErrorFaust.errorCallBack(errorMessage)});
    }

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

    fillSubMenu(options: string[], subMenuId: string, stringStructureRemoved: string) {
        var subMenu: HTMLUListElement = <HTMLUListElement>document.getElementById(subMenuId);
        //subMenu.ondrag = App.preventdefault;
        
        for (var i = 0; i < options.length; i++) {

            var li: HTMLLIElement = document.createElement("li");
            var a: HTMLAnchorElement = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.title = "Drag me ! Cliquez, glissez, d�posez !";
            a.onclick = App.preventdefault;

            var dblckickHandler = this.dispatchEventLibrary.bind(this,a.href) 
            a.ondblclick =  dblckickHandler;
            a.ontouchstart = (e) => { this.dbleTouchMenu(e) }

            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li)

        }
    }



    dbleTouchMenu(touchEvent: TouchEvent) {
        var anchor: HTMLAnchorElement = <HTMLAnchorElement>touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
            this.previousTouchUrl = anchor.href;
            window.setTimeout(()=>{ this.isLibraryTouch = false;this.previousTouchUrl = "" },300)
        } else if (anchor.href == this.previousTouchUrl) {
            App.showFullPageLoading();
            this.dispatchEventLibrary(anchor.href);
            this.isLibraryTouch = false;
        } else {
            this.isLibraryTouch = false;
        }
    }
    dispatchEventLibrary(url: string) {
        var event: CustomEvent = new CustomEvent("dbltouchlib", { 'detail': url })
        document.dispatchEvent(event);
    }

    initScroll() {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    }

    cleanNameElement(elementComplete: string, stringStructureRemoved: string): string {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    }
}
