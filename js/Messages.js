var Message = (function () {
    function Message(message) {
        var _this = this;
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = function () { _this.removeMessage(); };
        this.messageView.closeButton.addEventListener("click", this.removeEventHandler);
        document.getElementsByTagName("body")[0].appendChild(this.messageViewContainer);
        setTimeout(function () { _this.hideMessage(); }, 10000);
        setTimeout(function () { _this.displayMessage(); }, 500);
    }
    Message.prototype.displayMessage = function () {
        this.messageViewContainer.classList.toggle("messageHide");
        this.messageViewContainer.classList.toggle("messageShow");
    };
    Message.prototype.hideMessage = function () {
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn");
            this.messageViewContainer.classList.add("messageTransitionOut");
            this.messageViewContainer.classList.toggle("messageHide");
            this.messageViewContainer.classList.toggle("messageShow");
            this.messageViewContainer.removeEventListener("click", this.removeEventHandler);
            setTimeout(this.messageViewContainer.remove, 6000);
        }
    };
    Message.prototype.removeMessage = function () {
        this.messageViewContainer.remove();
        delete this.messageViewContainer;
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