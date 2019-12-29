jaxon.ajax.request = {
    /*
    Function: jaxon.ajax.request.initialize

    Initialize a request object, populating default settings, where
    call specific settings are not already provided.

    Parameters:

    oRequest - (object):  An object that specifies call specific settings
        that will, in addition, be used to store all request related
        values.  This includes temporary values used internally by jaxon.
    */
    initialize: function(oRequest) {
        var xx = jaxon;
        var xc = xx.config;

        oRequest.append = function(opt, def) {
            if('undefined' == typeof this[opt])
                this[opt] = {};
            for (var itmName in def)
                if('undefined' == typeof this[opt][itmName])
                    this[opt][itmName] = def[itmName];
        };

        oRequest.append('commonHeaders', xc.commonHeaders);
        oRequest.append('postHeaders', xc.postHeaders);
        oRequest.append('getHeaders', xc.getHeaders);

        oRequest.set = function(option, defaultValue) {
            if('undefined' == typeof this[option])
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
        oRequest.set('aborted', false);

        var xcb = xx.ajax.callback;
        var gcb = xx.callback;
        var lcb = xcb.create();

        lcb.take = function(frm, opt) {
            if('undefined' != typeof frm[opt]) {
                lcb[opt] = frm[opt];
                lcb.hasEvents = true;
            }
            delete frm[opt];
        };

        lcb.take(oRequest, 'onPrepare');
        lcb.take(oRequest, 'onRequest');
        lcb.take(oRequest, 'onResponseDelay');
        lcb.take(oRequest, 'onExpiration');
        lcb.take(oRequest, 'beforeResponseProcessing');
        lcb.take(oRequest, 'onFailure');
        lcb.take(oRequest, 'onRedirect');
        lcb.take(oRequest, 'onSuccess');
        lcb.take(oRequest, 'onComplete');

        if('undefined' != typeof oRequest.callback) {
            // Add the timers attribute, if it is not defined.
            if('undefined' == typeof oRequest.callback.timers) {
                oRequest.callback.timers = [];
            }
            if(lcb.hasEvents) {
                oRequest.callback = [oRequest.callback, lcb];
            }
        } else {
            oRequest.callback = lcb;
        }

        oRequest.status = (oRequest.statusMessages) ?
            xc.status.update() :
            xc.status.dontUpdate();

        oRequest.cursor = (oRequest.waitCursor) ?
            xc.cursor.update() :
            xc.cursor.dontUpdate();

        oRequest.method = oRequest.method.toUpperCase();
        if('GET' != oRequest.method)
            oRequest.method = 'POST'; // W3C: Method is case sensitive

        oRequest.requestRetry = oRequest.retry;

        // Look for upload parameter
        jaxon.tools.upload.initialize(oRequest);

        delete oRequest['append'];
        delete oRequest['set'];
        delete lcb['take'];

        if('undefined' == typeof oRequest.URI)
            throw { code: 10005 };
    },

    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param object oQueue   The queue object you would like to modify.
     *
     * @returns object|null The object that was at the head of the queue or null if the queue was empty.
     */
    popAsyncRequest: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue))
        {
            return null;
        }
        if(jaxon.tools.queue.peek(oQueue).mode == 'synchronous')
        {
            return null;
        }
        return jaxon.tools.queue.pop(oQueue);
    },

    /*
    Function: jaxon.ajax.request.prepare

    Prepares the XMLHttpRequest object for this jaxon request.

    Parameters:

    oRequest - (object):  An object created by a call to <jaxon.ajax.request.initialize>
        which already contains the necessary parameters and temporary variables
        needed to initiate and process a jaxon request.

    Note:
    This is called each time a request object is being prepared for a call to the server.
    If the request is retried, the request must be prepared again.
    */
    prepare: function(oRequest) {
        var xx = jaxon;
        var xt = xx.tools;
        var xcb = xx.ajax.callback;
        var gcb = xx.callback;
        var lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onPrepare', oRequest);

        // Check if the request must be aborted
        if(oRequest.aborted == true) {
            return false;
        }

        oRequest.request = xt.ajax.createRequest();

        oRequest.setRequestHeaders = function(headers) {
            if('object' == typeof headers) {
                for (var optionName in headers)
                    this.request.setRequestHeader(optionName, headers[optionName]);
            }
        };
        oRequest.setCommonRequestHeaders = function() {
            this.setRequestHeaders(this.commonHeaders);
            if(this.challengeResponse)
                this.request.setRequestHeader('challenge-response', this.challengeResponse);
        };
        oRequest.setPostRequestHeaders = function() {
            this.setRequestHeaders(this.postHeaders);
        };
        oRequest.setGetRequestHeaders = function() {
            this.setRequestHeaders(this.getHeaders);
        };

        // if('asynchronous' == oRequest.mode) {
            // references inside this function should be expanded
            // IOW, don't use shorthand references like xx for jaxon
        /*} else {
            oRequest.finishRequest = function() {
                return jaxon.ajax.response.received(oRequest);
            };
        }*/
        oRequest.request.onreadystatechange = function() {
            if(oRequest.request.readyState != 4) {
                return;
            }
            let gar = jaxon.ajax.request;
            // Process synchronous request
            if('synchronous' == oRequest.mode) {
                // Process the request and remove it from the send and recv queues.
                jaxon.ajax.response.received(oRequest);
                jaxon.tools.queue.pop(jaxon.ajax.request.q.send);
                jaxon.tools.queue.pop(jaxon.ajax.request.q.recv);
                // Process the asynchronous requests received while waiting.
                while((recvRequest = gar.popAsyncRequest(jaxon.ajax.request.q.recv)) != null) {
                    jaxon.ajax.response.received(recvRequest);
                }
                // Submit the asynchronous requests sent while waiting.
                while((nextRequest = gar.popAsyncRequest(jaxon.ajax.request.q.send)) != null) {
                    jaxon.ajax.request.submit(nextRequest);
                }
                // Submit the next synchronous request, if there's any.
                if((nextRequest = jaxon.tools.queue.peek(jaxon.ajax.request.q.send)) != null) {
                    jaxon.ajax.request.submit(nextRequest);
                }
            }
            // Process asynchronous request
            else if(jaxon.tools.queue.empty(jaxon.ajax.request.q.send)) {
                jaxon.ajax.response.received(oRequest);
            }
            else {
                jaxon.tools.queue.push(jaxon.ajax.request.q.recv, oRequest);
            }
        };
        oRequest.finishRequest = function() {
            return this.returnValue;
        };

        if('undefined' != typeof oRequest.userName && 'undefined' != typeof oRequest.password) {
            oRequest.open = function() {
                this.request.open(
                    this.method,
                    this.requestURI,
                    true, // 'asynchronous' == this.mode,
                    oRequest.userName,
                    oRequest.password);
            };
        } else {
            oRequest.open = function() {
                this.request.open(
                    this.method,
                    this.requestURI,
                    true); // 'asynchronous' == this.mode);
            };
        }

        if('POST' == oRequest.method) { // W3C: Method is case sensitive
            oRequest.applyRequestHeaders = function() {
                this.setCommonRequestHeaders();
                try {
                    this.setPostRequestHeaders();
                } catch (e) {
                    this.method = 'GET';
                    this.requestURI += this.requestURI.indexOf('?') == -1 ? '?' : '&';
                    this.requestURI += this.requestData;
                    this.requestData = '';
                    if(0 == this.requestRetry) this.requestRetry = 1;
                    throw e;
                }
            }
        } else {
            oRequest.applyRequestHeaders = function() {
                this.setCommonRequestHeaders();
                this.setGetRequestHeaders();
            };
        }

        // No request is submitted while there are pending requests in the outgoing queue.
        let submitRequest = jaxon.tools.queue.empty(jaxon.ajax.request.q.send);
        if('synchronous' == oRequest.mode) {
            // Synchronous requests are always queued, in both send and recv queues.
            jaxon.tools.queue.push(jaxon.ajax.request.q.send, oRequest);
            jaxon.tools.queue.push(jaxon.ajax.request.q.recv, oRequest);
        }
        else if(!submitRequest) {
            // Asynchronous requests are queued in send queue only if they are not submitted.
            jaxon.tools.queue.push(jaxon.ajax.request.q.send, oRequest);
        }
        return submitRequest;
    },

    /*
    Function: jaxon.ajax.request.submit

    Create a request object and submit the request using the specified request type;
    all request parameters should be finalized by this point.
    Upon failure of a POST, this function will fall back to a GET request.

    Parameters:
    oRequest - (object):  The request context object.
    */
    submit: function(oRequest) {
        oRequest.status.onRequest();

        var xx = jaxon;
        var xcb = xx.ajax.callback;
        var gcb = xx.callback;
        var lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onResponseDelay', oRequest);
        xcb.execute([gcb, lcb], 'onExpiration', oRequest);
        xcb.execute([gcb, lcb], 'onRequest', oRequest);

        oRequest.open();
        oRequest.applyRequestHeaders();

        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        if(oRequest.upload != false && !oRequest.upload.ajax && oRequest.upload.form) {
            // The request will be sent after the files are uploaded
            oRequest.upload.iframe.onload = function() {
                jaxon.ajax.response.upload(oRequest);
            }
            // Submit the upload form
            oRequest.upload.form.submit();
        } else {
            jaxon.ajax.request._send(oRequest);
        }

        // synchronous mode causes response to be processed immediately here
        return oRequest.finishRequest();
    },

    /*
    Function: jaxon.ajax.request._send

    This function is used internally by jaxon to initiate a request to the server.

    Parameters:

    oRequest - (object):  The request context object.
    */
    _send: function(oRequest) {
        // this may block if synchronous mode is selected
        oRequest.request.send(oRequest.requestData);
    },

    /*
    Function: jaxon.ajax.request.abort

    Abort the request.

    Parameters:

    oRequest - (object):  The request context object.
    */
    abort: function(oRequest) {
        oRequest.aborted = true;
        oRequest.request.abort();
        jaxon.ajax.response.complete(oRequest);
    },

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
    execute: function() {
        var numArgs = arguments.length;
        if(0 == numArgs)
            return false;

        var oRequest = {};
        if(1 < numArgs)
            oRequest = arguments[1];

        oRequest.functionName = arguments[0];

        var xx = jaxon;

        xx.ajax.request.initialize(oRequest);
        xx.ajax.parameters.process(oRequest);
        while (0 < oRequest.requestRetry) {
            try {
                if(xx.ajax.request.prepare(oRequest))
                {
                    --oRequest.requestRetry;
                    return xx.ajax.request.submit(oRequest);
                }
                return null;
            } catch (e) {
                jaxon.ajax.callback.execute(
                    [jaxon.callback, oRequest.callback],
                    'onFailure',
                    oRequest
                );
                if(0 == oRequest.requestRetry)
                    throw e;
            }
        }
    }
};
