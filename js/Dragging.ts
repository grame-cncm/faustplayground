/*				DRAGGING.JS
	Handles Graphical Drag of Modules and Connections
	This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
	
	--> Things could probably be easier...
	
	DEPENDENCIES :
		- Connect.js
		- ModuleClass.js
		
*/

/// <reference path="Connect.ts"/>
/// <reference path="App.ts"/>
/// <reference path="main.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Pedagogie/Tooltips.ts"/>



"use strict";



/***********************************************************************************/
/****** Node Dragging - these are used for dragging the audio modules interface*****/
/***********************************************************************************/

interface TouchEvent {
    target: HTMLElement;

}

class Drag {

    zIndex: number = 0;
    lastLit: HTMLInterfaceContainer;
    cursorStartX: number;
    cursorStartY: number;
    elementStartLeft: number;
    elementStartTop: number;
    isOriginInput: boolean;
    connector: Connector = new Connector();
    elemNode: HTMLElement;
    isDragConnector: boolean = false;
    moduleTouchList: ModuleClass[]=[];


    getDraggingMouseEvent(mouseEvent: MouseEvent, module: ModuleClass, draggingFunction: (el: HTMLElement, x: number, y: number, module: ModuleClass, event: Event) => void) {
        var event = <Event>mouseEvent;
        var el = <HTMLElement>mouseEvent.target;
        var x = mouseEvent.clientX + window.scrollX;
        var y = mouseEvent.clientY + window.scrollY;
        draggingFunction(el, x, y, module,event);
    }

    getDraggingTouchEvent(touchEvent: TouchEvent, module: ModuleClass, draggingFunction: (el: HTMLElement, x: number, y: number, module: ModuleClass, event: Event) => void) {
        var event = <Event>touchEvent;
        if (touchEvent.touches.length ==1) {
            var touch: Touch = touchEvent.touches[0];
            var el = <HTMLElement>touch.target;
            var x = touch.clientX + window.scrollX;
            var y = touch.clientY + window.scrollY;
            draggingFunction(el, x, y, module,event);
         
        } else if (touchEvent.touches.length > 1 ) {
            for (var i = 0; i < touchEvent.touches.length; i++) {
                var touch: Touch = touchEvent.touches[i];                
                var el = <HTMLElement>touch.target;
                var x = touch.clientX + window.scrollX;
                var y = touch.clientY + window.scrollY;
                if (module.moduleView.isPointInNode(x, y)) {

                //if (touchEvent.target != touchEvent.touches[i].target) {
                    draggingFunction(el, x, y, module, event);
                }
            }
        } else if (this.isDragConnector) {
            for (var i = 0; i < touchEvent.changedTouches.length; i++) {
                var touch: Touch = touchEvent.changedTouches[i];
                var x = touch.clientX + window.scrollX;
                var y = touch.clientY + window.scrollY;
                var el = <HTMLElement>document.elementFromPoint(x - scrollX, y - scrollY);
                this.isDragConnector = false;
                draggingFunction(el, x, y, module,event);
            }
        } else {
            draggingFunction(null, null, null, module,event);
        }
        //touchEvent.preventDefault();
    }

    startDraggingModule(el: HTMLElement, x: number, y: number, module: ModuleClass, event: Event): void {

  	
    //   Avoid dragging ModuleClass when it's a Connector that needs dragging
	    if (el.tagName == "SELECT" || el.classList.contains("node-button"))
		    return;

    //   Avoid dragging ModuleClass when it's a UI element that needs dragging
	    if (el.nodeType == 3) // if it's a text node
		    el = <HTMLElement>el.parentNode;
	    if (el.classList.contains("module-title"))
            el = <HTMLElement>el.parentNode;
	    if (el.classList.contains("content"))
            el = <HTMLElement>el.parentNode;
	    if (!el.classList.contains("moduleFaust"))
		    return;

        var moduleContainer: HTMLElement = module.moduleView.getModuleContainer();


	    // Get cursor position with respect to the page.
       

  	    // Save starting positions of cursor and element.
        this.cursorStartX = x;
        this.cursorStartY = y;
        this.elementStartLeft = parseInt(moduleContainer.style.left, 10);
  	    this.elementStartTop   = parseInt(moduleContainer.style.top,  10);

            if (isNaN(this.elementStartLeft)) this.elementStartLeft = 0;
            if (isNaN(this.elementStartTop)) this.elementStartTop = 0;

  	    // Update element's z-index.
	    //moduleContainer.style.zIndex = String(++this.zIndex);

        // Capture mousemove and mouseup events on the page.
        module.addListener("mousemove", module);
        module.addListener("mouseup", module);
        module.addListener("touchmove", module);
        module.addListener("touchend", module);

        event.preventDefault();
    }

