var srpcSrv = require('./lib/srpc-server.js')
var srpcCnx = require('./lib/srpc-client.js')
module.exports = {
  connect: srpcCnx.connect,
  listener: srpcSrv.listener,
}