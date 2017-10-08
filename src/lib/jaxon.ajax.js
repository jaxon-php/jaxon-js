/*
Function: jaxon.ajax.request.initialize

Initialize a request object, populating default settings, where
call specific settings are not already provided.

Parameters:

oRequest - (object):  An object that specifies call specific settings
    that will, in addition, be used to store all request related
    values.  This includes temporary values used internally by jaxon.
*/
jaxon.ajax.request.initialize = function(oRequest) {
    var xx = jaxon;
    var xc = xx.config;

    oRequest.append = function(opt, def) {
        if ('undefined' == typeof this[opt])
            this[opt] = {};
        for (var itmName in def)
            if ('undefined' == typeof this[opt][itmName])
                this[opt][itmName] = def[itmName];
    };

    oRequest.append('commonHeaders', xc.commonHeaders);
    oRequest.append('postHeaders', xc.postHeaders);
    oRequest.append('getHeaders', xc.getHeaders);

    oRequest.set = function(option, defaultValue) {
        if ('undefined' == typeof this[option])
            this[option] = defaultValue;
    };

    oRequest.set('statusMessages', xc.statusMessages);
    oRequest.set('waitCursor', xc.waitCursor);
    oRequest.set('mode', xc.defaultMode);
    oRequest.set('method', xc.defaultMethod);
    oRequest.set('URI', xc.requestURI);
    oRequest.set('httpVersion', xc.defaultHttpVersion);
    oRequest.set('contentType', xc.defaultContentType);
    oRequest.set('retry', xc.defaultRetry);
    oRequest.set('returnValue', xc.defaultReturnValue);
    oRequest.set('maxObjectDepth', xc.maxObjectDepth);
    oRequest.set('maxObjectSize', xc.maxObjectSize);
    oRequest.set('context', window);
    oRequest.set('upload', false);

    var xcb = xx.fn.callback;
    var gcb = xx.callback;
    var lcb = xcb.create();

    lcb.take = function(frm, opt) {
        if ('undefined' != typeof frm[opt]) {
            lcb[opt] = frm[opt];
            lcb.hasEvents = true;
        }
        delete frm[opt];
    };

    lcb.take(oRequest, 'onRequest');
    lcb.take(oRequest, 'onResponseDelay');
    lcb.take(oRequest, 'onExpiration');
    lcb.take(oRequest, 'beforeResponseProcessing');
    lcb.take(oRequest, 'onFailure');
    lcb.take(oRequest, 'onRedirect');
    lcb.take(oRequest, 'onSuccess');
    lcb.take(oRequest, 'onComplete');

    if ('undefined' != typeof oRequest.callback) {
        if (lcb.hasEvents)
            oRequest.callback = [oRequest.callback, lcb];
    } else
        oRequest.callback = lcb;

    oRequest.status = (oRequest.statusMessages) ?
        xc.status.update() :
        xc.status.dontUpdate();

    oRequest.cursor = (oRequest.waitCursor) ?
        xc.cursor.update() :
        xc.cursor.dontUpdate();

    oRequest.method = oRequest.method.toUpperCase();
    if ('GET' != oRequest.method)
        oRequest.method = 'POST'; // W3C: Method is case sensitive

    oRequest.requestRetry = oRequest.retry;

    // The content type is not set when uploading a file with FormData.
    // It will be set by the browser.
    if (oRequest.upload == false) {
        oRequest.append('postHeaders', {
            'content-type': oRequest.contentType
        });
    }

    delete oRequest['append'];
    delete oRequest['set'];
    delete oRequest['take'];

    if ('undefined' == typeof oRequest.URI)
        throw { code: 10005 };
}

