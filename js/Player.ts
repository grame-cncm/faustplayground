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
            .text(player.nickname)
            .on('dblclick', () => (<Event>(d3.event)).preventDefault());
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


    createOfferFor(player:Player, stream: MediaStream, conf: RTCConfiguration, ) {
        this.pc = new RTCPeerConnection(conf);
        this.pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
            if (e.candidate) {
                console.log('createOfferFor ICE EVENT:', e);
                this.send(new WSMessage('ICECandidate', undefined, player.ident, e.candidate));
            }
        };
        this.pc.addStream(stream);
        this.pc.createOffer({voiceActivityDetection: false}).then(
            (desc: RTCSessionDescriptionInit) => {
                this.pc.setLocalDescription(desc).then(
                    () => this.send(new WSMessage('Offer', undefined, player.ident, desc))
                );
            }
        );
    }

    createAnswer(msg: WSMessage, conf: RTCConfiguration) {
        console.log('Je vais répondre à cette offre:', msg);
        this.pc = new RTCPeerConnection(conf);
        this.pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
            if (e.candidate) {
                console.log('createAnswer ICE EVENT:', e);
                this.send(new WSMessage('ICECandidate', undefined, msg.from, e.candidate));
            }
        };
        this.pc.setRemoteDescription(msg.payload).then(
            () => {
                console.log('setRemoteDescription ok');
                this.pc.createAnswer({voiceActivityDetection: false}).then(
                    (desc: RTCSessionDescriptionInit) => {
                        this.pc.setLocalDescription(desc).then(
                            () => this.send(new WSMessage('Answer', undefined, msg.from, desc))
                        )
                    }
                );
            },
            () => console.error('setRemoteDescription a échoué'),
        );
    }

    applyAnswer(msg: WSMessage) {
        this.pc.setRemoteDescription(msg.payload).then(
            () => console.log('Réponse reçu et prise en compte'),
            () => console.error("La réponse n'a pu être acceptée", msg)
        );
    }

    addICECandidate(msg: WSMessage) {
        this.pc.addIceCandidate(new RTCIceCandidate(msg.payload)).then(
            () => console.info('ICE candidate correctement ajouté'),
            () => console.error("ICE candidate n'a pas pu être ajouté", msg.payload)
        );
    }

    setMenuItem(menuitem: PlayerMenuItem) {
        this.menuitem = menuitem;
    }

    removeMenuItem() {
        d3.select(this.menuitem.element).remove();
        this.menuitem = undefined;
    }

    getMenuItem(): PlayerMenuItem {
        return this.menuitem;
    }

    setModule(module: PlayerModule) {
        this.module = module;
        this.removeMenuItem();
        this.send(new WSMessage('PlayerGetOnStage',
                                undefined,
                                undefined,
                                this.ident));
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
            this.removeMenuItem();
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
    private stream: MediaStream;
    me:Player;

    constructor(app: App){
        this.app = app;
        this.index = {} as IPlayerIndex;
    }

    setSendFunc(send: (msg: WSMessage) => void) {
        this.send = send;
    }

    setOutputStream(stream: MediaStream) {
        this.stream = stream;
    }

    // updatePlayerOffer(msg: WSMessage) {
    //     var player: Player = this.getOrCreatePlayer(msg.from);
    //     player.updateOffer(new RTCSessionDescription(msg.payload));
    // }

    onPlayerDisconnected(msg: WSMessage) {
        var indent: string = msg.from;
        var player: Player = this.index[indent];
        delete this.index[indent];
        player.notifyDisconnected();
        //this.app.menu.menuView.playersContent.removeChild(
        //    player.getMenuItem().element);
    }

    private getOrCreatePlayer(ident: string, no_ui:boolean=false): Player {
        if (this.index[ident]) {
            var player: Player = this.index[ident];
            if(!player.getMenuItem())
                player.setMenuItem(new PlayerMenuItem(player,
                                                      this.app.menu.menuView.playersContent));
            return player;
        }

        var player: Player = new Player(ident, this.send);
        this.index[ident] = player;
        if(!no_ui)
            player.setMenuItem(new PlayerMenuItem(player,
                                                  this.app.menu.menuView.playersContent));
        return player;
    }

    createMePlayer(msg: WSMessage) {
        console.log('createMePlayer');
        this.getNickname().then(
            (nickname:string)=> {
                this.me = this.getOrCreatePlayer(<string>msg.payload, true);
                this.send(new WSMessage('SetNickname', undefined, undefined, nickname));
                console.log('createMePlayer done.');
            }
        );
    }

    private getNickname(): Promise<string> {
        var nickname: string = sessionStorage.getItem('nickname');
        if (nickname)
            return Promise.resolve(nickname);

        var modal_wrapper = d3.select(document.body)
            .append('div')
            .attr('class', 'modal-wrapper');

        var modal_box = modal_wrapper
            .append('div')
            .attr('class', 'modal-box');

        var content = modal_box
            .append('div')
            .attr('class', 'content');

        content.append('h1')
            .text(_('Your nickname'));


        return new Promise<string>(
            (resolve, reject) => {
                var form = content.append('form')
                    .attr('action', '#')
                    .attr('autocomplete', 'off')
                    .on('submit',
                        () => {
                            var evt: Event = <Event>d3.event;
                            evt.preventDefault();
                            evt.stopPropagation();
                            sessionStorage.setItem('nickname',
                                (<HTMLInputElement>((<HTMLFormElement>(evt.target)).elements.namedItem('nickname'))).value);
                            resolve(sessionStorage.getItem('nickname'));
                            modal_wrapper.transition()
                                .style('opacity', '0')
                                .remove();
                        });

                form.append('input')
                    .attr('type', 'text')
                    .attr('name', 'nickname')
                    .attr('autofocus', 'autofocus');

                content.append('dl')
                    .append('dd')
                    .text(_('Please enter your nickname that other players will see.'));

                modal_box.transition()
                    .style('opacity', '1');
            }
        );
    }


    getPlayer(ident: string): Player {
        return this.index[ident];
    }

    updatePlayerNickname(msg: WSMessage) {
        var player: Player = this.getOrCreatePlayer(msg.from);
        player.updateNickname(msg.payload);
    }

    onModulePlayerRemoved(player: Player) {
        // if (player.isPeerConnected())
        //     this.send(new WSMessage('RequestNewOffer',
        //                             undefined,
        //                             player.ident,
        //                             null));
    }

    startRTCWith(player:Player) {
        this.me.createOfferFor(player, this.stream, this.app.getRTCConfiguration());
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
        // this.rtcConnectPlayer(player);
        this.player = player;
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
        // player.replyToOffer((stream: MediaStream) => this.connectStream(stream));
        (<PlayerModuleView>this.moduleView).refresh(player);
    }

    onremove(app: App) {
        // this.msasn.disconnect();
        // app.players.onModulePlayerRemoved(this.player);
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
