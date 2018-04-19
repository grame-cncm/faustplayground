/*				MAIN.JS
	Entry point of the Program
    intefaces used through the app
*/

/// <reference path="App.ts"/>
/// <reference path="Messages.ts"/>

// init is call by libfaust-wasm.js load end handler

//initialization af the app, create app and ressource to get text with correct localization
//then resumeInit on callback when text is loaded
function init(): void {
    console.log("FaustPlayground: version 1.0.0");
    var app: App = new App();
    var ressource = new Ressources
    ressource.getRessources(app);
}
//callback when text is loaded. resume the initialization
function resumeInit(app: App) {
    //create div which will contain all Messages and Confirm
    app.createDialogue();
    //create audiocontext if available, otherwise app can't work
    try {
        Utilitary.audioContext = new AudioContext();
    } catch (e) {
        new Message(Utilitary.messageRessource.errorNoWebAudioAPI);
        Utilitary.hideFullPageLoading();
    }
    Utilitary.addFullPageLoading();

    app.createAllScenes();
    app.createMenu();

    var accHandler: AccelerometerHandler = new AccelerometerHandler();
    Utilitary.accHandler = accHandler;
    accHandler.getAccelerometerValue();

    Utilitary.driveApi = new DriveAPI();
    app.menu.setDriveApi(Utilitary.driveApi);
    Utilitary.driveApi.checkAuth();

    //error catcher
    window.addEventListener("error", (e: ErrorEvent) => {
        if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
            new Message(Utilitary.messageRessource.errorOccuredMessage + e.message)
            Utilitary.hideFullPageLoading();
        }
        if (e.message == "Uncaught Error: Upload2Error") {
            Utilitary.hideFullPageLoading();
            e.preventDefault();
        }
    });
}

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
    } else if (source.start) {
    	source.start();
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
    } else if (source.start) {
    	source.start();
    }
    window.removeEventListener('touchstart', IosInit2, false)
}
