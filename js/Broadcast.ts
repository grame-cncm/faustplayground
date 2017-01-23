/// <reference path="Lib/webrtc/MediaStream.d.ts"/>
/// <reference path="Lib/webrtc/RTCPeerConnection.d.ts"/>
/// <reference path="Modules/Module.ts"/>

class Broadcast {
    private app: App;
    private players: Players;
    private ws: WebSocket;

    constructor(app: App) {
        console.info('Broadcast constructor');
        this.app = app;
        this.players = app.players;
        this.players.setSendFunc((msg: WSMessage) => this.send(msg));


        var wsurl: string = ((location.protocol === 'http:') ? 'ws://' : 'wss://') +
                            /https?:\/\/([^#]*)/.exec(location.href)[1] +
                            'websocket';
        this.ws = new WebSocket(wsurl);
        this.ws.addEventListener('message', (msg) => this.onWsMessage(msg));
    }

    send(msg: WSMessage) {
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING :
                // message will be sent when WebSocket opened.
                this.ws.addEventListener('open',
                    () => this.send(msg));
                break;
            case WebSocket.OPEN :
                this.ws.send(msg.toJSON());
                console.log('sent:', msg);
                break;
            default :
                console.error('Unable to send message with a websocket at this status:',
                    this.ws.readyState,
                    msg);
        }
    }

    // dispatch incomming message to
    // appropriate method "onXXXX(WSMessage)"
    private onWsMessage(msg) {
        var wsmsg = WSMessage.fromJSON(msg.data);
        console.log('received:', wsmsg);
        var cb = this['on' + wsmsg.type];
        if (cb)
            cb.apply(this, [wsmsg]);
        else
            console.warn('"on' + wsmsg.type + '" not implemented.');
    }

    // a player is created on offer received
    private onOffer(msg: WSMessage) {
        // this.players.updatePlayerOffer(msg);
        this.players.me.createAnswer(msg, this.app.getRTCConfiguration());
    }

    // ICE candidates that follow an offer are stored
    // on the corresponding player instance.
    // So the player can be used later.
    private onICECandidate(msg: WSMessage) {
        this.players.me.addICECandidate(msg);
        // var player: Player = this.players.getPlayer(msg.from);
        // player.addICECandidate(new RTCIceCandidate(msg.payload));
    }


    // a player leaves the session
    private onDisconnected(msg: WSMessage) {
        this.players.onPlayerDisconnected(msg);
    }

    private onWhoami(msg: WSMessage) {
        console.info('I am:', msg.payload);
        this.players.createMePlayer(msg);
    }

    private onAnswer(msg: WSMessage) {
        this.players.me.applyAnswer(msg);
        // this.pc.setRemoteDescription(msg.payload).then(
        //     () => console.log('youpi !'),
        //     () => console.error('hé m****…')
        // );
    }

    private onSetNickname(msg: WSMessage) {
        this.players.updatePlayerNickname(msg);
    }

    private onRequestNewOffer(msg: WSMessage) {
        // this.createOffer();
    }

    private onPlayerGetOnStage(msg: WSMessage) {
        var player = this.players.getPlayer(msg.payload);
        player.removeMenuItem();
    }

    private sendAnswer(evt: CustomEvent){
        this.send(new WSMessage('Answer',
                                undefined,
                                evt.detail.to,
                                evt.detail.desc));
    }

    private sendNickname() {
        this.send(new WSMessage('SetNickname',
                                undefined,
                                undefined,
                                sessionStorage.getItem('nickname')));
    }
}


class WSMessage {
    type: string;
    from: string;
    to: string;
    payload: any;

    constructor(type: string, from?: string, to?:string, payload?: any) {
        this.type = type;
        this.from = from;
        this.to = to;
        this.payload = payload;
    }

    toJSON(): string {
        var payload = (payload && this.payload.hasOwnProperty('toJSON')) ?
                       this.payload.toJSON() :
                       JSON.stringify(this.payload);
        return JSON.stringify({
            type: this.type,
            from: this.from,
            to: this.to,
            payload: payload
        })
    }

    static fromJSON(json: string): WSMessage {
        var msg: any = JSON.parse(json);
        return new WSMessage(msg.type, msg.from, msg.to, JSON.parse(msg.payload));
    }
}
