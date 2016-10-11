/*				CONNECT.JS
	Handles Audio/Graphical Connection/Deconnection of modules
	This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.

*/

/// <reference path="Modules/Module.ts"/>
/// <reference path="Utilitary.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="Lib/webaudioapi/waa.d.ts"/>


"use strict";

/**************************************************/
/******* WEB AUDIO CONNECTION/DECONNECTION*********/
/**************************************************/

interface ConnectorShape extends SVGElement {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

class Connector {
    static connectorId: number = 0;
    connectorShape: ConnectorShape;
    source: Module;
    destination: Module;

    // connect input node to device input
    connectInput(inputModule: Module, srcnode: MediaStreamAudioSourceNode): void {
        srcnode.connect(inputModule.moduleFaust.getDSP().getProcessor());
    }

    //connect output to device output
    connectOutput(outputModule: Module, destnode: AudioDestinationNode): void {
        outputModule.moduleFaust.getDSP().getProcessor().connect(destnode);
    }

    getBroadcastStream(outputModule: Module, ctx: AudioContext): MediaStream | void {
        try {
            var dst:MediaStreamAudioDestinationNode = ctx.createMediaStreamDestination();
            outputModule.moduleFaust.getDSP().getProcessor().connect(dst);
        } catch (e) {
            console.error('Cannot create stream for broadcasting.');
            return null;
        }
        return dst.stream;
    }

    // Connect Nodes in Web Audio Graph
    connectModules(source: Module, destination: Module): void {
        var sourceDSP: IfDSP;
        var destinationDSP: IfDSP;
        if (destination != null && destination.moduleFaust.getDSP) {
            destinationDSP = destination.moduleFaust.getDSP();
        }
        if (source.moduleFaust.getDSP) {
            sourceDSP = source.moduleFaust.getDSP();
        }

        if (sourceDSP.getProcessor && destinationDSP.getProcessor()) {
            sourceDSP.getProcessor().connect(destinationDSP.getProcessor())
        }
        source.setDSPValue();
        destination.setDSPValue();
    }

    // Disconnect Nodes in Web Audio Graph
    disconnectModules(source: Module, destination: Module):void {

        // We want to be dealing with the audio node elements from here on
        var sourceCopy: Module = source;
        var sourceCopyDSP: IfDSP;
        // Searching for src/dst DSP if existing

        if (sourceCopy != undefined && sourceCopy.moduleFaust.getDSP) {
            sourceCopyDSP = sourceCopy.moduleFaust.getDSP();
            sourceCopyDSP.getProcessor().disconnect();
        }


        // Reconnect all disconnected connections (because disconnect API cannot break a single connection)
        if (source!=undefined&&source.moduleFaust.getOutputConnections()) {
            for (var i = 0; i < source.moduleFaust.getOutputConnections().length; i++){
                if (source.moduleFaust.getOutputConnections()[i].destination != destination)
                    this.connectModules(source, source.moduleFaust.getOutputConnections()[i].destination);
		    }
	    }
    }

    /**************************************************/
    /***************** Save Connection*****************/
    /**************************************************/

    //----- Add connection to src and dst connections structures
    saveConnection(source: Module, destination: Module, connectorShape: ConnectorShape):void {
        this.connectorShape = connectorShape;
        this.destination = destination;
        this.source = source;
    }

    /***************************************************************/
    /**************** Create/Break Connection(s) *******************/
    /***************************************************************/

    createConnection(source: Module, outtarget: HTMLElement, destination: Module, intarget: HTMLElement):void {
        var drag: Drag = new Drag();
        drag.startDraggingConnection(source, outtarget);
        drag.stopDraggingConnection(source, destination);
    }



    deleteConnection(event: MouseEvent, drag: Drag): boolean {
        event.stopPropagation();
        this.breakSingleInputConnection(this.source, this.destination, this);
        return true;
    }

    breakSingleInputConnection(source: Module, destination: Module, connector: Connector) {

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
	    if(connector.connectorShape)
		    connector.connectorShape.remove( );
    }

    // Disconnect a node from all its connections
    disconnectModule(module: Module) {

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
    }

    static redrawInputConnections(module: Module, drag: Drag) {
        var offset: HTMLElement = module.moduleView.getInputNode();
        var x = module.moduleView.inputOutputNodeDimension / 2;
        var y = module.moduleView.inputOutputNodeDimension / 2;

        while (offset) {

            x += offset.offsetLeft;
            y += offset.offsetTop;
            offset = <HTMLDivElement>offset.offsetParent;
        }

        for (var c = 0; c < module.moduleFaust.getInputConnections().length; c++) {

            var currentConnectorShape: ConnectorShape = module.moduleFaust.getInputConnections()[c].connectorShape;
            var x1 = x;
            var y1 = y;
            var x2 = currentConnectorShape.x2
            var y2 = currentConnectorShape.y2
            var d = drag.setCurvePath(x1, y1, x2, y2, drag.calculBezier(x1, x2), drag.calculBezier(x1, x2))
            currentConnectorShape.setAttributeNS(null, "d", d);
            drag.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);
        }
    }
    static redrawOutputConnections(module: Module, drag: Drag) {
        var offset: HTMLElement = module.moduleView.getOutputNode();
        var x = module.moduleView.inputOutputNodeDimension / 2;
        var y = module.moduleView.inputOutputNodeDimension / 2;

        while (offset) {

            x += offset.offsetLeft;
            y += offset.offsetTop;
            offset = <HTMLDivElement>offset.offsetParent;
        }

        for (var c = 0; c < module.moduleFaust.getOutputConnections().length; c++) {

                if (module.moduleFaust.getOutputConnections()[c].connectorShape) {
                    var currentConnectorShape: ConnectorShape = module.moduleFaust.getOutputConnections()[c].connectorShape;
                    var x1 = currentConnectorShape.x1;
                    var y1 = currentConnectorShape.y1;
                    var x2 = x;
                    var y2 = y;
                    var d = drag.setCurvePath(x1, y1, x2, y2, drag.calculBezier(x1, x2), drag.calculBezier(x1, x2));

                    currentConnectorShape.setAttributeNS(null, "d", d);
                    drag.updateConnectorShapePath(currentConnectorShape,x1, x2, y1, y2);

			    }
		    }
    }

}
