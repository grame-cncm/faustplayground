from twisted.application import service
from faustplayground.service import get_service
server_url = 'http://localhost:8080'
tcp = get_service(server_url)
application = service.Application('faustplayground')
tcp.setServiceParent(application)
