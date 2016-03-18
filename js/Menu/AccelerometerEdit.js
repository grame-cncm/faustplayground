//AccelerometerEdit
"use strict";
var AccelerometerEdit = (function () {
    function AccelerometerEdit(accelerometerEditView) {
        var _this = this;
        this.isOn = false;
        this.accelerometerEditView = accelerometerEditView;
        this.eventEditHandler = function (event, accelerometer) { _this.editEvent(accelerometer, event); };
        this.accelerometerEditView.cancelButton.addEventListener("click", function () { _this.cancelAccelerometerEdit(); });
        this.accelerometerEditView.validButton.addEventListener("click", function () { _this.applyAccelerometerEdit(); });
        this.accelerometerEditView.radioAxisX.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisY.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioCurve1.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve2.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve3.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve4.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.checkeOnOff.addEventListener("change", function (event) { _this.accelerometerEventSwitch(event); });
        this.accelerometerEditView.rangeVirtual.addEventListener("input", function (event) { _this.virtualAccelerometer(event); });
        this.accelerometerEditView.rangeMin.addEventListener("input", function (event) { _this.accMin(); });
        this.accelerometerEditView.rangeMid.addEventListener("input", function (event) { _this.accMid(); });
        this.accelerometerEditView.rangeMax.addEventListener("input", function (event) { _this.accMax(); });
    }
    AccelerometerEdit.prototype.editAction = function (scene) {
        if (this.isOn) {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.mySlider.parentElement.removeEventListener("click", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.removeEventListener("touchstart", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.classList.remove('editControl');
                currentAccSlide.mySlider.classList.remove('edit');
                this.setSliderDisableValue(currentAccSlide);
            }
            this.isOn = false;
            App.isAccelerometerEditOn = false;
        }
        else {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.callbackEdit = this.editEvent.bind(this, currentAccSlide);
                currentAccSlide.mySlider.parentElement.addEventListener("click", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.addEventListener("touchstart", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.classList.add('editControl');
                currentAccSlide.mySlider.classList.add('edit');
                currentAccSlide.mySlider.disabled = true;
            }
            this.isOn = true;
            App.isAccelerometerEditOn = true;
        }
    };
    AccelerometerEdit.prototype.setSliderDisableValue = function (slider) {
        if (slider.isActive) {
            slider.mySlider.disabled = true;
        }
        else {
            slider.mySlider.disabled = false;
        }
    };
    AccelerometerEdit.prototype.editEvent = function (accSlider, event) {
        event.stopPropagation();
        event.preventDefault();
        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent);
        this.accSlid = accSlider;
        this.storeAccelerometerSliderInfos(accSlider);
        this.placeElement();
        //this.accelerometerEditView.labelTitle.textContent = accSlider.label;
        this.selectDefaultAxis(accSlider);
        this.selectDefaultCurve(accSlider);
        this.accelerometerEditView.checkeOnOff.checked = this.accSlid.isActive;
        this.applyRangeMinValues(accSlider);
        this.applyRangeMidValues(accSlider);
        this.applyRangeMaxValues(accSlider);
        this.applyRangeVirtualValues(accSlider);
        this.createCurrentControler(accSlider);
        this.applyRangeCurrentValues(accSlider);
        this.addCloneSlider(accSlider);
    };
    AccelerometerEdit.prototype.addCloneSlider = function (accSlider) {
        this.originalSlider = accSlider.mySlider;
        this.originalValueOutput = accSlider.valueOutput;
        this.currentParentElemSliderClone = accSlider.mySlider.parentElement.cloneNode(true);
        var title = accSlider.module.moduleView.fModuleContainer.getElementsByTagName("h6")[0].cloneNode(true);
        this.accelerometerEditView.container.insertBefore(title, this.accelerometerEditView.radioCurveContainer);
        this.accelerometerEditView.cloneContainer.appendChild(this.currentParentElemSliderClone);
        accSlider.mySlider = this.currentParentElemSliderClone.getElementsByTagName("input")[0];
        accSlider.valueOutput = this.currentParentElemSliderClone.getElementsByClassName("value")[0];
        this.accelerometerSwitch(this.accSlid.isActive);
    };
    AccelerometerEdit.prototype.removeCloneSlider = function (accSlider) {
        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0]);
        accSlider.mySlider = this.originalSlider;
        accSlider.valueOutput = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove();
    };
    AccelerometerEdit.prototype.cancelAccelerometerEdit = function () {
        this.accSlid.setAttributes(this.originalAccValue);
        this.accSlid.ivalue = this.originalDefaultVal;
        this.accSlid.module.moduleFaust.fDSP.setValue(this.accSlid.label, this.accSlid.ivalue.toString());
        this.accSlid.mySlider.value = this.originalDefaultSliderVal;
        window.removeEventListener("resize", this.windowResizeEvent);
        this.accelerometerEditView.rangeContainer.className = "";
        this.accelerometerSwitch(this.originalActive);
        this.accSlid.valueOutput.textContent = this.accSlid.ivalue.toString();
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.removeCloneSlider(this.accSlid);
    };
    AccelerometerEdit.prototype.applyAccelerometerEdit = function () {
        this.removeCloneSlider(this.accSlid);
        this.accSlid.mySlider.parentElement.classList.remove(this.originalAxis);
        this.accSlid.mySlider.parentElement.classList.add(Axis[this.accSlid.axis]);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.accSlid.acc = this.accSlid.axis + " " + this.accSlid.curve + " " + this.accSlid.amin + " " + this.accSlid.amid + " " + this.accSlid.amax;
        window.removeEventListener("resize", this.windowResizeEvent);
        this.accelerometerEditView.rangeContainer.className = "";
        this.accSlid.mySlider.classList.remove(this.originalSliderStyle);
        this.accSlid.mySlider.classList.add(this.sliderStyle);
        this.accSlid.mySlider.parentElement.removeEventListener("click", this.accSlid.callbackEdit, true);
        this.accSlid.mySlider.parentElement.removeEventListener("touchstart", this.accSlid.callbackEdit, true);
        this.accSlid.callbackEdit = this.editEvent.bind(this, this.accSlid);
        this.accSlid.mySlider.parentElement.addEventListener("click", this.accSlid.callbackEdit, true);
        this.accSlid.mySlider.parentElement.addEventListener("touchstart", this.accSlid.callbackEdit, true);
    };
    AccelerometerEdit.prototype.placeElement = function () {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.8 + "px";
        this.accelerometerEditView.cloneContainer.style.top = window.innerHeight / 7 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 8 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 12 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 25 + "px";
    };
    AccelerometerEdit.prototype.storeAccelerometerSliderInfos = function (accSlider) {
        this.originalAxis = Axis[accSlider.axis];
        this.originalAccValue = accSlider.acc;
        this.originalActive = accSlider.isActive;
        this.originalDefaultVal = accSlider.ivalue;
        this.originalDefaultSliderVal = accSlider.mySlider.value;
        if (accSlider.isActive) {
            this.originalSliderStyle = "not-allowed";
        }
        else {
            this.originalSliderStyle = "allowed";
        }
    };
    AccelerometerEdit.prototype.selectDefaultCurve = function (accSlider) {
        switch (accSlider.curve) {
            case Curve.Up:
                this.accelerometerEditView.radioCurve1.checked = true;
                break;
            case Curve.Down:
                this.accelerometerEditView.radioCurve2.checked = true;
                break;
            case Curve.UpDown:
                this.accelerometerEditView.radioCurve3.checked = true;
                break;
            case Curve.DownUp:
                this.accelerometerEditView.radioCurve4.checked = true;
                break;
        }
    };
    AccelerometerEdit.prototype.selectDefaultAxis = function (accSlider) {
        switch (accSlider.axis) {
            case Axis.x:
                this.accelerometerEditView.radioAxisX.checked = true;
                break;
            case Axis.y:
                this.accelerometerEditView.radioAxisY.checked = true;
                break;
            case Axis.z:
                this.accelerometerEditView.radioAxisZ.checked = true;
                break;
        }
    };
    AccelerometerEdit.prototype.applyRangeMinValues = function (accSlider) {
        this.accelerometerEditView.rangeMin.min = "-20";
        this.accelerometerEditView.rangeMin.max = "20";
        this.accelerometerEditView.rangeMin.step = "0.1";
        this.accelerometerEditView.rangeMin.value = String(accSlider.amin);
    };
    AccelerometerEdit.prototype.applyRangeMidValues = function (accSlider) {
        this.accelerometerEditView.rangeMid.min = "-20";
        this.accelerometerEditView.rangeMid.max = "20";
        this.accelerometerEditView.rangeMid.step = "0.1";
        this.accelerometerEditView.rangeMid.value = String(accSlider.amid);
    };
    AccelerometerEdit.prototype.applyRangeMaxValues = function (accSlider) {
        this.accelerometerEditView.rangeMax.min = "-20";
        this.accelerometerEditView.rangeMax.max = "20";
        this.accelerometerEditView.rangeMax.step = "0.1";
        this.accelerometerEditView.rangeMax.value = String(accSlider.amax);
    };
    AccelerometerEdit.prototype.applyRangeVirtualValues = function (accSlider) {
        this.accelerometerEditView.rangeVirtual.min = "-20";
        this.accelerometerEditView.rangeVirtual.max = "20";
        this.accelerometerEditView.rangeVirtual.value = "0";
        this.accelerometerEditView.rangeVirtual.step = "0.1";
    };
    AccelerometerEdit.prototype.createCurrentControler = function (accSlider) {
        var controler = new Controler();
        controler.acc = accSlider.acc;
        controler.address = accSlider.label;
        controler.min = accSlider.min.toString();
        controler.max = accSlider.max.toString();
        controler.init = accSlider.ivalue.toString();
        controler.step = accSlider.step.toString();
        controler.slider = this.accelerometerEditView.rangeCurrent;
        controler.precision = accSlider.precision.toString();
        this.controler = controler;
    };
    AccelerometerEdit.prototype.applyRangeCurrentValues = function (accSlider) {
        this.accelerometerEditView.rangeCurrent.min = "-20";
        this.accelerometerEditView.rangeCurrent.max = "20";
        this.accelerometerEditView.rangeCurrent.value = "0";
        this.accelerometerEditView.rangeCurrent.step = "0.1";
        var accCurrentVal = AccelerometerHandler.registerAcceleratedSlider(this.controler, null);
        accCurrentVal.mySlider = this.accelerometerEditView.rangeCurrent;
        accCurrentVal.mySlider.parentElement.classList.add(Axis[accCurrentVal.axis]);
        accCurrentVal.isActive = true;
    };
    AccelerometerEdit.prototype.removeRangeCurrentValueFromMotionEvent = function () {
        AccelerometerHandler.sliderEdit.mySlider.parentElement.className = "";
        AccelerometerHandler.sliderEdit = null;
    };
    AccelerometerEdit.prototype.radioAxisSplit = function (event) {
        console.log("change");
        var radio = event.target;
        if (radio.id == "radioX") {
            this.editAxis(Axis.x);
        }
        else if (radio.id == "radioY") {
            this.editAxis(Axis.y);
        }
        else if (radio.id == "radioZ") {
            this.editAxis(Axis.z);
        }
    };
    AccelerometerEdit.prototype.radioCurveSplit = function (event) {
        console.log("change");
        var radio = event.target;
        if (radio.id == "radio1") {
            this.editCurve(Curve.Up);
        }
        else if (radio.id == "radio2") {
            this.editCurve(Curve.Down);
        }
        else if (radio.id == "radio3") {
            this.editCurve(Curve.UpDown);
        }
        else if (radio.id == "radio4") {
            this.editCurve(Curve.DownUp);
        }
    };
    AccelerometerEdit.prototype.editAxis = function (axe) {
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove(Axis[this.accSlid.axis]);
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add(Axis[axe]);
        this.accSlid.axis = axe;
        var editAcc = AccelerometerHandler.sliderEdit;
        editAcc.axis = axe;
        editAcc.mySlider.parentElement.className = "";
        editAcc.mySlider.parentElement.classList.add(Axis[editAcc.axis]);
    };
    AccelerometerEdit.prototype.editCurve = function (curve) {
        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.sliderEdit;
        editAcc.curve = curve;
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.applyValuetoFaust();
    };
    AccelerometerEdit.prototype.accelerometerEventSwitch = function (event) {
        this.accelerometerSwitch(this.accelerometerEditView.checkeOnOff.checked);
    };
    AccelerometerEdit.prototype.accelerometerSwitch = function (isSliderActive) {
        if (isSliderActive) {
            this.accSlid.isActive = isSliderActive;
            this.sliderStyle = "not-allowed";
        }
        else {
            this.sliderStyle = "allowed";
            this.accSlid.isActive = isSliderActive;
        }
    };
    AccelerometerEdit.prototype.virtualAccelerometer = function (event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false;
            this.accelerometerSwitch(false);
            this.accSlid.isActive = false;
        }
        //if (AccelerometerHandler.sliderEdit != null) {
        //    AccelerometerHandler.sliderEdit = null;
        //};
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        this.applyValuetoFaust();
    };
    AccelerometerEdit.prototype.accMin = function () {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
        this.applyValuetoFaust();
    };
    AccelerometerEdit.prototype.accMid = function () {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
        this.applyValuetoFaust();
    };
    AccelerometerEdit.prototype.accMax = function () {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
        this.applyValuetoFaust();
    };
    AccelerometerEdit.prototype.applyValuetoFaust = function () {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        App.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, App.accHandler.applyNewValueToModule);
    };
    return AccelerometerEdit;
})();
//# sourceMappingURL=AccelerometerEdit.js.map