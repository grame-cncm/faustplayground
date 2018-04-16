/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Ressources.ts"/>
/// <reference path="DriveAPI.ts"/>
/// <reference path="Main.ts"/>

class Utilitary {
    static audioContext: AudioContext;
    static moduleList: ModuleClass[];
    static currentScene: Scene;
    static messageRessource: Ressources = new Ressources();
    static idX: number = 0;
    static baseImg: string = "img/";
    static recursiveMap: ModuleTree[];//used for EquivalentFaust
    static isAccelerometerOn: boolean = false;
    static isAccelerometerEditOn: boolean = false;
    static accHandler: AccelerometerHandler;
    static driveApi: DriveAPI;

    static errorCallBack(message: string) {

    }
    static showFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "visible";
        //too demanding for mobile firefox...
        //document.getElementById("Normal").style.filter = "blur(2px)"
        //document.getElementById("Normal").style.webkitFilter = "blur(2px)"
        //document.getElementById("menuContainer").style.filter = "blur(2px)"
        //document.getElementById("menuContainer").style.webkitFilter = "blur(2px)"
    }
    static hideFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "hidden";
        //document.getElementById("Normal").style.filter = "none"
        //document.getElementById("Normal").style.webkitFilter = "none"
        //document.getElementById("menuContainer").style.filter = "none"
        //document.getElementById("menuContainer").style.webkitFilter = "none"
    }
    static isAppPedagogique(): boolean {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true
        } else {
            return false
        }
    }
    //generic function to make XHR request
    static getXHR(url: string, callback: (any) => any, errCallback: (any) => any) {

        var getrequest: XMLHttpRequest = new XMLHttpRequest();

        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                callback(getrequest.responseText);
            } else if (getrequest.readyState == 4 && getrequest.status == 400) {
                errCallback(getrequest.responseText);
            }
        }

        getrequest.open("GET", url, true);
        getrequest.send(null);
    }

    static addLoadingLogo(idTarget: string) {
        var loadingDiv = document.createElement("div");
        loadingDiv.className = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = Utilitary.baseImg + "logoAnim.gif"
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent = Utilitary.messageRessource.loading;
        loadingText.id = "loadingText";
        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);
        if (document.getElementById(idTarget) != null) {
            document.getElementById(idTarget).appendChild(loadingDiv);
        }
    }
    static removeLoadingLogo(idTarget: string) {
        var divTarget = <HTMLDivElement>document.getElementById(idTarget)
        if (divTarget != null && divTarget.getElementsByClassName("loadingDiv").length > 0) {
            while (divTarget.getElementsByClassName("loadingDiv").length != 0) {
                divTarget.getElementsByClassName("loadingDiv")[0].remove();
            }
        }
    }

    static addFullPageLoading() {
        var loadingText = document.getElementById("loadingTextBig");
        loadingText.id = "loadingTextBig"
        loadingText.textContent = Utilitary.messageRessource.loading;
    }
    static replaceAll(str: String, find: string, replace: string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
/********************************************************************
**************************  interfaces  *****************************
********************************************************************/

interface AudioBufferSourceNode {
    noteOn: (any: any) => any;
}

interface IPositionModule {
    x: number;
    y: number;
}

class PositionModule implements IPositionModule {
    x: number;
    y: number;
}

interface IHTMLDivElementSrc extends HTMLDivElement {
    audioNode: MediaStreamAudioSourceNode;
}
interface IHTMLDivElementOut extends HTMLDivElement {
    audioNode: AudioDestinationNode;
}
interface Factory {
    name: string;
    sha_key: string;
    code: string;
}
interface HTMLInterfaceContainer extends HTMLDivElement {
    unlitClassname: string;
    lastLit: any;
}
interface IfDSP extends AudioNode {
    getJSON: () => string;
    getParamValue: (text: string) => string;
    setParamValue: (text: string, val: string) => void;
    getNumInputs: () => number;
    getNumOutputs: () => number;
    getParams: () => any;
}

interface CompileFaust {
    name: string,
    sourceCode: string,
    x: number,
    y: number,
    callback: (factory: Factory) => void
}