/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, handler, upload, queue, window) {
    /**
     * Move all the callbacks defined directly in the oRequest object to the
     * oRequest.callback property, which may then be converted to an array.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const initCallbacks = (oRequest) => {
        const callback = cbk.create();

        let callbackFound = false;
        cbk.aCallbackNames.forEach(sName => {
            if (oRequest[sName] !== undefined) {
                callback[sName] = oRequest[sName];
                callbackFound = true;
                delete oRequest[sName];
            }
        });

        if (oRequest.callback === undefined) {
            oRequest.callback = callback;
            return;
        }
        // Add the timers attribute, if it is not defined.
        if (oRequest.callback.timers === undefined) {
            oRequest.callback.timers = {};
        }
        if (callbackFound) {
            oRequest.callback = [oRequest.callback, callback];
        }
    };

    /**
     * Initialize a request object, populating default settings, where call specific
     * settings are not already provided.
     *
     * @param {object} oRequest An object that specifies call specific settings that will,
     * in addition, be used to store all request related values.
     * This includes temporary values used internally by jaxon.
     *
     * @returns {void}
     */
    const initialize = (oRequest) => {
        const aHeaders = ['commonHeaders', 'postHeaders', 'getHeaders'];
        aHeaders.forEach(sHeader => oRequest[sHeader] = { ...cfg[sHeader], ...oRequest[sHeader] });

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
        Object.keys(oOptions).forEach(sOption => oRequest[sOption] = oRequest[sOption] ?? oOptions[sOption]);

        initCallbacks(oRequest);

        oRequest.status = (oRequest.statusMessages) ? cfg.status.update() : cfg.status.dontUpdate();

        oRequest.cursor = (oRequest.waitCursor) ? cfg.cursor.update() : cfg.cursor.dontUpdate();

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

    /**
     * Prepares the XMLHttpRequest object for this jaxon request.
     *
     * @param {object} oRequest An object created by a call to <jaxon.ajax.request.initialize>
     * which already contains the necessary parameters and temporary variables needed to
     * initiate and process a jaxon request.
     *
     * Note:
     * This is called each time a request object is being prepared for a call to the server.
     * If the request is retried, the request must be prepared again.
     *
     * @returns {boolean}
     */
    const prepare = (oRequest) => {
        cbk.execute(oRequest, 'onPrepare');

        // Check if the request must be aborted
        if (oRequest.aborted === true) {
            return false;
        }

        oRequest.responseHandler = function(responseContent) {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(handler.q.send) || oRequest.mode === 'synchronous') {
                rsp.received(oRequest);
            } else {
                queue.push(handler.q.recv, oRequest);
            }
        };

        // No request is submitted while there are pending requests in the outgoing queue.
        const submitRequest = queue.empty(handler.q.send);
        if (oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            queue.push(handler.q.send, oRequest);
            queue.push(handler.q.recv, oRequest);
            return submitRequest;
        }
        // Asynchronous requests are queued in send queue only if they are not submitted.
        submitRequest || queue.push(handler.q.send, oRequest);
        return submitRequest;
    };

    /**
     * Create a request object and submit the request using the specified request type;
     * all request parameters should be finalized by this point.
     * Upon failure of a POST, this function will fall back to a GET request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {mixed}
     */
    const submit = (oRequest) => {
        oRequest.status.onRequest();

        cbk.execute(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'onExpiration');
        cbk.execute(oRequest, 'onRequest');

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
                cbk.execute(oRequest, 'onFailure');
                throw error;
            });

        return oRequest.returnValue;
    };

    /**
     * Abort the request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    self.abort = (oRequest) => {
        oRequest.aborted = true;
        oRequest.request.abort();
        rsp.complete(oRequest);
    };

    /**
     * Initiates a request to the server.
     *
     * @param {object} func An object containing the name of the function to
     * execute on the server. The standard request is: {jxnfun:'function_name'}
     * @param {object=} funcArgs A request object which may contain call specific parameters.
     * This object will be used by jaxon to store all the request parameters as well as
     * temporary variables needed during the processing of the request.
     *
     * @returns {boolean}
     */
    self.execute = (func, funcArgs) => {
        if (func === undefined) {
            return false;
        }

        const oRequest = funcArgs ?? {};
        oRequest.func = func;

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
                cbk.execute(oRequest, 'onFailure');
                if (oRequest.requestRetry === 0) {
                    throw e;
                }
            }
        }
        return true;
    };
})(jaxon.ajax.request, jaxon.config, jaxon.ajax.parameters, jaxon.ajax.response,
    jaxon.ajax.callback, jaxon.ajax.handler, jaxon.utils.upload, jaxon.utils.queue, window);
