/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app



    
*/
/// <reference path="App.ts"/>
"use strict";
window.addEventListener('load', init, false);
//var worker = new Worker("js/worker.js");
//worker.addEventListener("message", function (event) { console.log(event.data) }, false)
function init() {
    window.addEventListener("error", function (e) {
        if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
            alert("une erreur s'est produite :" + e.message);
            App.hideFullPageLoading();
        }
        if (e.message == "Uncaught Error: Upload2Error") {
            App.hideFullPageLoading();
            e.preventDefault();
        }
        //e.preventDefault();
    });
    var app = new App();
    try {
        App.audioContext = new AudioContext();
    }
    catch (e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    App.addFullPageLoading();
    app.createAllScenes();
    app.createMenu();
    app.showFirstScene();
    var accHandler = new AccelerometerHandler();
    App.accHandler = accHandler;
    accHandler.getAccelerometerValue();
}
window.addEventListener('touchstart', IosInit, false);
function IosInit() {
    var buffer = App.audioContext.createBuffer(1, 1, 22050);
    var source = App.audioContext.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(App.audioContext.destination);
    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchstart', IosInit, false);
}
var PositionModule = (function () {
    function PositionModule() {
    }
    return PositionModule;
})();
//# sourceMappingURL=Main.js.map