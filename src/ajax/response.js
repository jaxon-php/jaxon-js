/**
 * Class: jaxon.ajax.response
 */

(function(self, config, handler, req, cbk, queue) {
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
     * Parse the JSON response into a series of commands.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {int}
     */
    const queueCommands = (oRequest) => {
        const responseContent = oRequest.responseContent;
        if (!responseContent || !responseContent.jxnobj) {
            return 0;
        }

        oRequest.status.onProcessing();

        if (responseContent.jxnrv) {
            oRequest.returnValue = responseContent.jxnrv;
        }

        responseContent.debugmsg && console.log(responseContent.debugmsg);

        let nSequence = 0;
        responseContent.jxnobj.forEach(command => queue.push(oRequest.commandQueue, {
            fullName: '*unknown*',
            ...command,
            sequence: nSequence++,
            response: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));

        return nSequence;
    };

    /**
     * Queue the last command that is will end the response processing.
     *
     * @param {object} oRequest The request context object.
     * @param {int} nSequence The last command sequence
     *
     * @return {int}
     */
    const queueEndCommand = (oRequest, nSequence) => queue.push(oRequest.commandQueue, {
        fullName: 'Response Complete',
        sequence: nSequence,
        request: oRequest,
        context: oRequest.context,
        cmd: 'rcmplt',
    });

    /**
     * This is the JSON response processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.jsonProcessor = (oRequest) => {
        const status = oRequest.response.status;
        if (self.isSuccessCode(status)) {
            cbk.execute(oRequest, 'onSuccess');
            // Queue and process the commands in the response.
            const nSequence = queueCommands(oRequest)
            queueEndCommand(oRequest, nSequence);
            handler.processCommands(oRequest.commandQueue);
        }
        else if (self.isRedirectCode(status)) {
            cbk.execute(oRequest, 'onRedirect');
            req.complete(oRequest);
            window.location = oRequest.response.headers.get('location');
        }
        else if (self.isErrorCode(status)) {
            cbk.execute(oRequest, 'onFailure');
            req.complete(oRequest);
        }

        return oRequest.returnValue;
    };

    /**
     * Process the response.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.received = (oRequest) => {
        // Sometimes the response.received gets called when the request is aborted
        if (oRequest.aborted) {
            return null;
        }

        // Create a queue for the commands in the response.
        oRequest.commandQueue = queue.create(config.commandQueueSize);

        // The response is successfully received, clear the timers for expiration and delay.
        cbk.clearTimer(oRequest, 'onExpiration');
        cbk.clearTimer(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'beforeResponseProcessing');

        return oRequest.responseProcessor(oRequest);
    };
})(jaxon.ajax.response, jaxon.config, jaxon.ajax.handler, jaxon.ajax.request,
    jaxon.ajax.callback, jaxon.utils.queue);
