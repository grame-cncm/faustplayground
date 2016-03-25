class Load {
    loadView: LoadView;
    sceneCurrent: Scene;
    drive: DriveAPI;

    setEventListeners() {
        this.loadView.loadFileButton.addEventListener("click", () => { this.openFile() })
        this.loadView.buttonLoadLocal.addEventListener("click", () => { this.localLoad() })
        this.loadView.buttonLoadCloud.addEventListener("click", () => { this.cloudLoad() })
        this.loadView.buttonLocalSuppr.addEventListener("click", () => { this.supprLocal() });
        this.loadView.buttonConnectDrive.addEventListener("click", (e) => { this.drive.handleAuthClick(e) })
        this.loadView.aBigExemple.addEventListener("click", (e) => { this.getEx(e) })
        this.loadView.aLightExemple.addEventListener("click", (e) => { this.getEx(e) })
        this.loadView.aBigPreExemple.addEventListener("click", (e) => { this.getEx(e) })
        this.loadView.aLightPreExemple.addEventListener("click", (e) => { this.getEx(e) })
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
    getEx(e: Event) {
        e.preventDefault();
        var anchorTarget = <HTMLAnchorElement>e.target;
        App.getXHR(anchorTarget.href, (json: string) => { this.loadEx(json) }, null)
    }
    loadEx(json) {
        App.showFullPageLoading();

        this.sceneCurrent.recallScene(json);
    }
    supprLocal() {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {

            var name = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex].value
            localStorage.removeItem(name)
            var event: CustomEvent = new CustomEvent("updatelist")
            document.dispatchEvent(event);
        }
    }
    cloudLoad() {

        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            App.showFullPageLoading();
            var id = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex].value
            var name = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex].name
            var file = this.drive.getFile(id, (resp) => {this.getContent(resp) });
            console.log(file);
            //this.drive.downloadFile({ name, id }, (json) => { this.loadEx(json) })

        }
    }
    getContent(resp: DriveFile) {
        this.drive.downloadFile(resp, (json) => { this.sceneCurrent.recallScene(json)})
    }
}