    /// <reference path="../DriveAPI.ts"/>   
    
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
        this.loadView.buttonChangeAccount.addEventListener("click", (e) => { this.logOut()})
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

            Utilitary.showFullPageLoading();
            var option = <HTMLOptionElement>this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex]
            var name = option.value
            this.sceneCurrent.recallScene(localStorage.getItem(name))
        }
    }
    getEx(e: Event) {
        e.preventDefault();
        var anchorTarget = <HTMLAnchorElement>e.target;
        Utilitary.getXHR(anchorTarget.href, (json: string) => { this.loadEx(json) }, null)
    }
    loadEx(json) {
        Utilitary.showFullPageLoading();

        this.sceneCurrent.recallScene(json);
    }
    supprLocal() {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            var option = <HTMLOptionElement>this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex]
            var name = option.value
            localStorage.removeItem(name)
            var event: CustomEvent = new CustomEvent("updatelist")
            document.dispatchEvent(event);
        }
    }
    cloudLoad() {

        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = <HTMLOptionElement>this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex]
            var id = option.value
            var file = this.drive.getFile(id, (resp) => {this.getContent(resp) });
            console.log(file);
            //this.drive.downloadFile({ name, id }, (json) => { this.loadEx(json) })

        }
    }
    getContent(resp: DriveFile) {
        this.drive.downloadFile(resp, (json) => { this.sceneCurrent.recallScene(json)})
    }
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }
}