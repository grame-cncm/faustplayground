# -*- coding: utf-8 -*-

from autobahn.twisted.websocket import WebSocketServerFactory
from autobahn.twisted.websocket import WebSocketServerProtocol
from twisted.logger import Logger
from json import loads, dumps

log = Logger()

class BroadcastServerProtocol(WebSocketServerProtocol):

    def __init__(self):
        WebSocketServerProtocol.__init__(self)
        self.nickname = ''
        self.offer = None
        self.icecandidates = []

    def onOpen(self):
        self.nickname = self.peer # fallback nickname
        self.factory.register(self)

    def onMessage(self, payload, isBinary):
        if not isBinary:
            msg = WSMessage.fromJSON(payload.decode('utf-8'))
            msg.setFrom(self)
            print msg
            if msg.type == 'Offer' :
                self.offer = msg

            elif msg.type == 'ICECandidate' :
                self.icecandidates.append(msg)
                return

            self.factory.broadcast(msg)

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


class BroadcastServerFactory(WebSocketServerFactory) :

    def __init__(self, url) :
        WebSocketServerFactory.__init__(self, url)
        self.clients = {}

    def otherClients(self, peer) :
        for otherpeer, client in self.clients.iteritems() :
            if otherpeer != peer :
                yield client

    def register(self, client):
        if not client.peer in self.clients.keys() :
            log.info("registered client {}".format(client.peer))
            self.clients[client.peer] = client

            whoiam = WSMessage('Whoami', 'server', client.peer, client.peer)
            self.broadcast(whoiam)

            # send to the new client previous offers from other clients
            for c in self.otherClients(client.peer) :
                client.sendMessage(c.offer.toJSON())
                for icecandidate in c.icecandidates :
                    client.sendMessage(icecandidate.toJSON())


    def unregister(self, client):
        try :
            self.clients.pop(client.peer)
            log.info("unregistered client {}".format(client.peer))

            # for otherclient in self.otherClients(client) :
            byebye = WSMessage('Byebye', client.peer, None, None)
            self.broadcast(byebye)

        except KeyError :
            log.warn("unknown client {}".format(client.peer))

    def broadcast(self, msg):
        if msg.to :
            client = self.clients.get(msg.to)
            if client :
                client.sendMessage(msg.toJSON())
            else :
                log.warn("unknown client %r" % msg.from_)
        else :
            for client in self.otherClients(msg.from_) :
                client.sendMessage(msg.toJSON())


class WSMessage(object) :

    def __init__(self, type_, from_, to, payload):
        self.type = type_
        self.from_ = from_
        self.to=to
        self.payload = payload

    def setFrom(self, client) :
        self.from_ = client.peer

    def toJSON(self) :
        return dumps({'type': self.type,
                      'from' : self.from_,
                      'to' : self.to,
                      'payload' : dumps(self.payload)})

    @staticmethod
    def fromJSON(json) :
        msg = loads(json)
        msg['payload'] = loads(msg.get('payload'), 'null')
        return WSMessage(msg.get('type'), msg.get('from'), msg.get('to'), msg['payload'])

    def __str__(self) :
        return'\n'.join(('Message type: %s' % self.type,
                         'From: %s' % self.from_,
                         'To: %s' % self.to,
                         'Payload:\n%s' % self.payload)
                        )
