//ExportView

class ExportView {
    exportButton: HTMLElement;
    selectPlatform: HTMLElement;
    refreshButton: HTMLElement;
    inputNameApp: HTMLInputElement;
    buttonNameApp: HTMLButtonElement;
    dynamicName: HTMLSpanElement;
    rulesName: HTMLSpanElement;

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
        nameAppTitle.textContent = " le nom de l'application est : ";
        nameAppTitle.className = "exportTitle";

        var dynamicName: HTMLSpanElement = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Scene.sceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;

        var rulesName: HTMLSpanElement = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.textContent = "Seul les lettres de l'alphabet et les nombres sont acceptés. Les espaces, les apostrophes et les accents sont automatiquement remplacés. Le nom ne peut commencer par un nombre, il doit comporter entre 1 et 50 caractères.";
        this.rulesName = rulesName;

        var input: HTMLInputElement = document.createElement("input");
        input.id = "inputNameApp";
        input.value = Scene.sceneName;

        var button: HTMLButtonElement = document.createElement("button");
        button.type = "button";
        button.id = "buttonNameApp";
        button.className="button"
        button.textContent = "Modifier le nom de d'application";

        nameAppContainer.appendChild(nameAppTitle);
        nameAppContainer.appendChild(rulesName);
        nameAppContainer.appendChild(input);
        nameAppContainer.appendChild(button);

        this.inputNameApp = input;
        this.buttonNameApp = button;


/////////////////////////////////  export Options

        var exportOptionTitle: HTMLSpanElement = document.createElement("span");
        exportOptionTitle.id = "exportOptionTitle";
        exportOptionTitle.textContent = "Choix de l'export";
        exportOptionTitle.className = "exportTitle";

        var fwurl: HTMLInputElement = document.createElement("input");
        fwurl.id = "faustweburl";

        fwurl.value = "http://faustservice.grame.fr";


        var subfooter: HTMLDivElement = document.createElement('div');
        subfooter.id = "optionExportContainer"

        var refreshButton: HTMLDivElement = document.createElement("div");
        refreshButton.id = "refreshButton";
        refreshButton.innerHTML = '<svg version="1.0" id="svgRefreshButton" xmlns="http://www.w3.org/2000/svg" width="50.000000pt" height="50.000000pt" viewBox="0 0 50.000000 50.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M186 309 c-37 -29 -37 -89 0 -118 28 -22 69 -27 93 -12 23 15 3 30 -33 24 -29 -4 -37 -1 -51 21 -16 24 -16 28 -1 51 18 27 63 34 84 13 17 -17 15 -31 -3 -24 -20 7 -19 1 6 -28 l22 -25 18 24 c20 25 25 40 9 30 -5 -3 -16 7 -24 23 -25 47 -75 56 -120 21z"/></g></svg>';
        subfooter.appendChild(refreshButton);
        this.refreshButton = refreshButton;


        var selectDiv: HTMLDivElement = document.createElement("div");
        selectDiv.id = "selectDiv"
        subfooter.appendChild(selectDiv);

        var selectPlatform: HTMLSelectElement = document.createElement("select");
        selectPlatform.id = "platforms";
        selectPlatform.className = "selects";
        var self = this;
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
        exportButton.value = "Exporter";
        this.exportButton = exportButton;
        subfooter.appendChild(exportButton);

        exportOptionContainer.appendChild(exportOptionTitle);
        exportOptionContainer.appendChild(fwurl);
        exportOptionContainer.appendChild(subfooter);


//////////////////////////// export Result
        var exportResultTitle: HTMLSpanElement = document.createElement("span");
        exportResultTitle.id = "exportResultTitle";
        exportResultTitle.textContent = "Téléchargement";
        exportResultTitle.className = "exportTitle";


        exportResultContainer.appendChild(exportResultTitle);
    

        exportContainer.appendChild(nameAppContainer);
        exportContainer.appendChild(exportOptionContainer);
        exportContainer.appendChild(exportResultContainer);

        return exportContainer;

    }
}