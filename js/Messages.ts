class Message {
    messageView: MessageView
    messageViewContainer: HTMLDivElement;
    removeEventHandler: any;
    constructor(message: string) {
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = () => { this.removeMessage() };
        this.messageView.closeButton.addEventListener("click", this.removeEventHandler);

        document.getElementsByTagName("body")[0].appendChild(this.messageViewContainer);
        setTimeout(() => { this.hideMessage() }, 10000);
        setTimeout(() => { this.displayMessage() }, 500);
    }
    displayMessage() {
        this.messageViewContainer.classList.toggle("messageHide")
        this.messageViewContainer.classList.toggle("messageShow")


    }
    hideMessage() {
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn")
            this.messageViewContainer.classList.add("messageTransitionOut")
            this.messageViewContainer.classList.toggle("messageHide")
            this.messageViewContainer.classList.toggle("messageShow")
            this.messageViewContainer.removeEventListener("click", this.removeEventHandler);
            setTimeout(this.messageViewContainer.remove, 6000);
        }
    }
    removeMessage() {
        this.messageViewContainer.remove()
        delete this.messageViewContainer;
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