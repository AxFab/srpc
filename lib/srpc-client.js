
(function () {
  var previous_mod, root = this
  if (root != null)
    previous_mod = root.srpcCnx
  
  // ==========================================================================
  var http = root.http
  if( typeof http === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      http = require('http')
    }
    else {
      
      // Browser stub for http request
      var httpReq = function (opt, callback) {

        this.__events = {}
        var xmlHttp = new XMLHttpRequest()
        this.__xmlhttp = xmlHttp
        this.__xmlhttp.onreadystatechange = function() { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            // @todo Browser get Text, Node get Obj
            callback(null, xmlHttp.responseText);
          else if (xmlHttp.readyState == 4)
            callback(xmlHttp.status)
        }

        this.__xmlhttp.open(opt.method, opt.path, opt.method == 'POST');
        for (var k in opt.headers)
          this.__xmlhttp.setRequestHeader(k, opt.headers[k]);
        this.__data = ''
      }

      httpReq.prototype.write = function(data) 
      {
        this.__data += data
      }

      // httpReq.prototype.trigger = function(evnt, params)
      // {
      //   var arr = this.__events[evnt]
      //   if (arr == null)
      //     return
      //   for (var i=0; i<arr.length; ++i)
      //     arr[i].apply(this, params)
      // }
      
      // httpReq.prototype.on = function(evnt, callback) 
      // {
      //   if (this.__events[evnt] == null)
      //     this.__events[evnt] = []
      //   this.__events[evnt].push (callback)
      // }

      httpReq.prototype.end = function() {
        this.__xmlhttp.setRequestHeader('Content-Length', this.__data.length);
        this.__xmlhttp.send (this.__data)
      }

      http.request = function (opt, callback) {
        var qry = new httpReq(opt, callback)
        return qry;
      }
    }
  }
   
  if( typeof https === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      https = require('https')
    }
  }

// ==========================================================================
  var srpcCnx = function (url) {

    if (typeof url === 'string')
      url = require('url').parse(url)

    this.__idauto = 0

    this.__http = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      ca: url.ca,
      rejectUnautorized: url.rejectUnautorized,
      requestCert: url.requestCert,
      method: 'POST',
      headers: {
        'Content-Type': 'application/java-script',
      }
    }

    this.__proto = http
    if (url.protocol == 'https:')
      this.__proto = https
  }


  srpcCnx.prototype.receive = function (callback) {
    return function(req) {

      var data = ''
      req.on('error', function(err) { callback(err) })
      req.on('data', function(d) { data += d })
      req.on('end', function() { 
        var item;
        try {
          if (srpcCnx.debug) console.log ('S: ' + data);
          item = JSON.parse(data)
        } catch (e) {
          return callback(e)
        }
        callback(null, item.response); 
      })
    }
  }


  srpcCnx.prototype.invoke = function(method, params, callback) {
    
    // console.log ('INVOKE', arguments)
    if (!(params instanceof Array))
      throw 'params arguments must be an array'
    if (typeof method !== 'string')
      throw 'methods arguments must be a string'

    var postData = JSON.stringify({
      jsonrpc: '2.0',
      id: ++this.__idauto,
      method: method.toString(),
      params: params
    })

    var qry = this.__proto.request(this.__http, srpcCnx.prototype.receive (callback))
    qry.write(postData)
    qry.end()
  }


  srpcCnx.prototype.setHeader = function (key, value)
  {
    this.__http.headers[key] = value
  }


// ==========================================================================
  srpcCnx.fromWsp = function(rpc, wsp) {
    var obj = {}
    for (var k in wsp.methods) {
      var sp = wsp.methods[k]
      obj[k] = function () {
        var params = []
        var argc = sp.params.length - 1
        for (var i=0; i<argc; ++i)
          params.push(arguments[i])
        rpc.invoke(k, params, arguments[argc])
      }
    }

    obj.invoke = function() {
      return rpc.invoke.apply(rpc, arguments);
    }
    obj.$wsp = wsp;
    return obj;
  }

  srpcCnx.connect = function(url, callback) {
    
    if (typeof url === 'function') {
      callback = url
      url = { path:'/' }
    }

    var rpc = new srpcCnx(url)
    rpc.invoke('$wsp', [], function (err, req) {
      if (err) return callback(err);
      return callback(null, srpcCnx.fromWsp(rpc, req))
    })
  }


// Export the module ========================================================
  srpcCnx.noConflict = function () {
    root.srpcCnx = previous_mod
    return srpcCnx
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = srpcCnx
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return srpcCnx })
  else // Browser 
    root.srpcCnx = srpcCnx
  

}).call(this)

