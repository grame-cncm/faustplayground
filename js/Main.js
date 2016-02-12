/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app



    
*/
/// <reference path="App.ts"/>
"use strict";
window.addEventListener('load', init, false);
function init() {
    var app = new App();
    try {
        App.audioContext = new AudioContext();
    }
    catch (e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    App.isPedagogie = App.isAppPedagogique();
    app.createAllScenes();
    app.showFirstScene();
}
var PositionModule = (function () {
    function PositionModule() {
    }
    return PositionModule;
})();
//# sourceMappingURL=Main.js.map