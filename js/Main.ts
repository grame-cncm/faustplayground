/*				MAIN.JS
	Entry point of the Program
    intefaces used through the app




*/

/// <reference path="App.ts"/>

"use strict";

//listner on load of all element to init the app
window.addEventListener('load', init, false);


declare var i18next;
declare var i18nextXHRBackend;
i18next
    .use(i18nextXHRBackend)
    .init({
        lng: 'fr',
        backend: {
            loadPath: '/js/locales/{{lng}}/{{ns}}.json',
        }
    });

function _(s:string): string {
    return i18next.t(s);
}


//initialization af the app, create app and ressource to get text with correct localization
//then resumeInit on callback when text is loaded
function init(): void {
    var app: App = new App();
    //var ressources = new Ressources();
    //ressources.getRessources(app);
}
////callback when text is loaded. resume the initialization
//function resumeInit(app: App) {
//    //create div which will contain all Messages and Confirm
//    App.createDialogue();
//    //create audiocontext if available, otherwise app can't work
//    try {
//        Utilitary.audioContext = new AudioContext();
//    } catch (e) {
//        new Message(_('errorNoWebAudioAPI'));
//        Utilitary.hideFullPageLoading();
//    }
//    Utilitary.addFullPageLoading();
//
//    app.createAllScenes();
//    app.createMenu();
//
//    var accHandler: AccelerometerHandler = new AccelerometerHandler();
//    Utilitary.accHandler = accHandler;
//    accHandler.getAccelerometerValue();
//
//    Utilitary.driveApi = new DriveAPI();
//    app.menu.setDriveApi(Utilitary.driveApi);
//    Utilitary.driveApi.checkAuth();
//
//
//    //error catcher
//    window.addEventListener("error", (e: ErrorEvent) => {
//        if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
//            new Message(_('errorOccuredMessage') + e.message);
//            Utilitary.hideFullPageLoading();
//        }
//        if (e.message == "Uncaught Error: Upload2Error") {
//            Utilitary.hideFullPageLoading();
//            e.preventDefault();
//        }
//    });
//}

//event listener to activate web audio on IOS devices, touchstart for iOS 8
//touchend for iOS 9

window.addEventListener('touchend', IosInit , false);
window.addEventListener('touchstart', IosInit2, false);

function IosInit(){
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);

    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit, false)
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
    window.removeEventListener('touchstart', IosInit2, false)
}
