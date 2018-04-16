    /// <reference path="../Utilitary.ts"/>

class SaveView {

    dynamicName: HTMLElement
    rulesName: HTMLElement;
    checkBoxPrecompile: HTMLInputElement;
    existingSceneSelect: HTMLSelectElement;
    inputDownload: HTMLInputElement;
    inputLocalStorage: HTMLInputElement;
    inputCloudStorage: HTMLInputElement;
    buttonDownloadApp: HTMLElement;
    buttonLocalSave: HTMLElement;
    buttonLocalSuppr: HTMLElement;
    buttonCloudSuppr: HTMLElement;
    buttonConnectDrive: HTMLElement;
    buttonChangeAccount: HTMLElement;
    dialogGoodNews: HTMLDivElement;
    cloudSelectFile: HTMLSelectElement;
    buttonSaveCloud: HTMLElement;
    driveContainer: HTMLElement;

    initSaveView() {
        var saveContainer = document.createElement("div");
        saveContainer.id = "saveContainer";
        saveContainer.className = "menuContent";

        var downloadContainer: HTMLElement = document.createElement("div");
        downloadContainer.id = "downloadContainer";
        downloadContainer.className = "exportSubmenu";

        var localSaveContainer: HTMLElement = document.createElement("div");
        localSaveContainer.id = "localSaveContainer";
        localSaveContainer.className = "exportSubmenu";

        var cloudSaveContainer: HTMLElement = document.createElement("div");
        cloudSaveContainer.id = "cloudSaveContainer";
        cloudSaveContainer.className = "exportSubmenu";

        ////////////////////////////////// download App

        var nameAppTitle: HTMLSpanElement = document.createElement("span");
        nameAppTitle.id = "nameAppTitle";
        nameAppTitle.textContent = Utilitary.messageRessource.saveDownload;
        nameAppTitle.className = "exportTitle";

        var dynamicName: HTMLSpanElement = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Utilitary.messageRessource.defaultSceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;

        var rulesName: HTMLSpanElement = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.style.display = "none";
        rulesName.textContent = Utilitary.messageRessource.rulesSceneName;
        this.rulesName = rulesName;

        var checkBoxPrecompile = document.createElement("input");
        checkBoxPrecompile.type = "checkbox";
        checkBoxPrecompile.id = "checkBoxPrecompile";
        this.checkBoxPrecompile = checkBoxPrecompile;

        var label = document.createElement("label");
        label.id = "labelDownload";
        label.textContent = Utilitary.messageRessource.precompileOption;
        label.appendChild(checkBoxPrecompile);

        var inputDownload: HTMLInputElement = document.createElement("input");
        inputDownload.id = "inputNameApp";
        inputDownload.style.display = "none";
        inputDownload.className = "inputExport";
        inputDownload.value = Utilitary.currentScene.sceneName;

        var downloadBottomButtonContainer: HTMLElement = document.createElement("div");
        downloadBottomButtonContainer.className = "bottomButtonContainer";

        var downloadButton: HTMLButtonElement = document.createElement("button");
        downloadButton.type = "button";
        downloadButton.id = "downloadButton";
        downloadButton.className = "button"
        downloadButton.textContent = Utilitary.messageRessource.buttonDownloadApp;

        downloadBottomButtonContainer.appendChild(downloadButton)
        downloadContainer.appendChild(nameAppTitle);
        downloadContainer.appendChild(rulesName);
        downloadContainer.appendChild(label);
        downloadContainer.appendChild(inputDownload);
        downloadContainer.appendChild(downloadBottomButtonContainer);

        this.inputDownload = inputDownload;
        this.buttonDownloadApp = downloadButton;

        ////////////////////////////////////////local save

        var existingSceneSelect = document.createElement("select");
        existingSceneSelect.id = "existingSceneSelect";
        existingSceneSelect.className = "sceneSelect";

        existingSceneSelect.size = 7;
        Ps.initialize(existingSceneSelect, { suppressScrollX: true, theme: 'my-theme-name' })

        this.existingSceneSelect = existingSceneSelect;

        var inputLocalStorage: HTMLInputElement = document.createElement("input");
        inputLocalStorage.id = "inputNameApp";
        inputLocalStorage.className = "inputExport";
        inputLocalStorage.style.display = "none";
        inputLocalStorage.value = Utilitary.currentScene.sceneName;
        this.inputLocalStorage = inputLocalStorage;

        var dialogGoodNews = document.createElement("div");
        dialogGoodNews.id = "dialogGoodNews";
        dialogGoodNews.textContent = Utilitary.messageRessource.sucessSave;
        dialogGoodNews.style.opacity = "0";
        this.dialogGoodNews = dialogGoodNews;

        var localButtonSuppr: HTMLButtonElement = document.createElement("button");
        localButtonSuppr.type = "button";
        localButtonSuppr.id = "localButtonSuppr";
        localButtonSuppr.className = "button"
        localButtonSuppr.textContent = Utilitary.messageRessource.buttonSuppress;
        this.buttonLocalSuppr = localButtonSuppr;

        var localButton: HTMLButtonElement = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localButton";
        localButton.className = "button"
        localButton.textContent = Utilitary.messageRessource.buttonLocalSave;
        this.buttonLocalSave = localButton;

        var localBottomButtonContainer: HTMLElement = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";

        localBottomButtonContainer.appendChild(localButton);

        localSaveContainer.appendChild(existingSceneSelect);
        localSaveContainer.appendChild(localButtonSuppr);
        localSaveContainer.appendChild(inputLocalStorage);
        localSaveContainer.appendChild(dialogGoodNews);
        localSaveContainer.appendChild(localBottomButtonContainer);
        ////////////////////////////////////////////cloud save

        var driveContainer = document.createElement("div");
        driveContainer.id = "driveContainerSave";
        this.driveContainer = driveContainer;

        var buttonConnectDrive = document.createElement("button");
        buttonConnectDrive.id = "buttonConnectSaveDrive";
        buttonConnectDrive.textContent = Utilitary.messageRessource.buttonConnectCloud;
        buttonConnectDrive.className = "button";
        this.buttonConnectDrive = buttonConnectDrive

        var selectDrive = document.createElement("select");
        selectDrive.size = 6;
        selectDrive.id = "saveSceneSelectDrive";
        selectDrive.className = "sceneSelect "
        selectDrive.style.display = "none";
        this.cloudSelectFile = selectDrive;

        var inputCloudStorage: HTMLInputElement = document.createElement("input");
        inputCloudStorage.id = "inputNameApp";
        inputCloudStorage.className = "inputExport";
        inputCloudStorage.value = Utilitary.currentScene.sceneName;
        inputCloudStorage.style.display = "none";
        this.inputCloudStorage = inputCloudStorage;

        var cloudButtonSuppr: HTMLButtonElement = document.createElement("button");
        cloudButtonSuppr.type = "button";
        cloudButtonSuppr.id = "cloudButtonSuppr";
        cloudButtonSuppr.className = "button"
        cloudButtonSuppr.style.display = "none";
        cloudButtonSuppr.textContent = Utilitary.messageRessource.buttonSuppress;
        this.buttonCloudSuppr = cloudButtonSuppr;

        var cloudButton: HTMLButtonElement = document.createElement("button");
        cloudButton.type = "button";
        cloudButton.id = "cloudSaveButton";
        cloudButton.className = "button"
        cloudButton.textContent = Utilitary.messageRessource.buttonCloudSave;
        this.buttonSaveCloud = cloudButton;

        var changeAccountButton: HTMLButtonElement = document.createElement("button");
        changeAccountButton.type = "button";
        //changeAccountButton.id = "changeAccountButton";
        changeAccountButton.className = "button changeAccountButton"
        changeAccountButton.textContent = Utilitary.messageRessource.buttonLogoutCloud;
        changeAccountButton.style.display = "none";
        this.buttonChangeAccount = changeAccountButton;

        var cloudBottomButtonContainer: HTMLElement = document.createElement("div");
        cloudBottomButtonContainer.className = "bottomButtonContainer";
        cloudBottomButtonContainer.appendChild(cloudButton);

        driveContainer.appendChild(buttonConnectDrive);
        driveContainer.appendChild(changeAccountButton);
        driveContainer.appendChild(selectDrive);
        driveContainer.appendChild(cloudButtonSuppr);
        driveContainer.appendChild(inputCloudStorage);
        driveContainer.appendChild(cloudBottomButtonContainer);

        cloudSaveContainer.appendChild(driveContainer);

        saveContainer.appendChild(downloadContainer);
        saveContainer.appendChild(localSaveContainer);
        saveContainer.appendChild(cloudSaveContainer);

        return saveContainer;
    }
}
