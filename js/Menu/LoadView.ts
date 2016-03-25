class LoadView {

    loadFileButton: HTMLButtonElement;
    loadFileInput: HTMLInputElement;
    existingSceneSelect: HTMLSelectElement;
    buttonLoadLocal: HTMLButtonElement;
    buttonLocalSuppr: HTMLElement;
    buttonConnectDrive: HTMLElement;
    buttonLoadCloud: HTMLElement;
    aBigExemple: HTMLAnchorElement;
    aLightExemple: HTMLAnchorElement;
    aBigPreExemple: HTMLAnchorElement;
    aLightPreExemple: HTMLAnchorElement;
    cloudSelectFile: HTMLSelectElement;


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
        aLightExemple.className = "exempleAnchor"
        aLightExemple.textContent = "Small exemple";
        aLightExemple.href = "json/patch_light.json"
        aLightExemple.draggable = false;
        this.aLightExemple = aLightExemple;

        var aBigExemple = document.createElement("a");
        aBigExemple.id = "aBigExemple";
        aBigExemple.className = "exempleAnchor"
        aBigExemple.textContent = "Big exemple";
        aBigExemple.href = "json/patch_big.json"
        aBigExemple.draggable = false;
        this.aBigExemple = aBigExemple;

        var aLightPreExemple = document.createElement("a");
        aLightPreExemple.id = "aLightPreExemple";
        aLightPreExemple.className = "exempleAnchor"
        aLightPreExemple.textContent = "Small exemple precompile";
        aLightPreExemple.href = "json/patch_light_precompile.json"
        aLightPreExemple.draggable = false;
        this.aLightPreExemple = aLightPreExemple;

        var aBigPreExemple = document.createElement("a");
        aBigPreExemple.id = "aBigPreExemple";
        aBigPreExemple.className = "exempleAnchor"
        aBigPreExemple.textContent = "Big exemple precompile";
        aBigPreExemple.href = "json/patch_big_precompile.json"
        aBigPreExemple.draggable = false;
        this.aBigPreExemple = aBigPreExemple;


        var loadFileButton: HTMLButtonElement = document.createElement("button");
        loadFileButton.type = "button";
        loadFileButton.id = "loadFileButton";
        loadFileButton.className = "button"
        loadFileButton.textContent = "Charger un fichier";
        this.loadFileButton = loadFileButton;

        loadFileContainer.appendChild(loadFileInput);
        loadFileContainer.appendChild(aLightExemple);
        loadFileContainer.appendChild(aLightPreExemple);

        loadFileContainer.appendChild(aBigExemple);
        loadFileContainer.appendChild(aBigPreExemple);

        loadFileBottomButtonContainer.appendChild(loadFileButton)

        loadFileContainer.appendChild(loadFileBottomButtonContainer);

        ////////////////////////////////////////local load

        var existingSceneSelect = document.createElement("select");
        existingSceneSelect.id = "existingLoadSceneSelect";
        existingSceneSelect.className = "sceneSelect";
        existingSceneSelect.size = 7;
        Ps.initialize(existingSceneSelect, { suppressScrollX: true, theme: 'my-theme-name' })

        this.existingSceneSelect = existingSceneSelect;

        var localButtonSuppr: HTMLButtonElement = document.createElement("button");
        localButtonSuppr.type = "button";
        localButtonSuppr.id = "localButtonSuppr";
        localButtonSuppr.className = "button"
        localButtonSuppr.textContent = "supprimer la scene";
        this.buttonLocalSuppr = localButtonSuppr;

        var localButton: HTMLButtonElement = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localLoadButton";
        localButton.className = "button"
        localButton.textContent = "charger une scene locale";
        this.buttonLoadLocal = localButton;

        var localBottomButtonContainer: HTMLElement = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";

        localBottomButtonContainer.appendChild(localButton);

        loadLocalContainer.appendChild(existingSceneSelect);
        loadLocalContainer.appendChild(localButtonSuppr);
        loadLocalContainer.appendChild(localBottomButtonContainer);
        //////////////////////////////////////load Cloud

        var tempCloud = document.createElement("div");
        tempCloud.id = "tempCloud";
        tempCloud.textContent = "cloud load";

        var buttonConnectDrive = document.createElement("button");
        buttonConnectDrive.id = "buttonConnectDrive";
        buttonConnectDrive.textContent = "connection à google drive";
        this.buttonConnectDrive = buttonConnectDrive

        var selectDrive = document.createElement("select");
        selectDrive.size = 6;
        selectDrive.id = "existingSceneSelectDrive";
        selectDrive.style.display = "none";
        this.cloudSelectFile = selectDrive;

        var cloudButton: HTMLButtonElement = document.createElement("button");
        cloudButton.type = "button";
        cloudButton.id = "cloudLoadButton";
        cloudButton.className = "button"
        cloudButton.textContent = "charger une scene depuis le drive";
        this.buttonLoadCloud = cloudButton;

        var cloudBottomButtonContainer: HTMLElement = document.createElement("div");
        cloudBottomButtonContainer.className = "bottomButtonContainer";
        cloudBottomButtonContainer.appendChild(cloudButton);

        loadCloudContainer.appendChild(tempCloud);
        loadCloudContainer.appendChild(buttonConnectDrive);
        loadCloudContainer.appendChild(selectDrive);
        loadCloudContainer.appendChild(cloudBottomButtonContainer);

        loadContainer.appendChild(loadFileContainer);
        loadContainer.appendChild(loadLocalContainer);
        loadContainer.appendChild(loadCloudContainer);

        return loadContainer;


    }
}