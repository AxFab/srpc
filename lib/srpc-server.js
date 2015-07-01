
(function () {
  var previous_mod, root = this
  if (root != null)
    previous_mod = root.srpcSrv
  
  // ==========================================================================
  var srpcSrv = function () {}

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;

  /// Get the ordered list of the parameter name of a function
  srpcSrv.getParamNames = function (func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
      result = [];
    return result;
  }

  /// Create the Wsp object from a service object.
  srpcSrv.createWsp = function (object) {
    var wsp = {
      methods: {}
    }

    for (var k in object) {
      if (typeof object[k] === 'function') {
        wsp.methods[k] = {
          params: srpcSrv.getParamNames(object[k])
        }
      }
    }

    return wsp
  }

  srpcSrv.__error = function (res, id, err) {
    res.end(JSON.stringify({
      jsonrpc: "2.0",
      id: id,
      error: err
    }))
  }

  srpcSrv.__send = function (res, id, obj) {
    res.end(JSON.stringify({
      jsonrpc: "2.0",
      id: id,
      response: obj
    }))
  }

  srpcSrv.answer = function (data, srv, wsp, res, ctx) {

    var qry
    try {
      qry = JSON.parse(data)
    } catch (ex) {
      return srpcSrv.__error(res, null, { code: -32700, message: "Parse error."})
    }

    if (qry.jsonrpc != '2.0' || typeof qry.id !== 'number' || typeof qry.method !== 'string' )
      return srpcSrv.__error(res, null, { code: -32600, message: "Invalid Request." })

    if (qry.method == '$wsp')
      return srpcSrv.__send(res, qry.id, wsp)

    var meth = srv[qry.method]
    if (typeof meth !== 'function')
      return srpcSrv.__error(res, qry.id, { code: -32601, message: "Procedure not found."})

    var sp = wsp.methods[qry.method]
    var params = []
    if (qry.params instanceof Array)
      params = qry.params
    else {
      for (var i=0; i<sp.params.length; ++i)
        params.push (qry.params[sp.params[i]])
    }

    params[sp.params.length-1] = function (err, ret) {
      return srpcSrv.__send(res, qry.id, ret)
    }

    meth.apply(ctx, params)
  }

  srpcSrv.listener = function (object) {

    var wsp = srpcSrv.createWsp(object)

    return function (req, res) {
      var data = ''
      req.on('data', function(d) { data += d })
      req.on('end', function() { 
        if (srpcSrv.debug) console.log ('C: ' + data)
        var ctx = {
          remoteAddress: req.socket.remoteAddress,
          cnxId: 5,
          isAuth: false,
          username: null,
          headers:req.headers
        }
        srpcSrv.answer(data, object, wsp, res, ctx)
      })
    }
  }


// Export the module ========================================================
  srpcSrv.noConflict = function () {
    root.srpcSrv = previous_mod
    return srpcSrv
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = srpcSrv
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return srpcSrv })
  else // Browser 
    root.srpcSrv = srpcSrv
  

}).call(this)

