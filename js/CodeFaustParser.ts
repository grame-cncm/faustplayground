/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>

//class CodeFaustParser


interface ElementCodeFaustParser {
    sliderName: string,
    newAccValue: string,
    isEnabled: boolean
}

class CodeFaustParser {
    originalCodeFaust: string;
    newCodeFaust: string;
    codeFaustArray: string[];
    sliderName: string;
    newAccValue: string;
    indexSlider: number;
    indexAccelerometer: number;
    isEnabled: boolean

    constructor(codeFaust: string, sliderName: string, newAccValue: string, isEnabled: boolean) {
        this.originalCodeFaust = codeFaust;
        this.codeFaustArray = codeFaust.split("\n");
        this.sliderName = sliderName;
        this.newAccValue = newAccValue;
        this.isEnabled = isEnabled
    }

    replaceAccValue():string {
        this.indexSlider = this.findSliderIndex(this.sliderName)
        if (this.indexSlider == null) {
            this.indexSlider = this.findSliderIndexNoSpace(this.sliderName)
            if (this.indexSlider != null) {
                return this.tryReplaceAccValue()
            } else {
                new Message(this.sliderName + Utilitary.messageRessource.errorAccSliderNotFound)
                //throw new Error("Slider non trouvé");
                return this.originalCodeFaust;
            }
        } else if (this.indexSlider != null) {
            return this.tryReplaceAccValue()
        }
    }

    private tryReplaceAccValue(): string {
        this.indexAccelerometer = this.findAccRank()
        if (this.indexAccelerometer != -1) {
            this.removeOldAccValue("acc");
            this.addNewAccValue();
            return this.recomposeCodeFaust();
        } else {
            return this.tryReplaceNoAccValue();
        }
    }

    private tryReplaceNoAccValue(): string {
        this.indexAccelerometer = this.findNoAccRank()
        if (this.indexAccelerometer != -1) {
            this.removeOldAccValue("noacc");
            this.addNewAccValue();
            return this.recomposeCodeFaust();
        } else {
            return this.tryReplaceValue();
        }
    }

    private tryReplaceValue(): string {
        this.indexAccelerometer = this.codeFaustArray[this.indexSlider].indexOf(this.sliderName) + this.sliderName.length;
        this.addNewAccValue();
        return this.recomposeCodeFaust();
    }
    private findSliderIndex(sliderName: string):number {
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            if (this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("vslider") != -1 || this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("hslider") != -1) {
                return i
            }
        }
        return null
    }
    private findSliderIndexNoSpace(sliderName: string): number {
        sliderName =Utilitary.replaceAll(sliderName, " ", "");
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            var tempRowWithoutSpace =Utilitary.replaceAll( this.codeFaustArray[i]," ", "");
            if (tempRowWithoutSpace.indexOf(sliderName) != -1 && tempRowWithoutSpace.indexOf("vslider") != -1 || tempRowWithoutSpace.indexOf(sliderName) != -1 && tempRowWithoutSpace.indexOf("hslider") != -1) {

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

    private findNoAccRank(): number {
        if (this.codeFaustArray[this.indexSlider].indexOf("[noacc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[noacc:");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[ noacc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ noacc:");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[noacc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[noacc :");
        } else if (this.codeFaustArray[this.indexSlider].indexOf("[ noacc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ noacc :");
        } else {
            return -1;
        }
    }


    private removeOldAccValue(acc: string): void {
        var counter=0
        //while (this.codeFaustArray[this.indexSlider].charAt(this.indexAccelerometer)!="["&&counter<2) {
        //    this.indexAccelerometer++;
        //    counter++;
        //}
        //this.indexAccelerometer++;
        //if (counter >= 2) {
        //    throw new Error("couldNotRemoveOldAcc");
        //} else {
            var stringSlider = this.codeFaustArray[this.indexSlider];
            while (stringSlider.charAt(this.indexAccelerometer) != "]"){
                stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
            }
            stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
            this.codeFaustArray[this.indexSlider] = stringSlider;
        //}

    }

    private addNewAccValue() {
        var accType: string;
        if (this.isEnabled) {
            accType="[acc:"
        } else {
            accType="[noacc:"
        }
        var stringSlider = this.codeFaustArray[this.indexSlider];
        stringSlider = stringSlider.slice(0, this.indexAccelerometer) + accType + this.newAccValue +"]"+ stringSlider.slice(this.indexAccelerometer);
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