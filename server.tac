from twisted.application import service
from faustplayground.service import get_service
port = 8080
tcp = get_service(port)
application = service.Application('faustplayground')
tcp.setServiceParent(application)
