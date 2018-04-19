//Accelerometer Class

/// <reference path="Utilitary.ts"/>
/// <reference path="Modules/FaustInterface.ts"/>

interface Window {
    DeviceMotionEvent: DeviceMotionEvent
}

enum Axis { x, y, z };
enum Curve { Up, Down, UpDown, DownUp };

//object describing value off accelerometer metadata values.
class AccMeta {
    axis: Axis;
    curve: Curve;
    amin: number;
    amid: number;
    amax: number
}
//Contains the info regarding the mapping of the FaustInterfaceControler and the accelerometer
class AccelerometerSlider {

    name: string;
    axis: Axis;
    curve: Curve;
    //accelerometer Values
    amin: number;
    amid: number;
    amax: number;
    //faust values
    min: number;
    init: number;
    max: number;
    //name of the faustInterfaceControler
    label: string
    //address to the value in the dsp
    address: string;
    //object converter depending on the curve
    converter: UpdatableValueConverter;
    //accelerometer active/inactive only in the app
    isActive: boolean;
    //accelerometer active/inactive in app and faustcode
    isEnabled: boolean;
    acc: string;
    noacc: string;
    noAccObj: AccMeta;
    callbackValueChange: (address: string, value: number) => void

    constructor(accParams: AccParams) {
        if (accParams != null) {
            this.isEnabled = accParams.isEnabled;
            this.acc = accParams.acc;
            this.setAttributes(accParams.acc);
            this.address = accParams.address;
            this.min = accParams.min;
            this.max = accParams.max;
            this.init = accParams.init;
            this.label = accParams.label
            this.isActive = Utilitary.isAccelerometerOn;
        }
    }

    setAttributes(fMetaAcc: string) {
        if (fMetaAcc!=null) {
            var arrayMeta = fMetaAcc.split(" ");
            this.axis = <Axis>parseInt(arrayMeta[0])
            this.curve = <Curve>parseInt(arrayMeta[1]);
            this.amin = parseInt(arrayMeta[2]);
            this.amid = parseInt(arrayMeta[3]);
            this.amax = parseInt(arrayMeta[4]);
        }
    }
    setAttributesDetailed(axis: Axis, curve: Curve, min: number, mid: number, max: number) {
        this.axis = axis;
        this.curve = curve;
        this.amin = min;
        this.amid = mid;
        this.amax = max;
    }
}

//object responsible of storing all accelerometerSlider and propagate to them the accelerometer infos.
class AccelerometerHandler {
    //array containing all the FaustInterfaceControler of the scene
    static faustInterfaceControler: FaustInterfaceControler[] = [];
    //faustInterfaceControler of the AccelerometerEditView
    static faustInterfaceControlerEdit: FaustInterfaceControler|null = null;

