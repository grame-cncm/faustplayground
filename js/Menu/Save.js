/// <reference path="../Lib/fileSaver.min.d.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../DriveAPI.ts"/>
/// <reference path="SaveView.ts"/>
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
        document.addEventListener("successave", function () { new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500); });
    };
    //create a file jfaust and save it to the device
    Save.prototype.downloadApp = function () {
        if (this.saveView.inputDownload.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked);
            var blob = new Blob([jsonScene], {
                type: "application/json;charset=utf-8;"
            });
            saveAs(blob, Utilitary.currentScene.sceneName + ".jfaust");
        }
    };
    //save scene in local storage
    Save.prototype.saveLocal = function () {
        var _this = this;
        if (this.saveView.inputLocalStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true);
                if (this.isFileExisting(name)) {
                    new Confirm(Utilitary.messageRessource.confirmReplace, function (callback) { _this.replaceSaveLocal(name, jsonScene, callback); });
                    return;
                }
                else {
                    localStorage.setItem(name, jsonScene);
                }
                new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
                var event = new CustomEvent("updatelist");
                document.dispatchEvent(event);
            }
            else {
                new Message(Utilitary.messageRessource.errorLocalStorage);
            }
        }
    };
    //replace an existing scene in local Storage
    Save.prototype.replaceSaveLocal = function (name, jsonScene, confirmCallBack) {
        localStorage.setItem(name, jsonScene);
        new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        confirmCallBack();
    };
    //check if a scene name already exist in local storage
    Save.prototype.isFileExisting = function (name) {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    };
    //check if a scene name already exist in Cloud
    Save.prototype.isFileCloudExisting = function (name) {
        for (var i = 0; i < this.saveView.cloudSelectFile.options.length; i++) {
            if (this.saveView.cloudSelectFile.options[i].textContent == name) {
                return true;
            }
        }
        return false;
    };
    // get scene name selected in select local storage and set it to the input text localStorage
    Save.prototype.getNameSelected = function () {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        this.saveView.inputLocalStorage.value = option.value;
    };
    // get scene name selected in select cloud and set it to the input text clou
    Save.prototype.getNameSelectedCloud = function () {
        this.saveView.inputCloudStorage.value = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].textContent;
    };
    //get value of select option by its text content, used here to get id of drive file
    Save.prototype.getValueByTextContent = function (select, name) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent == name) {
                var option = select.options[i];
                return option.value;
            }
        }
        return null;
    };
    //suppr scene from local storage confirm
    Save.prototype.supprLocal = function () {
        var _this = this;
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, function (callbackConfirm) { _this.supprLocalCallback(callbackConfirm); });
        }
    };
    //suppr scene from local storage callback
    Save.prototype.supprLocalCallback = function (callbackConfirm) {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        var name = option.value;
        localStorage.removeItem(name);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        callbackConfirm();
    };
    //logOut from google account
    Save.prototype.logOut = function () {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    };
    // save scene in the cloud, create a jfaust file
    Save.prototype.saveCloud = function () {
        var _this = this;
        if (this.saveView.inputCloudStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var name = this.saveView.inputCloudStorage.value;
            if (this.isFileCloudExisting(name)) {
                new Confirm(Utilitary.messageRessource.confirmReplace, function (confirmCallback) { _this.replaceCloud(name, confirmCallback); });
                return;
            }
            else {
                var jsonScene = this.sceneCurrent.saveScene(true);
                var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
                this.drive.tempBlob = blob;
                this.drive.createFile(Utilitary.currentScene.sceneName, null);
            }
        }
    };
    //update/replace a scene on the cloud
    Save.prototype.replaceCloud = function (name, confirmCallback) {
        var _this = this;
        var jsonScene = this.sceneCurrent.saveScene(true);
        var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
        this.drive.tempBlob = blob;
        var id = this.getValueByTextContent(this.saveView.cloudSelectFile, name);
        if (id != null) {
            this.drive.getFile(id, function () {
                _this.drive.updateFile(id, _this.drive.lastSavedFileMetadata, blob, null);
            });
        }
        confirmCallback();
    };
    //trash a file in the cloud confirm
    //could be retreive from the cloud's trash can 
    Save.prototype.supprCloud = function () {
        var _this = this;
        if (this.saveView.cloudSelectFile.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, function (confirmCallBack) { _this.supprCloudCallback(confirmCallBack); });
        }
    };
    //trash a file in the cloud callback
    Save.prototype.supprCloudCallback = function (confirmCallBack) {
        var option = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex];
        var id = option.value;
        this.drive.trashFile(id);
        confirmCallBack();
    };
    return Save;
})();
