//AccelerometerEdit
"use strict";


class AccelerometerEdit {
    accelerometerEditView: AccelerometerEditView;
    isOn: boolean = false
    accSlid: AccelerometerSlider;
    controler: Controler;
    originalSlider: HTMLInputElement;
    originalSliderStyle: string;
    originalValueOutput: HTMLElement;
    originalAccValue: string;
    originalAxis: string;
    originalActive: boolean;
    originalDefaultVal: number;
    originalDefaultSliderVal: string;
    sliderStyle: string;
    currentParentElemSliderClone: HTMLElement
    windowResizeEvent: any;
    eventEditHandler: (event: Event, accSlide: AccelerometerSlider) => void;


    constructor(accelerometerEditView: AccelerometerEditView) {
        this.accelerometerEditView = accelerometerEditView
        this.eventEditHandler = (event: Event, accelerometer: AccelerometerSlider) => { this.editEvent(accelerometer, event) };
        this.accelerometerEditView.cancelButton.addEventListener("click", () => { this.cancelAccelerometerEdit() });
        this.accelerometerEditView.validButton.addEventListener("click", () => { this.applyAccelerometerEdit() });
        this.accelerometerEditView.radioAxisX.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioAxisY.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioCurve1.addEventListener("change", (event) => { this.radioCurveSplit(event) });
        this.accelerometerEditView.radioCurve2.addEventListener("change", (event) => { this.radioCurveSplit(event) });
        this.accelerometerEditView.radioCurve3.addEventListener("change", (event) => { this.radioCurveSplit(event) });
        this.accelerometerEditView.radioCurve4.addEventListener("change", (event) => { this.radioCurveSplit(event) });
        this.accelerometerEditView.checkeOnOff.addEventListener("change", (event) => { this.accelerometerEventSwitch(event) });
        this.accelerometerEditView.rangeVirtual.addEventListener("input", (event) => { this.virtualAccelerometer(event) });
        this.accelerometerEditView.rangeMin.addEventListener("input", (event) => { this.accMin() });
        this.accelerometerEditView.rangeMid.addEventListener("input", (event) => { this.accMid() });
        this.accelerometerEditView.rangeMax.addEventListener("input", (event) => { this.accMax() });

    }

