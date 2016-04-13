/// <reference path="../DriveAPI.ts"/>   
/// <reference path="LoadView.ts"/>   
var Load = (function () {
    function Load() {
    }
    //Set event listener
    Load.prototype.setEventListeners = function () {
        var _this = this;
        this.loadView.loadFileButton.addEventListener("click", function () { _this.openFile(); });
        this.loadView.buttonLoadLocal.addEventListener("click", function () { _this.localLoad(); });
        this.loadView.buttonLoadCloud.addEventListener("click", function () { _this.cloudLoad(); });
        this.loadView.buttonConnectDrive.addEventListener("click", function (e) { _this.drive.handleAuthClick(e); });
        this.loadView.aBigExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aBigPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.buttonChangeAccount.addEventListener("click", function (e) { _this.logOut(); });
    };
    //open file from browser dialogue open window
    Load.prototype.openFile = function () {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event = new CustomEvent("fileload", { 'detail': file });
            document.dispatchEvent(event);
        }
    };
    //load scene from local storage
    Load.prototype.localLoad = function () {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex];
            var name = option.value;
            this.sceneCurrent.recallScene(localStorage.getItem(name));
        }
    };
    //load exemple
    Load.prototype.getEx = function (e) {
        var _this = this;
        e.preventDefault();
        var anchorTarget = e.target;
        Utilitary.getXHR(anchorTarget.href, function (json) { _this.loadEx(json); }, null);
    };
    Load.prototype.loadEx = function (json) {
        Utilitary.showFullPageLoading();
        this.sceneCurrent.recallScene(json);
    };
    //load file scene from cloud Drive API
    //get id file from Drive API then is able to get content
    Load.prototype.cloudLoad = function () {
        var _this = this;
        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex];
            var id = option.value;
            var file = this.drive.getFile(id, function (resp) { _this.getContent(resp); });
            console.log(file);
        }
    };
    // get content from file loaded from cloud
    Load.prototype.getContent = function (resp) {
        var _this = this;
        this.drive.downloadFile(resp, function (json) { _this.sceneCurrent.recallScene(json); });
    };
    //logOut from google account
    Load.prototype.logOut = function () {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    };
    return Load;
}());
//# sourceMappingURL=Load.js.map