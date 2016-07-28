/// <reference path="App.ts"/>
/// <reference path="Utilitary.ts"/>
//contains all the key of resources json files in folders ressources
var Ressources = (function () {
    function Ressources() {
    }
    //get ressource depending on the location, default is french
    Ressources.prototype.getRessources = function (app) {
        var _this = this;
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
        else {
            Utilitary.getXHR("ressources/ressources_en-EN.json", function (ressource) { _this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
    };
    // load the json object
    Ressources.prototype.loadMessages = function (ressourceJson, app) {
        Utilitary.messageRessource = JSON.parse(ressourceJson);
        resumeInit(app);
    };
    return Ressources;
})();
//Contain Message, MessageView, Confirm, Confirm view class
var Message = (function () {
    //Message show up and set a time out, if nothing happen, it remove it self
    //if one click, it stays, if double click it's removed (also the close button works)
    //fadeOutType can be eather null or "messageTransitionOutFast", to have new animation create new rules css
    function Message(message, fadeOutType, duration, delay) {
        var _this = this;
        this.isTouch = false;
        this.fadeOutType = "messageTransitionOut";
        this.duration = 10000;
        this.delay = 4000;
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = function (e) { _this.removeMessage(e); };
        this.messageView.closeButton.addEventListener("click", this.removeEventHandler);
        if (fadeOutType != undefined) {
            this.fadeOutType = fadeOutType;
        }
        if (duration != undefined) {
            this.duration = duration;
        }
        if (delay != undefined) {
            this.delay = delay;
        }
        document.getElementById("dialogue").appendChild(this.messageViewContainer);
        this.timeoutHide = setTimeout(function () { _this.hideMessage(); }, this.duration);
        setTimeout(function () { _this.displayMessage(); }, 500);
        document.addEventListener("messagedbltouch", function () { _this.removeEventHandler(); });
        this.messageViewContainer.addEventListener("click", function (e) { _this.clearTimeouts(e); });
        this.messageViewContainer.addEventListener("click", function () { _this.dbleTouchMessage(); });
        this.messageViewContainer.addEventListener("dblclick", function () { _this.removeEventHandler(); });
    }
    Message.prototype.displayMessage = function () {
        this.messageViewContainer.classList.remove("messageHide");
        this.messageViewContainer.classList.add("messageShow");
        this.messageViewContainer.classList.add("messageTransitionIn");
        this.messageViewContainer.classList.remove(this.fadeOutType);
    };
    Message.prototype.hideMessage = function () {
        var _this = this;
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn");
            this.messageViewContainer.classList.add(this.fadeOutType);
            this.messageViewContainer.classList.add("messageHide");
            this.messageViewContainer.classList.remove("messageShow");
            this.timeoutRemove = setTimeout(function () { _this.removeMessage(); }, this.delay);
        }
    };
    Message.prototype.removeMessage = function (e) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.remove();
            delete this.messageViewContainer;
        }
    };
    Message.prototype.dbleTouchMessage = function () {
        var _this = this;
        if (!this.isTouch) {
            this.isTouch = true;
            window.setTimeout(function () { _this.isTouch = false; }, 300);
        }
        else {
            this.dispatchEventCloseDblTouch();
            this.isTouch = false;
        }
    };
    Message.prototype.dispatchEventCloseDblTouch = function () {
        var event = new CustomEvent("messagedbltouch");
        document.dispatchEvent(event);
    };
    Message.prototype.clearTimeouts = function (e) {
        e.stopPropagation();
        e.preventDefault();
        clearTimeout(this.timeoutHide);
        if (this.timeoutRemove != undefined) {
            clearTimeout(this.timeoutRemove);
        }
        this.displayMessage();
    };
    return Message;
})();
var MessageView = (function () {
    function MessageView() {
    }
    MessageView.prototype.init = function () {
        var messageContainer = document.createElement("div");
        messageContainer.className = "messageContainer messageHide messageTransitionIn";
        var closeButton = document.createElement("div");
        closeButton.id = "closeButton";
        this.closeButton = closeButton;
        var message = document.createElement("div");
        message.className = "message";
        this.message = message;
        messageContainer.appendChild(closeButton);
        messageContainer.appendChild(message);
        return messageContainer;
    };
    return MessageView;
})();
// take message text and callback as parmater
//if validate, the callback is used, other with the confirm is removed
var Confirm = (function () {
    function Confirm(message, callback) {
        var _this = this;
        this.confirmView = new ConfirmView();
        this.confirmViewContainer = this.confirmView.init();
        this.confirmView.message.textContent = message;
        document.getElementById("dialogue").appendChild(this.confirmViewContainer);
        this.displayMessage();
        this.confirmView.validButton.addEventListener("click", function () { callback(function () { _this.removeMessage(); }); });
        this.confirmView.cancelButton.addEventListener("click", function () { _this.removeMessage(); });
    }
    Confirm.prototype.displayMessage = function () {
        this.confirmViewContainer.classList.remove("messageHide");
        this.confirmViewContainer.classList.add("messageShow");
    };
    Confirm.prototype.removeMessage = function (e) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.confirmViewContainer != undefined) {
            this.confirmViewContainer.remove();
            delete this.confirmViewContainer;
        }
    };
    return Confirm;
})();
var ConfirmView = (function () {
    function ConfirmView() {
    }
    ConfirmView.prototype.init = function () {
        var messageContainer = document.createElement("div");
        messageContainer.className = "messageContainer messageHide";
        var message = document.createElement("div");
        message.className = "message";
        this.message = message;
        var validContainer = document.createElement("div");
        validContainer.className = "validConfirmContainer";
        var validButton = document.createElement("button");
        validButton.id = "validButton";
        validButton.className = "accButton";
        this.validButton = validButton;
        var cancelButton = document.createElement("button");
        cancelButton.id = "cancelButton";
        cancelButton.className = "accButton";
        this.cancelButton = cancelButton;
        validContainer.appendChild(cancelButton);
        validContainer.appendChild(validButton);
        messageContainer.appendChild(message);
        messageContainer.appendChild(validContainer);
        return messageContainer;
    };
    return ConfirmView;
})();
// class to handel Drive Api request//
// using the v2 version
/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>
var DriveAPI = (function () {
    function DriveAPI() {
        this.CLIENT_ID = '937268536763-j0tfilisap0274toolo0hehndnhgsrva.apps.googleusercontent.com';
        this.SCOPES = ['https://www.googleapis.com/auth/drive'];
        this.faustFolder = "FaustPlayground";
        this.isFaustFolderPresent = false;
        this.extension = ".jfaust";
    }
    /**
     * Check if current user has authorized this application.
    * disable to deactivate pop up window when not connected
     */
    DriveAPI.prototype.checkAuth = function () {
    };
    DriveAPI.prototype.updateConnection = function () {
        var _this = this;
        gapi.auth.authorize({
            'client_id': this.CLIENT_ID,
            'scope': this.SCOPES.join(' '),
            'immediate': true
        }, function (authResult) { _this.handleAuthResult(authResult); });
    };
    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    DriveAPI.prototype.handleAuthResult = function (authResult, auto) {
        var buttonConnect = document.getElementById('buttonConnectLoadDrive');
        var buttonConnect2 = document.getElementById('buttonConnectSaveDrive');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            var event = new CustomEvent("authon");
            document.dispatchEvent(event);
            this.loadDriveApi();
        }
        else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            var event = new CustomEvent("authoff");
            document.dispatchEvent(event);
        }
        if (authResult.error) {
            var event = new CustomEvent("clouderror", { 'detail': authResult.error });
            document.dispatchEvent(event);
        }
    };
    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    DriveAPI.prototype.handleAuthClick = function (event) {
        var _this = this;
        gapi.auth.authorize({ client_id: this.CLIENT_ID, scope: this.SCOPES, immediate: false }, function (authResult) { _this.handleAuthResult(authResult); });
        return false;
    };
    /**
     * Load Drive API client library.
     */
    DriveAPI.prototype.loadDriveApi = function () {
        var _this = this;
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        gapi.client.load('drive', 'v2', function () { _this.listFolder(); });
    };
    /**
     * Print files.
     */
    DriveAPI.prototype.listFolder = function () {
        var _this = this;
        var request = gapi.client.drive.files.list({
            'maxResults': 10000,
            'q': "title contains 'jfaust' and trashed!=true "
        });
        request.execute(function (resp) {
            var event = new CustomEvent("finishloaddrive");
            document.dispatchEvent(event);
            var files = resp.items;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.fileExtension == "jfaust") {
                        _this.appendPre(file.title, file.id);
                    }
                }
            }
            else {
                _this.appendPre(Utilitary.messageRessource.noFileOnCloud, null);
            }
        });
    };
    DriveAPI.prototype.getFileMetadata = function (fileId) {
        var _this = this;
        var request = gapi.client.drive.files.get({
            'fileId': fileId
        });
        request.execute(function (file) {
            _this.appendPre(file.title, file.id);
        });
    };
    /**
     * Append a pre element to the body containing the given message
     * as its text node.
     *
     * @param {string} message Text to be placed in pre element.
     */
    DriveAPI.prototype.appendPre = function (name, id) {
        var option = document.createElement("option");
        option.value = id;
        option.textContent = name.replace(/.jfaust$/, '');
        var event = new CustomEvent("fillselect", { 'detail': option });
        document.dispatchEvent(event);
    };
    /**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
    DriveAPI.prototype.downloadFile = function (file, callback) {
        if (file.downloadUrl) {
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file.downloadUrl);
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.onload = function () {
                callback(xhr.responseText);
            };
            xhr.onerror = function () {
                callback(null);
            };
            xhr.send();
        }
        else {
            callback(null);
        }
    };
    /**
 * Print a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
    DriveAPI.prototype.getFile = function (fileId, callback) {
        var _this = this;
        var request = gapi.client.drive.files.get({
            'fileId': fileId
        });
        try {
            request.execute(function (resp) {
                _this.lastSavedFileMetadata = resp;
                callback(resp);
            });
        }
        catch (e) {
            new Message("erreur");
        }
    };
    DriveAPI.prototype.createFile = function (fileName, callback) {
        var _this = this;
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        var request = gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'POST',
            'body': {
                "title": fileName + this.extension,
                "mimeType": "application/json"
            }
        });
        request.execute(function (resp) {
            _this.getFile(resp.id, function (fileMetada) { _this.updateFile(resp.id, fileMetada, _this.tempBlob, null); });
        });
    };
    /**
 * Update an existing file's metadata and content.
 *
 * @param {String} fileId ID of the file to update.
 * @param {Object} fileMetadata existing Drive file's metadata.
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Callback function to call when the request is complete.
 */
    DriveAPI.prototype.updateFile = function (fileId, fileMetadata, fileData, callback) {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        var boundary = '-------314159265358979323846';
        var delimiter = "\r\n--" + boundary + "\r\n";
        var close_delim = "\r\n--" + boundary + "--";
        var reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload = function (e) {
            var contentType = fileData.type || 'application/octet-stream';
            // Updating the metadata is optional and you can instead use the value from drive.files.get.
            var base64Data = btoa(reader.result);
            var multipartRequestBody = delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(fileMetadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;
            var request = gapi.client.request({
                'path': '/upload/drive/v2/files/' + fileId,
                'method': 'PUT',
                'params': { 'uploadType': 'multipart', 'alt': 'json' },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });
            if (!callback) {
                callback = function () {
                    var event = new CustomEvent("updatecloudselect");
                    document.dispatchEvent(event);
                    event = new CustomEvent("successave");
                    document.dispatchEvent(event);
                };
            }
            request.execute(callback);
        };
    };
    DriveAPI.prototype.trashFile = function (fileId) {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        var request = gapi.client.drive.files.trash({
            'fileId': fileId
        });
        request.execute(function (resp) {
            var event = new CustomEvent("updatecloudselect");
            document.dispatchEvent(event);
        });
    };
    return DriveAPI;
})();
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Ressources.ts"/>
/// <reference path="DriveAPI.ts"/>
/// <reference path="Main.ts"/>
var Utilitary = (function () {
    function Utilitary() {
    }
    Utilitary.errorCallBack = function (message) {
    };
    Utilitary.showFullPageLoading = function () {
        document.getElementById("loadingPage").style.visibility = "visible";
        //too demanding for mobile firefox...
        //document.getElementById("Normal").style.filter = "blur(2px)"
        //document.getElementById("Normal").style.webkitFilter = "blur(2px)"
        //document.getElementById("menuContainer").style.filter = "blur(2px)"
        //document.getElementById("menuContainer").style.webkitFilter = "blur(2px)"
    };
    Utilitary.hideFullPageLoading = function () {
        document.getElementById("loadingPage").style.visibility = "hidden";
        //document.getElementById("Normal").style.filter = "none"
        //document.getElementById("Normal").style.webkitFilter = "none"
        //document.getElementById("menuContainer").style.filter = "none"
        //document.getElementById("menuContainer").style.webkitFilter = "none"
    };
    Utilitary.isAppPedagogique = function () {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true;
        }
        else {
            return false;
        }
    };
    //generic function to make XHR request
    Utilitary.getXHR = function (url, callback, errCallback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                callback(getrequest.responseText);
            }
            else if (getrequest.readyState == 4 && getrequest.status == 400) {
                errCallback(getrequest.responseText);
            }
        };
        getrequest.open("GET", url, true);
        getrequest.send(null);
    };
    Utilitary.addLoadingLogo = function (idTarget) {
        var loadingDiv = document.createElement("div");
        loadingDiv.className = "loadingDiv";
        var loadingImg = document.createElement("img");
        loadingImg.src = Utilitary.baseImg + "logoAnim.gif";
        loadingImg.id = "loadingImg";
        var loadingText = document.createElement("span");
        loadingText.textContent = Utilitary.messageRessource.loading;
        loadingText.id = "loadingText";
        loadingDiv.appendChild(loadingImg);
        loadingDiv.appendChild(loadingText);
        if (document.getElementById(idTarget) != null) {
            document.getElementById(idTarget).appendChild(loadingDiv);
        }
    };
    Utilitary.removeLoadingLogo = function (idTarget) {
        var divTarget = document.getElementById(idTarget);
        if (divTarget != null && divTarget.getElementsByClassName("loadingDiv").length > 0) {
            while (divTarget.getElementsByClassName("loadingDiv").length != 0) {
                divTarget.getElementsByClassName("loadingDiv")[0].remove();
            }
        }
    };
    Utilitary.addFullPageLoading = function () {
        var loadingText = document.getElementById("loadingTextBig");
        loadingText.id = "loadingTextBig";
        loadingText.textContent = Utilitary.messageRessource.loading;
    };
    Utilitary.replaceAll = function (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
    Utilitary.messageRessource = new Ressources();
    Utilitary.idX = 0;
    Utilitary.baseImg = "img/";
    Utilitary.isAccelerometerOn = false;
    Utilitary.isAccelerometerEditOn = false;
    return Utilitary;
})();
var PositionModule = (function () {
    function PositionModule() {
    }
    return PositionModule;
})();
/*				DRAGGING.JS
    Handles Graphical Drag of Modules and Connections
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
    
    --> Things could probably be easier...
    

        
*/
/// <reference path="Connect.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Utilitary.ts"/>
"use strict";
/***********************************************************************************/
/****** Node Dragging - these are used for dragging the audio modules interface*****/
/***********************************************************************************/
var Drag = (function () {
    function Drag() {
        this.zIndex = 0;
        this.connector = new Connector();
        this.isDragConnector = false;
    }
    //used to dispatch the element, the location and the event to the callback function with click event
    Drag.prototype.getDraggingMouseEvent = function (mouseEvent, module, draggingFunction) {
        var event = mouseEvent;
        var el = mouseEvent.target;
        var x = mouseEvent.clientX + window.scrollX;
        var y = mouseEvent.clientY + window.scrollY;
        draggingFunction(el, x, y, module, event);
    };
    //used to dispatch the element, the location and the event to the callback function with touch event
    Drag.prototype.getDraggingTouchEvent = function (touchEvent, module, draggingFunction) {
        var event = touchEvent;
        if (touchEvent.targetTouches.length > 0) {
            var touch = touchEvent.targetTouches[0];
            var el = touch.target;
            var x = touch.clientX + window.scrollX;
            var y = touch.clientY + window.scrollY;
            draggingFunction(el, x, y, module, event);
        }
        else if (this.isDragConnector) {
            for (var i = 0; i < touchEvent.changedTouches.length; i++) {
                var touch = touchEvent.changedTouches[i];
                var x = touch.clientX + window.scrollX;
                var y = touch.clientY + window.scrollY;
                var el = document.elementFromPoint(x - scrollX, y - scrollY);
                draggingFunction(el, x, y, module, event);
            }
        }
        else {
            draggingFunction(null, null, null, module, event);
        }
    };
    Drag.prototype.startDraggingModule = function (el, x, y, module, event) {
        var moduleContainer = module.moduleView.getModuleContainer();
        // Save starting positions of cursor and element.
        this.cursorStartX = x;
        this.cursorStartY = y;
        this.elementStartLeft = parseInt(moduleContainer.style.left, 10);
        this.elementStartTop = parseInt(moduleContainer.style.top, 10);
        if (isNaN(this.elementStartLeft)) {
            this.elementStartLeft = 0;
        }
        ;
        if (isNaN(this.elementStartTop)) {
            this.elementStartTop = 0;
        }
        ;
        // Capture mousemove and mouseup events on the page.
        document.addEventListener("mouseup", module.eventDraggingHandler, false);
        document.addEventListener("mousemove", module.eventDraggingHandler, false);
        event.stopPropagation();
        event.preventDefault();
    };
    Drag.prototype.whileDraggingModule = function (el, x, y, module, event) {
        var moduleContainer = module.moduleView.getModuleContainer();
        // Move drag element by the same amount the cursor has moved.
        moduleContainer.style.left = (this.elementStartLeft + x - this.cursorStartX) + "px";
        moduleContainer.style.top = (this.elementStartTop + y - this.cursorStartY) + "px";
        if (module.moduleFaust.getInputConnections() != null) {
            Connector.redrawInputConnections(module, this);
        }
        if (module.moduleFaust.getOutputConnections() != null) {
            Connector.redrawOutputConnections(module, this);
        }
        event.stopPropagation();
    };
    Drag.prototype.stopDraggingModule = function (el, x, y, module, event) {
        // Stop capturing mousemove and mouseup events.
        document.removeEventListener("mouseup", module.eventDraggingHandler, false);
        document.removeEventListener("mousemove", module.eventDraggingHandler, false);
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
    Drag.prototype.calculBezier = function (x1, x2) {
        return x1 - (x1 - x2) / 2;
        ;
    };
    Drag.prototype.startDraggingConnection = function (module, target) {
        var _this = this;
        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button"))
            target = target.parentNode;
        // Get the position of the originating connector with respect to the page.
        var offset = target;
        var x = module.moduleView.inputOutputNodeDimension / 2;
        var y = module.moduleView.inputOutputNodeDimension / 2;
        while (offset) {
            x += offset.offsetLeft;
            y += offset.offsetTop;
            offset = offset.offsetParent;
        }
        // Save starting positions of cursor and element.
        this.cursorStartX = x;
        this.cursorStartY = y;
        // remember if this is an input or output node, so we can match
        this.isOriginInput = target.classList.contains("node-input");
        module.moduleView.getInterfaceContainer().unlitClassname = module.moduleView.getInterfaceContainer().className;
        //module.moduleView.getInterfaceContainer().className += " canConnect";
        // Create a connector visual line
        var svgns = "http://www.w3.org/2000/svg";
        var curve = document.createElementNS(svgns, "path");
        var d = this.setCurvePath(x, y, x, y, x, x);
        curve.setAttributeNS(null, "d", d);
        curve.setAttributeNS(null, "stroke", "black");
        curve.setAttributeNS(null, "stroke-width", "6");
        curve.setAttributeNS(null, "fill", "none");
        curve.id = String(Connector.connectorId);
        Connector.connectorId++;
        //console.log("connector Id = " + Connector.connectorId);
        this.connector.connectorShape = curve;
        this.connector.connectorShape.onclick = function (event) { _this.connector.deleteConnection(event, _this); };
        document.getElementById("svgCanvas").appendChild(curve);
    };
    Drag.prototype.stopDraggingConnection = function (sourceModule, destination, target) {
        var _this = this;
        if (sourceModule.moduleView.getInterfaceContainer().lastLit) {
            sourceModule.moduleView.getInterfaceContainer().lastLit.className = sourceModule.moduleView.getInterfaceContainer().lastLit.unlitClassname;
            sourceModule.moduleView.getInterfaceContainer().lastLit = null;
        }
        var resultIsConnectionValid = true;
        if (target != null) {
            resultIsConnectionValid = this.isConnectionValid(target);
        }
        sourceModule.moduleView.getInterfaceContainer().className = sourceModule.moduleView.getInterfaceContainer().unlitClassname;
        var x, y;
        if (destination && destination != sourceModule && this.isConnectionUnique(sourceModule, destination) && resultIsConnectionValid) {
            // Get the position of the originating connector with respect to the page.
            var offset;
            if (!this.isOriginInput)
                offset = destination.moduleView.getInputNode();
            else
                offset = destination.moduleView.getOutputNode();
            var toElem = offset;
            // Get the position of the originating connector with respect to the page.			
            x = destination.moduleView.inputOutputNodeDimension / 2;
            y = destination.moduleView.inputOutputNodeDimension / 2;
            while (offset) {
                x += offset.offsetLeft;
                y += offset.offsetTop;
                offset = offset.offsetParent;
            }
            var x1 = this.cursorStartX;
            var y1 = this.cursorStartY;
            var x2 = x;
            var y2 = y;
            var d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier(x1, x2), this.calculBezier(x1, x2));
            this.connector.connectorShape.setAttributeNS(null, "d", d);
            this.updateConnectorShapePath(this.connector.connectorShape, x1, x2, y1, y2);
            var src, dst;
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
                    var d = this.setCurvePath(x2, y2, x1, y1, this.calculBezier(x1, x2), this.calculBezier(x1, x2));
                    this.connector.connectorShape.setAttributeNS(null, "d", d);
                    this.updateConnectorShapePath(this.connector.connectorShape, x2, x1, y2, y1);
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
                connector.saveConnection(src, dst, this.connector.connectorShape);
                this.connector.connectorShape.onclick = function (event) { connector.deleteConnection(event, _this); };
                //this.connectorShape = null;
                return;
            }
        }
        // Otherwise, delete the line
        this.connector.connectorShape.parentNode.removeChild(this.connector.connectorShape);
        this.connector.connectorShape = null;
    };
    Drag.prototype.startDraggingConnector = function (target, x, y, module, event) {
        this.startDraggingConnection(module, target);
        // Capture mousemove and mouseup events on the page.
        document.addEventListener("mousemove", module.eventConnectorHandler);
        document.addEventListener("mouseup", module.eventConnectorHandler);
        event.preventDefault();
        event.stopPropagation();
    };
    Drag.prototype.whileDraggingConnector = function (target, x, y, module, event) {
        if (this.isDragConnector) {
            var currentHoverElement = document.elementFromPoint(x - scrollX, y - scrollY);
            if (currentHoverElement.classList.contains("node-input")) {
                module.styleInputNodeTouchDragOver(currentHoverElement);
            }
            else if (currentHoverElement.classList.contains("node-output")) {
                module.styleOutputNodeTouchDragOver(currentHoverElement);
            }
            else if (currentHoverElement.parentElement.classList.contains("node-input")) {
                module.styleInputNodeTouchDragOver(currentHoverElement.parentElement);
            }
            else if (currentHoverElement.parentElement.classList.contains("node-output")) {
                module.styleOutputNodeTouchDragOver(currentHoverElement.parentElement);
            }
            else if (!ModuleClass.isNodesModuleUnstyle) {
                var customEvent = new CustomEvent("unstylenode");
                document.dispatchEvent(customEvent);
            }
        }
        var toElem = target;
        // Get cursor position with respect to the page.
        var x1 = this.cursorStartX;
        var y1 = this.cursorStartY;
        var x2 = x; //+ window.scrollX;
        var y2 = y; //+ window.scrollY;
        var d;
        if (!this.isOriginInput) {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier(x1, x2), this.calculBezier(x1, x2));
        }
        else {
            d = this.setCurvePath(x1, y1, x2, y2, this.calculBezier(x1, x2), this.calculBezier(x1, x2));
        }
        // Move connector visual line
        this.connector.connectorShape.setAttributeNS(null, "d", d);
        if (toElem.classList) {
            // if this is the green or red button, use its parent.
            if (toElem.classList.contains("node-button"))
                toElem = toElem.parentNode;
            // If we used to be lighting up a node, but we're not over it anymore,
            // unlight it.
            if (this.lastLit && (this.lastLit != toElem)) {
                this.lastLit.className = this.lastLit.unlitClassname;
                this.lastLit = null;
            }
            // light up connector point underneath, if any
            if (toElem.classList.contains("node")) {
                if (!this.lastLit || (this.lastLit != toElem)) {
                    if (this.isOriginInput) {
                        if (toElem.classList.contains("node-output")) {
                            toElem.unlitClassname = toElem.className;
                            //toElem.className += " canConnect";
                            this.lastLit = toElem;
                        }
                    }
                    else {
                        if (toElem.classList.contains("node-input")) {
                            toElem.unlitClassname = toElem.className;
                            //toElem.className += " canConnect";
                            this.lastLit = toElem;
                        }
                    }
                }
            }
        }
        event.preventDefault();
        event.stopPropagation();
    };
    Drag.prototype.stopDraggingConnector = function (target, x, y, module) {
        x = x - window.scrollX;
        y = y - window.scrollY;
        // Stop capturing mousemove and mouseup events.
        document.removeEventListener("mousemove", module.eventConnectorHandler);
        document.removeEventListener("mouseup", module.eventConnectorHandler);
        var arrivingHTMLNode = target;
        var arrivingHTMLParentNode = arrivingHTMLNode.offsetParent;
        var arrivingNode;
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            if ((this.isOriginInput && modules[i].moduleView.isPointInOutput(x, y)) || modules[i].moduleView.isPointInInput(x, y)) {
                arrivingNode = modules[i];
                break;
            }
        }
        //check arriving node and find module it is attached to
        if (arrivingHTMLParentNode != undefined && arrivingHTMLParentNode.classList.contains("node")) {
            var outputModule = Utilitary.currentScene.getAudioOutput();
            var inputModule = Utilitary.currentScene.getAudioInput();
            if ((this.isOriginInput && outputModule.moduleView.isPointInOutput(x, y)) || outputModule.moduleView.isPointInInput(x, y) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleOutput") {
                arrivingNode = outputModule;
            }
            else if ((!this.isOriginInput && inputModule.moduleView.isPointInInput(x, y)) || inputModule.moduleView.isPointInOutput(x, y) || arrivingHTMLParentNode.offsetParent.getAttribute("id") == "moduleInput") {
                arrivingNode = inputModule;
            }
        }
        this.stopDraggingConnection(module, arrivingNode, target);
        var index = module.dragList.indexOf(this);
        module.dragList.splice(index, 1);
        this.isDragConnector = false;
    };
    Drag.prototype.isConnectionValid = function (target) {
        if (target.classList.contains("node-button")) {
            target = target.parentNode;
        }
        if (target.classList.contains("node-input") && this.isOriginInput) {
            return false;
        }
        else if (target.classList.contains("node-output") && !this.isOriginInput) {
            return false;
        }
        else {
            return true;
        }
    };
    Drag.prototype.isConnectionUnique = function (moduleSource, moduleDestination) {
        if (this.isOriginInput) {
            for (var i = 0; i < moduleSource.moduleFaust.fInputConnections.length; i++) {
                for (var j = 0; j < moduleDestination.moduleFaust.fOutputConnections.length; j++) {
                    if (moduleSource.moduleFaust.fInputConnections[i] == moduleDestination.moduleFaust.fOutputConnections[j]) {
                        return false;
                    }
                }
            }
        }
        else {
            for (var i = 0; i < moduleSource.moduleFaust.fOutputConnections.length; i++) {
                for (var j = 0; j < moduleDestination.moduleFaust.fInputConnections.length; j++) {
                    if (moduleSource.moduleFaust.fOutputConnections[i] == moduleDestination.moduleFaust.fInputConnections[j]) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    return Drag;
})();
/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>
//==============================================================================================
// updateAccInFaustCode (faustcode : string, name: string, newaccvalue: string) : string;
// Update the acc metadata associated to <name> in <faustcode>. Returns the updated faust code
//==============================================================================================
// Iterate into faust code to find next path-string.
var PathIterator = (function () {
    function PathIterator(faustCode) {
        this.fFaustCode = faustCode;
        this.fStart = 0;
        this.fEnd = 0;
    }
    // search and select next string :  "...."  
    // (not completely safe, but should be OK)
    PathIterator.prototype.findNextPathString = function () {
        var p1 = this.fFaustCode.indexOf('"', this.fEnd + 1);
        var p2 = this.fFaustCode.indexOf('"', p1 + 1);
        //console.log(`Current positions : ${this.fEnd}, ${p1}, ${p2}`);
        //if ( (this.fEnd < p0) && (p0 < p1) && (p1 < p2) ) 
        if ((this.fEnd < p1) && (p1 < p2)) {
            this.fStart = p1;
            this.fEnd = p2 + 1;
            var path = this.fFaustCode.slice(this.fStart, this.fEnd);
            //console.log(`findNextPathString -> ${path}`);
            return path;
        }
        else {
            console.log("no more path found: " + this.fEnd + ", " + p1 + ", " + p2);
            return "";
        }
    };
    // Replace the current selected path with a new string and return the update faust code
    PathIterator.prototype.updateCurrentPathString = function (newstring) {
        if ((0 < this.fStart) && (this.fStart < this.fEnd)) {
            // we have a valide path to replace
            return this.fFaustCode.slice(0, this.fStart) + newstring + this.fFaustCode.slice(this.fEnd);
        }
        else {
            console.log("ERROR, trying to update an invalide path");
            return this.fFaustCode;
        }
    };
    return PathIterator;
})();
// Forge accelerometer metadata -> "acc: bla bla bla"" or "noacc: bla bla bla""
function forgeAccMetadata(newAccValue, isEnabled) {
    if (isEnabled) {
        return "acc:" + newAccValue;
    }
    else {
        return "noacc:" + newAccValue;
    }
}
// Remove all metadatas of a uipath : "foo[...][...]" -> "foo"
// Used when searching the source code for a uiname. 
function removeMetadata(uipath) {
    var r = ""; // resulting string
    var i = 0;
    while (true) {
        var j = uipath.indexOf("[", i);
        if (j == -1) {
            r = r + uipath.slice(i);
            return r;
        }
        else {
            r = r + uipath.slice(i, j);
            var k = uipath.indexOf("]", j);
            if (k > 0) {
                i = k + 1;
            }
            else {
                console.log("removeMetada() called on incorrect label: " + uipath);
                return uipath;
            }
        }
    }
}
// replaceAccInPath("[1]toto[noacc:xxxx]...", "[acc:yyyy]",) -> "[1]toto[acc:yyyy]..."
// replaceAccInPath("[1]toto...", "[acc:yyyy]",) -> "[1]toto...[acc:yyyy]"
function replaceAccInPath(oldpath, newacc) {
    // search either noacc or acc
    var i = oldpath.indexOf("noacc");
    if (i < 0)
        i = oldpath.indexOf("acc");
    if (i < 0) {
        // no acc metada found, add at the end
        var newpath = oldpath.slice(0, -1) + "[" + newacc + "]" + '"';
        //console.log(`> replaceAccInPath(${oldpath}, ${newacc}) -> ${newpath}`);
        return newpath;
    }
    else {
        var j = oldpath.indexOf("]", i);
        if (j > 0) {
            var newpath = oldpath.slice(0, i) + newacc + oldpath.slice(j);
            //console.log(`>replaceAccInPath("${oldpath}", ${newacc}) -> ${newpath}`);
            return newpath;
        }
    }
    console.log("ERROR in replaceAccInPath() : malformed path " + oldpath);
    return oldpath;
}
// Checks if a ui name matches a ui path. For examples "toto" matches "[1]toto[acc:...]"
// that is if they are identical after removing the metadata from the ui path
function match(uiname, uipath) {
    var path = removeMetadata(uipath.slice(1, -1));
    var found = path.indexOf(uiname) >= 0;
    //console.log(`> match(${uiname},${path} [${uipath}]) -> ${found}`);
    return found;
}
//==============================================================================================
// updateAccInFaustCode (faustcode : string, name: string, newaccvalue: string) : string;
// Update the acc metadata associated to <name> in <faustcode>. Returns the updated faust code
//==============================================================================================
function updateAccInFaustCode(faustcode, name, newaccvalue) {
    // Creates a path iterator to iterate the faust code from ui path to ui path
    var cc = new PathIterator(faustcode);
    // Search an ui path that matches
    for (var path = cc.findNextPathString(); path != ""; path = cc.findNextPathString()) {
        if (match(name, path)) {
            var u = replaceAccInPath(path, newaccvalue);
            return cc.updateCurrentPathString(u);
        }
    }
    // WARNING: no suitable uipath was found !
    new Message(name + Utilitary.messageRessource.errorAccSliderNotFound);
    return faustcode;
}
//Accelerometer Class
/// <reference path="Utilitary.ts"/>
/// <reference path="Modules/FaustInterface.ts"/>
var Axis;
(function (Axis) {
    Axis[Axis["x"] = 0] = "x";
    Axis[Axis["y"] = 1] = "y";
    Axis[Axis["z"] = 2] = "z";
})(Axis || (Axis = {}));
;
var Curve;
(function (Curve) {
    Curve[Curve["Up"] = 0] = "Up";
    Curve[Curve["Down"] = 1] = "Down";
    Curve[Curve["UpDown"] = 2] = "UpDown";
    Curve[Curve["DownUp"] = 3] = "DownUp";
})(Curve || (Curve = {}));
;
//object describing value off accelerometer metadata values. 
var AccMeta = (function () {
    function AccMeta() {
    }
    return AccMeta;
})();
//Contains the info regarding the mapping of the FaustInterfaceControler and the accelerometer
var AccelerometerSlider = (function () {
    function AccelerometerSlider(accParams) {
        if (accParams != null) {
            this.isEnabled = accParams.isEnabled;
            this.acc = accParams.acc;
            this.setAttributes(accParams.acc);
            this.address = accParams.address;
            this.min = accParams.min;
            this.max = accParams.max;
            this.init = accParams.init;
            this.label = accParams.label;
            this.isActive = Utilitary.isAccelerometerOn;
        }
    }
    AccelerometerSlider.prototype.setAttributes = function (fMetaAcc) {
        if (fMetaAcc != null) {
            var arrayMeta = fMetaAcc.split(" ");
            this.axis = parseInt(arrayMeta[0]);
            this.curve = parseInt(arrayMeta[1]);
            this.amin = parseInt(arrayMeta[2]);
            this.amid = parseInt(arrayMeta[3]);
            this.amax = parseInt(arrayMeta[4]);
        }
    };
    AccelerometerSlider.prototype.setAttributesDetailed = function (axis, curve, min, mid, max) {
        this.axis = axis;
        this.curve = curve;
        this.amin = min;
        this.amid = mid;
        this.amax = max;
    };
    return AccelerometerSlider;
})();
//object responsible of storing all accelerometerSlider and propagate to them the accelerometer infos. 
var AccelerometerHandler = (function () {
    function AccelerometerHandler() {
    }
    // get Accelerometer value
    AccelerometerHandler.prototype.getAccelerometerValue = function () {
        var _this = this;
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", function (event) { _this.propagate(event); }, false);
        }
        else {
            // Browser doesn't support DeviceMotionEvent
            console.log(Utilitary.messageRessource.noDeviceMotion);
        }
    };
    // propagate the new x, y, z value of the accelerometer to the registred object
    AccelerometerHandler.prototype.propagate = function (event) {
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        var z = event.accelerationIncludingGravity.z;
        for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
            if (AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider.isActive && AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider.isEnabled) {
                this.axisSplitter(AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider, x, y, z, this.applyNewValueToModule);
            }
        }
        // update the faustInterfaceControler of the AccelerometerEditView
        if (AccelerometerHandler.faustInterfaceControlerEdit != null) {
            this.axisSplitter(AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider, x, y, z, this.applyValueToEdit);
        }
    };
    //create and register accelerometerSlide
    AccelerometerHandler.registerAcceleratedSlider = function (accParams, faustInterfaceControler, sliderEdit) {
        var accelerometerSlide = new AccelerometerSlider(accParams);
        faustInterfaceControler.accelerometerSlider = accelerometerSlide;
        AccelerometerHandler.curveSplitter(accelerometerSlide);
        if (sliderEdit) {
            AccelerometerHandler.faustInterfaceControlerEdit = faustInterfaceControler;
        }
        else {
            AccelerometerHandler.faustInterfaceControler.push(faustInterfaceControler);
        }
    };
    //give the good axis value to the accelerometerslider, convert it to the faust value before
    AccelerometerHandler.prototype.axisSplitter = function (accelerometerSlide, x, y, z, callBack) {
        switch (accelerometerSlide.axis) {
            case Axis.x:
                var newVal = accelerometerSlide.converter.uiToFaust(x);
                callBack(accelerometerSlide, newVal, x);
                break;
            case Axis.y:
                var newVal = accelerometerSlide.converter.uiToFaust(y);
                callBack(accelerometerSlide, newVal, y);
                break;
            case Axis.z:
                var newVal = accelerometerSlide.converter.uiToFaust(z);
                callBack(accelerometerSlide, newVal, z);
                break;
        }
    };
    //update value of the dsp
    AccelerometerHandler.prototype.applyNewValueToModule = function (accSlid, newVal, axeValue) {
        accSlid.callbackValueChange(accSlid.address, newVal);
    };
    //update value of the edit range in AccelerometerEditView
    AccelerometerHandler.prototype.applyValueToEdit = function (accSlid, newVal, axeValue) {
        AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView.slider.value = axeValue.toString();
    };
    //Apply the right converter with the right curve to an accelerometerSlider 
    AccelerometerHandler.curveSplitter = function (accelerometerSlide) {
        switch (accelerometerSlide.curve) {
            case Curve.Up:
                accelerometerSlide.converter = new AccUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max);
                break;
            case Curve.Down:
                accelerometerSlide.converter = new AccDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max);
                break;
            case Curve.UpDown:
                accelerometerSlide.converter = new AccUpDownConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max);
                break;
            case Curve.DownUp:
                accelerometerSlide.converter = new AccDownUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max);
                break;
            default:
                accelerometerSlide.converter = new AccUpConverter(accelerometerSlide.amin, accelerometerSlide.amid, accelerometerSlide.amax, accelerometerSlide.min, accelerometerSlide.init, accelerometerSlide.max);
        }
    };
    //array containing all the FaustInterfaceControler of the scene
    AccelerometerHandler.faustInterfaceControler = [];
    //faustInterfaceControler of the AccelerometerEditView
    AccelerometerHandler.faustInterfaceControlerEdit = null;
    return AccelerometerHandler;
})();
/***************************************************************************************
********************  Converter objects use to map acc and faust value *****************
****************************************************************************************/
var MinMaxClip = (function () {
    function MinMaxClip(x, y) {
        this.fLo = Math.min(x, y);
        this.fHi = Math.max(x, y);
    }
    MinMaxClip.prototype.clip = function (x) {
        if (x < this.fLo) {
            return this.fLo;
        }
        else if (x > this.fHi) {
            return this.fHi;
        }
        else {
            return x;
        }
    };
    return MinMaxClip;
})();
var Interpolator = (function () {
    function Interpolator(lo, hi, v1, v2) {
        this.range = new MinMaxClip(lo, hi);
        if (hi != lo) {
            //regular case
            this.fCoef = (v2 - v1) / (hi - lo);
            this.fOffset = v1 - lo * this.fCoef;
        }
        else {
            this.fCoef = 0;
            this.fOffset = (v1 + v2) / 2;
        }
    }
    Interpolator.prototype.returnMappedValue = function (v) {
        var x = this.range.clip(v);
        return this.fOffset + x * this.fCoef;
    };
    Interpolator.prototype.getLowHigh = function (amin, amax) {
        return { amin: this.range.fLo, amax: this.range.fHi };
    };
    return Interpolator;
})();
var Interpolator3pt = (function () {
    function Interpolator3pt(lo, mid, hi, v1, vMid, v2) {
        this.fSegment1 = new Interpolator(lo, mid, v1, vMid);
        this.fSegment2 = new Interpolator(mid, hi, vMid, v2);
        this.fMiddle = mid;
    }
    Interpolator3pt.prototype.returnMappedValue = function (x) {
        return (x < this.fMiddle) ? this.fSegment1.returnMappedValue(x) : this.fSegment2.returnMappedValue(x);
    };
    Interpolator3pt.prototype.getMappingValues = function (amin, amid, amax) {
        var lowHighSegment1 = this.fSegment1.getLowHigh(amin, amid);
        var lowHighSegment2 = this.fSegment2.getLowHigh(amid, amax);
        return { amin: lowHighSegment1.amin, amid: lowHighSegment2.amin, amax: lowHighSegment2.amax };
    };
    return Interpolator3pt;
})();
var AccUpConverter = (function () {
    function AccUpConverter(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmid, fmax);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amin, amid, amax);
    }
    AccUpConverter.prototype.uiToFaust = function (x) { return this.accToFaust.returnMappedValue(x); };
    AccUpConverter.prototype.faustToUi = function (x) { return this.accToFaust.returnMappedValue(x); };
    ;
    AccUpConverter.prototype.setMappingValues = function (amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, init, max);
        this.faustToAcc = new Interpolator3pt(min, init, max, amin, amid, amax);
    };
    ;
    AccUpConverter.prototype.getMappingValues = function (amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    ;
    AccUpConverter.prototype.setActive = function (onOff) { this.fActive = onOff; };
    ;
    AccUpConverter.prototype.getActive = function () { return this.fActive; };
    ;
    return AccUpConverter;
})();
var AccDownConverter = (function () {
    function AccDownConverter(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmid, fmin);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amax, amid, amin);
    }
    AccDownConverter.prototype.uiToFaust = function (x) { return this.accToFaust.returnMappedValue(x); };
    AccDownConverter.prototype.faustToUi = function (x) { return this.accToFaust.returnMappedValue(x); };
    ;
    AccDownConverter.prototype.setMappingValues = function (amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, init, min);
        this.faustToAcc = new Interpolator3pt(min, init, max, amax, amid, amin);
    };
    ;
    AccDownConverter.prototype.getMappingValues = function (amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    ;
    AccDownConverter.prototype.setActive = function (onOff) { this.fActive = onOff; };
    ;
    AccDownConverter.prototype.getActive = function () { return this.fActive; };
    ;
    return AccDownConverter;
})();
var AccUpDownConverter = (function () {
    function AccUpDownConverter(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmax, fmin);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    AccUpDownConverter.prototype.uiToFaust = function (x) { return this.accToFaust.returnMappedValue(x); };
    AccUpDownConverter.prototype.faustToUi = function (x) { return this.accToFaust.returnMappedValue(x); };
    ;
    AccUpDownConverter.prototype.setMappingValues = function (amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, max, min);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    };
    ;
    AccUpDownConverter.prototype.getMappingValues = function (amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    ;
    AccUpDownConverter.prototype.setActive = function (onOff) { this.fActive = onOff; };
    ;
    AccUpDownConverter.prototype.getActive = function () { return this.fActive; };
    ;
    return AccUpDownConverter;
})();
var AccDownUpConverter = (function () {
    function AccDownUpConverter(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmin, fmax);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    AccDownUpConverter.prototype.uiToFaust = function (x) { return this.accToFaust.returnMappedValue(x); };
    AccDownUpConverter.prototype.faustToUi = function (x) { return this.accToFaust.returnMappedValue(x); };
    ;
    AccDownUpConverter.prototype.setMappingValues = function (amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, min, max);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    };
    ;
    AccDownUpConverter.prototype.getMappingValues = function (amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    };
    ;
    AccDownUpConverter.prototype.setActive = function (onOff) { this.fActive = onOff; };
    ;
    AccDownUpConverter.prototype.getActive = function () { return this.fActive; };
    ;
    return AccDownUpConverter;
})();
/// <reference path="../Accelerometer.ts"/>
/// <reference path="../Utilitary.ts"/>
/*				FAUSTINTERFACE.JS

    HELPER FUNCTIONS TO CREATE FAUST INTERFACES
    
    FIRST PART --> DECODE JSON ENCODED INTERFACE
    SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/
"use strict";
var FaustInterfaceControler = (function () {
    function FaustInterfaceControler(interfaceCallback, setDSPValueCallback) {
        this.accDefault = "0 0 -10 0 10";
        this.interfaceCallback = interfaceCallback;
        this.setDSPValueCallback = setDSPValueCallback;
    }
    //parse interface json from faust webaudio-asm-wrapper to create corresponding FaustInterfaceControler
    FaustInterfaceControler.prototype.parseFaustJsonUI = function (ui, module) {
        this.faustControlers = [];
        for (var i = 0; i < ui.length; i++) {
            this.parse_group(ui[i], module);
        }
        return this.faustControlers;
    };
    FaustInterfaceControler.prototype.parse_group = function (group, module) {
        if (group.items)
            this.parse_items(group.items, module);
    };
    FaustInterfaceControler.prototype.parse_item = function (item, module) {
        var _this = this;
        var params = module.getInterfaceParams();
        if (params && params[item.address]) {
            item.init = params[item.address];
        }
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);
        }
        else if (item.type === "vslider" || item.type === "hslider") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function () { _this.interfaceCallback(controler); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.name = itemElement.label;
            controler.itemParam = itemElement;
            controler.value = itemElement.init;
            this.faustControlers.push(controler);
        }
        else if (item.type === "button") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function (faustInterface) { _this.interfaceCallback(faustInterface); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            this.faustControlers.push(controler);
        }
        else if (item.type === "checkbox") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(function (faustInterface) { _this.interfaceCallback(faustInterface); }, function (adress, value) { _this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            this.faustControlers.push(controler);
        }
    };
    FaustInterfaceControler.prototype.parse_items = function (items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    };
    FaustInterfaceControler.prototype.setParams = function () {
        if (this.itemParam.meta != undefined) {
            for (var j = 0; j < this.itemParam.meta.length; j++) {
                if (this.itemParam.meta[j].unit) {
                    this.unit = this.itemParam.meta[j].unit;
                }
            }
        }
        if (this.unit == undefined) {
            this.unit = "";
        }
        if (this.itemParam.step != undefined) {
            var precision = this.itemParam.step.toString().split('.').pop().length;
            this.precision = String(precision);
        }
        this.accParams = {
            isEnabled: this.isEnabled,
            acc: this.acc,
            address: this.itemParam.address,
            init: parseFloat(this.itemParam.init),
            max: parseFloat(this.itemParam.max),
            min: parseFloat(this.itemParam.min),
            label: this.itemParam.label
        };
    };
    // create and allocate right faustInterfaceView 
    FaustInterfaceControler.prototype.createFaustInterfaceElement = function () {
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                return this.faustInterfaceView.addFaustModuleSlider(this.itemParam, parseFloat(this.precision), this.unit);
            }
            else if (this.faustInterfaceView.type === "button") {
                return this.faustInterfaceView.addFaustButton(this.itemParam);
            }
            else if (this.faustInterfaceView.type === "checkbox") {
                return this.faustInterfaceView.addFaustCheckBox(this.itemParam.init);
            }
        }
    };
    // Set eventListner of the faustInterfaceView
    FaustInterfaceControler.prototype.setEventListener = function () {
        var _this = this;
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                this.faustInterfaceView.slider.addEventListener("input", function (event) {
                    _this.interfaceCallback(_this);
                    event.stopPropagation();
                    event.preventDefault();
                });
                this.faustInterfaceView.slider.addEventListener("mousedown", function (e) { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchstart", function (e) { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchmove", function (e) { e.stopPropagation(); });
            }
            else if (this.faustInterfaceView.type === "button") {
                this.faustInterfaceView.button.addEventListener("mousedown", function (e) {
                    e.stopPropagation();
                    _this.interfaceCallback(_this);
                });
                this.faustInterfaceView.button.addEventListener("mouseup", function (e) {
                    e.stopPropagation();
                    _this.interfaceCallback(_this);
                });
                this.faustInterfaceView.button.addEventListener("touchstart", function (e) {
                    e.stopPropagation();
                    _this.interfaceCallback(_this);
                });
                this.faustInterfaceView.button.addEventListener("touchend", function (e) {
                    e.stopPropagation();
                    _this.interfaceCallback(_this);
                });
            }
            else if (this.faustInterfaceView.type === "checkbox") {
            }
        }
    };
    //attach acceleromterSlider to faustInterfaceControler
    //give the acc or noacc values
    //if no accelerometer value, it create a default noacc one
    FaustInterfaceControler.prototype.createAccelerometer = function () {
        var _this = this;
        if (this.itemParam.meta) {
            var meta = this.itemParam.meta;
            for (var i = 0; i < meta.length; i++) {
                if (meta[i].acc) {
                    this.acc = meta[i].acc;
                    this.accParams.acc = this.acc;
                    this.accParams.isEnabled = true;
                    AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                    this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                    this.accelerometerSlider.isEnabled = true;
                    this.faustInterfaceView.slider.classList.add("allowed");
                    this.faustInterfaceView.group.classList.add(Axis[this.accelerometerSlider.axis]);
                    if (Utilitary.isAccelerometerOn) {
                        this.accelerometerSlider.isActive = true;
                        this.faustInterfaceView.slider.classList.remove("allowed");
                        this.faustInterfaceView.slider.classList.add("not-allowed");
                        this.faustInterfaceView.slider.disabled = true;
                    }
                }
                else if (meta[i].noacc) {
                    this.acc = meta[i].noacc;
                    this.accParams.acc = this.acc;
                    this.accParams.isEnabled = false;
                    AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                    this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                    this.accelerometerSlider.isEnabled = false;
                    this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
                }
            }
            if (this.accelerometerSlider == undefined) {
                this.acc = this.accDefault;
                this.accParams.acc = this.acc;
                this.accParams.isEnabled = false;
                AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
                this.accelerometerSlider.isEnabled = false;
                if (this.faustInterfaceView.slider != undefined) {
                    this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
                }
            }
        }
        else {
            this.acc = this.accDefault;
            this.accParams.acc = this.acc;
            this.accParams.isEnabled = false;
            AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
            this.accelerometerSlider.callbackValueChange = function (address, value) { _this.callbackValueChange(address, value); };
            this.accelerometerSlider.isEnabled = false;
            if (this.faustInterfaceView.slider != undefined) {
                this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
            }
        }
    };
    //callback to update the dsp value 
    FaustInterfaceControler.prototype.callbackValueChange = function (address, value) {
        this.setDSPValueCallback(address, String(value));
        this.faustInterfaceView.slider.value = String((value - parseFloat(this.itemParam.min)) / parseFloat(this.itemParam.step));
        this.faustInterfaceView.output.textContent = String(value.toFixed(parseFloat(this.precision)));
    };
    return FaustInterfaceControler;
})();
/********************************************************************
 ********************* ADD GRAPHICAL ELEMENTS ***********************
 ********************************************************************/
