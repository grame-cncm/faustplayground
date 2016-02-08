/*				DRAGGING.JS
    Handles Graphical Drag of Modules and Connections
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
    
    --> Things could probably be easier...
    
    DEPENDENCIES :
        - Connect.js
        - ModuleClass.js
        
*/
/// <reference path="Connect.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Pedagogie/Tooltips.ts"/>
"use strict";
/***********************************************************************************/
/****** Node Dragging - these are used for dragging the audio modules interface*****/
/***********************************************************************************/
var Drag = (function () {
    function Drag() {
        this.zIndex = 0;
    }
    Drag.prototype.startDraggingModule = function (event, module) {
        var el = event.target;
        var x, y;
        //   Avoid dragging ModuleClass when it's a Connector that needs dragging
        if (el.tagName == "SELECT" || el.classList.contains("node-button"))
            return;
        //   Avoid dragging ModuleClass when it's a UI element that needs dragging
        if (el.nodeType == 3)
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
        this.elementStartTop = parseInt(moduleContainer.style.top, 10);
        if (isNaN(this.elementStartLeft))
            this.elementStartLeft = 0;
        if (isNaN(this.elementStartTop))
            this.elementStartTop = 0;
        // Update element's z-index.
        moduleContainer.style.zIndex = String(++this.zIndex);
        // Capture mousemove and mouseup events on the page.
        module.addListener("mousemove", module);
        module.addListener("mouseup", module);
        event.preventDefault();
    };
    Drag.prototype.whileDraggingModule = function (event, module) {
        var x, y;
        var moduleContainer = module.getModuleContainer();
        // Get cursor position with respect to the page.
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;
        // Move drag element by the same amount the cursor has moved.
        moduleContainer.style.left = (this.elementStartLeft + x - this.cursorStartX) + "px";
        moduleContainer.style.top = (this.elementStartTop + y - this.cursorStartY) + "px";
        if (module.getInputConnections() != null) {
            var offset = module.getInputNode();
            x = window.scrollX + 12;
            y = window.scrollY + 12;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            for (var c = 0; c < module.getInputConnections().length; c++) {
                module.getInputConnections()[c].connectorShape.setAttributeNS(null, "x1", String(x));
                module.getInputConnections()[c].connectorShape.setAttributeNS(null, "y1", String(y));
            }
        }
        if (module.getOutputConnections() != null) {
            var offset = module.getOutputNode();
            x = window.scrollX + 12;
            y = window.scrollY + 12;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            for (var c = 0; c < module.getOutputConnections().length; c++) {
                if (module.getOutputConnections()[c].connectorShape) {
                    module.getOutputConnections()[c].connectorShape.setAttributeNS(null, "x2", String(x));
                    module.getOutputConnections()[c].connectorShape.setAttributeNS(null, "y2", String(y));
                }
            }
        }
        event.preventDefault();
    };
    Drag.prototype.stopDraggingModule = function (event, module) {
        // Stop capturing mousemove and mouseup events.
        module.removeListener("mousemove", null, document);
        module.removeListener("mouseup", null, document);
    };
    /************************************************************************************/
    /*** Connector Dragging - these are used for dragging the connectors between nodes***/
    /************************************************************************************/
    Drag.prototype.startDraggingConnection = function (module, target) {
        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button"))
            target = target.parentNode;
        // Get the position of the originating connector with respect to the page.
        var offset = target;
        var x = window.scrollX + 12;
        var y = window.scrollY + 12;
        while (offset) {
            x += offset.offsetLeft;
            y += offset.offsetTop;
            offset = offset.offsetParent;
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
        var shape = document.createElementNS(svgns, "line");
        shape.setAttributeNS(null, "x1", String(x));
        shape.setAttributeNS(null, "y1", String(y));
        shape.setAttributeNS(null, "x2", String(x));
        shape.setAttributeNS(null, "y2", String(y));
        shape.setAttributeNS(null, "stroke", "black");
        shape.setAttributeNS(null, "stroke-width", "5");
        this.connectorShape = shape;
        document.getElementById("svgCanvas").appendChild(shape);
    };
    Drag.prototype.stopDraggingConnection = function (sourceModule, destination) {
        if (sourceModule.getInterfaceContainer().lastLit) {
            sourceModule.getInterfaceContainer().lastLit.className = sourceModule.getInterfaceContainer().lastLit.unlitClassname;
            sourceModule.getInterfaceContainer().lastLit = null;
        }
        sourceModule.getInterfaceContainer().className = sourceModule.getInterfaceContainer().unlitClassname;
        var x, y;
        if (destination) {
            // Get the position of the originating connector with respect to the page.
            var offset;
            if (!this.originIsInput)
                offset = destination.getInputNode();
            else
                offset = destination.getOutputNode();
            var toElem = offset;
            // Get the position of the originating connector with respect to the page.			
            x = window.scrollX + 12;
            y = window.scrollY + 12;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            this.connectorShape.setAttributeNS(null, "x2", String(x));
            this.connectorShape.setAttributeNS(null, "y2", String(y));
            var src, dst;
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
                    x = parseFloat(shape.getAttributeNS(null, "x2"));
                    y = parseFloat(shape.getAttributeNS(null, "y2"));
                    shape.setAttributeNS(null, "x2", shape.getAttributeNS(null, "x1"));
                    shape.setAttributeNS(null, "y2", shape.getAttributeNS(null, "y1"));
                    shape.setAttributeNS(null, "x1", String(x));
                    shape.setAttributeNS(null, "y1", String(y));
                    // can connect!
                    // TODO: first: swap the line endpoints so they're consistently x1->x2
                    // That makes updating them when we drag nodes around easier.
                    src = sourceModule;
                    dst = destination;
                }
            }
            if (src && dst) {
                var connect = new Connect();
                connect.connectModules(src, dst);
                var connector = new Connector();
                dst.addInputConnection(connector);
                src.addOutputConnection(connector);
                this.connectorShape.inputConnection = connector;
                this.connectorShape.destination = dst;
                this.connectorShape.source = src;
                var drag = this;
                connect.saveConnection(src, dst, connector, this.connectorShape);
                this.connectorShape.onclick = function () { connect.deleteConnection(drag); };
                //this.connectorShape = null;
                ;
                if (App.isTooltipEnabled)
                    Tooltips.toolTipForConnections(src.sceneParent);
                return;
            }
        }
        // Otherwise, delete the line
        this.connectorShape.parentNode.removeChild(this.connectorShape);
        this.connectorShape = null;
    };
    Drag.prototype.startDraggingConnector = function (module, event) {
        this.startDraggingConnection(module, event.target);
        // Capture mousemove and mouseup events on the page.
        module.addCnxListener(event.target, "mousemove", module);
        module.addCnxListener(event.target, "mouseup", module);
        event.preventDefault();
        event.stopPropagation();
    };
    Drag.prototype.whileDraggingConnector = function (module, event) {
        var toElem = event.target;
        // Get cursor position with respect to the page.
        var x = event.clientX + window.scrollX;
        var y = event.clientY + window.scrollY;
        // Move connector visual line
        this.connectorShape.setAttributeNS(null, "x2", String(x));
        this.connectorShape.setAttributeNS(null, "y2", String(y));
        if (toElem.classList) {
            // if this is the green or red button, use its parent.
            if (toElem.classList.contains("node-button"))
                toElem = toElem.parentNode;
            // if we're over our originating node, do nothing.
            if (toElem == this.elemNode)
                return;
            // If we used to be lighting up a node, but we're not over it anymore,
            // unlight it.
            if (this.lastLit && (this.lastLit != toElem)) {
                this.lastLit.className = this.lastLit.unlitClassname;
                this.lastLit = null;
            }
            // light up connector point underneath, if any
            if (toElem.classList.contains("node")) {
                if (!this.lastLit || (this.lastLit != toElem)) {
                    if (this.originIsInput) {
                        if (toElem.classList.contains("node-output")) {
                            toElem.unlitClassname = toElem.className;
                            toElem.className += " canConnect";
                            this.lastLit = toElem;
                        }
                    }
                    else {
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
    };
    Drag.prototype.stopDraggingConnector = function (module, event) {
        // Stop capturing mousemove and mouseup events.
        module.removeCnxListener(event.target, "mousemove", module);
        module.removeCnxListener(event.target, "mouseup", module);
        var arrivingNode;
        var modules = module.sceneParent.getModules();
        for (var i = 0; i < modules.length; i++) {
            if ((this.originIsInput && modules[i].isPointInOutput(event.clientX, event.clientY)) || modules[i].isPointInInput(event.clientX, event.clientY)) {
                arrivingNode = modules[i];
                break;
            }
        }
        if (!arrivingNode) {
            var outputModule = module.sceneParent.getAudioOutput();
            var inputModule = module.sceneParent.getAudioInput();
            if ((this.originIsInput && outputModule.isPointInOutput(event.clientX, event.clientY)) || outputModule.isPointInInput(event.clientX, event.clientY)) {
                arrivingNode = outputModule;
            }
            else if ((!this.originIsInput && inputModule.isPointInInput(event.clientX, event.clientY)) || inputModule.isPointInOutput(event.clientX, event.clientY)) {
                arrivingNode = inputModule;
            }
        }
        module.drag.stopDraggingConnection(module, arrivingNode);
    };
    return Drag;
})();
//# sourceMappingURL=Dragging.js.map