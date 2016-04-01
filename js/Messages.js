var Message = (function () {
    function Message(message) {
        var _this = this;
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = function (e) { _this.removeMessage(e); };
        this.messageView.closeButton.addEventListener("click", this.removeEventHandler);
        document.getElementById("dialogue").appendChild(this.messageViewContainer);
        this.timeoutHide = setTimeout(function () { _this.hideMessage(); }, 10000);
        setTimeout(function () { _this.displayMessage(); }, 500);
        this.messageViewContainer.addEventListener("click", function (e) { _this.clearTimeouts(e); });
    }
    Message.prototype.displayMessage = function () {
        this.messageViewContainer.classList.remove("messageHide");
        this.messageViewContainer.classList.add("messageShow");
        this.messageViewContainer.classList.add("messageTransitionIn");
        this.messageViewContainer.classList.remove("messageTransitionOut");
    };
    Message.prototype.hideMessage = function () {
        var _this = this;
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn");
            this.messageViewContainer.classList.add("messageTransitionOut");
            this.messageViewContainer.classList.add("messageHide");
            this.messageViewContainer.classList.remove("messageShow");
            //this.messageViewContainer.removeEventListener("click", this.removeEventHandler);
            this.timeoutRemove = setTimeout(function () { _this.removeMessage(); }, 4000);
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
//# sourceMappingURL=Messages.js.map