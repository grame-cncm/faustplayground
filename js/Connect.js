/*				CONNECT.JS
    Handles Audio/Graphical Connection/Deconnection of modules
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.

    DEPENDENCIES :
        - ModuleClass.js
        - webaudio-asm-wrapper.js
        - Dragging.js
        
*/
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="Main.ts"/>
/// <reference path="App.ts"/>
"use strict";
var Connector = (function () {
    function Connector() {
    }
    Connector.prototype.connectInput = function (inputModule, divSrc) {
        divSrc.audioNode.connect(inputModule.moduleFaust.getDSP().getProcessor());
    };
    Connector.prototype.connectOutput = function (outputModule, divOut) {
        outputModule.moduleFaust.getDSP().getProcessor().connect(divOut.audioNode);
    };
    // Connect Nodes in Web Audio Graph
    Connector.prototype.connectModules = function (source, destination) {
        var sourceDSP;
        var destinationDSP;
        if (destination != null && destination.moduleFaust.getDSP) {
            destinationDSP = destination.moduleFaust.getDSP();
        }
        if (source.moduleFaust.getDSP) {
            sourceDSP = source.moduleFaust.getDSP();
        }
        if (sourceDSP.getProcessor && destinationDSP.getProcessor()) {
            sourceDSP.getProcessor().connect(destinationDSP.getProcessor());
        }
    };
    Connector.prototype.disconnectOutput = function (destination, source) {
        destination.audioNode.context.suspend();
    };
    // Disconnect Nodes in Web Audio Graph
    Connector.prototype.disconnectModules = function (source, destination) {
        // We want to be dealing with the audio node elements from here on
        var sourceCopy = source;
        var sourceCopyDSP;
        // Searching for src/dst DSP if existing
        if (sourceCopy != undefined && sourceCopy.moduleFaust.getDSP) {
            sourceCopyDSP = sourceCopy.moduleFaust.getDSP();
            sourceCopyDSP.getProcessor().disconnect();
        }
        // Reconnect all disconnected connections (because disconnect API cannot break a single connection)
        if (source != undefined && source.moduleFaust.getOutputConnections()) {
            for (var i = 0; i < source.moduleFaust.getOutputConnections().length; i++) {
                if (source.moduleFaust.getOutputConnections()[i].destination != destination)
                    this.connectModules(source, source.moduleFaust.getOutputConnections()[i].destination);
            }
        }
    };
    /**************************************************/
    /***************** Save Connection*****************/
    /**************************************************/
    //----- Add connection to src and dst connections structures
    Connector.prototype.saveConnection = function (source, destination, connectorShape) {
        this.connectorShape = connectorShape;
        this.destination = destination;
        this.source = source;
    };
    /***************************************************************/
    /**************** Create/Break Connection(s) *******************/
    /***************************************************************/
    Connector.prototype.createConnection = function (source, outtarget, destination, intarget) {
        var drag = new Drag();
        drag.startDraggingConnection(source, outtarget);
        drag.stopDraggingConnection(source, destination);
    };
    Connector.prototype.deleteConnection = function (event, drag) {
        event.stopPropagation();
        this.breakSingleInputConnection(this.source, this.destination, this);
        return true;
    };
    Connector.prototype.breakSingleInputConnection = function (source, destination, connector) {
        this.disconnectModules(source, destination);
        // delete connection from src .outputConnections,
        if (source != undefined && source.moduleFaust.getOutputConnections) {
            source.moduleFaust.removeOutputConnection(connector);
        }
        // delete connection from dst .inputConnections,
        if (destination != undefined && destination.moduleFaust.getInputConnections) {
            destination.moduleFaust.removeInputConnection(connector);
        }
        // and delete the connectorShape
        if (connector.connectorShape)
            connector.connectorShape.remove();
    };
    // Disconnect a node from all its connections
    Connector.prototype.disconnectModule = function (module) {
        //for all output nodes
        if (module.moduleFaust.getOutputConnections && module.moduleFaust.getOutputConnections()) {
            while (module.moduleFaust.getOutputConnections().length > 0)
                this.breakSingleInputConnection(module, module.moduleFaust.getOutputConnections()[0].destination, module.moduleFaust.getOutputConnections()[0]);
        }
        //for all input nodes 
        if (module.moduleFaust.getInputConnections && module.moduleFaust.getInputConnections()) {
            while (module.moduleFaust.getInputConnections().length > 0)
                this.breakSingleInputConnection(module.moduleFaust.getInputConnections()[0].source, module, module.moduleFaust.getInputConnections()[0]);
        }
    };
    Connector.connectorId = 0;
    return Connector;
})();
//# sourceMappingURL=Connect.js.map