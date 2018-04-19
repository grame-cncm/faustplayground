   /// <reference path="../Utilitary.ts"/>

class AccelerometerEditView {
    blockLayer: HTMLDivElement;
    container: HTMLDivElement;
    radioAxisContainer: HTMLFormElement;
    radioCurveContainer: HTMLFormElement;
    checkeOnOffContainer: HTMLFormElement;
    cloneContainer: HTMLDivElement;
    checkeOnOff: HTMLInputElement;
    labelTitle: HTMLLabelElement;
    rangeContainer: HTMLDivElement;
    validButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
    radioCurve1: HTMLInputElement;
    radioCurve2: HTMLInputElement;
    radioCurve3: HTMLInputElement;
    radioCurve4: HTMLInputElement;
    radioAxis0: HTMLInputElement;
    radioAxisX: HTMLInputElement;
    radioAxisY: HTMLInputElement;
    radioAxisZ: HTMLInputElement;
    rangeMin: HTMLInputElement;
    rangeMid: HTMLInputElement;
    rangeMax: HTMLInputElement;
    rangeVirtual: HTMLInputElement;
    rangeCurrent: HTMLInputElement;

    constructor() {}

    initAccelerometerEdit(): HTMLElement {

        var blockLayer = document.createElement("div");
        blockLayer.id = "accBlockLayer";
        this.blockLayer = blockLayer;

        var container = document.createElement("div")
        container.id = "accEditContainer";
        this.container = container;

        var labelTitle = document.createElement("label");
        labelTitle.id = "labelTitle";
        this.labelTitle = labelTitle;

        //radio curves

        var radioCurveContainer = document.createElement("form")
        radioCurveContainer.id = "radioCurveContainer"
        this.radioCurveContainer = radioCurveContainer;

        var label1 = document.createElement("label");
        label1.className = "curve"
        label1.id = "curve1"
        label1.textContent = Utilitary.messageRessource.curve1;

        var label2 = document.createElement("label");
        label2.className = "curve"
        label2.id = "curve2"
        label2.textContent = Utilitary.messageRessource.curve2;

        var label3 = document.createElement("label");
        label3.className = "curve"
        label3.id = "curve3"
        label3.textContent = Utilitary.messageRessource.curve3;

        var label4 = document.createElement("label");
        label4.className = "curve"
        label4.id = "curve4"
        label4.textContent = Utilitary.messageRessource.curve4;

        var radio1 = document.createElement("input");
        radio1.id = "radio1";
        radio1.type = "radio";
        radio1.className = "radio";
        radio1.name = "curve";
        this.radioCurve1 = radio1;
        label1.appendChild(radio1);

        var radio2 = document.createElement("input");
        radio2.id = "radio2";
        radio2.type = "radio";
        radio2.className = "radio";
        radio2.name = "curve";
        this.radioCurve2 = radio2;
        label2.appendChild(radio2);


        var radio3 = document.createElement("input");
        radio3.id = "radio3";
        radio3.type = "radio";
        radio3.className = "radio";
        radio3.name = "curve";
        this.radioCurve3 = radio3;
        label3.appendChild(radio3);

        var radio4 = document.createElement("input");
        radio4.id = "radio4";
        radio4.type = "radio";
        radio4.className = "radio";
        radio4.name = "curve";
        this.radioCurve4 = radio4;
        label4.appendChild(radio4);


        radioCurveContainer.appendChild(label1)
        radioCurveContainer.appendChild(label2)
        radioCurveContainer.appendChild(label3)
        radioCurveContainer.appendChild(label4)

        // radio Axis

        var radioAxisContainer = document.createElement("form")
        radioAxisContainer.id = "radioAxisContainer"
        this.radioAxisContainer = radioAxisContainer;

        var label0 = document.createElement("label");
        label0.className = "axe";
        label0.id = "axe0";
        label0.textContent = Utilitary.messageRessource.axis0;

        var labelX = document.createElement("label");
        labelX.className = "axe";
        labelX.id = "axeX";
        labelX.textContent = Utilitary.messageRessource.axisX;

        var labelY = document.createElement("label");
        labelY.className = "axe";
        labelY.id = "axeY";
        labelY.textContent = Utilitary.messageRessource.axisY;

        var labelZ = document.createElement("label");
        labelZ.className = "axe";
        labelZ.id = "axeZ";
        labelZ.textContent = Utilitary.messageRessource.axisZ;

        var radio0 = document.createElement("input");
        radio0.id = "radio0";
        radio0.type = "checkbox";
        radio0.className = "radio";
        radio0.name = "axis";
        this.radioAxis0 = radio0;
        label0.appendChild(radio0);

        var radioX = document.createElement("input");
        radioX.id = "radioX";
        radioX.type = "radio";
        radioX.className = "radio";
        radioX.name = "axis";
        this.radioAxisX = radioX;
        labelX.appendChild(radioX);

        var radioY = document.createElement("input");
        radioY.id = "radioY";
        radioY.type = "radio";
        radioY.className = "radio";
        radioY.name = "axis";
        this.radioAxisY = radioY;
        labelY.appendChild(radioY);

        var radioZ = document.createElement("input");
        radioZ.id = "radioZ";
        radioZ.type = "radio";
        radioZ.className = "radio";
        radioZ.name = "axis";
        this.radioAxisZ = radioZ;
        labelZ.appendChild(radioZ);

        radioAxisContainer.appendChild(label0)
        radioAxisContainer.appendChild(labelX)
        radioAxisContainer.appendChild(labelY)
        radioAxisContainer.appendChild(labelZ)

        // checkbox On/Off accelerometer

        var checkOnOffContainer = document.createElement("form");
        checkOnOffContainer.id = "checkOnOffContainer";
        this.checkeOnOffContainer = checkOnOffContainer;

        var checkOnOffLabel = document.createElement("label");
        checkOnOffLabel.id = "checkOnOffLabel";
        checkOnOffLabel.textContent = Utilitary.messageRessource.checkBox;
        checkOnOffContainer.appendChild(checkOnOffLabel);

        var checkOnOff = document.createElement("input");
        checkOnOff.type = "checkbox";
        checkOnOff.id = "checkOnOff";
        this.checkeOnOff = checkOnOff;
        checkOnOffLabel.appendChild(checkOnOff); checkOnOffLabel

        // Clone
        var cloneContainer = document.createElement("div");
        cloneContainer.id = "cloneContainer";
        this.cloneContainer = cloneContainer;

        //Mapping ranges
        var accRangeMax = document.createElement("input");
        accRangeMax.id = "accRangeMax";
        accRangeMax.className = "accRange";
        accRangeMax.type = "range";
        this.rangeMax = accRangeMax;

        var accRangeMid = document.createElement("input");
        accRangeMid.id = "accRangeMid";
        accRangeMid.className = "accRange";
        accRangeMid.type = "range";
        this.rangeMid = accRangeMid;

        var accRangeMin = document.createElement("input");
        accRangeMin.id = "accRangeMin";
        accRangeMin.className = "accRange";
        accRangeMin.type = "range";
        this.rangeMin = accRangeMin;

        var accRangeCurrent = document.createElement("input");
        accRangeCurrent.id = "accRangeCurrent";
        accRangeCurrent.className = "accRange acc";
        accRangeCurrent.type = "range";
        accRangeCurrent.disabled = true;
        this.rangeCurrent = accRangeCurrent;

        var accRangeVirtual = document.createElement("input");
        accRangeVirtual.id = "accRangeVirtual";
        accRangeVirtual.className = "accRange acc";
        accRangeVirtual.type = "range";
        this.rangeVirtual = accRangeVirtual;

        var rangeContainer = document.createElement("div")
        rangeContainer.id = "rangeContainer";
        this.rangeContainer = rangeContainer;

        rangeContainer.appendChild(accRangeMin);
        rangeContainer.appendChild(accRangeMid);
        rangeContainer.appendChild(accRangeMax);
        rangeContainer.appendChild(accRangeCurrent);
        rangeContainer.appendChild(accRangeVirtual);

        //Validation cancelation buttons

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

        container.appendChild(radioCurveContainer);
        container.appendChild(radioAxisContainer);
        container.appendChild(checkOnOffContainer);
        container.appendChild(cloneContainer);
        container.appendChild(rangeContainer);
        container.appendChild(validContainer);

        blockLayer.appendChild(container);

        return blockLayer;
    }
}
