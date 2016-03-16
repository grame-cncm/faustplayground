//Accelerometer Class
interface Window {
    DeviceMotionEvent: DeviceMotionEvent
}

enum Axis { x, y, z };
enum Curve { Up, Down, UpDown, DownUp };

class AccelerometerSlider {
    axis: Axis;
    curve: Curve;
    amin: number;
    amid: number;
    amax: number;
    min: number;
    ivalue: number;
    max: number;
    step: number;
    module: ModuleClass;
    label: string;
    precision: number;
    converter: UpdatableValueConverter;
    isActive: boolean;
    mySlider: HTMLInputElement
    valueOutput: HTMLElement
    acc: string;
    callbackEdit: any;

    constructor(controler: Controler) {
        if (controler != null) {
            this.acc = controler.acc;
            this.setAttributes(controler.acc);
            this.label = controler.address;
            this.min = parseFloat(controler.min);
            this.max = parseFloat(controler.max);
            this.ivalue = parseFloat(controler.init);
            this.step = parseFloat(controler.step);
            this.mySlider = controler.slider;
            this.valueOutput = controler.output;
            this.isActive = App.isAccelerometerOn;
            this.precision = parseFloat(controler.precision);
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
}

class AccelerometerHandler {
    static accelerometerSliders: AccelerometerSlider[] = [];
    static sliderEdit: AccelerometerSlider=null;

    // get Accelerometer value

    getAccelerometerValue() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", (event: DeviceMotionEvent) => { this.propagate(event) }, false);
        } else {
            // Browser doesn't support DeviceMotionEvent
            console.log("Browser doesn't support DeviceMotionEvent")
        }
    }


    // propagate the new x, y, z value of the accelerometer to the regisred object
    propagate(event: DeviceMotionEvent) {
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        var z = event.accelerationIncludingGravity.z;
        for (var i = 0; i < AccelerometerHandler.accelerometerSliders.length; i++) {
            if (AccelerometerHandler.accelerometerSliders[i].isActive) {
                this.axisSplitter(AccelerometerHandler.accelerometerSliders[i], x, y, z, this.applyNewValueToModule)
            }
        }
        if (AccelerometerHandler.sliderEdit != null) {
            this.axisSplitter(AccelerometerHandler.sliderEdit, x, y, z, this.applyValueToEdit)
        }
    }
    //static registerAcceleratedSlider(fMetaAcc: string, module: ModuleClass, label: string, min: number, ivalue: number, max: number, step: number, slider: HTMLInputElement, valueOutput: HTMLElement, precision: number): AccelerometerSlider {
    static registerAcceleratedSlider(controler: Controler, module: ModuleClass): AccelerometerSlider {
        
            var accelerometerSlide: AccelerometerSlider = new AccelerometerSlider(controler);
            accelerometerSlide.module = module;
            AccelerometerHandler.curveSplitter(accelerometerSlide)
            if (module != null) {
                AccelerometerHandler.accelerometerSliders.push(accelerometerSlide);
            } else {
                AccelerometerHandler.sliderEdit = accelerometerSlide;
            }
            accelerometerSlide.mySlider.parentElement.classList.add(Axis[accelerometerSlide.axis])
            return accelerometerSlide;

    }


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

    applyNewValueToModule(accSlid: AccelerometerSlider, newVal: number, axeValue: number) {

        accSlid.module.moduleFaust.fDSP.setValue(accSlid.label, String(newVal));
        accSlid.mySlider.value = String((newVal - accSlid.min) / accSlid.step)
        accSlid.valueOutput.textContent = String(newVal.toFixed(accSlid.precision));

    }
    applyValueToEdit(accSlid: AccelerometerSlider, newVal: number, axeValue: number) {
        accSlid.mySlider.value = axeValue.toString();
    }

    static curveSplitter(accelerometerSlide: AccelerometerSlider) {
        switch (accelerometerSlide.curve) {
            case Curve.Up:
                accelerometerSlide.converter = new AccUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.ivalue, accelerometerSlide.max)
                break;
            case Curve.Down:
                accelerometerSlide.converter = new AccDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.ivalue, accelerometerSlide.max)
                break;
            case Curve.UpDown:
                accelerometerSlide.converter = new AccUpDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.ivalue, accelerometerSlide.max)
                break;
            case Curve.DownUp:
                accelerometerSlide.converter = new AccDownUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.ivalue, accelerometerSlide.max)
                break;
        }
    }
}



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
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, init, min);
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
