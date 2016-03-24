var Load = (function () {
    function Load() {
    }
    Load.prototype.setEventListeners = function () {
        var _this = this;
        this.loadView.loadFileButton.addEventListener("click", function () { _this.openFile(); });
        this.loadView.loadLocalButton.addEventListener("click", function () { _this.localLoad(); });
        this.loadView.aBigExemple.addEventListener("click", function () { _this.getBigEx(); });
        this.loadView.aLightExemple.addEventListener("click", function () { _this.getLightEx(); });
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
    Load.prototype.getBigEx = function () {
        var _this = this;
        var file;
        App.getXHR("json/patch_big.json", function (json) { _this.loadEx(json); }, null);
    };
    Load.prototype.loadEx = function (json) {
        App.showFullPageLoading();
        this.sceneCurrent.recallScene(json);
    };
    Load.prototype.getLightEx = function () {
        var _this = this;
        var file;
        App.getXHR("json/patch_light.json", function (json) { _this.loadEx(json); }, null);
    };
    return Load;
})();
//# sourceMappingURL=Load.js.map