class LoadView {

    loadFileButton: HTMLButtonElement;
    loadFileInput: HTMLInputElement;
    existingSceneSelect: HTMLSelectElement;
    loadLocalButton: HTMLButtonElement;
    aBigExemple: HTMLAnchorElement;
    aLightExemple: HTMLAnchorElement;


    initLoadView():HTMLElement {
        var loadContainer: HTMLElement = document.createElement("div");
        loadContainer.id = "loadContainer";
        loadContainer.className = "menuContent";

        var loadFileContainer: HTMLElement = document.createElement("div");
        loadFileContainer.id = "loadFileContainer";
        loadFileContainer.className = "exportSubmenu";

        var loadLocalContainer: HTMLElement = document.createElement("div");
        loadLocalContainer.id = "loadLocalContainer";
        loadLocalContainer.className = "exportSubmenu";

        var loadCloudContainer: HTMLElement = document.createElement("div");
        loadCloudContainer.id = "loadCloudContainer";
        loadCloudContainer.className = "exportSubmenu";

        ////////////////////////////////////////load file

        var loadFileBottomButtonContainer: HTMLElement = document.createElement("div");
        loadFileBottomButtonContainer.className = "bottomButtonContainer";


        var loadFileInput = document.createElement("input");
        loadFileInput.type = "file";
        loadFileInput.id = "loadFileInput";
        this.loadFileInput = loadFileInput;

        var aLightExemple = document.createElement("a");
        aLightExemple.id = "aLightExemple";
        aLightExemple.className="exempleAnchor"
        aLightExemple.textContent = "Small exemple";
        this.aLightExemple = aLightExemple;
        var aBigExemple = document.createElement("a");
        aBigExemple.id = "aBigExemple";
        aBigExemple.className = "exempleAnchor"
        aBigExemple.textContent = "Big exemple";
        this.aBigExemple = aBigExemple;


        var loadFileButton: HTMLButtonElement = document.createElement("button");
        loadFileButton.type = "button";
        loadFileButton.id = "loadFileButton";
        loadFileButton.className = "button"
        loadFileButton.textContent = "Charger un fichier";
        this.loadFileButton = loadFileButton;

        loadFileContainer.appendChild(loadFileInput);
        loadFileContainer.appendChild(aLightExemple);
        loadFileContainer.appendChild(aBigExemple);

        loadFileBottomButtonContainer.appendChild(loadFileButton)

        loadFileContainer.appendChild(loadFileBottomButtonContainer);

        ////////////////////////////////////////local load

        var existingSceneSelect = document.createElement("select");
        existingSceneSelect.id = "existingLoadSceneSelect";
        existingSceneSelect.className = "sceneSelect";
        existingSceneSelect.size = 7;
        Ps.initialize(existingSceneSelect, { suppressScrollX: true, theme: 'my-theme-name' })

        this.existingSceneSelect = existingSceneSelect;



        var localButton: HTMLButtonElement = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localLoadButton";
        localButton.className = "button"
        localButton.textContent = "charger une scene locale";
        this.loadLocalButton = localButton;

        var localBottomButtonContainer: HTMLElement = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";

        localBottomButtonContainer.appendChild(localButton);

        loadLocalContainer.appendChild(existingSceneSelect);
        loadLocalContainer.appendChild(localBottomButtonContainer);
        //////////////////////////////////////load Cloud

        var tempCloud = document.createElement("div");
        tempCloud.id = "tempCloud";
        tempCloud.textContent = "cloud load";

        loadCloudContainer.appendChild(tempCloud);

        loadContainer.appendChild(loadFileContainer);
        loadContainer.appendChild(loadLocalContainer);
        loadContainer.appendChild(loadCloudContainer);

        return loadContainer;


    }
}