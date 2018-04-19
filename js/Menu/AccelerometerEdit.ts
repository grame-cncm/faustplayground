//AccelerometerEdit
   /// <reference path="../Accelerometer.ts"/>
   /// <reference path="AccelerometerEditView.ts"/>

class AccelerometerEdit {
    accelerometerEditView: AccelerometerEditView;
    isOn: boolean = false
    //faustInterfaceControler, accelerometerSlider,FaustInterfaceView being edited
    faustIControler: FaustInterfaceControler;
    accSlid: AccelerometerSlider;
    faustView: FaustInterfaceView;
    accParams: AccParams;
    //original values stored in case of canceling
    originalSlider: HTMLInputElement;
    originalSliderAllowedStyle: string;
    originalValueOutput: HTMLElement;
    originalAccValue: string;
    originalAxis: string;
    originalActive: boolean;
    originalEnabled: boolean;
    originalDefaultVal: number;
    originalDefaultSliderVal: string;
    //slider class name to style properly the slider
    sliderAllowedStyle: string;
    currentParentElemSliderClone: HTMLElement
    //event handler function for placing element in edit mode
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
    //function used when starting or stoping editing mode
    //setting sider with event to edit it
    editAction() {
        if (this.isOn) {
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var currentIFControler = AccelerometerHandler.faustInterfaceControler[i]
                if (currentIFControler.faustInterfaceView.group) {
                    currentIFControler.faustInterfaceView.group.removeEventListener("click", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.removeEventListener("touchstart", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.classList.remove('editControl');
                    currentIFControler.faustInterfaceView.slider.classList.remove('edit');
                }
                this.setSliderDisableValue(currentIFControler);
            }
            this.isOn = false;
            Utilitary.isAccelerometerEditOn = false;
        } else {
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
               var currentIFControler = AccelerometerHandler.faustInterfaceControler[i]
                if (currentIFControler.faustInterfaceView.group) {
                    currentIFControler.callbackEdit = this.editEvent.bind(this, currentIFControler);
                    currentIFControler.faustInterfaceView.group.addEventListener("click", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.addEventListener("touchstart", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.classList.add('editControl');
                    currentIFControler.faustInterfaceView.slider.classList.add('edit');
                    currentIFControler.faustInterfaceView.slider.disabled = true;
                }
            }
            this.isOn = true;
            Utilitary.isAccelerometerEditOn = true;
        }

    }
    //set the slider to disable or enable according to acc isActive and isDisable
    setSliderDisableValue(faustIControler: FaustInterfaceControler) {
        var acc = faustIControler.accelerometerSlider;
        var slider = faustIControler.faustInterfaceView.slider;
        if (slider) {
            if (acc.isActive && acc.isEnabled) {
                slider.disabled = true;
            } else if (!acc.isActive && acc.isEnabled) {
                slider.disabled = false;
            } else {
                slider.disabled = false;
            }
        }
    }

    //event handler when click/touch slider in edit mode
    editEvent(faustIControler: FaustInterfaceControler, event: Event): any {
        event.stopPropagation();
        event.preventDefault();
        var acc = faustIControler.accelerometerSlider;
        // storing FaustInterfaceControler objects and its values
        this.faustIControler = faustIControler;
        this.accSlid = faustIControler.accelerometerSlider;
        this.faustView = faustIControler.faustInterfaceView;
        this.storeAccelerometerSliderInfos(faustIControler);
        //placing element and attaching an event when resizing window to replace element
        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent)
        this.placeElement();
        //setting the accelerometer controlers
        this.selectDefaultAxis(acc);
        this.selectDefaultCurve(acc);
        this.accelerometerEditView.checkeOnOff.checked = acc.isActive;
        this.applyRangeMinValues(acc);
        this.applyRangeMidValues(acc);
        this.applyRangeMaxValues(acc);
        this.applyRangeVirtualValues(acc);
        this.copyParamsAccSlider(acc);
        this.applyRangeCurrentValues(acc);

        //cloning the slider edited to preview it
        this.addCloneSlider(faustIControler);
        // enable or disable acc
        this.applyAccEnableDisable(acc);
    }

    //cloning the slider edited to preview it
    addCloneSlider(faustIControler: FaustInterfaceControler) {
        var faustView = faustIControler.faustInterfaceView;
        //storing original slider and output element
        this.originalSlider = faustView.slider;
        this.originalValueOutput = faustView.output;
        //cloning and creating elements
        this.currentParentElemSliderClone = <HTMLElement>faustView.group.cloneNode(true);
        var title = document.createElement("h6");
        title.textContent = faustIControler.name;
        this.accelerometerEditView.container.insertBefore(title, this.accelerometerEditView.radioCurveContainer);
        this.accelerometerEditView.cloneContainer.appendChild(this.currentParentElemSliderClone);
        faustView.slider = this.currentParentElemSliderClone.getElementsByTagName("input")[0];
        faustView.output = <HTMLElement>this.currentParentElemSliderClone.getElementsByClassName("value")[0];
        this.accelerometerSwitch(faustIControler.accelerometerSlider.isActive)
    }
    //remove clone/preview slider
    removeCloneSlider(faustIControler: FaustInterfaceControler) {
        var faustView = faustIControler.faustInterfaceView;
        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0])
        faustView.slider = this.originalSlider;
        faustView.output = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove()
    }

    //cancel editing mode, and not applying changes
    cancelAccelerometerEdit() {
        //reset original values
        this.accSlid.setAttributes(this.originalAccValue);
        this.accSlid.init = this.originalDefaultVal;
        this.accSlid.callbackValueChange(this.accSlid.address, this.accSlid.init)
        this.faustIControler.faustInterfaceView.slider.value = this.originalDefaultSliderVal;
        this.accelerometerEditView.rangeContainer.className = "";
        this.accelerometerSwitch(this.originalActive);
        this.faustIControler.faustInterfaceView.output.textContent = this.accSlid.init.toString();
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.removeCloneSlider(this.faustIControler);
        this.accSlid.isEnabled = this.originalEnabled;
        this.applyDisableEnableAcc();
        //hide editing interface
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", this.windowResizeEvent)
    }

    applyAccelerometerEdit() {
        this.removeCloneSlider(this.faustIControler);
        //applying new axis style to slider
        this.faustView.group.classList.remove(this.originalAxis);
        this.faustView.group.classList.add(Axis[this.accSlid.axis]);
        //hide editing interface
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", this.windowResizeEvent);
        //concatanate new acc string value
        this.accSlid.acc = this.accSlid.axis + " " + this.accSlid.curve + " " + this.accSlid.amin + " " + this.accSlid.amid + " " + this.accSlid.amax;
        this.accelerometerEditView.rangeContainer.className = "";
        //applying new allowed style to slider
        this.faustView.slider.classList.remove(this.originalSliderAllowedStyle);
        this.faustView.slider.classList.add(this.sliderAllowedStyle);
        //apply new click and touch event to controler
        this.faustView.group.removeEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.group.removeEventListener("touchstart", this.faustIControler.callbackEdit, true);
        this.faustIControler.callbackEdit = this.editEvent.bind(this, this.faustIControler);
        this.faustView.group.addEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.group.addEventListener("touchstart", this.faustIControler.callbackEdit, true);
        //check if something has change if yes, save values into faust code
        if (this.originalAccValue != this.accSlid.acc || this.originalEnabled != this.accSlid.isEnabled) {
            var detail: ElementCodeFaustParser = { sliderName: this.accSlid.label, newAccValue: this.accSlid.acc, isEnabled: this.accSlid.isEnabled }
            this.faustIControler.updateFaustCodeCallback(detail);
        }
        this.applyDisableEnableAcc();
    }

    //disable or enable slider according to isActive and isEnable
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
    //Place graphical element of the editing view
    placeElement() {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.8 + "px";
        this.accelerometerEditView.cloneContainer.style.top = window.innerHeight / 7 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 8 + "px"
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 12 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 25 + "px";
    }
    //store original values of the controller being edited
    storeAccelerometerSliderInfos(faustIControler: FaustInterfaceControler) {
        var acc = faustIControler.accelerometerSlider;
        this.originalAxis = Axis[acc.axis];
        this.originalAccValue = acc.acc;
        this.originalActive = acc.isActive;
        this.originalEnabled = acc.isEnabled;
        this.originalDefaultVal = acc.init;
        this.originalDefaultSliderVal = faustIControler.faustInterfaceView.slider.value;
        if (acc.isActive) {
            this.originalSliderAllowedStyle = "not-allowed";
        } else {
            this.originalSliderAllowedStyle = "allowed";
        }
    }

    //check or uncheck the checkbox for enabling/disabling the acc on the app
    applyAccEnableDisable(accSlider: AccelerometerSlider) {
        if (accSlider.isEnabled) {
            this.accelerometerEditView.radioAxis0.checked = false;
        } else {
            this.accelerometerEditView.radioAxis0.checked = true;
        }
    }
    //check or uncheck the checkbox for enabling/disabling the acc on the app and faust code
    //applying styling accordingly
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
    //set curve to the good radio button curve
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

    //set axis to the good radio button axis
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
    //set values to the minimum acc range
    applyRangeMinValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMin.min = "-20";
        this.accelerometerEditView.rangeMin.max = "20";
        this.accelerometerEditView.rangeMin.step = "0.1";
        this.accelerometerEditView.rangeMin.value = String(accSlider.amin);
    }

    //set values to the middle acc range
    applyRangeMidValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMid.min = "-20";
        this.accelerometerEditView.rangeMid.max = "20";
        this.accelerometerEditView.rangeMid.step = "0.1";
        this.accelerometerEditView.rangeMid.value = String(accSlider.amid);
    }

    //set values to the maximum acc range
    applyRangeMaxValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeMax.min = "-20";
        this.accelerometerEditView.rangeMax.max = "20";
        this.accelerometerEditView.rangeMax.step = "0.1";
        this.accelerometerEditView.rangeMax.value = String(accSlider.amax);
    }

    //set values to the virtual range
    applyRangeVirtualValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeVirtual.min = "-20";
        this.accelerometerEditView.rangeVirtual.max = "20";
        this.accelerometerEditView.rangeVirtual.value = "0";
        this.accelerometerEditView.rangeVirtual.step = "0.1";
    }

    //set values to the accelerometer range
    //create a faustInterfaceControler and register it to the AccelerometerHandler
    applyRangeCurrentValues(accSlider: AccelerometerSlider) {
        this.accelerometerEditView.rangeCurrent.min = "-20";
        this.accelerometerEditView.rangeCurrent.max = "20";
        this.accelerometerEditView.rangeCurrent.value = "0";
        this.accelerometerEditView.rangeCurrent.step = "0.1";

        this.accParams.isEnabled = accSlider.isEnabled;
        var faustInterfaceControlerEdit = new FaustInterfaceControler(null, null)
        faustInterfaceControlerEdit.faustInterfaceView = new FaustInterfaceView("edit");
        AccelerometerHandler.registerAcceleratedSlider(this.accParams, faustInterfaceControlerEdit, true);
        var acc = faustInterfaceControlerEdit.accelerometerSlider;
        faustInterfaceControlerEdit.faustInterfaceView.slider = this.accelerometerEditView.rangeCurrent;
        faustInterfaceControlerEdit.faustInterfaceView.slider.parentElement.classList.add(Axis[acc.axis])
        acc.isActive = true;

    }
    //copy params of the accSlider
    copyParamsAccSlider(accSlider: AccelerometerSlider) {
        this.accParams = {
            isEnabled: accSlider.isEnabled,
            acc: accSlider.acc,
            address: accSlider.address,
            min: accSlider.min,
            max: accSlider.max,
            init: accSlider.init,
            label: accSlider.label
        }
    }

    // split edited acc axis according the radio axis selection
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

    // split edited acc curve according the radio curve selection
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

    //apply new axis value the the AccelerometerSlider
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

    //apply new curve value the the AccelerometerSlider
    editCurve(curve: Curve) {
        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        editAcc.curve = curve;
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.applyValuetoFaust();
    }

    //event handler to switch isActive
    accelerometerEventSwitch(event: Event) {
        this.accelerometerSwitch(this.accelerometerEditView.checkeOnOff.checked);
    }
    //change isActive of AccelerometerSlider
    accelerometerSwitch(isSliderActive: boolean) {
        if (isSliderActive) {
            this.accSlid.isActive = isSliderActive
            if (this.accSlid.isEnabled) {
                this.sliderAllowedStyle = "not-allowed";
            } else {
                this.sliderAllowedStyle = "allowed";
            }
        } else {
            this.sliderAllowedStyle = "allowed";
            this.accSlid.isActive = isSliderActive
        }
    }
    //apply value of virtual Accelerometer when it's use//
    //disable acc if enabled
    virtualAccelerometer(event: Event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false
            this.accelerometerSwitch(false);
            this.accSlid.isActive = false;
        }
        this.applyValuetoFaust();
    }

    //apply change to AccelerometerSlider from min slider
    accMin() {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();
    }

    //apply change to AccelerometerSlider from mid slider
    accMid() {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();
    }

    //apply change to AccelerometerSlider from max slider
    accMax() {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value)
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max)
        this.applyValuetoFaust();
    }

    //apply values changes to the AccelerometerSlider
    applyValuetoFaust() {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        Utilitary.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, Utilitary.accHandler.applyNewValueToModule)
    }
}