/*
Function: jaxon.ajax.parameters.formData

Processes request specific parameters and store them in a FormData object.

Parameters:

oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
*/
jaxon.ajax.parameters.formData = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;

    var rd = new FormData();
    var input = jaxon.$(oRequest.upload);
    if (input != null && input.type == 'file' && input.name != 'undefined') {
        for (var i = 0, n = input.files.length; i < n; i++) {
            rd.append(input.name, input.files[i]);
        }
    }

    var separator = '';
    for (var sCommand in oRequest.functionName) {
        if ('constructor' != sCommand) {
            rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand]));
        }
    }
    var dNow = new Date();
    rd.append('jxnr', dNow.getTime());
    delete dNow;

    if (oRequest.parameters) {
        var i = 0;
        var iLen = oRequest.parameters.length;
        while (i < iLen) {
            var oVal = oRequest.parameters[i];
            if ('object' == typeof oVal && null != oVal) {
                try {
                    oVal = JSON.stringify(oVal);
                } catch (e) {
                    oVal = '';
                    // do nothing, if the debug module is installed
                    // it will catch the exception and handle it
                }
                oVal = encodeURIComponent(oVal);
                rd.append('jxnargs[]', oVal);
                ++i;
            } else {
                if ('undefined' == typeof oVal || null == oVal) {
                    rd.append('jxnargs[]', '*');
                } else {
                    var sPrefix = '';
                    var sType = typeof oVal;
                    if ('string' == sType)
                        sPrefix = 'S';
                    else if ('boolean' == sType)
                        sPrefix = 'B';
                    else if ('number' == sType)
                        sPrefix = 'N';
                    oVal = encodeURIComponent(oVal);
                    rd.append('jxnargs[]', sPrefix + oVal);
                }
                ++i;
            }
        }
    }

    oRequest.requestURI = oRequest.URI;
    oRequest.requestData = rd;
}

/*
Function: jaxon.ajax.parameters.urlEncoded

Processes request specific parameters and store them in an URL encoded string.

Parameters:

oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
*/
jaxon.ajax.parameters.urlEncoded = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;

    var rd = [];

    var separator = '';
    for (var sCommand in oRequest.functionName) {
        if ('constructor' != sCommand) {
            rd.push(separator);
            rd.push(sCommand);
            rd.push('=');
            rd.push(encodeURIComponent(oRequest.functionName[sCommand]));
            separator = '&';
        }
    }
    var dNow = new Date();
    rd.push('&jxnr=');
    rd.push(dNow.getTime());
    delete dNow;

    if (oRequest.parameters) {
        var i = 0;
        var iLen = oRequest.parameters.length;
        while (i < iLen) {
            var oVal = oRequest.parameters[i];
            if ('object' == typeof oVal && null != oVal) {
                try {
                    // var oGuard = {};
                    // oGuard.depth = 0;
                    // oGuard.maxDepth = oRequest.maxObjectDepth;
                    // oGuard.size = 0;
                    // oGuard.maxSize = oRequest.maxObjectSize;
                    // oVal = xt._objectToXML(oVal, oGuard);
                    oVal = JSON.stringify(oVal);
                } catch (e) {
                    oVal = '';
                    // do nothing, if the debug module is installed
                    // it will catch the exception and handle it
                }
                rd.push('&jxnargs[]=');
                oVal = encodeURIComponent(oVal);
                rd.push(oVal);
                ++i;
            } else {
                rd.push('&jxnargs[]=');

                if ('undefined' == typeof oVal || null == oVal) {
                    rd.push('*');
                } else {
                    var sType = typeof oVal;
                    if ('string' == sType)
                        rd.push('S');
                    else if ('boolean' == sType)
                        rd.push('B');
                    else if ('number' == sType)
                        rd.push('N');
                    oVal = encodeURIComponent(oVal);
                    rd.push(oVal);
                }
                ++i;
            }
        }
    }

    oRequest.requestURI = oRequest.URI;

    if ('GET' == oRequest.method) {
        oRequest.requestURI += oRequest.requestURI.indexOf('?') == -1 ? '?' : '&';
        oRequest.requestURI += rd.join('');
        rd = [];
    }

    oRequest.requestData = rd.join('');
}

/*
Function: jaxon.ajax.parameters.process

Processes request specific parameters and generates the temporary 
variables needed by jaxon to initiate and process the request.

Parameters:

oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>

Note:
This is called once per request; upon a request failure, this 
will not be called for additional retries.
*/
jaxon.ajax.parameters.process = function(oRequest) {
    if (oRequest.upload != false)
        jaxon.ajax.parameters.formData(oRequest);
    else
        jaxon.ajax.parameters.urlEncoded(oRequest);
};

