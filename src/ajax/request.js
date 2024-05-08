/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, handler, upload, queue) {
    /**
     * Initialize a request object.
     *
     * @param {object} oRequest An object that specifies call specific settings that will,
     *      in addition, be used to store all request related values.
     *      This includes temporary values used internally by jaxon.
     *
     * @returns {boolean}
     */
    const initialize = (oRequest) => {
        cbk.execute(oRequest, 'onInitialize');

        cfg.setRequestOptions(oRequest);
        cbk.initCallbacks(oRequest);

        oRequest.status = (oRequest.statusMessages) ? cfg.status.update : cfg.status.dontUpdate;
        oRequest.cursor = (oRequest.waitCursor) ? cfg.cursor.update : cfg.cursor.dontUpdate;

        // Look for upload parameter
        upload.initialize(oRequest);

        // No request is submitted while there are pending requests in the outgoing queue.
        oRequest.submit = queue.empty(handler.q.send);
        if (oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            queue.push(handler.q.send, oRequest);
            queue.push(handler.q.recv, oRequest);
        }
        // Asynchronous requests are queued in send queue only if they are not submitted.
        oRequest.submit || queue.push(handler.q.send, oRequest);
    };

    /**
     * Prepare a request, by setting the HTTP options, handlers and processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    const prepare = (oRequest) => {
        cbk.execute(oRequest, 'onPrepare');

        oRequest.httpRequestOptions = {
            ...cfg.httpRequestOptions,
            method: oRequest.method,
            headers: {
                ...oRequest.commonHeaders,
                ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
            },
            body: oRequest.requestData,
        };

        oRequest.responseConverter = (response) => {
            // Save the reponse object
            oRequest.response = response;
            // Get the response content
            return oRequest.convertResponseToJson ? response.json() : response.text();
        };
        oRequest.responseHandler = (responseContent) => {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(handler.q.send) || oRequest.mode === 'synchronous') {
                rsp.received(oRequest);
            } else {
                queue.push(handler.q.recv, oRequest);
            }
        };
        oRequest.errorHandler = (error) => {
            cbk.execute(oRequest, 'onFailure');
            throw error;
        };
        if (!oRequest.responseProcessor) {
            oRequest.responseProcessor = rsp.jsonProcessor;
        }
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
        --oRequest.requestRetry;
        oRequest.status.onRequest();

        // The onResponseDelay and onExpiration aren't called immediately, but a timer
        // is set to call them later, using delays that are set in the config.
        cbk.execute(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'onExpiration');

        cbk.execute(oRequest, 'onRequest');
        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        fetch(oRequest.requestURI, oRequest.httpRequestOptions)
            .then(oRequest.responseConverter)
            .then(oRequest.responseHandler)
            .catch(oRequest.errorHandler);

        return oRequest.returnValue;
    };

    /**
     * Clean up the request object.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    const cleanUp = (oRequest) => {
        // clean up -- these items are restored when the request is initiated
        delete oRequest.func;
        delete oRequest.URI;
        delete oRequest.requestURI;
        delete oRequest.requestData;
        delete oRequest.requestRetry;
        delete oRequest.httpRequestOptions;
        delete oRequest.responseHandler;
        delete oRequest.responseConverter;
        delete oRequest.responseContent;
        delete oRequest.response;
        delete oRequest.errorHandler;
    };

    /**
     * Called by the response command queue processor when all commands have been processed.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    self.complete = (oRequest) => {
        cbk.execute(oRequest, 'onComplete');
        oRequest.cursor.onComplete();
        oRequest.status.onComplete();

        cleanUp(oRequest);

        // All the requests and responses queued while waiting must now be processed.
        if(oRequest.mode === 'synchronous') {
            // Remove the current request from the send and recv queues.
            queue.pop(handler.q.send);
            queue.pop(handler.q.recv);
            // Process the asynchronous responses received while waiting.
            while((recvRequest = handler.popAsyncRequest(handler.q.recv)) !== null) {
                rsp.received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((nextRequest = handler.popAsyncRequest(handler.q.send)) !== null) {
                submit(nextRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((nextRequest = queue.peek(handler.q.send)) !== null) {
                submit(nextRequest);
            }
        }
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
        self.complete(oRequest);
    };

    /**
     * Initiates a request to the server.
     *
     * @param {object} func An object containing the name of the function to
     *      execute on the server. The standard request is: {jxnfun:'function_name'}
     * @param {object=} funcArgs A request object which may contain call specific parameters.
     *      This object will be used by jaxon to store all the request parameters as well as
     *      temporary variables needed during the processing of the request.
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

        cbk.execute(oRequest, 'onProcessParams');
        params.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                prepare(oRequest);
                return oRequest.submit ? submit(oRequest) : null;
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
    jaxon.ajax.callback, jaxon.ajax.handler, jaxon.utils.upload, jaxon.utils.queue);
