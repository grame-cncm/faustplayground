/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app
*/
import type { ab2str, FaustCompiler, FaustMonoDspGenerator, FaustPolyDspGenerator, str2ab } from "@grame/faustwasm";
import type * as faustwasm from "@grame/faustwasm";

import jsURL from "@grame/faustwasm/libfaust-wasm/libfaust-wasm.js?url";
import dataURL from "@grame/faustwasm/libfaust-wasm/libfaust-wasm.data?url";
import wasmURL from "@grame/faustwasm/libfaust-wasm/libfaust-wasm.wasm?url";

import { AccelerometerHandler } from "./Accelerometer";
import { App } from "./App";
import { DriveAPI } from "./DriveAPI";
import { Resources } from "./Resources";
import { Utilitary } from "./Utilitary";
import { Message } from "./Messages";

//@ts-ignore
declare const faust: never;

export let faustWasmEnv: {
    faustwasm: typeof faustwasm;
    faustCompiler: FaustCompiler;
    FaustMonoDspGenerator: typeof FaustMonoDspGenerator;
    FaustPolyDspGenerator: typeof FaustPolyDspGenerator;
    ab2str: typeof ab2str;
    str2ab: typeof str2ab;
};

//init is call by libfaust-wasm.js load end handler

//initialization af the app, create app and resource to get text with correct localization
//then resumeInit on callback when text is loaded
export async function init(): Promise<void> {
    console.log("FaustPlayground: version 1.4.1 (2025-04-08)");
    //@ts-ignore
    const faustwasm = await import("@grame/faustwasm");
    console.log(faustwasm);
    const { instantiateFaustModuleFromFile, FaustCompiler, LibFaust, FaustMonoDspGenerator, FaustPolyDspGenerator, ab2str, str2ab } = faustwasm;
    const faustModule = await instantiateFaustModuleFromFile(jsURL, dataURL, wasmURL);
    const libFaust = new LibFaust(faustModule);
    const faustCompiler = new FaustCompiler(libFaust);
    faustWasmEnv = {
        faustwasm,
        faustCompiler,
        FaustMonoDspGenerator,
        FaustPolyDspGenerator,
        ab2str,
        str2ab
    };

    var app: App = new App();
    Resources.getResources(app);
}
//callback when text is loaded. resume the initialization
export function resumeInit(app: App) {
    //create div which will contain all Messages and Confirm
    app.createDialogue();
    //create audiocontext if available, otherwise app can't work
    try {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        Utilitary.audioContext = new AudioContext({ latencyHint: 0.00001 });
        Utilitary.audioContext.destination.channelInterpretation = "discrete";
        Utilitary.audioContext.destination.channelCount = Utilitary.audioContext.destination.maxChannelCount;
    } catch (e) {
        new Message(Utilitary.messageResource.errorNoWebAudioAPI);
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
            new Message(Utilitary.messageResource.errorOccuredMessage + e.message)
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
