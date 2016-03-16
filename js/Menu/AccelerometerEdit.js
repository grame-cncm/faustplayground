//AccelerometerEdit
"use strict";
var AccelerometerEdit = (function () {
    function AccelerometerEdit(accelerometerEditView) {
        var _this = this;
        this.isOn = false;
        this.accelerometerEditView = accelerometerEditView;
        this.eventEditHandler = function (event, accelerometer) { _this.editEvent(accelerometer, event); };
        this.accelerometerEditView.cancelButton.addEventListener("click", function () { _this.cancelAccelerometerEdit(); });
        this.accelerometerEditView.radioAxisX.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisY.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioCurve1.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve2.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve3.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve4.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.checkeOnOff.addEventListener("change", function (event) { _this.accelerometerSwitch(event); });
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
            }
            this.isOn = false;
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
            }
            this.isOn = true;
        }
    };
    AccelerometerEdit.prototype.editEvent = function (accSlider, event) {
        event.stopPropagation();
        event.preventDefault();
        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent);
        this.accSlid = accSlider;
        this.placeElement();
        this.selectDefaultAxis(accSlider);
        this.selectDefaultCurve(accSlider);
        this.accelerometerEditView.checkeOnOff.checked = this.accSlid.isActive;
        this.applyRangeMinValues(accSlider);
        this.applyRangeMidValues(accSlider);
        this.applyRangeMaxValues(accSlider);
        this.applyRangeVirtualValues(accSlider);
        this.createCurrentControler(accSlider);
        this.applyRangeCurrentValues(accSlider);
    };
    AccelerometerEdit.prototype.cancelAccelerometerEdit = function () {
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", this.windowResizeEvent);
        this.accelerometerEditView.rangeContainer.className = "";
    };
    AccelerometerEdit.prototype.placeElement = function () {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.6 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 3.5 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 5 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 10 + "px";
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
    };
    AccelerometerEdit.prototype.accelerometerSwitch = function (event) {
        this.accSlid.isActive = this.accelerometerEditView.checkeOnOff.checked;
    };
    AccelerometerEdit.prototype.virtualAccelerometer = function (event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false;
            this.accSlid.isActive = false;
        }
        //if (AccelerometerHandler.sliderEdit != null) {
        //    AccelerometerHandler.sliderEdit = null;
        //};
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        console.log(rangeVal);
        App.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, App.accHandler.applyNewValueToModule);
    };
    AccelerometerEdit.prototype.accMin = function () {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
    };
    AccelerometerEdit.prototype.accMid = function () {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
    };
    AccelerometerEdit.prototype.accMax = function () {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max);
    };
    return AccelerometerEdit;
})();
//# sourceMappingURL=AccelerometerEdit.js.map