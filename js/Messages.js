var Message = (function () {
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
            //this.messageViewContainer.removeEventListener("click", this.removeEventHandler);
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
