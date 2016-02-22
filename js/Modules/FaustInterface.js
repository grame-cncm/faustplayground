/*				FAUSTINTERFACE.JS

    HELPER FUNCTIONS TO CREATE FAUST INTERFACES
    
    FIRST PART --> DECODE JSON ENCODED INTERFACE
    SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/
"use strict";
var FaustInterface = (function () {
    function FaustInterface() {
    }
    FaustInterface.prototype.parse_ui = function (ui, module) {
        for (var i = 0; i < ui.length; i++)
            this.parse_group(ui[i], module);
    };
    FaustInterface.prototype.parse_group = function (group, module) {
        if (group.items)
            this.parse_items(group.items, module);
    };
    //function parse_items(items, node){
    //	var i;
    //    for (i = 0; i < items.length; i++)
    //    	parse_item(items[i], node);
    //}
    FaustInterface.prototype.parse_item = function (item, module) {
        var params = module.getInterfaceParams();
        if (params && params[item.address]) {
            item.init = params[item.address];
        }
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup")
            this.parse_items(item.items, module);
        else if (item.type === "vslider" || item.type === "hslider")
            this.addFaustModuleSlider(module, item.address, item.label, item.init, item.min, item.max, item.step, "", module.interfaceCallback);
        else if (item.type === "button")
            this.addFaustButton(module, item.address, item.label, module.interfaceCallback);
        else if (item.type === "checkbox")
            this.addFaustCheckBox(module, item.address, module.interfaceCallback);
    };
    FaustInterface.prototype.parse_items = function (items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    };
    /********************************************************************
    ********************* ADD GRAPHICAL ELEMENTS ************************
    ********************************************************************/
    FaustInterface.prototype.addFaustModuleSlider = function (module, groupName, label, ivalue, imin, imax, stepUnits, units, onUpdate) {
        var precision = stepUnits.toString().split('.').pop().length;
        this.group = document.createElement("div");
        this.group.className = "control-group";
        this.group.label = groupName;
        var info = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", imin);
        info.setAttribute("max", imax);
        info.setAttribute("step", stepUnits);
        info.setAttribute("precision", String(precision));
        var lab = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(label));
        info.appendChild(lab);
        var val = document.createElement("span");
        val.className = "value";
        var myValue = Number(ivalue).toFixed(precision);
        val.appendChild(document.createTextNode("" + myValue + " " + units));
        // cache the units type on the element for updates
        val.setAttribute("units", units);
        info.appendChild(val);
        this.group.appendChild(info);
        var high = (parseFloat(imax) - parseFloat(imin)) / parseFloat(stepUnits);
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = String(high);
        slider.value = String((parseFloat(ivalue) - parseFloat(imin)) / parseFloat(stepUnits));
        slider.step = "1";
        slider.oninput = function (event) { onUpdate(event, module); };
        this.group.appendChild(slider);
        module.moduleView.getInterfaceContainer().appendChild(this.group);
        return slider;
    };
    FaustInterface.prototype.addFaustCheckBox = function (module, ivalue, onUpdate) {
        this.group = document.createElement("div");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.onchange = function (event) { onUpdate; };
        checkbox.id = "mycheckbox";
        var label = document.createElement('label');
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));
        this.group.appendChild(checkbox);
        this.group.appendChild(label);
        module.moduleView.getInterfaceContainer().appendChild(this.group);
        return checkbox;
    };
    FaustInterface.prototype.addFaustButton = function (module, groupName, label, onUpdate) {
        this.group = document.createElement("div");
        this.group.label = groupName;
        var button = document.createElement("BUTTON"); // Create a <button> element
        button.onmouseup = function (event) { onUpdate; };
        button.onmousedown = function (event) { onUpdate; };
        var labelText = document.createTextNode(label); // Create a text node
        button.appendChild(labelText);
        // Append the text to <button>
        this.group.appendChild(button);
        module.moduleView.getInterfaceContainer().appendChild(this.group);
        return button;
    };
    return FaustInterface;
})();
