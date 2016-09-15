# -*- coding: utf-8 -*-

from twisted.web import server
from twisted.web.resource import Resource
from twisted.web.resource import NoResource
from twisted.web.static import File
from twisted.application import internet
from os.path import abspath, join, dirname

FPGHOME = abspath(join(dirname(__file__),
                       '..', '..'))


class RouterResource(Resource) :

    def getChild(self, path, request) :
        request.postpath.insert(0, request.prepath.pop(-1))
        if path == 'websocket' :
            return NoResource('Ça vient…')
        else :
            return File(FPGHOME)

def get_service(port) :
    site = server.Site(RouterResource())
    return internet.TCPServer(port, site)
