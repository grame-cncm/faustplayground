var Load = (function () {
    function Load() {
    }
    Load.prototype.setEventListeners = function () {
        var _this = this;
        this.loadView.loadFileButton.addEventListener("click", function () { _this.openFile(); });
        this.loadView.buttonLoadLocal.addEventListener("click", function () { _this.localLoad(); });
        this.loadView.buttonLoadCloud.addEventListener("click", function () { _this.cloudLoad(); });
        this.loadView.buttonLocalSuppr.addEventListener("click", function () { _this.supprLocal(); });
        this.loadView.buttonConnectDrive.addEventListener("click", function (e) { _this.drive.handleAuthClick(e); });
        this.loadView.aBigExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aBigPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
    };
    Load.prototype.openFile = function () {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event = new CustomEvent("fileload", { 'detail': file });
            document.dispatchEvent(event);
        }
    };
    Load.prototype.localLoad = function () {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            App.showFullPageLoading();
            var name = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex].value;
            this.sceneCurrent.recallScene(localStorage.getItem(name));
        }
    };
    Load.prototype.getEx = function (e) {
        var _this = this;
        e.preventDefault();
        var anchorTarget = e.target;
        App.getXHR(anchorTarget.href, function (json) { _this.loadEx(json); }, null);
    };
    Load.prototype.loadEx = function (json) {
        App.showFullPageLoading();
        this.sceneCurrent.recallScene(json);
    };
    Load.prototype.supprLocal = function () {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            var name = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex].value;
            localStorage.removeItem(name);
            var event = new CustomEvent("updatelist");
            document.dispatchEvent(event);
        }
    };
    Load.prototype.cloudLoad = function () {
        var _this = this;
        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            App.showFullPageLoading();
            var id = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex].value;
            var name = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex].name;
            var file = this.drive.getFile(id, function (resp) { _this.getContent(resp); });
            console.log(file);
        }
    };
    Load.prototype.getContent = function (resp) {
        var _this = this;
        this.drive.downloadFile(resp, function (json) { _this.sceneCurrent.recallScene(json); });
    };
    return Load;
})();
//# sourceMappingURL=Load.js.map