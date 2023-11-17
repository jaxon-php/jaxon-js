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
        const xx = jaxon;
        const xc = xx.config;

        oRequest.append = function(opt, def) {
            if('undefined' == typeof this[opt])
                this[opt] = {};
            for (const itmName in def)
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
        oRequest.set('convertResponseToJson', xc.convertResponseToJson);
        oRequest.set('retry', xc.defaultRetry);
        oRequest.set('returnValue', xc.defaultReturnValue);
        oRequest.set('maxObjectDepth', xc.maxObjectDepth);
        oRequest.set('maxObjectSize', xc.maxObjectSize);
        oRequest.set('context', window);
        oRequest.set('upload', false);
        oRequest.set('aborted', false);

        const xcb = xx.ajax.callback;
        const lcb = xcb.create();

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
        if(oRequest.method !== 'GET')
            oRequest.method = 'POST'; // W3C: Method is case sensitive

        oRequest.requestRetry = oRequest.retry;

        // Look for upload parameter
        oRequest.ajax = !!window.FormData;
        jaxon.tools.upload.initialize(oRequest);

        delete oRequest['append'];
        delete oRequest['set'];
        delete lcb['take'];

        if('undefined' == typeof oRequest.URI)
            throw { code: 10005 };
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
        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onPrepare', oRequest);

        // Check if the request must be aborted
        if(oRequest.aborted === true) {
            return false;
        }

        oRequest.responseHandler = function(responseContent) {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if(jaxon.tools.queue.empty(jaxon.cmd.delay.q.send) || oRequest.mode === 'synchronous') {
                jaxon.ajax.response.received(oRequest);
            } else {
                jaxon.tools.queue.push(jaxon.cmd.delay.q.recv, oRequest);
            }
        };

        // No request is submitted while there are pending requests in the outgoing queue.
        const submitRequest = jaxon.tools.queue.empty(jaxon.cmd.delay.q.send);
        if(oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            jaxon.tools.queue.push(jaxon.cmd.delay.q.send, oRequest);
            jaxon.tools.queue.push(jaxon.cmd.delay.q.recv, oRequest);
        } else if(!submitRequest) {
            // Asynchronous requests are queued in send queue only if they are not submitted.
            jaxon.tools.queue.push(jaxon.cmd.delay.q.send, oRequest);
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

        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onResponseDelay', oRequest);
        xcb.execute([gcb, lcb], 'onExpiration', oRequest);
        xcb.execute([gcb, lcb], 'onRequest', oRequest);

        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        const headers = {
            ...oRequest.commonHeaders,
            ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
        };

        fetch(oRequest.requestURI, {
            method: oRequest.method,
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            redirect: "manual", // manual, *follow, error
            headers,
            body: oRequest.requestData,
        }).then(response => {
            // Save the reponse object
            oRequest.response = response;
            // Get the response content
            return oRequest.convertResponseToJson ? response.json() : response.text();
        }).then(oRequest.responseHandler);

        return oRequest.returnValue;
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

    functionArgs - (object, optional):  A request object which
        may contain call specific parameters.  This object will be
        used by jaxon to store all the request parameters as well
        as temporary variables needed during the processing of the
        request.

    */
    execute: function(functionName, functionArgs) {
        if(functionName === undefined)
            return false;

        const oRequest = functionArgs ?? {};
        oRequest.functionName = functionName;

        const xx = jaxon;
        xx.ajax.request.initialize(oRequest);
        xx.ajax.parameters.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                if(xx.ajax.request.prepare(oRequest))
                {
                    --oRequest.requestRetry;
                    return xx.ajax.request.submit(oRequest);
                }
                return null;
            } catch (e) {
                jaxon.ajax.callback.execute([jaxon.callback, oRequest.callback], 'onFailure', oRequest);
                if(oRequest.requestRetry === 0)
                    throw e;
            }
        }
    }
};
