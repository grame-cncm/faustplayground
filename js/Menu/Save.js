/// <reference path="../Lib/fileSaver.min.d.ts"/>
var Save = (function () {
    function Save() {
    }
    Save.prototype.setEventListeners = function () {
        var _this = this;
        this.saveView.buttonDownloadApp.addEventListener("click", function () { _this.downloadApp(); });
        this.saveView.buttonLocalSave.addEventListener("click", function () { _this.saveLocal(); });
        this.saveView.buttonLocalSuppr.addEventListener("click", function () { _this.supprLocal(); });
        this.saveView.existingSceneSelect.addEventListener("change", function () { _this.getNameSelected(); });
        this.saveView.cloudSelectFile.addEventListener("change", function () { _this.getNameSelectedCloud(); });
        this.saveView.buttonConnectDrive.addEventListener("click", function (e) { _this.drive.handleAuthClick(e); });
        this.saveView.buttonChangeAccount.addEventListener("click", function () { _this.logOut(); });
        this.saveView.buttonSaveCloud.addEventListener("click", function () { _this.saveCloud(); });
        this.saveView.buttonCloudSuppr.addEventListener("click", function () { _this.supprCloud(); });
    };
    Save.prototype.downloadApp = function () {
        if (this.saveView.inputDownload.value != App.scene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked);
            var blob = new Blob([jsonScene], {
                type: "application/vnd.google-apps.script+json;charset=utf-8;",
            });
            saveAs(blob, App.scene.sceneName + ".json");
        }
    };
    Save.prototype.saveLocal = function () {
        if (this.saveView.inputLocalStorage.value != App.scene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true);
                if (this.isFileExisting(name)) {
                    this.sceneCurrent.muteScene();
                    if (confirm(App.messageRessource.confirmReplace)) {
                        localStorage.setItem(name, jsonScene);
                    }
                    else {
                        return;
                    }
                    this.sceneCurrent.unmuteScene();
                }
                else {
                    localStorage.setItem(name, jsonScene);
                }
                this.showGoodNews();
                var event = new CustomEvent("updatelist");
                document.dispatchEvent(event);
            }
            else {
                alert("sessionStorage n'est pas supporté");
            }
        }
    };
    Save.prototype.isFileExisting = function (name) {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    };
    Save.prototype.isFileCloudExisting = function (name) {
        for (var i = 0; i < this.saveView.cloudSelectFile.options.length; i++) {
            if (this.saveView.cloudSelectFile.options[i].textContent == name) {
                return true;
            }
        }
        return false;
    };
    Save.prototype.showGoodNews = function () {
        var _this = this;
        this.saveView.dialogGoodNews.style.opacity = "1";
        setTimeout(function () { _this.hideGoodNews(); }, 3000);
    };
    Save.prototype.hideGoodNews = function () {
        this.saveView.dialogGoodNews.style.opacity = "0";
    };
    Save.prototype.getNameSelected = function () {
        this.saveView.inputLocalStorage.value = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value;
    };
    Save.prototype.getNameSelectedCloud = function () {
        this.saveView.inputCloudStorage.value = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].textContent;
    };
    Save.prototype.getValueByTextContent = function (select, name) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent == name) {
                return select.options[i].value;
            }
        }
        return null;
    };
    Save.prototype.supprLocal = function () {
        this.sceneCurrent.muteScene();
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            if (confirm(App.messageRessource.confirmSuppr)) {
                var name = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value;
                localStorage.removeItem(name);
                var event = new CustomEvent("updatelist");
                document.dispatchEvent(event);
            }
        }
        this.sceneCurrent.unmuteScene();
    };
    Save.prototype.logOut = function () {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    };
    Save.prototype.saveCloud = function () {
        var _this = this;
        if (this.saveView.inputCloudStorage.value != App.scene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var name = this.saveView.inputCloudStorage.value;
            if (this.isFileCloudExisting(name)) {
                this.sceneCurrent.muteScene();
                if (confirm(App.messageRessource.confirmReplace)) {
                    var jsonScene = this.sceneCurrent.saveScene(true);
                    var blob = new Blob([jsonScene], { type: "application/json" });
                    this.drive.tempBlob = blob;
                    var id = this.getValueByTextContent(this.saveView.cloudSelectFile, name);
                    if (id != null) {
                        this.drive.getFile(id, function () {
                            _this.drive.updateFile(id, _this.drive.lastSavedFileMetadata, blob, null);
                        });
                    }
                }
                else {
                    return;
                }
                this.sceneCurrent.unmuteScene();
            }
            else {
                var jsonScene = this.sceneCurrent.saveScene(true);
                var blob = new Blob([jsonScene], { type: "application/json" });
                this.drive.tempBlob = blob;
                this.drive.createFile(App.scene.sceneName, function (folderId, fileId) { _this.drive.removeFileFromRoot(folderId, fileId); });
            }
        }
    };
    Save.prototype.supprCloud = function () {
        this.sceneCurrent.muteScene();
        if (this.saveView.cloudSelectFile.selectedIndex > -1) {
            if (confirm(App.messageRessource.confirmSuppr)) {
                var id = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].value;
                this.drive.trashFile(id);
            }
        }
        this.sceneCurrent.unmuteScene();
    };
    return Save;
})();
//# sourceMappingURL=Save.js.map