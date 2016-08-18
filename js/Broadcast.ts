/// <reference path="Lib/webrtc/MediaStream.d.ts"/>
/// <reference path="Lib/webrtc/RTCPeerConnection.d.ts"/>
/// <reference path="Modules/Module.ts"/>

class Broadcast {
    pc: RTCPeerConnection;
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
        this.pc.createOffer(Broadcast.offer_options);
    }

    private iceCallback(event: RTCIceCandidateEvent) {
        console.info('iceCallback', event);
    }
}


class RemoteModule extends Module {
}
