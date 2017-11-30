//Contain Message, MessageView, Confirm, Confirm view class

class Message {
    messageView: MessageView
    messageViewContainer: HTMLDivElement;
    isTouch: boolean = false;
    timeoutHide: any;
    timeoutRemove: any;
    removeEventHandler: any;
    fadeOutType: string = "messageTransitionOut";
    duration: number = 10000;
    delay: number = 4000;

    //Message show up and set a time out, if nothing happen, it remove it self
    //if one click, it stays, if double click it's removed (also the close button works)
    //fadeOutType can be eather null or "messageTransitionOutFast", to have new animation create new rules css

    constructor(message: string, fadeOutType?: string, duration?:number, delay?: number) {
        this.messageView = new MessageView();
        this.messageViewContainer = this.messageView.init();
        this.messageView.message.textContent = message;
        this.removeEventHandler = (e) => { this.removeMessage(e) };
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
        this.timeoutHide = setTimeout(() => { this.hideMessage() }, this.duration);
        setTimeout(() => { this.displayMessage() }, 500);
        document.addEventListener("messagedbltouch", () => { this.removeEventHandler() });
        this.messageViewContainer.addEventListener("click", (e) => { this.clearTimeouts(e) });
        this.messageViewContainer.addEventListener("click", () => { this.dbleTouchMessage() });
        this.messageViewContainer.addEventListener("dblclick", () => { this.removeEventHandler() });
    }

    displayMessage() {
        this.messageViewContainer.classList.remove("messageHide")
        this.messageViewContainer.classList.add("messageShow")
        this.messageViewContainer.classList.add("messageTransitionIn")
        this.messageViewContainer.classList.remove(this.fadeOutType)
    }

    hideMessage() {
        if (this.messageViewContainer != undefined) {
            this.messageViewContainer.classList.remove("messageTransitionIn")
            this.messageViewContainer.classList.add(this.fadeOutType)
            this.messageViewContainer.classList.add("messageHide")
            this.messageViewContainer.classList.remove("messageShow")
            this.timeoutRemove = setTimeout(() => { this.removeMessage() }, this.delay);
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

    dbleTouchMessage() {
        if (!this.isTouch) {
            this.isTouch = true;
            window.setTimeout(() => { this.isTouch = false }, 300)
        } else {
            this.dispatchEventCloseDblTouch();
            this.isTouch = false;
        }
    }

    dispatchEventCloseDblTouch() {
        var event = new CustomEvent("messagedbltouch")
        document.dispatchEvent(event);
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

    constructor() {}
    
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

// take message text and callback as parmater
//if validate, the callback is used, other with the confirm is removed
class Confirm{
    confirmView: ConfirmView
    confirmViewContainer: HTMLElement;
    constructor(message: string, callback: (confirmCallback) => void) {
        this.confirmView = new ConfirmView();
        this.confirmViewContainer = this.confirmView.init();
        this.confirmView.message.textContent = message;
        document.getElementById("dialogue").appendChild(this.confirmViewContainer);
        this.displayMessage();
        this.confirmView.validButton.addEventListener("click", () => { callback(() => { this.removeMessage() }) });
        this.confirmView.cancelButton.addEventListener("click", () => { this.removeMessage() })
    }
    displayMessage() {
        this.confirmViewContainer.classList.remove("messageHide")
        this.confirmViewContainer.classList.add("messageShow")

    }
    removeMessage(e?: Event) {
        if (e != undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.confirmViewContainer != undefined) {
            this.confirmViewContainer.remove()
            delete this.confirmViewContainer;
        }
    }
}
class ConfirmView {

    message: HTMLElement
    validButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;

    constructor() {}
    
    init(): HTMLDivElement {

        var messageContainer = document.createElement("div");
        messageContainer.className = "messageContainer messageHide";

        var message = document.createElement("div");
        message.className = "message";
        this.message = message;

        var validContainer = document.createElement("div")
        validContainer.className = "validConfirmContainer";

        var validButton = document.createElement("button");
        validButton.id = "validButton";
        validButton.className = "accButton";
        this.validButton = validButton;

        var cancelButton = document.createElement("button")
        cancelButton.id = "cancelButton";
        cancelButton.className = "accButton";
        this.cancelButton = cancelButton;

        validContainer.appendChild(cancelButton);
        validContainer.appendChild(validButton);

        messageContainer.appendChild(message);
        messageContainer.appendChild(validContainer);

        return messageContainer
    }
}