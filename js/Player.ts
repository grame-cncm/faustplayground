/// <reference path="Broadcast.ts"/>
/// <reference path="Modules/Module.ts"/>
/// <reference path="Lib/d3/d3.d.ts"/>

class PlayerMenuItem {
    player: Player;
    element: HTMLElement;

    constructor(player: Player, container: HTMLElement){
        this.player = player;

        this.element = <HTMLElement>(d3.select(container)
            .append('li').node());
        d3.select(this.element)
            .attr('draggable', true)
            .attr('data-ddtype', 'player')
            .attr('class', 'draggable')
            .append('a')
            .attr('href', player.ident)
            .attr('draggable', false)
            .text(player.nickname);
    }

    refresh() {
        d3.select(this.element)
            .select('a')
            .text(this.player.nickname);
    }
}

class Player {
    offer: RTCSessionDescription;
    icecandidates: Array<RTCIceCandidate>;
    ident: string;
    nickname: string;
    pc: RTCPeerConnection;
    send: (msg: WSMessage) => void;
    menuitem: PlayerMenuItem;
    module: PlayerModule;

    constructor(ident:string, send: (msg: WSMessage) => void) {
        this.ident = ident;
        this.nickname = ident;
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

    updateOffer(offer: RTCSessionDescription) {
        this.offer = offer;
    }

    updateNickname(nickname: string) {
        this.nickname = nickname;
        this.menuitem.refresh();
    }
}

interface IPlayerIndex {
    [index: string]: Player;
}

class Players {
    private app: App;
    private index: IPlayerIndex;
    private send: (msg: WSMessage) => void;

    constructor(app: App){
        this.app = app;
        this.index = {} as IPlayerIndex;
    }

    setSendFunc(send: (msg: WSMessage) => void) {
        this.send = send;
    }

    updatePlayerOffer(msg: WSMessage) {
        var player: Player = this.getOrCreatePlayer(msg.from);
        player.updateOffer(new RTCSessionDescription(msg.payload));
    }

    removePlayer(msg: WSMessage) {
        var indent: string = msg.from;
        var player: Player = this.index[indent];
        delete this.index[indent];
        this.app.menu.menuView.playersContent.removeChild(player.menuitem.element);
    }

    private getOrCreatePlayer(ident: string): Player {
        if (this.index[ident])
            return this.index[ident];

        var player: Player = new Player(ident, this.send);
        this.index[ident] = player;
        player.menuitem = new PlayerMenuItem(player,
                                             this.app.menu.menuView.playersContent);
        return player;
    }

    getPlayer(ident: string): Player {
        return this.index[ident];
    }

    updatePlayerNickname(msg: WSMessage) {
        var player: Player = this.getOrCreatePlayer(msg.from);
        player.updateNickname(msg.payload);
    }
}

interface HTMLMediaElementNG extends HTMLMediaElement {
    srcObject: MediaStream
}

class PlayerModule extends Module {
    private player: Player;

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
        this.player = player;
        player.replyToOffer((stream: MediaStream) => this.connectStream(stream));

        this.moduleView = new PlayerModuleView(id, x, y, name, container, this.player);
        this.addEvents();
    }

    drawInterface(id: number, x:number, y:number, name:string, container: HTMLElement){}

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
    private player: Player;

    constructor(ID: number, x: number, y: number, name: string, parent: HTMLElement, player: Player) {
        super(ID, x, y, name, parent);
        this.player = player;
        d3.select(this.fModuleContainer).select('h6.module-title').remove();
        d3.select(this.fModuleContainer)
            .select('div.content')
            .text(this.player.nickname);

        this.closeButton = <HTMLDivElement>(d3.select(this.fModuleContainer)
            .append('div')
            .attr('class', 'close')
            .attr('draggable', false)
            .node());
    }

    constructExtras(ID: number, name:string, container: HTMLElement) {}
}
