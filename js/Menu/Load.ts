class Load {
    loadView: LoadView;
    sceneCurrent: Scene;


    setEventListeners() {
        this.loadView.loadFileButton.addEventListener("click", () => { this.openFile() })
        this.loadView.loadLocalButton.addEventListener("click", () => { this.localLoad() })
        this.loadView.aBigExemple.addEventListener("click", () => { this.getBigEx() })
        this.loadView.aLightExemple.addEventListener("click", () => { this.getLightEx() })
    }

    openFile() {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event: CustomEvent = new CustomEvent("fileload", { 'detail': file })
            document.dispatchEvent(event);
        }
    }
    localLoad() {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {

            App.showFullPageLoading();
            var name = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex].value
            this.sceneCurrent.recallScene(localStorage.getItem(name))
        }
    }
    getBigEx() {
        var file: File;
        App.getXHR("json/patch_big.json", (json: string) => { this.loadEx(json) },null)
    }
    loadEx(json) {
        App.showFullPageLoading();

        this.sceneCurrent.recallScene(json);
    }
    getLightEx() {
        var file: File;
        App.getXHR("json/patch_light.json", (json: string) => { this.loadEx(json) }, null)
    }

}