/*
Function: jaxon.ajax.request.prepare

Prepares the XMLHttpRequest object for this jaxon request.

Parameters:

oRequest - (object):  An object created by a call to <jaxon.ajax.request.initialize>
    which already contains the necessary parameters and temporary variables
    needed to initiate and process a jaxon request.

Note: 
This is called each time a request object is being prepared for a 
call to the server.  If the request is retried, the request must be
prepared again.
*/
jaxon.ajax.request.prepare = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;

    oRequest.request = xt.ajax.createRequest();

    oRequest.setRequestHeaders = function(headers) {
        if ('object' == typeof headers) {
            for (var optionName in headers)
                this.request.setRequestHeader(optionName, headers[optionName]);
        }
    };
    oRequest.setCommonRequestHeaders = function() {
        this.setRequestHeaders(this.commonHeaders);
        if (this.challengeResponse)
            this.request.setRequestHeader('challenge-response', this.challengeResponse);
    };
    oRequest.setPostRequestHeaders = function() {
        this.setRequestHeaders(this.postHeaders);
    };
    oRequest.setGetRequestHeaders = function() {
        this.setRequestHeaders(this.getHeaders);
    };

    if ('asynchronous' == oRequest.mode) {
        // references inside this function should be expanded
        // IOW, don't use shorthand references like xx for jaxon
        oRequest.request.onreadystatechange = function() {
            if (oRequest.request.readyState != 4)
                return;
            jaxon.ajax.response.received(oRequest);
        };
        oRequest.finishRequest = function() {
            return this.returnValue;
        };
    } else {
        oRequest.finishRequest = function() {
            return jaxon.ajax.response.received(oRequest);
        };
    }

    if ('undefined' != typeof oRequest.userName && 'undefined' != typeof oRequest.password) {
        oRequest.open = function() {
            this.request.open(
                this.method,
                this.requestURI,
                'asynchronous' == this.mode,
                oRequest.userName,
                oRequest.password);
        };
    } else {
        oRequest.open = function() {
            this.request.open(
                this.method,
                this.requestURI,
                'asynchronous' == this.mode);
        };
    }

    if ('POST' == oRequest.method) { // W3C: Method is case sensitive
        oRequest.applyRequestHeaders = function() {
            this.setCommonRequestHeaders();
            try {
                this.setPostRequestHeaders();
            } catch (e) {
                this.method = 'GET';
                this.requestURI += this.requestURI.indexOf('?') == -1 ? '?' : '&';
                this.requestURI += this.requestData;
                this.requestData = '';
                if (0 == this.requestRetry) this.requestRetry = 1;
                throw e;
            }
        }
    } else {
        oRequest.applyRequestHeaders = function() {
            this.setCommonRequestHeaders();
            this.setGetRequestHeaders();
        };
    }
}

/*
Function: jaxon.ajax.request.submit

Create a request object and submit the request using the specified
request type; all request parameters should be finalized by this 
point.  Upon failure of a POST, this function will fall back to a 
GET request.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.request.submit = function(oRequest) {
    oRequest.status.onRequest();

    var xx = jaxon;
    var xcb = xx.fn.callback;
    var gcb = xx.callback;
    var lcb = oRequest.callback;

    xcb.execute([gcb, lcb], 'onResponseDelay', oRequest);
    xcb.execute([gcb, lcb], 'onExpiration', oRequest);
    xcb.execute([gcb, lcb], 'onRequest', oRequest);

    oRequest.open();
    oRequest.applyRequestHeaders();

    oRequest.cursor.onWaiting();
    oRequest.status.onWaiting();

    jaxon.ajax.request._send(oRequest);

    // synchronous mode causes response to be processed immediately here
    return oRequest.finishRequest();
}

/*
Function: jaxon.ajax.request._send

This function is used internally by jaxon to initiate a request to the server.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.request._send = function(oRequest) {
    // this may block if synchronous mode is selected
    oRequest.request.send(oRequest.requestData);
};

/*
Function: jaxon.ajax.request.abort

Abort the request.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.request.abort = function(oRequest) {
    oRequest.aborted = true;
    oRequest.request.abort();
    jaxon.ajax.response.complete(oRequest);
};

/*
Function: jaxon.ajax.request.execute

Initiates a request to the server.

Parameters:

functionName - (object):  An object containing the name of the function to execute
on the server. The standard request is: {jxnfun:'function_name'}
    
oRequest - (object, optional):  A request object which 
    may contain call specific parameters.  This object will be
    used by jaxon to store all the request parameters as well
    as temporary variables needed during the processing of the
    request.

*/
jaxon.ajax.request.execute = function() {
    var numArgs = arguments.length;
    if (0 == numArgs)
        return false;

    var oRequest = {};
    if (1 < numArgs)
        oRequest = arguments[1];

    oRequest.functionName = arguments[0];

    var xx = jaxon;

    xx.ajax.request.initialize(oRequest);
    xx.ajax.parameters.process(oRequest);
    while (0 < oRequest.requestRetry) {
        try {
            --oRequest.requestRetry;
            xx.ajax.request.prepare(oRequest);
            return xx.ajax.request.submit(oRequest);
        } catch (e) {
            jaxon.fn.callback.execute(
                [jaxon.callback, oRequest.callback],
                'onFailure',
                oRequest
            );
            if (0 == oRequest.requestRetry)
                throw e;
        }
    }
};

