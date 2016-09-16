# -*- coding: utf-8 -*-

from os.path import abspath, join, dirname
from urlparse import urlparse

from twisted.web import server
from twisted.web.resource import Resource
from twisted.web.static import File
from twisted.application import internet
from autobahn.twisted.resource import WebSocketResource
from twisted.internet.ssl import DefaultOpenSSLContextFactory

from faustplayground.broadcastws import BroadcastServerFactory
from faustplayground.broadcastws import BroadcastServerProtocol

FPGHOME = abspath(join(dirname(__file__),
                       '..', '..'))


class RouterResource(Resource) :

    def __init__(self, server_url) :
        Resource.__init__(self)

        purl = urlparse(server_url)
        wsurl = 'ws://' if purl.scheme == 'http' else 'wss://'
        wsurl += '%s/websocket' % (purl.netloc + purl.path)

        self.wsfactory = BroadcastServerFactory(wsurl)
        self.wsfactory.protocol = BroadcastServerProtocol

    def getChild(self, path, request) :
        if path == 'websocket' :
            return WebSocketResource(self.wsfactory)
        else :
            request.postpath.insert(0, request.prepath.pop(-1))
            return File(FPGHOME)

def get_service(server_url) :
    site = server.Site(RouterResource(server_url))
    purl = urlparse(server_url)

    if purl.scheme == 'https' :
        ssldir = join(FPGHOME, 'ssl')
        ctx_factory = DefaultOpenSSLContextFactory(join(ssldir, 'server.key'),
                                                   join(ssldir, 'server.crt'))
        return internet.SSLServer(purl.port, site, ctx_factory)

    return internet.TCPServer(purl.port, site)
