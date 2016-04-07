//AccelerometerEdit
   /// <reference path="../CodeFaustParser.ts"/>

"use strict";


class AccelerometerEdit {
    accelerometerEditView: AccelerometerEditView;
    isOn: boolean = false
    faustIControler: FaustInterfaceControler;
    accSlid: AccelerometerSlider;
    faustView: FaustInterfaceView;
    accParams: AccParams;
    //controler: Controler;
    originalSlider: HTMLInputElement;
    originalSliderStyle: string;
    originalValueOutput: HTMLElement;
    originalAccValue: string;
    originalAxis: string;
    originalActive: boolean;
    originalEnabled: boolean;
    originalDefaultVal: number;
    originalDefaultSliderVal: string;
    sliderStyle: string;
    currentParentElemSliderClone: HTMLElement
    windowResizeEvent: any;
    eventEditHandler: (event: Event, faustIControler: FaustInterfaceControler) => void;


    constructor(accelerometerEditView: AccelerometerEditView) {
        this.accelerometerEditView = accelerometerEditView
        this.eventEditHandler = (event: Event, faustIControler: FaustInterfaceControler) => { this.editEvent(faustIControler, event) };
        this.accelerometerEditView.cancelButton.addEventListener("click", () => { this.cancelAccelerometerEdit() });
        this.accelerometerEditView.validButton.addEventListener("click", () => { this.applyAccelerometerEdit() });
        this.accelerometerEditView.radioAxisX.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioAxisY.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", (event) => { this.radioAxisSplit(event) });
        this.accelerometerEditView.radioAxis0.addEventListener("change", (event) => { this.disablerEnablerAcc(event) });
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

    editAction() {

        if (this.isOn) {
            
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.addEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentIFControler = AccelerometerHandler.faustInterfaceControler[i]
                currentIFControler.faustInterfaceView.group.removeEventListener("click", currentIFControler.callbackEdit, true);
                currentIFControler.faustInterfaceView.group.removeEventListener("touchstart", currentIFControler.callbackEdit, true);
                currentIFControler.faustInterfaceView.group.classList.remove('editControl');
                currentIFControler.faustInterfaceView.slider.classList.remove('edit');
                this.setSliderDisableValue(currentIFControler);


            }
            this.isOn = false;
            App.isAccelerometerEditOn = false;
        } else {
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("mousedown", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchstart", (e) => { e.stopPropagation() })
                //AccelerometerHandler.accelerometerSliders[i].mySlider.removeEventListener("touchmove", (e) => { e.stopPropagation() })
                var currentIFControler = AccelerometerHandler.faustInterfaceControler[i]
                currentIFControler.callbackEdit = this.editEvent.bind(this, currentIFControler);
                currentIFControler.faustInterfaceView.group.addEventListener("click", currentIFControler.callbackEdit, true);
                currentIFControler.faustInterfaceView.group.addEventListener("touchstart", currentIFControler.callbackEdit, true);
                currentIFControler.faustInterfaceView.group.classList.add('editControl');
                currentIFControler.faustInterfaceView.slider.classList.add('edit');
                currentIFControler.faustInterfaceView.slider.disabled = true;

            }
            this.isOn = true;
            App.isAccelerometerEditOn = true;
        }

    }
    setSliderDisableValue(faustIControler: FaustInterfaceControler) {
        var acc = faustIControler.accelerometerSlider;
        var slider = faustIControler.faustInterfaceView.slider;
        if (acc.isActive && acc.isEnabled) {
            slider.disabled = true;
        } else if (!acc.isActive && acc.isEnabled) {
            slider.disabled = false;
        } else {
            slider.disabled = false;
        }
    }


