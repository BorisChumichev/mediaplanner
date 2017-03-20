const micro = require('micro')

const server = micro(require('./inventory-service/inventory-service'))

server.listen(3006)
