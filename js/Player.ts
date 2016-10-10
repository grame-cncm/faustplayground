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
    send: (msg: WSMessage) => void;

    constructor(ident:string, offer: RTCSessionDescription, send: (msg: WSMessage) => void) {
        this.ident = ident;
        this.offer = offer;
        this.send = send;
        this.icecandidates = new Array<RTCIceCandidate>();
    }

    replyToOffer(onstream: (stream: MediaStream) => void) {
        this.pc = new RTCPeerConnection(null, {optional:[]});
        this.pc.onicecandidate = (event: RTCIceCandidateEvent) => this.onicecandidate(event);
        this.pc.onaddstream = (e: RTCMediaStreamEvent) => onstream(e.stream);

        this.pc.setRemoteDescription(this.offer).then(
            () => this.pc.createAnswer().then(
                (answerdesc: RTCSessionDescription) => this.gotAnswerDescription(answerdesc),
                (e) => console.error('enable to create answer:', e)),
            (e) => console.error('enable to set remote description:', e));
        for(let i=0 ; i<this.icecandidates.length ; i++) {
            this.pc.addIceCandidate(this.icecandidates[i]).then(
                () => console.log('ice yeah'),
                () => console.log('ice m****…')
            );
        }
    }

    private onicecandidate(event: RTCIceCandidateEvent) {
        console.log('receiver candidate:', event.candidate);
    }

    private gotAnswerDescription(answerdesc: RTCSessionDescription) {
        this.pc.setLocalDescription(answerdesc);
        this.send(new WSMessage('Answer', undefined, this.ident, answerdesc));
    }

    //private dispatchAnswer(desc: RTCSessionDescription) {
    //    document.dispatchEvent(new CustomEvent('Answer',
    //                                           {detail: {desc: desc.toJSON(),
    //                                                     to: this.ident}}));
    //}
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
        //document.addEventListener('Offer', (evt) => this.onOffer(<CustomEvent>evt));
        //document.addEventListener('ICECandidate', (evt) => this.onICECandidate(<CustomEvent>evt));
        //document.addEventListener('Byebye', (evt) => this.onByebye(<CustomEvent>evt));
    }

    addPlayerFromOffer(msg: WSMessage, send: (msg: WSMessage) => void) {
        var player: Player = new Player(msg.from,
                                        new RTCSessionDescription(msg.payload),
                                        send);
        this.index[msg.from] = player;
        document.dispatchEvent(
            new CustomEvent('PlayerAdded', {detail:player})
        );
    }

    //onICECandidate(evt: CustomEvent) {
    //    var player: Player = this.index[evt.detail.from];
    //    player.icecandidates.push(new RTCIceCandidate(evt.detail.icecandidate));
    //}

    removePlayer(msg: WSMessage) {
        var indent: string = msg.from;
        var player: Player = this.index[indent];
        delete this.index[indent];
        document.dispatchEvent(
            new CustomEvent('PlayerRemoved', {detail:player})
        );
    }

    getPlayer(id: string): Player {
        return this.index[id];
    }
}

interface HTMLMediaElementNG extends HTMLMediaElement {
    srcObject: MediaStream
}

class PlayerModule extends Module {

    constructor(id: number,
                x: number,
                y: number,
                name: string,
                container: HTMLElement,
                removeModuleCallBack: (m: Module) => void,
                compileFaust: (compileFaust: CompileFaust) => void,
                audioContext: AudioContext,
                player: Player) {
        super(id, x, y, 'player', container, removeModuleCallBack, compileFaust, audioContext);
        player.replyToOffer((stream: MediaStream) => this.connectStream(stream));
    }

    drawInterface(id: number, x:number, y:number, name:string, container: HTMLElement) {
        this.moduleView = new PlayerModuleView(id, x, y, name, container);
    }

    private connectStream(stream: MediaStream) {
        var msasn: MediaStreamAudioSourceNode = this.audioContext.createMediaStreamSource(stream);
        var ctor: Connector = new Connector();
        ctor.connectInput(this, msasn);
        //msasn.connect(this.audioContext.destination);
        //var haudio: HTMLMediaElementNG = <HTMLMediaElementNG>(d3.select(this.moduleView.fModuleContainer)
        //.append('audio')
        //.attr('autoplay', '')
        //.attr('control', '')
        //.node());
        //haudio.srcObject = stream;
    }
}

class PlayerModuleView extends ModuleView {

    constructExtras(ID: number, name:string, fModuleContainer: HTMLElement) {

    }
}
