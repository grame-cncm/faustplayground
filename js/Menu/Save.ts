   /// <reference path="../Lib/fileSaver.min.d.ts"/>


class Save {
    saveView: SaveView;
    sceneCurrent: Scene;

    setEventListeners() {
        this.saveView.buttonDownloadApp.addEventListener("click", () => { this.downloadApp() })
        this.saveView.buttonLocalSave.addEventListener("click", () => { this.saveLocal() });
        this.saveView.buttonLocalSuppr.addEventListener("click", () => { this.supprLocal() });
        this.saveView.existingSceneSelect.addEventListener("change", () => { this.getNameSelected() });
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
        if (this.saveView.inputDownload.nodeValue != Scene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        } else {            
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true)
                if (this.isFileExisting(name))
                    if (confirm("le nom que vous utilisez existe déjà si vous continuez vous le remplacerez. Continuer?")) {
                        localStorage.setItem(name, jsonScene);
                    } else {
                        return;
                    }
                else {
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
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {

            var name = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex].value
            localStorage.removeItem(name)
            var event: CustomEvent = new CustomEvent("updatelist")
            document.dispatchEvent(event);
        }
    }
}