    editEvent(faustIControler: FaustInterfaceControler, event: Event): any {
        event.stopPropagation();
        event.preventDefault();
        var acc = faustIControler.accelerometerSlider;
        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent)
        this.faustIControler = faustIControler;
        this.accSlid = faustIControler.accelerometerSlider;
        this.faustView = faustIControler.faustInterfaceView;
        this.storeAccelerometerSliderInfos(faustIControler);
        this.placeElement();
        //this.accelerometerEditView.labelTitle.textContent = accSlider.label;
        this.selectDefaultAxis(acc);
        this.selectDefaultCurve(acc);
        this.accelerometerEditView.checkeOnOff.checked = acc.isActive;
        this.applyRangeMinValues(acc);
        this.applyRangeMidValues(acc);
        this.applyRangeMaxValues(acc);
        this.applyRangeVirtualValues(acc);
        this.createCurrentControler(acc);
        this.applyRangeCurrentValues(acc);
        this.addCloneSlider(faustIControler);
        this.applyAccEnableDisable(acc);
    }

    addCloneSlider(faustIControler: FaustInterfaceControler) {
        var faustView = faustIControler.faustInterfaceView;
        this.originalSlider = faustView.slider;
        this.originalValueOutput = faustView.output;
        this.currentParentElemSliderClone = <HTMLElement>faustView.group.cloneNode(true);
        var title = document.createElement("h6");
        title.textContent = faustIControler.name;
        this.accelerometerEditView.container.insertBefore(title, this.accelerometerEditView.radioCurveContainer);
        this.accelerometerEditView.cloneContainer.appendChild(this.currentParentElemSliderClone);
        faustView.slider = this.currentParentElemSliderClone.getElementsByTagName("input")[0];
        faustView.output = <HTMLElement>this.currentParentElemSliderClone.getElementsByClassName("value")[0];
        this.accelerometerSwitch(faustIControler.accelerometerSlider.isActive)

    }
    removeCloneSlider(faustIControler: FaustInterfaceControler) {
        var faustView = faustIControler.faustInterfaceView;

        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0])
        faustView.slider = this.originalSlider;
        faustView.output = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove()
    }
    cancelAccelerometerEdit() {
        this.accSlid.setAttributes(this.originalAccValue);
        this.accSlid.init = this.originalDefaultVal;
        this.accSlid.callbackValueChange(this.accSlid.address, this.accSlid.init)
        this.faustIControler.faustInterfaceView.slider.value = this.originalDefaultSliderVal;
        window.removeEventListener("resize", this.windowResizeEvent)
        this.accelerometerEditView.rangeContainer.className = "";
        this.accelerometerSwitch(this.originalActive);
        this.faustIControler.faustInterfaceView.output.textContent = this.accSlid.init.toString();
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.removeCloneSlider(this.faustIControler);
        this.accSlid.isEnabled = this.originalEnabled;


    }
    applyAccelerometerEdit() {
        this.removeCloneSlider(this.faustIControler);
        this.faustView.group.classList.remove(this.originalAxis);
        this.faustView.group.classList.add(Axis[this.accSlid.axis]);
        this.accelerometerEditView.blockLayer.style.display = "none";
        this.accSlid.acc = this.accSlid.axis + " " + this.accSlid.curve + " " + this.accSlid.amin + " " + this.accSlid.amid + " " + this.accSlid.amax;
        window.removeEventListener("resize", this.windowResizeEvent);
        this.accelerometerEditView.rangeContainer.className = "";
        this.faustView.slider.classList.remove(this.originalSliderStyle);
        this.faustView.slider.classList.add(this.sliderStyle);
        this.faustView.slider.parentElement.removeEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.slider.parentElement.removeEventListener("touchstart", this.faustIControler.callbackEdit, true);
        this.faustIControler.callbackEdit = this.editEvent.bind(this, this.accSlid);
        this.faustView.slider.addEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.slider.addEventListener("touchstart", this.faustIControler.callbackEdit, true);
        if (this.originalAccValue != this.accSlid.acc || this.originalEnabled != this.accSlid.isEnabled) {
            var detail: ElementCodeFaustParser = { sliderName: this.accSlid.name, newAccValue: this.accSlid.acc, isEnabled: this.accSlid.isEnabled }
            var event = new CustomEvent("codefaustparser", { detail: detail })
            document.dispatchEvent(event);
        }
        this.applyDisableEnableAcc();



    }

    applyDisableEnableAcc() {

        if (this.accSlid.isEnabled) {
            this.faustView.group.classList.remove("disabledAcc")
            if (this.accSlid.isActive) {
                this.faustView.slider.classList.add("not-allowed");
                this.faustView.slider.classList.remove("allowed");
                this.faustView.slider.disabled = true

                } else {
                this.faustView.slider.classList.remove("not-allowed");
                this.faustView.slider.classList.add("allowed");
                this.faustView.slider.disabled = false
                }
        } else {
            this.faustView.group.classList.add("disabledAcc")
            this.faustView.slider.classList.remove("not-allowed");
            this.faustView.slider.classList.add("allowed");
            this.faustView.slider.disabled = false

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
    storeAccelerometerSliderInfos(faustIControler: FaustInterfaceControler) {
        var acc = faustIControler.accelerometerSlider;

        this.originalAxis = Axis[acc.axis];
        this.originalAccValue = acc.acc;
        this.originalActive = acc.isActive;
        this.originalEnabled = acc.isEnabled;
        this.originalDefaultVal = acc.init;
        this.originalDefaultSliderVal = faustIControler.faustInterfaceView.slider.value;
        if (acc.isActive) {
            this.originalSliderStyle = "not-allowed";
        } else {
            this.originalSliderStyle = "allowed";
        }
    }
    applyAccEnableDisable(accSlider: AccelerometerSlider) {
        if (accSlider.isEnabled) {
            this.accelerometerEditView.radioAxis0.checked = false;
        } else {
            this.accelerometerEditView.radioAxis0.checked = true;
        }
    }
    disablerEnablerAcc(e: Event) {
        if (this.accSlid.isEnabled) {
            this.accSlid.isEnabled = false;
            this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add("disabledAcc");
            this.faustView.group.classList.add("disabledAcc");
            this.accelerometerEditView.rangeContainer.classList.add("disabledAcc");
        } else {
            this.accSlid.isEnabled = true;
            this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove("disabledAcc");
            this.faustView.group.classList.remove("disabledAcc");
            this.accelerometerEditView.rangeContainer.classList.remove("disabledAcc");

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
            default:
                this.accelerometerEditView.radioCurve1.checked = true;
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
        this.accParams = {
            isEnabled: accSlider.isEnabled,
            acc: accSlider.acc,
            address: accSlider.address,
            min : accSlider.min,
            max: accSlider.max,
            init : accSlider.init,
        }

    }
    applyRangeCurrentValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeCurrent.min = "-20";
        this.accelerometerEditView.rangeCurrent.max = "20";
        this.accelerometerEditView.rangeCurrent.value = "0";
        this.accelerometerEditView.rangeCurrent.step = "0.1";

        this.accParams.isEnabled = accSlider.isEnabled;
        var faustInterfaceControlerEdit = new FaustInterfaceControler(null, null)
        faustInterfaceControlerEdit.faustInterfaceView = new FaustInterfaceView("edit");
        AccelerometerHandler.registerAcceleratedSlider(this.accParams, faustInterfaceControlerEdit);
        var acc = faustInterfaceControlerEdit.accelerometerSlider;
        faustInterfaceControlerEdit.faustInterfaceView.slider = this.accelerometerEditView.rangeCurrent;
        faustInterfaceControlerEdit.faustInterfaceView.slider.parentElement.classList.add(Axis[acc.axis])
        acc.isActive = true;

    }
    removeRangeCurrentValueFromMotionEvent() {
        AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView.slider.parentElement.className = "";
        AccelerometerHandler.faustInterfaceControlerEdit = null;

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
        var oldAxis = this.accSlid.axis;
        this.accSlid.axis = axe;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        var faustView = AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView;
        editAcc.axis = axe;
        faustView.slider.parentElement.classList.remove(Axis[oldAxis]);
        faustView.slider.parentElement.classList.add(Axis[editAcc.axis]);
        
    }
    editCurve(curve: Curve) {

        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
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
            if (this.accSlid.isEnabled) {
                this.sliderStyle = "not-allowed";
            } else {
                this.sliderStyle = "allowed";
            }
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
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();

    }
    accMid() {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();

    }
    accMax() {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();

    }

    applyValuetoFaust() {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        App.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, App.accHandler.applyNewValueToModule)
    }
}