// lib.js - this is a short library of useful functions, primarily Ajax.

var Lib = function() {

  var template = function(str, data) {
    var retstr = str;

    // loop over all data properties
    for (var prop in data) {
      // create a regex searcher for {prop}
      var regex = new RegExp('\{'+prop+'\}','ig');
      //console.log("lib.js/template(): regex",regex);
      
      // update string
      retstr = retstr.replace(regex,data[prop]);
    }
    return retstr;
  };

  var toDom = function(str) {
    var tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.children;
  };

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

  var ajax = function(url,data,callback,method) {
    var reqBody = '',
        reqBoundary,
        reqMethod = method ? method : "GET";//method is GET by default
        data = data ? data : {}; // data object is empty object by default

    // parameter validation
    if (!url) { console.warn('lib.js/ajax(): Url is required.'); }
    if (!callback) { console.warn('lib.js/ajax(): Callback is required.'); }

    var myCallback = function(e) {
      //console.log("lib.js/ajax(): Ajax request completed!",arguments);
      callback(e.target.response,e.target);
    };

    var addFormData = function(dat) {
      var bodyStr = '',
          reqBoundary = parseInt(Math.random()*1000),
          boundaryStr = "---"+reqBoundary;
      
      for (var field in dat) {
        bodyStr += '\r\n' + 'Content-Disposition: form-data; name="'+field;
        bodyStr += dat[field];
        bodyStr += '\r\n' + boundaryStr;
      }
      bodyStr += '---';//end of form data!
      console.log('lib.js/ajax(): form data:',bodyStr);
      return bodyStr;
    };

    var myRequest = new XMLHttpRequest();
    myRequest.responseType = "json";
    myRequest.addEventListener("load",myCallback);
    myRequest.open(reqMethod,url);

    if (reqMethod === "POST") {
      myRequest.setRequestHeader("Content-Type", "multipart\/form-data; boundary="+reqBoundary);
      reqBody = addFormData();
    }
    myRequest.send(reqBody);
  };

  return {
    serialize: serialize,
    ajax: ajax,
    toDom: toDom,
    template: template
  };
};
lib = Lib();
