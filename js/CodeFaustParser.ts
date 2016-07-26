/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>

//class CodeFaustParser

//interface describing values needed to use CodeFaustParser
interface ElementCodeFaustParser {
    sliderName: string,
    newAccValue: string,
    isEnabled: boolean
}

// YO : ajout d'une fonction pour updater les metadata d'accelerometre d'un slider


// Iterate into faust code to find next path-string.
class PathIterator
{
    fFaustCode  : string;       // Faust code to search
    fStart      : number;       // start position of the current path
    fEnd        : number;       // end position of the current path

    constructor(faustCode:string) {
        console.log("Path Iterator construction with the following Faust code ")
        console.log("-----------");
        console.log(faustCode);
        console.log("-----------");
        
        this.fFaustCode = faustCode;
        this.fStart = 0;
        this.fEnd   = 0;
    }

    // search and select next path : ( "...."  
    // (not completely safe, but should be OK)
    findNextPathString() : string 
    { 
        //var p0 = this.fFaustCode.indexOf("(", this.fEnd);
        var p1 = this.fFaustCode.indexOf('"', this.fEnd+1);
        var p2 = this.fFaustCode.indexOf('"', p1+1);
        console.log(`Current positions : ${this.fEnd}, ${p1}, ${p2}`);

        //if ( (this.fEnd < p0) && (p0 < p1) && (p1 < p2) ) 
        if ( (this.fEnd < p1) && (p1 < p2) ) 
        {
            this.fStart = p1;
            this.fEnd   = p2+1;
            var path = this.fFaustCode.slice(this.fStart,this.fEnd);
            console.log(`findNextPathString -> ${path}`);
            return path;
        } else {
            console.log(`no more path found: ${this.fEnd}, ${p1}, ${p2}`);
            return ""; 
        }
    }

    // Replace the current selected path with a new string and return the update faust code
    updateCurrentPathString(newstring: string) : string 
    { 
        if ((0 < this.fStart) && (this.fStart < this.fEnd)) {
            // we have a valide path to replace
            return this.fFaustCode.slice(0,this.fStart) + newstring + this.fFaustCode.slice(this.fEnd); 
        } else {
            console.log("ERROR, trying to update an invalide path");
            return this.fFaustCode;
        }
    }
}

// Forge accelerometer metadata -> "acc: bla bla bla"" or "noacc: bla bla bla""
function forgeAccMetadata(newAccValue:string, isEnabled:boolean) : string
{
    if (isEnabled) {
        return `acc:${newAccValue}`;
    } else{
        return  `noacc:${newAccValue}`;
    } 
}

// Remove all metadatas of a uipath : "foo[...][...]" -> "foo"
// Used when searching the source code for a uiname. 
function removeMetadata(uipath:string) : string
{
    var r = "";     // resulting string
    var i = 0;
    while (true) {
        var j = uipath.indexOf("[",i);
        if (j == -1) {
            r = r + uipath.slice(i);
            return r;
        } else {
            r = r + uipath.slice(i,j);
            var k = uipath.indexOf("]",j);
            if (k > 0) {
                i=k+1;
            } else {
                console.log("removeMetada() called on incorrect label: " + uipath);
                return uipath;
            }
        }
    }
}

// replaceAccInPath("[1]toto[noacc:xxxx]...", "[acc:yyyy]",) -> "[1]toto[acc:yyyy]..."
// replaceAccInPath("[1]toto...", "[acc:yyyy]",) -> "[1]toto...[acc:yyyy]"
function replaceAccInPath(path:string, newacc:string): string
{
    // search either noacc or acc
    var i = path.indexOf("noacc");
    if (i<0) i = path.indexOf("acc");
    if (i<0) {
        // no acc metada found, add at the end
        return path.slice(0,-1) + "[" + newacc +"]" + '"';
    } else {
        var j = path.indexOf("]",i);
        if (j>0) {
            return path.slice(0,i) + newacc + path.slice(j);
        }
    }
    console.log(`ERROR in replaceAccInPath() : malformed path ${path}`);
}
    

// Checks if a ui name matches a ui path. For examples "toto" matches "[1]toto[acc:...]"
// that is if they are identical after removing the metadata from the ui path
function match(uiname:string, uipath:string):boolean
{
    console.log(`call match(${uiname},${uipath})`);
    //return uiname == removeMetadata(uipath.slice(1,-1));
    return uipath.indexOf(uiname) >= 0;
}

