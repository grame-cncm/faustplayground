   /// <reference path="../Lib/fileSaver.min.d.ts"/>


class Save {
    saveView: SaveView;
    sceneCurrent: Scene;
    drive: DriveAPI;

    setEventListeners() {
        this.saveView.buttonDownloadApp.addEventListener("click", () => { this.downloadApp() });
        this.saveView.buttonLocalSave.addEventListener("click", () => { this.saveLocal() });
        this.saveView.buttonLocalSuppr.addEventListener("click", () => { this.supprLocal() });
        this.saveView.existingSceneSelect.addEventListener("change", () => { this.getNameSelected() });
        this.saveView.cloudSelectFile.addEventListener("change", () => { this.getNameSelectedCloud() });
        this.saveView.buttonConnectDrive.addEventListener("click", (e) => { this.drive.handleAuthClick(e) })
        this.saveView.buttonChangeAccount.addEventListener("click", () => { this.logOut() });
        this.saveView.buttonSaveCloud.addEventListener("click", () => { this.saveCloud() });
        this.saveView.buttonCloudSuppr.addEventListener("click", () => { this.supprCloud() });
        document.addEventListener("successave", () => { new Message(App.messageRessource.sucessSave,"messageTransitionOutFast",2000,500) })
    }

    downloadApp() {
        if (this.saveView.inputDownload.value != App.scene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {

        } else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked)
            var blob = new Blob([jsonScene], {
                type: "application/vnd.google-apps.script+json;charset=utf-8;",
            });
            saveAs(blob, App.scene.sceneName + ".json");
        }


    }

    saveLocal() {
        if (this.saveView.inputLocalStorage.value != App.scene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        } else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true)
                if (this.isFileExisting(name)) {
                    new Confirm(App.messageRessource.confirmReplace, (callback) => { this.replaceSaveLocal(name,jsonScene, callback) });
                    return;
                }else {
                    localStorage.setItem(name, jsonScene)
                }
                new Message(App.messageRessource.sucessSave,"messageTransitionOutFast",2000,500)
                var event: CustomEvent = new CustomEvent("updatelist")
                document.dispatchEvent(event);

            } else {
                new Message(App.messageRessource.errorLocalStorage);
            }
        }
    }
    replaceSaveLocal(name:string,jsonScene: string, confirmCallBack: () => void) {
        localStorage.setItem(name, jsonScene);
        new Message(App.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500)
        var event: CustomEvent = new CustomEvent("updatelist")
        document.dispatchEvent(event);
        confirmCallBack();
    }
    isFileExisting(name: string): boolean {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    }
    isFileCloudExisting(name: string): boolean {
        for (var i = 0; i < this.saveView.cloudSelectFile.options.length; i++) {
            if (this.saveView.cloudSelectFile.options[i].textContent == name) {
                return true;
            }
        }
        return false;
    }

    getNameSelected() {
        this.saveView.inputLocalStorage.value = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value;
    }

    getNameSelectedCloud() {
        this.saveView.inputCloudStorage.value = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].textContent;
    }
    getValueByTextContent(select: HTMLSelectElement, name: string):string {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent == name) {
                return select.options[i].value;
            }
        }
        return null;
    }


    supprLocal() {
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            new Confirm(App.messageRessource.confirmSuppr, (callbackConfirm) => { this.supprLocalCallback(callbackConfirm) })
        }
    }

    supprLocalCallback(callbackConfirm:()=>void) {
        var name = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value
        localStorage.removeItem(name)
        var event: CustomEvent = new CustomEvent("updatelist")
        document.dispatchEvent(event);
        callbackConfirm();
    }
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }

    saveCloud() {
        if (this.saveView.inputCloudStorage.value != App.scene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        } else {
            var name = this.saveView.inputCloudStorage.value;
            if (this.isFileCloudExisting(name)) {

                new Confirm(App.messageRessource.confirmReplace, (confirmCallback) => { this.replaceCloud(name,confirmCallback) })
                return;
                
            } else {
                var jsonScene = this.sceneCurrent.saveScene(true)
                var blob = new Blob([jsonScene], { type: "application/json" });
                this.drive.tempBlob = blob;
                this.drive.createFile(App.scene.sceneName, (folderId, fileId) => { this.drive.removeFileFromRoot(folderId, fileId) });
            }
        }
    }

    replaceCloud(name: string,confirmCallback:()=>void) {
        var jsonScene = this.sceneCurrent.saveScene(true)
        var blob = new Blob([jsonScene], { type: "application/json" });
        this.drive.tempBlob = blob;
        var id = this.getValueByTextContent(this.saveView.cloudSelectFile, name);
        if (id != null) {
            this.drive.getFile(id, () => {
                this.drive.updateFile(id, this.drive.lastSavedFileMetadata, blob, null)
            });
        }
        confirmCallback();
    }
    supprCloud() {
        if (this.saveView.cloudSelectFile.selectedIndex > -1) {
            new Confirm(App.messageRessource.confirmSuppr, (confirmCallBack) => { this.supprCloudCallback(confirmCallBack) })
        }
    }
    supprCloudCallback(confirmCallBack:()=>void) {
        var id = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].value
        this.drive.trashFile(id);
        confirmCallBack();
        
    }
}