    // get Accelerometer value
    getAccelerometerValue() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", (event: DeviceMotionEvent) => { this.propagate(event) }, false);
        } else {
            // Browser doesn't support DeviceMotionEvent
            console.log(Utilitary.messageRessource.noDeviceMotion)
        }
    }

    // propagate the new x, y, z value of the accelerometer to the registred object
    propagate(event: DeviceMotionEvent) {
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        var z = event.accelerationIncludingGravity.z;
        for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
            if (AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider.isActive && AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider.isEnabled) {
                this.axisSplitter(AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider, x, y, z, this.applyNewValueToModule)
            }
        }
        // update the faustInterfaceControler of the AccelerometerEditView
        if (AccelerometerHandler.faustInterfaceControlerEdit != null) {
            this.axisSplitter(AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider, x, y, z, this.applyValueToEdit)
        }
    }

    //create and register accelerometerSlide
    static registerAcceleratedSlider(accParams: AccParams, faustInterfaceControler: FaustInterfaceControler, sliderEdit?: boolean) {
        var accelerometerSlide: AccelerometerSlider = new AccelerometerSlider(accParams);
        faustInterfaceControler.accelerometerSlider = accelerometerSlide;
            AccelerometerHandler.curveSplitter(accelerometerSlide)
            if (sliderEdit) {
                AccelerometerHandler.faustInterfaceControlerEdit = faustInterfaceControler
            } else {
                AccelerometerHandler.faustInterfaceControler.push(faustInterfaceControler);
            }
    }

    //give the good axis value to the accelerometerslider, convert it to the faust value before
    axisSplitter(accelerometerSlide: AccelerometerSlider, x: number, y: number, z: number, callBack: (acc: AccelerometerSlider, val: number, axeValue: number) => void) {

        switch (accelerometerSlide.axis) {
            case Axis.x:
                var newVal = accelerometerSlide.converter.uiToFaust(x);
                callBack(accelerometerSlide, newVal,x)
                break;
            case Axis.y:
                var newVal = accelerometerSlide.converter.uiToFaust(y);
                callBack(accelerometerSlide, newVal,y)
                break;
            case Axis.z:
                var newVal = accelerometerSlide.converter.uiToFaust(z);
                callBack(accelerometerSlide, newVal,z)
                break;
        }
    }
    //update value of the dsp
    applyNewValueToModule(accSlid: AccelerometerSlider, newVal: number, axeValue: number) {
        accSlid.callbackValueChange(accSlid.address, newVal);
    }
    //update value of the edit range in AccelerometerEditView
    applyValueToEdit(accSlid: AccelerometerSlider, newVal: number, axeValue: number) {
        AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView.slider.value = axeValue.toString();
    }

    //Apply the right converter with the right curve to an accelerometerSlider
    static curveSplitter(accelerometerSlide: AccelerometerSlider) {
        switch (accelerometerSlide.curve) {
            case Curve.Up:
                accelerometerSlide.converter = new AccUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max)
                break;
            case Curve.Down:
                accelerometerSlide.converter = new AccDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max)
                break;
            case Curve.UpDown:
                accelerometerSlide.converter = new AccUpDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max)
                break;
            case Curve.DownUp:
                accelerometerSlide.converter = new AccDownUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max)
                break;
            default:
                accelerometerSlide.converter = new AccUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max)
        }
    }
}

/***************************************************************************************
********************  Converter objects use to map acc and faust value *****************
****************************************************************************************/

class MinMaxClip {
    fLo: number;
    fHi: number;

    constructor(x: number, y: number) {
        this.fLo = Math.min(x, y);
        this.fHi = Math.max(x, y);
    }

    clip(x: number): number {
        if (x < this.fLo) {
            return this.fLo
        } else if (x > this.fHi) {
            return this.fHi
        } else {
            return x;
        }
    }
}
interface InterpolateObject {
    amin: number;
    amax: number;
}

class Interpolator {
    range: MinMaxClip;
    fCoef: number;
    fOffset: number;

    constructor(lo: number, hi: number, v1: number, v2: number) {
        this.range = new MinMaxClip(lo, hi);
        if (hi != lo) {
            //regular case
            this.fCoef = (v2 - v1) / (hi - lo);
            this.fOffset = v1 - lo * this.fCoef;
        } else {
            this.fCoef = 0;
            this.fOffset = (v1 + v2) / 2;
        }
    }
    returnMappedValue(v: number):number {
        var x = this.range.clip(v);
        return this.fOffset+x*this.fCoef
    }
    getLowHigh(amin: number, amax: number): InterpolateObject {
        return { amin: this.range.fLo, amax: this.range.fHi}
    }
}
interface InterpolateObject3pt {
    amin: number;
    amid: number;
    amax: number;
}
class Interpolator3pt {
    fSegment1: Interpolator;
    fSegment2: Interpolator;
    fMiddle: number;

    constructor(lo: number, mid: number, hi: number, v1: number, vMid: number, v2: number) {
        this.fSegment1 = new Interpolator(lo, mid, v1, vMid);
        this.fSegment2 = new Interpolator(mid, hi, vMid, v2);
        this.fMiddle = mid;
    }
    returnMappedValue(x: number): number {
        return (x < this.fMiddle) ? this.fSegment1.returnMappedValue(x) : this.fSegment2.returnMappedValue(x)
    }
    getMappingValues(amin: number, amid: number, amax: number): InterpolateObject3pt {
        var lowHighSegment1 = this.fSegment1.getLowHigh(amin, amid);
        var lowHighSegment2 = this.fSegment2.getLowHigh(amid, amax);
        return { amin: lowHighSegment1.amin, amid: lowHighSegment2.amin, amax: lowHighSegment2.amax }
    }
}
interface ValueConverter {
    uiToFaust: (x: number) => number;
    faustToUi: (x: number) => number;
}

