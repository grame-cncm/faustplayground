/// <reference path="App.ts"/>
/// <reference path="Utilitary.ts"/>
//contains all the key of resources json files in folders ressources
class Ressources {
    //get ressource depending on the location, default is french
    getRessources(app) {
        var localization = navigator.language;
        if (localization == "fr" || localization == "fr-FR") {
            Utilitary.getXHR("ressources/ressources_fr-FR.json", (ressource) => { this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
        else {
            Utilitary.getXHR("ressources/ressources_en-EN.json", (ressource) => { this.loadMessages(ressource, app); }, Utilitary.errorCallBack);
        }
    }
    // load the json object
    loadMessages(ressourceJson, app) {
        Utilitary.messageRessource = JSON.parse(ressourceJson);
        resumeInit(app);
    }
}
//Contain Message, MessageView, Confirm, Confirm view class
class Message {
    //Message show up and set a time out, if nothing happen, it remove it self
    //if one click, it stays, if double click it's removed (also the close button works)
    //fadeOutType can be eather null or "messageTransitionOutFast", to have new animation create new rules css
    constructor(message, fadeOutType, duration, delay) {
        this.isTouch = false;
        this.fadeOutType = "messageTransitionOut";
        this.duration = 10000;
        this.delay = 4000;
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = (e) => { this.removeMessage(e); };
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
        this.timeoutHide = setTimeout(() => { this.hideMessage(); }, this.duration);
        setTimeout(() => { this.displayMessage(); }, 500);
        document.addEventListener("messagedbltouch", () => { this.removeEventHandler(); });
        this.messageViewContainer.addEventListener("click", (e) => { this.clearTimeouts(e); });
        this.messageViewContainer.addEventListener("click", () => { this.dbleTouchMessage(); });
        this.messageViewContainer.addEventListener("dblclick", () => { this.removeEventHandler(); });
    }
    displayMessage() {
        this.messageViewContainer.classList.remove("messageHide");
        this.messageViewContainer.classList.add("messageShow");
        this.messageViewContainer.classList.add("messageTransitionIn");
        this.messageViewContainer.classList.remove(this.fadeOutType);
    }
    hideMessage() {
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn");
            this.messageViewContainer.classList.add(this.fadeOutType);
            this.messageViewContainer.classList.add("messageHide");
            this.messageViewContainer.classList.remove("messageShow");
            this.timeoutRemove = setTimeout(() => { this.removeMessage(); }, this.delay);
        }
    }
    removeMessage(e) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.remove();
            delete this.messageViewContainer;
        }
    }
    dbleTouchMessage() {
        if (!this.isTouch) {
            this.isTouch = true;
            window.setTimeout(() => { this.isTouch = false; }, 300);
        }
        else {
            this.dispatchEventCloseDblTouch();
            this.isTouch = false;
        }
    }
    dispatchEventCloseDblTouch() {
        var event = new CustomEvent("messagedbltouch");
        document.dispatchEvent(event);
    }
    clearTimeouts(e) {
        e.stopPropagation();
        e.preventDefault();
        clearTimeout(this.timeoutHide);
        if (this.timeoutRemove != undefined) {
            clearTimeout(this.timeoutRemove);
        }
        this.displayMessage();
    }
}
class MessageView {
    constructor() { }
    init() {
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
    }
}
// take message text and callback as parmater
//if validate, the callback is used, other with the confirm is removed
class Confirm {
    constructor(message, callback) {
        this.confirmView = new ConfirmView();
        this.confirmViewContainer = this.confirmView.init();
        this.confirmView.message.textContent = message;
        document.getElementById("dialogue").appendChild(this.confirmViewContainer);
        this.displayMessage();
        this.confirmView.validButton.addEventListener("click", () => { callback(() => { this.removeMessage(); }); });
        this.confirmView.cancelButton.addEventListener("click", () => { this.removeMessage(); });
    }
    displayMessage() {
        this.confirmViewContainer.classList.remove("messageHide");
        this.confirmViewContainer.classList.add("messageShow");
    }
    removeMessage(e) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.confirmViewContainer != undefined) {
            this.confirmViewContainer.remove();
            delete this.confirmViewContainer;
        }
    }
}
class ConfirmView {
    constructor() { }
    init() {
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
    }
}
// class to handel Drive Api request//
// using the v2 version
/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>
class DriveAPI {
    constructor() {
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
    checkAuth() { }
    updateConnection() {
        gapi.auth.authorize({
            'client_id': this.CLIENT_ID,
            'scope': this.SCOPES.join(' '),
            'immediate': true
        }, (authResult) => { this.handleAuthResult(authResult); });
    }
    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    handleAuthResult(authResult, auto) {
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
    }
    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    handleAuthClick(event) {
        gapi.auth.authorize({ client_id: this.CLIENT_ID, scope: this.SCOPES, immediate: false }, (authResult) => { this.handleAuthResult(authResult); });
        return false;
    }
    /**
     * Load Drive API client library.
     */
    loadDriveApi() {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        gapi.client.load('drive', 'v2', () => { this.listFolder(); });
    }
    /**
     * Print files.
     */
    listFolder() {
        var request = gapi.client.drive.files.list({
            'maxResults': 10000,
            'q': "title contains 'jfaust' and trashed!=true "
        });
        request.execute((resp) => {
            var event = new CustomEvent("finishloaddrive");
            document.dispatchEvent(event);
            var files = resp.items;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.fileExtension == "jfaust") {
                        this.appendPre(file.title, file.id);
                    }
                }
            }
            else {
                this.appendPre(Utilitary.messageRessource.noFileOnCloud, null);
            }
        });
    }
    getFileMetadata(fileId) {
        var request = gapi.client.drive.files.get({
            'fileId': fileId
        });
        request.execute((file) => {
            this.appendPre(file.title, file.id);
        });
    }
    /**
     * Append a pre element to the body containing the given message
     * as its text node.
     *
     * @param {string} message Text to be placed in pre element.
     */
    appendPre(name, id) {
        var option = document.createElement("option");
        option.value = id;
        option.textContent = name.replace(/.jfaust$/, '');
        var event = new CustomEvent("fillselect", { 'detail': option });
        document.dispatchEvent(event);
    }
    /**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
    downloadFile(file, callback) {
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
    }
    /**
 * Print a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
    getFile(fileId, callback) {
        var request = gapi.client.drive.files.get({
            'fileId': fileId,
        });
        try {
            request.execute((resp) => {
                this.lastSavedFileMetadata = resp;
                callback(resp);
            });
        }
        catch (e) {
            new Message("erreur");
        }
    }
    createFile(fileName, callback) {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        var request = gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'POST',
            'body': {
                "title": fileName + this.extension,
                "mimeType": "application/json",
            }
        });
        request.execute((resp) => {
            this.getFile(resp.id, (fileMetada) => { this.updateFile(resp.id, fileMetada, this.tempBlob, null); });
        });
    }
    /**
 * Update an existing file's metadata and content.
 *
 * @param {String} fileId ID of the file to update.
 * @param {Object} fileMetadata existing Drive file's metadata.
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Callback function to call when the request is complete.
 */
    updateFile(fileId, fileMetadata, fileData, callback) {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
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
                callback = () => {
                    var event = new CustomEvent("updatecloudselect");
                    document.dispatchEvent(event);
                    event = new CustomEvent("successave");
                    document.dispatchEvent(event);
                };
            }
            request.execute(callback);
        };
    }
    trashFile(fileId) {
        var event = new CustomEvent("startloaddrive");
        document.dispatchEvent(event);
        var request = gapi.client.drive.files.trash({
            'fileId': fileId
        });
        request.execute(function (resp) {
            var event = new CustomEvent("updatecloudselect");
            document.dispatchEvent(event);
        });
    }
}
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Ressources.ts"/>
/// <reference path="DriveAPI.ts"/>
/// <reference path="Main.ts"/>
class Utilitary {
    static errorCallBack(message) {
    }
    static showFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "visible";
        //too demanding for mobile firefox...
        //document.getElementById("Normal").style.filter = "blur(2px)"
        //document.getElementById("Normal").style.webkitFilter = "blur(2px)"
        //document.getElementById("menuContainer").style.filter = "blur(2px)"
        //document.getElementById("menuContainer").style.webkitFilter = "blur(2px)"
    }
    static hideFullPageLoading() {
        document.getElementById("loadingPage").style.visibility = "hidden";
        //document.getElementById("Normal").style.filter = "none"
        //document.getElementById("Normal").style.webkitFilter = "none"
        //document.getElementById("menuContainer").style.filter = "none"
        //document.getElementById("menuContainer").style.webkitFilter = "none"
    }
    static isAppPedagogique() {
        if (window.location.href.indexOf("kids.html") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    //generic function to make XHR request
    static getXHR(url, callback, errCallback) {
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
    }
    static addLoadingLogo(idTarget) {
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
    }
    static removeLoadingLogo(idTarget) {
        var divTarget = document.getElementById(idTarget);
        if (divTarget != null && divTarget.getElementsByClassName("loadingDiv").length > 0) {
            while (divTarget.getElementsByClassName("loadingDiv").length != 0) {
                divTarget.getElementsByClassName("loadingDiv")[0].remove();
            }
        }
    }
    static addFullPageLoading() {
        var loadingText = document.getElementById("loadingTextBig");
        loadingText.id = "loadingTextBig";
        loadingText.textContent = Utilitary.messageRessource.loading;
    }
    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
Utilitary.messageRessource = new Ressources();
Utilitary.idX = 0;
Utilitary.baseImg = "img/";
Utilitary.isAccelerometerOn = false;
Utilitary.isAccelerometerEditOn = false;
class PositionModule {
}
/*				DRAGGING.JS
    Handles Graphical Drag of Modules and Connections
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.

    --> Things could probably be easier...
*/
/// <reference path="Connect.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Utilitary.ts"/>
/***********************************************************************************/
/****** Node Dragging - these are used for dragging the audio modules interface*****/
/***********************************************************************************/
class Drag {
    constructor() {
        this.zIndex = 0;
        this.connector = new Connector();
        this.isDragConnector = false;
    }
    //used to dispatch the element, the location and the event to the callback function with click event
    getDraggingMouseEvent(mouseEvent, module, draggingFunction) {
        var event = mouseEvent;
        var el = mouseEvent.target;
        var x = mouseEvent.clientX + window.scrollX;
        var y = mouseEvent.clientY + window.scrollY;
        draggingFunction(el, x, y, module, event);
    }
    //used to dispatch the element, the location and the event to the callback function with touch event
    getDraggingTouchEvent(touchEvent, module, draggingFunction) {
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
    }
    startDraggingModule(el, x, y, module, event) {
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
    }
    whileDraggingModule(el, x, y, module, event) {
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
    }
    stopDraggingModule(el, x, y, module, event) {
        // Stop capturing mousemove and mouseup events.
        document.removeEventListener("mouseup", module.eventDraggingHandler, false);
        document.removeEventListener("mousemove", module.eventDraggingHandler, false);
    }
    /************************************************************************************/
    /*** Connector Dragging - these are used for dragging the connectors between nodes***/
    /************************************************************************************/
    updateConnectorShapePath(connectorShape, x1, x2, y1, y2) {
        connectorShape.x1 = x1;
        connectorShape.x2 = x2;
        connectorShape.y1 = y1;
        connectorShape.y2 = y2;
    }
    setCurvePath(x1, y1, x2, y2, x1Bezier, x2Bezier) {
        return "M" + x1 + "," + y1 + " C" + x1Bezier + "," + y1 + " " + x2Bezier + "," + y2 + " " + x2 + "," + y2;
    }
    calculBezier(x1, x2) {
        return x1 - (x1 - x2) / 2;
        ;
    }
    startDraggingConnection(module, target) {
        // if this is the green or red button, use its parent.
        if (target.classList.contains("node-button")) {
            target = target.parentNode;
        }
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
        this.connector.connectorShape.onclick = (event) => { this.connector.deleteConnection(event, this); };
        document.getElementById("svgCanvas").appendChild(curve);
    }
    stopDraggingConnection(sourceModule, destination, target) {
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
                this.connector.connectorShape.onclick = (event) => { connector.deleteConnection(event, this); };
                //this.connectorShape = null;
                return;
            }
        }
        // Otherwise, delete the line
        this.connector.connectorShape.parentNode.removeChild(this.connector.connectorShape);
        this.connector.connectorShape = null;
    }
    startDraggingConnector(target, x, y, module, event) {
        this.startDraggingConnection(module, target);
        // Capture mousemove and mouseup events on the page.
        document.addEventListener("mousemove", module.eventConnectorHandler);
        document.addEventListener("mouseup", module.eventConnectorHandler);
        event.preventDefault();
        event.stopPropagation();
    }
    whileDraggingConnector(target, x, y, module, event) {
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
    }
    stopDraggingConnector(target, x, y, module) {
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
    }
    isConnectionValid(target) {
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
    }
    isConnectionUnique(moduleSource, moduleDestination) {
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
    }
}
/// <reference path="Messages.ts"/>
/// <reference path="Utilitary.ts"/>
//==============================================================================================
// updateAccInFaustCode (faustcode : string, name: string, newaccvalue: string) : string;
// Update the acc metadata associated to <name> in <faustcode>. Returns the updated faust code
//==============================================================================================
// Iterate into faust code to find next path-string.
class PathIterator {
    constructor(faustCode) {
        this.fFaustCode = faustCode;
        this.fStart = 0;
        this.fEnd = 0;
    }
    // search and select next string :  "...."
    // (not completely safe, but should be OK)
    findNextPathString() {
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
            console.log(`no more path found: ${this.fEnd}, ${p1}, ${p2}`);
            return "";
        }
    }
    // Replace the current selected path with a new string and return the update faust code
    updateCurrentPathString(newstring) {
        if ((0 < this.fStart) && (this.fStart < this.fEnd)) {
            // we have a valide path to replace
            return this.fFaustCode.slice(0, this.fStart) + newstring + this.fFaustCode.slice(this.fEnd);
        }
        else {
            console.log("ERROR, trying to update an invalide path");
            return this.fFaustCode;
        }
    }
}
// Forge accelerometer metadata -> "acc: bla bla bla"" or "noacc: bla bla bla""
function forgeAccMetadata(newAccValue, isEnabled) {
    if (isEnabled) {
        return `acc:${newAccValue}`;
    }
    else {
        return `noacc:${newAccValue}`;
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
    console.log(`ERROR in replaceAccInPath() : malformed path ${oldpath}`);
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
class AccMeta {
}
//Contains the info regarding the mapping of the FaustInterfaceControler and the accelerometer
class AccelerometerSlider {
    constructor(accParams) {
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
    setAttributes(fMetaAcc) {
        if (fMetaAcc != null) {
            var arrayMeta = fMetaAcc.split(" ");
            this.axis = parseInt(arrayMeta[0]);
            this.curve = parseInt(arrayMeta[1]);
            this.amin = parseInt(arrayMeta[2]);
            this.amid = parseInt(arrayMeta[3]);
            this.amax = parseInt(arrayMeta[4]);
        }
    }
    setAttributesDetailed(axis, curve, min, mid, max) {
        this.axis = axis;
        this.curve = curve;
        this.amin = min;
        this.amid = mid;
        this.amax = max;
    }
}
//object responsible of storing all accelerometerSlider and propagate to them the accelerometer infos.
class AccelerometerHandler {
    // get Accelerometer value
    getAccelerometerValue() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", (event) => { this.propagate(event); }, false);
        }
        else {
            // Browser doesn't support DeviceMotionEvent
            console.log(Utilitary.messageRessource.noDeviceMotion);
        }
    }
    // propagate the new x, y, z value of the accelerometer to the registred object
    propagate(event) {
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
    }
    //create and register accelerometerSlide
    static registerAcceleratedSlider(accParams, faustInterfaceControler, sliderEdit) {
        var accelerometerSlide = new AccelerometerSlider(accParams);
        faustInterfaceControler.accelerometerSlider = accelerometerSlide;
        AccelerometerHandler.curveSplitter(accelerometerSlide);
        if (sliderEdit) {
            AccelerometerHandler.faustInterfaceControlerEdit = faustInterfaceControler;
        }
        else {
            AccelerometerHandler.faustInterfaceControler.push(faustInterfaceControler);
        }
    }
    //give the good axis value to the accelerometerslider, convert it to the faust value before
    axisSplitter(accelerometerSlide, x, y, z, callBack) {
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
    }
    //update value of the dsp
    applyNewValueToModule(accSlid, newVal, axeValue) {
        accSlid.callbackValueChange(accSlid.address, newVal);
    }
    //update value of the edit range in AccelerometerEditView
    applyValueToEdit(accSlid, newVal, axeValue) {
        AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView.slider.value = axeValue.toString();
    }
    //Apply the right converter with the right curve to an accelerometerSlider
    static curveSplitter(accelerometerSlide) {
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
    }
}
//array containing all the FaustInterfaceControler of the scene
AccelerometerHandler.faustInterfaceControler = [];
//faustInterfaceControler of the AccelerometerEditView
AccelerometerHandler.faustInterfaceControlerEdit = null;
/***************************************************************************************
********************  Converter objects use to map acc and faust value *****************
****************************************************************************************/
class MinMaxClip {
    constructor(x, y) {
        this.fLo = Math.min(x, y);
        this.fHi = Math.max(x, y);
    }
    clip(x) {
        if (x < this.fLo) {
            return this.fLo;
        }
        else if (x > this.fHi) {
            return this.fHi;
        }
        else {
            return x;
        }
    }
}
class Interpolator {
    constructor(lo, hi, v1, v2) {
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
    returnMappedValue(v) {
        var x = this.range.clip(v);
        return this.fOffset + x * this.fCoef;
    }
    getLowHigh(amin, amax) {
        return { amin: this.range.fLo, amax: this.range.fHi };
    }
}
class Interpolator3pt {
    constructor(lo, mid, hi, v1, vMid, v2) {
        this.fSegment1 = new Interpolator(lo, mid, v1, vMid);
        this.fSegment2 = new Interpolator(mid, hi, vMid, v2);
        this.fMiddle = mid;
    }
    returnMappedValue(x) {
        return (x < this.fMiddle) ? this.fSegment1.returnMappedValue(x) : this.fSegment2.returnMappedValue(x);
    }
    getMappingValues(amin, amid, amax) {
        var lowHighSegment1 = this.fSegment1.getLowHigh(amin, amid);
        var lowHighSegment2 = this.fSegment2.getLowHigh(amid, amax);
        return { amin: lowHighSegment1.amin, amid: lowHighSegment2.amin, amax: lowHighSegment2.amax };
    }
}
class AccUpConverter {
    constructor(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmid, fmax);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amin, amid, amax);
    }
    uiToFaust(x) { return this.accToFaust.returnMappedValue(x); }
    faustToUi(x) { return this.accToFaust.returnMappedValue(x); }
    ;
    setMappingValues(amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, init, max);
        this.faustToAcc = new Interpolator3pt(min, init, max, amin, amid, amax);
    }
    ;
    getMappingValues(amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    }
    ;
    setActive(onOff) { this.fActive = onOff; }
    ;
    getActive() { return this.fActive; }
    ;
}
class AccDownConverter {
    constructor(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmid, fmin);
        this.faustToAcc = new Interpolator3pt(fmin, fmid, fmax, amax, amid, amin);
    }
    uiToFaust(x) { return this.accToFaust.returnMappedValue(x); }
    faustToUi(x) { return this.accToFaust.returnMappedValue(x); }
    ;
    setMappingValues(amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, init, min);
        this.faustToAcc = new Interpolator3pt(min, init, max, amax, amid, amin);
    }
    ;
    getMappingValues(amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    }
    ;
    setActive(onOff) { this.fActive = onOff; }
    ;
    getActive() { return this.fActive; }
    ;
}
class AccUpDownConverter {
    constructor(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmin, fmax, fmin);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    uiToFaust(x) { return this.accToFaust.returnMappedValue(x); }
    faustToUi(x) { return this.accToFaust.returnMappedValue(x); }
    ;
    setMappingValues(amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, min, max, min);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    }
    ;
    getMappingValues(amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    }
    ;
    setActive(onOff) { this.fActive = onOff; }
    ;
    getActive() { return this.fActive; }
    ;
}
class AccDownUpConverter {
    constructor(amin, amid, amax, fmin, fmid, fmax) {
        this.fActive = true;
        this.accToFaust = new Interpolator3pt(amin, amid, amax, fmax, fmin, fmax);
        this.faustToAcc = new Interpolator(fmin, fmax, amin, amax);
    }
    uiToFaust(x) { return this.accToFaust.returnMappedValue(x); }
    faustToUi(x) { return this.accToFaust.returnMappedValue(x); }
    ;
    setMappingValues(amin, amid, amax, min, init, max) {
        this.accToFaust = new Interpolator3pt(amin, amid, amax, max, min, max);
        this.faustToAcc = new Interpolator(min, max, amin, amax);
    }
    ;
    getMappingValues(amin, amid, amax) {
        return this.accToFaust.getMappingValues(amin, amid, amax);
    }
    ;
    setActive(onOff) { this.fActive = onOff; }
    ;
    getActive() { return this.fActive; }
    ;
}
/// <reference path="../Accelerometer.ts"/>
/// <reference path="../Utilitary.ts"/>
class FaustInterfaceControler {
    constructor(interfaceCallback, setDSPValueCallback) {
        this.accDefault = "0 0 -10 0 10";
        this.interfaceCallback = interfaceCallback;
        this.setDSPValueCallback = setDSPValueCallback;
    }
    //parse interface json from faust webaudio-asm-wrapper to create corresponding FaustInterfaceControler
    parseFaustJsonUI(ui, module) {
        this.faustControlers = [];
        for (var i = 0; i < ui.length; i++) {
            this.parse_group(ui[i], module);
        }
        return this.faustControlers;
    }
    parse_group(group, module) {
        if (group.items)
            this.parse_items(group.items, module);
    }
    parse_item(item, module) {
        var params = module.getInterfaceParams();
        if (params && params[item.address]) {
            item.init = params[item.address];
        }
        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);
        }
        else if (item.type === "vslider" || item.type === "hslider") {
            var itemElement = item;
            var controler = new FaustInterfaceControler(() => { this.interfaceCallback(controler); }, (adress, value) => { this.setDSPValueCallback(adress, value); });
            controler.name = itemElement.label;
            controler.itemParam = itemElement;
            controler.value = itemElement.init;
            this.faustControlers.push(controler);
        }
        else if (item.type === "button") {
            var itemElement = item;
            var controler = new FaustInterfaceControler((faustInterface) => { this.interfaceCallback(faustInterface); }, (adress, value) => { this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            controler.value = "0";
            this.faustControlers.push(controler);
        }
        else if (item.type === "checkbox") {
            var itemElement = item;
            var controler = new FaustInterfaceControler((faustInterface) => { this.interfaceCallback(faustInterface); }, (adress, value) => { this.setDSPValueCallback(adress, value); });
            controler.itemParam = itemElement;
            controler.value = "0";
            this.faustControlers.push(controler);
        }
    }
    parse_items(items, node) {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    }
    setParams() {
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
    }
    // create and allocate right faustInterfaceView
    createFaustInterfaceElement() {
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
    }
    // Set eventListner of the faustInterfaceView
    setEventListener() {
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                this.faustInterfaceView.slider.addEventListener("input", (event) => {
                    this.interfaceCallback(this);
                    event.stopPropagation();
                    event.preventDefault();
                });
                this.faustInterfaceView.slider.addEventListener("mousedown", (e) => { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchstart", (e) => { e.stopPropagation(); });
                this.faustInterfaceView.slider.addEventListener("touchmove", (e) => { e.stopPropagation(); });
            }
            else if (this.faustInterfaceView.type === "button") {
                this.faustInterfaceView.button.addEventListener("mousedown", (e) => {
                    e.stopPropagation();
                    this.interfaceCallback(this);
                });
                this.faustInterfaceView.button.addEventListener("mouseup", (e) => {
                    e.stopPropagation();
                    this.interfaceCallback(this);
                });
                this.faustInterfaceView.button.addEventListener("touchstart", (e) => {
                    e.stopPropagation();
                    this.interfaceCallback(this);
                });
                this.faustInterfaceView.button.addEventListener("touchend", (e) => {
                    e.stopPropagation();
                    this.interfaceCallback(this);
                });
            }
            else if (this.faustInterfaceView.type === "checkbox") {
            }
        }
    }
    //attach acceleromterSlider to faustInterfaceControler
    //give the acc or noacc values
    //if no accelerometer value, it create a default noacc one
    createAccelerometer() {
        if (this.itemParam.meta) {
            var meta = this.itemParam.meta;
            for (var i = 0; i < meta.length; i++) {
                if (meta[i].acc) {
                    this.acc = meta[i].acc;
                    this.accParams.acc = this.acc;
                    this.accParams.isEnabled = true;
                    AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                    this.accelerometerSlider.callbackValueChange = (address, value) => { this.callbackValueChange(address, value); };
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
                    this.accelerometerSlider.callbackValueChange = (address, value) => { this.callbackValueChange(address, value); };
                    this.accelerometerSlider.isEnabled = false;
                    this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
                }
            }
            if (this.accelerometerSlider == undefined) {
                this.acc = this.accDefault;
                this.accParams.acc = this.acc;
                this.accParams.isEnabled = false;
                AccelerometerHandler.registerAcceleratedSlider(this.accParams, this);
                this.accelerometerSlider.callbackValueChange = (address, value) => { this.callbackValueChange(address, value); };
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
            this.accelerometerSlider.callbackValueChange = (address, value) => { this.callbackValueChange(address, value); };
            this.accelerometerSlider.isEnabled = false;
            if (this.faustInterfaceView.slider != undefined) {
                this.faustInterfaceView.slider.parentElement.classList.add("disabledAcc");
            }
        }
    }
    //callback to update the dsp value
    callbackValueChange(address, value) {
        this.setDSPValueCallback(address, String(value));
        this.faustInterfaceView.slider.value = String((value - parseFloat(this.itemParam.min)) / parseFloat(this.itemParam.step));
        this.faustInterfaceView.output.textContent = String(value.toFixed(parseFloat(this.precision)));
    }
}
/********************************************************************
********************* ADD GRAPHICAL ELEMENTS ***********************
********************************************************************/
class FaustInterfaceView {
    constructor(type) {
        this.type = type;
    }
    addFaustModuleSlider(itemParam, precision, unit) {
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
    }
    addFaustCheckBox(ivalue) {
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
    }
    addFaustButton(itemParam) {
        var group = document.createElement("div");
        var button = document.createElement("input");
        button.type = "button";
        this.button = button;
        this.button.value = itemParam.label;
        group.appendChild(button);
        return button;
    }
}
/// <reference path="../Connect.ts"/>
/*MODULEFAUST.JS
HAND - MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE */
class ModuleFaust {
    constructor(name) {
        this.fOutputConnections = [];
        this.fInputConnections = [];
        this.recallOutputsDestination = [];
        this.recallInputsSource = [];
        this.fName = name;
    }
    /*************** ACTIONS ON IN/OUTPUT MODULES ***************************/
    // ------ Returns Connection Array OR null if there are none
    getInputConnections() {
        return this.fInputConnections;
    }
    getOutputConnections() {
        return this.fOutputConnections;
    }
    addOutputConnection(connector) {
        this.fOutputConnections.push(connector);
    }
    addInputConnection(connector) {
        this.fInputConnections.push(connector);
    }
    removeOutputConnection(connector) {
        this.fOutputConnections.splice(this.fOutputConnections.indexOf(connector), 1);
    }
    removeInputConnection(connector) {
        this.fInputConnections.splice(this.fInputConnections.indexOf(connector), 1);
    }
    /********************** GET/SET SOURCE/NAME/DSP ***********************/
    setSource(code) {
        this.fSource = code;
    }
    getSource() { return this.fSource; }
    getName() { return this.fName; }
    getDSP() {
        return this.fDSP;
    }
}
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
class ModuleView {
    constructor() {
        this.inputOutputNodeDimension = 32;
    }
    createModuleView(ID, x, y, name, htmlParent) {
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
    }
    // ------ Returns Graphical input and output Node
    getOutputNode() { return this.fOutputNode; }
    getInputNode() { return this.fInputNode; }
    getModuleContainer() {
        return this.fModuleContainer;
    }
    getInterfaceContainer() {
        return this.fInterfaceContainer;
    }
    setInputNode() {
        this.fInputNode = document.createElement("div");
        this.fInputNode.className = "node node-input";
        this.fInputNode.draggable = false;
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fInputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fInputNode);
    }
    setOutputNode() {
        this.fOutputNode = document.createElement("div");
        this.fOutputNode.className = "node node-output";
        this.fOutputNode.draggable = false;
        var spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.fOutputNode.appendChild(spanNode);
        this.fModuleContainer.appendChild(this.fOutputNode);
    }
    deleteInputOutputNodes() {
        if (this.fInputNode) {
            this.fModuleContainer.removeChild(this.fInputNode);
            this.fInputNode = null;
        }
        if (this.fOutputNode) {
            this.fModuleContainer.removeChild(this.fOutputNode);
            this.fOutputNode = null;
        }
    }
    isPointInOutput(x, y) {
        if (this.fOutputNode && this.fOutputNode.getBoundingClientRect().left < x && x < this.fOutputNode.getBoundingClientRect().right && this.fOutputNode.getBoundingClientRect().top < y && y < this.fOutputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    }
    isPointInInput(x, y) {
        if (this.fInputNode && this.fInputNode.getBoundingClientRect().left <= x && x <= this.fInputNode.getBoundingClientRect().right && this.fInputNode.getBoundingClientRect().top <= y && y <= this.fInputNode.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    }
    isPointInNode(x, y) {
        if (this.fModuleContainer && this.fModuleContainer.getBoundingClientRect().left < x && x < this.fModuleContainer.getBoundingClientRect().right && this.fModuleContainer.getBoundingClientRect().top < y && y < this.fModuleContainer.getBoundingClientRect().bottom) {
            return true;
        }
        return false;
    }
}
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
class ModuleClass {
    constructor(id, x, y, name, htmlElementModuleContainer, removeModuleCallBack, compileFaust) {
        //drag object to handle dragging of module and connection
        this.drag = new Drag();
        this.dragList = [];
        this.moduleControles = [];
        this.fModuleInterfaceParams = {};
        this.eventConnectorHandler = (event) => { this.dragCnxCallback(event, this); };
        this.eventCloseEditHandler = (event) => { this.recompileSource(event, this); };
        this.eventOpenEditHandler = () => { this.edit(); };
        this.compileFaust = compileFaust;
        this.deleteCallback = removeModuleCallBack;
        this.eventDraggingHandler = (event) => { this.dragCallback(event, this); };
        this.moduleView = new ModuleView();
        this.moduleView.createModuleView(id, x, y, name, htmlElementModuleContainer);
        this.moduleFaust = new ModuleFaust(name);
        this.addEvents();
    }
    //add all event listener to the moduleView
    addEvents() {
        this.moduleView.getModuleContainer().addEventListener("mousedown", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchstart", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchmove", this.eventDraggingHandler, false);
        this.moduleView.getModuleContainer().addEventListener("touchend", this.eventDraggingHandler, false);
        if (this.moduleView.textArea != undefined) {
            this.moduleView.textArea.addEventListener("touchstart", (e) => { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchend", (e) => { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("touchmove", (e) => { e.stopPropagation(); });
            this.moduleView.textArea.addEventListener("mousedown", (e) => { e.stopPropagation(); });
        }
        if (this.moduleView.closeButton != undefined) {
            this.moduleView.closeButton.addEventListener("click", () => { this.deleteModule(); });
            this.moduleView.closeButton.addEventListener("touchend", () => { this.deleteModule(); });
        }
        if (this.moduleView.miniButton != undefined) {
            this.moduleView.miniButton.addEventListener("click", () => { this.minModule(); });
            this.moduleView.miniButton.addEventListener("touchend", () => { this.minModule(); });
        }
        if (this.moduleView.maxButton != undefined) {
            this.moduleView.maxButton.addEventListener("click", () => { this.maxModule(); });
            this.moduleView.maxButton.addEventListener("touchend", () => { this.maxModule(); });
        }
        if (this.moduleView.fEditImg != undefined) {
            this.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
            this.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        }
    }
    /***************  PRIVATE METHODS  ******************************/
    dragCallback(event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module, e) => { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module, e) => { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module, e) => { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            module.drag.getDraggingTouchEvent(event, module, (el, x, y, module, e) => { module.drag.startDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            module.drag.getDraggingTouchEvent(event, module, (el, x, y, module, e) => { module.drag.whileDraggingModule(el, x, y, module, e); });
        }
        else if (event.type == "touchend") {
            module.drag.getDraggingTouchEvent(event, module, (el, x, y, module, e) => { module.drag.stopDraggingModule(el, x, y, module, e); });
        }
    }
    dragCnxCallback(event, module) {
        if (event.type == "mousedown") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module, e) => { module.drag.startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "mouseup") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module) => { module.drag.stopDraggingConnector(el, x, y, module); });
        }
        else if (event.type == "mousemove") {
            module.drag.getDraggingMouseEvent(event, module, (el, x, y, module, e) => { module.drag.whileDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchstart") {
            var newdrag = new Drag();
            newdrag.isDragConnector = true;
            newdrag.originTarget = event.target;
            module.dragList.push(newdrag);
            var index = module.dragList.length - 1;
            module.dragList[index].getDraggingTouchEvent(event, module, (el, x, y, module, e) => { module.dragList[index].startDraggingConnector(el, x, y, module, e); });
        }
        else if (event.type == "touchmove") {
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, (el, x, y, module, e) => { module.dragList[i].whileDraggingConnector(el, x, y, module, e); });
                }
            }
        }
        else if (event.type == "touchend") {
            var customEvent = new CustomEvent("unstylenode");
            document.dispatchEvent(customEvent);
            for (var i = 0; i < module.dragList.length; i++) {
                if (module.dragList[i].originTarget == event.target) {
                    module.dragList[i].getDraggingTouchEvent(event, module, (el, x, y, module) => { module.dragList[i].stopDraggingConnector(el, x, y, module); });
                }
            }
            document.dispatchEvent(customEvent);
        }
    }
    /*******************************  PUBLIC METHODS  **********************************/
    deleteModule() {
        var connector = new Connector();
        connector.disconnectModule(this);
        this.deleteFaustInterface();
        // Then delete the visual element
        if (this.moduleView)
            this.moduleView.fModuleContainer.parentNode.removeChild(this.moduleView.fModuleContainer);
        this.deleteDSP(this.moduleFaust.fDSP);
        this.deleteCallback(this);
    }
    //make module smaller
    minModule() {
        this.moduleView.fInterfaceContainer.classList.add("mini");
        this.moduleView.fTitle.classList.add("miniTitle");
        this.moduleView.miniButton.style.display = "none";
        this.moduleView.maxButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    }
    //restore module size
    maxModule() {
        this.moduleView.fInterfaceContainer.classList.remove("mini");
        this.moduleView.fTitle.classList.remove("miniTitle");
        this.moduleView.maxButton.style.display = "none";
        this.moduleView.miniButton.style.display = "block";
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
    }
    //--- Create and Update are called once a source code is compiled and the factory exists
    createDSP(factory, callback) {
        this.moduleFaust.factory = factory;
        try {
            if (factory != null) {
                var moduleFaust = this.moduleFaust;
                faust.createDSPInstance(factory, Utilitary.audioContext, 1024, function (dsp) {
                    if (dsp != null) {
                        moduleFaust.fDSP = dsp;
                        callback();
                    }
                    else {
                        new Message(Utilitary.messageRessource.errorCreateDSP);
                        Utilitary.hideFullPageLoading();
                    }
                });
                // To activate the AudioWorklet mode
                //faust.createDSPWorkletInstance(factory, Utilitary.audioContext, function(dsp) { moduleFaust.fDSP = dsp; callback(); });
            }
            else {
                throw new Error("create DSP Error : null factory");
            }
        }
        catch (e) {
            new Message(Utilitary.messageRessource.errorCreateDSP + " : " + e);
            Utilitary.hideFullPageLoading();
        }
    }
    //--- Update DSP in module
    updateDSP(factory, module) {
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
        module.createDSP(factory, function () {
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
        });
    }
    deleteDSP(todelete) {
        // 	TO DO SAFELY --> FOR NOW CRASHES SOMETIMES
        // 		if(todelete)
        // 		    faust.deleteDSPInstance(todelete);
    }
    /******************** EDIT SOURCE & RECOMPILE *************************/
    edit() {
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
    }
    //---- Update ModuleClass with new name/code source
    update(name, code) {
        var event = new CustomEvent("codeeditevent");
        document.dispatchEvent(event);
        this.moduleFaust.fTempName = name;
        this.moduleFaust.fTempSource = code;
        var module = this;
        this.compileFaust({ name: name, sourceCode: code, x: this.moduleView.x, y: this.moduleView.y, callback: (factory) => { module.updateDSP(factory, module); } });
    }
    //---- React to recompilation triggered by click on icon
    recompileSource(event, module) {
        Utilitary.showFullPageLoading();
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
    }
    /***************** CREATE/DELETE the DSP Interface ********************/
    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    setFaustInterfaceControles() {
        this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        var moduleFaustInterface = new FaustInterfaceControler((faustInterface) => { this.interfaceSliderCallback(faustInterface); }, (adress, value) => { this.moduleFaust.fDSP.setParamValue(adress, value); });
        this.moduleControles = moduleFaustInterface.parseFaustJsonUI(JSON.parse(this.moduleFaust.fDSP.getJSON()).ui, this);
    }
    // Create FaustInterfaceControler, set its callback and add its AccelerometerSlider
    createFaustInterface() {
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
    }
    // Delete all FaustInterfaceControler
    deleteFaustInterface() {
        this.deleteAccelerometerRef();
        while (this.moduleView.fInterfaceContainer.childNodes.length != 0) {
            this.moduleView.fInterfaceContainer.removeChild(this.moduleView.fInterfaceContainer.childNodes[0]);
        }
    }
    // Remove AccelerometerSlider ref from AccelerometerHandler
    deleteAccelerometerRef() {
        for (var i = 0; i < this.moduleControles.length; i++) {
            if (this.moduleControles[i].accelerometerSlider != null && this.moduleControles[i].accelerometerSlider != undefined) {
                var index = AccelerometerHandler.faustInterfaceControler.indexOf(this.moduleControles[i]);
                AccelerometerHandler.faustInterfaceControler.splice(index, 1);
                delete this.moduleControles[i].accelerometerSlider;
            }
        }
        this.moduleControles = [];
    }
    // set DSP value to all FaustInterfaceControlers
    setDSPValue() {
        for (var i = 0; i < this.moduleControles.length; i++) {
            this.moduleFaust.fDSP.setParamValue(this.moduleControles[i].itemParam.address, this.moduleControles[i].value);
        }
    }
    // set DSP value to specific FaustInterfaceControlers
    setDSPValueCallback(address, value) {
        this.moduleFaust.fDSP.setParamValue(address, value);
    }
    // Updates Faust Code with new accelerometer metadata
    updateCodeFaust(details) {
        var m = forgeAccMetadata(details.newAccValue, details.isEnabled);
        var s = updateAccInFaustCode(this.moduleFaust.fSource, details.sliderName, m);
        this.moduleFaust.fSource = s;
    }
    //---- Generic callback for Faust Interface
    //---- Called every time an element of the UI changes value
    interfaceSliderCallback(faustControler) {
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
        this.moduleFaust.fDSP.setParamValue(text, val);
    }
    interfaceButtonCallback(faustControler, val) {
        var text = faustControler.itemParam.address;
        faustControler.value = val.toString();
        var output = faustControler.faustInterfaceView.output;
        //---- update the value text
        if (output)
            output.textContent = "" + val + " " + faustControler.unit;
        // 	Search for DSP then update the value of its parameter.
        this.moduleFaust.fDSP.setParamValue(text, val.toString());
    }
    // Save graphical parameters of a Faust Node
    saveInterfaceParams() {
        var controls = this.moduleControles;
        for (var j = 0; j < controls.length; j++) {
            var text = controls[j].itemParam.address;
            this.fModuleInterfaceParams[text] = controls[j].value;
        }
    }
    recallInterfaceParams() {
        for (var key in this.fModuleInterfaceParams)
            this.moduleFaust.fDSP.setParamValue(key, this.fModuleInterfaceParams[key]);
    }
    getInterfaceParams() {
        return this.fModuleInterfaceParams;
    }
    setInterfaceParams(parameters) {
        this.fModuleInterfaceParams = parameters;
    }
    addInterfaceParam(path, value) {
        this.fModuleInterfaceParams[path] = value.toString();
    }
    /******************* GET/SET INPUT/OUTPUT NODES **********************/
    addInputOutputNodes() {
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
    }
    //manage style of node when touchover will dragging
    //make the use easier for connections
    styleInputNodeTouchDragOver(el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.left = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    }
    styleOutputNodeTouchDragOver(el) {
        el.style.border = "15px double rgb(0, 211, 255)";
        el.style.right = "-32px";
        el.style.marginTop = "-32px";
        ModuleClass.isNodesModuleUnstyle = false;
    }
}
ModuleClass.isNodesModuleUnstyle = true;
/*				CONNECT.JS
    Handles Audio/Graphical Connection/Deconnection of modules
    This is a historical file from Chris Wilson, modified for Faust ModuleClass needs.
*/
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Utilitary.ts"/>
/// <reference path="Dragging.ts"/>
class Connector {
    // connect input node to device input
    connectInput(inputModule, divSrc) {
        divSrc.audioNode.connect(inputModule.moduleFaust.getDSP());
    }
    //connect output to device output
    connectOutput(outputModule, divOut) {
        outputModule.moduleFaust.getDSP().connect(divOut.audioNode);
    }
    // Connect Nodes in Web Audio Graph
    connectModules(source, destination) {
        var sourceDSP;
        var destinationDSP;
        if (destination != null && destination.moduleFaust.getDSP) {
            destinationDSP = destination.moduleFaust.getDSP();
        }
        if (source.moduleFaust.getDSP) {
            sourceDSP = source.moduleFaust.getDSP();
        }
        if (sourceDSP && destinationDSP) {
            sourceDSP.connect(destinationDSP);
        }
        source.setDSPValue();
        destination.setDSPValue();
    }
    // Disconnect Nodes in Web Audio Graph
    disconnectModules(source, destination) {
        // We want to be dealing with the audio node elements from here on
        var sourceCopy = source;
        var sourceCopyDSP;
        // Searching for src/dst DSP if existing
        if (sourceCopy != undefined && sourceCopy.moduleFaust.getDSP) {
            sourceCopyDSP = sourceCopy.moduleFaust.getDSP();
            sourceCopyDSP.disconnect();
        }
        // Reconnect all disconnected connections (because disconnect API cannot break a single connection)
        if (source != undefined && source.moduleFaust.getOutputConnections()) {
            for (var i = 0; i < source.moduleFaust.getOutputConnections().length; i++) {
                if (source.moduleFaust.getOutputConnections()[i].destination != destination)
                    this.connectModules(source, source.moduleFaust.getOutputConnections()[i].destination);
            }
        }
    }
    /**************************************************/
    /***************** Save Connection*****************/
    /**************************************************/
    //----- Add connection to src and dst connections structures
    saveConnection(source, destination, connectorShape) {
        this.connectorShape = connectorShape;
        this.destination = destination;
        this.source = source;
    }
    /***************************************************************/
    /**************** Create/Break Connection(s) *******************/
    /***************************************************************/
    createConnection(source, outtarget, destination, intarget) {
        var drag = new Drag();
        drag.startDraggingConnection(source, outtarget);
        drag.stopDraggingConnection(source, destination);
    }
    deleteConnection(event, drag) {
        event.stopPropagation();
        this.breakSingleInputConnection(this.source, this.destination, this);
        return true;
    }
    breakSingleInputConnection(source, destination, connector) {
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
    }
    // Disconnect a node from all its connections
    disconnectModule(module) {
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
    static redrawInputConnections(module, drag) {
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
    }
    static redrawOutputConnections(module, drag) {
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
    }
}
Connector.connectorId = 0;
/// <reference path="Lib/qrcode.d.ts"/>
/************************************************************
***************** Interface to FaustWeb *********************
************************************************************/
class ExportLib {
    //--- Send asynchronous POST request to FaustWeb to compile a faust DSP
    // @exportUrl : url of FaustWeb service to target
    // @name : name of DSP to compile
    // @source_code : Faust code to compile
    // @callback : function called once request succeeded
    // 				- @param : the sha key corresponding to source_code
    static getSHAKey(exportUrl, name, source_code, callback, errCallback) {
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
    }
    //--- Send asynchronous GET request to precompile target
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP to precompile
    // @platform/architecture : platform/architecture to precompile
    // @callback : function called once request succeeded
    // 				- @param : the sha key
    sendPrecompileRequest(exportUrl, sha, platforme, architecture, appType, callback) {
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            if (getrequest.readyState == 4) {
                callback(exportUrl, sha, platforme, architecture, appType);
            }
        };
        var compileUrl = exportUrl + "/" + sha + "/" + platforme + "/" + architecture + "/precompile";
        getrequest.open("GET", compileUrl, true);
        getrequest.send(null);
    }
    //--- Transform target
    // WARNING = THIS FUNCTION REQUIRES QRCODE.JS TO BE INCLUDED IN YOUR HTML FILE
    // @exportUrl : url of FaustWeb service to target
    // @sha : sha key of DSP
    // @platform/architecture/target : platform/architecture/target compiled
    // @cote : width and height of the returned QrCode
    static getQrCode(url, sha, plateform, architecture, target, size) {
        var downloadString = url + "/" + sha + "/" + plateform + "/" + architecture + "/" + target;
        var whiteContainer = document.createElement('div');
        whiteContainer.style.cssText = "width:" + size.toString() + "px; height:" + size.toString() + "px; background-color:white; position:relative; margin-left:auto; margin-right:auto; padding:3px;";
        var qqDiv = document.createElement('qrcode');
        new QRCode(qqDiv, {
            text: downloadString,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        whiteContainer.appendChild(qqDiv);
        return whiteContainer;
    }
    // Return the array of available platforms from the json description
    getPlatforms(json) {
        var platforms = [];
        var data = JSON.parse(json);
        var index = 0;
        for (var p in data) {
            platforms[index] = p;
            index++;
        }
        return platforms;
    }
    // Return the list of available architectures for a specific platform from the json description
    getArchitectures(json, platform) {
        var data = JSON.parse(json);
        return data[platform];
    }
}
/*				EQUIVALENTFAUST.JS

    HELPER FUNCTIONS TO CREATE FAUST EQUIVALENT EXPRESSION FROM A PATCH

    FIRST PART --> DERECURSIVIZE THE PATCH
    SECOND PART --> CREATE THE FAUST EQUIVALENT FROM THE "DERECURSIVIZED" PATCH
*/
/// <reference path="Scenes/SceneClass.ts"/>
/// <reference path="Modules/ModuleClass.ts"/>
/// <reference path="Connect.ts"/>
class ModuleTree {
}
class EquivalentFaust {
    isModuleRecursiveExisting(moduleTree) {
        if (Utilitary.recursiveMap[moduleTree.patchID])
            return true;
        return false;
    }
    giveIdToModules(scene) {
        var modules = scene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].patchID = String(i + 1);
        }
    }
    treatRecursiveModule(moduleTree) {
        // 	Save recursion in map and flag it
        var ModuleToReplace = this.getFirstOccurenceOfModuleInCourse(moduleTree);
        Utilitary.recursiveMap[moduleTree.patchID] = ModuleToReplace;
        ModuleToReplace.recursiveFlag = true;
    }
    getFirstOccurenceOfModuleInCourse(moduleTree) {
        for (var i = 0; i < moduleTree.course.length; i++) {
            if (moduleTree.patchID == moduleTree.course[i].patchID) {
                return moduleTree.course[i];
            }
        }
        return null;
    }
    createTree(module, parent) {
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
    }
    /********************************************************************
    ***********************  CREATE FAUST EQUIVALENT ********************
    ********************************************************************/
    //*** The faust equivalent of a scene is calculated following these rules:
    //*** The tree starting from the output Module is computed (tree 1)
    //*** Then if there are unconnected output Modules, there Modules are computed (tree 2, ..., n)
    //*** All trees are composed in parallel
    //*** Every Faust Expression is "Stereoized" before composition with other expressions to ensure composability
    // Computing a Module is computing its entries and merging them in the Module's own faust code.
    computeModule(module) {
        var moduleInputs = module.moduleInputs;
        var faustResult = "";
        // Iterate on input Modules to compute them
        if (moduleInputs && moduleInputs.length != 0) {
            var inputCode = "";
            for (var i = 0; i < moduleInputs.length; i++) {
                if (moduleInputs[i]) {
                    if (moduleInputs[i].sourceCode && moduleInputs[i].sourceCode.length > 0) {
                        if (i != 0) {
                            inputCode += ",";
                        }
                        inputCode += this.computeModule(moduleInputs[i]);
                    }
                }
            }
            if (inputCode != "") {
                if (module.recursiveFlag) {
                    faustResult += "(" + inputCode + ":> ";
                }
                else {
                    faustResult += inputCode + ":> ";
                }
            }
        }
        var ModuleCode = module.sourceCode;
        if (module.recursiveFlag) {
            faustResult += "stereoize(environment{" + ModuleCode + "}.process))~(_,_)";
        }
        else {
            faustResult += "stereoize(environment{" + ModuleCode + "}.process)";
        }
        return faustResult;
    }
    // Computing the trees unconnected to the output
    connectUnconnectedModules(faustModuleList, output) {
        for (var i in faustModuleList) {
            var outputNode = faustModuleList[i].moduleView.getOutputNode();
            if (faustModuleList[i].moduleFaust.fName != "input" && outputNode && (!faustModuleList[i].moduleFaust.getOutputConnections || !faustModuleList[i].moduleFaust.getOutputConnections() || faustModuleList[i].moduleFaust.getOutputConnections().length == 0)) {
                var connector = new Connector();
                connector.createConnection(faustModuleList[i], faustModuleList[i].moduleView.getOutputNode(), output, output.moduleView.getInputNode());
            }
        }
    }
    //Calculate Faust Equivalent of the Scene
    getFaustEquivalent(scene, patchName) {
        var faustModuleList = scene.getModules();
        if (faustModuleList.length > 0) {
            var dest = scene.getAudioOutput();
            var src = scene.getAudioInput();
            if (src) {
                src.patchID = "input";
            }
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
        else {
            return null;
        }
    }
}
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
class ExportView {
    initExportView() {
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
        fwurl.value = "https://faustservice.grame.fr";
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
    }
}
/*				EXPORT.JS
    Handles Graphical elements for the Export Feature of the normal Playground

*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ExportView.ts"/>
/// <reference path="../Utilitary.ts"/>
/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/
class Export {
    constructor() {
        //------ Update Architectures with Plateform change
        this.updateArchitectures = () => {
            if (!this.clearSelectBox('architectures')) {
                return;
            }
            else {
                var data = JSON.parse(this.jsonText);
                var platformsSelect = document.getElementById('platforms'); //get the combobox
                var options = platformsSelect.options[platformsSelect.selectedIndex];
                var selPlatform = options.value;
                var dataCopy = data[selPlatform];
                var iterator = 0;
                for (var subData in dataCopy) {
                    if (iterator < dataCopy.length) {
                        var mainData = dataCopy[subData];
                        this.addItem('architectures', mainData);
                        iterator = iterator + 1;
                    }
                }
            }
        };
        //callback to get Target on server
        this.uploadTargets = () => {
            this.clearSelectBox('platforms');
            this.clearSelectBox('architectures');
            var input = document.getElementById("faustweburl");
            Export.exportUrl = input.value;
            Export.targetsUrl = Export.exportUrl + "/targets";
            Utilitary.getXHR(Export.targetsUrl, (json) => { this.uploadTargetCallback(json); }, (errorMessage) => { Utilitary.errorCallBack(errorMessage); });
        };
        /********************************************************************
        **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
        ********************************************************************/
        this.exportFaustCode = (shaKey) => {
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
            exportLib.sendPrecompileRequest(serverUrl, shaKey, platforme, architecture, appType, (serverUrl, shaKey, plateforme, architecture, appType) => { this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType); });
            // 	Delete existing content if existing
        };
        //set download QR Code and Button
        this.setDownloadOptions = (serverUrl, shaKey, plateforme, architecture, appType) => {
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
                this.exportView.downloadButton = linkDownload;
                this.exportView.downloadButton.onclick = () => { window.location.href = this.exportView.downloadButton.value; };
                document.getElementById("exportResultContainer").appendChild(disposableExportDiv);
                disposableExportDiv.appendChild(qrDiv);
                disposableExportDiv.appendChild(downloadBottomButtonContainer);
                this.exportView.exportButton.addEventListener("click", this.eventExport);
                this.exportView.exportButton.style.opacity = "1";
                Utilitary.removeLoadingLogo("exportResultContainer");
            }
            else {
                new Message(shaKey);
            }
            this.exportView.exportButton.addEventListener("click", this.eventExport);
            this.exportView.exportButton.style.opacity = "1";
            Utilitary.removeLoadingLogo("exportResultContainer");
        };
    }
    // Set EventListener
    setEventListeners() {
        this.exportView.refreshButton.onclick = () => { this.uploadTargets(); };
        this.exportView.selectPlatform.onchange = () => { this.updateArchitectures(); };
        this.exportView.inputServerUrl.onkeypress = (e) => { if (e.which == 13) {
            this.uploadTargets();
        } };
        this.eventExport = (event) => { this.exportPatch(event, this); };
        this.exportView.exportButton.addEventListener("click", this.eventExport);
        this.exportView.buttonNameApp.onclick = () => { this.renameScene(); };
        this.exportView.inputNameApp.onkeypress = (e) => { if (e.which == 13) {
            this.renameScene();
        } };
        this.exportView.moreOptionDiv.addEventListener("click", () => { this.exportView.moreOptionDiv.style.display = "none"; this.exportView.lessOptionDiv.style.display = this.exportView.optionContainer.style.display = "block"; }, false);
        this.exportView.lessOptionDiv.addEventListener("click", () => { this.exportView.moreOptionDiv.style.display = "block"; this.exportView.lessOptionDiv.style.display = this.exportView.optionContainer.style.display = "none"; }, false);
    }
    // add options into select boxes
    addItem(id, itemText) {
        var platformsSelect = document.getElementById(id);
        var option = document.createElement('option');
        option.text = itemText;
        platformsSelect.add(option);
    }
    //clear select boxes
    clearSelectBox(id) {
        if (document.getElementById(id) != undefined) {
            while (document.getElementById(id).childNodes.length > 0) {
                document.getElementById(id).removeChild(document.getElementById(id).childNodes[0]);
            }
            return true;
        }
        else {
            return false;
        }
    }
    //callback to refresh Target
    uploadTargetCallback(json) {
        this.jsonText = json;
        var data = JSON.parse(this.jsonText);
        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    }
    //set selection to default, currently android
    setDefaultSelect() {
        var platefromSelect = document.getElementById("platforms");
        var options = platefromSelect.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].textContent == "android") {
                platefromSelect.selectedIndex = i;
            }
        }
    }
    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/
    exportPatch(event, expor) {
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
    }
    removeQRCode() {
        var disposableExportDiv = document.getElementById('disposableExportDiv');
        if (disposableExportDiv) {
            disposableExportDiv.remove();
        }
    }
    renameScene() {
        Scene.rename(this.exportView.inputNameApp, this.exportView.rulesName, this.exportView.dynamicName);
    }
}
Export.exportUrl = "https://faustservice.grame.fr";
Export.targetsUrl = "https://faustservice.grame.fr/targets";
/*				PLAYGROUND.JS
    Init Normal Scene with all its graphical elements

    This is the unique scene of the Normal Playground
*/
/// <reference path="../Scenes/SceneClass.ts"/>
/// <reference path="../Menu/Export.ts"/>
class SceneView {
    initNormalScene(scene) {
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
    }
}
/*				SCENECLASS.JS
    HAND-MADE JAVASCRIPT CLASS CONTAINING THE API OF A GENERIC SCENE
*/
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/ModuleClass.ts"/>
/// <reference path="../Lib/webaudio-asm-worker-wrapper.d.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="SceneView.ts"/>
class Scene {
    constructor(identifiant, compileFaust, sceneView) {
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
        document.addEventListener("unstylenode", () => { this.unstyleNode(); });
    }
    getSceneContainer() { return this.sceneView.fSceneContainer; }
    /*********************** MUTE/UNMUTE SCENE ***************************/
    muteScene() {
        var out = document.getElementById("audioOutput");
        if (out != null) {
            if (out.audioNode.context.suspend != undefined) {
                out.audioNode.context.suspend();
                this.isMute = true;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker-mute.png)";
            }
        }
    }
    unmuteScene() {
        console.log("timeIn");
        window.setTimeout(() => { this.delayedUnmuteScene(); }, 500);
    }
    delayedUnmuteScene() {
        console.log("timeout");
        var out = document.getElementById("audioOutput");
        if (out != null) {
            if (out.audioNode.context.resume != undefined) {
                out.audioNode.context.resume();
                this.isMute = false;
                this.getAudioOutput().moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-speaker.png)";
            }
        }
    }
    //add listner on the output module to give the user the possibility to mute/onmute the scene
    addMuteOutputListner(moduleOutput) {
        moduleOutput.moduleView.fModuleContainer.ontouchstart = () => { this.dbleTouchOutput(); };
        moduleOutput.moduleView.fModuleContainer.ondblclick = () => { this.dispatchEventMuteUnmute(); };
    }
    //custom doubl touch event to mute
    dbleTouchOutput() {
        if (!this.isOutputTouch) {
            this.isOutputTouch = true;
            window.setTimeout(() => { this.isOutputTouch = false; }, 300);
        }
        else {
            this.dispatchEventMuteUnmute();
            this.isOutputTouch = false;
        }
    }
    dispatchEventMuteUnmute() {
        if (!this.isMute) {
            this.muteScene();
        }
        else {
            this.unmuteScene();
        }
    }
    /******************** HANDLE MODULES IN SCENE ************************/
    getModules() { return this.fModuleList; }
    addModule(module) { this.fModuleList.push(module); }
    removeModule(module) {
        this.fModuleList.splice(this.fModuleList.indexOf(module), 1);
    }
    /*******************************  PUBLIC METHODS  **********************************/
    integrateSceneInBody() {
        document.body.appendChild(this.sceneView.fSceneContainer);
    }
    /*************** ACTIONS ON AUDIO IN/OUTPUT ***************************/
    integrateInput() {
        var positionInput = this.positionInputModule();
        this.fAudioInput = new ModuleClass(Utilitary.idX++, positionInput.x, positionInput.y, "input", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module); }, this.compileFaust);
        this.fAudioInput.patchID = "input";
        var scene = this;
        this.compileFaust({ name: "input", sourceCode: "process=_,_;", x: positionInput.x, y: positionInput.y, callback: (factory) => { scene.integrateAudioInput(factory); } });
    }
    integrateOutput() {
        var positionOutput = this.positionOutputModule();
        var scene = this;
        this.fAudioOutput = new ModuleClass(Utilitary.idX++, positionOutput.x, positionOutput.y, "output", this.sceneView.inputOutputModuleContainer, (module) => { this.removeModule(module); }, this.compileFaust);
        this.fAudioOutput.patchID = "output";
        this.addMuteOutputListner(this.fAudioOutput);
        this.compileFaust({ name: "output", sourceCode: "process=_,_;", x: positionOutput.x, y: positionOutput.y, callback: (factory) => { scene.integrateAudioOutput(factory); } });
    }
    integrateAudioOutput(factory) {
        if (this.fAudioOutput) {
            this.fAudioOutput.moduleFaust.setSource("process=_,_;");
            var moduleFaust = this;
            this.fAudioOutput.createDSP(factory, function () {
                moduleFaust.activateAudioOutput(moduleFaust.fAudioOutput);
                moduleFaust.fAudioOutput.addInputOutputNodes();
                moduleFaust.integrateInput();
            });
        }
    }
    integrateAudioInput(factory) {
        if (this.fAudioInput) {
            this.fAudioInput.moduleFaust.setSource("process=_,_;");
            var moduleFaust = this;
            this.fAudioInput.createDSP(factory, function () {
                moduleFaust.activateAudioInput();
                moduleFaust.fAudioInput.addInputOutputNodes();
                Utilitary.hideFullPageLoading();
                moduleFaust.isInitLoading = false;
            });
        }
    }
    getAudioOutput() { return this.fAudioOutput; }
    getAudioInput() { return this.fAudioInput; }
    /********************************************************************
**********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
********************************************************************/
    activateAudioInput() {
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } })
            .then((mediaStream) => {
            this.getDevice(mediaStream);
            console.log("audio track has settings:", mediaStream.getAudioTracks()[0].getSettings());
        }).catch((err) => {
            console.error(err);
            this.fAudioInput.moduleView.fInterfaceContainer.style.backgroundImage = "url(img/ico-micro-mute.png)";
            this.fAudioInput.moduleView.fInterfaceContainer.title = Utilitary.messageRessource.errorGettingAudioInput;
            new Message(Utilitary.messageRessource.errorGettingAudioInput);
        });
    }
    getDevice(device) {
        // Create an AudioNode from the stream.
        var src = document.getElementById("input");
        src.audioNode = Utilitary.audioContext.createMediaStreamSource(device);
        document.body.appendChild(src);
        var connect = new Connector();
        connect.connectInput(this.fAudioInput, src);
    }
    activateAudioOutput(sceneOutput) {
        var out = document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = Utilitary.audioContext.destination;
        document.body.appendChild(out);
        var connect = new Connector();
        connect.connectOutput(sceneOutput, out);
    }
    /*********************** SAVE/RECALL SCENE ***************************/
    // use a collection of JsonSaveModule describing the scene and the modules to save it in a json string
    // isPrecompiled is used to save or not the asm.js code
    saveScene(isPrecompiled) {
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
                var params = this.fModuleList[i].moduleFaust.getDSP().getParams();
                var jsonParams = new JsonParamsSave();
                jsonParams.sliders = [];
                if (params) {
                    for (var j = 0; j < params.length; j++) {
                        var jsonSlider = new JsonSliderSave();
                        jsonSlider.path = params[j];
                        jsonSlider.value = this.fModuleList[i].moduleFaust.getDSP().getParamValue(params[j]);
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
                    jsonObject.factory.code_source = factorySave.code_source;
                    jsonObject.factory.helpers = factorySave.helpers;
                    jsonObject.factory.name_effect = factorySave.name_effect;
                    jsonObject.factory.code_effect = factorySave.code_effect;
                    jsonObject.factory.code_source_effect = factorySave.code_source_effect;
                    jsonObject.factory.helpers_effect = factorySave.helpers_effect;
                }
            }
        }
        json = JSON.stringify(jsonObjectCollection);
        return json;
    }
    //recall scene from json/jfaust fill arrayRecalScene with each JsonSaveModule
    recallScene(json) {
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
            this.launchModuleCreation();
        }
        else {
            Utilitary.hideFullPageLoading();
            new Message(Utilitary.messageRessource.errorLoading);
        }
    }
    // recall module at rank 0 of arrayRecalScene
    // direct use of the asm.js code if exist
    // or compile the faust code
    //
    // When arrayRecalScene empty, connect the modules in the scene
    launchModuleCreation() {
        if (this.arrayRecalScene.length != 0) {
            var jsonObject = this.arrayRecalScene[0];
            if (jsonObject.factory != undefined) {
                this.tempPatchId = jsonObject.patchId;
                faust.readDSPFactoryFromMachine(jsonObject.factory, (factory) => {
                    this.updateAppTempModuleInfo(jsonObject);
                    this.sceneName = jsonObject.sceneName;
                    this.createModule(factory);
                });
            }
            else if (jsonObject.patchId != "output" && jsonObject.patchId != "input") {
                this.tempPatchId = jsonObject.patchId;
                this.sceneName = jsonObject.sceneName;
                var argumentCompile = { name: jsonObject.name, sourceCode: jsonObject.code, x: parseFloat(jsonObject.x), y: parseFloat(jsonObject.y), callback: (factory) => { this.createModule(factory); } };
                this.compileFaust(argumentCompile);
            }
            else {
                this.arrayRecalScene.shift();
                this.launchModuleCreation();
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
    }
    //update temporary info for the module being created
    updateAppTempModuleInfo(jsonSaveObject) {
        this.tempModuleX = parseFloat(jsonSaveObject.x);
        this.tempModuleY = parseFloat(jsonSaveObject.y);
        this.tempModuleName = jsonSaveObject.name;
        this.tempModuleSourceCode = jsonSaveObject.code;
        this.tempPatchId = jsonSaveObject.patchId;
        this.tempParams = jsonSaveObject.params;
    }
    //create Module then remove corresponding JsonSaveModule from arrayRecalScene at rank 0
    //re-lunch module of following Module/JsonSaveModule
    createModule(factory) {
        try {
            if (!factory) {
                new Message(faust.getErrorMessage());
                Utilitary.hideFullPageLoading();
                return;
            }
            var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => { this.removeModule(module); }, this.compileFaust);
            module.moduleFaust.setSource(this.tempModuleSourceCode);
            module.createDSP(factory, () => {
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
                this.launchModuleCreation();
            });
        }
        catch (e) {
            new Message(Utilitary.messageRessource.errorCreateModuleRecall);
            this.arrayRecalScene.shift();
            this.launchModuleCreation();
        }
    }
    //recall of the accelerometer mapping parameters for each FaustInterfaceControler of the Module
    recallAccValues(jsonAccs, module) {
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
    }
    //connect Modules recalled
    connectModule(module) {
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
    }
    //use to identify the module to be connected to when recalling connections between modules
    getModuleByPatchId(patchId) {
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
    }
    //use to replace all éèàù ' from string and replace it with eeau__
    static cleanName(newName) {
        newName = Utilitary.replaceAll(newName, "é", "e");
        newName = Utilitary.replaceAll(newName, "è", "e");
        newName = Utilitary.replaceAll(newName, "à", "a");
        newName = Utilitary.replaceAll(newName, "ù", "u");
        newName = Utilitary.replaceAll(newName, " ", "_");
        newName = Utilitary.replaceAll(newName, "'", "_");
        return newName;
    }
    //check if string start only with letter (no accent)
    //and contains only letter (no accent) underscore and number for a lenght between 1 and 50 char
    static isNameValid(newName) {
        var pattern = new RegExp("^[a-zA-Z_][a-zA-Z_0-9]{1,50}$");
        if (pattern.test(newName)) {
            return true;
        }
        else {
            return false;
        }
    }
    //rename scene if format is correct and return true otherwise return false
    static rename(input, spanRule, spanDynamic) {
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
    }
    /***************** SET POSITION OF INPUT OUTPUT MODULE ***************/
    positionInputModule() {
        var position = new PositionModule();
        position.x = 10;
        position.y = window.innerHeight / 2;
        return position;
    }
    positionOutputModule() {
        var position = new PositionModule();
        position.x = window.innerWidth - 98;
        position.y = window.innerHeight / 2;
        return position;
    }
    positionDblTapModule() {
        var position = new PositionModule();
        position.x = window.innerWidth / 2;
        position.y = window.innerHeight / 2;
        return position;
    }
    /***************** Unstyle node connection of all modules on touchscreen  ***************/
    unstyleNode() {
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
    }
}
class JsonSaveCollection {
}
class JsonSaveModule {
}
class JsonOutputsSave {
}
class JsonInputsSave {
}
class JsonParamsSave {
}
class JsonAccSaves {
}
class JsonAccSave {
}
class JsonSliderSave {
}
class JsonFactorySave {
}
/// <reference path="Messages.ts"/>
//class ErrorFaust
class ErrorFaust {
    static errorCallBack(errorMessage) {
        new Message(errorMessage);
    }
}
//LibraryView.ts : LibraryView Class which contains all the graphical parts of the library
/// <reference path="../Utilitary.ts"/>
/// <reference path="../Lib/perfectScrollBar/js/perfect-ScrollBar.min.d.ts"/>
class LibraryView {
    initLibraryView() {
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
    }
}
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
class Library {
    constructor() {
        this.isSmaller = false;
        this.isDblTouch = false;
    }
    //get json with library infos
    fillLibrary() {
        var url = "faust-modules/index.json";
        Utilitary.getXHR(url, (json) => { this.fillLibraryCallBack(json); }, (errorMessage) => { Utilitary.errorCallBack(errorMessage); });
    }
    //dispatch library info to each submenu
    fillLibraryCallBack(json) {
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
    }
    //fill submenu and attach events
    fillSubMenu(options, subMenuId, stringStructureRemoved) {
        var subMenu = document.getElementById(subMenuId);
        for (var i = 0; i < options.length; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            li.appendChild(a);
            a.href = options[i];
            a.draggable = true;
            a.title = Utilitary.messageRessource.hoverLibraryElement;
            a.addEventListener("click", (e) => { e.preventDefault(); });
            var dblckickHandler = this.dispatchEventLibrary.bind(this, a.href);
            a.ondblclick = dblckickHandler;
            a.ontouchstart = (e) => { this.dbleTouchMenu(e); };
            a.text = this.cleanNameElement(options[i], stringStructureRemoved);
            subMenu.appendChild(li);
        }
    }
    //custom doube touch event handler
    dbleTouchMenu(touchEvent) {
        var anchor = touchEvent.target;
        if (!this.isLibraryTouch) {
            this.isLibraryTouch = true;
            this.previousTouchUrl = anchor.href;
            window.setTimeout(() => { this.isLibraryTouch = false; this.previousTouchUrl = ""; }, 300);
        }
        else if (anchor.href == this.previousTouchUrl) {
            Utilitary.showFullPageLoading();
            this.dispatchEventLibrary(anchor.href);
            this.isLibraryTouch = false;
        }
        else {
            this.isLibraryTouch = false;
        }
    }
    //dispatch custom double touch
    dispatchEventLibrary(url) {
        var event = new CustomEvent("dbltouchlib", { 'detail': url });
        document.dispatchEvent(event);
    }
    // init scroll to show scroll from perfectScroll.js
    initScroll() {
        this.libraryView.effetLibrarySelect.scrollTop += 1;
        this.libraryView.exempleLibrarySelect.scrollTop += 1;
        this.libraryView.intrumentLibrarySelect.scrollTop += 1;
    }
    //remove .dsp extention and uri from element to get title
    cleanNameElement(elementComplete, stringStructureRemoved) {
        return elementComplete.replace(stringStructureRemoved, "").replace(".dsp", "");
    }
}
//HelpView.ts: HelpView class contains the graphical structure of the help menu.
class HelpView {
    initHelpView() {
        var helpContainer = document.createElement("div");
        helpContainer.id = "helpContent";
        helpContainer.className = "helpContent";
        var videoContainer = document.createElement("div");
        videoContainer.id = "videoContainer";
        this.videoContainer = videoContainer;
        helpContainer.appendChild(videoContainer);
        return helpContainer;
    }
}
//Help.ts : Help class, that controle behaviour of the help panel.
/// <reference path="HelpView.ts"/>
class Help {
    stopVideo() {
        //this.helpView.videoIframe.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    }
}
/// <reference path="../Utilitary.ts"/>
class LoadView {
    initLoadView() {
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
    }
}
/// <reference path="../DriveAPI.ts"/>
/// <reference path="LoadView.ts"/>
class Load {
    //Set event listener
    setEventListeners() {
        this.loadView.loadFileButton.addEventListener("click", () => { this.openFile(); });
        this.loadView.buttonLoadLocal.addEventListener("click", () => { this.localLoad(); });
        this.loadView.buttonLoadCloud.addEventListener("click", () => { this.cloudLoad(); });
        this.loadView.buttonConnectDrive.addEventListener("click", (e) => { this.drive.handleAuthClick(e); });
        this.loadView.aBigExemple.addEventListener("click", (e) => { this.getEx(e); });
        this.loadView.aLightExemple.addEventListener("click", (e) => { this.getEx(e); });
        this.loadView.aBigPreExemple.addEventListener("click", (e) => { this.getEx(e); });
        this.loadView.aLightPreExemple.addEventListener("click", (e) => { this.getEx(e); });
        this.loadView.buttonChangeAccount.addEventListener("click", (e) => { this.logOut(); });
    }
    //open file from browser dialogue open window
    openFile() {
        if (this.loadView.loadFileInput.files.length > 0) {
            var file = this.loadView.loadFileInput.files.item(0);
            var event = new CustomEvent("fileload", { 'detail': file });
            document.dispatchEvent(event);
        }
    }
    //set item from local storage 'item_key' key
    getStorageItemValue(item_key, key) {
        if (localStorage.getItem(item_key)) {
            var item_value = JSON.parse(localStorage.getItem(item_key));
            var item_index = item_value.findIndex((obj => obj[0] === key));
            return (item_index >= 0) ? item_value[item_index][1] : null;
        }
        else {
            return null;
        }
    }
    //load scene from local storage
    localLoad() {
        if (this.loadView.existingSceneSelect.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.existingSceneSelect.options[this.loadView.existingSceneSelect.selectedIndex];
            var name = option.value;
            this.sceneCurrent.recallScene(this.getStorageItemValue('FaustPlayground', name));
        }
    }
    //load exemple
    getEx(e) {
        e.preventDefault();
        var anchorTarget = e.target;
        Utilitary.getXHR(anchorTarget.href, (json) => { this.loadEx(json); }, null);
    }
    loadEx(json) {
        Utilitary.showFullPageLoading();
        this.sceneCurrent.recallScene(json);
    }
    //load file scene from cloud Drive API
    //get id file from Drive API then is able to get content
    cloudLoad() {
        if (this.loadView.cloudSelectFile.selectedIndex > -1) {
            Utilitary.showFullPageLoading();
            var option = this.loadView.cloudSelectFile.options[this.loadView.cloudSelectFile.selectedIndex];
            var id = option.value;
            var file = this.drive.getFile(id, (resp) => { this.getContent(resp); });
            console.log(file);
        }
    }
    // get content from file loaded from cloud
    getContent(resp) {
        this.drive.downloadFile(resp, (json) => { this.sceneCurrent.recallScene(json); });
    }
    //logOut from google account
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }
}
/// <reference path="../Utilitary.ts"/>
class SaveView {
    initSaveView() {
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
    }
}
/// <reference path="../Lib/fileSaver.min.d.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="../Utilitary.ts"/>
/// <reference path="../DriveAPI.ts"/>
/// <reference path="SaveView.ts"/>
class Save {
    setEventListeners() {
        this.saveView.buttonDownloadApp.addEventListener("click", () => { this.downloadApp(); });
        this.saveView.buttonLocalSave.addEventListener("click", () => { this.saveLocal(); });
        this.saveView.buttonLocalSuppr.addEventListener("click", () => { this.supprLocal(); });
        this.saveView.existingSceneSelect.addEventListener("change", () => { this.getNameSelected(); });
        this.saveView.cloudSelectFile.addEventListener("change", () => { this.getNameSelectedCloud(); });
        this.saveView.buttonConnectDrive.addEventListener("click", (e) => { this.drive.handleAuthClick(e); });
        this.saveView.buttonChangeAccount.addEventListener("click", () => { this.logOut(); });
        this.saveView.buttonSaveCloud.addEventListener("click", () => { this.saveCloud(); });
        this.saveView.buttonCloudSuppr.addEventListener("click", () => { this.supprCloud(); });
        document.addEventListener("successave", () => { new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500); });
    }
    //create a file jfaust and save it to the device
    downloadApp() {
        if (this.saveView.inputDownload.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputDownload, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var jsonScene = this.sceneCurrent.saveScene(this.saveView.checkBoxPrecompile.checked);
            var blob = new Blob([jsonScene], {
                type: "application/json;charset=utf-8;",
            });
            saveAs(blob, Utilitary.currentScene.sceneName + ".jfaust");
        }
    }
    //set [key, value] in local storage item_key key
    setStorageItemValue(item_key, key, value) {
        var item_value;
        if (localStorage.getItem(item_key)) {
            item_value = JSON.parse(localStorage.getItem(item_key));
        }
        else {
            item_value = [];
        }
        // Possibly update an existing 'key'
        var item_index = item_value.findIndex((obj => obj[0] === key));
        if (item_index >= 0) {
            item_value[item_index][1] = value;
            // Otherwise push a new [key, value]
        }
        else {
            item_value.push([key, value]);
        }
        localStorage.setItem(item_key, JSON.stringify(item_value));
    }
    //save scene in local storage
    saveLocal() {
        if (this.saveView.inputLocalStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputLocalStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            if (typeof sessionStorage != 'undefined') {
                var name = this.saveView.inputLocalStorage.value;
                var jsonScene = this.sceneCurrent.saveScene(true);
                if (this.isFileExisting(name)) {
                    new Confirm(Utilitary.messageRessource.confirmReplace, (callback) => { this.replaceSaveLocal(name, jsonScene, callback); });
                    return;
                }
                else {
                    this.setStorageItemValue('FaustPlayground', name, jsonScene);
                }
                new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
                var event = new CustomEvent("updatelist");
                document.dispatchEvent(event);
            }
            else {
                new Message(Utilitary.messageRessource.errorLocalStorage);
            }
        }
    }
    //replace an existing scene in local Storage
    replaceSaveLocal(name, jsonScene, confirmCallBack) {
        this.setStorageItemValue('FaustPlayground', name, jsonScene);
        new Message(Utilitary.messageRessource.sucessSave, "messageTransitionOutFast", 2000, 500);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        confirmCallBack();
    }
    //check if a scene name already exist in local storage
    isFileExisting(name) {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == name) {
                return true;
            }
        }
        return false;
    }
    //check if a scene name already exist in Cloud
    isFileCloudExisting(name) {
        for (var i = 0; i < this.saveView.cloudSelectFile.options.length; i++) {
            if (this.saveView.cloudSelectFile.options[i].textContent == name) {
                return true;
            }
        }
        return false;
    }
    // get scene name selected in select local storage and set it to the input text localStorage
    getNameSelected() {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        this.saveView.inputLocalStorage.value = option.value;
    }
    // get scene name selected in select cloud and set it to the input text clou
    getNameSelectedCloud() {
        this.saveView.inputCloudStorage.value = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex].textContent;
    }
    //get value of select option by its text content, used here to get id of drive file
    getValueByTextContent(select, name) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent == name) {
                var option = select.options[i];
                return option.value;
            }
        }
        return null;
    }
    //suppr scene from local storage confirm
    supprLocal() {
        if (this.saveView.existingSceneSelect.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, (callbackConfirm) => { this.supprLocalCallback(callbackConfirm); });
        }
    }
    //suppr scene from local storage callback
    supprLocalCallback(callbackConfirm) {
        var option = this.saveView.existingSceneSelect.options[this.saveView.existingSceneSelect.selectedIndex];
        var name = option.value;
        localStorage.removeItem(name);
        var event = new CustomEvent("updatelist");
        document.dispatchEvent(event);
        callbackConfirm();
    }
    //logOut from google account
    logOut() {
        var event = new CustomEvent("authoff");
        document.dispatchEvent(event);
    }
    // save scene in the cloud, create a jfaust file
    saveCloud() {
        if (this.saveView.inputCloudStorage.value != Utilitary.currentScene.sceneName && !Scene.rename(this.saveView.inputCloudStorage, this.saveView.rulesName, this.saveView.dynamicName)) {
        }
        else {
            var name = this.saveView.inputCloudStorage.value;
            if (this.isFileCloudExisting(name)) {
                new Confirm(Utilitary.messageRessource.confirmReplace, (confirmCallback) => { this.replaceCloud(name, confirmCallback); });
                return;
            }
            else {
                var jsonScene = this.sceneCurrent.saveScene(true);
                var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
                this.drive.tempBlob = blob;
                this.drive.createFile(Utilitary.currentScene.sceneName, null);
            }
        }
    }
    //update/replace a scene on the cloud
    replaceCloud(name, confirmCallback) {
        var jsonScene = this.sceneCurrent.saveScene(true);
        var blob = new Blob([jsonScene], { type: "application/json;charset=utf-8;" });
        this.drive.tempBlob = blob;
        var id = this.getValueByTextContent(this.saveView.cloudSelectFile, name);
        if (id != null) {
            this.drive.getFile(id, () => {
                this.drive.updateFile(id, this.drive.lastSavedFileMetadata, blob, null);
            });
        }
        confirmCallback();
    }
    //trash a file in the cloud confirm
    //could be retreive from the cloud's trash can
    supprCloud() {
        if (this.saveView.cloudSelectFile.selectedIndex > -1) {
            new Confirm(Utilitary.messageRessource.confirmSuppr, (confirmCallBack) => { this.supprCloudCallback(confirmCallBack); });
        }
    }
    //trash a file in the cloud callback
    supprCloudCallback(confirmCallBack) {
        var option = this.saveView.cloudSelectFile.options[this.saveView.cloudSelectFile.selectedIndex];
        var id = option.value;
        this.drive.trashFile(id);
        confirmCallBack();
    }
}
/// <reference path="../Utilitary.ts"/>
class AccelerometerEditView {
    constructor() { }
    initAccelerometerEdit() {
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
    }
}
//AccelerometerEdit
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
class AccelerometerEdit {
    constructor(accelerometerEditView) {
        this.isOn = false;
        this.accelerometerEditView = accelerometerEditView;
        this.eventEditHandler = (event, faustIControler) => { this.editEvent(faustIControler, event); };
        this.accelerometerEditView.cancelButton.addEventListener("click", () => { this.cancelAccelerometerEdit(); });
        this.accelerometerEditView.validButton.addEventListener("click", () => { this.applyAccelerometerEdit(); });
        this.accelerometerEditView.radioAxisX.addEventListener("change", (event) => { this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisY.addEventListener("change", (event) => { this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxisZ.addEventListener("change", (event) => { this.radioAxisSplit(event); });
        this.accelerometerEditView.radioAxis0.addEventListener("change", (event) => { this.disablerEnablerAcc(event); });
        this.accelerometerEditView.radioCurve1.addEventListener("change", (event) => { this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve2.addEventListener("change", (event) => { this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve3.addEventListener("change", (event) => { this.radioCurveSplit(event); });
        this.accelerometerEditView.radioCurve4.addEventListener("change", (event) => { this.radioCurveSplit(event); });
        this.accelerometerEditView.checkeOnOff.addEventListener("change", (event) => { this.accelerometerEventSwitch(event); });
        this.accelerometerEditView.rangeVirtual.addEventListener("input", (event) => { this.virtualAccelerometer(event); });
        this.accelerometerEditView.rangeMin.addEventListener("input", (event) => { this.accMin(); });
        this.accelerometerEditView.rangeMid.addEventListener("input", (event) => { this.accMid(); });
        this.accelerometerEditView.rangeMax.addEventListener("input", (event) => { this.accMax(); });
    }
    //function used when starting or stoping editing mode
    //setting sider with event to edit it
    editAction() {
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
    }
    //set the slider to disable or enable according to acc isActive and isDisable
    setSliderDisableValue(faustIControler) {
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
    }
    //event handler when click/touch slider in edit mode
    editEvent(faustIControler, event) {
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
    }
    //cloning the slider edited to preview it
    addCloneSlider(faustIControler) {
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
    }
    //remove clone/preview slider
    removeCloneSlider(faustIControler) {
        var faustView = faustIControler.faustInterfaceView;
        this.accelerometerEditView.cloneContainer.removeChild(this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0]);
        faustView.slider = this.originalSlider;
        faustView.output = this.originalValueOutput;
        this.accelerometerEditView.container.getElementsByTagName("h6")[0].remove();
    }
    //cancel editing mode, and not applying changes
    cancelAccelerometerEdit() {
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
    }
    applyAccelerometerEdit() {
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
    }
    //disable or enable slider according to isActive and isEnable
    applyDisableEnableAcc() {
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
    }
    //Place graphical element of the editing view
    placeElement() {
        this.accelerometerEditView.blockLayer.style.display = "block";
        this.accelerometerEditView.blockLayer.style.height = window.innerHeight + "px";
        this.accelerometerEditView.rangeContainer.style.top = window.innerHeight / 1.8 + "px";
        this.accelerometerEditView.cloneContainer.style.top = window.innerHeight / 7 + "px";
        this.accelerometerEditView.checkeOnOffContainer.style.top = window.innerHeight / 8 + "px";
        this.accelerometerEditView.radioAxisContainer.style.top = window.innerHeight / 12 + "px";
        this.accelerometerEditView.radioCurveContainer.style.top = window.innerHeight / 25 + "px";
    }
    //store original values of the controller being edited
    storeAccelerometerSliderInfos(faustIControler) {
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
    }
    //check or uncheck the checkbox for enabling/disabling the acc on the app
    applyAccEnableDisable(accSlider) {
        if (accSlider.isEnabled) {
            this.accelerometerEditView.radioAxis0.checked = false;
        }
        else {
            this.accelerometerEditView.radioAxis0.checked = true;
        }
    }
    //check or uncheck the checkbox for enabling/disabling the acc on the app and faust code
    //applying styling accordingly
    disablerEnablerAcc(e) {
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
    }
    //set curve to the good radio button curve
    selectDefaultCurve(accSlider) {
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
    }
    //set axis to the good radio button axis
    selectDefaultAxis(accSlider) {
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
    }
    //set values to the minimum acc range
    applyRangeMinValues(accSlider) {
        this.accelerometerEditView.rangeMin.min = "-20";
        this.accelerometerEditView.rangeMin.max = "20";
        this.accelerometerEditView.rangeMin.step = "0.1";
        this.accelerometerEditView.rangeMin.value = String(accSlider.amin);
    }
    //set values to the middle acc range
    applyRangeMidValues(accSlider) {
        this.accelerometerEditView.rangeMid.min = "-20";
        this.accelerometerEditView.rangeMid.max = "20";
        this.accelerometerEditView.rangeMid.step = "0.1";
        this.accelerometerEditView.rangeMid.value = String(accSlider.amid);
    }
    //set values to the maximum acc range
    applyRangeMaxValues(accSlider) {
        this.accelerometerEditView.rangeMax.min = "-20";
        this.accelerometerEditView.rangeMax.max = "20";
        this.accelerometerEditView.rangeMax.step = "0.1";
        this.accelerometerEditView.rangeMax.value = String(accSlider.amax);
    }
    //set values to the virtual range
    applyRangeVirtualValues(accSlider) {
        this.accelerometerEditView.rangeVirtual.min = "-20";
        this.accelerometerEditView.rangeVirtual.max = "20";
        this.accelerometerEditView.rangeVirtual.value = "0";
        this.accelerometerEditView.rangeVirtual.step = "0.1";
    }
    //set values to the accelerometer range
    //create a faustInterfaceControler and register it to the AccelerometerHandler
    applyRangeCurrentValues(accSlider) {
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
    }
    //copy params of the accSlider
    copyParamsAccSlider(accSlider) {
        this.accParams = {
            isEnabled: accSlider.isEnabled,
            acc: accSlider.acc,
            address: accSlider.address,
            min: accSlider.min,
            max: accSlider.max,
            init: accSlider.init,
            label: accSlider.label
        };
    }
    // split edited acc axis according the radio axis selection
    radioAxisSplit(event) {
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
    }
    // split edited acc curve according the radio curve selection
    radioCurveSplit(event) {
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
    }
    //apply new axis value the the AccelerometerSlider
    editAxis(axe) {
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.remove(Axis[this.accSlid.axis]);
        this.accelerometerEditView.cloneContainer.getElementsByTagName("div")[0].classList.add(Axis[axe]);
        var oldAxis = this.accSlid.axis;
        this.accSlid.axis = axe;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        var faustView = AccelerometerHandler.faustInterfaceControlerEdit.faustInterfaceView;
        editAcc.axis = axe;
        faustView.slider.parentElement.classList.remove(Axis[oldAxis]);
        faustView.slider.parentElement.classList.add(Axis[editAcc.axis]);
    }
    //apply new curve value the the AccelerometerSlider
    editCurve(curve) {
        this.accSlid.curve = curve;
        var editAcc = AccelerometerHandler.faustInterfaceControlerEdit.accelerometerSlider;
        editAcc.curve = curve;
        AccelerometerHandler.curveSplitter(this.accSlid);
        this.applyValuetoFaust();
    }
    //event handler to switch isActive
    accelerometerEventSwitch(event) {
        this.accelerometerSwitch(this.accelerometerEditView.checkeOnOff.checked);
    }
    //change isActive of AccelerometerSlider
    accelerometerSwitch(isSliderActive) {
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
    }
    //apply value of virtual Accelerometer when it's use//
    //disable acc if enabled
    virtualAccelerometer(event) {
        if (this.accelerometerEditView.checkeOnOff.checked == true) {
            this.accelerometerEditView.checkeOnOff.checked = false;
            this.accelerometerSwitch(false);
            this.accSlid.isActive = false;
        }
        this.applyValuetoFaust();
    }
    //apply change to AccelerometerSlider from min slider
    accMin() {
        this.accSlid.amin = parseFloat(this.accelerometerEditView.rangeMin.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    }
    //apply change to AccelerometerSlider from mid slider
    accMid() {
        this.accSlid.amid = parseFloat(this.accelerometerEditView.rangeMid.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    }
    //apply change to AccelerometerSlider from max slider
    accMax() {
        this.accSlid.amax = parseFloat(this.accelerometerEditView.rangeMax.value);
        this.accSlid.converter.setMappingValues(this.accSlid.amin, this.accSlid.amid, this.accSlid.amax, this.accSlid.min, this.accSlid.init, this.accSlid.max);
        this.applyValuetoFaust();
    }
    //apply values changes to the AccelerometerSlider
    applyValuetoFaust() {
        var rangeVal = parseFloat(this.accelerometerEditView.rangeVirtual.value);
        Utilitary.accHandler.axisSplitter(this.accSlid, rangeVal, rangeVal, rangeVal, Utilitary.accHandler.applyNewValueToModule);
    }
}
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
class Menu {
    constructor(htmlContainer) {
        this.isMenuDriveLoading = false;
        this.currentMenuChoices = MenuChoices.null;
        this.isFullScreen = false;
        this.isAccelerometer = Utilitary.isAccelerometerOn;
        //create and init menu view wich gone create and init all sub menus views
        this.menuView = new MenuView();
        this.menuView.init(htmlContainer);
        //add Event Listeners
        this.menuView.libraryButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.library); };
        this.menuView.exportButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.export); };
        this.menuView.helpButtonMenu.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.help); };
        this.menuView.editButtonMenu.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.edit); });
        this.menuView.closeButton.onclick = () => { this.menuHandler(this.newMenuChoices = MenuChoices.null); };
        this.menuView.saveButton.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.save); });
        this.menuView.loadButton.addEventListener("click", () => { this.menuHandler(this.newMenuChoices = MenuChoices.load); });
        this.menuView.fullScreenButton.addEventListener("click", () => { this.fullScreen(); });
        this.menuView.accButton.addEventListener("click", () => { this.accelerometer(); });
        this.menuView.cleanButton.addEventListener("click", () => { new Confirm(Utilitary.messageRessource.confirmEmptyScene, (callback) => { this.cleanScene(callback); }); });
        //add eventListern customs
        document.addEventListener("updatename", (e) => { this.updatePatchNameToInput(e); });
        document.addEventListener("codeeditevent", () => { this.customeCodeEditEvent(); });
        document.addEventListener("updatelist", () => { this.updateSelectLocalEvent(); });
        document.addEventListener("authon", () => { this.authOn(); });
        document.addEventListener("authoff", () => { this.authOff(); });
        document.addEventListener("fillselect", (optionEvent) => { this.fillSelectCloud(optionEvent); });
        document.addEventListener("updatecloudselect", () => { this.updateSelectCloudEvent(); });
        document.addEventListener("startloaddrive", () => { this.startLoadingDrive(); });
        document.addEventListener("finishloaddrive", () => { this.finishLoadingDrive(); });
        document.addEventListener("clouderror", (e) => { this.connectionProblem(e); });
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
    menuHandler(newMenuChoices) {
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
    }
    //manage the library display
    libraryMenu() {
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
    }
    //manage the load display
    loadMenu() {
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
    }
    //manage the export display
    exportMenu() {
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
    }
    //manage the save display
    saveMenu() {
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
    }
    //manage the help display
    helpMenu() {
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
    }
    //manage the accelerometerEdit mode and display
    editMenu() {
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
    }
    //Close the menu
    closeMenu() {
        for (var i = 0; i < this.menuView.HTMLElementsMenu.length; i++) {
            this.menuView.HTMLElementsMenu[i].style.display = "none";
        }
        this.menuView.contentsMenu.style.display = "none";
        this.currentMenuChoices = MenuChoices.null;
    }
    //hide all elements currently displayed in the menu
    cleanMenu() {
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
    }
    //update all element that display the scene name
    updatePatchNameToInput(e) {
        this.menuView.patchNameScene.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.exportView.inputNameApp.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.dynamicName.textContent = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputDownload.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputLocalStorage.value = Utilitary.currentScene.sceneName;
        this.menuView.saveView.inputCloudStorage.value = Utilitary.currentScene.sceneName;
        new Message(Utilitary.messageRessource.successRenameScene, "messageTransitionOutFast", 2000, 500);
    }
    //handle fullscreen mode
    fullScreen() {
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
    }
    //handle the enabing/disabling of all slider having a accelerometer
    accelerometer() {
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
            this.isAccelerometer = true;
            Utilitary.isAccelerometerOn = true;
            this.menuView.accButton.style.opacity = "1";
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
    }
    //removing all modules from the scene
    cleanScene(callBack) {
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
    }
    //close menu when editing a module's Faust code
    //the idea here is to disable the accelerometerEdit mode if enabled
    customeCodeEditEvent() {
        this.menuHandler(MenuChoices.null);
    }
    //refresh the select boxes of localstorage when adding or removing a saved scene
    updateSelectLocalEvent() {
        this.updateSelectLocal(this.menuView.loadView.existingSceneSelect);
        this.updateSelectLocal(this.menuView.saveView.existingSceneSelect);
    }
    //empty a selectBox
    clearSelect(select) {
        select.innerHTML = "";
    }
    //refresh a select box
    updateSelectLocal(select) {
        this.clearSelect(select);
        this.fillSelectLocal(select);
    }
    //get value of 'item_key'
    getStorageItem(item_key) {
        return (localStorage.getItem(item_key)) ? JSON.parse(localStorage.getItem(item_key)) : null;
    }
    //fill select box
    fillSelectLocal(select) {
        var fpg = this.getStorageItem('FaustPlayground');
        if (fpg) {
            for (var i = 0; i < fpg.length; i++) {
                var option = document.createElement("option");
                option.value = fpg[i][0];
                option.textContent = fpg[i][0];
                select.add(option);
            }
        }
    }
    //dispatch the current scene to the menus objects
    setMenuScene(scene) {
        this.sceneCurrent = scene;
        this.save.sceneCurrent = scene;
        this.load.sceneCurrent = scene;
    }
    //dispatch the drive API to the menus objects
    setDriveApi(drive) {
        this.drive = drive;
        this.save.drive = drive;
        this.load.drive = drive;
    }
    //show element from cloud Drive when logged on
    authOn() {
        this.load.loadView.cloudSelectFile.style.display = "block";
        this.save.saveView.cloudSelectFile.style.display = "block";
        this.load.loadView.buttonChangeAccount.style.display = "block";
        this.save.saveView.buttonChangeAccount.style.display = "block";
        this.load.loadView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonConnectDrive.style.display = "none";
        this.save.saveView.buttonCloudSuppr.style.display = "block";
        this.save.saveView.inputCloudStorage.style.display = "block";
    }
    //show element from cloud Drive when logged out
    authOff() {
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
    }
    //display Drive Connection error
    connectionProblem(event) {
        new Message(Utilitary.messageRessource.errorConnectionCloud + " : " + event.detail);
    }
    fillSelectCloud(optionEvent) {
        this.load.loadView.cloudSelectFile.add(optionEvent.detail);
        var optionSave = optionEvent.detail.cloneNode(true);
        this.save.saveView.cloudSelectFile.add(optionSave);
    }
    updateSelectCloudEvent() {
        this.clearSelect(this.load.loadView.cloudSelectFile);
        this.clearSelect(this.save.saveView.cloudSelectFile);
        this.drive.updateConnection();
    }
    startLoadingDrive() {
        if (!this.isMenuDriveLoading) {
            this.isMenuDriveLoading = true;
            this.save.saveView.driveContainer.style.display = "none";
            this.load.loadView.driveContainer.style.display = "none";
            Utilitary.addLoadingLogo("loadCloudContainer");
            Utilitary.addLoadingLogo("cloudSaveContainer");
        }
    }
    finishLoadingDrive() {
        if (this.isMenuDriveLoading) {
            this.isMenuDriveLoading = false;
            this.save.saveView.driveContainer.style.display = "block";
            this.load.loadView.driveContainer.style.display = "block";
            Utilitary.removeLoadingLogo("loadCloudContainer");
            Utilitary.removeLoadingLogo("cloudSaveContainer");
        }
    }
}
//MenuView.ts : MenuView Class which contains all the graphical parts of the menu
/// <reference path="../Accelerometer.ts"/>
/// <reference path="AccelerometerEditView.ts"/>
/// <reference path="LoadView.ts"/>
/// <reference path="SaveView.ts"/>
class MenuView {
    constructor() {
        this.HTMLElementsMenu = [];
        this.HTMLButtonsMenu = [];
        this.menuColorDefault = "rgba(227, 64, 80, 0.73)";
        this.menuColorSelected = "rgb(209, 64, 80)";
    }
    init(htmlContainer) {
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
    }
}
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
class App {
    createAllScenes() {
        var sceneView = new SceneView();
        Utilitary.currentScene = new Scene("Normal", this.compileFaust, sceneView);
        this.setGeneralAppListener(this);
    }
    createMenu() {
        this.menu = new Menu(document.getElementsByTagName('body')[0]);
        //pass the scene to the menu to allow it to access the scene
        this.menu.setMenuScene(Utilitary.currentScene);
        //add eventlistener on the scene to hide menu when clicked or touched
        Utilitary.currentScene.getSceneContainer().addEventListener("mousedown", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null;
                this.menu.menuHandler(this.menu.newMenuChoices);
            }
        }, true);
        Utilitary.currentScene.getSceneContainer().addEventListener("touchstart", () => {
            if (!this.menu.accEdit.isOn) {
                this.menu.newMenuChoices = MenuChoices.null;
                this.menu.menuHandler(this.menu.newMenuChoices);
            }
        }, true);
    }
    //create div to append messages and confirms
    createDialogue() {
        var dialogue = document.createElement("div");
        dialogue.id = "dialogue";
        document.getElementsByTagName("body")[0].appendChild(dialogue);
    }
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    compileFaust(compileFaust) {
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
        var libpath = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + "/faustlibraries/";
        var args = ["-I", libpath, "-ftz", "2"];
        //try to create the wasm code/factory with the given Faust code. Then callback to function passing the factory.
        try {
            this.factory = faust.createDSPFactory(compileFaust.sourceCode, args, (factory) => { compileFaust.callback(factory); });
        }
        catch (error) {
            new Message(error);
        }
        if (currentScene) {
            currentScene.unmuteScene();
        }
        ;
    }
    //create Module, set the source faust code to its moduleFaust, set the faust interface , add the input output connection nodes
    //
    createModule(factory) {
        if (!factory) {
            new Message(Utilitary.messageRessource.errorFactory + faust.getErrorMessage());
            Utilitary.hideFullPageLoading();
            return;
        }
        var module = new ModuleClass(Utilitary.idX++, this.tempModuleX, this.tempModuleY, this.tempModuleName, document.getElementById("modules"), (module) => { Utilitary.currentScene.removeModule(module); }, this.compileFaust);
        module.moduleFaust.setSource(this.tempModuleSourceCode);
        module.createDSP(factory, () => {
            module.setFaustInterfaceControles();
            module.createFaustInterface();
            module.addInputOutputNodes();
            //set listener to recompile when dropping faust code on the module
            if (this.tempModuleName != "input" && this.tempModuleName != "output") {
                module.moduleView.fModuleContainer.ondrop = (e) => {
                    e.stopPropagation();
                    this.styleOnDragEnd();
                    this.uploadOn(this, module, 0, 0, e);
                };
            }
            module.moduleView.fModuleContainer.ondragover = () => {
                module.moduleView.fModuleContainer.style.opacity = "1";
                module.moduleView.fModuleContainer.style.boxShadow = "0 0 40px rgb(255, 0, 0)";
            };
            module.moduleView.fModuleContainer.ondragleave = () => {
                module.moduleView.fModuleContainer.style.opacity = "0.5";
                module.moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
            };
            // the current scene add the module and hide the loading page
            Utilitary.currentScene.addModule(module);
            if (!Utilitary.currentScene.isInitLoading) {
                Utilitary.hideFullPageLoading();
            }
        });
    }
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- custom event to load file from the load menu with the file explorer
    //Init drag and drop reactions, scroll event and body resize event to resize svg element size,
    // add custom double touch event to load dsp from the library menu
    setGeneralAppListener(app) {
        //custom event to load file from the load menu with the file explorer
        document.addEventListener("fileload", (e) => { this.loadFileEvent(e); });
        //All drog and drop events
        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        document.ondragstart = () => { this.styleOnDragStart(); };
        document.ondragenter = (e) => {
            var srcElement = e.srcElement;
            if (srcElement.className != null && srcElement.className == "node-button") {
            }
            else {
                this.styleOnDragStart();
            }
        };
        document.ondragleave = (e) => {
            var elementTarget = e.target;
            if (elementTarget.id == "svgCanvas") {
                //alert("svg")
                this.styleOnDragEnd();
                e.stopPropagation();
                e.preventDefault();
            }
        };
        //scroll event to check the size of the document
        document.onscroll = () => {
            this.checkRealWindowSize();
        };
        //resize event
        var body = document.getElementsByTagName("body")[0];
        body.onresize = () => { this.checkRealWindowSize(); };
        window.ondrop = (e) => {
            this.styleOnDragEnd();
            var x = e.clientX;
            var y = e.clientY;
            this.uploadOn(this, null, x, y, e);
        };
        //custom double touch from library menu to load an effect or an intrument.
        document.addEventListener("dbltouchlib", (e) => { this.dblTouchUpload(e); });
    }
    //-- Upload content dropped on the page and allocate the content to the right function
    uploadOn(app, module, x, y, e) {
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
    }
    //used for Url pointing at a dsp file
    uploadUrl(app, module, x, y, url) {
        var filename = url.toString().split('/').pop();
        filename = filename.toString().split('.').shift();
        Utilitary.getXHR(url, (codeFaust) => {
            var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + codeFaust + "}.process);";
            if (module == null) {
                app.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: (factory) => { app.createModule(factory); } });
            }
            else {
                module.update(filename, dsp_code);
            }
        }, Utilitary.errorCallBack);
    }
    // used for dsp code faust
    uploadCodeFaust(app, module, x, y, e, dsp_code) {
        dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
        if (!module) {
            app.compileFaust({ name: "TEXT", sourceCode: dsp_code, x: x, y: y, callback: (factory) => { app.createModule(factory); } });
        }
        else {
            module.update("TEXT", dsp_code);
        }
    }
    //used for File containing code faust or jfaust/json scene descriptor get the file then pass it to loadFile()
    uploadFileFaust(app, module, x, y, e, dsp_code) {
        var files = e.dataTransfer.files;
        var file = files[0];
        this.loadFile(file, module, x, y);
    }
    //Load file dsp or jfaust
    loadFile(file, module, x, y) {
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
        reader.onloadend = (e) => {
            dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";
            if (!module && type == "dsp") {
                this.compileFaust({ name: filename, sourceCode: dsp_code, x: x, y: y, callback: (factory) => { this.createModule(factory); } });
            }
            else if (type == "dsp") {
                module.update(filename, dsp_code);
            }
            else if (type == "json") {
                Utilitary.currentScene.recallScene(reader.result);
            }
        };
    }
    //used when a custom event from loading file with the browser dialogue
    loadFileEvent(e) {
        Utilitary.showFullPageLoading();
        var file = e.detail;
        var position = Utilitary.currentScene.positionDblTapModule();
        this.loadFile(file, null, position.x, position.y);
    }
    //used with the library double touch custom event
    dblTouchUpload(e) {
        Utilitary.showFullPageLoading();
        var position = Utilitary.currentScene.positionDblTapModule();
        this.uploadUrl(this, null, position.x, position.y, e.detail);
    }
    ////////////////////////////// design on drag or drop //////////////////////////////////////
    // manage style during a drag and drop event
    styleOnDragStart() {
        this.menu.menuView.menuContainer.style.opacity = "0.5";
        this.menu.menuView.menuContainer.classList.add("no_pointer");
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "block";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "0 0 200px #00f inset";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "0.5";
        }
    }
    styleOnDragEnd() {
        this.menu.menuView.menuContainer.classList.remove("no_pointer");
        this.menu.menuView.menuContainer.style.opacity = "1";
        Utilitary.currentScene.sceneView.dropElementScene.style.display = "none";
        Utilitary.currentScene.getSceneContainer().style.boxShadow = "none";
        var modules = Utilitary.currentScene.getModules();
        for (var i = 0; i < modules.length; i++) {
            modules[i].moduleView.fModuleContainer.style.opacity = "1";
            modules[i].moduleView.fModuleContainer.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.4)";
        }
    }
    //manage the window size
    checkRealWindowSize() {
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
    }
    errorCallBack(message) { }
}
/*				MAIN.JS
    Entry point of the Program
    intefaces used through the app
*/
/// <reference path="App.ts"/>
/// <reference path="Messages.ts"/>
// init is call by libfaust-wasm.js load end handler
//initialization af the app, create app and ressource to get text with correct localization
//then resumeInit on callback when text is loaded
function init() {
    console.log("FaustPlayground: version 1.0.0");
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
    window.addEventListener("error", (e) => {
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
    else if (source.start) {
        source.start();
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
    else if (source.start) {
        source.start();
    }
    window.removeEventListener('touchstart', IosInit2, false);
}
