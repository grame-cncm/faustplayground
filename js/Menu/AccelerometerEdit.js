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
    }
    AccelerometerEdit.prototype.editAction = function (scene) {
        var _this = this;
        if (this.isOn) {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.mySlider.parentElement.removeEventListener("click", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
                currentAccSlide.mySlider.parentElement.removeEventListener("touchstart", function (event) { _this.eventEditHandler(event, currentAccSlide); }, true);
            }
            this.isOn = false;
        }
        else {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i];
                currentAccSlide.mySlider.parentElement.addEventListener("click", this.editEvent.bind(this, currentAccSlide), true);
                currentAccSlide.mySlider.parentElement.addEventListener("touchstart", this.editEvent.bind(this, currentAccSlide), true);
            }
            this.isOn = true;
        }
    };
    AccelerometerEdit.prototype.editEvent = function (accSlider, event) {
        var _this = this;
        event.stopPropagation();
        event.preventDefault();
        window.addEventListener("resize", function () { _this.placeElement(); });
        this.accSlid = accSlider;
        this.placeElement();
        this.accelerometerEditView.radioAxisContainer;
        this.selectDefaultAxis(accSlider);
        this.selectDefaultCurve(accSlider);
        this.applyRange1Values(accSlider);
        this.applyRange2Values(accSlider);
        this.applyRange3Values(accSlider);
        this.applyRangeVirtualValues(accSlider);
        this.createCurrentControler(accSlider);
        this.applyRangeCurrentValues(accSlider);
    };
    AccelerometerEdit.prototype.cancelAccelerometerEdit = function () {
        var _this = this;
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", function () { _this.placeElement(); });
    };
    AccelerometerEdit.prototype.placeElement = function () {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 2 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 4 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 8 + "px";
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
    AccelerometerEdit.prototype.applyRange1Values = function (accSlider) {
        //this.accelerometerEditView.range1.min = String(accSlider.amin);
        //this.accelerometerEditView.range1.max = String(accSlider.amax);
        this.accelerometerEditView.range1.min = "-20";
        this.accelerometerEditView.range1.max = "20";
        this.accelerometerEditView.range1.step = "0.1";
        this.accelerometerEditView.range1.value = String(accSlider.amin);
    };
    AccelerometerEdit.prototype.applyRange2Values = function (accSlider) {
        //this.accelerometerEditView.range2.min = String(accSlider.amin);
        //this.accelerometerEditView.range2.max = String(accSlider.amax);
        this.accelerometerEditView.range2.min = "-20";
        this.accelerometerEditView.range2.max = "20";
        this.accelerometerEditView.range2.step = "0.1";
        this.accelerometerEditView.range2.value = String(accSlider.amax);
    };
    AccelerometerEdit.prototype.applyRange3Values = function (accSlider) {
        //this.accelerometerEditView.range3.min = String(accSlider.amin);
        //this.accelerometerEditView.range3.max = String(accSlider.amax);
        this.accelerometerEditView.range3.min = "-20";
        this.accelerometerEditView.range3.max = "20";
        this.accelerometerEditView.range3.step = "0.1";
        this.accelerometerEditView.range3.value = String(accSlider.amid);
    };
    AccelerometerEdit.prototype.applyRangeVirtualValues = function (accSlider) {
        //this.accelerometerEditView.rangeVirtual.parentElement.classList.add(Axis[accSlider.axis]);
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
    return AccelerometerEdit;
})();
//# sourceMappingURL=AccelerometerEdit.js.map