    editAction(scene: Scene) {
        if (this.isOn) {

            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i]
                currentAccSlide.mySlider.parentElement.removeEventListener("click", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.removeEventListener("touchstart", currentAccSlide.callbackEdit, true);
                currentAccSlide.mySlider.parentElement.classList.remove('editControl');
                currentAccSlide.mySlider.classList.remove('edit');
                this.setSliderDisableValue(currentAccSlide);


            }
            this.isOn = false;
            App.isAccelerometerEditOn = false;
        } else {
            for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentAccSlide = AccelerometerHandler.accelerometerSliders[i]
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
    }
    setSliderDisableValue(slider: AccelerometerSlider) {
        if (slider.isActive) {
            slider.mySlider.disabled = true;
        } else {
            slider.mySlider.disabled = false;
        }
    }
    editEvent(accSlider: AccelerometerSlider,event: Event):any {
        event.stopPropagation();
        event.preventDefault();

        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent )
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

        


        
    }
    addCloneSlider(accSlider: AccelerometerSlider) {

        this.originalSlider = accSlider.mySlider;
        this.originalValueOutput = accSlider.valueOutput;
        this.currentParentElemSliderClone = <HTMLElement>accSlider.mySlider.parentElement.cloneNode(true);
        var title = accSlider.module.moduleView.fModuleContainer.getElementsByTagName("h6")[0].cloneNode(true);
        this.accelerometerEditView.container.insertBefore(title, this.accelerometerEditView.radioCurveContainer);
        this.accelerometerEditView.cloneContainer.appendChild(this.currentParentElemSliderClone);
        accSlider.mySlider = this.currentParentElemSliderClone.getElementsByTagName("input")[0];
        accSlider.valueOutput = <HTMLElement>this.currentParentElemSliderClone.getElementsByClassName("value")[0];
        this.accelerometerSwitch(this.accSlid.isActive)

    }
    removeCloneSlider(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0])
        accSlider.mySlider = this.originalSlider;
        accSlider.valueOutput = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove()
    }
    cancelAccelerometerEdit() {
        this.accSlid.setAttributes(this.originalAccValue);
        this.accSlid.ivalue = this.originalDefaultVal;
        this.accSlid.module.moduleFaust.fDSP.setValue(this.accSlid.label, this.accSlid.ivalue.toString())
        this.accSlid.mySlider.value = this.originalDefaultSliderVal;
        window.removeEventListener("resize", this.windowResizeEvent)
        this.accelerometerEditView.rangeContainer.className = "";
        this.accelerometerSwitch(this.originalActive);
        this.accSlid.valueOutput.textContent = this.accSlid.ivalue.toString();
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.removeCloneSlider(this.accSlid);


    }
    applyAccelerometerEdit() {
        this.removeCloneSlider(this.accSlid);
        this.accSlid.mySlider.parentElement.classList.remove(this.originalAxis);
        this.accSlid.mySlider.parentElement.classList.add(Axis[this.accSlid.axis]);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.accSlid.acc =  this.accSlid.axis + " " + this.accSlid.curve + " " + this.accSlid.amin + " " + this.accSlid.amid + " " + this.accSlid.amax ;
        window.removeEventListener("resize", this.windowResizeEvent);
        this.accelerometerEditView.rangeContainer.className = "";
        this.accSlid.mySlider.classList.remove(this.originalSliderStyle);
        this.accSlid.mySlider.classList.add(this.sliderStyle);
        this.accSlid.mySlider.parentElement.removeEventListener("click", this.accSlid.callbackEdit, true);
        this.accSlid.mySlider.parentElement.removeEventListener("touchstart", this.accSlid.callbackEdit, true);
        this.accSlid.callbackEdit = this.editEvent.bind(this, this.accSlid);
        this.accSlid.mySlider.parentElement.addEventListener("click", this.accSlid.callbackEdit, true);
        this.accSlid.mySlider.parentElement.addEventListener("touchstart", this.accSlid.callbackEdit, true);
        if (this.originalAccValue != this.accSlid.acc) {
            var newCodeFaust: CodeFaustParser = new CodeFaustParser(this.accSlid.module.moduleFaust.fSource, this.accSlid.name, this.accSlid.acc);
            this.accSlid.module.moduleFaust.fSource=newCodeFaust.replaceAccValue();
        }


    }
    placeElement() {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.8 + "px";
        this.accelerometerEditView.cloneContainer.style.top = window.innerHeight / 7 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 8 + "px"
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 12 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 25 + "px";
    }
    storeAccelerometerSliderInfos(accSlider: AccelerometerSlider) {
        this.originalAxis = Axis[accSlider.axis];
        this.originalAccValue = accSlider.acc;
        this.originalActive = accSlider.isActive;
        this.originalDefaultVal = accSlider.ivalue;
        this.originalDefaultSliderVal = accSlider.mySlider.value;
        if (accSlider.isActive) {
            this.originalSliderStyle = "not-allowed";
        } else {
            this.originalSliderStyle = "allowed";
        }
    }
    selectDefaultCurve(accSlider: AccelerometerSlider) {
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
    } 
    selectDefaultAxis(accSlider: AccelerometerSlider) {
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
    }
    applyRangeMinValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMin.min = "-20";
        this.accelerometerEditView.rangeMin.max = "20";
        this.accelerometerEditView.rangeMin.step = "0.1";
        this.accelerometerEditView.rangeMin.value = String(accSlider.amin);
    }
    applyRangeMidValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMid.min = "-20";
        this.accelerometerEditView.rangeMid.max = "20";
        this.accelerometerEditView.rangeMid.step = "0.1";
        this.accelerometerEditView.rangeMid.value = String(accSlider.amid);
    }
    applyRangeMaxValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMax.min = "-20";
        this.accelerometerEditView.rangeMax.max = "20";
        this.accelerometerEditView.rangeMax.step = "0.1";
        this.accelerometerEditView.rangeMax.value = String(accSlider.amax);
    }
    applyRangeVirtualValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeVirtual.min = "-20";
        this.accelerometerEditView.rangeVirtual.max = "20";
        this.accelerometerEditView.rangeVirtual.value = "0";
        this.accelerometerEditView.rangeVirtual.step = "0.1";
    }
    createCurrentControler(accSlider: AccelerometerSlider) {
        var controler: Controler = new Controler();
        controler.acc = accSlider.acc;
        controler.address = accSlider.label;
        controler.min = accSlider.min.toString();
        controler.max = accSlider.max.toString();
        controler.init = accSlider.ivalue.toString();
        controler.step = accSlider.step.toString();
        controler.slider = this.accelerometerEditView.rangeCurrent;
        controler.precision = accSlider.precision.toString();
        this.controler = controler

    }
    applyRangeCurrentValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeCurrent.min = "-20";
        this.accelerometerEditView.rangeCurrent.max = "20";
        this.accelerometerEditView.rangeCurrent.value = "0";
        this.accelerometerEditView.rangeCurrent.step = "0.1";

        var accCurrentVal = AccelerometerHandler.registerAcceleratedSlider(this.controler, null);
        accCurrentVal.mySlider = this.accelerometerEditView.rangeCurrent;
        accCurrentVal.mySlider.parentElement.classList.add(Axis[accCurrentVal.axis])
        accCurrentVal.isActive = true;
    }
    removeRangeCurrentValueFromMotionEvent() {
        AccelerometerHandler.sliderEdit.mySlider.parentElement.className = "";
        AccelerometerHandler.sliderEdit = null;

    }
    radioAxisSplit(event: Event) {
        console.log("change")
        var radio = <HTMLElement>event.target;
        if (radio.id == "radioX") {
            this.editAxis(Axis.x)
        } else if (radio.id == "radioY") {
            this.editAxis(Axis.y)
        } else if (radio.id == "radioZ") {
            this.editAxis(Axis.z)
        }
    }
    radioCurveSplit(event: Event) {
        console.log("change")
        var radio = <HTMLElement>event.target;
        if (radio.id == "radio1") {
            this.editCurve(Curve.Up)
        } else if (radio.id == "radio2") {
            this.editCurve(Curve.Down)
        } else if (radio.id == "radio3") {
            this.editCurve(Curve.UpDown)
        } else if (radio.id == "radio4") {
            this.editCurve(Curve.DownUp)
        }
    }
    editAxis(axe: Axis) {
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove(Axis[this.accSlid.axis]);
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add(Axis[axe]);
        this.accSlid.axis = axe;
        var editAcc = AccelerometerHandler.sliderEdit;
        editAcc.axis = axe;
        editAcc.mySlider.parentElement.className = "";
        editAcc.mySlider.parentElement.classList.add(Axis[editAcc.axis]);
        
    }
    editCurve(curve: Curve) {

        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.sliderEdit;
        editAcc.curve = curve;
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.applyValuetoFaust();
    }

    accelerometerEventSwitch(event: Event) {
        this.accelerometerSwitch(this.accelerometerEditView.checkeOnOff.checked);

    }

    accelerometerSwitch(isSliderActive: boolean) {
        if (isSliderActive) {
            this.accSlid.isActive = isSliderActive
            this.sliderStyle = "not-allowed";
        } else {
            this.sliderStyle = "allowed";
            this.accSlid.isActive = isSliderActive
        }
    }
    virtualAccelerometer(event: Event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false
            this.accelerometerSwitch(false);
            this.accSlid.isActive = false;
        }
        //if (AccelerometerHandler.sliderEdit != null) {
        //    AccelerometerHandler.sliderEdit = null;
        //};

        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        this.applyValuetoFaust();

    }
    accMin() {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max)
        this.applyValuetoFaust();

    }
    accMid() {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max)
        this.applyValuetoFaust();

    }
    accMax() {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.ivalue, this.accSlid.max)
        this.applyValuetoFaust();

    }

    applyValuetoFaust() {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        App.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, App.accHandler.applyNewValueToModule)
    }
}