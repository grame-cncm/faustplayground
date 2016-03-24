/*				MAIN.JS
	Entry point of the Program
    intefaces used through the app



	
*/
	/// <reference path="App.ts"/>

"use strict";


window.addEventListener('load', init, false);
//var worker = new Worker("js/worker.js");
//worker.addEventListener("message", function (event) { console.log(event.data) }, false)


   



function init():void {

    window.addEventListener("error", (e: ErrorEvent) => {
        if (e.message == "Uncaught Error: workerError" || e.message =="Error: workerError") {
            alert("une erreur s'est produite :" + e.message)
            App.hideFullPageLoading();
        }
        if (e.message == "Uncaught Error: Upload2Error") {
            

            App.hideFullPageLoading();
            e.preventDefault();
        }
        //e.preventDefault();

    });

    var app: App = new App();

    try {
        App.audioContext = new AudioContext();
    } catch(e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    App.addFullPageLoading();
    app.createAllScenes();
    app.createMenu();
    app.showFirstScene();
    var accHandler: AccelerometerHandler = new AccelerometerHandler();
    App.accHandler = accHandler;
    accHandler.getAccelerometerValue(); 
}
window.addEventListener('touchend', IosInit , false);
window.addEventListener('touchend', IosInit2, false);

function IosInit(){
    var buffer = App.audioContext.createBuffer(1, 1, 22050);
    var source = App.audioContext.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(App.audioContext.destination);

    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit, false)
}

function IosInit2() {
    var buffer = App.audioContext.createBuffer(1, 1, 22050);
    var source = App.audioContext.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(App.audioContext.destination);

    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit2, false)
}

    /********************************************************************
    **************************  interfaces  *********************************
    ********************************************************************/

interface AudioBufferSourceNode {
    noteOn: (any:any) => any;
}

interface Navigator {
    //default way to get the devices of browsers
    getUserMedia(
        options: { video?: boolean; audio?: boolean; },
        success: (stream: any) => void,
        error?: (error: string) => void
    ): void;
    webkitGetUserMedia(
        options: { video?: boolean; audio?: boolean; },
        successCallback: (stream: any) => void,
        errorCallback?: (error: string) => void
    ): void;
    mozGetUserMedia(
        options: { video?: boolean; audio?: boolean; },
        successCallback: (stream: any) => void,
        errorCallback?: (error: string) => void
    ): void;
}

interface IPositionModule {
    x: number;
    y: number;
}

class PositionModule implements IPositionModule {
    x: number;
    y: number;
}

interface FaustEvent extends Event {


}

interface MediaStream {
    id: string;
    active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {

}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    state: string;
    close: () => void;
    createMediaStreamSource: (m: MediaStream) => MediaStreamAudioSourceNode;
    createMediaStreamDestination: () => any;
    resume: () => void;
    suspend: () => void;
}
interface IHTMLDivElementSrc extends HTMLDivElement {
    audioNode: MediaStreamAudioSourceNode;
}
interface IHTMLDivElementOut extends HTMLDivElement{
    audioNode: AudioDestinationNode;
}
interface Factory {
    name: string;
    sha_key: string;
    code: string;
}

