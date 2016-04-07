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
}());
var FaustInterfaceControler = (function () {
    function FaustInterfaceControler(interfaceCallback, setDSPValueCallback) {
        this.accDefault = "0 0 -10 0 10";
        this.interfaceCallback = interfaceCallback;
        this.setDSPValueCallback = setDSPValueCallback;
    }
    FaustInterfaceControler.prototype.parseFaustJsonUI = function (ui, module) {
        this.faustControlers = [];
        for (var i = 0; i < ui.length; i++) {
            this.parse_group(ui[i], module);
        }
        return this.faustControlers;
    };
    FaustInterfaceControler.prototype.parse_group = function (group, module) {
        if (group.items)
            this.parse_items(group.items, module);
    };
    FaustInterfaceControler.prototype.parse_item = function (item, module) {
        var _this = this;
        var params = module.getInterfaceParams();
        if (params && params[item.address]) {
            item.init = params[item.address];
        }
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);
        }
        else if (item.type === "vslider" || item.type === "hslider") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function () { _this.interfaceCallback(controler); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            controler.value = itemElement.init;
            this.faustControlers.push(controler);
        }
        else if (item.type === "button") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function (faustInterface) { _this.interfaceCallback(faustInterface); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            this.faustControlers.push(controler);
        }
        else if (item.type === "checkbox") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function (faustInterface) { _this.interfaceCallback(faustInterface); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            this.faustControlers.push(controler);
        }
    };
    FaustInterfaceControler.prototype.parse_items = function (items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    };
    FaustInterfaceControler.prototype.setParams = function () {
        for (var j = 0; j < this.itemParam.meta.length; j++) {
            if (this.itemParam.meta[j].unit) {
                this.unit = this.itemParam.meta[j].unit;
            }
        }
        if (this.unit == undefined) {
            this.unit = "";
        }
        var precision = this.itemParam.step.toString().split('.').pop().length;
        this.precision = String(precision);
        this.accParams = {
            isEnabled: this.isEnabled,
            acc: this.acc,
            address: this.itemParam.address,
            init: parseFloat(this.itemParam.init),
            max: parseFloat(this.itemParam.max),
            min: parseFloat(this.itemParam.min)
        };
    };
    FaustInterfaceControler.prototype.createFaustInterfaceElement = function () {
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                return this.faustInterfaceView.addFaustModuleSlider(this.itemParam, parseFloat(this.precision), this.unit);
            }
            else if (this.faustInterfaceView.type === "button") {
                return this.faustInterfaceView.addFaustButton(this.itemParam);
            }
            else if (this.faustInterfaceView.type === "checkbox") {
                return this.faustInterfaceView.addFaustCheckBox(this.itemParam.init);
            }
        }
    };
    FaustInterfaceControler.prototype.setEventListener = function () {
        var _this = this;
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                this.faustInterfaceView.slider.addEventListener("input", function (event) {
                    _this.interfaceCallback(_this);
                    event.stopPropagation();
                    event.preventDefault();
                });
                this.faustInterfaceView.slider.addEventListener("mousedown", function (e) { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchstart", function (e) { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchmove", function (e) { e.stopPropagation(); });
            }
            else if (this.faustInterfaceView.type === "button") {
            }
            else if (this.faustInterfaceView.type === "checkbox") {
            }
        }
    };
    FaustInterfaceControler.prototype.createAccelerometer = function () {
        var _this = this;
        if (this.itemParam.meta) {
            var meta = this.itemParam.meta;
            for (var i = 0; i < meta.length; i++) {
                if (meta[i].acc) {
                    this.acc = meta[i].acc;
                    this.accParams.acc = this.acc;
                    this.accParams.isEnabled = true;
                    AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                    this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                    this.accelerometerSlider.isEnabled = true;
                    this.faustInterfaceView.slider.classList.add("allowed");
                    this.faustInterfaceView.group.classList.add(Axis[this.accelerometerSlider.axis]);
                    if (App.isAccelerometerOn) {
                        this.accelerometerSlider.isActive = true;
                        this.faustInterfaceView.slider.classList.remove("allowed");
                        this.faustInterfaceView.slider.classList.add("not-allowed");
                        this.faustInterfaceView.slider.disabled = true;
                    }
                }
                else if (meta[i].noacc) {
                    this.acc = meta[i].noacc;
                    this.accParams.acc = this.acc;
                    this.accParams.isEnabled = false;
                    AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                    this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                    this.accelerometerSlider.isEnabled = false;
                    this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
                }
            }
            if (this.accelerometerSlider == undefined) {
                this.acc = this.accDefault;
                this.accParams.acc = this.acc;
                this.accParams.isEnabled = false;
                AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                this.accelerometerSlider.isEnabled = false;
                this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
            }
        }
        else {
            this.acc = this.accDefault;
            this.accParams.acc = this.acc;
            this.accParams.isEnabled = false;
            AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
            this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
            this.accelerometerSlider.isEnabled = false;
            this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
        }
    };
    FaustInterfaceControler.prototype.callbackValueChange = function (address, value) {
        this.setDSPValueCallback(address, String(value));
        this.faustInterfaceView.slider.value = String((value - parseFloat(this.itemParam.min)) / parseFloat(this.itemParam.step));
        this.faustInterfaceView.output.textContent = String(value.toFixed(parseFloat(this.precision)));
    };
    return FaustInterfaceControler;
}());
/********************************************************************
  ********************* ADD GRAPHICAL ELEMENTS ************************
  ********************************************************************/
