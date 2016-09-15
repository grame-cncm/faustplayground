/// <reference path="Lib/webrtc/MediaStream.d.ts"/>
/// <reference path="Lib/webrtc/RTCPeerConnection.d.ts"/>
/// <reference path="Modules/Module.ts"/>

class Broadcast {
    pc: RTCPeerConnection;
    ws: WebSocket;

    static offer_options = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
        voiceActivityDetection: false
    };

    constructor(stream: MediaStream,
                server=null,
                pc_constraints={optional:[]}) {
        this.pc = new RTCPeerConnection(server, pc_constraints);
        this.pc.onicecandidate = (event) => this.iceCallback(event);
        this.pc.addStream(stream);
        this.pc.createOffer(Broadcast.offer_options).then(
            (desc) => this.announceOffer(desc),
            (error) => this.onCreateOfferError(error)
        );
        var wsurl: string = ((location.protocol === 'http:') ? 'ws://' : 'wss://') +
                            /https?:\/\/([^#]*)/.exec(location.href)[1] +
                            'websocket';
        this.ws = new WebSocket(wsurl);
    }

    private iceCallback(event: RTCIceCandidateEvent) {
        console.info('iceCallback', event);
    }

    private announceOffer(desc) {
        console.info('Offer:', desc);
    }

    private onCreateOfferError(error) {
        console.error('Offer error:', error);
    }
}


class RemoteModule extends Module {
}
