// lib.js - this is a short library of useful functions, primarily Ajax.

var Lib = function() {

  var template = function(str, data) {
    /**
     * template()
     * do Mustache-style templating on a string.
     * Note this is SUPER basic. Does not do nesting, loops, conditionals, etc.
     * Just simple {name}-value replacement.
     * @param {string} str - the string to search/replace IN
     * @param {Object} data - a flat object of key/value pairs to insert into the HTML string.
     * @returns {string} a full HTML with no more {key} blocks unless the corresponding data[key] did not exist.
     */
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
    /** toDom()
     * convert a string into a fully build nodeList
     * @param {string} str - the string of correctly-formatted HTML
     * @return {NodeList} the HTML list of nodes
     */
    var tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.childNodes;
  };

  var serialize = function(obj) {
    /**
     * serialize()
     * take an object, output a string fit for the querystring.
     * @param {object} obj - the data object we wish to serialize.
     * @cite: http://stackoverflow.com/a/1714899/1525594
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
    if (!url) { throw "lib.js/ajax(): Url is required."; }
    if (!callback) { throw "lib.js/ajax(): Callback is required."; }

    var myCallback = function(e) {
      //console.log("lib.js/ajax(): Ajax request completed!",arguments);
      callback(e.target.response,e.target);
    };

    var myRequest = new XMLHttpRequest();
    myRequest.responseType = "json";
    myRequest.addEventListener("load",myCallback);
    myRequest.open(reqMethod,url);

    if (reqMethod === "POST") {
      myRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      reqBody = addFormData();
    }
    myRequest.send(data);
  };

  return {
    serialize: serialize,
    ajax: ajax,
    toDom: toDom,
    template: template
  };
};
lib = Lib();