//  Replace the acc value associated to name in a faust code. Returns the updated faust code
function updateAccInFaustCode(faustcode : string, name: string, newaccvalue: string) : string
{
    // Creates a path iterator to iterate the faust code from ui path to ui path
    var cc = new PathIterator(faustcode); 

    // Search an ui path that matches
    for (var path = cc.findNextPathString(); path != ""; path = cc.findNextPathString()) {
        console.log(`COMPARE ${name} and ${path}`);
        if (match(name, path)) {
            var u = replaceAccInPath(path,newaccvalue);
            return cc.updateCurrentPathString(u);
        }
    }

    // ERROR: no suitable uipath was found !
    new Message(name + Utilitary.messageRessource.errorAccSliderNotFound);
    return faustcode;
}


class CodeFaustParser {
    originalCodeFaust: string;
    newCodeFaust: string;
    //array containing each line of the code faust
    codeFaustArray: string[];
    sliderName: string;
    newAccValue: string;
    //index of the slider in the array of code faust
    indexSlider: number;
    //index of the acc metadata in a string of code faust
    indexAccelerometer: number;
    //is the Acc enabled in the code faust
    isEnabled: boolean

    constructor(codeFaust: string, sliderName: string, newAccValue: string, isEnabled: boolean) {
        this.originalCodeFaust = codeFaust;
        this.codeFaustArray = codeFaust.split("\n");
        this.sliderName = sliderName;
        this.newAccValue = newAccValue;
        this.isEnabled = isEnabled

        console.log(`ACC UPDATE : slider name = ${sliderName}, new acc value = ${newAccValue}, is enabled = ${isEnabled}`);
        
    }
    
    //main function to start replacing old acc value of a slider by new val in the code faust
    //start to find slider and then acc
    //return the new code
    //throw error if can't find any
    //return original code if so
    replaceAccValue():string {
        this.indexSlider = this.findSliderIndex(this.sliderName)
        if (this.indexSlider == null) {
            this.indexSlider = this.findSliderIndexNoSpace(this.sliderName)
            if (this.indexSlider != null) {
                return this.tryReplaceAccValue()
            } else {
                new Message(this.sliderName + Utilitary.messageRessource.errorAccSliderNotFound)
                return this.originalCodeFaust;
            }
        } else if (this.indexSlider != null) {
            return this.tryReplaceAccValue()
        }
    }

    //try to find the acc meta in code faust if succeed remove old,
    // add new, return new faust code
    //otherwise try to find noacc meta
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
    //try to find the noacc meta in code faust if succeed remove old,
    // add new, return new faust code
    //otherwise add value
    private tryReplaceNoAccValue(): string {
        this.indexAccelerometer = this.findNoAccRank()
        if (this.indexAccelerometer != -1) {
            this.removeOldAccValue("noacc");
            this.addNewAccValue();
            return this.recomposeCodeFaust();
        } else {
            return this.addValue();
        }
    }
    //add value of the unexisting acc meta,return new faust code
    private addValue(): string {
        this.indexAccelerometer = this.codeFaustArray[this.indexSlider].indexOf(this.sliderName) + this.sliderName.length;
        this.addNewAccValue();
        return this.recomposeCodeFaust();
    }

    //find sliderIndex
    private findSliderIndex(sliderName: string):number {
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            if (this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("vslider") != -1 || this.codeFaustArray[i].indexOf(sliderName) != -1 && this.codeFaustArray[i].indexOf("hslider") != -1) {
                return i
            }
        }
        return null
    }
    //find slider index with space typo
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
        var stringSlider = this.codeFaustArray[this.indexSlider];
        while (stringSlider.charAt(this.indexAccelerometer) != "]"){
            stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
        }
        stringSlider = stringSlider.slice(0, this.indexAccelerometer) + stringSlider.slice(this.indexAccelerometer + 1);
        this.codeFaustArray[this.indexSlider] = stringSlider;
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
    //reform the initial faust code from the array of the line code faust return this code
    private recomposeCodeFaust(): string {
        this.newCodeFaust = "";
        for (var i = 0; i < this.codeFaustArray.length; i++) {
            this.newCodeFaust += this.codeFaustArray[i] + "\n";
        }
        console.log(this.newCodeFaust)
        return this.newCodeFaust
    }
}