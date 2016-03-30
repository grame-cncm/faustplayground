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
        this.saveView.buttonChangeAccount.addEventListener("click", () => { this.logOut() });
        this.saveView.buttonSaveCloud.addEventListener("click", () => { this.saveCloud() });
    }

    downloadApp() {
        if (this.saveView.inputDownload.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {

        } else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked)
            var blob = new Blob([jsonScene], {
                type: "application/vnd.google-apps.script+json;charset=utf-8;",
            });
            saveAs(blob, Scene.sceneName + ".json");
        }


    }

    saveLocal() {
        if (this.saveView.inputLocalStorage.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        } else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true)
                if (this.isFileExisting(name)) {
                    this.sceneCurrent.muteScene();
                    if (confirm("le nom que vous utilisez existe déjà si vous continuez vous le remplacerez. Continuer?")) {
                        localStorage.setItem(name, jsonScene);
                    } else {
                        return;
                    }
                    this.sceneCurrent.unmuteScene();
                }else {
                    localStorage.setItem(name, jsonScene)
                }
                this.showGoodNews()
                var event: CustomEvent = new CustomEvent("updatelist")
                document.dispatchEvent(event);

            } else {
                alert("sessionStorage n'est pas supporté");
            }
        }
    }

    isFileExisting(name: string): boolean {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    }
    showGoodNews() {
        this.saveView.dialogGoodNews.style.opacity = "1";

        setTimeout(() => { this.hideGoodNews() }, 3000);
    }
    hideGoodNews() {
        this.saveView.dialogGoodNews.style.opacity = "0";

    }
    getNameSelected() {
        this.saveView.inputLocalStorage.value = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value;
    }
    supprLocal() {
        this.sceneCurrent.muteScene()
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            if (confirm("Voulez vous vraiment supprimer ce Patch ?")) {

                var name = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value
                localStorage.removeItem(name)
                var event: CustomEvent = new CustomEvent("updatelist")
                document.dispatchEvent(event);
            }
        }
        this.sceneCurrent.unmuteScene();
    }
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }

    saveCloud() {
        if (this.saveView.inputCloudStorage.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        } else {
            var jsonScene = this.sceneCurrent.saveScene(true)
            var blob = new Blob([jsonScene], { type: "application/json" });
            this.drive.tempBlob = blob;
            this.drive.createFile(Scene.sceneName, (folderId, fileId) => { this.drive.removeFileFromRoot(folderId, fileId) });
            
            //this.drive.updateFile(this.drive.lastSavedFileId,
        }
    }
}