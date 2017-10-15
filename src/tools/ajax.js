jaxon.tools.ajax = {
    /*
    Function: jaxon.tools.ajax.createRequest

    Construct an XMLHttpRequest object dependent on the capabilities of the browser.

    Returns:
    object - Javascript XHR object.
    */
    createRequest: function() {
        if ('undefined' != typeof XMLHttpRequest) {
            jaxon.tools.ajax.createRequest = function() {
                return new XMLHttpRequest();
            }
        } else if ('undefined' != typeof ActiveXObject) {
            jaxon.tools.ajax.createRequest = function() {
                try {
                    return new ActiveXObject('Msxml2.XMLHTTP.4.0');
                } catch (e) {
                    jaxon.tools.ajax.createRequest = function() {
                        try {
                            return new ActiveXObject('Msxml2.XMLHTTP');
                        } catch (e2) {
                            jaxon.tools.ajax.createRequest = function() {
                                return new ActiveXObject('Microsoft.XMLHTTP');
                            }
                            return jaxon.tools.ajax.createRequest();
                        }
                    }
                    return jaxon.tools.ajax.createRequest();
                }
            }
        } else if (window.createRequest) {
            jaxon.tools.ajax.createRequest = function() {
                return window.createRequest();
            };
        } else {
            jaxon.tools.ajax.createRequest = function() {
                throw { code: 10002 };
            };
        }

        // this would seem to cause an infinite loop, however, the function should
        // be reassigned by now and therefore, it will not loop.
        return jaxon.tools.ajax.createRequest();
    },

    /*
    Function: jaxon.tools.ajax.processFragment

    Parse the JSON response into a series of commands.

    Parameters: 
    oRequest - (object):  The request context object.
    */
    processFragment: function(nodes, seq, oRet, oRequest) {
        var xx = jaxon;
        var xt = xx.tools;
        for (nodeName in nodes) {
            if ('jxnobj' == nodeName) {
                for (a in nodes[nodeName]) {
                    /*
                    prevents from using not numbered indexes of 'jxnobj'
                    nodes[nodeName][a]= "0" is an valid jaxon response stack item
                    nodes[nodeName][a]= "pop" is an method from somewhere but not from jxnobj
                    */
                    if (parseInt(a) != a) continue;

                    var obj = nodes[nodeName][a];
                    obj.fullName = '*unknown*';
                    obj.sequence = seq;
                    obj.request = oRequest;
                    obj.context = oRequest.context;
                    xt.queue.push(xx.response, obj);
                    ++seq;
                }
            } else if ('jxnrv' == nodeName) {
                oRet = nodes[nodeName];
            } else if ('debugmsg' == nodeName) {
                txt = nodes[nodeName];
            } else
                throw { code: 10004, data: obj.fullName }
        }
        return oRet;
    }
};