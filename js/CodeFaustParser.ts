//class CodeFaustParser

class CodeFaustParser {
    originalCodeFaust: string;
    newCodeFaust: string;
    codeFaustArray: string[];
    sliderName: string;
    newAccValue: string;
    indexSlider: number;
    indexAccelerometer: number;

    constructor(codeFaust: string, sliderName: string, newAccValue: string) {
        this.originalCodeFaust = codeFaust;
        this.codeFaustArray = codeFaust.split("\n");
        this.sliderName = sliderName;
        this.newAccValue = newAccValue;
    }

    replaceAccValue():string {
        this.indexSlider = this.findSliderIndex(this.sliderName)
        if (this.indexSlider == null) {
            this.indexSlider = this.findSliderIndexNoSpace(this.sliderName)
            if (this.indexSlider != null) {
                return this.continueReplaceAccValue()
            } else {
                alert("Slider : " + this.sliderName + " non trouvé, les changements sur ce slider ne seront pas exporté dans l'application finale")
                throw new Error("Slider non trouvé");
                return this.originalCodeFaust;
            }
        } else if (this.indexSlider != null) {
            return this.continueReplaceAccValue()
        }
    }

    private continueReplaceAccValue(): string {
        this.indexAccelerometer = this.findAccRank()
        if (this.indexAccelerometer != -1) {
            this.removeOldAccValue();
            this.addNewAccValue();
            return this.recomposeCodeFaust();
        } else {
            alert("Accelerometer non trouvé")
            throw new Error("Accelerometer non trouvé");
            return this.originalCodeFaust;
        }
    }
    private findSliderIndex(sliderName: string):number {
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            if (this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("acc") != -1) {
                
                return i
            }
        }
        return null
    }
    private findSliderIndexNoSpace(sliderName: string): number {
        sliderName = App.replaceAll(sliderName, " ", "");
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            var tempRowWithoutSpace = App.replaceAll( this.codeFaustArray[i]," ", "");
            if (tempRowWithoutSpace.indexOf(sliderName) != -1 && tempRowWithoutSpace.indexOf("acc") != -1) {

                return i
            }
        }
        return null
    }

    private findAccRank(): number {
        if (this.codeFaustArray[this.indexSlider].indexOf("[acc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[acc:");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[ acc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ acc:");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[acc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[acc :");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[ acc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ acc :");
        } else {
            return -1;
        }
    }

    private removeOldAccValue(): void {
        var counter=0
        while (this.codeFaustArray[this.indexSlider].charAt(this.indexAccelerometer)!=":"&&counter<8) {
            this.indexAccelerometer++;
            counter++;
        }
        this.indexAccelerometer++;
        if (counter >= 8) {
            throw new Error("couldNotRemoveOldAcc");
        } else {
            var stringSlider = this.codeFaustArray[this.indexSlider];
            while (stringSlider.charAt(this.indexAccelerometer) != "]"){
                stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
            }
            this.codeFaustArray[this.indexSlider] = stringSlider;
        }

    }

    private addNewAccValue() {
        var stringSlider = this.codeFaustArray[this.indexSlider];
        stringSlider = stringSlider.slice(0, this.indexAccelerometer) + this.newAccValue + stringSlider.slice(this.indexAccelerometer);
        this.codeFaustArray[this.indexSlider] = stringSlider;
    }

    private recomposeCodeFaust(): string {
        this.newCodeFaust = "";
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            this.newCodeFaust += this.codeFaustArray[i] + "\n";
        }
        console.log(this.newCodeFaust)
        return this.newCodeFaust
    }
}