/*
Function: jaxon.ajax.response.received

Process the response.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.response.received = function(oRequest) {
    var xx = jaxon;
    var xcb = xx.fn.callback;
    var gcb = xx.callback;
    var lcb = oRequest.callback;
    // sometimes the responseReceived gets called when the
    // request is aborted
    if (oRequest.aborted)
        return;

    xcb.clearTimer([gcb, lcb], 'onExpiration');
    xcb.clearTimer([gcb, lcb], 'onResponseDelay');

    xcb.execute([gcb, lcb], 'beforeResponseProcessing', oRequest);

    var challenge = oRequest.request.getResponseHeader('challenge');
    if (challenge) {
        oRequest.challengeResponse = challenge;
        xx.ajax.request.prepare(oRequest);
        return xx.ajax.request.submit(oRequest);
    }

    var fProc = xx.ajax.processor.find(oRequest);
    if ('undefined' == typeof fProc) {
        xcb.execute([gcb, lcb], 'onFailure', oRequest);
        xx.ajax.response.complete(oRequest);
        return;
    }

    return fProc(oRequest);
};

/*
Function: jaxon.ajax.processor.find

This function attempts to determine, based on the content type of the
reponse, what processor should be used for handling the response data.

The default jaxon response will be text/xml which will invoke the
jaxon xml response processor.  Other response processors may be added
in the future.  The user can specify their own response processor on
a call by call basis.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.processor.find = function(oRequest) {
    var fProc;

    if ('undefined' == typeof oRequest.responseProcessor) {
        var cTyp = oRequest.request.getResponseHeader('content-type');
        if (cTyp) {
            if (0 <= cTyp.indexOf('application/json')) {
                fProc = jaxon.ajax.processor.json;
            }
        }
    } else fProc = oRequest.responseProcessor;

    return fProc;
};

/*
Function: jaxon.ajax.response.complete

Called by the response command queue processor when all commands have 
been processed.

Parameters:

oRequest - (object):  The request context object.
*/
jaxon.ajax.response.complete = function(oRequest) {
    jaxon.fn.callback.execute(
        [jaxon.callback, oRequest.callback],
        'onComplete',
        oRequest
    );
    oRequest.cursor.onComplete();
    oRequest.status.onComplete();
    // clean up -- these items are restored when the request is initiated
    delete oRequest['functionName'];
    delete oRequest['requestURI'];
    delete oRequest['requestData'];
    delete oRequest['requestRetry'];
    delete oRequest['request'];
    delete oRequest['set'];
    delete oRequest['open'];
    delete oRequest['setRequestHeaders'];
    delete oRequest['setCommonRequestHeaders'];
    delete oRequest['setPostRequestHeaders'];
    delete oRequest['setGetRequestHeaders'];
    delete oRequest['applyRequestHeaders'];
    delete oRequest['finishRequest'];
    delete oRequest['status'];
    delete oRequest['cursor'];
    delete oRequest['challengeResponse'];
};

/*
Function: jaxon.ajax.response.process

While entries exist in the queue, pull and entry out and
process it's command.  When a command returns false, the
processing is halted.

Parameters: 

theQ - (object): The queue object to process.
This should have been crated by calling <jaxon.tools.queue.create>.

Returns:

true - The queue was fully processed and is now empty.
false - The queue processing was halted before the queue was fully processed.
    
Note:

- Use <jaxon.ajax.response.setWakeup> or call this function to 
cause the queue processing to continue.

- This will clear the associated timeout, this function is not designed to be reentrant.

- When an exception is caught, do nothing; if the debug module 
is installed, it will catch the exception and handle it.
*/
jaxon.ajax.response.process = function(theQ) {
    if (null != theQ.timeout) {
        clearTimeout(theQ.timeout);
        theQ.timeout = null;
    }
    var obj = jaxon.tools.queue.pop(theQ);
    while (null != obj) {
        try {
            if (false == jaxon.fn.handler.execute(obj))
                return false;
        } catch (e) {
            console.log(e);
        }
        delete obj;

        obj = jaxon.tools.queue.pop(theQ);
    }
    return true;
};