var FaustInterfaceView = (function () {
    function FaustInterfaceView(type) {
        this.type = type;
    }
    FaustInterfaceView.prototype.addFaustModuleSlider = function (itemParam, precision, unit) {
        var group = document.createElement("div");
        group.className = "control-group";
        var info = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", itemParam.min);
        info.setAttribute("max", itemParam.max);
        info.setAttribute("step", itemParam.step);
        info.setAttribute("precision", String(precision));
        var lab = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(itemParam.label));
        info.appendChild(lab);
        var val = document.createElement("span");
        val.className = "value";
        this.output = val;
        var myValue = Number(itemParam.init).toFixed(precision);
        val.appendChild(document.createTextNode("" + myValue + " " + unit));
        // cache the units type on the element for updates
        val.setAttribute("units", unit);
        info.appendChild(val);
        group.appendChild(info);
        var high = (parseFloat(itemParam.max) - parseFloat(itemParam.min)) / parseFloat(itemParam.step);
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = String(high);
        slider.value = String((parseFloat(itemParam.init) - parseFloat(itemParam.min)) / parseFloat(itemParam.step));
        //slider.value = String(Number(controler.init).toFixed(precision));
        slider.step = "1";
        this.slider = slider;
        group.appendChild(slider);
        this.group = group;
        return group;
    };
    FaustInterfaceView.prototype.addFaustCheckBox = function (ivalue) {
        var group = document.createElement("div");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        //checkbox.onchange = function (event: Event) { onUpdate; event.stopPropagation() };
        checkbox.id = "mycheckbox";
        var label = document.createElement('label');
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));
        group.appendChild(checkbox);
        group.appendChild(label);
        return checkbox;
    };
    FaustInterfaceView.prototype.addFaustButton = function (itemParam) {
        var group = document.createElement("div");
        var button = document.createElement("BUTTON"); // Create a <button> element
        //button.onmouseup = function (event: Event) { onUpdate };	
        //button.onmousedown = function (event: Event) { onUpdate };	
        var labelText = document.createTextNode(itemParam.label); // Create a text node
        button.appendChild(labelText);
        // Append the text to <button>
        group.appendChild(button);
        return button;
    };
    return FaustInterfaceView;
}());
//# sourceMappingURL=FaustInterface.js.map