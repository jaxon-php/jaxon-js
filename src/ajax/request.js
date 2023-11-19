/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, upload, queue, delay, window) {
    /**
     * @param {object} oRequest
     *
     * @return {void}
     */
    const initCallbacks = (oRequest) => {
        const lcb = cbk.create();

        const aCallbacks = ['onPrepare', 'onRequest', 'onResponseDelay', 'onExpiration',
            'beforeResponseProcessing', 'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];
        aCallbacks.forEach(sCallback => {
            if (oRequest[sCallback] !== undefined) {
                lcb[sCallback] = oRequest[sCallback];
                lcb.hasEvents = true;
                delete oRequest[sCallback];
            }
        });

        if (oRequest.callback === undefined) {
            oRequest.callback = lcb;
            return;
        }
        // Add the timers attribute, if it is not defined.
        if (oRequest.callback.timers === undefined) {
            oRequest.callback.timers = [];
        }
        if (lcb.hasEvents) {
            oRequest.callback = [oRequest.callback, lcb];
        }
    };

    /*
    Function: jaxon.ajax.request.initialize

    Initialize a request object, populating default settings, where
    call specific settings are not already provided.

    Parameters:

    oRequest - (object):  An object that specifies call specific settings
        that will, in addition, be used to store all request related
        values.  This includes temporary values used internally by jaxon.
    */
    const initialize = (oRequest) => {
        const aHeaders = ['commonHeaders', 'postHeaders', 'getHeaders'];
        aHeaders.forEach(sHeader => {
            oRequest[sHeader] = { ...cfg[sHeader], ...oRequest[sHeader] };
        });

        const oOptions = {
            statusMessages: cfg.statusMessages,
            waitCursor: cfg.waitCursor,
            mode: cfg.defaultMode,
            method: cfg.defaultMethod,
            URI: cfg.requestURI,
            httpVersion: cfg.defaultHttpVersion,
            contentType: cfg.defaultContentType,
            convertResponseToJson: cfg.convertResponseToJson,
            retry: cfg.defaultRetry,
            returnValue: cfg.defaultReturnValue,
            maxObjectDepth: cfg.maxObjectDepth,
            maxObjectSize: cfg.maxObjectSize,
            context: window,
            upload: false,
            aborted: false,
        };
        Object.keys(oOptions).forEach(sOption => {
            oRequest[sOption] = oRequest[sOption] ?? oOptions[sOption];
        });

        initCallbacks(oRequest);

        oRequest.status = (oRequest.statusMessages) ?
            cfg.status.update() :
            cfg.status.dontUpdate();

        oRequest.cursor = (oRequest.waitCursor) ?
            cfg.cursor.update() :
            cfg.cursor.dontUpdate();

        oRequest.method = oRequest.method.toUpperCase();
        if (oRequest.method !== 'GET') {
            oRequest.method = 'POST'; // W3C: Method is case sensitive
        }
        oRequest.requestRetry = oRequest.retry;

        // Look for upload parameter
        upload.initialize(oRequest);

        if (oRequest.URI === undefined) {
            throw { code: 10005 };
        }
    };

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
    const prepare = (oRequest) => {
        cbk.execute([cbk.callback, oRequest.callback], 'onPrepare', oRequest);

        // Check if the request must be aborted
        if (oRequest.aborted === true) {
            return false;
        }

        oRequest.responseHandler = function(responseContent) {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(delay.q.send) || oRequest.mode === 'synchronous') {
                rsp.received(oRequest);
            } else {
                queue.push(delay.q.recv, oRequest);
            }
        };

        // No request is submitted while there are pending requests in the outgoing queue.
        const submitRequest = queue.empty(delay.q.send);
        if (oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            queue.push(delay.q.send, oRequest);
            queue.push(delay.q.recv, oRequest);
            return submitRequest;
        }
        // Asynchronous requests are queued in send queue only if they are not submitted.
        submitRequest || queue.push(delay.q.send, oRequest);
        return submitRequest;
    };

    /*
    Function: jaxon.ajax.request.submit

    Create a request object and submit the request using the specified request type;
    all request parameters should be finalized by this point.
    Upon failure of a POST, this function will fall back to a GET request.

    Parameters:
    oRequest - (object):  The request context object.
    */
    const submit = (oRequest) => {
        oRequest.status.onRequest();

        cbk.execute([cbk.callback, oRequest.callback], 'onResponseDelay', oRequest);
        cbk.execute([cbk.callback, oRequest.callback], 'onExpiration', oRequest);
        cbk.execute([cbk.callback, oRequest.callback], 'onRequest', oRequest);

        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        const headers = {
            ...oRequest.commonHeaders,
            ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
        };

        const oOptions = {
            method: oRequest.method,
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            redirect: "manual", // manual, *follow, error
            headers,
            body: oRequest.requestData,
        };
        fetch(oRequest.requestURI, oOptions)
            .then(response => {
                // Save the reponse object
                oRequest.response = response;
                // Get the response content
                return oRequest.convertResponseToJson ? response.json() : response.text();
            })
            .then(oRequest.responseHandler)
            .catch(error => {
                cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
                throw error;
            });

        return oRequest.returnValue;
    };

    /*
    Function: jaxon.ajax.request.abort

    Abort the request.

    Parameters:

    oRequest - (object):  The request context object.
    */
    self.abort = (oRequest) => {
        oRequest.aborted = true;
        oRequest.request.abort();
        rsp.complete(oRequest);
    };

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
    self.execute = (functionName, functionArgs) => {
        if (functionName === undefined) {
            return false;
        }

        const oRequest = functionArgs ?? {};
        oRequest.functionName = functionName;

        initialize(oRequest);
        params.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                if (prepare(oRequest)) {
                    --oRequest.requestRetry;
                    return submit(oRequest);
                }
                return null;
            }
            catch (e) {
                cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
                if (oRequest.requestRetry === 0) {
                    throw e;
                }
            }
        }
    };
})(jaxon.ajax.request, jaxon.config, jaxon.ajax.parameters, jaxon.ajax.response,
    jaxon.ajax.callback, jaxon.utils.upload, jaxon.utils.queue, jaxon.utils.delay, window);
