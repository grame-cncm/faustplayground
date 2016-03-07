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
    source: ModuleClass;
    destination: ModuleClass;

    connectInput(inputModule: ModuleClass, divSrc: IHTMLDivElementSrc): void {
        divSrc.audioNode.connect(inputModule.moduleFaust.getDSP().getProcessor());
    }
    connectOutput(outputModule: ModuleClass, divOut: IHTMLDivElementOut): void {
        outputModule.moduleFaust.getDSP().getProcessor().connect(divOut.audioNode);
    }
    // Connect Nodes in Web Audio Graph
    connectModules(source: ModuleClass, destination: ModuleClass): void {
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
    }
    disconnectOutput(destination: IHTMLDivElementOut, source: ModuleClass):void {
        destination.audioNode.context.suspend();
    }

    // Disconnect Nodes in Web Audio Graph
    disconnectModules(source: ModuleClass, destination: ModuleClass):void {
	
        // We want to be dealing with the audio node elements from here on
        var sourceCopy: ModuleClass = source;
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
    saveConnection(source: ModuleClass, destination: ModuleClass, connectorShape: ConnectorShape):void {
        this.connectorShape = connectorShape;
        this.destination = destination;
        this.source = source;
    }

    /***************************************************************/
    /**************** Create/Break Connection(s) *******************/
    /***************************************************************/

    createConnection(source: ModuleClass, outtarget: HTMLElement, destination: ModuleClass, intarget: HTMLElement):void {
        var drag: Drag = new Drag();
        drag.startDraggingConnection(source, outtarget);
        drag.stopDraggingConnection(source, destination);
    }



    deleteConnection(event: MouseEvent, drag: Drag): boolean {
        event.stopPropagation();
        this.breakSingleInputConnection(this.source, this.destination, this);
        return true;
    }

    breakSingleInputConnection(source: ModuleClass, destination: ModuleClass, connector: Connector) {

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
    disconnectModule(module: ModuleClass) {

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

}