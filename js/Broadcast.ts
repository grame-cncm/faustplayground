/// <reference path="Lib/webrtc/MediaStream.d.ts"/>
/// <reference path="Lib/webrtc/RTCPeerConnection.d.ts"/>
/// <reference path="Modules/Module.ts"/>

class Broadcast {
    app: App;
    players: Players;
    pc: RTCPeerConnection;
    ws: WebSocket;
    ident: string;
    nickname: string;

    static offer_options = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
        voiceActivityDetection: false
    };

    constructor(app: App,
                stream: MediaStream,
                server=null,
                pc_constraints={optional:[]}) {
        this.app = app;
        this.players = app.players;
        this.pc = new RTCPeerConnection(server, pc_constraints);
        this.pc.onicecandidate = (event: RTCIceCandidateEvent) => this.iceCallback(event);
        this.pc.addStream(stream);
        this.pc.createOffer(Broadcast.offer_options).then(
            (desc: RTCSessionDescription) => this.announceOffer(desc),
            (error) => this.onCreateOfferError(error)
        );

        var wsurl: string = ((location.protocol === 'http:') ? 'ws://' : 'wss://') +
                            /https?:\/\/([^#]*)/.exec(location.href)[1] +
                            'websocket';
        this.ws = new WebSocket(wsurl);
        this.ws.addEventListener('message', (msg) => this.onWsMessage(msg));

        document.addEventListener('Answer', (e:Event) => this.sendAnswer(<CustomEvent>e));

        if (!localStorage.getItem('nickname'))
            this.askNickname();
    }

    askNickname() {
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

        var form = content.append('form')
            .attr('action', '#')
            .attr('autocomplete', 'off')
            .on('submit',
                () => {
                    var evt: Event = <Event>d3.event;
                    evt.preventDefault();
                    evt.stopPropagation();
                    localStorage.setItem('nickname',
                        (<HTMLInputElement>((<HTMLFormElement>(evt.target)).elements.namedItem('nickname'))).value);
                    this.send(new WSMessage('SetNickname',
                                            undefined,
                                            undefined,
                                            localStorage.getItem('nickname')));
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

    // me -> others
    private iceCallback(event: RTCIceCandidateEvent) {
        if(event.candidate) {
            this.send(new WSMessage('ICECandidate',
                                    undefined,
                                    undefined,
                                    event.candidate));
        }
    }

    // me -> others
    private announceOffer(desc: RTCSessionDescription) {
        // Set local descpription and then, send offer via websocket.
        this.pc.setLocalDescription(desc).then(
            () => this.send(new WSMessage('Offer', undefined, undefined, desc))
        );
    }

    private onCreateOfferError(error) {
        console.error('Offer error:', error);
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
        //var msg = JSON.parse(msg.data);
        //this['on'+msg['type']](msg['data']);
        //console.info(msg.data);
    }

    // a player is created on offer received
    private onOffer(msg: WSMessage) {
        this.players.addPlayerFromOffer(msg, (msg: WSMessage) => this.send(msg));
    }

    // ICE candidates that follow an offer are stored
    // on the corresponding player instance.
    // So the player can be used later.
    private onICECandidate(msg: WSMessage) {
        var player: Player = this.players.getPlayer(msg.from);
        player.icecandidates.push(new RTCIceCandidate(msg.payload));
    }


    // a player leaves the session
    private onByebye(msg: WSMessage) {
        this.players.removePlayer(msg);
    }

    private onWhoami(msg: WSMessage) {
        console.info('I am:', msg.payload);
        this.ident = msg.payload;
    }

    private onAnswer(msg: WSMessage) {
        this.pc.setRemoteDescription(msg.payload).then(
            () => console.log('youpi !'),
            () => console.error('hé m****…')
        );
    }

    private sendAnswer(evt: CustomEvent){
        this.send(new WSMessage('Answer',
                                undefined,
                                evt.detail.to,
                                evt.detail.desc));
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
        var payload = (this.payload.hasOwnProperty('toJSON')) ?
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
