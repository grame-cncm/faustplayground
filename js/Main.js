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