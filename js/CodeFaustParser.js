//class CodeFaustParser
var CodeFaustParser = (function () {
    function CodeFaustParser(codeFaust, sliderName, newAccValue) {
        this.originalCodeFaust = codeFaust;
        this.codeFaustArray = codeFaust.split("\n");
        this.sliderName = sliderName;
        this.newAccValue = newAccValue;
    }
    CodeFaustParser.prototype.replaceAccValue = function () {
        this.indexSlider = this.findSliderIndex(this.sliderName);
        if (this.indexSlider == null) {
            this.indexSlider = this.findSliderIndexNoSpace(this.sliderName);
            if (this.indexSlider != null) {
                return this.continueReplaceAccValue();
            }
            else {
                new Message(this.sliderName + App.messageRessource.errorAccSliderNotFound);
                //throw new Error("Slider non trouvé");
                return this.originalCodeFaust;
            }
        }
        else if (this.indexSlider != null) {
            return this.continueReplaceAccValue();
        }
    };
    CodeFaustParser.prototype.continueReplaceAccValue = function () {
        this.indexAccelerometer = this.findAccRank();
        if (this.indexAccelerometer != -1) {
            this.removeOldAccValue();
            this.addNewAccValue();
            return this.recomposeCodeFaust();
        }
        else {
            new Message(App.messageRessource.errorAccelerometerNotFound);
            //throw new Error("Accelerometer non trouvé");
            return this.originalCodeFaust;
        }
    };
    CodeFaustParser.prototype.findSliderIndex = function (sliderName) {
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            if (this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("acc") != -1) {
                return i;
            }
        }
        return null;
    };
    CodeFaustParser.prototype.findSliderIndexNoSpace = function (sliderName) {
        sliderName = App.replaceAll(sliderName, " ", "");
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            var tempRowWithoutSpace = App.replaceAll(this.codeFaustArray[i], " ", "");
            if (tempRowWithoutSpace.indexOf(sliderName) != -1 && tempRowWithoutSpace.indexOf("acc") != -1) {
                return i;
            }
        }
        return null;
    };
    CodeFaustParser.prototype.findAccRank = function () {
        if (this.codeFaustArray[this.indexSlider].indexOf("[acc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[acc:");
        }
        else if (this.codeFaustArray[this.indexSlider].indexOf("[ acc:") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ acc:");
        }
        else if (this.codeFaustArray[this.indexSlider].indexOf("[acc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[acc :");
        }
        else if (this.codeFaustArray[this.indexSlider].indexOf("[ acc :") != -1) {
            return this.codeFaustArray[this.indexSlider].indexOf("[ acc :");
        }
        else {
            return -1;
        }
    };
    CodeFaustParser.prototype.removeOldAccValue = function () {
        var counter = 0;
        while (this.codeFaustArray[this.indexSlider].charAt(this.indexAccelerometer) != ":" && counter < 8) {
            this.indexAccelerometer++;
            counter++;
        }
        this.indexAccelerometer++;
        if (counter >= 8) {
            throw new Error("couldNotRemoveOldAcc");
        }
        else {
            var stringSlider = this.codeFaustArray[this.indexSlider];
            while (stringSlider.charAt(this.indexAccelerometer) != "]") {
                stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
            }
            this.codeFaustArray[this.indexSlider] = stringSlider;
        }
    };
    CodeFaustParser.prototype.addNewAccValue = function () {
        var stringSlider = this.codeFaustArray[this.indexSlider];
        stringSlider = stringSlider.slice(0, this.indexAccelerometer) + this.newAccValue + stringSlider.slice(this.indexAccelerometer);
        this.codeFaustArray[this.indexSlider] = stringSlider;
    };
    CodeFaustParser.prototype.recomposeCodeFaust = function () {
        this.newCodeFaust = "";
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            this.newCodeFaust += this.codeFaustArray[i] + "\n";
        }
        console.log(this.newCodeFaust);
        return this.newCodeFaust;
    };
    return CodeFaustParser;
})();
//# sourceMappingURL=CodeFaustParser.js.map