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
var Drag = (function () {
    function Drag() {
        this.zIndex = 0;
        this.connector = new Connector();
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
        var moduleContainer = module.moduleView.getModuleContainer();
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
        //moduleContainer.style.zIndex = String(++this.zIndex);
        // Capture mousemove and mouseup events on the page.
        module.addListener("mousemove", module);
        module.addListener("mouseup", module);
        event.preventDefault();
    };
    Drag.prototype.whileDraggingModule = function (event, module) {
        var x, y;
        var moduleContainer = module.moduleView.getModuleContainer();
        // Get cursor position with respect to the page.
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;
        // Move drag element by the same amount the cursor has moved.
        moduleContainer.style.left = (this.elementStartLeft + x - this.cursorStartX) + "px";
        moduleContainer.style.top = (this.elementStartTop + y - this.cursorStartY) + "px";
        if (module.moduleFaust.getInputConnections() != null) {
            var offset = module.moduleView.getInputNode();
            x = window.scrollX + module.moduleView.inputOutputNodeDimension / 2;
            y = window.scrollY + module.moduleView.inputOutputNodeDimension / 2;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            for (var c = 0; c < module.moduleFaust.getInputConnections().length; c++) {
                var currentConnectorShape = module.moduleFaust.getInputConnections()[c].connectorShape;
                var x1 = x;
                var y1 = y;
                var x2 = currentConnectorShape.x2;
                var y2 = currentConnectorShape.y2;
                var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
                currentConnectorShape.setAttributeNS(null, "d", d);
                this.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);
            }
        }
        if (module.moduleFaust.getOutputConnections() != null) {
            var offset = module.moduleView.getOutputNode();
            x = window.scrollX + module.moduleView.inputOutputNodeDimension / 2;
            y = window.scrollY + module.moduleView.inputOutputNodeDimension / 2;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            for (var c = 0; c < module.moduleFaust.getOutputConnections().length; c++) {
                if (module.moduleFaust.getOutputConnections()[c].connectorShape) {
                    var currentConnectorShape = module.moduleFaust.getOutputConnections()[c].connectorShape;
                    var x1 = currentConnectorShape.x1;
                    var y1 = currentConnectorShape.y1;
                    var x2 = x;
                    var y2 = y;
                    var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
                    currentConnectorShape.setAttributeNS(null, "d", d);
                    this.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);
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
    Drag.prototype.updateConnectorShapePath = function (connectorShape, x1, x2, y1, y2) {
        connectorShape.x1 = x1;
        connectorShape.x2 = x2;
        connectorShape.y1 = y1;
        connectorShape.y2 = y2;
    };
    Drag.prototype.setCurvePath = function (x1, y1, x2, y2, x1Bezier, x2Bezier) {
        return "M" + x1 + "," + y1 + " C" + x1Bezier + "," + y1 + " " + x2Bezier + "," + y2 + " " + x2 + "," + y2;
    };
    Drag.prototype.calculDistance = function (x1, x2) {
        return (x1 - x2) / 2;
    };
    Drag.prototype.calculBezier1 = function (x1, x2) {
        return x1 - this.calculDistance(x1, x2);
    };
    Drag.prototype.calculBezier2 = function (x1, x2) {
        return x2 + this.calculDistance(x1, x2);
    };
    Drag.prototype.startDraggingConnection = function (module, target) {
        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button"))
            target = target.parentNode;
        // Get the position of the originating connector with respect to the page.
        var offset = target;
        var x = window.scrollX + module.moduleView.inputOutputNodeDimension / 2;
        var y = window.scrollY + module.moduleView.inputOutputNodeDimension / 2;
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
        module.moduleView.getInterfaceContainer().unlitClassname = module.moduleView.getInterfaceContainer().className;
        module.moduleView.getInterfaceContainer().className += " canConnect";
        // Create a connector visual line
        var svgns = "http://www.w3.org/2000/svg";
        var curve = document.createElementNS(svgns, "path");
        var d = this.setCurvePath(x, y, x, y, x, x);
        curve.setAttributeNS(null, "d", d);
        curve.setAttributeNS(null, "stroke", "black");
        curve.setAttributeNS(null, "stroke-width", "5");
        curve.setAttributeNS(null, "fill", "none");
        //curve.setAttributeNS(null, "stroke-location", "center");
        var shape = document.createElementNS(svgns, "line");
        shape.setAttributeNS(null, "x1", String(x));
        shape.setAttributeNS(null, "y1", String(y));
        shape.setAttributeNS(null, "x2", String(x));
        shape.setAttributeNS(null, "y2", String(y));
        shape.setAttributeNS(null, "stroke", "black");
        shape.setAttributeNS(null, "stroke-width", "5");
        this.connector.connectorShape = curve;
        document.getElementById("svgCanvas").appendChild(curve);
        //document.getElementById("svgCanvas").appendChild(shape);
    };
    Drag.prototype.stopDraggingConnection = function (sourceModule, destination) {
        if (sourceModule.moduleView.getInterfaceContainer().lastLit) {
            sourceModule.moduleView.getInterfaceContainer().lastLit.className = sourceModule.moduleView.getInterfaceContainer().lastLit.unlitClassname;
            sourceModule.moduleView.getInterfaceContainer().lastLit = null;
        }
        sourceModule.moduleView.getInterfaceContainer().className = sourceModule.moduleView.getInterfaceContainer().unlitClassname;
        var x, y;
        if (destination) {
            // Get the position of the originating connector with respect to the page.
            var offset;
            if (!this.originIsInput)
                offset = destination.moduleView.getInputNode();
            else
                offset = destination.moduleView.getOutputNode();
            var toElem = offset;
            // Get the position of the originating connector with respect to the page.			
            x = window.scrollX + destination.moduleView.inputOutputNodeDimension / 2;
            y = window.scrollY + destination.moduleView.inputOutputNodeDimension / 2;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            var x1 = this.cursorStartX;
            var y1 = this.cursorStartY;
            var x2 = x;
            var y2 = y;
            var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
            this.connector.connectorShape.setAttributeNS(null, "d", d);
            this.updateConnectorShapePath(this.connector.connectorShape, x1, x2, y1, y2);
            //this.connector.connectorShape.setAttributeNS(null, "x2", String(x));
            //this.connector.connectorShape.setAttributeNS(null, "y2", String(y));
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
                    var d = this.setCurvePath(x2, y2, x1, y1, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
                    this.connector.connectorShape.setAttributeNS(null, "d", d);
                    this.updateConnectorShapePath(this.connector.connectorShape, x2, x1, y2, y1);
                    //            var shape: ConnectorShape = this.connector.connectorShape;
                    //x = parseFloat(shape.getAttributeNS(null, "x2"));
                    //            y = parseFloat(shape.getAttributeNS(null, "y2"));
                    //   shape.setAttributeNS(null, "x2", shape.getAttributeNS(null, "x1"));
                    //   shape.setAttributeNS(null, "y2", shape.getAttributeNS(null, "y1"));
                    //shape.setAttributeNS(null, "x1", String(x));
                    //            shape.setAttributeNS(null, "y1", String(y));
                    // can connect!
                    // TODO: first: swap the line endpoints so they're consistently x1->x2
                    // That makes updating them when we drag nodes around easier.
                    src = sourceModule;
                    dst = destination;
                }
            }
            if (src && dst) {
                var connector = new Connector();
                connector.connectModules(src, dst);
                dst.moduleFaust.addInputConnection(connector);
                src.moduleFaust.addOutputConnection(connector);
                this.connector.destination = dst;
                this.connector.source = src;
                var drag = this;
                connector.saveConnection(src, dst, this.connector.connectorShape);
                this.connector.connectorShape.onclick = function (event) { connector.deleteConnection(event, drag); };
                //this.connectorShape = null;
                return;
            }
        }
        // Otherwise, delete the line
        this.connector.connectorShape.parentNode.removeChild(this.connector.connectorShape);
        this.connector.connectorShape = null;
    };
    Drag.prototype.startDraggingConnector = function (module, event) {
        this.startDraggingConnection(module, event.target);
        // Capture mousemove and mouseup events on the page.
        module.addCnxListener(event.target, "mousemove", module);
        module.addCnxListener(event.target, "mouseup", module);
        //event.preventDefault();
        //event.stopPropagation();
    };
    Drag.prototype.whileDraggingConnector = function (module, event) {
        var toElem = event.target;
        // Get cursor position with respect to the page.
        var x1 = this.cursorStartX;
        var y1 = this.cursorStartY;
        var x2 = event.clientX + window.scrollX;
        var y2 = event.clientY + window.scrollY;
        var d;
        if (!this.originIsInput) {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
        }
        else {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier1(x1, x2), this.calculBezier2(x1, x2));
        }
        // Move connector visual line
        this.connector.connectorShape.setAttributeNS(null, "d", d);
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
        var arrivingHTMLNode = event.target;
        var arrivingHTMLParentNode = arrivingHTMLNode.offsetParent;
        var arrivingNode;
        var modules = module.sceneParent.getModules();
        for (var i = 0; i < modules.length; i++) {
            if ((this.originIsInput && modules[i].moduleView.isPointInOutput(event.clientX, event.clientY)) || modules[i].moduleView.isPointInInput(event.clientX, event.clientY)) {
                arrivingNode = modules[i];
                break;
            }
        }
        if (!arrivingNode && arrivingHTMLParentNode != undefined) {
            var outputModule = module.sceneParent.getAudioOutput();
            var inputModule = module.sceneParent.getAudioInput();
            if ((this.originIsInput && outputModule.moduleView.isPointInOutput(event.clientX, event.clientY)) || outputModule.moduleView.isPointInInput(event.clientX, event.clientY) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleOutput") {
                arrivingNode = outputModule;
            }
            else if ((!this.originIsInput && inputModule.moduleView.isPointInInput(event.clientX, event.clientY)) || inputModule.moduleView.isPointInOutput(event.clientX, event.clientY) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleInput") {
                arrivingNode = inputModule;
            }
        }
        module.drag.stopDraggingConnection(module, arrivingNode);
    };
    return Drag;
})();
//# sourceMappingURL=Dragging.js.map