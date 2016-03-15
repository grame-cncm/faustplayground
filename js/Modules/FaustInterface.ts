/*				FAUSTINTERFACE.JS

	HELPER FUNCTIONS TO CREATE FAUST INTERFACES
	
	FIRST PART --> DECODE JSON ENCODED INTERFACE
	SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/

"use strict";

/******************************************************************** 
*************************** DECODE JSON *****************************
********************************************************************/
interface IGroup extends HTMLDivElement {
    label: string;
    items:Iitem[]
}
interface Iui extends JSON {
    group: IGroup[]
    
}
interface Iitem{
    label: string;
    init: string;
    address: string;
    type: string;
    items: Iitem[];
    min: string;
    max: string;
    step: string;
    meta: FaustMeta[];
    unit: string;
    slider: HTMLInputElement;
    output: HTMLElement
    precision: string;
    hasAccelerometer: boolean;
    acc: string;

}
interface FaustMeta {
    acc: string;
}
class Controler implements Iitem {
    label: string;
    init: string;
    address: string;
    type: string;
    items: Iitem[];
    min: string;
    max: string;
    step: string;
    meta: FaustMeta[];
    unit: string;
    slider: HTMLInputElement;
    output: HTMLElement
    precision: string;
    hasAccelerometer: boolean;
    acc: string;

}
class FaustInterface {
   



    parse_ui(ui: IGroup[], module:ModuleClass):void{
        for (var i = 0; i < ui.length; i++)
            this.parse_group(ui[i], module);
    }

    parse_group(group: IGroup, module: ModuleClass):void { 
	    if (group.items)
    	    this.parse_items(group.items, module);
    }
    
    //function parse_items(items, node){
    //	var i;
    //    for (i = 0; i < items.length; i++)
    //    	parse_item(items[i], node);
    //}

