/// <reference path="Lib/webrtc/MediaStream.d.ts"/>
/// <reference path="Lib/webrtc/RTCPeerConnection.d.ts"/>
/// <reference path="Modules/Module.ts"/>

class Broadcast {
    pc: RTCPeerConnection;
    ws: WebSocket;
    wspeer: string;

    static offer_options = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
        voiceActivityDetection: false
    };

    constructor(stream: MediaStream,
                server=null,
                pc_constraints={optional:[]}) {
        this.pc = new RTCPeerConnection(server, pc_constraints);
        this.pc.onicecandidate = (event: RTCIceCandidateEvent) => this.iceCallback(event);
        this.pc.addStream(stream);
        this.pc.createOffer(Broadcast.offer_options).then(
            (desc) => this.announceOffer(desc),
            (error) => this.onCreateOfferError(error)
        );

        var wsurl: string = ((location.protocol === 'http:') ? 'ws://' : 'wss://') +
                            /https?:\/\/([^#]*)/.exec(location.href)[1] +
                            'websocket';
        this.ws = new WebSocket(wsurl);
        this.ws.addEventListener('message', (msg) => this.onWsMessage(msg));

        document.addEventListener('Answer', (e:Event) => this.sendAnswer(<CustomEvent>e));
    }

    private send(msg: WSMessage) {
        console.log('send:', msg);
        this.ws.send(msg.toJSON());
    }

    private iceCallback(event: RTCIceCandidateEvent) {
        if(event.candidate) {
            this.send(new WSMessage('ICECandidate',
                                    undefined,
                                    undefined,
                                    event.candidate));
        }
    }

    private announceOffer(desc) {
        // Set local descpription and then, send offer via websocket.
        this.pc.setLocalDescription(desc).then(
            () => {
                var msg: WSMessage = new WSMessage('Offer', undefined, undefined, desc);

                switch (this.ws.readyState) {
                    case WebSocket.CONNECTING :
                        this.ws.addEventListener('open',
                            () => this.send(msg));
                        break;
                    case WebSocket.OPEN :
                        this.send(msg);
                        break;
                    default :
                        console.error('Unable to announce offer with a websocket at this status:',
                            this.ws.readyState);
                }
            }
        );
    }

    private onCreateOfferError(error) {
        console.error('Offer error:', error);
    }

    private onWsMessage(msg) {
        var wsmsg = WSMessage.fromJSON(msg.data);
        var cb = this['on' + wsmsg.type];
        if (cb)
            cb.apply(this, [wsmsg]);
        else
            console.warn('"on' + wsmsg.type + '" not implemented.');
        //var msg = JSON.parse(msg.data);
        //this['on'+msg['type']](msg['data']);
        //console.info(msg.data);
    }

    private onOffer(msg: WSMessage) {
        document.dispatchEvent(new CustomEvent('Offer', {detail: msg}));
        //var pcr: RTCPeerConnection = new RTCPeerConnection(null, {optional:[]});
        //pcr.setRemoteDescription(offer).then(
        //    () => {
        //        console.log('setRemoteDescription Ok !');
        //        pcr.createAnswer();
        //    },
        //    (error) => {console.error('merde :', error);}
        //);
        //console.info('onOffer', offer)
    }

    private onByebye(msg: WSMessage) {
        document.dispatchEvent(new CustomEvent('Byebye', {detail: msg}));
    }

    private onWhoami(msg: WSMessage) {
        console.info('I am:', msg.payload);
        this.wspeer = msg.payload;
    }

    private onAnswer(msg: WSMessage) {
        this.pc.setRemoteDescription(msg.payload).then(
            () => console.log('youpi !'),
            () => console.error('hé merde…')
        );
    }

    private onICECandidate(msg: WSMessage) {
        document.dispatchEvent(new CustomEvent('ICECandidate',
                                               {detail: {from: msg.from,
                                                         icecandidate: msg.payload}}));
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
