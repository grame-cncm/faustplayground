    /// <reference path="../DriveAPI.ts"/>   
    /// <reference path="LoadView.ts"/>   
    
class Load {
    loadView: LoadView;
    sceneCurrent: Scene;
    drive: DriveAPI;

    //Set event listener
    setEventListeners() {
        this.loadView.loadFileButton.addEventListener("click", () => { this.openFile() })
        this.loadView.buttonLoadLocal.addEventListener("click", () => { this.localLoad() })
        this.loadView.buttonLoadCloud.addEventListener("click", () => { this.cloudLoad() })
        this.loadView.buttonConnectDrive.addEventListener("click", (e) => { this.drive.handleAuthClick(e) })
        
        // 15/04/18 : not working anymore deactivated 
        //this.loadView.aBigExemple.addEventListener("click", (e) => { this.getEx(e) })
        //this.loadView.aLightExemple.addEventListener("click", (e) => { this.getEx(e) })
        //this.loadView.aBigPreExemple.addEventListener("click", (e) => { this.getEx(e) })
        //this.loadView.aLightPreExemple.addEventListener("click", (e) => { this.getEx(e) })
        
        this.loadView.buttonChangeAccount.addEventListener("click", (e) => { this.logOut()})
    }

    //open file from browser dialogue open window
    openFile() {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event: CustomEvent = new CustomEvent("fileload", { 'detail': file })
            document.dispatchEvent(event);
        }
    }

    //load scene from local storage
    localLoad() {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = <HTMLOptionElement>this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex]
            var name = option.value
            this.sceneCurrent.recallScene(localStorage.getItem(name))
        }
    }

    //load exemple
    getEx(e: Event) {
        e.preventDefault();
        var anchorTarget = <HTMLAnchorElement>e.target;
        Utilitary.getXHR(anchorTarget.href, (json: string) => { this.loadEx(json) }, null)
    }
    loadEx(json) {
        Utilitary.showFullPageLoading();

        this.sceneCurrent.recallScene(json);
    }

    //load file scene from cloud Drive API
    //get id file from Drive API then is able to get content
    cloudLoad() {

        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = <HTMLOptionElement>this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex]
            var id = option.value
            var file = this.drive.getFile(id, (resp) => {this.getContent(resp) });
            console.log(file);
        }
    }
    // get content from file loaded from cloud
    getContent(resp: DriveFile) {
        this.drive.downloadFile(resp, (json) => { this.sceneCurrent.recallScene(json)})
    }

    //logOut from google account
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }
}