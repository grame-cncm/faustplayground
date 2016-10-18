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
    private offer: RTCSessionDescription;
    private icecandidates: Array<RTCIceCandidate>;
    ident: string;
    nickname: string;
    private pc: RTCPeerConnection;
    private send: (msg: WSMessage) => void;
    private menuitem: PlayerMenuItem;
    private module: PlayerModule;

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

    addICECandidate(candidate: RTCIceCandidate) {
        this.icecandidates.push(candidate);
    }

    setMenuItem(menuitem: PlayerMenuItem) {
        this.menuitem = menuitem;
    }

    getMenuItem(): PlayerMenuItem {
        return this.menuitem;
    }

    setModule(module: PlayerModule) {
        this.module = module;
        d3.select(this.menuitem.element).remove();
        this.menuitem = undefined;
    }

    updateOffer(offer: RTCSessionDescription) {
        this.offer = offer;
    }

    updateNickname(nickname: string) {
        this.nickname = nickname;
        if (this.menuitem)
            this.menuitem.refresh();
        if (this.module)
            (<PlayerModuleView>this.module.moduleView).refresh();
    }

    notifyDisconnected() {
        this.ident = undefined;
        if (this.menuitem)
            d3.select(this.menuitem.element).remove();
        if (this.module)
            this.updateNickname(_('[disconnected]'));
    }

    isPeerConnected() {
        return this.ident;
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

    onPlayerDisconnected(msg: WSMessage) {
        var indent: string = msg.from;
        var player: Player = this.index[indent];
        delete this.index[indent];
        player.notifyDisconnected();
        //this.app.menu.menuView.playersContent.removeChild(
        //    player.getMenuItem().element);
    }

    private getOrCreatePlayer(ident: string): Player {
        if (this.index[ident]) {
            var player: Player = this.index[ident];
            if(!player.getMenuItem())
                player.setMenuItem(new PlayerMenuItem(player,
                                                      this.app.menu.menuView.playersContent));
            return player;
        }

        var player: Player = new Player(ident, this.send);
        this.index[ident] = player;
        player.setMenuItem(new PlayerMenuItem(player,
                                              this.app.menu.menuView.playersContent));
        return player;
    }

    getPlayer(ident: string): Player {
        return this.index[ident];
    }

    updatePlayerNickname(msg: WSMessage) {
        var player: Player = this.getOrCreatePlayer(msg.from);
        player.updateNickname(msg.payload);
    }

    onModulePlayerRemoved(player: Player) {
        if (player.isPeerConnected())
            this.send(new WSMessage('RequestNewOffer',
                                    undefined,
                                    player.ident,
                                    null));
    }

}

interface HTMLMediaElementNG extends HTMLMediaElement {
    srcObject: MediaStream
}

class PlayerModule extends Module {
    private player: Player;
    private msasn: MediaStreamAudioSourceNode;
    private ctor: Connector;

    constructor(id: number,
                x: number,
                y: number,
                name: string,
                container: HTMLElement,
                removeModuleCallBack: () => void,
                compileFaust: (compileFaust: CompileFaust) => void,
                audioContext: AudioContext,
                player: Player) {
        super(id, x, y, 'player', container, removeModuleCallBack, compileFaust, audioContext);
        this.ctor = new Connector();
        this.moduleView = new PlayerModuleView(id, x, y, name, container, player);
        this.rtcConnectPlayer(player);
        this.addEvents();
    }

    drawInterface(id: number, x:number, y:number, name:string, container: HTMLElement){}

    private connectStream(stream: MediaStream) {
        if (this.msasn)
            this.msasn.disconnect();
        this.msasn = this.audioContext.createMediaStreamSource(stream);
        this.ctor.connectInput(this, this.msasn);
    }

    rtcConnectPlayer(player: Player) {
        this.player = player;
        this.player.setModule(this);
        player.replyToOffer((stream: MediaStream) => this.connectStream(stream));
        (<PlayerModuleView>this.moduleView).refresh(player);
    }

    onremove(app: App) {
        this.msasn.disconnect();
        app.players.onModulePlayerRemoved(this.player);
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

    refresh(player?:Player) {
        if (player)
            this.player = player;
        d3.select(this.fModuleContainer)
            .select('div.content')
            .text(this.player.nickname);
    }
}
