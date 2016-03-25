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
    };
    Save.prototype.downloadApp = function () {
        if (this.saveView.inputDownload.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked);
            var blob = new Blob([jsonScene], {
                type: "application/vnd.google-apps.script+json;charset=utf-8;",
            });
            saveAs(blob, Scene.sceneName + ".json");
        }
    };
    Save.prototype.saveLocal = function () {
        if (this.saveView.inputDownload.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true);
                if (this.isFileExisting(name))
                    if (confirm("le nom que vous utilisez existe déjà si vous continuez vous le remplacerez. Continuer?")) {
                        localStorage.setItem(name, jsonScene);
                    }
                    else {
                        return;
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
    Save.prototype.supprLocal = function () {
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            var name = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value;
            localStorage.removeItem(name);
            var event = new CustomEvent("updatelist");
            document.dispatchEvent(event);
        }
    };
    return Save;
})();
//# sourceMappingURL=Save.js.map