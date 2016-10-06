/// <reference path="Broadcast.ts"/>
/// <reference path="Modules/Module.ts"/>

class PlayerMenuItem {
    player: Player;
    element: HTMLElement;

    constructor(player: Player){
        this.player = player;
        this.element = document.createElement('li');
        this.element.draggable = true;
        this.element.setAttribute('data-ddtype', 'player');
        this.element.classList.add('draggable');
        var a: HTMLAnchorElement = document.createElement('a');
        a.href = player.ident;
        a.draggable = false;
        a.innerText = player.ident;
        this.element.appendChild(a);
    }
}

class Player {
    offer: RTCSessionDescription;
    ident: string;

    constructor(ident:string, offer: RTCSessionDescription) {
        this.ident = ident;
        this.offer = offer;
    }
}

interface IPlayerIndex {
    [index: string]: Player;
}

class Players {
    team: Array<Player>;
    index: IPlayerIndex;

    constructor(){
        //this.team = new Array<Player>();
        this.index = {} as IPlayerIndex;
        document.addEventListener('Offer', (evt) => this.onOffer(<CustomEvent>evt));
        document.addEventListener('Byebye', (evt) => this.onByebye(<CustomEvent>evt));
    }

    onOffer(evt: CustomEvent) {
        var player: Player = new Player(evt.detail.from,
                                        new RTCSessionDescription(evt.detail.payload));
        //this.team.push(player);
        this.index[evt.detail.from] = player;
        document.dispatchEvent(
            new CustomEvent('NewPlayer', {detail:player})
        );
    }

    onByebye(evt: CustomEvent) {
        var indent: string = evt.detail.from;
        var player: Player = this.index[indent];
        delete this.index[indent];
        document.dispatchEvent(
            new CustomEvent('RemovePlayer', {detail:player})
        );
    }
}


class PlayerModule extends Module {

}
