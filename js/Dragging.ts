/*				DRAGGING.JS
	Handles Graphical Drag of Modules and Connections
	This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
	
	--> Things could probably be easier...
	
	DEPENDENCIES :
		- Connect.js
		- ModuleClass.js
		
*/

"use strict";



/***********************************************************************************/
/****** Node Dragging - these are used for dragging the audio modules interface*****/
/***********************************************************************************/


class Drag {

    zIndex: number=0;
    lastLit: any;
    cursorStartX: number;
    cursorStartY: number;
    elementStartLeft: number;
    elementStartTop: number;
    originIsInput: any;
    connectorShape: ConnectorShape;
    elemNode: any;

    startDraggingModule(event, module) {

 	    var el = event.target;
  	    var x, y;
  	
    //   Avoid dragging ModuleClass when it's a Connector that needs dragging
	    if (el.tagName == "SELECT" || el.classList.contains("node-button"))
		    return;

    //   Avoid dragging ModuleClass when it's a UI element that needs dragging
	    if (el.nodeType == 3) // if it's a text node
		    el = el.parentNode;
	    if (el.classList.contains("module-title"))
		    el = el.parentNode;
	    if (el.classList.contains("content"))
		    el = el.parentNode;
	    if (!el.classList.contains("moduleFaust"))
		    return;

	    var moduleContainer = module.getModuleContainer();


	    // Get cursor position with respect to the page.
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;

  	    // Save starting positions of cursor and element.
        this.cursorStartX = x;
        this.cursorStartY = y;
        this.elementStartLeft = parseInt(moduleContainer.style.left, 10);
  	    this.elementStartTop   = parseInt(moduleContainer.style.top,  10);

            if (isNaN(this.elementStartLeft)) this.elementStartLeft = 0;
            if (isNaN(this.elementStartTop)) this.elementStartTop = 0;

  	    // Update element's z-index.
	    moduleContainer.style.zIndex = ++this.zIndex;

  	    // Capture mousemove and mouseup events on the page.
  	    module.addListener("mousemove");
	    module.addListener("mouseup");

        event.preventDefault();
    }

    whileDraggingModule(event, module) {
	    var x, y;
	
	    var moduleContainer = module.getModuleContainer();
	
	    // Get cursor position with respect to the page.
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;

        // Move drag element by the same amount the cursor has moved.
        moduleContainer.style.left = (this.elementStartLeft + x - this.cursorStartX) + "px";
        moduleContainer.style.top = (this.elementStartTop + y - this.cursorStartY) + "px";
	
	    if (module.getInputConnections() != null) {	// update any lines that point in here.
		    var c;
		
		    var off = module.getInputNode();
	        x = window.scrollX + 12;
	        y = window.scrollY + 12;

		    while (off) {
		
			    x+=off.offsetLeft;
			    y+=off.offsetTop;
			    off=off.offsetParent;
		    }
		
		    for (c=0; c<module.getInputConnections().length; c++) {
		
			    module.getInputConnections()[c].line.setAttributeNS(null, "x1", x);
			    module.getInputConnections()[c].line.setAttributeNS(null, "y1", y);
		    }
	    }

	    if (module.getOutputConnections()!= null) {	// update any lines that point out of here.
		    var c;
		
		    var off = module.getOutputNode();
	        x = window.scrollX + 12;
	        y = window.scrollY + 12;

		    while (off) {
			    x+=off.offsetLeft;
			    y+=off.offsetTop;
			    off=off.offsetParent;
		    }
		
		    for (c=0; c<module.getOutputConnections().length; c++) {

			    if(module.getOutputConnections()[c].line){
				    module.getOutputConnections()[c].line.setAttributeNS(null, "x2", x);
				    module.getOutputConnections()[c].line.setAttributeNS(null, "y2", y);
			    }
		    }
	    }

        event.preventDefault();
    }

