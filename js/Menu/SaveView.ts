class SaveView {

    dynamicName: HTMLElement
    rulesName: HTMLElement;
    checkBoxPrecompile: HTMLInputElement;
    existingSceneSelect: HTMLSelectElement;
    inputDownload: HTMLInputElement;
    inputLocalStorage: HTMLInputElement;
    buttonDownloadApp: HTMLElement;
    buttonLocalSave: HTMLElement;
    dialogGoodNews: HTMLDivElement;

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
        nameAppTitle.textContent = " Telecharger la scene : ";
        nameAppTitle.className = "exportTitle";

        var dynamicName: HTMLSpanElement = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Scene.sceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;

        var rulesName: HTMLSpanElement = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.textContent = "Seules les lettres de l'alphabet et les nombres sont acceptés. Les espaces, les apostrophes et les accents sont automatiquement remplacés. Le nom ne peut pas commencer par un nombre ; il doit comporter entre 1 et 50 caractères.";
        this.rulesName = rulesName;

        var checkBoxPrecompile = document.createElement("input");
        checkBoxPrecompile.type = "checkbox";
        checkBoxPrecompile.id = "checkBoxPrecompile";
        this.checkBoxPrecompile = checkBoxPrecompile;

        var label = document.createElement("label");
        label.id = "labelDownload";
        label.textContent = "Précompilé (plus lourd)";
        label.appendChild(checkBoxPrecompile);


        var inputDownload: HTMLInputElement = document.createElement("input");
        inputDownload.id = "inputNameApp";
        inputDownload.className = "inputExport";
        inputDownload.value = Scene.sceneName;

        var downloadBottomButtonContainer: HTMLElement = document.createElement("div");
        downloadBottomButtonContainer.className = "bottomButtonContainer";


        var downloadButton: HTMLButtonElement = document.createElement("button");
        downloadButton.type = "button";
        downloadButton.id = "downloadButton";
        downloadButton.className = "button"
        downloadButton.textContent = "télécharger l'application";

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
        inputLocalStorage.value = Scene.sceneName;
        this.inputLocalStorage = inputLocalStorage;

        var dialogGoodNews = document.createElement("div");
        dialogGoodNews.id = "dialogGoodNews";
        dialogGoodNews.textContent = "Sauvegarde bien effectuée"
        dialogGoodNews.style.opacity = "0";
        this.dialogGoodNews = dialogGoodNews;

        var localButton: HTMLButtonElement = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localButton";
        localButton.className = "button"
        localButton.textContent = "sauvegarder localement";
        this.buttonLocalSave = localButton;

        var localBottomButtonContainer: HTMLElement = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";

        localBottomButtonContainer.appendChild(localButton);

        localSaveContainer.appendChild(existingSceneSelect);
        localSaveContainer.appendChild(inputLocalStorage);
        localSaveContainer.appendChild(dialogGoodNews);
        localSaveContainer.appendChild(localBottomButtonContainer);

        saveContainer.appendChild(downloadContainer);
        saveContainer.appendChild(localSaveContainer);
        saveContainer.appendChild(cloudSaveContainer);

        return saveContainer;
    }
}