//ExportView

   /// <reference path="../Utilitary.ts"/>


class ExportView {
    exportButton: HTMLElement;
    selectPlatform: HTMLElement;
    refreshButton: HTMLElement;
    inputNameApp: HTMLInputElement;
    inputServerUrl: HTMLInputElement;
    buttonNameApp: HTMLButtonElement;
    dynamicName: HTMLSpanElement;
    rulesName: HTMLSpanElement;
    downloadButton: HTMLButtonElement;
    moreOptionDiv: HTMLElement;
    lessOptionDiv: HTMLElement;
    optionContainer: HTMLElement;
    initExportView(): HTMLElement {

        var exportContainer: HTMLElement = document.createElement("div");
        exportContainer.id = "exportContent";
        exportContainer.className = "menuContent";

        var nameAppContainer: HTMLElement = document.createElement("div");
        nameAppContainer.id = "nameAppContainer";
        nameAppContainer.className = "exportSubmenu";

        var exportOptionContainer: HTMLElement = document.createElement("div");
        exportOptionContainer.id = "exportOptionContainer";
        exportOptionContainer.className = "exportSubmenu";

        var exportResultContainer: HTMLElement = document.createElement("div");
        exportResultContainer.id = "exportResultContainer";
        exportResultContainer.className = "exportSubmenu";

/////////////////////////////////  name App

        var nameAppTitle: HTMLSpanElement = document.createElement("span");
        nameAppTitle.id = "nameAppTitle";
        nameAppTitle.textContent = Utilitary.messageRessource.appNameExport;
        nameAppTitle.className = "exportTitle";

        var dynamicName: HTMLSpanElement = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Utilitary.currentScene.sceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;

        var rulesName: HTMLSpanElement = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.textContent = Utilitary.messageRessource.rulesSceneName;
        this.rulesName = rulesName;

        var input: HTMLInputElement = document.createElement("input");
        input.id = "inputNameApp";
        input.className = "inputExport";
        input.value = Utilitary.currentScene.sceneName;

        var renameBottomButtonContainer: HTMLElement = document.createElement("div");
        renameBottomButtonContainer.className = "bottomButtonContainer";

        var renameButton: HTMLButtonElement = document.createElement("button");
        renameButton.type = "button";
        renameButton.id = "buttonNameApp";
        renameButton.className = "button"
        renameButton.textContent = Utilitary.messageRessource.buttonChangeSceneName;

        renameBottomButtonContainer.appendChild(renameButton)

        nameAppContainer.appendChild(nameAppTitle);
        nameAppContainer.appendChild(rulesName);
        nameAppContainer.appendChild(input);
        nameAppContainer.appendChild(renameBottomButtonContainer);

        this.inputNameApp = input;
        this.buttonNameApp = renameButton;

        /////////////////////////////////  export Options
        var moreOptionDiv = document.createElement("div");
        moreOptionDiv.textContent = "+ plus d'options"
        moreOptionDiv.id = "moreOptionDiv";
        moreOptionDiv.style.display = "block";
        this.moreOptionDiv = moreOptionDiv;

        var optionContainer = document.createElement("div");
        optionContainer.id = "optionContainer";
        optionContainer.style.display = "none";
        this.optionContainer = optionContainer;

        var lessOptionDiv = document.createElement("div")
        lessOptionDiv.id = "lessOptionDiv";
        lessOptionDiv.textContent = Utilitary.messageRessource.lessOptions;
        lessOptionDiv.style.display = "none";
        this.lessOptionDiv = lessOptionDiv;

        var urlDiv: HTMLElement = document.createElement("div");
        urlDiv.id = "inputExport";

        var exportOptionTitle: HTMLSpanElement = document.createElement("span");
        exportOptionTitle.id = "exportOptionTitle";
        exportOptionTitle.textContent = Utilitary.messageRessource.titleExportOptions;
        exportOptionTitle.className = "exportTitle";

        var fwurl: HTMLInputElement = document.createElement("input");
        fwurl.id = "faustweburl";
        fwurl.className = "inputExport";
        fwurl.value = "https://faustservice.grame.fr";
        this.inputServerUrl = fwurl;

        urlDiv.appendChild(fwurl);

        var exportChoiceDiv: HTMLDivElement = document.createElement('div');
        exportChoiceDiv.id = "optionExportContainer"

        var refreshButton: HTMLButtonElement = document.createElement("button");
        refreshButton.textContent = Utilitary.messageRessource.buttonRefresh
        refreshButton.id = "refreshButton";
        refreshButton.className = "button";
        this.refreshButton = refreshButton;
        urlDiv.appendChild(refreshButton);

        var selectDiv: HTMLDivElement = document.createElement("div");
        selectDiv.id = "selectDiv"
        exportChoiceDiv.appendChild(selectDiv);

        var selectPlatform: HTMLSelectElement = document.createElement("select");
        selectPlatform.id = "platforms";
        selectPlatform.className = "selects";
        this.selectPlatform = selectPlatform;
        selectDiv.appendChild(selectPlatform);

        var selectArch: HTMLSelectElement = document.createElement("select");
        selectArch.id = "architectures";
        selectArch.className = "selects";
        selectDiv.appendChild(selectArch);

        var exportButton: HTMLInputElement = document.createElement("input");
        exportButton.id = "exportButton";
        exportButton.type = "submit";
        exportButton.className = "button";
        exportButton.value = Utilitary.messageRessource.buttonExportScene;
        this.exportButton = exportButton;

        var exportBottomButtonContainer: HTMLElement = document.createElement("div");
        exportBottomButtonContainer.className = "bottomButtonContainer";

        exportBottomButtonContainer.appendChild(exportButton);

        optionContainer.appendChild(exportOptionTitle)
        optionContainer.appendChild(urlDiv);
        optionContainer.appendChild(exportChoiceDiv);
        exportOptionContainer.appendChild(moreOptionDiv);
        exportOptionContainer.appendChild(lessOptionDiv);
        exportOptionContainer.appendChild(optionContainer);
        exportOptionContainer.appendChild(exportBottomButtonContainer);

//////////////////////////// export Result
        var exportResultTitle: HTMLSpanElement = document.createElement("span");
        exportResultTitle.id = "exportResultTitle";
        exportResultTitle.textContent = Utilitary.messageRessource.titleDownlaodExport;
        exportResultTitle.className = "exportTitle";
        exportResultContainer.appendChild(exportResultTitle);
        exportContainer.appendChild(nameAppContainer);
        exportContainer.appendChild(exportOptionContainer);
        exportContainer.appendChild(exportResultContainer);

        return exportContainer;
    }
}
