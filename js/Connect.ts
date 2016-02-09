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
/// <reference path="main.ts"/>

"use strict";

/**************************************************/
/******* WEB AUDIO CONNECTION/DECONNECTION*********/
/**************************************************/

interface ConnectorShape extends SVGElement {
    inputConnection: Connector;
    destination: ModuleClass;
    source: ModuleClass;
    drag: Drag;
}
class Connector {
    connectorShape: ConnectorShape;
    source: ModuleClass;
    destination: ModuleClass;

}
class Connect {
    connector: Connector;


    connectInput(inputModule: ModuleClass, divSrc: IHTMLDivElementSrc): void {
        divSrc.audioNode.connect(inputModule.getDSP().getProcessor());
    }
    connectOutput(outputModule: ModuleClass, divOut: IHTMLDivElementOut): void {
        outputModule.getDSP().getProcessor().connect(divOut.audioNode);
    }
    // Connect Nodes in Web Audio Graph
    connectModules(source: ModuleClass, destination: ModuleClass): void {
        var sourceDSP: IfDSP;
        var destinationDSP: IfDSP;
        if (destination != null && destination.getDSP) {
            destinationDSP = destination.getDSP();
        }
        if (source.getDSP) {
            sourceDSP = source.getDSP();
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
        if (sourceCopy.getDSP) {
            sourceCopyDSP = sourceCopy.getDSP();
            sourceCopyDSP.getProcessor().disconnect();
        }
        
		
    // Reconnect all disconnected connections (because disconnect API cannot break a single connection)
        if (source.getOutputConnections()){
            for (var i = 0; i < source.getOutputConnections().length; i++){
                if (source.getOutputConnections()[i].destination != destination)
                    this.connectModules(source, source.getOutputConnections()[i].destination);
		    }
	    }
    }

    /**************************************************/
    /***************** Save Connection*****************/
    /**************************************************/

    //----- Add connection to src and dst connections structures
    saveConnection(source: ModuleClass, destination: ModuleClass, connector: Connector, connectorShape: ConnectorShape):void {
        this.connector = connector;
	    connector.connectorShape = connectorShape;
        connector.destination = destination;
        connector.source = source;
    }

    /***************************************************************/
    /**************** Create/Break Connection(s) *******************/
    /***************************************************************/

    createConnection(source: ModuleClass, outtarget: HTMLElement, destination: ModuleClass, intarget: HTMLElement):void {
        var drag: Drag = new Drag();
        drag.startDraggingConnection(source, outtarget);
        drag.stopDraggingConnection(source, destination);
    }



    deleteConnection(drag: Drag): boolean {

        this.breakSingleInputConnection(this.connector.connectorShape.source, this.connector.connectorShape.destination, this.connector);
        return true;
    }

    breakSingleInputConnection(source: ModuleClass, destination: ModuleClass, connector: Connector) {

        this.disconnectModules(source, destination);
		
	    // delete connection from src .outputConnections,
        if (source.getOutputConnections)
            source.removeOutputConnection(connector);

	    // delete connection from dst .inputConnections,
        if (destination.getInputConnections)
            destination.removeInputConnection(connector);
		
	    // and delete the connectorShape
	    if(connector.connectorShape)
		    connector.connectorShape.parentNode.removeChild( connector.connectorShape );
    }

    // Disconnect a node from all its connections
    disconnectModule(module: ModuleClass) {

	    //for all output nodes
        if (module.getOutputConnections && module.getOutputConnections()){
	
            while (module.getOutputConnections().length>0)
                this.breakSingleInputConnection(module, module.getOutputConnections()[0].destination, module.getOutputConnections()[0]);
	    }
	
	    //for all input nodes 
        if (module.getInputConnections && module.getInputConnections()){
            while (module.getInputConnections().length>0)
                this.breakSingleInputConnection(module.getInputConnections()[0].source, module, module.getInputConnections()[0]);
	    }
    }

}