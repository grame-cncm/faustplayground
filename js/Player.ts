/// <reference path="Broadcast.ts"/>

class PlayerMenuItem {
    element: HTMLElement;

    constructor(msg: WSMessage){
        this.element = document.createElement('div');
        this.element.innerText = msg.from;
    }
}
