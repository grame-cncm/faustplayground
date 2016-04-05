/*				FAUSTINTERFACE.JS

    HELPER FUNCTIONS TO CREATE FAUST INTERFACES
    
    FIRST PART --> DECODE JSON ENCODED INTERFACE
    SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/
"use strict";
var Controler = (function () {
    function Controler() {
        this.accDefault = "0 0 -10 0 10";
    }
    return Controler;
})();
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
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);
        }
        else if (item.type === "vslider" || item.type === "hslider") {
            var controler = item;
            controler.value = item.init;
            this.addFaustModuleSlider(module, controler);
            controler.slider.addEventListener("input", function (event) {
                module.interfaceCallback(event, controler, module);
                event.stopPropagation();
                event.preventDefault();
            });
            controler.slider.addEventListener("mousedown", function (e) { e.stopPropagation(); });
            controler.slider.addEventListener("touchstart", function (e) { e.stopPropagation(); });
            controler.slider.addEventListener("touchmove", function (e) { e.stopPropagation(); });
            module.moduleControles.push(controler);
        }
        else if (item.type === "button") {
            var controler = item;
            this.addFaustButton(module, item.address, item.label, function (event) { module.interfaceCallback(event, controler, module); });
            module.moduleControles.push(controler);
        }
        else if (item.type === "checkbox") {
            var controler = item;
            this.addFaustCheckBox(module, item.address, function (event) { module.interfaceCallback(event, controler, module); });
            module.moduleControles.push(controler);
        }
    };
    FaustInterface.prototype.parse_items = function (items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    };
    /********************************************************************
    ********************* ADD GRAPHICAL ELEMENTS ************************
    ********************************************************************/
    //addFaustModuleSlider(module: ModuleClass, groupName: string, label: string, ivalue: string, imin: string, imax: string, stepUnits: string, units: string, meta: FaustMeta[], onUpdate: (event: Event, module: ModuleClass) => any): HTMLInputElement {
    FaustInterface.prototype.addFaustModuleSlider = function (module, controler) {
        var precision = controler.step.toString().split('.').pop().length;
        controler.precision = String(precision);
        var group = document.createElement("div");
        group.className = "control-group";
        var info = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", controler.min);
        info.setAttribute("max", controler.max);
        info.setAttribute("step", controler.step);
        info.setAttribute("precision", String(precision));
        var lab = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(controler.label));
        info.appendChild(lab);
        var val = document.createElement("span");
        val.className = "value";
        controler.output = val;
        var myValue = Number(controler.init).toFixed(precision);
        if (controler.unit == undefined) {
            controler.unit = "";
        }
        val.appendChild(document.createTextNode("" + myValue + " " + controler.unit));
        // cache the units type on the element for updates
        val.setAttribute("units", controler.unit);
        info.appendChild(val);
        group.appendChild(info);
        var high = (parseFloat(controler.max) - parseFloat(controler.min)) / parseFloat(controler.step);
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
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
                    controler.isEnabled = true;
                    controler.accelerometerSlider = AccelerometerHandler.registerAcceleratedSlider(controler, module);
                    slider.classList.add("allowed");
                    if (App.isAccelerometerOn) {
                        slider.classList.remove("allowed");
                        slider.classList.add("not-allowed");
                        slider.disabled = true;
                    }
                    break;
                }
                else if (controler.meta[i].noacc) {
                    controler.hasAccelerometer = false;
                    controler.isEnabled = false;
                    controler.acc = controler.meta[i].noacc;
                    controler.accelerometerSlider = AccelerometerHandler.registerAcceleratedSlider(controler, module);
                    break;
                }
            }
            if (controler.accelerometerSlider == undefined) {
                controler.acc = "0 0 -10 0 10";
                controler.isEnabled = false;
                controler.hasAccelerometer = false;
                controler.accelerometerSlider = AccelerometerHandler.registerAcceleratedSlider(controler, module);
            }
        }
        else {
            controler.acc = "0 0 -10 0 10";
            controler.isEnabled = false;
            controler.hasAccelerometer = false;
            controler.accelerometerSlider = AccelerometerHandler.registerAcceleratedSlider(controler, module);
        }
        module.moduleView.getInterfaceContainer().appendChild(group);
        return slider;
    };
    FaustInterface.prototype.addFaustCheckBox = function (module, ivalue, onUpdate) {
        var group = document.createElement("div");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.onchange = function (event) { onUpdate; event.stopPropagation(); };
        checkbox.id = "mycheckbox";
        var label = document.createElement('label');
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));
        group.appendChild(checkbox);
        group.appendChild(label);
        module.moduleView.getInterfaceContainer().appendChild(group);
        return checkbox;
    };
    FaustInterface.prototype.addFaustButton = function (module, groupName, label, onUpdate) {
        var group = document.createElement("div");
        var button = document.createElement("BUTTON"); // Create a <button> element
        button.onmouseup = function (event) { onUpdate; };
        button.onmousedown = function (event) { onUpdate; };
        var labelText = document.createTextNode(label); // Create a text node
        button.appendChild(labelText);
        // Append the text to <button>
        group.appendChild(button);
        module.moduleView.getInterfaceContainer().appendChild(group);
        return button;
    };
    return FaustInterface;
})();
//# sourceMappingURL=FaustInterface.js.map