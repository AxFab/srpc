
var jsonrpc = require('./index.js'),
    http = require ('http')


// Create the API
var MyService = {

  // function `hello' is accessible via RPC
  hello: function (name, callback) {
    // console.log(this)
    callback(null, 'Hello ' + name + '!')
  }
}


// Create the server
var srv = http.createServer (jsonrpc.listener(MyService))
srv.listen(12345)


// Create the client connection
var url = 'http://localhost:12345/'

jsonrpc.connect(url, function (err, rpc) {
  if (err) return console.error(err)

  // Asynchronous call to the function `hello'
  rpc.hello ('World', function (err, res) {
    if (err) return console.error(err)
    console.log (res)

    // Close the server
    srv.close();
  })
})

