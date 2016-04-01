class Message {
    messageView: MessageView
    messageViewContainer: HTMLDivElement;
    timeoutHide: any;
    timeoutRemove: any;
    removeEventHandler: any;
    constructor(message: string) {
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = (e) => { this.removeMessage(e) };
        this.messageView.closeButton.addEventListener("click", this.removeEventHandler);

        document.getElementById("dialogue").appendChild(this.messageViewContainer);
        this.timeoutHide=setTimeout(() => { this.hideMessage() }, 10000);
        setTimeout(() => { this.displayMessage() }, 500);

        this.messageViewContainer.addEventListener("click", (e) => { this.clearTimeouts(e) });
    }
    displayMessage() {
        this.messageViewContainer.classList.remove("messageHide")
        this.messageViewContainer.classList.add("messageShow")
        this.messageViewContainer.classList.add("messageTransitionIn")
        this.messageViewContainer.classList.remove("messageTransitionOut")


    }
    hideMessage() {
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn")
            this.messageViewContainer.classList.add("messageTransitionOut")
            this.messageViewContainer.classList.add("messageHide")
            this.messageViewContainer.classList.remove("messageShow")
            //this.messageViewContainer.removeEventListener("click", this.removeEventHandler);
            this.timeoutRemove=setTimeout(() => { this.removeMessage() }, 4000);
        }
    }
    removeMessage(e?: Event) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.remove()
            delete this.messageViewContainer;
        }
    }
    clearTimeouts(e: Event) {
        e.stopPropagation();
        e.preventDefault();
        clearTimeout(this.timeoutHide);
        if (this.timeoutRemove != undefined) {
            clearTimeout(this.timeoutRemove)
        }

        this.displayMessage() 
    }
}
class MessageView {
    closeButton: HTMLElement
    message: HTMLElement

    constructor() {
        

    }
    init(): HTMLDivElement {

        var messageContainer = document.createElement("div");
        messageContainer.className = "messageContainer messageHide messageTransitionIn";

        

        var closeButton: HTMLElement = document.createElement("div")
        closeButton.id = "closeButton";
        this.closeButton = closeButton;


        var message = document.createElement("div");
        message.className = "message";
        this.message = message;

        messageContainer.appendChild(closeButton);
        messageContainer.appendChild(message);

        return messageContainer
    }
}