var FaustInterfaceView = (function () {
    function FaustInterfaceView(type) {
        this.type = type;
    }
    FaustInterfaceView.prototype.addFaustModuleSlider = function (itemParam, precision, unit) {
        var group = document.createElement("div");
        group.className = "control-group";
        var info = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("min", itemParam.min);
        info.setAttribute("max", itemParam.max);
        info.setAttribute("step", itemParam.step);
        info.setAttribute("precision", String(precision));
        var lab = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(itemParam.label));
        this.label = lab;
        info.appendChild(lab);
        var val = document.createElement("span");
        val.className = "value";
        this.output = val;
        var myValue = Number(itemParam.init).toFixed(precision);
        val.appendChild(document.createTextNode("" + myValue + " " + unit));
        val.setAttribute("units", unit);
        info.appendChild(val);
        group.appendChild(info);
        var high = (parseFloat(itemParam.max) - parseFloat(itemParam.min)) / parseFloat(itemParam.step);
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = String(high);
        slider.value = String((parseFloat(itemParam.init) - parseFloat(itemParam.min)) / parseFloat(itemParam.step));
        slider.step = "1";
        this.slider = slider;
        group.appendChild(slider);
        this.group = group;
        return group;
    };
    FaustInterfaceView.prototype.addFaustCheckBox = function (ivalue) {
        var group = document.createElement("div");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.id = "mycheckbox";
        var label = document.createElement('label');
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));
        group.appendChild(checkbox);
        group.appendChild(label);
        return checkbox;
    };
    FaustInterfaceView.prototype.addFaustButton = function (itemParam) {
        var group = document.createElement("div");
        var button = document.createElement("input");
        button.type = "button";
        this.button = button;
        this.button.value = itemParam.label;
        group.appendChild(button);
        return button;
    };
    return FaustInterfaceView;
})();
/// <reference path="../Connect.ts"/>
/*MODULEFAUST.JS
HAND - MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE */
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
})();
/*				MODULEVIEW.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE  INTERFACE
    
    Interface structure
    ===================
    DIV --> this.fModuleContainer
    H6 --> fTitle
    DIV --> fInterfaceContainer
    DIV --> fCloseButton
    DIV --> fFooter
    IMG --> fEditImg
    ===================*/
