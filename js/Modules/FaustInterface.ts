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
interface Iitem extends HTMLDivElement{
    label: string;
    init: string;
    address: string;
    type: string;
    items: Iitem[];
    min: string;
    max: string;
    step: string;
    meta: FaustMeta[];
}
interface FaustMeta {
    acc: string;
}

class FaustInterface {
    group: IGroup;



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

    parse_item(item: Iitem, module: ModuleClass):void {

        var params = module.getInterfaceParams();

	    if( params && params[item.address]){
		    item.init = params[item.address];
	    }
	
	    if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup")
            this.parse_items(item.items, module);

        else if (item.type === "vslider" || item.type === "hslider")
            this.addFaustModuleSlider(module, item.address, item.label, item.init, item.min, item.max, item.step, "", item.meta, module.interfaceCallback);
		
        else if(item.type === "button")
            this.addFaustButton(module, item.address, item.label, module.interfaceCallback);
    	
	    else if(item.type === "checkbox")
            this.addFaustCheckBox(module, item.address, module.interfaceCallback);
    }

    parse_items(items: Iitem[], node: ModuleClass):void {
 	    for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    }

    /******************************************************************** 
    ********************* ADD GRAPHICAL ELEMENTS ************************
    ********************************************************************/

    addFaustModuleSlider(module: ModuleClass, groupName: string, label: string, ivalue: string, imin: string, imax: string, stepUnits: string, units: string, meta: FaustMeta[], onUpdate: (event: Event, module: ModuleClass) => any): HTMLInputElement {
        for (var i = 0; i < meta.length;i++) {
            if (meta[i].acc) {

                AccelerometerHandler.registerAcceleratedSlider(meta[i].acc, module,label);
            }
        }
	    var precision = stepUnits.toString().split('.').pop().length;

        this.group = <Iitem>document.createElement("div");
 	    this.group.className="control-group";
	    this.group.label = groupName;

        var info: HTMLDivElement = document.createElement("div");
	    info.className="slider-info";
	    info.setAttribute("min", imin );
	    info.setAttribute("max", imax );
	    info.setAttribute("step", stepUnits );
        info.setAttribute("precision", String(precision));
        var lab: HTMLSpanElement = document.createElement("span");
	    lab.className="label";
	    lab.appendChild(document.createTextNode(label));
	    info.appendChild(lab);
        var val: HTMLSpanElement = document.createElement("span");
	    val.className="value";

        var myValue: string = Number(ivalue).toFixed(precision);
	    val.appendChild(document.createTextNode("" + myValue + " " + units));

	    // cache the units type on the element for updates
	    val.setAttribute("units",units);
	    info.appendChild(val);

	    this.group.appendChild(info);

        var high:number = (parseFloat(imax) - parseFloat(imin)) / parseFloat(stepUnits);

        var slider: HTMLInputElement = document.createElement("input");
	    slider.type="range";
	    slider.min =  "0";
	    slider.max = String(high);
        slider.value = String((parseFloat(ivalue) - parseFloat(imin)) / parseFloat(stepUnits));
        slider.step = "1";
        slider.addEventListener("input", function (event) {
            console.log("interface faust");
            onUpdate(event, module)
            event.stopPropagation();
            event.preventDefault();
        });
        slider.addEventListener("mousedown", (e) => { e.stopPropagation() })
        slider.addEventListener("touchstart", (e) => { e.stopPropagation() })
        slider.addEventListener("touchmove", (e) => { e.stopPropagation() })
	    this.group.appendChild(slider);

        module.moduleView.getInterfaceContainer().appendChild(this.group);
	    return slider;
    }

    addFaustCheckBox(module: ModuleClass, ivalue: string, onUpdate: (event: Event, module: ModuleClass) => any): HTMLInputElement {
        this.group = <Iitem>document.createElement("div");

        var checkbox: HTMLInputElement = document.createElement("input");
	    checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.onchange = function (event: Event) { onUpdate; event.stopPropagation() };

	    checkbox.id = "mycheckbox";

        var label: HTMLLabelElement = document.createElement('label')
	    label.htmlFor = "mycheckbox";
	    label.appendChild(document.createTextNode(" " + ivalue));
	
	    this.group.appendChild(checkbox);
	    this.group.appendChild(label);

        module.moduleView.getInterfaceContainer().appendChild(this.group);
	    return checkbox;
    }

    addFaustButton(module: ModuleClass, groupName: string, label: string, onUpdate: (event: Event, module: ModuleClass) => any):HTMLElement {

        this.group = <Iitem>document.createElement("div");
	    this.group.label = groupName;

        var button: HTMLElement = document.createElement("BUTTON");        // Create a <button> element
        button.onmouseup = function (event: Event) { onUpdate };	
        button.onmousedown = function (event: Event) { onUpdate };	

        var labelText: Text = document.createTextNode(label);       // Create a text node
        button.appendChild(labelText);
	                                    // Append the text to <button>
        this.group.appendChild(button);
        module.moduleView.getInterfaceContainer().appendChild(this.group);
	
	    return button;
    }

}