    parse_item(item: Iitem, module: ModuleClass): void {

        var params = module.getInterfaceParams();

        if (params && params[item.address]) {
            item.init = params[item.address];
        }

        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);

        } else if (item.type === "vslider" || item.type === "hslider") {
            var controler: Controler = item;

            this.addFaustModuleSlider(module, controler);
            controler.slider.addEventListener("input", function (event) {
                module.interfaceCallback(event, controler, module)
                event.stopPropagation();
                event.preventDefault();
            });
            controler.slider.addEventListener("mousedown", (e) => { e.stopPropagation() })
            controler.slider.addEventListener("touchstart", (e) => { e.stopPropagation() })
            controler.slider.addEventListener("touchmove", (e) => { e.stopPropagation() })

            
            module.moduleControles.push(controler)


        } else if (item.type === "button") {
            var controler: Controler = item;
            this.addFaustButton(module, item.address, item.label, (event) => { module.interfaceCallback(event, controler, module) });
            module.moduleControles.push(controler)

        } else if (item.type === "checkbox") {
            var controler: Controler = item;
            this.addFaustCheckBox(module, item.address, (event) => { module.interfaceCallback(event, controler, module) });
            module.moduleControles.push(controler)

        }
    }

    parse_items(items: Iitem[], node: ModuleClass):void {
 	    for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    }

    /******************************************************************** 
    ********************* ADD GRAPHICAL ELEMENTS ************************
    ********************************************************************/

    //addFaustModuleSlider(module: ModuleClass, groupName: string, label: string, ivalue: string, imin: string, imax: string, stepUnits: string, units: string, meta: FaustMeta[], onUpdate: (event: Event, module: ModuleClass) => any): HTMLInputElement {
    addFaustModuleSlider(module: ModuleClass, controler: Controler): HTMLInputElement {

        var precision = controler.step.toString().split('.').pop().length;
        controler.precision = String(precision);
        var group = document.createElement("div");
        group.className = "control-group";

        var info: HTMLDivElement = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", controler.min);
        info.setAttribute("max", controler.max);
        info.setAttribute("step", controler.step);
        info.setAttribute("precision", String(precision));
        var lab: HTMLSpanElement = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(controler.label));
        info.appendChild(lab);
        var val: HTMLSpanElement = document.createElement("span");
        val.className = "value";
        controler.output = val;

        var myValue: string = Number(controler.init).toFixed(precision);
        if (controler.unit == undefined) {
            controler.unit=""
        }
        val.appendChild(document.createTextNode("" + myValue + " " +  controler.unit));

	    // cache the units type on the element for updates
        val.setAttribute("units", controler.unit);
	    info.appendChild(val);

	    group.appendChild(info);

        var high: number = (parseFloat(controler.max) - parseFloat(controler.min)) / parseFloat(controler.step);

        var slider: HTMLInputElement = document.createElement("input");
	    slider.type="range";
	    slider.min =  "0";
        slider.max = String(high);
        slider.value = String((parseFloat(controler.init) - parseFloat(controler.min)) / parseFloat(controler.step));
        //slider.value = String(Number(controler.init).toFixed(precision));
        slider.step = "1";
        controler.slider = slider;
        group.appendChild(slider);
        if (controler.meta != undefined) {
            for (var i = 0; i < controler.meta.length; i++) {
                if (controler.meta[i].acc) {
                    controler.acc = controler.meta[i].acc;
                    controler.hasAccelerometer = true;
                    var accSlide = AccelerometerHandler.registerAcceleratedSlider(controler, module)
                    //var checkbox = document.createElement("input");
                    //checkbox.type = "checkbox";
                    if (App.isAccelerometerOn) {

                        slider.style.opacity = "0.3";
                        slider.disabled = true;
                    } 
                    //checkbox.className = "accCheckbox";
                    //checkbox.addEventListener("click", (event) => { event.stopPropagation(),false })
                    //checkbox.addEventListener("touchstart", (event) => { event.stopPropagation(), false })
                    //checkbox.addEventListener("change", (event) => {
                    //    accSlide.switchActive(event)
                    //}, false);

                    //var titleAcc = document.createElement("span")
                    //titleAcc.className = "titleAcc";
                    //titleAcc.textContent = "Accelerometre";

                    //var editAcc = document.createElement("button");
                    //editAcc.type = "button";
                    //editAcc.className = "accButton";
                    //editAcc.textContent = "edite";
                    //editAcc.addEventListener("click", module.sceneParent.eventEditAcc)

                    //group.appendChild(checkbox);
                    //group.appendChild(titleAcc);
                    //group.appendChild(editAcc);

                }
            }
        }
        module.moduleView.getInterfaceContainer().appendChild(group);
	    return slider;
    }

    addFaustCheckBox(module: ModuleClass, ivalue: string, onUpdate: (event: Event, module: ModuleClass) => any): HTMLInputElement {
        var group = document.createElement("div");

        var checkbox: HTMLInputElement = document.createElement("input");
	    checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.onchange = function (event: Event) { onUpdate; event.stopPropagation() };

	    checkbox.id = "mycheckbox";

        var label: HTMLLabelElement = document.createElement('label')
	    label.htmlFor = "mycheckbox";
	    label.appendChild(document.createTextNode(" " + ivalue));
	
	    group.appendChild(checkbox);
	    group.appendChild(label);

        module.moduleView.getInterfaceContainer().appendChild(group);
	    return checkbox;
    }

    addFaustButton(module: ModuleClass, groupName: string, label: string, onUpdate: (event: Event, module: ModuleClass) => any):HTMLElement {

        var group = document.createElement("div");

        var button: HTMLElement = document.createElement("BUTTON");        // Create a <button> element
        button.onmouseup = function (event: Event) { onUpdate };	
        button.onmousedown = function (event: Event) { onUpdate };	

        var labelText: Text = document.createTextNode(label);       // Create a text node
        button.appendChild(labelText);
	                                    // Append the text to <button>
        group.appendChild(button);
        module.moduleView.getInterfaceContainer().appendChild(group);
	
	    return button;
    }

}
