/// <reference path="../Connect.ts"/>
var ModuleFaust = (function () {
    function ModuleFaust(name) {
        this.fOutputConnections = [];
        this.fInputConnections = [];
        this.recallOutputsDestination = [];
        this.recallInputsSource = [];
        this.fName = name;
    }
    /*************** ACTIONS ON IN/OUTPUT MODULES ***************************/
    // ------ Returns Connection Array OR null if there are none
    ModuleFaust.prototype.getInputConnections = function () {
        return this.fInputConnections;
    };
    ModuleFaust.prototype.getOutputConnections = function () {
        return this.fOutputConnections;
    };
    ModuleFaust.prototype.addOutputConnection = function (connector) {
        this.fOutputConnections.push(connector);
    };
    ModuleFaust.prototype.addInputConnection = function (connector) {
        this.fInputConnections.push(connector);
    };
    ModuleFaust.prototype.removeOutputConnection = function (connector) {
        this.fOutputConnections.splice(this.fOutputConnections.indexOf(connector), 1);
    };
    ModuleFaust.prototype.removeInputConnection = function (connector) {
        this.fInputConnections.splice(this.fInputConnections.indexOf(connector), 1);
    };
    /********************** GET/SET SOURCE/NAME/DSP ***********************/
    ModuleFaust.prototype.setSource = function (code) {
        this.fSource = code;
    };
    ModuleFaust.prototype.getSource = function () { return this.fSource; };
    ModuleFaust.prototype.getName = function () { return this.fName; };
    ModuleFaust.prototype.getDSP = function () {
        return this.fDSP;
    };
    return ModuleFaust;
}());
//# sourceMappingURL=ModuleFaust.js.map