    stopDraggingModule(event, module) {
      // Stop capturing mousemove and mouseup events.
        module.removeListener(document, "mousemove");
        module.removeListener(document, "mouseup");
    }

    /************************************************************************************/
    /*** Connector Dragging - these are used for dragging the connectors between nodes***/
    /************************************************************************************/

    startDraggingConnection(module, target){

        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button"))
    	    target = target.parentNode; 

	    // Get the position of the originating connector with respect to the page.
	    var off = target;
        var x = window.scrollX + 12;
        var y = window.scrollY + 12;

	    while (off) {
		    x+=off.offsetLeft;
		    y+=off.offsetTop;
		    off=off.offsetParent;
	    }

  	    // Save starting positions of cursor and element.
  	    this.cursorStartX = x;
  	    this.cursorStartY = y;

	    // remember if this is an input or output node, so we can match
	    this.originIsInput = target.classList.contains("node-input");

	    module.getInterfaceContainer().unlitClassname = module.getInterfaceContainer().className;
	    module.getInterfaceContainer().className += " canConnect";
	
	    // Create a connector visual line
	    var svgns = "http://www.w3.org/2000/svg";

        var shape: SVGElement = <SVGElement>document.createElementNS(svgns, "line");
	    shape.setAttributeNS(null, "x1", String(x));
        shape.setAttributeNS(null, "y1", String(y));
        shape.setAttributeNS(null, "x2", String(x));
        shape.setAttributeNS(null, "y2", String(y));
        shape.setAttributeNS(null, "stroke", "black");
        shape.setAttributeNS(null, "stroke-width", "5");
        this.connectorShape = <ConnectorShape>shape;

        document.getElementById("svgCanvas").appendChild(shape);
    }

    stopDraggingConnection(sourceModule: ModuleClass, destination: ModuleClass) {


	    //if (sourceModule.getInterfaceContainer().lastLit) {
		   // sourceModule.getInterfaceContainer().lastLit.className = sourceModule.getInterfaceContainer().lastLit.unlitClassname;
		   // sourceModule.getInterfaceContainer().lastLit = null;
	    //}

	    //sourceModule.getInterfaceContainer().className = sourceModule.getInterfaceContainer().unlitClassname;

        var x,y
        if (destination) {	

		    // Get the position of the originating connector with respect to the page.
		
		    var off;
		    if(!this.originIsInput)
			    off = destination.getInputNode();
		    else
			    off = destination.getOutputNode();
		
		    var toElem = off;
	
		    console.log(destination.getName());
		    console.log(toElem);	
	    // Get the position of the originating connector with respect to the page.			
		    x = window.scrollX + 12;
		    y = window.scrollY + 12;

		    while (off) {
			    x+=off.offsetLeft;
			    y+=off.offsetTop;
			    off=off.offsetParent;
		    }

            this.connectorShape.setAttributeNS(null, "x2", x);
	        this.connectorShape.setAttributeNS(null, "y2", y);

            var src: ModuleClass, dst: ModuleClass;
	
		    // If connecting from output to input
		    if (this.originIsInput) {
		
			    if (toElem.classList.contains("node-output")) {
				    src = destination;
				    dst = sourceModule;
			    }
		    }		
		    else {
			    if (toElem.classList.contains("node-input")) {

	    // Make sure the connector line points go from src->dest (x1->x2)
				    var shape = this.connectorShape;
				    x = shape.getAttributeNS(null, "x2");
				    y = shape.getAttributeNS(null, "y2");
			        shape.setAttributeNS(null, "x2", shape.getAttributeNS(null, "x1"));
	    		    shape.setAttributeNS(null, "y2", shape.getAttributeNS(null, "y1"));
				    shape.setAttributeNS(null, "x1", x);
				    shape.setAttributeNS(null, "y1", y);
				
				    // can connect!
				    // TODO: first: swap the line endpoints so they're consistently x1->x2
				    // That makes updating them when we drag nodes around easier.
				
				    src = sourceModule;
				    dst = destination;
			    }
		    }
		
            if (src && dst) {
                var connect: Connect = new Connect();
			    connect.connectModules(src, dst);

                var connector: Connector = new Connector();

			    connect.saveConnection(src, dst, connector, this.connectorShape);

			    dst.addInputConnection(connector);
			    src.addOutputConnection(connector);
			
			    this.connectorShape.inputConnection = connector;
			    this.connectorShape.destination = dst;
			    this.connectorShape.source = src;
			    this.connectorShape.onclick = connect.deleteConnection(this);

			    this.connectorShape = null;
                ;
                if (App.isTooltipEnabled)
                    Tooltips.toolTipForConnections(src.sceneParent);

			    return;
		    }
	    }

	    // Otherwise, delete the line
	    this.connectorShape.parentNode.removeChild(this.connectorShape);
	    this.connectorShape = null;
    }

