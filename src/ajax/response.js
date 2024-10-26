/**
 * Class: jaxon.ajax.response
 */

(function(self, command, req, cbk, queue) {
    /**
     * This array contains a list of codes which will be returned from the server upon
     * successful completion of the server portion of the request.
     *
     * These values should match those specified in the HTTP standard.
     *
     * @var {array}
     */
    const successCodes = [0, 200];

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

    /**
     * This array contains a list of status codes returned by the server to indicate
     * that the request failed for some reason.
     *
     * @var {array}
     */
    const errorCodes = [400, 401, 402, 403, 404, 500, 501, 502, 503];

    // 10.3.1 300 Multiple Choices
    // 10.3.2 301 Moved Permanently
    // 10.3.3 302 Found
    // 10.3.4 303 See Other
    // 10.3.5 304 Not Modified
    // 10.3.6 305 Use Proxy
    // 10.3.7 306 (Unused)
    // 10.3.8 307 Temporary Redirect

    /**
     * An array of status codes returned from the server to indicate a request for redirect to another URL.
     *
     * Typically, this is used by the server to send the browser to another URL.
     * This does not typically indicate that the jaxon request should be sent to another URL.
     *
     * @var {array}
     */
    const redirectCodes = [301, 302, 307];

    /**
     * Check if a status code indicates a success.
     *
     * @param {int} nStatusCode A status code.
     *
     * @return {bool}
     */
    self.isSuccessCode = nStatusCode => successCodes.indexOf(nStatusCode) >= 0;

    /**
     * Check if a status code indicates a redirect.
     *
     * @param {int} nStatusCode A status code.
     *
     * @return {bool}
     */
    self.isRedirectCode = nStatusCode => redirectCodes.indexOf(nStatusCode) >= 0;

    /**
     * Check if a status code indicates an error.
     *
     * @param {int} nStatusCode A status code.
     *
     * @return {bool}
     */
    self.isErrorCode = nStatusCode => errorCodes.indexOf(nStatusCode) >= 0;

    /**
     * This is the JSON response processor.
     *
     * @param {object} oRequest The request context object.
     * @param {object} oResponse The response context object.
     * @param {object} oResponse.http The response object.
     * @param {integer} oResponse.http.status The response status.
     * @param {object} oResponse.http.headers The response headers.
     *
     * @return {true}
     */
    const jsonProcessor = (oRequest, { http: { status, headers } }) => {
        if (self.isSuccessCode(status)) {
            cbk.execute(oRequest, 'onSuccess');
            // Queue and process the commands in the response.
            command.processCommands(oRequest);
            return true;
        }
        if (self.isRedirectCode(status)) {
            cbk.execute(oRequest, 'onRedirect');
            self.complete(oRequest);
            window.location = headers.get('location');
            return true;
        }
        if (self.isErrorCode(status)) {
            cbk.execute(oRequest, 'onFailure');
            self.complete(oRequest);
            return true;
        }
        return true;
    };

    /**
     * Process the response.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.received = (oRequest) => {
        const { aborted, response: oResponse } = oRequest;
        // Sometimes the response.received gets called when the request is aborted
        if (aborted) {
            return null;
        }

        // The response is successfully received, clear the timers for expiration and delay.
        cbk.clearTimer(oRequest, 'onExpiration');
        cbk.clearTimer(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'beforeResponseProcessing');

        return oResponse.processor(oRequest, oResponse);
    };

    /**
     * Prepare a request, by setting the handlers and processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    self.create = (oRequest) => ({
        processor: jsonProcessor,
        ...oRequest.response,
        converter: (http) => {
            // Save the reponse object
            oRequest.response.http = http;
            // Get the response content
            return oRequest.response.convertToJson ? http.json() : http.text();
        },
        handler: (content) => {
            oRequest.response.content = content;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(req.q.send) || oRequest.mode === 'synchronous') {
                self.received(oRequest);
                return;
            }
            queue.push(req.q.recv, oRequest);
        },
        errorHandler: (error) => {
            cbk.execute(oRequest, 'onFailure');
            throw error;
        },
    });

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
        delete oRequest.httpRequestOptions;
        delete oRequest.response;
    };

    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    const popAsyncRequest = oQueue => {
        if (queue.empty(oQueue) || queue.peek(oQueue).mode === 'synchronous') {
            return null;
        }
        return queue.pop(oQueue);
    }

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
            // Remove the current request from the send queues.
            queue.pop(req.q.send);
            // Process the asynchronous responses received while waiting.
            while((recvRequest = popAsyncRequest(req.q.recv)) !== null) {
                self.received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((sendRequest = popAsyncRequest(req.q.send)) !== null) {
                req.submit(sendRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((sendRequest = queue.peek(req.q.send)) !== null) {
                req.submit(sendRequest);
            }
        }
    };
})(jaxon.ajax.response, jaxon.ajax.command, jaxon.ajax.request, jaxon.ajax.callback,
    jaxon.utils.queue);