/// <reference path="../Utilitary.ts"/>
var ModuleView = (function () {
    function ModuleView() {
        this.inputOutputNodeDimension = 32;
    }
    ModuleView.prototype.createModuleView = function (ID, x, y, name, htmlParent) {
        //------- GRAPHICAL ELEMENTS OF MODULE
        var fModuleContainer = document.createElement("div");
        fModuleContainer.className = "moduleFaust";
        fModuleContainer.style.left = "" + x + "px";
        fModuleContainer.style.top = "" + y + "px";
        var fTitle = document.createElement("h6");
        fTitle.className = "module-title";
        fTitle.textContent = "";
        fModuleContainer.appendChild(fTitle);
        var fInterfaceContainer = document.createElement("div");
        fInterfaceContainer.className = "content";
        fModuleContainer.appendChild(fInterfaceContainer);
        this.fInterfaceContainer = fInterfaceContainer;
        //if modules are input or output scene module, no need for interface
        if (name == "input") {
            fModuleContainer.id = "moduleInput";
        }
        else if (name == "output") {
            fModuleContainer.id = "moduleOutput";
        }
        else {
            var textArea = document.createElement("textarea");
            textArea.rows = 15;
            textArea.cols = 60;
            textArea.className = "textArea";
            textArea.value = "";
            textArea.style.display = "none";
            textArea.contentEditable = "true";
            this.textArea = textArea;
            fModuleContainer.appendChild(textArea);
            var fFooter = document.createElement("footer");
            fFooter.id = "moduleFooter";
            fModuleContainer.id = "module" + ID;
            var fCloseButton = document.createElement("div");
            fCloseButton.draggable = false;
            fCloseButton.className = "close";
            this.closeButton = fCloseButton;
            var fMinButton = document.createElement("div");
            fMinButton.draggable = false;
            fMinButton.className = "minus";
            this.miniButton = fMinButton;
            var fMaxButton = document.createElement("div");
            fMaxButton.draggable = false;
            fMaxButton.className = "max";
            this.maxButton = fMaxButton;
            fModuleContainer.appendChild(fCloseButton);
            fModuleContainer.appendChild(fMinButton);
            fModuleContainer.appendChild(fMaxButton);
            var fEditImg = document.createElement("div");
            fEditImg.className = "edit";
            fEditImg.draggable = false;
            this.fEditImg = fEditImg;
            fFooter.appendChild(fEditImg);
            fModuleContainer.appendChild(fFooter);
        }
        htmlParent.appendChild(fModuleContainer);
        this.fName = name;
        this.fModuleContainer = fModuleContainer;
        this.fInterfaceContainer = fInterfaceContainer;
        this.fEditImg = fEditImg;
        this.fTitle = fTitle;
        this.x = x;
        this.y = y;
    };
    // ------ Returns Graphical input and output Node
    ModuleView.prototype.getOutputNode = function () { return this.fOutputNode; };
    ModuleView.prototype.getInputNode = function () { return this.fInputNode; };
    ModuleView.prototype.getModuleContainer = function () {
        return this.fModuleContainer;
    };
    ModuleView.prototype.getInterfaceContainer = function () {
        return this.fInterfaceContainer;
    };
    ModuleView.prototype.setInputNode = function () {
        this.fInputNode = document.createElement("div");
        this.fInputNode.className = "node node-input";
        this.fInputNode.draggable = false;
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fInputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fInputNode);
    };
    ModuleView.prototype.setOutputNode = function () {
        this.fOutputNode = document.createElement("div");
        this.fOutputNode.className = "node node-output";
        this.fOutputNode.draggable = false;
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fOutputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fOutputNode);
    };
    ModuleView.prototype.deleteInputOutputNodes = function () {
        if (this.fInputNode) {
            this.fModuleContainer.removeChild(this.fInputNode);
            this.fInputNode = null;
        }
        if (this.fOutputNode) {
            this.fModuleContainer.removeChild(this.fOutputNode);
            this.fOutputNode = null;
        }
    };
    ModuleView.prototype.isPointInOutput = function (x, y) {
        if (this.fOutputNode && this.fOutputNode.getBoundingClientRect().left < x && x < this.fOutputNode.getBoundingClientRect().right && this.fOutputNode.getBoundingClientRect().top < y && y < this.fOutputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    };
    ModuleView.prototype.isPointInInput = function (x, y) {
        if (this.fInputNode && this.fInputNode.getBoundingClientRect().left <= x && x <= this.fInputNode.getBoundingClientRect().right && this.fInputNode.getBoundingClientRect().top <= y && y <= this.fInputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    };
    ModuleView.prototype.isPointInNode = function (x, y) {
        if (this.fModuleContainer && this.fModuleContainer.getBoundingClientRect().left < x && x < this.fModuleContainer.getBoundingClientRect().right && this.fModuleContainer.getBoundingClientRect().top < y && y < this.fModuleContainer.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    };
    return ModuleView;
})();
/*				MODULECLASS.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE AND ITS INTERFACE
    

        
*/
/// <reference path="../Dragging.ts"/>
/// <reference path="../CodeFaustParser.ts"/>
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/FaustInterface.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ModuleFaust.ts"/>
/// <reference path="ModuleView.ts"/>
"use strict";
var ModuleClass = (function () {
    function ModuleClass(id, x, y, name, htmlElementModuleContainer, removeModuleCallBack, compileFaust) {
        var _this = this;
        //drag object to handle dragging of module and connection
        this.drag = new Drag();
        this.dragList = [];
        this.moduleControles = [];
        this.fModuleInterfaceParams = {};
        this.eventConnectorHandler = function (event) { _this.dragCnxCallback(event, _this); };
        this.eventCloseEditHandler = function (event) { _this.recompileSource(event, _this); };
        this.eventOpenEditHandler = function () { _this.edit(); };
        this.compileFaust = compileFaust;
        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = function (event) { _this.dragCallback(event, _this); };
        this.moduleView = new ModuleView();
        this.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer);
        this.moduleFaust = new ModuleFaust(name);
        this.addEvents();
    }
    //add all event listener to the moduleView
    ModuleClass.prototype.addEvents = function () {
        var _this = this;
        this.moduleView.getModuleContainer().addEventListener("mousedown", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchstart", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchmove", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchend", this.eventDraggingHandler, false);
        if (this.moduleView.textArea != undefined) {
            this.moduleView.textArea.addEventListener("touchstart", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchend", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchmove", function (e) { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("mousedown", function (e) { e.stopPropagation(); });
        }
        if (this.moduleView.closeButton != undefined) {
            this.moduleView.closeButton.addEventListener("click", function () { _this.deleteModule(); });
            this.moduleView.closeButton.addEventListener("touchend", function () { _this.deleteModule(); });
        }
        if (this.moduleView.miniButton != undefined) {
            this.moduleView.miniButton.addEventListener("click", function () { _this.minModule(); });
            this.moduleView.miniButton.addEventListener("touchend", function () { _this.minModule(); });
        }
        if (this.moduleView.maxButton != undefined) {
            this.moduleView.maxButton.addEventListener("click", function () { _this.maxModule(); });
            this.moduleView.maxButton.addEventListener("touchend", function () { _this.maxModule(); });
        }
        if (this.moduleView.fEditImg != undefined) {
            this.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
            this.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        }
    };
    /***************  PRIVATE METHODS  ******************************/
    ModuleClass.prototype.dragCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchend") {
            module.drag.getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
    };
    ModuleClass.prototype.dragCnxCallback = function (event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module) { module.drag.stopDraggingConnector(el, x, y, module); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, function (el, x, y, module, e) { module.drag.whileDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            var newdrag = new Drag();
            newdrag.isDragConnector = true;
            newdrag.originTarget = event.target;
            module.dragList.push(newdrag);
            var index = module.dragList.length - 1;
            module.dragList[index].getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.dragList[index].startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, function (el, x, y, module, e) { module.dragList[i].whileDraggingConnector(el, x, y, module, e); });
                }
            }
        }
        else if (event.type == "touchend") {
            var customEvent = new CustomEvent("unstylenode");
            document.dispatchEvent(customEvent);
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, function (el, x, y, module) { module.dragList[i].stopDraggingConnector(el, x, y, module); });
                }
            }
            document.dispatchEvent(customEvent);
        }
    };
    /*******************************  PUBLIC METHODS  **********************************/
    ModuleClass.prototype.deleteModule = function () {
        var connector = new Connector();
        connector.disconnectModule(this);
        this.deleteFaustInterface();
        // Then delete the visual element
        if (this.moduleView)
            this.moduleView.fModuleContainer.parentNode.removeChild(this.moduleView.fModuleContainer);
        this.deleteDSP(this.moduleFaust.fDSP);
        this.deleteCallback(this);
    };
    //make module smaller
    ModuleClass.prototype.minModule = function () {
        this.moduleView.fInterfaceContainer.classList.add("mini");
        this.moduleView.fTitle.classList.add("miniTitle");
        this.moduleView.miniButton.style.display = "none";
        this.moduleView.maxButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    };
    //restore module size
    ModuleClass.prototype.maxModule = function () {
        this.moduleView.fInterfaceContainer.classList.remove("mini");
        this.moduleView.fTitle.classList.remove("miniTitle");
        this.moduleView.maxButton.style.display = "none";
        this.moduleView.miniButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    };
    //--- Create and Update are called once a source code is compiled and the factory exists
    ModuleClass.prototype.createDSP = function (factory) {
        this.moduleFaust.factory = factory;
        try {
            if (factory != null) {
                this.moduleFaust.fDSP = faust.createDSPInstance(factory, Utilitary.audioContext, 1024);
            }
            else {
                throw new Error("create DSP Error factory null");
            }
        }
        catch (e) {
            new Message(Utilitary.messageRessource.errorCreateDSP + " : " + e);
            Utilitary.hideFullPageLoading();
        }
    };
    //--- Update DSP in module 
    ModuleClass.prototype.updateDSP = function (factory, module) {
        var toDelete = module.moduleFaust.fDSP;
        // 	Save Cnx
        var saveOutCnx = new Array().concat(module.moduleFaust.fOutputConnections);
        var saveInCnx = new Array().concat(module.moduleFaust.fInputConnections);
        // Delete old ModuleClass 
        var connector = new Connector();
        connector.disconnectModule(module);
        module.deleteFaustInterface();
        module.moduleView.deleteInputOutputNodes();
        // Create new one
        module.createDSP(factory);
        module.moduleFaust.fName = module.moduleFaust.fTempName;
        module.moduleFaust.fSource = module.moduleFaust.fTempSource;
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();
        module.deleteDSP(toDelete);
        // Recall Cnx
        if (saveOutCnx && module.moduleView.getOutputNode()) {
            for (var i = 0; i < saveOutCnx.length; i++) {
                if (saveOutCnx[i])
                    connector.createConnection(module, module.moduleView.getOutputNode(), saveOutCnx[i].destination, saveOutCnx[i].destination.moduleView.getInputNode());
            }
        }
        if (saveInCnx && module.moduleView.getInputNode()) {
            for (var i = 0; i < saveInCnx.length; i++) {
                if (saveInCnx[i])
                    connector.createConnection(saveInCnx[i].source, saveInCnx[i].source.moduleView.getOutputNode(), module, module.moduleView.getInputNode());
            }
        }
        Utilitary.hideFullPageLoading();
    };
    ModuleClass.prototype.deleteDSP = function (todelete) {
        // 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
        // 		if(todelete)
        // 		    faust.deleteDSPInstance(todelete);
    };
    /******************** EDIT SOURCE & RECOMPILE *************************/
    ModuleClass.prototype.edit = function () {
        this.saveInterfaceParams();
        var event = new CustomEvent("codeeditevent");
        document.dispatchEvent(event);
        this.deleteFaustInterface();
        this.moduleView.textArea.style.display = "block";
        this.moduleView.textArea.value = this.moduleFaust.fSource;
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
        this.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "enter.png)";
        this.moduleView.fEditImg.addEventListener("click", this.eventCloseEditHandler);
        this.moduleView.fEditImg.addEventListener("touchend", this.eventCloseEditHandler);
        this.moduleView.fEditImg.removeEventListener("click", this.eventOpenEditHandler);
        this.moduleView.fEditImg.removeEventListener("touchend", this.eventOpenEditHandler);
    };
    //---- Update ModuleClass with new name/code source
    ModuleClass.prototype.update = function (name, code) {
        var event = new CustomEvent("codeeditevent");
        document.dispatchEvent(event);
        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module = this;
        this.compileFaust({ name: name, sourceCode: code, x: this.moduleView.x, y: this.moduleView.y, callback: function (factory) { module.updateDSP(factory, module); } });
    };
    //---- React to recompilation triggered by click on icon
    ModuleClass.prototype.recompileSource = function (event, module) {
        Utilitary.showFullPageLoading();
        var buttonImage = event.target;
        var dsp_code = this.moduleView.textArea.value;
        this.moduleView.textArea.style.display = "none";
        Connector.redrawOutputConnections(this, this.drag);
        Connector.redrawInputConnections(this, this.drag);
        module.update(this.moduleView.fTitle.textContent, dsp_code);
        module.recallInterfaceParams();
        module.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "edit.png)";
        module.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
        module.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        module.moduleView.fEditImg.removeEventListener("click", this.eventCloseEditHandler);
        module.moduleView.fEditImg.removeEventListener("touchend", this.eventCloseEditHandler);
    };
    /***************** CREATE/DELETE the DSP Interface ********************/
    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    ModuleClass.prototype.setFaustInterfaceControles = function () {
        var _this = this;
        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        var moduleFaustInterface = new FaustInterfaceControler(function (faustInterface) { _this.interfaceSliderCallback(faustInterface); }, function (adress, value) { _this.moduleFaust.fDSP.setValue(adress, value); });
        this.moduleControles = moduleFaustInterface.parseFaustJsonUI(JSON.parse(this.moduleFaust.fDSP.json()).ui, this);
    };
    // Create FaustInterfaceControler, set its callback and add its AccelerometerSlider
    ModuleClass.prototype.createFaustInterface = function () {
        for (var i = 0; i < this.moduleControles.length; i++) {
            var faustInterfaceControler = this.moduleControles[i];
            faustInterfaceControler.setParams();
            faustInterfaceControler.faustInterfaceView = new FaustInterfaceView(faustInterfaceControler.itemParam.type);
            this.moduleView.getInterfaceContainer().appendChild(faustInterfaceControler.createFaustInterfaceElement());
            faustInterfaceControler.interfaceCallback = this.interfaceSliderCallback.bind(this);
            faustInterfaceControler.updateFaustCodeCallback = this.updateCodeFaust.bind(this);
            faustInterfaceControler.setEventListener();
            faustInterfaceControler.createAccelerometer();
        }
    };
    // Delete all FaustInterfaceControler
    ModuleClass.prototype.deleteFaustInterface = function () {
        this.deleteAccelerometerRef();
        while (this.moduleView.fInterfaceContainer.childNodes.length != 0) {
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
        }
    };
    // Remove AccelerometerSlider ref from AccelerometerHandler
    ModuleClass.prototype.deleteAccelerometerRef = function () {
        for (var i = 0; i < this.moduleControles.length; i++) {
            if (this.moduleControles[i].accelerometerSlider != null && this.moduleControles[i].accelerometerSlider != undefined) {
                var index = AccelerometerHandler.faustInterfaceControler.indexOf(this.moduleControles[i]);
                AccelerometerHandler.faustInterfaceControler.splice(index, 1);
                delete this.moduleControles[i].accelerometerSlider;
            }
        }
        this.moduleControles = [];
    };
    // set DSP value to all FaustInterfaceControlers
    ModuleClass.prototype.setDSPValue = function () {
        for (var i = 0; i < this.moduleControles.length; i++) {
            this.moduleFaust.fDSP.setValue(this.moduleControles[i].itemParam.address, this.moduleControles[i].value);
        }
    };
    // set DSP value to specific FaustInterfaceControlers
    ModuleClass.prototype.setDSPValueCallback = function (address, value) {
        this.moduleFaust.fDSP.setValue(address, value);
    };
    // Updates Faust Code with new accelerometer metadata
    ModuleClass.prototype.updateCodeFaust = function (details) {
        var m = forgeAccMetadata(details.newAccValue, details.isEnabled);
        var s = updateAccInFaustCode(this.moduleFaust.fSource, details.sliderName, m);
        this.moduleFaust.fSource = s;
    };
    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    ModuleClass.prototype.interfaceSliderCallback = function (faustControler) {
        var val;
        if (faustControler.faustInterfaceView.slider) {
            var input = faustControler.faustInterfaceView.slider;
            val = Number((parseFloat(input.value) * parseFloat(faustControler.itemParam.step)) + parseFloat(faustControler.itemParam.min)).toFixed(parseFloat(faustControler.precision));
        }
        else if (faustControler.faustInterfaceView.button) {
            var input = faustControler.faustInterfaceView.button;
            if (faustControler.value == undefined || faustControler.value == "0") {
                faustControler.value = val = "1";
            }
            else {
                faustControler.value = val = "0";
            }
        }
        var text = faustControler.itemParam.address;
        faustControler.value = val;
        var output = faustControler.faustInterfaceView.output;
        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + faustControler.unit;
        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setValue(text, val);
    };
    ModuleClass.prototype.interfaceButtonCallback = function (faustControler, val) {
        var input = faustControler.faustInterfaceView.button;
        var text = faustControler.itemParam.address;
        faustControler.value = val.toString();
        var output = faustControler.faustInterfaceView.output;
        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + faustControler.unit;
        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setValue(text, val.toString());
    };
    // Save graphical parameters of a Faust Node
    ModuleClass.prototype.saveInterfaceParams = function () {
        var interfaceElements = this.moduleView.fInterfaceContainer.childNodes;
        var controls = this.moduleControles;
        for (var j = 0; j < controls.length; j++) {
            var text = controls[j].itemParam.address;
            this.fModuleInterfaceParams[text] = controls[j].value;
        }
    };
    ModuleClass.prototype.recallInterfaceParams = function () {
        for (var key in this.fModuleInterfaceParams)
            this.moduleFaust.fDSP.setValue(key, this.fModuleInterfaceParams[key]);
    };
    ModuleClass.prototype.getInterfaceParams = function () {
        return this.fModuleInterfaceParams;
    };
    ModuleClass.prototype.setInterfaceParams = function (parameters) {
        this.fModuleInterfaceParams = parameters;
    };
    ModuleClass.prototype.addInterfaceParam = function (path, value) {
        this.fModuleInterfaceParams[path] = value.toString();
    };
    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    ModuleClass.prototype.addInputOutputNodes = function () {
        var module = this;
        if (this.moduleFaust.fDSP.getNumInputs() > 0 && this.moduleView.fName != "input") {
            this.moduleView.setInputNode();
            this.moduleView.fInputNode.addEventListener("mousedown", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchstart", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchmove", this.eventConnectorHandler);
            this.moduleView.fInputNode.addEventListener("touchend", this.eventConnectorHandler);
        }
        if (this.moduleFaust.fDSP.getNumOutputs() > 0 && this.moduleView.fName != "output") {
            this.moduleView.setOutputNode();
            this.moduleView.fOutputNode.addEventListener("mousedown", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchstart", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchmove", this.eventConnectorHandler);
            this.moduleView.fOutputNode.addEventListener("touchend", this.eventConnectorHandler);
        }
    };
    //manage style of node when touchover will dragging
    //make the use easier for connections
    ModuleClass.prototype.styleInputNodeTouchDragOver = function (el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.left = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    };
    ModuleClass.prototype.styleOutputNodeTouchDragOver = function (el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.right = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    };
    ModuleClass.isNodesModuleUnstyle = true;
    return ModuleClass;
})();
/*				CONNECT.JS
    Handles Audio/Graphical Connection/Deconnection of modules
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
        
*/
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Utilitary.ts"/>
/// <reference path="Dragging.ts"/>
"use strict";
var Connector = (function () {
    function Connector() {
    }
    // connect input node to device input
    Connector.prototype.connectInput = function (inputModule, divSrc) {
        divSrc.audioNode.connect(inputModule.moduleFaust.getDSP().getProcessor());
    };
    //connect output to device output
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
        source.setDSPValue();
        destination.setDSPValue();
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
    Connector.redrawInputConnections = function (module, drag) {
        var offset = module.moduleView.getInputNode();
        var x = module.moduleView.inputOutputNodeDimension / 2; // + window.scrollX ;
        var y = module.moduleView.inputOutputNodeDimension / 2; // + window.scrollY;
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
            var d = drag.setCurvePath(x1, y1, x2, y2, drag.calculBezier(x1, x2), drag.calculBezier(x1, x2));
            currentConnectorShape.setAttributeNS(null, "d", d);
            drag.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);
        }
    };
    Connector.redrawOutputConnections = function (module, drag) {
        var offset = module.moduleView.getOutputNode();
        var x = module.moduleView.inputOutputNodeDimension / 2; // + window.scrollX ;
        var y = module.moduleView.inputOutputNodeDimension / 2; // + window.scrollY;
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
                var d = drag.setCurvePath(x1, y1, x2, y2, drag.calculBezier(x1, x2), drag.calculBezier(x1, x2));
                currentConnectorShape.setAttributeNS(null, "d", d);
                drag.updateConnectorShapePath(currentConnectorShape, x1, x2, y1, y2);
            }
        }
    };
    Connector.connectorId = 0;
    return Connector;
})();
/// <reference path="Lib/qrcode.d.ts"/>
"use strict";
/************************************************************
***************** Interface to FaustWeb *********************
************************************************************/
var ExportLib = (function () {
    function ExportLib() {
    }
    //--- Send asynchronous POST request to FaustWeb to compile a faust DSP
    // @exportUrl : url of FaustWeb service to target
    // @name : name of DSP to compile
    // @source_code : Faust code to compile
    // @callback : function called once request succeeded 
    // 				- @param : the sha key corresponding to source_code
    ExportLib.getSHAKey = function (exportUrl, name, source_code, callback, errCallback) {
        var filename = name + ".dsp";
        var file = new File([source_code], filename);
        var newRequest = new XMLHttpRequest();
        var params = new FormData();
        params.append('file', file);
        var urlToTarget = exportUrl + "/filepost";
        newRequest.open("POST", urlToTarget, true);
        newRequest.onreadystatechange = function () {
            if (newRequest.readyState == 4 && newRequest.status == 200)
                callback(newRequest.responseText);
            else if (newRequest.readyState == 4 && newRequest.status == 400)
                errCallback(newRequest.responseText);
        };
        newRequest.send(params);
    };
    //--- Send asynchronous GET request to precompile target 
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP to precompile
    // @platform/architecture : platform/architecture to precompile
    // @callback : function called once request succeeded 
    // 				- @param : the sha key 
    ExportLib.prototype.sendPrecompileRequest = function (exportUrl, sha, platforme, architecture, appType, callback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            if (getrequest.readyState == 4) {
                callback(exportUrl, sha, platforme, architecture, appType);
            }
        };
        var compileUrl = exportUrl + "/" + sha + "/" + platforme + "/" + architecture + "/precompile";
        getrequest.open("GET", compileUrl, true);
        getrequest.send(null);
    };
    //--- Transform target 
    // WARNING = THIS FUNCTION REQUIRES QRCODE.JS TO BE INCLUDED IN YOUR HTML FILE
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP
    // @platform/architecture/target : platform/architecture/target compiled
    // @cote : width and height of the returned QrCode
    ExportLib.getQrCode = function (url, sha, plateform, architecture, target, size) {
        var downloadString = url + "/" + sha + "/" + plateform + "/" + architecture + "/" + target;
        var whiteContainer = document.createElement('div');
        whiteContainer.style.cssText = "width:" + size.toString() + "px; height:" + size.toString() + "px; background-color:white; position:relative; margin-left:auto; margin-right:auto; padding:3px;";
        var qqDiv = document.createElement('qrcode');
        var qq = new QRCode(qqDiv, {
            text: downloadString,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        whiteContainer.appendChild(qqDiv);
        return whiteContainer;
    };
    // Return the array of available platforms from the json description
    ExportLib.prototype.getPlatforms = function (json) {
        var platforms = [];
        var data = JSON.parse(json);
        var index = 0;
        for (var p in data) {
            platforms[index] = p;
            index++;
        }
        return platforms;
    };
    // Return the list of available architectures for a specific platform from the json description
    ExportLib.prototype.getArchitectures = function (json, platform) {
        var architectures = [];
        var data = JSON.parse(json);
        return data[platform];
    };
    return ExportLib;
})();
/*				EQUIVALENTFAUST.JS

    HELPER FUNCTIONS TO CREATE FAUST EQUIVALENT EXPRESSION FROM A PATCH
    
    FIRST PART --> DERECURSIVIZE THE PATCH
    SECOND PART --> CREATE THE FAUST EQUIVALENT FROM THE "DERECURSIVIZED" PATCH
*/
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Connect.ts"/>
"use strict";
var ModuleTree = (function () {
    function ModuleTree() {
    }
    return ModuleTree;
})();
var EquivalentFaust = (function () {
    function EquivalentFaust() {
    }
    EquivalentFaust.prototype.isModuleRecursiveExisting = function (moduleTree) {
        if (Utilitary.recursiveMap[moduleTree.patchID])
            return true;
        return false;
    };
    EquivalentFaust.prototype.giveIdToModules = function (scene) {
        var modules = scene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].patchID = String(i + 1);
        }
    };
    EquivalentFaust.prototype.treatRecursiveModule = function (moduleTree) {
        // 	Save recursion in map and flag it
        var ModuleToReplace = this.getFirstOccurenceOfModuleInCourse(moduleTree);
        Utilitary.recursiveMap[moduleTree.patchID] = ModuleToReplace;
        ModuleToReplace.recursiveFlag = true;
    };
    EquivalentFaust.prototype.getFirstOccurenceOfModuleInCourse = function (moduleTree) {
        for (var i = 0; i < moduleTree.course.length; i++) {
            if (moduleTree.patchID == moduleTree.course[i].patchID) {
                return moduleTree.course[i];
            }
        }
        return null;
    };
    EquivalentFaust.prototype.createTree = function (module, parent) {
        var moduleTree = new ModuleTree();
        moduleTree.patchID = module.patchID;
        moduleTree.course = [];
        if (parent) {
            // 		COPY PARENT COURSE
            for (var k = 0; k < parent.course.length; k++)
                moduleTree.course[k] = parent.course[k];
        }
        moduleTree.moduleInputs = [];
        moduleTree.recursiveFlag = false;
        if (this.isModuleRecursiveExisting(moduleTree)) {
            var ModuleToReuse = Utilitary.recursiveMap[moduleTree.patchID];
            moduleTree.sourceCode = ModuleToReuse.sourceCode;
            moduleTree.moduleInputs = ModuleToReuse.moduleInputs;
        }
        else if (this.getFirstOccurenceOfModuleInCourse(moduleTree)) {
            this.treatRecursiveModule(moduleTree);
            // 	Stop Recursion in Tree		
            moduleTree = null;
        }
        else if (module.patchID == "input") {
            moduleTree.sourceCode = module.moduleFaust.getSource();
            moduleTree.course[moduleTree.course.length] = moduleTree;
        }
        else {
            moduleTree.sourceCode = module.moduleFaust.getSource();
            moduleTree.course[moduleTree.course.length] = moduleTree;
            if (module.moduleFaust.getInputConnections()) {
                for (var j = 0; j < module.moduleFaust.getInputConnections().length; j++)
                    moduleTree.moduleInputs[j] = this.createTree(module.moduleFaust.getInputConnections()[j].source, moduleTree);
            }
        }
        return moduleTree;
    };
    /********************************************************************
    ***********************  CREATE FAUST EQUIVALENT ********************
    ********************************************************************/
    //*** The faust equivalent of a scene is calculated following these rules:
    //*** The tree starting from the output Module is computed (tree 1)
    //*** Then if there are unconnected output Modules, there Modules are computed (tree 2, ..., n)
    //*** All trees are composed in parallel
    //*** Every Faust Expression is "Stereoized" before composition with other expressions to ensure composability
    // Computing a Module is computing its entries and merging them in the Module's own faust code.
    EquivalentFaust.prototype.computeModule = function (module) {
        var moduleInputs = module.moduleInputs;
        var faustResult = "";
        // Iterate on input Modules to compute them
        if (moduleInputs && moduleInputs.length != 0) {
            var inputCode = "";
            for (var i = 0; i < moduleInputs.length; i++) {
                if (moduleInputs[i]) {
                    if (moduleInputs[i].sourceCode && moduleInputs[i].sourceCode.length > 0) {
                        if (i != 0)
                            inputCode += ",";
                        inputCode += this.computeModule(moduleInputs[i]);
                    }
                }
            }
            if (inputCode != "") {
                if (module.recursiveFlag)
                    faustResult += "(" + inputCode + ":> ";
                else
                    faustResult += inputCode + ":> ";
            }
        }
        var ModuleCode = module.sourceCode;
        if (module.recursiveFlag)
            faustResult += "stereoize(environment{" + ModuleCode + "}.process))~(_,_)";
        else
            faustResult += "stereoize(environment{" + ModuleCode + "}.process)";
        return faustResult;
    };
    // Computing the trees unconnected to the output
    EquivalentFaust.prototype.connectUnconnectedModules = function (faustModuleList, output) {
        for (var i in faustModuleList) {
            var outputNode = faustModuleList[i].moduleView.getOutputNode();
            if (faustModuleList[i].moduleFaust.fName != "input" && outputNode && (!faustModuleList[i].moduleFaust.getOutputConnections || !faustModuleList[i].moduleFaust.getOutputConnections() || faustModuleList[i].moduleFaust.getOutputConnections().length == 0)) {
                var connector = new Connector();
                connector.createConnection(faustModuleList[i], faustModuleList[i].moduleView.getOutputNode(), output, output.moduleView.getInputNode());
            }
        }
    };
    //Calculate Faust Equivalent of the Scene
    EquivalentFaust.prototype.getFaustEquivalent = function (scene, patchName) {
        var faustModuleList = scene.getModules();
        if (faustModuleList.length > 0) {
            var dest = scene.getAudioOutput();
            var src = scene.getAudioInput();
            if (src)
                src.patchID = "input";
            var faustResult = "stereoize(p) = S(inputs(p), outputs(p))\n\
				    with {\n\
				      // degenerated processor with no outputs\n\
				    S(n,0) = !,! : 0,0; 		// just in case, probably a rare case\n\
				    \n\
				      // processors with no inputs\n\
				    S(0,1) = p <: _/2,_/2; 	// add two fake inputs and split output\n\
				    S(0,2) = p;\n\
				    S(0,n) = p,p :> _,_;	// we are sure this will work if n is odd\n\
				     \n\
				      // processors with one input\n\
				    S(1,1) = p,p; 				// add two fake inputs and split output \n\
				    S(1,n) = p,p :> _/2,_/2;		// we are sure this will work if n is odd\n\
				     \n\
			      // processors with two inputs\n\
				    S(2,1) = p <: _,_; 			// split the output\n\
				    S(2,2) = p; 				// nothing to do, p is already stereo\n\
			     \n\
			      // processors with inputs > 2 and outputs > 2\n\
			    S(n,m) = _,_ <: p,p :> _,_;	// we are sure this works if n or p are odd\n\
			    };\n\
			    \n\
			    recursivize(p,q) = (_,_,_,_ :> stereoize(p)) ~ stereoize(q);\n\
			    ";
            this.connectUnconnectedModules(faustModuleList, dest);
            Utilitary.recursiveMap = [];
            this.giveIdToModules(scene);
            var destinationDIVVV = this.createTree(dest, null);
            if (dest.moduleFaust.getInputConnections())
                faustResult += "process = vgroup(\"" + patchName + "\",(" + this.computeModule(destinationDIVVV) + "));";
            // 		console.log(faustResult);
            return faustResult;
        }
        else
            return null;
    };
    return EquivalentFaust;
})();
//--------Plus Utilisé ---------------Create Faust Equivalent Module of the Scene
//    // To avoid sharing instances of a same factory in the resulting Faust Equivalent
//    wrapSourceCodesInGroups(){
//	    var modules = getElementsByClassName("div", "moduleFaust");
//	    for (var i = 0; i < modules.length; i++)
//		    modules[i].Source = "process = vgroup(\"component"+ i.toString() + "\",environment{" + modules[i].Source + "}.process);";
//    }
//    function createFaustEquivalent(scene, patchName, parent){
//    // Save All Params	
//	    var modules = scene.getModules();
//	    for (var i = 0; i < modules.length; i++){	
//		    if(modules[i])
//			    modules[i].saveParams();
//	    }
//    // Concatenate All Params
//	    var fullParams = new Array();
//	    for (var i = 0; i < modules.length; i++) {
//		    if(modules[i]){
//			    var arrayParams = modules[i].getParams;
//    //   BIDOUILLE!!!!! Adding component wrapping to avoid merging of 2 instances of same factory
//			    for(key in arrayParams){
//				    var newKey = "/" + patchName /*+ "/component" + i.toString()*/ + key;
//				    fullParams[newKey] = arrayParams[key];
//			    }
//		    }
//	    }
//    // THIS SHOULD BE DONE BUT FOR NOW IT CAUSED A PROBLEM, I CAN'T REMEMBER WHICH... 
//    // 	wrapSourceCodesInGroups();
//	    var faustResult = getFaustEquivalent(scene, patchName);
//	    if(faustResult){
//    // Save concatenated params in new DIV
//		    var DSP = createDSP(faustResult);
//		    if(DSP){
//			    var faustModule = createModule(idX++, document.body.scrollWidth/3, document.body.scrollHeight/3, patchName, parent, window.scenes[2].removeModule);
// 			    faustModule.createDSP(faustResult);
// 			    faustModule.setParams(fullParams);
// 			    return faustModule;
//		    }
//	    }
//	    return null;
//    }
//}
//ExportView
/// <reference path="../Utilitary.ts"/>
var ExportView = (function () {
    function ExportView() {
    }
    ExportView.prototype.initExportView = function () {
        var exportContainer = document.createElement("div");
        exportContainer.id = "exportContent";
        exportContainer.className = "menuContent";
        var nameAppContainer = document.createElement("div");
        nameAppContainer.id = "nameAppContainer";
        nameAppContainer.className = "exportSubmenu";
        var exportOptionContainer = document.createElement("div");
        exportOptionContainer.id = "exportOptionContainer";
        exportOptionContainer.className = "exportSubmenu";
        var exportResultContainer = document.createElement("div");
        exportResultContainer.id = "exportResultContainer";
        exportResultContainer.className = "exportSubmenu";
        /////////////////////////////////  name App
        var nameAppTitle = document.createElement("span");
        nameAppTitle.id = "nameAppTitle";
        nameAppTitle.textContent = Utilitary.messageRessource.appNameExport;
        nameAppTitle.className = "exportTitle";
        var dynamicName = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Utilitary.currentScene.sceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;
        var rulesName = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.textContent = Utilitary.messageRessource.rulesSceneName;
        this.rulesName = rulesName;
        var input = document.createElement("input");
        input.id = "inputNameApp";
        input.className = "inputExport";
        input.value = Utilitary.currentScene.sceneName;
        var renameBottomButtonContainer = document.createElement("div");
        renameBottomButtonContainer.className = "bottomButtonContainer";
        var renameButton = document.createElement("button");
        renameButton.type = "button";
        renameButton.id = "buttonNameApp";
        renameButton.className = "button";
        renameButton.textContent = Utilitary.messageRessource.buttonChangeSceneName;
        renameBottomButtonContainer.appendChild(renameButton);
        nameAppContainer.appendChild(nameAppTitle);
        nameAppContainer.appendChild(rulesName);
        nameAppContainer.appendChild(input);
        nameAppContainer.appendChild(renameBottomButtonContainer);
        this.inputNameApp = input;
        this.buttonNameApp = renameButton;
        /////////////////////////////////  export Options
        var moreOptionDiv = document.createElement("div");
        moreOptionDiv.textContent = "+ plus d'options";
        moreOptionDiv.id = "moreOptionDiv";
        moreOptionDiv.style.display = "block";
        this.moreOptionDiv = moreOptionDiv;
        var optionContainer = document.createElement("div");
        optionContainer.id = "optionContainer";
        optionContainer.style.display = "none";
        this.optionContainer = optionContainer;
        var lessOptionDiv = document.createElement("div");
        lessOptionDiv.id = "lessOptionDiv";
        lessOptionDiv.textContent = Utilitary.messageRessource.lessOptions;
        lessOptionDiv.style.display = "none";
        this.lessOptionDiv = lessOptionDiv;
        var urlDiv = document.createElement("div");
        urlDiv.id = "inputExport";
        var exportOptionTitle = document.createElement("span");
        exportOptionTitle.id = "exportOptionTitle";
        exportOptionTitle.textContent = Utilitary.messageRessource.titleExportOptions;
        exportOptionTitle.className = "exportTitle";
        var fwurl = document.createElement("input");
        fwurl.id = "faustweburl";
        fwurl.className = "inputExport";
        fwurl.value = "http://faustservice.grame.fr";
        this.inputServerUrl = fwurl;
        urlDiv.appendChild(fwurl);
        var exportChoiceDiv = document.createElement('div');
        exportChoiceDiv.id = "optionExportContainer";
        var refreshButton = document.createElement("button");
        refreshButton.textContent = Utilitary.messageRessource.buttonRefresh;
        refreshButton.id = "refreshButton";
        refreshButton.className = "button";
        this.refreshButton = refreshButton;
        urlDiv.appendChild(refreshButton);
        var selectDiv = document.createElement("div");
        selectDiv.id = "selectDiv";
        exportChoiceDiv.appendChild(selectDiv);
        var selectPlatform = document.createElement("select");
        selectPlatform.id = "platforms";
        selectPlatform.className = "selects";
        var self = this;
        this.selectPlatform = selectPlatform;
        selectDiv.appendChild(selectPlatform);
        var selectArch = document.createElement("select");
        selectArch.id = "architectures";
        selectArch.className = "selects";
        selectDiv.appendChild(selectArch);
        var exportButton = document.createElement("input");
        exportButton.id = "exportButton";
        exportButton.type = "submit";
        exportButton.className = "button";
        exportButton.value = Utilitary.messageRessource.buttonExportScene;
        this.exportButton = exportButton;
        var exportBottomButtonContainer = document.createElement("div");
        exportBottomButtonContainer.className = "bottomButtonContainer";
        exportBottomButtonContainer.appendChild(exportButton);
        optionContainer.appendChild(exportOptionTitle);
        optionContainer.appendChild(urlDiv);
        optionContainer.appendChild(exportChoiceDiv);
        exportOptionContainer.appendChild(moreOptionDiv);
        exportOptionContainer.appendChild(lessOptionDiv);
        exportOptionContainer.appendChild(optionContainer);
        exportOptionContainer.appendChild(exportBottomButtonContainer);
        //////////////////////////// export Result
        var exportResultTitle = document.createElement("span");
        exportResultTitle.id = "exportResultTitle";
        exportResultTitle.textContent = Utilitary.messageRessource.titleDownlaodExport;
        exportResultTitle.className = "exportTitle";
        exportResultContainer.appendChild(exportResultTitle);
        exportContainer.appendChild(nameAppContainer);
        exportContainer.appendChild(exportOptionContainer);
        exportContainer.appendChild(exportResultContainer);
        return exportContainer;
    };
    return ExportView;
})();
/*				EXPORT.JS
    Handles Graphical elements for the Export Feature of the normal Playground
        
*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ExportView.ts"/>
/// <reference path="../Utilitary.ts"/>
"use strict";
/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/
var Export = (function () {
    function Export() {
        var _this = this;
        //------ Update Architectures with Plateform change
        this.updateArchitectures = function () {
            if (!_this.clearSelectBox('architectures')) {
                return;
            }
            else {
                var data = JSON.parse(_this.jsonText);
                var platformsSelect = document.getElementById('platforms'); //get the combobox
                var options = platformsSelect.options[platformsSelect.selectedIndex];
                var selPlatform = options.value;
                var dataCopy = data[selPlatform];
                var iterator = 0;
                for (var subData in dataCopy) {
                    if (iterator < dataCopy.length) {
                        var mainData = dataCopy[subData];
                        _this.addItem('architectures', mainData);
                        iterator = iterator + 1;
                    }
                }
            }
        };
        //callback to get Target on server
        this.uploadTargets = function () {
            _this.clearSelectBox('platforms');
            _this.clearSelectBox('architectures');
            var input = document.getElementById("faustweburl");
            Export.exportUrl = input.value;
            Export.targetsUrl = Export.exportUrl + "/targets";
            Utilitary.getXHR(Export.targetsUrl, function (json) { _this.uploadTargetCallback(json); }, function (errorMessage) { Utilitary.errorCallBack(errorMessage); });
        };
        /********************************************************************
        **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
        ********************************************************************/
        this.exportFaustCode = function (shaKey) {
            var platformsSelect = document.getElementById("platforms"); //get the combobox
            var optionPlateform = platformsSelect.options[platformsSelect.selectedIndex];
            var platforme = optionPlateform.value;
            var architecturesSelect = document.getElementById("architectures"); //get the combobox
            var optionArchi = architecturesSelect.options[architecturesSelect.selectedIndex];
            var architecture = optionArchi.value;
            var serverUrl = document.getElementById("faustweburl").value;
            var appType = "binary.zip";
            if (architecture == "android")
                appType = "binary.apk";
            var exportLib = new ExportLib();
            exportLib.sendPrecompileRequest(serverUrl, shaKey, platforme, architecture, appType, function (serverUrl, shaKey, plateforme, architecture, appType) { _this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType); });
            // 	Delete existing content if existing
        };
        //set download QR Code and Button
        this.setDownloadOptions = function (serverUrl, shaKey, plateforme, architecture, appType) {
            if (shaKey.indexOf("ERROR") == -1) {
                var disposableExportDiv = document.createElement("div");
                disposableExportDiv.id = "disposableExportDiv";
                var qrDiv = document.createElement('div');
                qrDiv.id = "qrcodeDiv";
                var myWhiteDiv = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
                qrDiv.appendChild(myWhiteDiv);
                var downloadBottomButtonContainer = document.createElement("div");
                downloadBottomButtonContainer.className = "bottomButtonContainer";
                var linkDownload = document.createElement('button');
                linkDownload.value = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
                linkDownload.id = "linkDownload";
                linkDownload.className = "button";
                linkDownload.textContent = Utilitary.messageRessource.buttonDownloadApp;
                downloadBottomButtonContainer.appendChild(linkDownload);
                _this.exportView.downloadButton = linkDownload;
                _this.exportView.downloadButton.onclick = function () { window.location.href = _this.exportView.downloadButton.value; };
                document.getElementById("exportResultContainer").appendChild(disposableExportDiv);
                disposableExportDiv.appendChild(qrDiv);
                disposableExportDiv.appendChild(downloadBottomButtonContainer);
                _this.exportView.exportButton.addEventListener("click", _this.eventExport);
                _this.exportView.exportButton.style.opacity = "1";
                Utilitary.removeLoadingLogo("exportResultContainer");
            }
            else {
                new Message(shaKey);
            }
            _this.exportView.exportButton.addEventListener("click", _this.eventExport);
            _this.exportView.exportButton.style.opacity = "1";
            Utilitary.removeLoadingLogo("exportResultContainer");
        };
    }
    // Set EventListener
    Export.prototype.setEventListeners = function () {
        var _this = this;
        this.exportView.refreshButton.onclick = function () { _this.uploadTargets(); };
        this.exportView.selectPlatform.onchange = function () { _this.updateArchitectures(); };
        this.exportView.inputServerUrl.onkeypress = function (e) { if (e.which == 13) {
            _this.uploadTargets();
        } };
        this.eventExport = function (event) { _this.exportPatch(event, _this); };
        this.exportView.exportButton.addEventListener("click", this.eventExport);
        this.exportView.buttonNameApp.onclick = function () { _this.renameScene(); };
        this.exportView.inputNameApp.onkeypress = function (e) { if (e.which == 13) {
            _this.renameScene();
        } };
        this.exportView.moreOptionDiv.addEventListener("click", function () { _this.exportView.moreOptionDiv.style.display = "none"; _this.exportView.lessOptionDiv.style.display = _this.exportView.optionContainer.style.display = "block"; }, false);
        this.exportView.lessOptionDiv.addEventListener("click", function () { _this.exportView.moreOptionDiv.style.display = "block"; _this.exportView.lessOptionDiv.style.display = _this.exportView.optionContainer.style.display = "none"; }, false);
    };
    // add options into select boxes
    Export.prototype.addItem = function (id, itemText) {
        var platformsSelect = document.getElementById(id);
        var option = document.createElement('option');
        option.text = itemText;
        platformsSelect.add(option);
    };
    //clear select boxes
    Export.prototype.clearSelectBox = function (id) {
        if (document.getElementById(id) != undefined) {
            while (document.getElementById(id).childNodes.length > 0) {
                document.getElementById(id).removeChild(document.getElementById(id).childNodes[0]);
            }
            return true;
        }
        else {
            return false;
        }
    };
    //callback to refresh Target
    Export.prototype.uploadTargetCallback = function (json) {
        this.jsonText = json;
        var data = JSON.parse(this.jsonText);
        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    };
    //set selection to default, currently android
    Export.prototype.setDefaultSelect = function () {
        var platefromSelect = document.getElementById("platforms");
        var options = platefromSelect.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].textContent == "android") {
                platefromSelect.selectedIndex = i;
            }
        }
    };
    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/
    Export.prototype.exportPatch = function (event, expor) {
        this.exportView.exportButton.removeEventListener("click", this.eventExport);
        this.exportView.exportButton.style.opacity = "0.3";
        var sceneName = Utilitary.currentScene.sceneName;
        if (sceneName == null || sceneName == "") {
            sceneName = "MonApplication";
        }
        this.removeQRCode();
        Utilitary.addLoadingLogo("exportResultContainer");
        var equivalentFaust = new EquivalentFaust();
        var faustCode = equivalentFaust.getFaustEquivalent(Utilitary.currentScene, Utilitary.currentScene.sceneName);
        ExportLib.getSHAKey(document.getElementById("faustweburl").value, Utilitary.currentScene.sceneName, faustCode, expor.exportFaustCode);
    };
    Export.prototype.removeQRCode = function () {
        var disposableExportDiv = document.getElementById('disposableExportDiv');
        if (disposableExportDiv) {
            disposableExportDiv.remove();
        }
    };
    Export.prototype.renameScene = function () {
        Scene.rename(this.exportView.inputNameApp, this.exportView.rulesName, this.exportView.dynamicName);
    };
    Export.exportUrl = "http://faustservice.grame.fr";
    Export.targetsUrl = "http://faustservice.grame.fr/targets";
    return Export;
})();
/*				PLAYGROUND.JS
    Init Normal Scene with all its graphical elements

    This is the unique scene of the Normal Playground
        
*/
/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Menu/Export.ts"/>
"use strict";
var SceneView = (function () {
    function SceneView() {
    }
    SceneView.prototype.initNormalScene = function (scene) {
        var container = document.createElement("div");
        container.id = "Normal";
        var svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.id = "svgCanvas";
        container.appendChild(svgCanvas);
        //--------- HEADER
        var head = document.createElement("header");
        head.id = "header";
        container.appendChild(head);
        var uploadDiv = document.createElement("div");
        uploadDiv.id = "upload";
        uploadDiv.className = "uploading";
        head.appendChild(uploadDiv);
        //----------- INPUT OUTPUT MODULES
        var inputOutputModuleContainer = document.createElement("div");
        inputOutputModuleContainer.id = "inputOutputModuleContainer";
        container.appendChild(inputOutputModuleContainer);
        this.inputOutputModuleContainer = inputOutputModuleContainer;
        //----------- MODULES
        var moduleContainer = document.createElement("section");
        moduleContainer.id = "modules";
        moduleContainer.className = "container";
        container.appendChild(moduleContainer);
        //------------ MENUS
        var linkWilson = document.createElement("div");
        linkWilson.id = "ChrisLine";
        linkWilson.className = "link";
        linkWilson.textContent = Utilitary.messageRessource.reference;
        container.appendChild(linkWilson);
        var alink = document.createElement("a");
        alink.href = "https://github.com/cwilso/WebAudio";
        alink.textContent = Utilitary.messageRessource.chrisWilson;
        linkWilson.appendChild(alink);
        var srcDiv = document.createElement("div");
        srcDiv.id = "input";
        srcDiv.className = "source";
        container.appendChild(srcDiv);
        var imageDiv = document.createElement('div');
        imageDiv.id = "logoDiv";
        srcDiv.appendChild(imageDiv);
        var imageLogo = document.createElement('img');
        imageLogo.className = "logoGrame";
        imageLogo.src = "img/grame.png";
        imageDiv.appendChild(imageLogo);
        var dropElementScene = document.createElement("div");
        dropElementScene.className = "dropElementGraph";
        dropElementScene.style.display = "none";
        this.dropElementScene = dropElementScene;
        var dropElementText = document.createElement("div");
        dropElementText.textContent = Utilitary.messageRessource.drop;
        dropElementText.className = "dropElementText";
        dropElementScene.appendChild(dropElementText);
        container.appendChild(dropElementScene);
        this.fSceneContainer = container;
        var playgroundView = this;
    };
    return SceneView;
})();
/*				SCENECLASS.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING THE API OF A GENERIC SCENE
*/
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/ModuleClass.ts"/>
/// <reference path="../Lib/webaudio-asm-worker-wrapper.d.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="SceneView.ts"/>
"use strict";
var Scene = (function () {
    function Scene(identifiant, compileFaust, sceneView) {
        var _this = this;
        //temporary arrays used to recall a scene from a jfaust file
        this.arrayRecalScene = [];
        this.arrayRecalledModule = [];
        this.isMute = false;
        //-- Modules contained in the scene
        this.fModuleList = [];
        this.sceneName = "Patch";
        //used to keep loading page when loading the two input and output default modules
        this.isInitLoading = true;
        this.isOutputTouch = false;
        this.compileFaust = compileFaust;
        this.sceneView = new SceneView();
        this.sceneView.initNormalScene(this);
        this.integrateSceneInBody();
        this.integrateOutput();
        document.addEventListener("unstylenode", function () { _this.unstyleNode(); });
    }
    Scene.prototype.getSceneContainer = function () { return this.sceneView.fSceneContainer; };
    /*********************** MUTE/UNMUTE SCENE ***************************/
    Scene.prototype.muteScene = function () {
        var out = document.getElementById("audioOutput");
        if (out != null) {
            if (out.audioNode.context.suspend != undefined) {
                out.audioNode.context.suspend();
                this.isMute = true;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker-mute.png)";
            }
        }
    };
    Scene.prototype.unmuteScene = function () {
        var _this = this;
        console.log("timeIn");
        window.setTimeout(function () { _this.delayedUnmuteScene(); }, 500);
    };
    Scene.prototype.delayedUnmuteScene = function () {
        console.log("timeout");
        var out = document.getElementById("audioOutput");
        if (out != null) {
            if (out.audioNode.context.resume != undefined) {
                out.audioNode.context.resume();
                this.isMute = false;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker.png)";
            }
        }
    };
    //add listner on the output module to give the user the possibility to mute/onmute the scene
    Scene.prototype.addMuteOutputListner = function (moduleOutput) {
        var _this = this;
        moduleOutput.moduleView.fModuleContainer.ontouchstart = function () { _this.dbleTouchOutput(); };
        moduleOutput.moduleView.fModuleContainer.ondblclick = function () { _this.dispatchEventMuteUnmute(); };
    };
    //custom doubl touch event to mute
    Scene.prototype.dbleTouchOutput = function () {
        var _this = this;
        if (!this.isOutputTouch) {
            this.isOutputTouch = true;
            window.setTimeout(function () { _this.isOutputTouch = false; }, 300);
        }
        else {
            this.dispatchEventMuteUnmute();
            this.isOutputTouch = false;
        }
    };
    Scene.prototype.dispatchEventMuteUnmute = function () {
        if (!this.isMute) {
            this.muteScene();
        }
        else {
            this.unmuteScene();
        }
    };
    /******************** HANDLE MODULES IN SCENE ************************/
    Scene.prototype.getModules = function () { return this.fModuleList; };
    Scene.prototype.addModule = function (module) { this.fModuleList.push(module); };
    Scene.prototype.removeModule = function (module) {
        this.fModuleList.splice(this.fModuleList.indexOf(module), 1);
    };
    Scene.prototype.cleanModules = function () {
        for (var i = this.fModuleList.length - 1; i >= 0; i--) {
            this.fModuleList[i].deleteModule();
            this.removeModule(this.fModuleList[i]);
        }
    };
    /*******************************  PUBLIC METHODS  **********************************/
    Scene.prototype.integrateSceneInBody = function () {
        document.body.appendChild(this.sceneView.fSceneContainer);
    };
    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    Scene.prototype.integrateInput = function () {
        var _this = this;
        var positionInput = this.positionInputModule();
        this.fAudioInput = new ModuleClass(Utilitary.idX++, positionInput.x, positionInput.y, "input", this.sceneView.inputOutputModuleContainer, function (module) { _this.removeModule(module); }, this.compileFaust);
        this.fAudioInput.patchID = "input";
        var scene = this;
        this.compileFaust({ name: "input", sourceCode: "process=_,_;", x: positionInput.x, y: positionInput.y, callback: function (factory) { scene.integrateAudioInput(factory); } });
    };
    Scene.prototype.integrateOutput = function () {
        var _this = this;
        var positionOutput = this.positionOutputModule();
        var scene = this;
        this.fAudioOutput = new ModuleClass(Utilitary.idX++, positionOutput.x, positionOutput.y, "output", this.sceneView.inputOutputModuleContainer, function (module) { _this.removeModule(module); }, this.compileFaust);
        this.fAudioOutput.patchID = "output";
        this.addMuteOutputListner(this.fAudioOutput);
        this.compileFaust({ name: "output", sourceCode: "process=_,_;", x: positionOutput.x, y: positionOutput.y, callback: function (factory) { scene.integrateAudioOutput(factory); } });
    };
    Scene.prototype.integrateAudioOutput = function (factory) {
        if (this.fAudioOutput) {
            this.fAudioOutput.moduleFaust.setSource("process=_,_;");
            this.fAudioOutput.createDSP(factory);
            this.activateAudioOutput(this.fAudioOutput);
        }
        this.fAudioOutput.addInputOutputNodes();
        this.integrateInput();
    };
    Scene.prototype.integrateAudioInput = function (factory) {
        if (this.fAudioInput) {
            this.fAudioInput.moduleFaust.setSource("process=_,_;");
            this.fAudioInput.createDSP(factory);
            this.activateAudioInput();
        }
        this.fAudioInput.addInputOutputNodes();
        Utilitary.hideFullPageLoading();
        this.isInitLoading = false;
    };
    Scene.prototype.getAudioOutput = function () { return this.fAudioOutput; };
    Scene.prototype.getAudioInput = function () { return this.fAudioInput; };
    /********************************************************************
**********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
********************************************************************/
    Scene.prototype.activateAudioInput = function () {
        var _this = this;
        var navigatorLoc = navigator;
        if (!navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia = navigatorLoc.webkitGetUserMedia || navigatorLoc.mozGetUserMedia;
        }
        if (navigatorLoc.getUserMedia) {
            navigatorLoc.getUserMedia({ audio: true }, function (mediaStream) { _this.getDevice(mediaStream); }, function (e) {
                _this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
                _this.fAudioInput.moduleView.fInterfaceContainer.title = Utilitary.messageRessource.errorGettingAudioInput;
                new Message(Utilitary.messageRessource.errorGettingAudioInput);
            });
        }
        else {
            this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
            new Message(Utilitary.messageRessource.errorInputAPINotAvailable);
            this.fAudioInput.moduleView.fInterfaceContainer.title = Utilitary.messageRessource.errorInputAPINotAvailable;
        }
    };
    Scene.prototype.getDevice = function (device) {
        // Create an AudioNode from the stream.
        var src = document.getElementById("input");
        src.audioNode = Utilitary.audioContext.createMediaStreamSource(device);
        document.body.appendChild(src);
        var drag = new Drag();
        var connect = new Connector();
        connect.connectInput(this.fAudioInput, src);
    };
    Scene.prototype.activateAudioOutput = function (sceneOutput) {
        var out = document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = Utilitary.audioContext.destination;
        document.body.appendChild(out);
        var connect = new Connector();
        connect.connectOutput(sceneOutput, out);
    };
    /*********************** SAVE/RECALL SCENE ***************************/
    // use a collection of JsonSaveModule describing the scene and the modules to save it in a json string
    // isPrecompiled is used to save or not the asm.js code
    Scene.prototype.saveScene = function (isPrecompiled) {
        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                this.fModuleList[i].patchID = String(i + 1);
            }
        }
        var json;
        var jsonObjectCollection = {};
        for (var i = 0; i < this.fModuleList.length; i++) {
            if (this.fModuleList[i].patchID != "output" && this.fModuleList[i].patchID != "input") {
                jsonObjectCollection[this.fModuleList[i].patchID.toString()] = new JsonSaveModule();
                var jsonObject = jsonObjectCollection[this.fModuleList[i].patchID.toString()];
                jsonObject.sceneName = this.sceneName;
                jsonObject.patchId = this.fModuleList[i].patchID.toString();
                jsonObject.code = this.fModuleList[i].moduleFaust.getSource();
                jsonObject.name = this.fModuleList[i].moduleFaust.getName();
                jsonObject.x = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().left.toString();
                jsonObject.y = this.fModuleList[i].moduleView.getModuleContainer().getBoundingClientRect().top.toString();
                var inputs = this.fModuleList[i].moduleFaust.getInputConnections();
                var jsonInputs = new JsonInputsSave();
                jsonInputs.source = [];
                if (inputs) {
                    for (var j = 0; j < inputs.length; j++) {
                        jsonInputs.source.push(inputs[j].source.patchID.toString());
                    }
                }
                var outputs = this.fModuleList[i].moduleFaust.getOutputConnections();
                var jsonOutputs = new JsonOutputsSave();
                jsonOutputs.destination = [];
                if (outputs) {
                    for (var j = 0; j < outputs.length; j++) {
                        jsonOutputs.destination.push(outputs[j].destination.patchID.toString());
                    }
                }
                var params = this.fModuleList[i].moduleFaust.getDSP().controls();
                var jsonParams = new JsonParamsSave();
                jsonParams.sliders = [];
                if (params) {
                    for (var j = 0; j < params.length; j++) {
                        var jsonSlider = new JsonSliderSave();
                        jsonSlider.path = params[j];
                        jsonSlider.value = this.fModuleList[i].moduleFaust.getDSP().getValue(params[j]);
                        jsonParams.sliders.push(jsonSlider);
                    }
                }
                var faustIControler = this.fModuleList[i].moduleControles;
                var jsonAccs = new JsonAccSaves();
                jsonAccs.controles = [];
                for (var j = 0; j < faustIControler.length; j++) {
                    var jsonAcc = new JsonAccSave();
                    var acc = faustIControler[j].accelerometerSlider;
                    jsonAcc.axis = acc.axis.toString();
                    jsonAcc.curve = acc.curve.toString();
                    jsonAcc.amin = acc.amin.toString();
                    jsonAcc.amid = acc.amid.toString();
                    jsonAcc.amax = acc.amax.toString();
                    jsonAcc.adress = acc.address;
                    jsonAcc.isEnabled = acc.isEnabled;
                    jsonAccs.controles.push(jsonAcc);
                }
                jsonObject.inputs = jsonInputs;
                jsonObject.outputs = jsonOutputs;
                jsonObject.params = jsonParams;
                jsonObject.acc = jsonAccs;
                var factorySave = faust.writeDSPFactoryToMachine(this.fModuleList[i].moduleFaust.factory);
                if (factorySave && isPrecompiled) {
                    jsonObject.factory = new JsonFactorySave();
                    jsonObject.factory.name = factorySave.name;
                    jsonObject.factory.code = factorySave.code;
                }
            }
        }
        json = JSON.stringify(jsonObjectCollection);
        return json;
    };
    //recall scene from json/jfaust fill arrayRecalScene with each JsonSaveModule
    Scene.prototype.recallScene = function (json) {
        if (json != null) {
            try {
                var jsonObjectCollection = JSON.parse(json);
            }
            catch (e) {
                new Message(Utilitary.messageRessource.errorJsonCorrupted);
                Utilitary.hideFullPageLoading();
            }
            //this.parent.currentNumberDSP = this.fModuleList.length;
            for (var index in jsonObjectCollection) {
                var jsonObject = jsonObjectCollection[index];
                this.arrayRecalScene.push(jsonObject);
            }
            this.lunchModuleCreation();
        }
        else {
            Utilitary.hideFullPageLoading();
            new Message(Utilitary.messageRessource.errorLoading);
        }
    };
    // recall module at rank 0 of arrayRecalScene
    // direct use of the asm.js code if exist
    // or compile the faust code
    // 
    // When arrayRecalScene empty, connect the modules in the scene
    Scene.prototype.lunchModuleCreation = function () {
        var _this = this;
        if (this.arrayRecalScene.length != 0) {
            var jsonObject = this.arrayRecalScene[0];
            if (jsonObject.factory != undefined) {
                this.tempPatchId = jsonObject.patchId;
                var factory = faust.readDSPFactoryFromMachine(jsonObject.factory);
                this.updateAppTempModuleInfo(jsonObject);
                this.sceneName = jsonObject.sceneName;
                this.createModule(factory);
            }
            else if (jsonObject.patchId != "output" && jsonObject.patchId != "input") {
                this.tempPatchId = jsonObject.patchId;
                this.sceneName = jsonObject.sceneName;
                var argumentCompile = { name: jsonObject.name, sourceCode: jsonObject.code, x: parseFloat(jsonObject.x), y: parseFloat(jsonObject.y), callback: function (factory) { _this.createModule(factory); } };
                this.compileFaust(argumentCompile);
            }
            else {
                this.arrayRecalScene.shift();
                this.lunchModuleCreation();
            }
        }
        else {
            for (var i = 0; i < this.arrayRecalledModule.length; i++) {
                this.connectModule(this.arrayRecalledModule[i]);
            }
            for (var i = 0; i < this.arrayRecalledModule.length; i++) {
                delete this.arrayRecalledModule[i].patchID;
            }
            this.arrayRecalledModule = [];
            var event = new CustomEvent("updatename");
            document.dispatchEvent(event);
            Utilitary.hideFullPageLoading();
        }
    };
    //update temporary info for the module being created
    Scene.prototype.updateAppTempModuleInfo = function (jsonSaveObject) {
        this.tempModuleX = parseFloat(jsonSaveObject.x);
        this.tempModuleY = parseFloat(jsonSaveObject.y);
        this.tempModuleName = jsonSaveObject.name;
        this.tempModuleSourceCode = jsonSaveObject.code;
        this.tempPatchId = jsonSaveObject.patchId;
        this.tempParams = jsonSaveObject.params;
    };
    //create Module then remove corresponding JsonSaveModule from arrayRecalScene at rank 0
    //re-lunch module of following Module/JsonSaveModule
    Scene.prototype.createModule = function (factory) {
        var _this = this;
        try {
            if (!factory) {
                new Message(faust.getErrorMessage());
                Utilitary.hideFullPageLoading();
                return;
            }
            var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), function (module) { _this.removeModule(module); }, this.compileFaust);
            module.moduleFaust.setSource(this.tempModuleSourceCode);
            module.createDSP(factory);
            module.patchID = this.tempPatchId;
            if (this.tempParams) {
                for (var i = 0; i < this.tempParams.sliders.length; i++) {
                    var slider = this.tempParams.sliders[i];
                    module.addInterfaceParam(slider.path, parseFloat(slider.value));
                }
            }
            module.moduleFaust.recallInputsSource = this.arrayRecalScene[0].inputs.source;
            module.moduleFaust.recallOutputsDestination = this.arrayRecalScene[0].outputs.destination;
            this.arrayRecalledModule.push(module);
            module.recallInterfaceParams();
            module.setFaustInterfaceControles();
            module.createFaustInterface();
            module.addInputOutputNodes();
            this.addModule(module);
            this.recallAccValues(this.arrayRecalScene[0].acc, module);
            this.arrayRecalScene.shift();
            this.lunchModuleCreation();
        }
        catch (e) {
            new Message(Utilitary.messageRessource.errorCreateModuleRecall);
            this.arrayRecalScene.shift();
            this.lunchModuleCreation();
        }
    };
    //recall of the accelerometer mapping parameters for each FaustInterfaceControler of the Module
    Scene.prototype.recallAccValues = function (jsonAccs, module) {
        if (jsonAccs != undefined) {
            for (var i in jsonAccs.controles) {
                var controle = jsonAccs.controles[i];
                if (controle != undefined) {
                    for (var j in module.moduleControles) {
                        var moduleControle = module.moduleControles[j];
                        if (moduleControle.itemParam.address == controle.adress) {
                            var group = moduleControle.faustInterfaceView.group;
                            var slider = moduleControle.faustInterfaceView.slider;
                            var acc = moduleControle.accelerometerSlider;
                            moduleControle.accelerometerSlider.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            moduleControle.acc = controle.axis + " " + controle.curve + " " + controle.amin + " " + controle.amid + " " + controle.amax;
                            acc.amax = parseFloat(controle.amax);
                            acc.amid = parseFloat(controle.amid);
                            acc.amin = parseFloat(controle.amin);
                            acc.axis = parseFloat(controle.axis);
                            acc.curve = parseFloat(controle.curve);
                            acc.isEnabled = controle.isEnabled;
                            AccelerometerHandler.curveSplitter(acc);
                            group.className = "control-group";
                            group.classList.add(Axis[controle.axis]);
                            if (!controle.isEnabled) {
                                group.classList.add("disabledAcc");
                                slider.classList.add("allowed");
                                slider.classList.remove("not-allowed");
                                slider.disabled = false;
                            }
                            else {
                                if (acc.isActive) {
                                    slider.classList.add("not-allowed");
                                    slider.classList.remove("allowed");
                                    slider.disabled = true;
                                }
                                else {
                                    slider.classList.add("allowed");
                                    slider.classList.remove("not-allowed");
                                    slider.disabled = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    //connect Modules recalled
    Scene.prototype.connectModule = function (module) {
        try {
            for (var i = 0; i < module.moduleFaust.recallInputsSource.length; i++) {
                var moduleSource = this.getModuleByPatchId(module.moduleFaust.recallInputsSource[i]);
                if (moduleSource != null) {
                    var connector = new Connector();
                    connector.createConnection(moduleSource, moduleSource.moduleView.getOutputNode(), module, module.moduleView.getInputNode());
                }
            }
            for (var i = 0; i < module.moduleFaust.recallOutputsDestination.length; i++) {
                var moduleDestination = this.getModuleByPatchId(module.moduleFaust.recallOutputsDestination[i]);
                if (moduleDestination != null) {
                    var connector = new Connector();
                    connector.createConnection(module, module.moduleView.getOutputNode(), moduleDestination, moduleDestination.moduleView.getInputNode());
                }
            }
        }
        catch (e) {
            new Message(Utilitary.messageRessource.errorConnectionRecall);
        }
    };
    //use to identify the module to be connected to when recalling connections between modules
    Scene.prototype.getModuleByPatchId = function (patchId) {
        if (patchId == "output") {
            return this.fAudioOutput;
        }
        else if (patchId == "input") {
            return this.fAudioInput;
        }
        else {
            var arrayModules = this.getModules();
            for (var i = 0; i < arrayModules.length; i++) {
                if (arrayModules[i].patchID == patchId) {
                    return arrayModules[i];
                }
            }
        }
        return null;
    };
    //use to replace all éèàù ' from string and replace it with eeau__
    Scene.cleanName = function (newName) {
        newName = Utilitary.replaceAll(newName, "é", "e");
        newName = Utilitary.replaceAll(newName, "è", "e");
        newName = Utilitary.replaceAll(newName, "à", "a");
        newName = Utilitary.replaceAll(newName, "ù", "u");
        newName = Utilitary.replaceAll(newName, " ", "_");
        newName = Utilitary.replaceAll(newName, "'", "_");
        return newName;
    };
    //check if string start only with letter (no accent) 
    //and contains only letter (no accent) underscore and number for a lenght between 1 and 50 char
    Scene.isNameValid = function (newName) {
        var pattern = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");
        if (pattern.test(newName)) {
            return true;
        }
        else {
            return false;
        }
    };
    //rename scene if format is correct and return true otherwise return false
    Scene.rename = function (input, spanRule, spanDynamic) {
        var newName = input.value;
        newName = Scene.cleanName(newName);
        if (Scene.isNameValid(newName)) {
            Utilitary.currentScene.sceneName = newName;
            spanDynamic.textContent = Utilitary.currentScene.sceneName;
            spanRule.style.opacity = "0.6";
            input.style.boxShadow = "0 0 0 green inset";
            input.style.border = "none";
            input.value = Utilitary.currentScene.sceneName;
            var event = new CustomEvent("updatename");
            document.dispatchEvent(event);
            return true;
        }
        else {
            spanRule.style.opacity = "1";
            input.style.boxShadow = "0 0 6px yellow inset";
            input.style.border = "3px solid red";
            new Message(Utilitary.messageRessource.invalidSceneName);
            return false;
        }
    };
    /***************** SET POSITION OF INPUT OUTPUT MODULE ***************/
    Scene.prototype.positionInputModule = function () {
        var position = new PositionModule();
        position.x = 10;
        position.y = window.innerHeight / 2;
        return position;
    };
    Scene.prototype.positionOutputModule = function () {
        var position = new PositionModule();
        position.x = window.innerWidth - 98;
        position.y = window.innerHeight / 2;
        return position;
    };
    Scene.prototype.positionDblTapModule = function () {
        var position = new PositionModule();
        position.x = window.innerWidth / 2;
        position.y = window.innerHeight / 2;
        return position;
    };
    /***************** Unstyle node connection of all modules on touchscreen  ***************/
    Scene.prototype.unstyleNode = function () {
        var modules = this.getModules();
        modules.push(this.fAudioInput);
        modules.push(this.fAudioOutput);
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].moduleView.fInputNode) {
                modules[i].moduleView.fInputNode.style.border = "none";
                modules[i].moduleView.fInputNode.style.left = "-16px";
                modules[i].moduleView.fInputNode.style.marginTop = "-18px";
            }
            if (modules[i].moduleView.fOutputNode) {
                modules[i].moduleView.fOutputNode.style.border = "none";
                modules[i].moduleView.fOutputNode.style.right = "-16px";
                modules[i].moduleView.fOutputNode.style.marginTop = "-18px";
            }
        }
        ModuleClass.isNodesModuleUnstyle = true;
    };
    return Scene;
})();
var JsonSaveCollection = (function () {
    function JsonSaveCollection() {
    }
    return JsonSaveCollection;
})();
var JsonSaveModule = (function () {
    function JsonSaveModule() {
    }
    return JsonSaveModule;
})();
var JsonOutputsSave = (function () {
    function JsonOutputsSave() {
    }
    return JsonOutputsSave;
})();
var JsonInputsSave = (function () {
    function JsonInputsSave() {
    }
    return JsonInputsSave;
})();
var JsonParamsSave = (function () {
    function JsonParamsSave() {
    }
    return JsonParamsSave;
})();
var JsonAccSaves = (function () {
    function JsonAccSaves() {
    }
    return JsonAccSaves;
})();
var JsonAccSave = (function () {
    function JsonAccSave() {
    }
    return JsonAccSave;
})();
var JsonSliderSave = (function () {
    function JsonSliderSave() {
    }
    return JsonSliderSave;
})();
var JsonFactorySave = (function () {
    function JsonFactorySave() {
    }
    return JsonFactorySave;
})();
/// <reference path="Messages.ts"/>
//class ErrorFaust
var ErrorFaust = (function () {
    function ErrorFaust() {
    }
    ErrorFaust.errorCallBack = function (errorMessage) {
        new Message(errorMessage);
    };
    return ErrorFaust;
})();
//LibraryView.ts : LibraryView Class which contains all the graphical parts of the library
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
var LibraryView = (function () {
    function LibraryView() {
    }
    LibraryView.prototype.initLibraryView = function () {
        var libraryContent = document.createElement("div");
        libraryContent.id = "libraryContent";
        libraryContent.className = "menuContent";
        /////////////////Instruments
        var instrumentLibraryContent = document.createElement("div");
        instrumentLibraryContent.id = "instrumentLibraryContent";
        instrumentLibraryContent.className = "submenuLibraryContent";
        this.intrumentLibrary = instrumentLibraryContent;
        var instrumentLibraryTitle = document.createElement("span");
        instrumentLibraryTitle.id = "instrumentLibraryTitle";
        instrumentLibraryTitle.className = "libraryTitles";
        instrumentLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleInstruments));
        var intrumentLibrarySelect = document.createElement("ul");
        intrumentLibrarySelect.id = "instrumentLibrarySelect";
        intrumentLibrarySelect.className = "librarySelects";
        Ps.initialize(intrumentLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.intrumentLibrarySelect = intrumentLibrarySelect;
        instrumentLibraryContent.appendChild(instrumentLibraryTitle);
        instrumentLibraryContent.appendChild(intrumentLibrarySelect);
        ///////////////Effects
        var effetLibraryContent = document.createElement("div");
        effetLibraryContent.id = "effetLibraryContent";
        effetLibraryContent.className = "submenuLibraryContent";
        this.effetLibrary = effetLibraryContent;
        var effetLibraryTitle = document.createElement("span");
        effetLibraryTitle.id = "effetLibraryTitle";
        effetLibraryTitle.className = "libraryTitles";
        effetLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleEffects));
        var effetLibrarySelect = document.createElement("ul");
        effetLibrarySelect.id = "effetLibrarySelect";
        effetLibrarySelect.className = "librarySelects";
        Ps.initialize(effetLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.effetLibrarySelect = effetLibrarySelect;
        effetLibraryContent.appendChild(effetLibraryTitle);
        effetLibraryContent.appendChild(effetLibrarySelect);
        /////////////Exemple
        var exempleLibraryContent = document.createElement("div");
        exempleLibraryContent.id = "exempleLibraryContent";
        exempleLibraryContent.className = "submenuLibraryContent";
        this.exempleLibrary = exempleLibraryContent;
        var exempleLibraryTitle = document.createElement("span");
        exempleLibraryTitle.id = "exempleLibraryTitle";
        exempleLibraryTitle.className = "libraryTitles";
        exempleLibraryTitle.appendChild(document.createTextNode(Utilitary.messageRessource.titleExemples));
        var exempleLibrarySelect = document.createElement("ul");
        exempleLibrarySelect.id = "exempleLibrarySelect";
        exempleLibrarySelect.className = "librarySelects";
        Ps.initialize(exempleLibrarySelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.exempleLibrarySelect = exempleLibrarySelect;
        exempleLibraryContent.appendChild(exempleLibraryTitle);
        exempleLibraryContent.appendChild(exempleLibrarySelect);
        libraryContent.appendChild(instrumentLibraryContent);
        libraryContent.appendChild(effetLibraryContent);
        libraryContent.appendChild(exempleLibraryContent);
        return libraryContent;
    };
    return LibraryView;
})();
/*				LIBRARY.JS
    Creates Graphical Library of Faust Modules
    Connects with faust.grame.fr to receive the json description of available modules

    Interface structure
    ===================
    DIV --> PARENT
        DIV --> libraryDiv
            DIV --> libraryTitle
            DIV --> imageNode
            DIV --> fFooter
            UL --> section 1
                LI --> subsection 1
                LI --> subsection 2
                etc
            UL --> section 2
                LI --> subsection 1
                LI --> subsection 2
                etc
    ===================

    DEPENDENCIES :
        - faust.grame.fr/www/pedagogie/index.json
*/
/// <reference path="../Utilitary.ts"/>
/// <reference path="LibraryView.ts"/>
var Library = (function () {
    function Library() {
        this.isSmaller = false;
        this.isDblTouch = false;
    }
    //get json with library infos
    Library.prototype.fillLibrary = function () {
        var _this = this;
        var url = "faust-modules/index.json";
        Utilitary.getXHR(url, function (json) { _this.fillLibraryCallBack(json); }, function (errorMessage) { Utilitary.errorCallBack(errorMessage); });
    };
    //dispatch library info to each submenu
    Library.prototype.fillLibraryCallBack = function (json) {
        var jsonObject = JSON.parse(json);
        jsonObject.effet = "effetLibrarySelect";
        jsonObject.effetSupprStructure = "faust-modules/effects/";
        jsonObject.instrument = "instrumentLibrarySelect";
        jsonObject.instrumentSupprStructure = "faust-modules/generators/";
        jsonObject.exemple = "exempleLibrarySelect";
        jsonObject.exempleSupprStructure = "faust-modules/combined/";
        this.fillSubMenu(jsonObject.instruments, jsonObject.instrument, jsonObject.instrumentSupprStructure);
        this.fillSubMenu(jsonObject.effets, jsonObject.effet, jsonObject.effetSupprStructure);
        this.fillSubMenu(jsonObject.exemples, jsonObject.exemple, jsonObject.exempleSupprStructure);
    };
    //fill submenu and attach events
    Library.prototype.fillSubMenu = function (options, subMenuId, stringStructureRemoved) {
        var _this = this;
        var subMenu = document.getElementById(subMenuId);
        for (var i = 0; i < options.length; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.title = Utilitary.messageRessource.hoverLibraryElement;
            a.addEventListener("click", function (e) { e.preventDefault(); });
            var dblckickHandler = this.dispatchEventLibrary.bind(this, a.href);
            a.ondblclick = dblckickHandler;
            a.ontouchstart = function (e) { _this.dbleTouchMenu(e); };
            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li);
        }
    };
    //custom doube touch event handler
    Library.prototype.dbleTouchMenu = function (touchEvent) {
        var _this = this;
        var anchor = touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
            this.previousTouchUrl = anchor.href;
            window.setTimeout(function () { _this.isLibraryTouch = false; _this.previousTouchUrl = ""; }, 300);
        }
        else if (anchor.href == this.previousTouchUrl) {
            Utilitary.showFullPageLoading();
            this.dispatchEventLibrary(anchor.href);
            this.isLibraryTouch = false;
        }
        else {
            this.isLibraryTouch = false;
        }
    };
    //dispatch custom double touch
    Library.prototype.dispatchEventLibrary = function (url) {
        var event = new CustomEvent("dbltouchlib", { 'detail': url });
        document.dispatchEvent(event);
    };
    // init scroll to show scroll from perfectScroll.js 
    Library.prototype.initScroll = function () {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    };
    //remove .dsp extention and uri from element to get title
    Library.prototype.cleanNameElement = function (elementComplete, stringStructureRemoved) {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    };
    return Library;
})();
//HelpView.ts: HelpView class contains the graphical structure of the help menu.
var HelpView = (function () {
    function HelpView() {
    }
    HelpView.prototype.initHelpView = function () {
        var helpContainer = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";
        var videoIFrame = document.createElement("iframe");
        //videoIFrame.id = "videoIFrame";
        //videoIFrame.width = "600";
        //videoIFrame.height = "300";
        //videoIFrame.src = "https://www.youtube.com/embed/6pnfzL_kBD0?enablejsapi=1&version=3&playerapiid=ytplayer";
        //videoIFrame.frameBorder = "0";
        //videoIFrame.allowFullscreen = true;
        //videoIFrame.setAttribute("allowscriptaccess", "always");
        //this.videoIframe = videoIFrame;
        var videoContainer = document.createElement("div");
        videoContainer.id = "videoContainer";
        //videoContainer.appendChild(videoIFrame);
        this.videoContainer = videoContainer;
        helpContainer.appendChild(videoContainer);
        //<iframe width="854" height= "480" src= "https://www.youtube.com/embed/6pnfzL_kBD0" frameborder= "0" allowfullscreen> </iframe>
        return helpContainer;
    };
    return HelpView;
})();
//Help.ts : Help class, that controle behaviour of the help panel.
/// <reference path="HelpView.ts"/>
var Help = (function () {
    function Help() {
    }
    Help.prototype.stopVideo = function () {
        //this.helpView.videoIframe.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    };
    return Help;
})();
/// <reference path="../Utilitary.ts"/>
var LoadView = (function () {
    function LoadView() {
    }
    LoadView.prototype.initLoadView = function () {
        var loadContainer = document.createElement("div");
        loadContainer.id = "loadContainer";
        loadContainer.className = "menuContent";
        var loadFileContainer = document.createElement("div");
        loadFileContainer.id = "loadFileContainer";
        loadFileContainer.className = "exportSubmenu";
        var loadLocalContainer = document.createElement("div");
        loadLocalContainer.id = "loadLocalContainer";
        loadLocalContainer.className = "exportSubmenu";
        var loadCloudContainer = document.createElement("div");
        loadCloudContainer.id = "loadCloudContainer";
        loadCloudContainer.className = "exportSubmenu";
        ////////////////////////////////////////load file
        var loadFileBottomButtonContainer = document.createElement("div");
        loadFileBottomButtonContainer.className = "bottomButtonContainer";
        var loadFileDiv = document.createElement("div");
        loadFileDiv.id = "loadFileDiv";
        var loadFileInput = document.createElement("input");
        loadFileInput.type = "file";
        loadFileInput.id = "loadFileInput";
        this.loadFileInput = loadFileInput;
        loadFileDiv.appendChild(loadFileInput);
        var aLightExemple = document.createElement("a");
        aLightExemple.id = "aLightExemple";
        aLightExemple.className = "exempleAnchor";
        aLightExemple.textContent = "Small exemple";
        aLightExemple.href = "json/Small_Exemple.json";
        aLightExemple.draggable = false;
        this.aLightExemple = aLightExemple;
        var aBigExemple = document.createElement("a");
        aBigExemple.id = "aBigExemple";
        aBigExemple.className = "exempleAnchor";
        aBigExemple.textContent = "Big exemple";
        aBigExemple.href = "json/Big_Exemple.json";
        aBigExemple.draggable = false;
        this.aBigExemple = aBigExemple;
        var aLightPreExemple = document.createElement("a");
        aLightPreExemple.id = "aLightPreExemple";
        aLightPreExemple.className = "exempleAnchor";
        aLightPreExemple.textContent = "Small exemple precompile";
        aLightPreExemple.href = "json/Small_Exemple_Precompile.json";
        aLightPreExemple.draggable = false;
        this.aLightPreExemple = aLightPreExemple;
        var aBigPreExemple = document.createElement("a");
        aBigPreExemple.id = "aBigPreExemple";
        aBigPreExemple.className = "exempleAnchor";
        aBigPreExemple.textContent = "Big exemple precompile";
        aBigPreExemple.href = "json/Big_Exemple_Precompile.json";
        aBigPreExemple.draggable = false;
        this.aBigPreExemple = aBigPreExemple;
        var loadFileButton = document.createElement("button");
        loadFileButton.type = "button";
        loadFileButton.id = "loadFileButton";
        loadFileButton.className = "button";
        loadFileButton.textContent = Utilitary.messageRessource.buttonLoadFile;
        this.loadFileButton = loadFileButton;
        loadFileContainer.appendChild(loadFileDiv);
        loadFileContainer.appendChild(aLightExemple);
        loadFileContainer.appendChild(aLightPreExemple);
        loadFileContainer.appendChild(aBigExemple);
        loadFileContainer.appendChild(aBigPreExemple);
        loadFileBottomButtonContainer.appendChild(loadFileButton);
        loadFileContainer.appendChild(loadFileBottomButtonContainer);
        ////////////////////////////////////////local load
        var existingSceneSelect = document.createElement("select");
        existingSceneSelect.id = "existingLoadSceneSelect";
        existingSceneSelect.className = "sceneSelect";
        existingSceneSelect.size = 7;
        Ps.initialize(existingSceneSelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.existingSceneSelect = existingSceneSelect;
        var localButton = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localLoadButton";
        localButton.className = "button";
        localButton.textContent = Utilitary.messageRessource.buttonLoadLocal;
        this.buttonLoadLocal = localButton;
        var localBottomButtonContainer = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";
        localBottomButtonContainer.appendChild(localButton);
        loadLocalContainer.appendChild(existingSceneSelect);
        loadLocalContainer.appendChild(localBottomButtonContainer);
        //////////////////////////////////////load Cloud
        var driveContainer = document.createElement("div");
        driveContainer.id = "driveContainerLoad";
        this.driveContainer = driveContainer;
        var buttonConnectDrive = document.createElement("button");
        buttonConnectDrive.id = "buttonConnectLoadDrive";
        buttonConnectDrive.textContent = Utilitary.messageRessource.buttonConnectCloud;
        buttonConnectDrive.className = "button";
        this.buttonConnectDrive = buttonConnectDrive;
        var selectDrive = document.createElement("select");
        selectDrive.size = 6;
        selectDrive.id = "loadSceneSelectDrive";
        selectDrive.className = "sceneSelect ";
        selectDrive.style.display = "none";
        this.cloudSelectFile = selectDrive;
        var changeAccountButton = document.createElement("button");
        changeAccountButton.type = "button";
        //changeAccountButton.id = "changeAccountButton";
        changeAccountButton.className = "button changeAccountButton";
        changeAccountButton.textContent = Utilitary.messageRessource.buttonLogoutCloud;
        changeAccountButton.style.display = "none";
        this.buttonChangeAccount = changeAccountButton;
        var cloudButton = document.createElement("button");
        cloudButton.type = "button";
        cloudButton.id = "cloudLoadButton";
        cloudButton.className = "button";
        cloudButton.textContent = Utilitary.messageRessource.buttonLoadCloud;
        this.buttonLoadCloud = cloudButton;
        var cloudBottomButtonContainer = document.createElement("div");
        cloudBottomButtonContainer.className = "bottomButtonContainer";
        cloudBottomButtonContainer.appendChild(cloudButton);
        driveContainer.appendChild(buttonConnectDrive);
        driveContainer.appendChild(changeAccountButton);
        driveContainer.appendChild(selectDrive);
        driveContainer.appendChild(cloudBottomButtonContainer);
        loadCloudContainer.appendChild(driveContainer);
        loadContainer.appendChild(loadFileContainer);
        loadContainer.appendChild(loadLocalContainer);
        loadContainer.appendChild(loadCloudContainer);
        return loadContainer;
    };
    return LoadView;
})();
/// <reference path="../DriveAPI.ts"/>   
/// <reference path="LoadView.ts"/>   
var Load = (function () {
    function Load() {
    }
    //Set event listener
    Load.prototype.setEventListeners = function () {
        var _this = this;
        this.loadView.loadFileButton.addEventListener("click", function () { _this.openFile(); });
        this.loadView.buttonLoadLocal.addEventListener("click", function () { _this.localLoad(); });
        this.loadView.buttonLoadCloud.addEventListener("click", function () { _this.cloudLoad(); });
        this.loadView.buttonConnectDrive.addEventListener("click", function (e) { _this.drive.handleAuthClick(e); });
        this.loadView.aBigExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aBigPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.aLightPreExemple.addEventListener("click", function (e) { _this.getEx(e); });
        this.loadView.buttonChangeAccount.addEventListener("click", function (e) { _this.logOut(); });
    };
    //open file from browser dialogue open window
    Load.prototype.openFile = function () {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event = new CustomEvent("fileload", { 'detail': file });
            document.dispatchEvent(event);
        }
    };
    //load scene from local storage
    Load.prototype.localLoad = function () {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex];
            var name = option.value;
            this.sceneCurrent.recallScene(localStorage.getItem(name));
        }
    };
    //load exemple
    Load.prototype.getEx = function (e) {
        var _this = this;
        e.preventDefault();
        var anchorTarget = e.target;
        Utilitary.getXHR(anchorTarget.href, function (json) { _this.loadEx(json); }, null);
    };
    Load.prototype.loadEx = function (json) {
        Utilitary.showFullPageLoading();
        this.sceneCurrent.recallScene(json);
    };
    //load file scene from cloud Drive API
    //get id file from Drive API then is able to get content
    Load.prototype.cloudLoad = function () {
        var _this = this;
        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex];
            var id = option.value;
            var file = this.drive.getFile(id, function (resp) { _this.getContent(resp); });
            console.log(file);
        }
    };
    // get content from file loaded from cloud
    Load.prototype.getContent = function (resp) {
        var _this = this;
        this.drive.downloadFile(resp, function (json) { _this.sceneCurrent.recallScene(json); });
    };
    //logOut from google account
    Load.prototype.logOut = function () {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    };
    return Load;
})();
/// <reference path="../Utilitary.ts"/>
var SaveView = (function () {
    function SaveView() {
    }
    SaveView.prototype.initSaveView = function () {
        var saveContainer = document.createElement("div");
        saveContainer.id = "saveContainer";
        saveContainer.className = "menuContent";
        var downloadContainer = document.createElement("div");
        downloadContainer.id = "downloadContainer";
        downloadContainer.className = "exportSubmenu";
        var localSaveContainer = document.createElement("div");
        localSaveContainer.id = "localSaveContainer";
        localSaveContainer.className = "exportSubmenu";
        var cloudSaveContainer = document.createElement("div");
        cloudSaveContainer.id = "cloudSaveContainer";
        cloudSaveContainer.className = "exportSubmenu";
        ////////////////////////////////// download App
        var nameAppTitle = document.createElement("span");
        nameAppTitle.id = "nameAppTitle";
        nameAppTitle.textContent = Utilitary.messageRessource.saveDownload;
        nameAppTitle.className = "exportTitle";
        var dynamicName = document.createElement("span");
        dynamicName.id = "dynamicName";
        dynamicName.textContent = Utilitary.messageRessource.defaultSceneName;
        nameAppTitle.appendChild(dynamicName);
        this.dynamicName = dynamicName;
        var rulesName = document.createElement("span");
        rulesName.id = "rulesName";
        rulesName.style.display = "none";
        rulesName.textContent = Utilitary.messageRessource.rulesSceneName;
        this.rulesName = rulesName;
        var checkBoxPrecompile = document.createElement("input");
        checkBoxPrecompile.type = "checkbox";
        checkBoxPrecompile.id = "checkBoxPrecompile";
        this.checkBoxPrecompile = checkBoxPrecompile;
        var label = document.createElement("label");
        label.id = "labelDownload";
        label.textContent = Utilitary.messageRessource.precompileOption;
        label.appendChild(checkBoxPrecompile);
        var inputDownload = document.createElement("input");
        inputDownload.id = "inputNameApp";
        inputDownload.style.display = "none";
        inputDownload.className = "inputExport";
        inputDownload.value = Utilitary.currentScene.sceneName;
        var downloadBottomButtonContainer = document.createElement("div");
        downloadBottomButtonContainer.className = "bottomButtonContainer";
        var downloadButton = document.createElement("button");
        downloadButton.type = "button";
        downloadButton.id = "downloadButton";
        downloadButton.className = "button";
        downloadButton.textContent = Utilitary.messageRessource.buttonDownloadApp;
        downloadBottomButtonContainer.appendChild(downloadButton);
        downloadContainer.appendChild(nameAppTitle);
        downloadContainer.appendChild(rulesName);
        downloadContainer.appendChild(label);
        downloadContainer.appendChild(inputDownload);
        downloadContainer.appendChild(downloadBottomButtonContainer);
        this.inputDownload = inputDownload;
        this.buttonDownloadApp = downloadButton;
        ////////////////////////////////////////local save
        var existingSceneSelect = document.createElement("select");
        existingSceneSelect.id = "existingSceneSelect";
        existingSceneSelect.className = "sceneSelect";
        existingSceneSelect.size = 7;
        Ps.initialize(existingSceneSelect, { suppressScrollX: true, theme: 'my-theme-name' });
        this.existingSceneSelect = existingSceneSelect;
        var inputLocalStorage = document.createElement("input");
        inputLocalStorage.id = "inputNameApp";
        inputLocalStorage.className = "inputExport";
        inputLocalStorage.style.display = "none";
        inputLocalStorage.value = Utilitary.currentScene.sceneName;
        this.inputLocalStorage = inputLocalStorage;
        var dialogGoodNews = document.createElement("div");
        dialogGoodNews.id = "dialogGoodNews";
        dialogGoodNews.textContent = Utilitary.messageRessource.sucessSave;
        dialogGoodNews.style.opacity = "0";
        this.dialogGoodNews = dialogGoodNews;
        var localButtonSuppr = document.createElement("button");
        localButtonSuppr.type = "button";
        localButtonSuppr.id = "localButtonSuppr";
        localButtonSuppr.className = "button";
        localButtonSuppr.textContent = Utilitary.messageRessource.buttonSuppress;
        this.buttonLocalSuppr = localButtonSuppr;
        var localButton = document.createElement("button");
        localButton.type = "button";
        localButton.id = "localButton";
        localButton.className = "button";
        localButton.textContent = Utilitary.messageRessource.buttonLocalSave;
        this.buttonLocalSave = localButton;
        var localBottomButtonContainer = document.createElement("div");
        localBottomButtonContainer.className = "bottomButtonContainer";
        localBottomButtonContainer.appendChild(localButton);
        localSaveContainer.appendChild(existingSceneSelect);
        localSaveContainer.appendChild(localButtonSuppr);
        localSaveContainer.appendChild(inputLocalStorage);
        localSaveContainer.appendChild(dialogGoodNews);
        localSaveContainer.appendChild(localBottomButtonContainer);
        ////////////////////////////////////////////cloud save
        var driveContainer = document.createElement("div");
        driveContainer.id = "driveContainerSave";
        this.driveContainer = driveContainer;
        var buttonConnectDrive = document.createElement("button");
        buttonConnectDrive.id = "buttonConnectSaveDrive";
        buttonConnectDrive.textContent = Utilitary.messageRessource.buttonConnectCloud;
        buttonConnectDrive.className = "button";
        this.buttonConnectDrive = buttonConnectDrive;
        var selectDrive = document.createElement("select");
        selectDrive.size = 6;
        selectDrive.id = "saveSceneSelectDrive";
        selectDrive.className = "sceneSelect ";
        selectDrive.style.display = "none";
        this.cloudSelectFile = selectDrive;
        var inputCloudStorage = document.createElement("input");
        inputCloudStorage.id = "inputNameApp";
        inputCloudStorage.className = "inputExport";
        inputCloudStorage.value = Utilitary.currentScene.sceneName;
        inputCloudStorage.style.display = "none";
        this.inputCloudStorage = inputCloudStorage;
        var cloudButtonSuppr = document.createElement("button");
        cloudButtonSuppr.type = "button";
        cloudButtonSuppr.id = "cloudButtonSuppr";
        cloudButtonSuppr.className = "button";
        cloudButtonSuppr.style.display = "none";
        cloudButtonSuppr.textContent = Utilitary.messageRessource.buttonSuppress;
        this.buttonCloudSuppr = cloudButtonSuppr;
        var cloudButton = document.createElement("button");
        cloudButton.type = "button";
        cloudButton.id = "cloudSaveButton";
        cloudButton.className = "button";
        cloudButton.textContent = Utilitary.messageRessource.buttonCloudSave;
        this.buttonSaveCloud = cloudButton;
        var changeAccountButton = document.createElement("button");
        changeAccountButton.type = "button";
        //changeAccountButton.id = "changeAccountButton";
        changeAccountButton.className = "button changeAccountButton";
        changeAccountButton.textContent = Utilitary.messageRessource.buttonLogoutCloud;
        changeAccountButton.style.display = "none";
        this.buttonChangeAccount = changeAccountButton;
        var cloudBottomButtonContainer = document.createElement("div");
        cloudBottomButtonContainer.className = "bottomButtonContainer";
        cloudBottomButtonContainer.appendChild(cloudButton);
        driveContainer.appendChild(buttonConnectDrive);
        driveContainer.appendChild(changeAccountButton);
        driveContainer.appendChild(selectDrive);
        driveContainer.appendChild(cloudButtonSuppr);
        driveContainer.appendChild(inputCloudStorage);
        driveContainer.appendChild(cloudBottomButtonContainer);
        cloudSaveContainer.appendChild(driveContainer);
        saveContainer.appendChild(downloadContainer);
        saveContainer.appendChild(localSaveContainer);
        saveContainer.appendChild(cloudSaveContainer);
        return saveContainer;
    };
    return SaveView;
})();
/// <reference path="../Lib/fileSaver.min.d.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../DriveAPI.ts"/>
/// <reference path="SaveView.ts"/>
var Save = (function () {
    function Save() {
    }
    Save.prototype.setEventListeners = function () {
        var _this = this;
        this.saveView.buttonDownloadApp.addEventListener("click", function () { _this.downloadApp(); });
        this.saveView.buttonLocalSave.addEventListener("click", function () { _this.saveLocal(); });
        this.saveView.buttonLocalSuppr.addEventListener("click", function () { _this.supprLocal(); });
        this.saveView.existingSceneSelect.addEventListener("change", function () { _this.getNameSelected(); });
        this.saveView.cloudSelectFile.addEventListener("change", function () { _this.getNameSelectedCloud(); });
        this.saveView.buttonConnectDrive.addEventListener("click", function (e) { _this.drive.handleAuthClick(e); });
        this.saveView.buttonChangeAccount.addEventListener("click", function () { _this.logOut(); });
        this.saveView.buttonSaveCloud.addEventListener("click", function () { _this.saveCloud(); });
        this.saveView.buttonCloudSuppr.addEventListener("click", function () { _this.supprCloud(); });
        document.addEventListener("successave", function () { new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500); });
    };
    //create a file jfaust and save it to the device
    Save.prototype.downloadApp = function () {
        if (this.saveView.inputDownload.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked);
            var blob = new Blob([jsonScene], {
                type: "application/json;charset=utf-8;"
            });
            saveAs(blob, Utilitary.currentScene.sceneName + ".jfaust");
        }
    };
    //save scene in local storage
    Save.prototype.saveLocal = function () {
        var _this = this;
        if (this.saveView.inputLocalStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true);
                if (this.isFileExisting(name)) {
                    new Confirm(Utilitary.messageRessource.confirmReplace, function (callback) { _this.replaceSaveLocal(name, jsonScene, callback); });
                    return;
                }
                else {
                    localStorage.setItem(name, jsonScene);
                }
                new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
                var event = new CustomEvent("updatelist");
                document.dispatchEvent(event);
            }
            else {
                new Message(Utilitary.messageRessource.errorLocalStorage);
            }
        }
    };
    //replace an existing scene in local Storage
    Save.prototype.replaceSaveLocal = function (name, jsonScene, confirmCallBack) {
        localStorage.setItem(name, jsonScene);
        new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        confirmCallBack();
    };
    //check if a scene name already exist in local storage
    Save.prototype.isFileExisting = function (name) {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    };
    //check if a scene name already exist in Cloud
    Save.prototype.isFileCloudExisting = function (name) {
        for (var i = 0; i < this.saveView.cloudSelectFile.options.length; i++) {
            if (this.saveView.cloudSelectFile.options[i].textContent == name) {
                return true;
            }
        }
        return false;
    };
    // get scene name selected in select local storage and set it to the input text localStorage
    Save.prototype.getNameSelected = function () {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        this.saveView.inputLocalStorage.value = option.value;
    };
    // get scene name selected in select cloud and set it to the input text clou
    Save.prototype.getNameSelectedCloud = function () {
        this.saveView.inputCloudStorage.value = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].textContent;
    };
    //get value of select option by its text content, used here to get id of drive file
    Save.prototype.getValueByTextContent = function (select, name) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent == name) {
                var option = select.options[i];
                return option.value;
            }
        }
        return null;
    };
    //suppr scene from local storage confirm
    Save.prototype.supprLocal = function () {
        var _this = this;
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, function (callbackConfirm) { _this.supprLocalCallback(callbackConfirm); });
        }
    };
    //suppr scene from local storage callback
    Save.prototype.supprLocalCallback = function (callbackConfirm) {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        var name = option.value;
        localStorage.removeItem(name);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        callbackConfirm();
    };
    //logOut from google account
    Save.prototype.logOut = function () {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    };
    // save scene in the cloud, create a jfaust file
    Save.prototype.saveCloud = function () {
        var _this = this;
        if (this.saveView.inputCloudStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var name = this.saveView.inputCloudStorage.value;
            if (this.isFileCloudExisting(name)) {
                new Confirm(Utilitary.messageRessource.confirmReplace, function (confirmCallback) { _this.replaceCloud(name, confirmCallback); });
                return;
            }
            else {
                var jsonScene = this.sceneCurrent.saveScene(true);
                var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
                this.drive.tempBlob = blob;
                this.drive.createFile(Utilitary.currentScene.sceneName, null);
            }
        }
    };
    //update/replace a scene on the cloud
    Save.prototype.replaceCloud = function (name, confirmCallback) {
        var _this = this;
        var jsonScene = this.sceneCurrent.saveScene(true);
        var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
        this.drive.tempBlob = blob;
        var id = this.getValueByTextContent(this.saveView.cloudSelectFile, name);
        if (id != null) {
            this.drive.getFile(id, function () {
                _this.drive.updateFile(id, _this.drive.lastSavedFileMetadata, blob, null);
            });
        }
        confirmCallback();
    };
    //trash a file in the cloud confirm
    //could be retreive from the cloud's trash can 
    Save.prototype.supprCloud = function () {
        var _this = this;
        if (this.saveView.cloudSelectFile.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, function (confirmCallBack) { _this.supprCloudCallback(confirmCallBack); });
        }
    };
    //trash a file in the cloud callback
    Save.prototype.supprCloudCallback = function (confirmCallBack) {
        var option = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex];
        var id = option.value;
        this.drive.trashFile(id);
        confirmCallBack();
    };
    return Save;
})();
/// <reference path="../Utilitary.ts"/>
var AccelerometerEditView = (function () {
    function AccelerometerEditView() {
    }
    AccelerometerEditView.prototype.initAccelerometerEdit = function () {
        var blockLayer = document.createElement("div");
        blockLayer.id = "accBlockLayer";
        this.blockLayer = blockLayer;
        var container = document.createElement("div");
        container.id = "accEditContainer";
        this.container = container;
        var labelTitle = document.createElement("label");
        labelTitle.id = "labelTitle";
        this.labelTitle = labelTitle;
        //radio curves
        var radioCurveContainer = document.createElement("form");
        radioCurveContainer.id = "radioCurveContainer";
        this.radioCurveContainer = radioCurveContainer;
        var label1 = document.createElement("label");
        label1.className = "curve";
        label1.id = "curve1";
        label1.textContent = Utilitary.messageRessource.curve1;
        var label2 = document.createElement("label");
        label2.className = "curve";
        label2.id = "curve2";
        label2.textContent = Utilitary.messageRessource.curve2;
        var label3 = document.createElement("label");
        label3.className = "curve";
        label3.id = "curve3";
        label3.textContent = Utilitary.messageRessource.curve3;
        var label4 = document.createElement("label");
        label4.className = "curve";
        label4.id = "curve4";
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
        radioCurveContainer.appendChild(label1);
        radioCurveContainer.appendChild(label2);
        radioCurveContainer.appendChild(label3);
        radioCurveContainer.appendChild(label4);
        // radio Axis
        var radioAxisContainer = document.createElement("form");
        radioAxisContainer.id = "radioAxisContainer";
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
        radioAxisContainer.appendChild(label0);
        radioAxisContainer.appendChild(labelX);
        radioAxisContainer.appendChild(labelY);
        radioAxisContainer.appendChild(labelZ);
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
        checkOnOffLabel.appendChild(checkOnOff);
        checkOnOffLabel;
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
        var rangeContainer = document.createElement("div");
        rangeContainer.id = "rangeContainer";
        this.rangeContainer = rangeContainer;
        rangeContainer.appendChild(accRangeMin);
        rangeContainer.appendChild(accRangeMid);
        rangeContainer.appendChild(accRangeMax);
        rangeContainer.appendChild(accRangeCurrent);
        rangeContainer.appendChild(accRangeVirtual);
        //Validation cancelation buttons
        var validContainer = document.createElement("div");
        validContainer.id = "validContainer";
        var validButton = document.createElement("button");
        validButton.id = "validButton";
        validButton.className = "accButton";
        this.validButton = validButton;
        var cancelButton = document.createElement("button");
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
    };
    return AccelerometerEditView;
})();
//AccelerometerEdit
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
"use strict";
var AccelerometerEdit = (function () {
    function AccelerometerEdit(accelerometerEditView) {
        var _this = this;
        this.isOn = false;
        this.accelerometerEditView = accelerometerEditView;
        this.eventEditHandler = function (event, faustIControler) { _this.editEvent(faustIControler, event); };
        this.accelerometerEditView.cancelButton.addEventListener("click", function () { _this.cancelAccelerometerEdit(); });
        this.accelerometerEditView.validButton.addEventListener("click", function () { _this.applyAccelerometerEdit(); });
        this.accelerometerEditView.radioAxisX.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisY.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", function (event) { _this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxis0.addEventListener("change", function (event) { _this.disablerEnablerAcc(event); });
        this.accelerometerEditView.radioCurve1.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve2.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve3.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve4.addEventListener("change", function (event) { _this.radioCurveSplit(event); });
        this.accelerometerEditView.checkeOnOff.addEventListener("change", function (event) { _this.accelerometerEventSwitch(event); });
        this.accelerometerEditView.rangeVirtual.addEventListener("input", function (event) { _this.virtualAccelerometer(event); });
        this.accelerometerEditView.rangeMin.addEventListener("input", function (event) { _this.accMin(); });
        this.accelerometerEditView.rangeMid.addEventListener("input", function (event) { _this.accMid(); });
        this.accelerometerEditView.rangeMax.addEventListener("input", function (event) { _this.accMax(); });
    }
    //function used when starting or stoping editing mode
    //setting sider with event to edit it 
    AccelerometerEdit.prototype.editAction = function () {
        if (this.isOn) {
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var currentIFControler = AccelerometerHandler.faustInterfaceControler[i];
                if (currentIFControler.faustInterfaceView.group) {
                    currentIFControler.faustInterfaceView.group.removeEventListener("click", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.removeEventListener("touchstart", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.classList.remove('editControl');
                    currentIFControler.faustInterfaceView.slider.classList.remove('edit');
                }
                this.setSliderDisableValue(currentIFControler);
            }
            this.isOn = false;
            Utilitary.isAccelerometerEditOn = false;
        }
        else {
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var currentIFControler = AccelerometerHandler.faustInterfaceControler[i];
                if (currentIFControler.faustInterfaceView.group) {
                    currentIFControler.callbackEdit = this.editEvent.bind(this, currentIFControler);
                    currentIFControler.faustInterfaceView.group.addEventListener("click", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.addEventListener("touchstart", currentIFControler.callbackEdit, true);
                    currentIFControler.faustInterfaceView.group.classList.add('editControl');
                    currentIFControler.faustInterfaceView.slider.classList.add('edit');
                    currentIFControler.faustInterfaceView.slider.disabled = true;
                }
            }
            this.isOn = true;
            Utilitary.isAccelerometerEditOn = true;
        }
    };
    //set the slider to disable or enable according to acc isActive and isDisable
    AccelerometerEdit.prototype.setSliderDisableValue = function (faustIControler) {
        var acc = faustIControler.accelerometerSlider;
        var slider = faustIControler.faustInterfaceView.slider;
        if (slider) {
            if (acc.isActive && acc.isEnabled) {
                slider.disabled = true;
            }
            else if (!acc.isActive && acc.isEnabled) {
                slider.disabled = false;
            }
            else {
                slider.disabled = false;
            }
        }
    };
    //event handler when click/touch slider in edit mode
    AccelerometerEdit.prototype.editEvent = function (faustIControler, event) {
        event.stopPropagation();
        event.preventDefault();
        var acc = faustIControler.accelerometerSlider;
        // storing FaustInterfaceControler objects and its values
        this.faustIControler = faustIControler;
        this.accSlid = faustIControler.accelerometerSlider;
        this.faustView = faustIControler.faustInterfaceView;
        this.storeAccelerometerSliderInfos(faustIControler);
        //placing element and attaching an event when resizing window to replace element
        this.windowResizeEvent = this.placeElement.bind(this);
        window.addEventListener("resize", this.windowResizeEvent);
        this.placeElement();
        //setting the accelerometer controlers
        this.selectDefaultAxis(acc);
        this.selectDefaultCurve(acc);
        this.accelerometerEditView.checkeOnOff.checked = acc.isActive;
        this.applyRangeMinValues(acc);
        this.applyRangeMidValues(acc);
        this.applyRangeMaxValues(acc);
        this.applyRangeVirtualValues(acc);
        this.copyParamsAccSlider(acc);
        this.applyRangeCurrentValues(acc);
        //cloning the slider edited to preview it
        this.addCloneSlider(faustIControler);
        // enable or disable acc
        this.applyAccEnableDisable(acc);
    };
    //cloning the slider edited to preview it
    AccelerometerEdit.prototype.addCloneSlider = function (faustIControler) {
        var faustView = faustIControler.faustInterfaceView;
        //storing original slider and output element
        this.originalSlider = faustView.slider;
        this.originalValueOutput = faustView.output;
        //cloning and creating elements 
        this.currentParentElemSliderClone = faustView.group.cloneNode(true);
        var title = document.createElement("h6");
        title.textContent = faustIControler.name;
        this.accelerometerEditView.container.insertBefore(title, this.accelerometerEditView.radioCurveContainer);
        this.accelerometerEditView.cloneContainer.appendChild(this.currentParentElemSliderClone);
        faustView.slider = this.currentParentElemSliderClone.getElementsByTagName("input")[0];
        faustView.output = this.currentParentElemSliderClone.getElementsByClassName("value")[0];
        this.accelerometerSwitch(faustIControler.accelerometerSlider.isActive);
    };
    //remove clone/preview slider
    AccelerometerEdit.prototype.removeCloneSlider = function (faustIControler) {
        var faustView = faustIControler.faustInterfaceView;
        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0]);
        faustView.slider = this.originalSlider;
        faustView.output = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove();
    };
    //cancel editing mode, and not applying changes
    AccelerometerEdit.prototype.cancelAccelerometerEdit = function () {
        //reset original values
        this.accSlid.setAttributes(this.originalAccValue);
        this.accSlid.init = this.originalDefaultVal;
        this.accSlid.callbackValueChange(this.accSlid.address, this.accSlid.init);
        this.faustIControler.faustInterfaceView.slider.value = this.originalDefaultSliderVal;
        this.accelerometerEditView.rangeContainer.className = "";
        this.accelerometerSwitch(this.originalActive);
        this.faustIControler.faustInterfaceView.output.textContent = this.accSlid.init.toString();
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.removeCloneSlider(this.faustIControler);
        this.accSlid.isEnabled = this.originalEnabled;
        this.applyDisableEnableAcc();
        //hide editing interface
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", this.windowResizeEvent);
    };
    AccelerometerEdit.prototype.applyAccelerometerEdit = function () {
        this.removeCloneSlider(this.faustIControler);
        //applying new axis style to slider
        this.faustView.group.classList.remove(this.originalAxis);
        this.faustView.group.classList.add(Axis[this.accSlid.axis]);
        //hide editing interface
        this.accelerometerEditView.blockLayer.style.display = "none";
        window.removeEventListener("resize", this.windowResizeEvent);
        //concatanate new acc string value
        this.accSlid.acc = this.accSlid.axis + " " + this.accSlid.curve + " " + this.accSlid.amin + " " + this.accSlid.amid + " " + this.accSlid.amax;
        this.accelerometerEditView.rangeContainer.className = "";
        //applying new allowed style to slider
        this.faustView.slider.classList.remove(this.originalSliderAllowedStyle);
        this.faustView.slider.classList.add(this.sliderAllowedStyle);
        //apply new click and touch event to controler
        this.faustView.group.removeEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.group.removeEventListener("touchstart", this.faustIControler.callbackEdit, true);
        this.faustIControler.callbackEdit = this.editEvent.bind(this, this.faustIControler);
        this.faustView.group.addEventListener("click", this.faustIControler.callbackEdit, true);
        this.faustView.group.addEventListener("touchstart", this.faustIControler.callbackEdit, true);
        //check if something has change if yes, save values into faust code
        if (this.originalAccValue != this.accSlid.acc || this.originalEnabled != this.accSlid.isEnabled) {
            var detail = { sliderName: this.accSlid.label, newAccValue: this.accSlid.acc, isEnabled: this.accSlid.isEnabled };
            this.faustIControler.updateFaustCodeCallback(detail);
        }
        this.applyDisableEnableAcc();
    };
    //disable or enable slider according to isActive and isEnable
    AccelerometerEdit.prototype.applyDisableEnableAcc = function () {
        if (this.accSlid.isEnabled) {
            this.faustView.group.classList.remove("disabledAcc");
            if (this.accSlid.isActive) {
                this.faustView.slider.classList.add("not-allowed");
                this.faustView.slider.classList.remove("allowed");
                this.faustView.slider.disabled = true;
            }
            else {
                this.faustView.slider.classList.remove("not-allowed");
                this.faustView.slider.classList.add("allowed");
                this.faustView.slider.disabled = false;
            }
        }
        else {
            this.faustView.group.classList.add("disabledAcc");
            this.faustView.slider.classList.remove("not-allowed");
            this.faustView.slider.classList.add("allowed");
            this.faustView.slider.disabled = false;
        }
    };
    //Place graphical element of the editing view
    AccelerometerEdit.prototype.placeElement = function () {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.8 + "px";
        this.accelerometerEditView.cloneContainer.style.top = window.innerHeight / 7 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 8 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 12 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 25 + "px";
    };
    //store original values of the controller being edited
    AccelerometerEdit.prototype.storeAccelerometerSliderInfos = function (faustIControler) {
        var acc = faustIControler.accelerometerSlider;
        this.originalAxis = Axis[acc.axis];
        this.originalAccValue = acc.acc;
        this.originalActive = acc.isActive;
        this.originalEnabled = acc.isEnabled;
        this.originalDefaultVal = acc.init;
        this.originalDefaultSliderVal = faustIControler.faustInterfaceView.slider.value;
        if (acc.isActive) {
            this.originalSliderAllowedStyle = "not-allowed";
        }
        else {
            this.originalSliderAllowedStyle = "allowed";
        }
    };
    //check or uncheck the checkbox for enabling/disabling the acc on the app
    AccelerometerEdit.prototype.applyAccEnableDisable = function (accSlider) {
        if (accSlider.isEnabled) {
            this.accelerometerEditView.radioAxis0.checked = false;
        }
        else {
            this.accelerometerEditView.radioAxis0.checked = true;
        }
    };
    //check or uncheck the checkbox for enabling/disabling the acc on the app and faust code
    //applying styling accordingly
    AccelerometerEdit.prototype.disablerEnablerAcc = function (e) {
        if (this.accSlid.isEnabled) {
            this.accSlid.isEnabled = false;
            this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add("disabledAcc");
            this.faustView.group.classList.add("disabledAcc");
            this.accelerometerEditView.rangeContainer.classList.add("disabledAcc");
        }
        else {
            this.accSlid.isEnabled = true;
            this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove("disabledAcc");
            this.faustView.group.classList.remove("disabledAcc");
            this.accelerometerEditView.rangeContainer.classList.remove("disabledAcc");
        }
    };
    //set curve to the good radio button curve
    AccelerometerEdit.prototype.selectDefaultCurve = function (accSlider) {
        switch (accSlider.curve) {
            case Curve.Up:
                this.accelerometerEditView.radioCurve1.checked = true;
                break;
            case Curve.Down:
                this.accelerometerEditView.radioCurve2.checked = true;
                break;
            case Curve.UpDown:
                this.accelerometerEditView.radioCurve3.checked = true;
                break;
            case Curve.DownUp:
                this.accelerometerEditView.radioCurve4.checked = true;
                break;
            default:
                this.accelerometerEditView.radioCurve1.checked = true;
                break;
        }
    };
    //set axis to the good radio button axis
    AccelerometerEdit.prototype.selectDefaultAxis = function (accSlider) {
        switch (accSlider.axis) {
            case Axis.x:
                this.accelerometerEditView.radioAxisX.checked = true;
                break;
            case Axis.y:
                this.accelerometerEditView.radioAxisY.checked = true;
                break;
            case Axis.z:
                this.accelerometerEditView.radioAxisZ.checked = true;
                break;
        }
    };
    //set values to the minimum acc range
    AccelerometerEdit.prototype.applyRangeMinValues = function (accSlider) {
        this.accelerometerEditView.rangeMin.min = "-20";
        this.accelerometerEditView.rangeMin.max = "20";
        this.accelerometerEditView.rangeMin.step = "0.1";
        this.accelerometerEditView.rangeMin.value = String(accSlider.amin);
    };
    //set values to the middle acc range
    AccelerometerEdit.prototype.applyRangeMidValues = function (accSlider) {
        this.accelerometerEditView.rangeMid.min = "-20";
        this.accelerometerEditView.rangeMid.max = "20";
        this.accelerometerEditView.rangeMid.step = "0.1";
        this.accelerometerEditView.rangeMid.value = String(accSlider.amid);
    };
    //set values to the maximum acc range
    AccelerometerEdit.prototype.applyRangeMaxValues = function (accSlider) {
        this.accelerometerEditView.rangeMax.min = "-20";
        this.accelerometerEditView.rangeMax.max = "20";
        this.accelerometerEditView.rangeMax.step = "0.1";
        this.accelerometerEditView.rangeMax.value = String(accSlider.amax);
    };
    //set values to the virtual range
    AccelerometerEdit.prototype.applyRangeVirtualValues = function (accSlider) {
        this.accelerometerEditView.rangeVirtual.min = "-20";
        this.accelerometerEditView.rangeVirtual.max = "20";
        this.accelerometerEditView.rangeVirtual.value = "0";
        this.accelerometerEditView.rangeVirtual.step = "0.1";
    };
    //set values to the accelerometer range
    //create a faustInterfaceControler and register it to the AccelerometerHandler
    AccelerometerEdit.prototype.applyRangeCurrentValues = function (accSlider) {
        this.accelerometerEditView.rangeCurrent.min = "-20";
        this.accelerometerEditView.rangeCurrent.max = "20";
        this.accelerometerEditView.rangeCurrent.value = "0";
        this.accelerometerEditView.rangeCurrent.step = "0.1";
        this.accParams.isEnabled = accSlider.isEnabled;
        var faustInterfaceControlerEdit = new FaustInterfaceControler(null, null);
        faustInterfaceControlerEdit.faustInterfaceView = new FaustInterfaceView("edit");
        AccelerometerHandler.registerAcceleratedSlider(this.accParams, faustInterfaceControlerEdit, true);
        var acc = faustInterfaceControlerEdit.accelerometerSlider;
        faustInterfaceControlerEdit.faustInterfaceView.slider = this.accelerometerEditView.rangeCurrent;
        faustInterfaceControlerEdit.faustInterfaceView.slider.parentElement.classList.add(Axis[acc.axis]);
        acc.isActive = true;
    };
    //copy params of the accSlider 
    AccelerometerEdit.prototype.copyParamsAccSlider = function (accSlider) {
        this.accParams = {
            isEnabled: accSlider.isEnabled,
            acc: accSlider.acc,
            address: accSlider.address,
            min: accSlider.min,
            max: accSlider.max,
            init: accSlider.init,
            label: accSlider.label
        };
    };
    // split edited acc axis according the radio axis selection
    AccelerometerEdit.prototype.radioAxisSplit = function (event) {
        console.log("change");
        var radio = event.target;
        if (radio.id == "radioX") {
            this.editAxis(Axis.x);
        }
        else if (radio.id == "radioY") {
            this.editAxis(Axis.y);
        }
        else if (radio.id == "radioZ") {
            this.editAxis(Axis.z);
        }
    };
    // split edited acc curve according the radio curve selection
    AccelerometerEdit.prototype.radioCurveSplit = function (event) {
        console.log("change");
        var radio = event.target;
        if (radio.id == "radio1") {
            this.editCurve(Curve.Up);
        }
        else if (radio.id == "radio2") {
            this.editCurve(Curve.Down);
        }
        else if (radio.id == "radio3") {
            this.editCurve(Curve.UpDown);
        }
        else if (radio.id == "radio4") {
            this.editCurve(Curve.DownUp);
        }
    };
    //apply new axis value the the AccelerometerSlider
    AccelerometerEdit.prototype.editAxis = function (axe) {
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove(Axis[this.accSlid.axis]);
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add(Axis[axe]);
        var oldAxis = this.accSlid.axis;
        this.accSlid.axis = axe;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        var faustView = AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView;
        editAcc.axis = axe;
        faustView.slider.parentElement.classList.remove(Axis[oldAxis]);
        faustView.slider.parentElement.classList.add(Axis[editAcc.axis]);
    };
    //apply new curve value the the AccelerometerSlider
    AccelerometerEdit.prototype.editCurve = function (curve) {
        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        editAcc.curve = curve;
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.applyValuetoFaust();
    };
    //event handler to switch isActive
    AccelerometerEdit.prototype.accelerometerEventSwitch = function (event) {
        this.accelerometerSwitch(this.accelerometerEditView.checkeOnOff.checked);
    };
    //change isActive of AccelerometerSlider
    AccelerometerEdit.prototype.accelerometerSwitch = function (isSliderActive) {
        if (isSliderActive) {
            this.accSlid.isActive = isSliderActive;
            if (this.accSlid.isEnabled) {
                this.sliderAllowedStyle = "not-allowed";
            }
            else {
                this.sliderAllowedStyle = "allowed";
            }
        }
        else {
            this.sliderAllowedStyle = "allowed";
            this.accSlid.isActive = isSliderActive;
        }
    };
    //apply value of virtual Accelerometer when it's use//
    //disable acc if enabled
    AccelerometerEdit.prototype.virtualAccelerometer = function (event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false;
            this.accelerometerSwitch(false);
            this.accSlid.isActive = false;
        }
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        this.applyValuetoFaust();
    };
    //apply change to AccelerometerSlider from min slider
    AccelerometerEdit.prototype.accMin = function () {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    };
    //apply change to AccelerometerSlider from mid slider
    AccelerometerEdit.prototype.accMid = function () {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    };
    //apply change to AccelerometerSlider from max slider
    AccelerometerEdit.prototype.accMax = function () {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    };
    //apply values changes to the AccelerometerSlider
    AccelerometerEdit.prototype.applyValuetoFaust = function () {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        Utilitary.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, Utilitary.accHandler.applyNewValueToModule);
    };
    return AccelerometerEdit;
})();
//Menu.ts  Menu class which handles the menu behaviours and contains the MenuView
/// <reference path="Library.ts"/>
/// <reference path="LibraryView.ts"/>
/// <reference path="Export.ts"/>
/// <reference path="ExportView.ts"/>
/// <reference path="Help.ts"/>
/// <reference path="HelpView.ts"/>
/// <reference path="Load.ts"/>
/// <reference path="Save.ts"/>
/// <reference path="AccelerometerEdit.ts"/>
/// <reference path="../DriveAPI.ts"/> 
/// <reference path="../Messages.ts"/>
var MenuChoices;
(function (MenuChoices) {
    MenuChoices[MenuChoices["library"] = 0] = "library";
    MenuChoices[MenuChoices["export"] = 1] = "export";
    MenuChoices[MenuChoices["help"] = 2] = "help";
    MenuChoices[MenuChoices["kids"] = 3] = "kids";
    MenuChoices[MenuChoices["edit"] = 4] = "edit";
    MenuChoices[MenuChoices["save"] = 5] = "save";
    MenuChoices[MenuChoices["load"] = 6] = "load";
    MenuChoices[MenuChoices["null"] = 7] = "null";
})(MenuChoices || (MenuChoices = {}));
var Menu = (function () {
    function Menu(htmlContainer) {
        var _this = this;
        this.isMenuDriveLoading = false;
        this.currentMenuChoices = MenuChoices.null;
        this.isFullScreen = false;
        this.isAccelerometer = Utilitary.isAccelerometerOn;
        //create and init menu view wich gone create and init all sub menus views
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        //add Event Listeners
        this.menuView.libraryButtonMenu.onclick = function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.library); };
        this.menuView.exportButtonMenu.onclick = function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.export); };
        this.menuView.helpButtonMenu.onclick = function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.help); };
        this.menuView.editButtonMenu.addEventListener("click", function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.edit); });
        this.menuView.closeButton.onclick = function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.null); };
        this.menuView.saveButton.addEventListener("click", function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.save); });
        this.menuView.loadButton.addEventListener("click", function () { _this.menuHandler(_this.newMenuChoices = MenuChoices.load); });
        this.menuView.fullScreenButton.addEventListener("click", function () { _this.fullScreen(); });
        this.menuView.accButton.addEventListener("click", function () { _this.accelerometer(); });
        this.menuView.cleanButton.addEventListener("click", function () { new Confirm(Utilitary.messageRessource.confirmEmptyScene, function (callback) { _this.cleanScene(callback); }); });
        //add eventListern customs
        document.addEventListener("updatename", function (e) { _this.updatePatchNameToInput(e); });
        document.addEventListener("codeeditevent", function () { _this.customeCodeEditEvent(); });
        document.addEventListener("updatelist", function () { _this.updateSelectLocalEvent(); });
        document.addEventListener("authon", function () { _this.authOn(); });
        document.addEventListener("authoff", function () { _this.authOff(); });
        document.addEventListener("fillselect", function (optionEvent) { _this.fillSelectCloud(optionEvent); });
        document.addEventListener("updatecloudselect", function () { _this.updateSelectCloudEvent(); });
        document.addEventListener("startloaddrive", function () { _this.startLoadingDrive(); });
        document.addEventListener("finishloaddrive", function () { _this.finishLoadingDrive(); });
        document.addEventListener("clouderror", function (e) { _this.connectionProblem(e); });
        //create and init all menus objects
        this.library = new Library();
        this.library.libraryView = this.menuView.libraryView;
        this.library.fillLibrary();
        this.load = new Load();
        this.load.loadView = this.menuView.loadView;
        this.drive = new DriveAPI();
        this.load.drive = this.drive;
        this.load.setEventListeners();
        this.fillSelectLocal(this.load.loadView.existingSceneSelect);
        this.save = new Save();
        this.save.saveView = this.menuView.saveView;
        this.save.setEventListeners();
        this.fillSelectLocal(this.save.saveView.existingSceneSelect);
        this.expor = new Export();
        this.expor.exportView = this.menuView.exportView;
        this.expor.uploadTargets();
        this.expor.setEventListeners();
        this.help = new Help();
        this.help.helpView = this.menuView.helpView;
        this.accEdit = new AccelerometerEdit(this.menuView.accEditView);
    }
    // dispatch the action of the menu buttons to the right submenu handler
    Menu.prototype.menuHandler = function (newMenuChoices) {
        this.help.stopVideo();
        switch (newMenuChoices) {
            case MenuChoices.library:
                this.libraryMenu();
                break;
            case MenuChoices.export:
                this.exportMenu();
                break;
            case MenuChoices.help:
                this.helpMenu();
                break;
            case MenuChoices.edit:
                this.editMenu();
                break;
            case MenuChoices.save:
                this.saveMenu();
                break;
            case MenuChoices.load:
                this.loadMenu();
                break;
            case MenuChoices.null:
                this.cleanMenu();
                this.closeMenu();
                break;
        }
    };
    //manage the library display
    Menu.prototype.libraryMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.libraryButtonMenu.style.zIndex = "1";
                this.library.initScroll();
                break;
            case MenuChoices.library:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.libraryContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.libraryButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.libraryButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.libraryButtonMenu.style.zIndex = "1";
                this.menuView.libraryContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.library;
                break;
        }
    };
    //manage the load display
    Menu.prototype.loadMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.loadContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.load;
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.loadButton.style.zIndex = "1";
                break;
            case MenuChoices.load:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.loadContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.loadButton.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.loadButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.loadButton.style.zIndex = "1";
                this.menuView.loadContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.load;
                break;
        }
    };
    //manage the export display
    Menu.prototype.exportMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.exportContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.export;
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.exportButtonMenu.style.zIndex = "1";
                break;
            case MenuChoices.export:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.exportContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.exportButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.exportButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.exportButtonMenu.style.zIndex = "1";
                this.menuView.exportContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.export;
                break;
        }
    };
    //manage the save display
    Menu.prototype.saveMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.saveContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.save;
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.saveButton.style.zIndex = "1";
                break;
            case MenuChoices.save:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.saveContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.saveButton.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.saveButton.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.saveButton.style.zIndex = "1";
                this.menuView.saveContent.style.display = "inline-table";
                this.currentMenuChoices = MenuChoices.save;
                break;
        }
    };
    //manage the help display
    Menu.prototype.helpMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.contentsMenu.style.display = "block";
                this.menuView.helpContent.style.display = "block";
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.helpButtonMenu.style.zIndex = "1";
                this.currentMenuChoices = MenuChoices.help;
                break;
            case MenuChoices.help:
                this.menuView.contentsMenu.style.display = "none";
                this.menuView.helpContent.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.helpButtonMenu.style.zIndex = "0";
                break;
            default:
                this.cleanMenu();
                this.menuView.helpButtonMenu.style.backgroundColor = this.menuView.menuColorSelected;
                this.menuView.helpButtonMenu.style.zIndex = "1";
                this.menuView.helpContent.style.display = "block";
                this.currentMenuChoices = MenuChoices.help;
                break;
        }
    };
    //manage the accelerometerEdit mode and display
    Menu.prototype.editMenu = function () {
        switch (this.currentMenuChoices) {
            case MenuChoices.null:
                this.menuView.editButtonMenu.style.backgroundColor = "#00C50D";
                this.menuView.editButtonMenu.style.boxShadow = "yellow 0px 0px 51px inset";
                this.accEdit.editAction();
                this.currentMenuChoices = MenuChoices.edit;
                break;
            case MenuChoices.edit:
                this.accEdit.editAction();
                this.menuView.editButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
                this.menuView.editButtonMenu.style.boxShadow = "none";
                this.menuView.contentsMenu.style.display = "none";
                this.currentMenuChoices = MenuChoices.null;
                break;
            default:
                this.cleanMenu();
                this.menuView.editButtonMenu.style.backgroundColor = "#00C50D";
                this.menuView.editButtonMenu.style.boxShadow = "yellow 0px 0px 51px inset";
                this.accEdit.editAction();
                this.menuView.contentsMenu.style.display = "none";
                this.currentMenuChoices = MenuChoices.edit;
                break;
        }
    };
    //Close the menu
    Menu.prototype.closeMenu = function () {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    };
    //hide all elements currently displayed in the menu
    Menu.prototype.cleanMenu = function () {
        if (this.accEdit.isOn) {
            this.accEdit.editAction();
            this.menuView.editButtonMenu.style.backgroundColor = this.menuView.menuColorDefault;
            this.menuView.editButtonMenu.style.boxShadow = "none";
            this.menuView.contentsMenu.style.display = "block";
        }
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        for (var i = 0; i < this.menuView.HTMLButtonsMenu.length; i++) {
            this.menuView.HTMLButtonsMenu[i].style.backgroundColor = this.menuView.menuColorDefault;
            this.menuView.HTMLButtonsMenu[i].style.zIndex = "0";
        }
    };
    //update all element that display the scene name 
    Menu.prototype.updatePatchNameToInput = function (e) {
        this.menuView.patchNameScene.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.inputNameApp.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputDownload.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputLocalStorage.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputCloudStorage.value = Utilitary.currentScene.sceneName;
        new Message(Utilitary.messageRessource.successRenameScene, "messageTransitionOutFast", 2000, 500);
    };
    //handle fullscreen mode
    Menu.prototype.fullScreen = function () {
        var body = document.getElementsByTagName("body")[0];
        if (this.isFullScreen) {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            this.isFullScreen = false;
        }
        else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            this.isFullScreen = true;
        }
    };
    //handle the enabing/disabling of all slider having a accelerometer
    Menu.prototype.accelerometer = function () {
        var checkboxs = document.getElementsByClassName("accCheckbox");
        if (this.isAccelerometer) {
            this.isAccelerometer = false;
            Utilitary.isAccelerometerOn = false;
            this.menuView.accButton.style.opacity = "0.3";
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var acc = AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider;
                var slider = AccelerometerHandler.faustInterfaceControler[i].faustInterfaceView.slider;
                acc.isActive = false;
                slider.classList.remove("not-allowed");
                slider.classList.add("allowed");
                if (!Utilitary.isAccelerometerEditOn) {
                    slider.disabled = false;
                }
            }
        }
        else if (!this.isAccelerometer) {
            this.menuView.accButton.style.opacity = "1";
            this.isAccelerometer = true;
            Utilitary.isAccelerometerOn = true;
            for (var i = 0; i < AccelerometerHandler.faustInterfaceControler.length; i++) {
                var acc = AccelerometerHandler.faustInterfaceControler[i].accelerometerSlider;
                var slider = AccelerometerHandler.faustInterfaceControler[i].faustInterfaceView.slider;
                if (acc.isEnabled) {
                    acc.isActive = true;
                    slider.classList.add("not-allowed");
                    slider.classList.remove("allowed");
                    if (!Utilitary.isAccelerometerEditOn) {
                        slider.disabled = true;
                    }
                }
            }
        }
    };
    //removing all modules from the scene
    Menu.prototype.cleanScene = function (callBack) {
        var modules = this.sceneCurrent.getModules();
        while (modules.length != 0) {
            if (modules[0].patchID != "output" && modules[0].patchID != "input") {
                modules[0].deleteModule();
            }
            else if (modules[0].patchID == "output") {
                modules.shift();
            }
            else if (modules[0].patchID == "input") {
                modules.shift();
            }
        }
        callBack();
    };
    //close menu when editing a module's Faust code
    //the idea here is to disable the accelerometerEdit mode if enabled
    Menu.prototype.customeCodeEditEvent = function () {
        this.menuHandler(MenuChoices.null);
    };
    //refresh the select boxes of localstorage when adding or removing a saved scene
    Menu.prototype.updateSelectLocalEvent = function () {
        this.updateSelectLocal(this.menuView.loadView.existingSceneSelect);
        this.updateSelectLocal(this.menuView.saveView.existingSceneSelect);
    };
    //empty a selectBox
    Menu.prototype.clearSelect = function (select) {
        select.innerHTML = "";
    };
    //refresh a select box
    Menu.prototype.updateSelectLocal = function (select) {
        this.clearSelect(select);
        this.fillSelectLocal(select);
    };
    //fill select box
    Menu.prototype.fillSelectLocal = function (select) {
        if (typeof sessionStorage != 'undefined') {
            for (var i = 0; i < localStorage.length; i++) {
                var option = document.createElement("option");
                option.value = localStorage.key(i);
                option.textContent = localStorage.key(i);
                select.add(option);
            }
        }
    };
    //dispatch the current scene to the menus objects
    Menu.prototype.setMenuScene = function (scene) {
        this.sceneCurrent = scene;
        this.save.sceneCurrent = scene;
        this.load.sceneCurrent = scene;
    };
    //dispatch the drive API to the menus objects
    Menu.prototype.setDriveApi = function (drive) {
        this.drive = drive;
        this.save.drive = drive;
        this.load.drive = drive;
    };
    //show element from cloud Drive when logged on
    Menu.prototype.authOn = function () {
        this.load.loadView.cloudSelectFile.style.display = "block";
        this.save.saveView.cloudSelectFile.style.display = "block";
        this.load.loadView.buttonChangeAccount.style.display = "block";
        this.save.saveView.buttonChangeAccount.style.display = "block";
        this.load.loadView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonCloudSuppr.style.display = "block";
        this.save.saveView.inputCloudStorage.style.display = "block";
    };
    //show element from cloud Drive when logged out
    Menu.prototype.authOff = function () {
        this.load.loadView.cloudSelectFile.style.display = "none";
        this.save.saveView.cloudSelectFile.style.display = "none";
        this.load.loadView.buttonChangeAccount.style.display = "none";
        this.save.saveView.buttonChangeAccount.style.display = "none";
        this.load.loadView.buttonConnectDrive.style.display = "block";
        this.save.saveView.buttonConnectDrive.style.display = "block";
        this.save.saveView.buttonCloudSuppr.style.display = "none";
        this.save.saveView.inputCloudStorage.style.display = "none";
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.clearSelect(this.load.loadView.cloudSelectFile);
        window.open("https://accounts.google.com/logout", "newwindow", "width=500,height=700");
    };
    //display Drive Connection error
    Menu.prototype.connectionProblem = function (event) {
        new Message(Utilitary.messageRessource.errorConnectionCloud + " : " + event.detail);
    };
    Menu.prototype.fillSelectCloud = function (optionEvent) {
        this.load.loadView.cloudSelectFile.add(optionEvent.detail);
        var optionSave = optionEvent.detail.cloneNode(true);
        this.save.saveView.cloudSelectFile.add(optionSave);
    };
    Menu.prototype.updateSelectCloudEvent = function () {
        this.clearSelect(this.load.loadView.cloudSelectFile);
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.drive.updateConnection();
    };
    Menu.prototype.startLoadingDrive = function () {
        if (!this.isMenuDriveLoading) {
            this.isMenuDriveLoading = true;
            this.save.saveView.driveContainer.style.display = "none";
            this.load.loadView.driveContainer.style.display = "none";
            Utilitary.addLoadingLogo("loadCloudContainer");
            Utilitary.addLoadingLogo("cloudSaveContainer");
        }
    };
    Menu.prototype.finishLoadingDrive = function () {
        if (this.isMenuDriveLoading) {
            this.isMenuDriveLoading = false;
            this.save.saveView.driveContainer.style.display = "block";
            this.load.loadView.driveContainer.style.display = "block";
            Utilitary.removeLoadingLogo("loadCloudContainer");
            Utilitary.removeLoadingLogo("cloudSaveContainer");
        }
    };
    return Menu;
})();
//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
/// <reference path="LoadView.ts"/>
/// <reference path="SaveView.ts"/>
var MenuView = (function () {
    function MenuView() {
        this.HTMLElementsMenu = [];
        this.HTMLButtonsMenu = [];
        this.menuColorDefault = "rgba(227, 64, 80, 0.73)";
        this.menuColorSelected = "rgb(209, 64, 80)";
    }
    MenuView.prototype.init = function (htmlContainer) {
        var menuContainer = document.createElement('div');
        menuContainer.id = "menuContainer";
        this.menuContainer = menuContainer;
        /////////////////////////create menu's buttons and there containers
        var buttonsMenu = document.createElement("div");
        buttonsMenu.id = "buttonsMenu";
        var libraryButtonMenu = document.createElement("div");
        libraryButtonMenu.id = "libraryButtonMenu";
        libraryButtonMenu.className = "buttonsMenu";
        libraryButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLibrary));
        this.libraryButtonMenu = libraryButtonMenu;
        var exportButtonMenu = document.createElement("div");
        exportButtonMenu.id = "exportButtonMenu";
        exportButtonMenu.className = "buttonsMenu";
        exportButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonExport));
        this.exportButtonMenu = exportButtonMenu;
        var helpButtonMenu = document.createElement("div");
        helpButtonMenu.id = "helpButtonMenu";
        helpButtonMenu.className = "buttonsMenu";
        helpButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonHelp));
        this.helpButtonMenu = helpButtonMenu;
        var editButtonMenu = document.createElement("div");
        editButtonMenu.id = "EditButtonMenu";
        editButtonMenu.className = "buttonsMenu";
        editButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonEdit));
        this.editButtonMenu = editButtonMenu;
        var loadButtonMenu = document.createElement("div");
        loadButtonMenu.id = "loadButtonMenu";
        loadButtonMenu.className = "buttonsMenu";
        loadButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonLoad));
        this.loadButton = loadButtonMenu;
        var saveButtonMenu = document.createElement("div");
        saveButtonMenu.id = "saveButtonMenu";
        saveButtonMenu.className = "buttonsMenu";
        saveButtonMenu.appendChild(document.createTextNode(Utilitary.messageRessource.buttonSave));
        this.saveButton = saveButtonMenu;
        var fullScreenButton = document.createElement("div");
        fullScreenButton.id = "fullScreenButton";
        fullScreenButton.className = "buttonsLittleMenu";
        this.fullScreenButton = fullScreenButton;
        var accButton = document.createElement("div");
        accButton.id = "accButton";
        accButton.className = "buttonsLittleMenu";
        this.accButton = accButton;
        var cleanButton = document.createElement("div");
        cleanButton.id = "cleanButton";
        cleanButton.className = "buttonsLittleMenu";
        this.cleanButton = cleanButton;
        if (!Utilitary.isAccelerometerOn) {
            accButton.style.opacity = "0.2";
        }
        buttonsMenu.appendChild(libraryButtonMenu);
        buttonsMenu.appendChild(loadButtonMenu);
        buttonsMenu.appendChild(editButtonMenu);
        buttonsMenu.appendChild(saveButtonMenu);
        buttonsMenu.appendChild(exportButtonMenu);
        buttonsMenu.appendChild(helpButtonMenu);
        buttonsMenu.appendChild(fullScreenButton);
        buttonsMenu.appendChild(accButton);
        buttonsMenu.appendChild(cleanButton);
        this.HTMLButtonsMenu.push(libraryButtonMenu, loadButtonMenu, saveButtonMenu, exportButtonMenu, helpButtonMenu);
        var myScene = document.createElement("div");
        myScene.id = "PatchName";
        myScene.className = "sceneTitle";
        myScene.textContent = Utilitary.currentScene.sceneName;
        buttonsMenu.appendChild(myScene);
        this.patchNameScene = myScene;
        //////////////////create menu's Contents and there containers
        var contentsMenu = document.createElement("div");
        contentsMenu.id = "contentsMenu";
        contentsMenu.style.display = "none";
        var closeButton = document.createElement("div");
        closeButton.id = "closeButton";
        this.closeButton = closeButton;
        var CloseButtonContainer = document.createElement("div");
        CloseButtonContainer.id = "closeButtonContainer";
        CloseButtonContainer.appendChild(closeButton);
        var libraryView = new LibraryView();
        var libraryContent = libraryView.initLibraryView();
        libraryContent.style.display = "none";
        this.libraryView = libraryView;
        var loadView = new LoadView();
        var loadContent = loadView.initLoadView();
        loadContent.style.display = "none";
        this.loadView = loadView;
        var saveView = new SaveView();
        var saveContent = saveView.initSaveView();
        saveContent.style.display = "none";
        this.saveView = saveView;
        var exportView = new ExportView();
        var exportContent = exportView.initExportView();
        exportContent.style.display = "none";
        this.exportView = exportView;
        var helpView = new HelpView();
        var helpContent = helpView.initHelpView();
        helpContent.style.display = "none";
        this.helpView = helpView;
        var accEditView = new AccelerometerEditView();
        var accEditContent = accEditView.initAccelerometerEdit();
        accEditContent.style.display = "none";
        this.accEditView = accEditView;
        contentsMenu.appendChild(CloseButtonContainer);
        contentsMenu.appendChild(libraryContent);
        contentsMenu.appendChild(loadContent);
        contentsMenu.appendChild(saveContent);
        contentsMenu.appendChild(exportContent);
        contentsMenu.appendChild(helpContent);
        menuContainer.appendChild(buttonsMenu);
        menuContainer.appendChild(contentsMenu);
        menuContainer.appendChild(accEditContent);
        htmlContainer.appendChild(menuContainer);
        this.HTMLElementsMenu.push(libraryContent, loadContent, saveContent, exportContent, helpContent);
        this.libraryContent = libraryContent;
        this.loadContent = loadContent;
        this.saveContent = saveContent;
        this.exportContent = exportContent;
        this.helpContent = helpContent;
        this.contentsMenu = contentsMenu;
    };
    return MenuView;
})();
/*     APP.JS


Class App

Create the scenes
Activate Physical input/ output
Handle Drag and Drop
Create Factories and Modules


    */
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Modules/ModuleView.ts"/>
/// <reference path="Modules/ModuleFaust.ts"/>
/// <reference path="Connect.ts"/>
/// <reference path="Error.ts"/>
/// <reference path="Dragging.ts"/>
/// <reference path="Utilitary.ts"/>
/// <reference path="Lib/webaudio-asm-worker-wrapper.d.ts"/>
/// <reference path="Modules/FaustInterface.ts"/>
/// <reference path="Scenes/SceneView.ts"/>
/// <reference path="Menu/Export.ts"/>
/// <reference path="Menu/ExportView.ts"/>
/// <reference path="Menu/Library.ts"/>
/// <reference path="Menu/LibraryView.ts"/>
/// <reference path="Menu/Menu.ts"/>
/// <reference path="Menu/MenuView.ts"/>
/// <reference path="Menu/Help.ts"/>
/// <reference path="Menu/HelpView.ts"/>
/// <reference path="ExportLib.ts"/>
/// <reference path="EquivalentFaust.ts"/>
/// <reference path="Lib/qrcode.d.ts"/>
/// <reference path="Ressources.ts"/>
/// <reference path="Messages.ts"/>
/// <reference path="Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
//object containg info necessary to compile faust code
var App = (function () {
    function App() {
    }
    App.prototype.createAllScenes = function () {
        var sceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this.compileFaust, sceneView);
        this.setGeneralAppListener(this);
        App.currentScene = 0;
    };
    App.prototype.createMenu = function () {
        var _this = this;
        this.menu = new Menu(document.getElementsByTagName('body')[0]);
        //pass the scene to the menu to allow it to access the scene
        this.menu.setMenuScene(Utilitary.currentScene);
        //add eventlistener on the scene to hide menu when clicked or touched
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.newMenuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.newMenuChoices);
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", function () {
            if (!_this.menu.accEdit.isOn) {
                _this.menu.newMenuChoices = MenuChoices.null;
                _this.menu.menuHandler(_this.menu.newMenuChoices);
            }
        }, true);
    };
    //create div to append messages and confirms
    App.prototype.createDialogue = function () {
        var dialogue = document.createElement("div");
        dialogue.id = "dialogue";
        document.getElementsByTagName("body")[0].appendChild(dialogue);
    };
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    App.prototype.compileFaust = function (compileFaust) {
        //  Temporarily Saving parameters of compilation
        this.tempModuleName = compileFaust.name;
        this.tempModuleSourceCode = compileFaust.sourceCode;
        this.tempModuleX = compileFaust.x;
        this.tempModuleY = compileFaust.y;
        var currentScene = Utilitary.currentScene;
        if (currentScene) {
            currentScene.muteScene();
        }
        ;
        //locate libraries used in libfaust compiler
        var args = ["-I", location.origin + "/faustplayground/faustcode/"];
        //try to create the asm.js code/factory with the faust code given. Then callback to function passing the factory.
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, function (factory) { compileFaust.callback(factory); });
        }
        catch (error) {
            new Message(error);
        }
        if (currentScene) {
            currentScene.unmuteScene();
        }
        ;
    };
    //create Module, set the source faust code to its moduleFaust, set the faust interface , add the input output connection nodes
    //
    App.prototype.createModule = function (factory) {
        var _this = this;
        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory + faust.getErrorMessage());
            Utilitary.hideFullPageLoading();
            return null;
        }
        var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), function (module) { Utilitary.currentScene.removeModule(module); }, this.compileFaust);
        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory);
        module.setFaustInterfaceControles();
        module.createFaustInterface();
        module.addInputOutputNodes();
        //set listener to recompile when dropping faust code on the module
        if (this.tempModuleName != "input" && this.tempModuleName != "output") {
            module.moduleView.fModuleContainer.ondrop = function (e) {
                e.stopPropagation();
                _this.styleOnDragEnd();
                _this.uploadOn(_this, module, 0, 0, e);
            };
        }
        module.moduleView.fModuleContainer.ondragover = function () {
            module.moduleView.fModuleContainer.style.opacity = "1";
            module.moduleView.fModuleContainer.style.boxShadow = "0 0 40px rgb(255, 0, 0)";
        };
        module.moduleView.fModuleContainer.ondragleave = function () {
            module.moduleView.fModuleContainer.style.opacity = "0.5";
            module.moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        };
        // the current scene add the module and hide the loading page 
        Utilitary.currentScene.addModule(module);
        if (!Utilitary.currentScene.isInitLoading) {
            Utilitary.hideFullPageLoading();
        }
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- custom event to load file from the load menu with the file explorer
    //Init drag and drop reactions, scroll event and body resize event to resize svg element size, 
    // add custom double touch event to load dsp from the library menu
    App.prototype.setGeneralAppListener = function (app) {
        var _this = this;
        //custom event to load file from the load menu with the file explorer
        document.addEventListener("fileload", function (e) { _this.loadFileEvent(e); });
        //All drog and drop events
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        document.ondragstart = function () { _this.styleOnDragStart(); };
        document.ondragenter = function (e) {
            var srcElement = e.srcElement;
            if (srcElement.className != null && srcElement.className == "node-button") {
            }
            else {
                _this.styleOnDragStart();
            }
        };
        document.ondragleave = function (e) {
            var elementTarget = e.target;
            if (elementTarget.id == "svgCanvas") {
                //alert("svg")
                _this.styleOnDragEnd();
                e.stopPropagation();
                e.preventDefault();
            }
        };
        //scroll event to check the size of the document
        document.onscroll = function () {
            _this.checkRealWindowSize();
        };
        //resize event
        var body = document.getElementsByTagName("body")[0];
        body.onresize = function () { _this.checkRealWindowSize(); };
        window.ondrop = function (e) {
            var target = e.target;
            _this.styleOnDragEnd();
            var x = e.clientX;
            var y = e.clientY;
            _this.uploadOn(_this, null, x, y, e);
        };
        //custom double touch from library menu to load an effect or an intrument.
        document.addEventListener("dbltouchlib", function (e) { _this.dblTouchUpload(e); });
    };
    //-- Upload content dropped on the page and allocate the content to the right function
    App.prototype.uploadOn = function (app, module, x, y, e) {
        Utilitary.showFullPageLoading();
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            // we are dropping a file
            for (var i = 0; i < e.dataTransfer.files.length; i = i + 1) {
                var f = e.dataTransfer.files[i];
                console.log("FILES DROP : " + i + " : " + f.name);
                this.loadFile(f, module, x + 10 * i, y + 10 * i);
            }
        }
        else if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            // CASE 1 : the dropped object is a url to some faust code
            var url = e.dataTransfer.getData('URL');
            console.log("URL DROP : " + url);
            this.uploadUrl(app, module, x, y, url);
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code = e.dataTransfer.getData('text');
            console.log("Text DROP : " + dsp_code);
            // CASE 2 : the dropped object is some faust code
            if (dsp_code) {
                console.log("DROP: CASE 2 ");
                this.uploadCodeFaust(app, module, x, y, e, dsp_code);
            }
            else {
                // CASE 3 : the dropped object is a file containing some faust code or jfaust/json
                console.log("DROP: CASE 3 ");
                try {
                    this.uploadFileFaust(app, module, x, y, e, dsp_code);
                }
                catch (error) {
                    new Message(error);
                    Utilitary.hideFullPageLoading();
                }
            }
        }
        else {
            console.log("DROP: CASE 4 STRANGE ");
            new Message(Utilitary.messageRessource.errorObjectNotFaustCompatible);
            Utilitary.hideFullPageLoading();
        }
    };
    //used for Url pointing at a dsp file
    App.prototype.uploadUrl = function (app, module, x, y, url) {
        var filename = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        Utilitary.getXHR(url, function (codeFaust) {
            var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + codeFaust + "}.process);";
            if (module == null) {
                app.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
            }
            else {
                module.update(filename, dsp_code);
            }
        }, Utilitary.errorCallBack);
    };
    // used for dsp code faust
    App.prototype.uploadCodeFaust = function (app, module, x, y, e, dsp_code) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: function (factory) { app.createModule(factory); } });
        }
        else {
            module.update("TEXT", dsp_code);
        }
    };
    //used for File containing code faust or jfaust/json scene descriptor get the file then pass it to loadFile()
    App.prototype.uploadFileFaust = function (app, module, x, y, e, dsp_code) {
        var files = e.dataTransfer.files;
        var file = files[0];
        this.loadFile(file, module, x, y);
    };
    //Load file dsp or jfaust
    App.prototype.loadFile = function (file, module, x, y) {
        var _this = this;
        var dsp_code;
        var reader = new FileReader();
        var ext = file.name.toString().split('.').pop();
        var filename = file.name.toString().split('.').shift();
        var type;
        if (ext == "dsp") {
            type = "dsp";
            reader.readAsText(file);
        }
        else if (ext == "json" || ext == "jfaust") {
            type = "json";
            reader.readAsText(file);
        }
        else {
            throw new Error(Utilitary.messageRessource.errorObjectNotFaustCompatible);
        }
        reader.onloadend = function (e) {
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";
            if (!module && type == "dsp") {
                _this.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: function (factory) { _this.createModule(factory); } });
            }
            else if (type == "dsp") {
                module.update(filename, dsp_code);
            }
            else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
        };
    };
    //used when a custom event from loading file with the browser dialogue
    App.prototype.loadFileEvent = function (e) {
        Utilitary.showFullPageLoading();
        var file = e.detail;
        var position = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y);
    };
    //used with the library double touch custom event
    App.prototype.dblTouchUpload = function (e) {
        Utilitary.showFullPageLoading();
        var position = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);
    };
    ////////////////////////////// design on drag or drop //////////////////////////////////////
    // manage style during a drag and drop event
    App.prototype.styleOnDragStart = function () {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "block";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "0.5";
        }
    };
    App.prototype.styleOnDragEnd = function () {
        this.menu.menuView.menuContainer.classList.remove("no_pointer");
        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        }
    };
    //manage the window size
    App.prototype.checkRealWindowSize = function () {
        if (window.scrollX > 0) {
            console.log(document.getElementsByTagName("html")[0]);
            document.getElementsByTagName("html")[0].style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("svgCanvas").style.width = window.innerWidth + window.scrollX + "px";
            document.getElementById("menuContainer").style.width = window.innerWidth + window.scrollX + "px";
        }
        else {
            document.getElementsByTagName("html")[0].style.width = "100%";
            document.getElementById("svgCanvas").style.width = "100%";
            document.getElementById("menuContainer").style.width = "100%";
        }
        if (window.scrollY > 0) {
            document.getElementsByTagName("html")[0].style.height = window.innerHeight + window.scrollY + "px";
            document.getElementById("svgCanvas").style.height = window.innerHeight + window.scrollY + "px";
        }
        else {
            document.getElementsByTagName("html")[0].style.height = "100%";
            document.getElementById("svgCanvas").style.height = "100%";
        }
    };
    App.prototype.errorCallBack = function (message) {
    };
    return App;
})();
/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app