/*
Function: jaxon.ajax.response.setWakeup

Set or reset a timeout that is used to restart processing
of the queue.  This allows the queue to asynchronously wait
for an event to occur (giving the browser time to process
pending events, like loading files)

Parameters: 

theQ - (object):
    The queue to process upon timeout.
    
when - (integer):
    The number of milliseconds to wait before starting/
    restarting the processing of the queue.
*/
jaxon.ajax.response.setWakeup = function(theQ, when) {
    if (null != theQ.timeout) {
        clearTimeout(theQ.timeout);
        theQ.timeout = null;
    }
    theQ.timout = setTimeout(function() { jaxon.ajax.response.process(theQ); }, when);
};

jaxon.ajax.processor.json = function(oRequest) {

    var xx = jaxon;
    var xt = xx.tools;
    var xcb = xx.fn.callback;
    var gcb = xx.callback;
    var lcb = oRequest.callback;

    var oRet = oRequest.returnValue;

    if (xt.array.is_in(xx.ajax.response.successCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onSuccess', oRequest);
        var seq = 0;
        if (oRequest.request.responseText) {
            try {
                var responseJSON = eval('(' + oRequest.request.responseText + ')');
            } catch (ex) {
                throw (ex);
            }
            if (('object' == typeof responseJSON) && ('object' == typeof responseJSON.jxnobj)) {
                oRequest.status.onProcessing();
                oRet = xt.ajax.processFragment(responseJSON, seq, oRet, oRequest);
            } else {}
        }
        var obj = {};
        obj.fullName = 'Response Complete';
        obj.sequence = seq;
        obj.request = oRequest;
        obj.context = oRequest.context;
        obj.cmd = 'rcmplt';
        xt.queue.push(xx.response, obj);

        // do not re-start the queue if a timeout is set
        if (null == xx.response.timeout)
            xx.ajax.response.process(xx.response);
    } else if (xt.array.is_in(xx.ajax.response.redirectCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onRedirect', oRequest);
        window.location = oRequest.request.getResponseHeader('location');
        xx.ajax.response.complete(oRequest);
    } else if (xt.array.is_in(xx.ajax.response.errorsForAlert, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onFailure', oRequest);
        xx.ajax.response.complete(oRequest);
    }

    return oRet;
};

/*
Object: jaxon.ajax.response.successCodes

This array contains a list of codes which will be returned from the 
server upon successful completion of the server portion of the 
request.

These values should match those specified in the HTTP standard.
*/
jaxon.ajax.response.successCodes = ['0', '200'];

// 10.4.1 400 Bad Request
// 10.4.2 401 Unauthorized
// 10.4.3 402 Payment Required
// 10.4.4 403 Forbidden
// 10.4.5 404 Not Found
// 10.4.6 405 Method Not Allowed
// 10.4.7 406 Not Acceptable
// 10.4.8 407 Proxy Authentication Required
// 10.4.9 408 Request Timeout
// 10.4.10 409 Conflict
// 10.4.11 410 Gone
// 10.4.12 411 Length Required
// 10.4.13 412 Precondition Failed
// 10.4.14 413 Request Entity Too Large
// 10.4.15 414 Request-URI Too Long
// 10.4.16 415 Unsupported Media Type
// 10.4.17 416 Requested Range Not Satisfiable
// 10.4.18 417 Expectation Failed
// 10.5 Server Error 5xx
// 10.5.1 500 Internal Server Error
// 10.5.2 501 Not Implemented
// 10.5.3 502 Bad Gateway
// 10.5.4 503 Service Unavailable
// 10.5.5 504 Gateway Timeout
// 10.5.6 505 HTTP Version Not Supported

/*
Object: jaxon.ajax.response.errorsForAlert

This array contains a list of status codes returned by
the server to indicate that the request failed for some
reason.
*/
jaxon.ajax.response.errorsForAlert = ['400', '401', '402', '403', '404', '500', '501', '502', '503'];

// 10.3.1 300 Multiple Choices
// 10.3.2 301 Moved Permanently
// 10.3.3 302 Found
// 10.3.4 303 See Other
// 10.3.5 304 Not Modified
// 10.3.6 305 Use Proxy
// 10.3.7 306 (Unused)
// 10.3.8 307 Temporary Redirect

/*
Object: jaxon.ajax.response.redirectCodes

An array of status codes returned from the server to
indicate a request for redirect to another URL.

Typically, this is used by the server to send the browser
to another URL.  This does not typically indicate that
the jaxon request should be sent to another URL.
*/
jaxon.ajax.response.redirectCodes = ['301', '302', '307'];