    whileDraggingModule(el: HTMLElement, x: number, y: number, module: ModuleClass,event:Event): void {


        var moduleContainer = module.moduleView.getModuleContainer();

        App.appTest++

	    // Get cursor position with respect to the page.
       

        // Move drag element by the same amount the cursor has moved.
        moduleContainer.style.left = (this.elementStartLeft + x - this.cursorStartX) + "px";
        moduleContainer.style.top = (this.elementStartTop + y - this.cursorStartY) + "px";

        if (module.moduleFaust.getInputConnections() != null) {	// update any lines that point in here.

            var offset: HTMLElement = module.moduleView.getInputNode();
            x = module.moduleView.inputOutputNodeDimension/2// + window.scrollX ;
            y = module.moduleView.inputOutputNodeDimension/2// + window.scrollY;

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
                var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
                currentConnectorShape.setAttributeNS(null, "d", d);
                this.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);


		    }
	    }

        if (module.moduleFaust.getOutputConnections() != null) {	// update any lines that point out of here.
		    

            var offset = module.moduleView.getOutputNode();
            x =  module.moduleView.inputOutputNodeDimension / 2;
            y =  module.moduleView.inputOutputNodeDimension / 2;

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
                    var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
                    
                    currentConnectorShape.setAttributeNS(null, "d", d);
                    this.updateConnectorShapePath(currentConnectorShape,x1, x2, y1, y2);

			    }
		    }
	    }

        //event.preventDefault();
    }

    stopDraggingModule(el: HTMLElement, x: number, y: number, module: ModuleClass, event: Event): void {
      // Stop capturing mousemove and mouseup events.
        module.removeListener("mousemove", null, document);
        module.removeListener("mouseup", null, document);
        module.removeListener("touchmove", null, document);
        module.removeListener("touchend", null, document);
    }

    /************************************************************************************/
    /*** Connector Dragging - these are used for dragging the connectors between nodes***/
    /************************************************************************************/

    updateConnectorShapePath(connectorShape:ConnectorShape,x1: number, x2: number, y1: number, y2: number) {
        connectorShape.x1 = x1;
        connectorShape.x2 = x2;
        connectorShape.y1 = y1;
        connectorShape.y2 = y2;
    }

    setCurvePath(x1: number, y1: number, x2: number, y2: number, x1Bezier: number, x2Bezier: number): string {
        return "M" + x1 + "," + y1 + " C" + x1Bezier + "," + y1 + " " + x2Bezier + "," + y2 + " " + x2 + "," + y2;

    }
    calculDistance(x1: number, x2: number): number{
        return (x1 - x2) / 2;
    }
    calculBezier1(x1: number, x2: number): number {
        return x1 - this.calculDistance(x1, x2);
    }
    calculBezier2(x1: number, x2: number): number {
        return x2 + this.calculDistance(x1, x2);
    }


    startDraggingConnection(module: ModuleClass, target: HTMLElement):void {

        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button"))
    	    target = <HTMLElement>target.parentNode; 

        // Get the position of the originating connector with respect to the page.
        var offset: HTMLElement = target;
        var x: number = module.moduleView.inputOutputNodeDimension / 2;
        var y: number = module.moduleView.inputOutputNodeDimension / 2;

        while (offset) {
            x += offset.offsetLeft;
            y += offset.offsetTop;
            offset = <HTMLElement> offset.offsetParent;
	    }

  	    // Save starting positions of cursor and element.
  	    this.cursorStartX = x;
  	    this.cursorStartY = y;

	    // remember if this is an input or output node, so we can match
        this.isOriginInput = target.classList.contains("node-input");

        module.moduleView.getInterfaceContainer().unlitClassname = module.moduleView.getInterfaceContainer().className;
        module.moduleView.getInterfaceContainer().className += " canConnect";
	
	    // Create a connector visual line
	    var svgns:string = "http://www.w3.org/2000/svg";

        var curve: SVGElement = <SVGElement>document.createElementNS(svgns, "path");
        var d = this.setCurvePath(x,y,x,y,x,x)
        curve.setAttributeNS(null, "d", d);
        curve.setAttributeNS(null, "stroke", "black");
        curve.setAttributeNS(null, "stroke-width", "5");
        curve.setAttributeNS(null, "fill", "none");
        curve.id = String(Connector.connectorId);
        Connector.connectorId++
        //console.log("connector Id = " + Connector.connectorId);



        this.connector.connectorShape = <ConnectorShape>curve;
        this.connector.connectorShape.onclick = (event)=> { this.connector.deleteConnection(event, this) };

        document.getElementById("svgCanvas").appendChild(curve);
    }

    stopDraggingConnection(sourceModule: ModuleClass, destination: ModuleClass, target?: HTMLElement): void {


        if (sourceModule.moduleView.getInterfaceContainer().lastLit) {
            sourceModule.moduleView.getInterfaceContainer().lastLit.className = sourceModule.moduleView.getInterfaceContainer().lastLit.unlitClassname;
            sourceModule.moduleView.getInterfaceContainer().lastLit = null;
        }
        var resultIsConnectionValid: boolean = true;
        if (target != null) {
            resultIsConnectionValid = this.isConnectionValid(target);
        }
        sourceModule.moduleView.getInterfaceContainer().className = sourceModule.moduleView.getInterfaceContainer().unlitClassname;

        var x: number, y: number
        if (destination && destination != sourceModule && this.isConnectionUnique(sourceModule, destination) && resultIsConnectionValid) {	

		    // Get the position of the originating connector with respect to the page.

            var offset: HTMLElement;
            if (!this.isOriginInput)
                offset = destination.moduleView.getInputNode();
            else
                offset = destination.moduleView.getOutputNode();

            var toElem: HTMLElement = offset;
	

	    // Get the position of the originating connector with respect to the page.			
            x = destination.moduleView.inputOutputNodeDimension / 2;
            y = destination.moduleView.inputOutputNodeDimension / 2;

            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = <HTMLElement> offset.offsetParent;
		    }

            var x1 = this.cursorStartX;
            var y1 = this.cursorStartY;
            var x2 = x;
            var y2 = y;
            var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
            this.connector.connectorShape.setAttributeNS(null, "d", d);
            this.updateConnectorShapePath(this.connector.connectorShape, x1, x2, y1, y2);

            var src: ModuleClass, dst: ModuleClass;

		    // If connecting from output to input
            if (this.isOriginInput) {
		
			    if (toElem.classList.contains("node-output")) {
				    src = destination;
				    dst = sourceModule;
			    }
		    }		
		    else {
			    if (toElem.classList.contains("node-input")) {

                    // Make sure the connector line points go from src->dest (x1->x2)
                    var d = this.setCurvePath(x2, y2, x1, y1, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
                    this.connector.connectorShape.setAttributeNS(null, "d", d);
                    this.updateConnectorShapePath(this.connector.connectorShape,x2, x1, y2, y1);

				
				    // can connect!
				    // TODO: first: swap the line endpoints so they're consistently x1->x2
				    // That makes updating them when we drag nodes around easier.

                    src = sourceModule;
                    dst = destination;
			    }
		    }
		
            if (src && dst) {
			    

                var connector: Connector = new Connector();
                connector.connectModules(src, dst);

                dst.moduleFaust.addInputConnection(connector);
                src.moduleFaust.addOutputConnection(connector);

                this.connector.destination = dst;
                this.connector.source = src;
                var drag: Drag = this
                connector.saveConnection(src, dst, this.connector.connectorShape);
                this.connector.connectorShape.onclick = function (event) { connector.deleteConnection(event,drag) };

			    //this.connectorShape = null;
                
                

			    return;
		    }
	    }

        // Otherwise, delete the line
        this.connector.connectorShape.parentNode.removeChild(this.connector.connectorShape);
        this.connector.connectorShape = null;
    }

    startDraggingConnector(target: HTMLElement, x: number, y: number, module: ModuleClass, event: Event): void {
        this.startDraggingConnection(module,target);

        // Capture mousemove and mouseup events on the page.
        module.addCnxListener(target, "mousemove", module);
        module.addCnxListener(target, "mouseup", module);
        module.addCnxListener(target, "touchmove", module);
        module.addCnxListener(target, "touchend", module);

        event.preventDefault();
	    //event.stopPropagation();
    }



    whileDraggingConnector(target: HTMLElement, x: number, y: number, module: ModuleClass,event:Event) {

        var toElem: HTMLInterfaceContainer = <HTMLInterfaceContainer>target;
        //console.log(this.connector.connectorShape.id);
        // Get cursor position with respect to the page.
        var x1: number = this.cursorStartX;
        var y1: number = this.cursorStartY;
        var x2: number = x //+ window.scrollX;
        var y2: number = y //+ window.scrollY;
        var d: string;
        if (!this.isOriginInput) {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
        } else {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2))
        }
        // Move connector visual line
        this.connector.connectorShape.setAttributeNS(null, "d", d);



        if (toElem.classList) {	// if we don't have class, we're not a node.
	        // if this is the green or red button, use its parent.
	        if (toElem.classList.contains("node-button"))
                toElem = <HTMLInterfaceContainer>toElem.parentNode;

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
                    if (this.isOriginInput) {
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
	    //event.stopPropagation();
    }

    stopDraggingConnector(target: HTMLElement, x: number, y: number, module: ModuleClass): void {
        x = x - window.scrollX;
        y = y - window.scrollY;
        // Stop capturing mousemove and mouseup events.
        module.removeCnxListener(target, "mousemove", module);
        module.removeCnxListener(target, "mouseup", module);
        module.removeCnxListener(target, "touchmove", module);
        module.removeCnxListener(target, "touchend", module);
        var arrivingHTMLNode: HTMLElement = target;
        var arrivingHTMLParentNode: HTMLElement = <HTMLElement>arrivingHTMLNode.offsetParent;
        var arrivingNode: ModuleClass;

        var modules: ModuleClass[] = module.sceneParent.getModules();

        for (var i = 0; i < modules.length; i++){
            if ((this.isOriginInput && modules[i].moduleView.isPointInOutput(x, y)) || modules[i].moduleView.isPointInInput(x, y)) {
			    arrivingNode = modules[i];
			    break;
		    }
	    }	

        if (arrivingHTMLParentNode!=undefined&&arrivingHTMLParentNode.classList.contains("node")) {
            var outputModule = module.sceneParent.getAudioOutput();
            var inputModule = module.sceneParent.getAudioInput();
            if ((this.isOriginInput && outputModule.moduleView.isPointInOutput(x, y)) || outputModule.moduleView.isPointInInput(x, y) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleOutput") {
                arrivingNode = outputModule;
            } else if ((!this.isOriginInput && inputModule.moduleView.isPointInInput(x, y)) || inputModule.moduleView.isPointInOutput(x, y) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleInput") {
                arrivingNode = inputModule;
            }
        }
        module.drag.stopDraggingConnection(module, arrivingNode, target);
    }
    isConnectionValid(target: HTMLElement): boolean {
        if (target.classList.contains("node-button")) {
            target = <HTMLElement>target.parentNode;
        }
        if (target.classList.contains("node-input") && this.isOriginInput) {
            return false;
        } else if (target.classList.contains("node-output") && !this.isOriginInput) {
            return false;
        } else {
            return true
        }
    }
    isConnectionUnique(moduleSource: ModuleClass, moduleDestination: ModuleClass): boolean {
        if (this.isOriginInput) {
            for (var i = 0; i < moduleSource.moduleFaust.fInputConnections.length; i++) {
                for (var j = 0; j < moduleDestination.moduleFaust.fOutputConnections.length; j++) {
                    if (moduleSource.moduleFaust.fInputConnections[i] == moduleDestination.moduleFaust.fOutputConnections[j]) {
                        return false
                    }
                }
            }
        } else {
            for (var i = 0; i < moduleSource.moduleFaust.fOutputConnections.length; i++) {
                for (var j = 0; j < moduleDestination.moduleFaust.fInputConnections.length; j++) {
                    if (moduleSource.moduleFaust.fOutputConnections[i] == moduleDestination.moduleFaust.fInputConnections[j]) {
                        return false
                    }
                }
            }
        }
        return true
    }
}

