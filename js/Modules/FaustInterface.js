/*				FAUSTINTERFACE.JS

    HELPER FUNCTIONS TO CREATE FAUST INTERFACES
    
    FIRST PART --> DECODE JSON ENCODED INTERFACE
    SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/
"use strict";
var FaustInterface = (function () {
    function FaustInterface() {
    }
    FaustInterface.prototype.parse_ui = function (ui, node) {
        for (var i = 0; i < ui.length; i++)
            this.parse_group(ui[i], node);
    };
    FaustInterface.prototype.parse_group = function (group, node) {
        if (group.items)
            this.parse_items(group.items, node);
    };
    //function parse_items(items, node){
    //	var i;
    //    for (i = 0; i < items.length; i++)
    //    	parse_item(items[i], node);
    //}
    FaustInterface.prototype.parse_item = function (item, node) {
        var params = node.getParams();
        if (params && params[item.address]) {
            item.init = params[item.address];
        }
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup")
            this.parse_items(item.items, node);
        else if (item.type === "vslider" || item.type === "hslider")
            this.addFaustModuleSlider(node, item.address, item.label, item.init, item.min, item.max, item.step, "", node.interfaceCallback);
        else if (item.type === "button")
            this.addFaustButton(node, item.address, item.label, node.interfaceCallback);
        else if (item.type === "checkbox")
            this.addFaustCheckBox(node, item.address, node.interfaceCallback);
    };
    FaustInterface.prototype.parse_items = function (items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    };
    /********************************************************************
    ********************* ADD GRAPHICAL ELEMENTS ************************
    ********************************************************************/
    FaustInterface.prototype.addFaustModuleSlider = function (node, groupName, label, ivalue, imin, imax, stepUnits, units, onUpdate) {
        var precision = stepUnits.toString().split('.').pop().length;
        this.group = document.createElement("div");
        this.group.className = "control-group";
        this.group.label = groupName;
        var info = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", imin);
        info.setAttribute("max", imax);
        info.setAttribute("step", stepUnits);
        info.setAttribute("precision", precision);
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
        var high = (imax - imin) / stepUnits;
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = String(high);
        slider.value = String((ivalue - imin) / stepUnits);
        slider.step = "1";
        slider.oninput = onUpdate;
        this.group.appendChild(slider);
        node.getInterfaceContainer().appendChild(this.group);
        return slider;
    };
    FaustInterface.prototype.addFaustCheckBox = function (element, ivalue, onUpdate) {
        var group = document.createElement("div");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.onchange = onUpdate;
        checkbox.id = "mycheckbox";
        var label = document.createElement('label');
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));
        group.appendChild(checkbox);
        group.appendChild(label);
        element.getInterfaceContainer().appendChild(group);
        return checkbox;
    };
    FaustInterface.prototype.addFaustButton = function (element, groupName, label, onUpdate) {
        var group = document.createElement("div");
        this.group.label = groupName;
        var button = document.createElement("BUTTON"); // Create a <button> element
        button.onmouseup = onUpdate;
        button.onmousedown = onUpdate;
        var labelText = document.createTextNode(label); // Create a text node
        button.appendChild(labelText);
        // Append the text to <button>
        group.appendChild(button);
        element.getInterfaceContainer().appendChild(group);
        return button;
    };
    return FaustInterface;
})();
//# sourceMappingURL=FaustInterface.js.map