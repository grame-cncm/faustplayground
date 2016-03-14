class AccelerometerEditView {
    blockLayer: HTMLDivElement;
    container: HTMLDivElement;
    radioAxisContainer: HTMLFormElement;
    radioCurveContainer: HTMLFormElement;
    rangeContainer: HTMLDivElement;
    validButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;


    constructor() {

    }

    initAccelerometerEdit(): HTMLElement {

        var blockLayer = document.createElement("div");
        blockLayer.id = "accBlockLayer";
        this.blockLayer = blockLayer;

        var container = document.createElement("div")
        container.id = "accEditContainer";
        this.container = container;


        var radioAxisContainer = document.createElement("form")
        radioAxisContainer.id = "radioAxisContainer"
        this.radioAxisContainer = radioAxisContainer;

        var radioX = document.createElement("input");
        radioX.id = "radioX";
        radioX.type = "radio";
        radioX.className = "radio";
        radioX.name = "axis";
        radioX.textContent = "axe X";

        var radioY = document.createElement("input");
        radioY.id = "radioY";
        radioY.type = "radio";
        radioY.className = "radio";
        radioY.name = "axis";
        radioY.textContent = "axe Y";

        var radioZ = document.createElement("input");
        radioZ.id = "radioZ";
        radioZ.type = "radio";
        radioZ.className = "radio";
        radioZ.name = "axis";
        radioZ.textContent = "axe Z";

        radioAxisContainer.appendChild(radioX)
        radioAxisContainer.appendChild(radioY)
        radioAxisContainer.appendChild(radioZ)

        var radioCurveContainer = document.createElement("form")
        radioCurveContainer.id = "radioCurveContainer"
        this.radioCurveContainer = radioCurveContainer;

        var radio1 = document.createElement("input");
        radio1.id = "radio1";
        radio1.type = "radio";
        radio1.className = "radio curve";
        radio1.name = "curve";
        radio1.textContent = "curve 1";

        var radio2 = document.createElement("input");
        radio2.id = "radio2";
        radio2.type = "radio";
        radio2.className = "radio curve";
        radio2.name = "curve";
        radio2.textContent = "curve 2";

        var radio3 = document.createElement("input");
        radio3.id = "radio3";
        radio3.type = "radio";
        radio3.className = "radio curve";
        radio3.name = "curve";
        radio3.textContent = "curve 3";

        var radio4 = document.createElement("input");
        radio4.id = "radio4";
        radio4.type = "radio";
        radio4.className = "radio curve";
        radio4.name = "curve";
        radio4.textContent = "curve 4";

        radioCurveContainer.appendChild(radio1)
        radioCurveContainer.appendChild(radio2)
        radioCurveContainer.appendChild(radio3)
        radioCurveContainer.appendChild(radio4)

        var accRangeMax = document.createElement("input");
        accRangeMax.id = "accRangeMax";
        accRangeMax.className = "accRange";
        accRangeMax.type = "range";

        var accRangeMid = document.createElement("input");
        accRangeMid.id = "accRangeMid";
        accRangeMid.className = "accRange";
        accRangeMid.type = "range";

        var accRangeMin = document.createElement("input");
        accRangeMin.id = "accRangeMin";
        accRangeMin.className = "accRange";
        accRangeMin.type = "range";

        var accRangeCurrent = document.createElement("input");
        accRangeCurrent.id = "accRangeCurrent";
        accRangeCurrent.className = "accRange acc";
        accRangeCurrent.type = "range";

        var accRangeVirtual = document.createElement("input");
        accRangeVirtual.id = "accRangeVirtual";
        accRangeVirtual.className = "accRange acc";
        accRangeVirtual.type = "range";

        var rangeContainer = document.createElement("div")
        rangeContainer.id = "rangeContainer";
        this.rangeContainer = rangeContainer;

        rangeContainer.appendChild(accRangeMin);
        rangeContainer.appendChild(accRangeMid);
        rangeContainer.appendChild(accRangeMax);
        rangeContainer.appendChild(accRangeCurrent);
        rangeContainer.appendChild(accRangeVirtual);

        var validContainer = document.createElement("div")
        validContainer.id = "validContainer";

        var validButton = document.createElement("button");
        validButton.id = "validButton";
        validButton.className = "accButton";
        this.validButton = validButton;

        var cancelButton = document.createElement("button")
        cancelButton.id = "cancelButton";
        cancelButton.className = "accButton";
        this.cancelButton = cancelButton;


        validContainer.appendChild(cancelButton);
        validContainer.appendChild(validButton);

        container.appendChild(radioAxisContainer)
        container.appendChild(radioCurveContainer)
        container.appendChild(rangeContainer)
        container.appendChild(validContainer)

        blockLayer.appendChild(container);

        return blockLayer;

    }
}