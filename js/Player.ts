/// <reference path="Broadcast.ts"/>
/// <reference path="Modules/Module.ts"/>
/// <reference path="Lib/d3/d3.d.ts"/>

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
    icecandidates: Array<RTCIceCandidate>;
    ident: string;
    pc: RTCPeerConnection;

    constructor(ident:string, offer: RTCSessionDescription) {
        this.ident = ident;
        this.offer = offer;
        this.icecandidates = new Array<RTCIceCandidate>();
    }

    replyToOffer(onstream: (stream: MediaStream) => void) {
        this.pc = new RTCPeerConnection(null, {optional:[]});
        //this.pc.onicecandidate = (event: RTCIceCandidateEvent) => this.onicecandidate(event);
        this.pc.onaddstream = (e: RTCMediaStreamEvent) => onstream(e.stream);

        this.pc.setRemoteDescription(this.offer)
            .then(
                () => this.pc.createAnswer()
                .then((desc: RTCSessionDescription) => this.dispatchAnswer(desc))
        );
        for(let i=0 ; i<this.icecandidates.length ; i++) {
            this.pc.addIceCandidate(this.icecandidates[i]).then(
                () => console.log('ice yeah'),
                () => console.log('ice merde')
            );
        }
    }

    //private onicecandidate(event: RTCIceCandidateEvent) {
    //    console.log('receiver candidate:', event.candidate);
    //}

    private dispatchAnswer(desc: RTCSessionDescription) {
        document.dispatchEvent(new CustomEvent('Answer',
                                               {detail: {desc: desc.toJSON(),
                                                         to: this.ident}}));
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
        document.addEventListener('ICECandidate', (evt) => this.onICECandidate(<CustomEvent>evt));
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

    onICECandidate(evt: CustomEvent) {
        var player: Player = this.index[evt.detail.from];
        player.icecandidates.push(new RTCIceCandidate(evt.detail.icecandidate));
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

interface HTMLMediaElementNG extends HTMLMediaElement {
    srcObject: MediaStream
}

class PlayerModule {

    constructor(id: number, x: number, y:number, container: HTMLElement, player:Player) {
        var audio: HTMLMediaElementNG =
        <HTMLMediaElementNG>(
        d3.select(container)
        .append('div')
        .attr('class', 'moduleFaust')
        .style('width', '100px')
        .style('height', '100px')
        .style('left', x+'px')
        .style('top', y+'px')
        .append('audio')
        .attr('autoplay', '')
        .attr('controls', '')
        .node()
        )
        ;
        player.replyToOffer((stream: MediaStream) => audio.srcObject = stream);
    }
}