*/
/// <reference path="App.ts"/>
/// <reference path="Messages.ts"/>
"use strict";
//listner on load of all element to init the app
window.addEventListener('load', init, false);
//initialization af the app, create app and ressource to get text with correct localization
//then resumeInit on callback when text is loaded
function init() {
    var app = new App();
    var ressource = new Ressources;
    ressource.getRessources(app);
}
//callback when text is loaded. resume the initialization
function resumeInit(app) {
    //create div which will contain all Messages and Confirm
    app.createDialogue();
    //create audiocontext if available, otherwise app can't work
    try {
        Utilitary.audioContext = new AudioContext();
    }
    catch (e) {
        new Message(Utilitary.messageRessource.errorNoWebAudioAPI);
        Utilitary.hideFullPageLoading();
    }
    Utilitary.addFullPageLoading();
    app.createAllScenes();
    app.createMenu();
    var accHandler = new AccelerometerHandler();
    Utilitary.accHandler = accHandler;
    accHandler.getAccelerometerValue();
    Utilitary.driveApi = new DriveAPI();
    app.menu.setDriveApi(Utilitary.driveApi);
    Utilitary.driveApi.checkAuth();
    //error catcher
    window.addEventListener("error", function (e) {
        if (e.message == "Uncaught Error: workerError" || e.message == "Error: workerError") {
            new Message(Utilitary.messageRessource.errorOccuredMessage + e.message);
            Utilitary.hideFullPageLoading();
        }
        if (e.message == "Uncaught Error: Upload2Error") {
            Utilitary.hideFullPageLoading();
            e.preventDefault();
        }
    });
}
//event listener to activate web audio on IOS devices, touchstart for iOS 8
//touchend for iOS 9
window.addEventListener('touchend', IosInit, false);
window.addEventListener('touchstart', IosInit2, false);
function IosInit() {
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);
    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit, false);
}
function IosInit2() {
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);
    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchstart', IosInit2, false);
}
