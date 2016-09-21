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
        this.ws.addEventListener('message', (msg) => this.onWsMessage(msg));
    }

    private iceCallback(event: RTCIceCandidateEvent) {
        console.info('iceCallback', event);
    }

    private announceOffer(desc) {
        // Set local descpription and then, send offer via websocket.
        this.pc.setLocalDescription(desc).then(
            () => {

                var msg = {
                    type: 'Offer',
                    data: desc.toJSON()
                };

                switch (this.ws.readyState) {
                    case WebSocket.CONNECTING :
                        this.ws.addEventListener('open',
                            () => {
                                this.ws.send(JSON.stringify(msg));
                            });
                        break;
                    case WebSocket.OPEN :
                        this.ws.send(JSON.stringify(msg));
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
        var msg = JSON.parse(msg.data);
        this['on'+msg['type']](msg['data']);
        //console.info(msg.data);
    }

    private onOffer(offer) {
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
}


class RemoteModule extends Module {
}
