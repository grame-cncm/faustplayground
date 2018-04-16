/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>

//==============================================================================================
// updateAccInFaustCode (faustcode : string, name: string, newaccvalue: string) : string;
// Update the acc metadata associated to <name> in <faustcode>. Returns the updated faust code
//==============================================================================================

// Iterate into faust code to find next path-string.
class PathIterator
{
    fFaustCode  : string;       // Faust code to search
    fStart      : number;       // start position of the current path
    fEnd        : number;       // end position of the current path

    constructor(faustCode:string)
    {
        this.fFaustCode = faustCode;
        this.fStart = 0;
        this.fEnd   = 0;
    }

    // search and select next string :  "...."
    // (not completely safe, but should be OK)
    findNextPathString() : string
    {
        var p1 = this.fFaustCode.indexOf('"', this.fEnd+1);
        var p2 = this.fFaustCode.indexOf('"', p1+1);
        //console.log(`Current positions : ${this.fEnd}, ${p1}, ${p2}`);

        //if ( (this.fEnd < p0) && (p0 < p1) && (p1 < p2) )
        if ( (this.fEnd < p1) && (p1 < p2) )
        {
            this.fStart = p1;
            this.fEnd   = p2+1;
            var path = this.fFaustCode.slice(this.fStart,this.fEnd);
            //console.log(`findNextPathString -> ${path}`);
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
function replaceAccInPath(oldpath:string, newacc:string): string
{
    // search either noacc or acc
    var i = oldpath.indexOf("noacc");
    if (i<0) i = oldpath.indexOf("acc");
    if (i<0) {
        // no acc metada found, add at the end
        var newpath:string = oldpath.slice(0,-1) + "[" + newacc +"]" + '"';
        //console.log(`> replaceAccInPath(${oldpath}, ${newacc}) -> ${newpath}`);
        return newpath;
    } else {
        var j = oldpath.indexOf("]",i);
        if (j>0) {
            var newpath:string =  oldpath.slice(0,i) + newacc + oldpath.slice(j);
            //console.log(`>replaceAccInPath("${oldpath}", ${newacc}) -> ${newpath}`);
            return newpath;
        }
    }
    console.log(`ERROR in replaceAccInPath() : malformed path ${oldpath}`);
    return oldpath;
}


// Checks if a ui name matches a ui path. For examples "toto" matches "[1]toto[acc:...]"
// that is if they are identical after removing the metadata from the ui path
function match(uiname:string, uipath:string):boolean
{
    var path:string     = removeMetadata(uipath.slice(1,-1));
    var found:boolean   = path.indexOf(uiname) >= 0;
    //console.log(`> match(${uiname},${path} [${uipath}]) -> ${found}`);
    return found;
}

//==============================================================================================
// updateAccInFaustCode (faustcode : string, name: string, newaccvalue: string) : string;
// Update the acc metadata associated to <name> in <faustcode>. Returns the updated faust code
//==============================================================================================

function updateAccInFaustCode(faustcode : string, name: string, newaccvalue: string) : string
{
    // Creates a path iterator to iterate the faust code from ui path to ui path
    var cc = new PathIterator(faustcode);

    // Search an ui path that matches
    for (var path = cc.findNextPathString(); path != ""; path = cc.findNextPathString()) {
        if (match(name, path)) {
            var u = replaceAccInPath(path,newaccvalue);
            return cc.updateCurrentPathString(u);
        }
    }

    // WARNING: no suitable uipath was found !
    new Message(name + Utilitary.messageRessource.errorAccSliderNotFound);
    return faustcode;
}
