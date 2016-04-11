/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app




*/
/// <reference path="App.ts"/>
/// <reference path="Messages.ts"/>
"use strict";
window.addEventListener('load', init, false);
//var worker = new Worker("js/worker.js");
//worker.addEventListener("message", function (event) { console.log(event.data) }, false)
function init() {
    var app = new App();
    var ressource = new Ressources();
    ressource.getRessources(app);
}
function resumeInit(app) {
    app.createDialogue();
    try {
        Utilitary.audioContext = new AudioContext();
    }
    catch (e) {
        new Message(Utilitary.messageRessource.errorNoWebAudioAPI);
    }
    Utilitary.addFullPageLoading();
    app.createAllScenes();
    app.createMenu();
    app.showFirstScene();
    var accHandler = new AccelerometerHandler();
    Utilitary.accHandler = accHandler;
    accHandler.getAccelerometerValue();
    Utilitary.driveApi = new DriveAPI();
    app.menu.setDriveApi(Utilitary.driveApi);
    Utilitary.driveApi.checkAuth();
    window.addEventListener("error", function (e) {
        if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
            new Message(Utilitary.messageRessource.errorOccuredMessage + e.message);
            Utilitary.hideFullPageLoading();
        }
        if (e.message == "Uncaught Error: Upload2Error") {
            Utilitary.hideFullPageLoading();
            e.preventDefault();
        }
        //e.preventDefault();
    });
}
window.addEventListener('touchend', IosInit, false);
window.addEventListener('touchstart', IosInit2, false);
function IosInit() {
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);
    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit, false);
}
function IosInit2() {
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);
    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchstart', IosInit2, false);
}
var PositionModule = (function () {
    function PositionModule() {
    }
    return PositionModule;
}());
//# sourceMappingURL=Main.js.map