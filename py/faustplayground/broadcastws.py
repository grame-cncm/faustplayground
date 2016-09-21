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

    def onOpen(self):
        self.factory.register(self)

    def onMessage(self, payload, isBinary):
        if not isBinary:
            msg = loads(payload.decode('utf-8'))
            if msg['type'] == 'Offer' :
                self.offer = msg
            self.factory.broadcast(self, msg)

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


class BroadcastServerFactory(WebSocketServerFactory) :

    def __init__(self, url) :
        WebSocketServerFactory.__init__(self, url)
        self.clients = {}

    def otherClients(self, client) :
        for c in [ c for c in self.clients.values() if c != client] :
            yield c


    def register(self, client):
        if not client.peer in self.clients.keys() :
            log.info("registered client {}".format(client.peer))
            self.clients[client.peer] = client

            for c in self.otherClients(client) :
                client.sendMessage(dumps(c.offer))


    def unregister(self, client):
        try :
            self.clients.pop(client.peer)
            log.info("unregistered client {}".format(client.peer))
        except KeyError :
            log.warn("unknown client {}".format(client.peer))

    def broadcast(self, from_client, msg):
        if msg['type'] == 'Offer' :
            for client in self.otherClients(from_client) :
                client.sendMessage(dumps(msg))

        # log.info("broadcasting message '{}' ..".format(msg))
        # for c in self.clients:
        #     c.sendMessage(msg.encode('utf8'))
        #     log.info("message sent to {}".format(c.peer))


    # def broadcastNewClient(self, newclient) :
    #     for client in self.clients.values() :
    #         if client != newclient :
    #             client.sendMessage((u'[%s] Bonjour la compagnie !' % newclient.peer).encode('utf-8'))