interface UpdatableValueConverter extends ValueConverter {
    fActive: boolean;
    setMappingValues: (amin: number, amid: number, amax: number, min: number, init: number, max: number) => void;
    getMappingValues: (amin: number, amid: number, amax: number) => InterpolateObject3pt;
    setActive: (onOff: boolean) => void;
    getActive: () => boolean;
}
class AccUpConverter implements UpdatableValueConverter {
    accToFaust: Interpolator3pt;
    faustToAcc: Interpolator3pt;
    fActive: boolean = true;

    constructor(amin: number, amid: number, amax: number, fmin: number, fmid: number, fmax: number) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmid, fmax);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amin, amid, amax);
    }
    uiToFaust(x: number) { return this.accToFaust.returnMappedValue(x) }
    faustToUi(x: number) { return this.accToFaust.returnMappedValue(x) };
    setMappingValues(amin: number, amid: number, amax: number, min: number, init: number, max: number): void {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, init, max);
        this.faustToAcc = new Interpolator3pt(min, init, max, amin, amid, amax);
    };
    getMappingValues(amin: number, amid: number, amax: number): InterpolateObject3pt {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    setActive(onOff: boolean): void { this.fActive = onOff };
    getActive(): boolean{ return this.fActive };
}

class AccDownConverter implements UpdatableValueConverter {
    accToFaust: Interpolator3pt;
    faustToAcc: Interpolator3pt;
    fActive: boolean = true;

    constructor(amin: number, amid: number, amax: number, fmin: number, fmid: number, fmax: number) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmid, fmin);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amax, amid, amin);
    }
    uiToFaust(x: number) { return this.accToFaust.returnMappedValue(x) }
    faustToUi(x: number) { return this.accToFaust.returnMappedValue(x) };
    setMappingValues(amin: number, amid: number, amax: number, min: number, init: number, max: number): void {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, init, min);
        this.faustToAcc = new Interpolator3pt(min, init, max, amax, amid, amin);
    };
    getMappingValues(amin: number, amid: number, amax: number): InterpolateObject3pt {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    setActive(onOff: boolean): void { this.fActive = onOff };
    getActive(): boolean { return this.fActive };
}

class AccUpDownConverter {
    accToFaust: Interpolator3pt;
    faustToAcc: Interpolator;
    fActive: boolean = true;

    constructor(amin: number, amid: number, amax: number, fmin: number, fmid: number, fmax: number) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmax, fmin);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    uiToFaust(x: number) { return this.accToFaust.returnMappedValue(x) }
    faustToUi(x: number) { return this.accToFaust.returnMappedValue(x) };
    setMappingValues(amin: number, amid: number, amax: number, min: number, init: number, max: number): void {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, max, min);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    };
    getMappingValues(amin: number, amid: number, amax: number): InterpolateObject3pt {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    setActive(onOff: boolean): void { this.fActive = onOff };
    getActive(): boolean { return this.fActive };
}

class AccDownUpConverter {
    accToFaust: Interpolator3pt;
    faustToAcc: Interpolator;
    fActive: boolean = true;

    constructor(amin: number, amid: number, amax: number, fmin: number, fmid: number, fmax: number) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmin, fmax);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    uiToFaust(x: number) { return this.accToFaust.returnMappedValue(x) }
    faustToUi(x: number) { return this.accToFaust.returnMappedValue(x) };
    setMappingValues(amin: number, amid: number, amax: number, min: number, init: number, max: number): void {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, min, max);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    };
    getMappingValues(amin: number, amid: number, amax: number): InterpolateObject3pt {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    setActive(onOff: boolean): void { this.fActive = onOff };
    getActive(): boolean { return this.fActive };
}
