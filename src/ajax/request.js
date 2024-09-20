/**
 * Class: jaxon.ajax.request
 */

(function(self, config, params, rsp, cbk, upload, queue) {
    /**
     * The queues that hold synchronous requests as they are sent and processed.
     *
     * @var {object}
     */
    self.q = {
        send: queue.create(config.requestQueueSize),
        recv: queue.create(config.requestQueueSize * 2),
    };

    /**
     * Copy the value of the csrf meta tag to the request headers.
     *
     * @param {string} sTagName The request context object.
     *
     * @return {void}
     */
    self.setCsrf = (sTagName) => {
        const metaTags = config.baseDocument.getElementsByTagName('meta') || [];
        for (const metaTag of metaTags) {
            if (metaTag.getAttribute('name') === sTagName) {
                const csrfToken = metaTag.getAttribute('content');
                if ((csrfToken)) {
                    config.postHeaders['X-CSRF-TOKEN'] = csrfToken;
                }
                return;
            }
        }
    };

    /**
     * Initialize a request object.
     *
     * @param {object} oRequest An object that specifies call specific settings that will,
     *      in addition, be used to store all request related values.
     *      This includes temporary values used internally by jaxon.
     *
     * @returns {void}
     */
    self.initialize = (oRequest) => {
        config.setRequestOptions(oRequest);
        cbk.initCallbacks(oRequest);
        cbk.execute(oRequest, 'onInitialize');

        oRequest.status = (oRequest.statusMessages) ? config.status.update : config.status.dontUpdate;
        oRequest.cursor = (oRequest.waitCursor) ? config.cursor.update : config.cursor.dontUpdate;

        // Look for upload parameter
        upload.initialize(oRequest);

        // The request is submitted only if there is no pending requests in the outgoing queue.
        oRequest.submit = queue.empty(self.q.send);

        // Synchronous requests are always queued.
        // Asynchronous requests are queued in send queue only if they are not submitted.
        oRequest.queued = false;
        if (!oRequest.submit || oRequest.mode === 'synchronous') {
            queue.push(self.q.send, oRequest);
            oRequest.queued = true;
        }
    };

    /**
     * Prepare a request, by setting the HTTP options, handlers and processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    self.prepare = (oRequest) => {
        cbk.execute(oRequest, 'onPrepare');

        oRequest.httpRequestOptions = {
            ...config.httpRequestOptions,
            method: oRequest.method,
            headers: {
                ...oRequest.commonHeaders,
                ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
            },
            body: oRequest.requestData,
        };

        oRequest.response = rsp.create(oRequest);
    };

    /**
     * Send a request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    self._send = (oRequest) => {
        fetch(oRequest.requestURI, oRequest.httpRequestOptions)
            .then(oRequest.response.converter)
            .then(oRequest.response.handler)
            .catch(oRequest.response.errorHandler);
    };

    /**
     * Create a request object and submit the request using the specified request type;
     * all request parameters should be finalized by this point.
     * Upon failure of a POST, this function will fall back to a GET request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    const submit = (oRequest) => {
        self.prepare(oRequest);
        oRequest.status.onRequest();

        // The onResponseDelay and onExpiration aren't called immediately, but a timer
        // is set to call them later, using delays that are set in the config.
        cbk.execute(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'onExpiration');
        cbk.execute(oRequest, 'onRequest');
        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        self._send(oRequest);
    };

    /**
     * Create a request object and submit the request using the specified request type.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    self.submit = (oRequest) => {
        while (oRequest.requestRetry-- > 0) {
            try {
                submit(oRequest);
                return;
            }
            catch (e) {
                cbk.execute(oRequest, 'onFailure');
                if (oRequest.requestRetry <= 0) {
                    throw e;
                }
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
        rsp.complete(oRequest);
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
     * @returns {void}
     */
    self.execute = (func, funcArgs) => {
        if (func === undefined) {
            return;
        }

        const oRequest = funcArgs ?? {};
        oRequest.func = func;
        self.initialize(oRequest);

        cbk.execute(oRequest, 'onProcessParams');
        params.process(oRequest);

        oRequest.submit && self.submit(oRequest);
    };
})(jaxon.ajax.request, jaxon.config, jaxon.ajax.parameters, jaxon.ajax.response,
    jaxon.ajax.callback, jaxon.utils.upload, jaxon.utils.queue);
