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

    private onOffer(msg: WSMessage) {
        var player = this.players.getPlayer(msg.from);
        this.players.me.createAnswer(msg, player, this.app.getRTCConfiguration());
    }

    private onICECandidate(msg: WSMessage) {
        this.players.me.addICECandidate(msg);
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
    }

    private onSetNickname(msg: WSMessage) {
        this.players.updatePlayerNickname(msg);
    }

    private onRequestOffer(msg: WSMessage) {
        this.players.me.createOfferFor(this.players.getPlayer(msg.from),
                                       this.players.getOutputStream(),
                                       this.app.getRTCConfiguration());
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
