class ModuleView {
    fModuleContainer: HTMLElement;



    createModuleView(ID: number, x: number, y: number, name: string, parent: HTMLElement, module: ModuleClass): void {
        var self: ModuleView = this

        // ---- Capturing module instance	
        // ----- Delete Callback was added to make sure 
        // ----- the module is well deleted from the scene containing it

        //------- GRAPHICAL ELEMENTS OF MODULE
        var fModuleContainer = self.fModuleContainer
        fModuleContainer = document.createElement("div");
        fModuleContainer.className = "moduleFaust";
        fModuleContainer.style.left = "" + x + "px";
        fModuleContainer.style.top = "" + y + "px";

        var fTitle = document.createElement("h6");
        fTitle.className = "module-title";
        fTitle.textContent = "";
        fModuleContainer.appendChild(fTitle);

        var fInterfaceContainer = <HTMLInterfaceContainer>document.createElement("div");
        fInterfaceContainer.className = "content";
        fModuleContainer.appendChild(fInterfaceContainer);
        //var eventHandler = function (event) { self.dragCallback(event, self) }
        fModuleContainer.addEventListener("mousedown", module.eventDraggingHandler, true);

        if (name == "input") {
            fModuleContainer.id = "moduleInput";
        } else if (name == "output") {
            fModuleContainer.id = "moduleOutput";
        } else {
            var fFooter: HTMLElement = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;
            var fCloseButton: HTMLAnchorElement = document.createElement("a");
            fCloseButton.href = "#";
            fCloseButton.className = "close";
            fCloseButton.onclick = function () { module.deleteModule(); };
            fModuleContainer.appendChild(fCloseButton);
            var fEditImg = <HTMLfEdit>document.createElement("img");
            fEditImg.src = App.baseImg + "edit.png";

            fEditImg.onclick = function () { module.edit(module); };
            fFooter.appendChild(fEditImg);
            fModuleContainer.appendChild(fFooter);

        }
        
        fModuleContainer.ondrop = function (e) {
            module.sceneParent.parent.uploadOn(module.sceneParent.parent, module, 0, 0, e);
            return true;
        };
        // add the node into the soundfield
        parent.appendChild(fModuleContainer);
        
        //---- Redirect drop to main.js

        var fName = name;

    }

}