// lib.js - this is a short library of useful functions, primarily Ajax.

var lib = function() {

  var serialize = function(obj) {
    /**
     * serialize()
     * \brief take an object, output a string fit for the querystring.
     * \param {object} obj - the data object we wish to serialize.
     * \cite: http://stackoverflow.com/a/1714899/1525594
    */
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  var ajax = function(endpoint,data,callback,method) {
    var body,boundary,
        method = method ? method : "GET";//method is GET by default
        data = data ? data : {}; // data object is empty object by default

    // parameter validation
    if (!endpoint) { console.warn('Ajax endpoint is required.'); }
    if (!callback) { console.warn('Ajax callback is required.'); }

    var myCallback = function() {
      callback(json);
    };

    var addFormData = function() {
      var bodyStr = '',
          boundary = parseInt(Math.random()*1000),
          boundaryStr = "---"+boundary;
      
      for (var field in data) {
        bodyStr += '\r\n' + 'Content-Disposition: form-data; name="'+field;
        bodyStr += data[field];
        bodyStr += '\r\n' + boundaryStr;
      }
      bodyStr += '---';//end of form data!
      console.log('Ajax form data:',bodyStr);
      return bodyStr;
    };

    var myRequest = new XMLHttpRequest();
    myRequest.addEventListener("load",callback);
    if (method==="POST") 
      myRequest.setRequestHeader("Content-Type", "multipart\/form-data; boundary="+boundary);
      body = addFormData();
    }
    myRequest.open(method,"/api/v1/"+endpoint);
    myRequest.send();
  };

  return {
    serialize: serialize,
    ajax: ajax
  };
};
