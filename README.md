# SRPC

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Travis Build][travis-image]][travis-url]


An easy to use RPC implementation using json-rpc specification.

    npm install srpc

### Getting Started

#### Create a RPC service
SRPC allow to share method across network using HTTP request. We first have to defined the new service that will be shared. Any object can be declared as a service, all functions contained by the object will be exposed as a remote procedure. Note that the this reference will be overwritten so prefer a static API.

```js
// Create the API
var MyService = {

  // function `hello' is accessible via RPC
  hello: function (name, callback) {
    callback(null, 'Hello ' + name + '!')
  }
}
```
A remote procedure must take a _callback_ as its last argument. This function will be called with an error object as first argument and a response object as second.

#### Create a server

To create a server, you will need the __http__ package and to use the function `listener()`:
```js
var srv = http.createServer (srpc.listener(MyService));
srv.listen(8080);
```
You can replace easily the _http_ server by an _https_ one. That is your server is ready.
To go further, note that `srpc.listener()` have the  prototype of a __requestListener__. As such you can use with many router library, like express to provide several services.
```js
var app = require('express')(),
    srpc = require('srpc');
// ...
app.use('/users', srpc.listener(UserService));
app.use('/account', srpc.listener(AccountService));
app.listen(80);
```
 

>__Note__: The `srpc.listener()` function ignore which path or http-verbs is used for the moment (POST is adviced). I'm working to accept web-socket to allow keep-alive communication.

#### Open a client connection
To start a client, you will need to use the `srpc.connect()` function which give you back an object similar to the service defined on the server.

```js
// Create the client connection
var url = 'http://localhost:8080/'

srpc.connect(url, function (err, rpc) {
  if (err) return console.error(err)

  // Asynchronous call to the function `hello'
  rpc.hello ('World', function (err, res) {
    if (err) return console.error(err)
    console.log (res)
  })
})
```
the object provided contains every defined remote-procedure and two other members:

 * An object name `#wsp` which define the remote API:
 `{ "methods": { "hello": "params": [ "name", "callback"] } } }`
 * A methods named `invoke(methods, params, callback)` which allow to call any remote procedure.


> _Look at the file `sample.js` to test the command given here._



### License


Copyright (c) 2015, Fabien Bavent
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


[npm-image]: https://img.shields.io/npm/v/srpc.svg
[npm-url]: https://npmjs.org/package/srpc
[downloads-image]: https://img.shields.io/npm/dm/srpc.svg
[downloads-url]: https://npmjs.org/package/srpc
[travis-image]: https://img.shields.io/travis/AxFab/srpc.svg
[travis-url]: https://travis-ci.org/AxFab/srpc