    startDraggingConnector(module, event: Event) {
        this.startDraggingConnection(module, event.target);

  	    // Capture mousemove and mouseup events on the page.
        module.addCnxListener(event.target, "mousemove");
        module.addCnxListener(event.target, "mouseup");

        event.preventDefault();
	    event.stopPropagation();
    }

    whileDraggingConnector(module, event) {

	    var toElem = event.target;

	    // Get cursor position with respect to the page.
        var x = event.clientX + window.scrollX;
        var y = event.clientY + window.scrollY;
	
	    // Move connector visual line
        this.connectorShape.setAttributeNS(null, "x2", x);
        this.connectorShape.setAttributeNS(null, "y2", y);


        if (toElem.classList) {	// if we don't have class, we're not a node.
	        // if this is the green or red button, use its parent.
	        if (toElem.classList.contains("node-button"))
	    	    toElem = toElem.parentNode;

	        // if we're over our originating node, do nothing.
	        if (toElem == this.elemNode)
	    	    return;
		
		    // If we used to be lighting up a node, but we're not over it anymore,
		    // unlight it.
		    if (this.lastLit && (this.lastLit != toElem ) ) {
			    this.lastLit.className = this.lastLit.unlitClassname;
			    this.lastLit = null;
		    }

		    // light up connector point underneath, if any
		    if (toElem.classList.contains("node")) {
			    if (!this.lastLit || (this.lastLit != toElem )) {
				    if (this.originIsInput) {
					    if (toElem.classList.contains("node-output")) {
						    toElem.unlitClassname = toElem.className;
						    toElem.className += " canConnect";
						    this.lastLit = toElem;
					    }
				    } else {	// first node was an output, so we're looking for an input
					    if (toElem.classList.contains("node-input")) {
						    toElem.unlitClassname = toElem.className;
						    toElem.className += " canConnect";
						    this.lastLit = toElem;
					    }
				    }
			    }
		    }
	    }
        event.preventDefault();
	    event.stopPropagation();
    }

    stopDraggingConnector(module: ModuleClass, event) {

  	    // Stop capturing mousemove and mouseup events.
        module.removeCnxListener(event.target, "mousemove");
        module.removeCnxListener(event.target, "mouseup");

	    var arrivingNode;

        var modules = module.sceneParent.getModules();

	    for(var i=0; i<modules.length; i++){
		    if((this.originIsInput && modules[i].isPointInOutput(event.clientX, event.clientY)) || modules[i].isPointInInput(event.clientX, event.clientY)){
			    arrivingNode = modules[i];
			    break;
		    }
	    }	

        if (!arrivingNode) {
            var outputModule = module.sceneParent.getAudioOutput();
		    if((this.originIsInput && outputModule.isPointInOutput(event.clientX, event.clientY)) || outputModule.isPointInInput(event.clientX, event.clientY))
			    arrivingNode = outputModule;	
	    }
	    this.stopDraggingConnection(module, arrivingNode);
    }

}

