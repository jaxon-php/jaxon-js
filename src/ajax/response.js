/**
 * Class: jaxon.ajax.response
 */

(function(self, config, handler, req, cbk, queue, types) {
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
    const errorsForAlert = [400, 401, 402, 403, 404, 500, 501, 502, 503];

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
     * An object that will hold temp vars
     *
     * @type {object}
     */
    const _temp = {};

    /**
     * Parse the JSON response into a series of commands.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    const queueCommands = (oRequest) => {
        if (!types.isObject(oRequest.responseContent)) {
            return;
        }
        const {
            debug: { message } = {},
            jxn: { value, commands = [] } = {},
        } = oRequest.responseContent;

        oRequest.status.onProcessing();

        if (value) {
            oRequest.returnValue = value;
        }

        message && console.log(message);

        _temp.sequence = 0;
        commands.forEach(command => queue.push(oRequest.commandQueue, {
            fullName: '*unknown*',
            ...command,
            sequence: _temp.sequence++,
            response: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));
        // Queue a last command to clear the queue
        queue.push(oRequest.commandQueue, {
            name: 'response.complete',
            fullName: 'Response Complete',
            sequence: _temp.sequence,
            request: oRequest,
            context: oRequest.context,
        });
    };

    /**
     * Process a single command
     * 
     * @param {object} commandQueue A queue containing the commands to execute.
     * @param {object} command The command to process
     *
     * @returns {boolean}
     */
    const processCommand = (commandQueue, command) => {
        try {
            if (handler.execute(command) === true || !command.requeue) {
                return true;
            }
            queue.pushFront(commandQueue, command);
            return false;
        } catch (e) {
            console.log(e);
        }
        return true;
    };

    /**
     * While entries exist in the queue, pull and entry out and process it's command.
     * When a command returns false, the processing is halted.
     *
     * Note:
     * - Use <jaxon.ajax.handler.setWakeup> or call this function to cause the queue processing to continue.
     * - This will clear the associated timeout, this function is not designed to be reentrant.
     * - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
     *
     * @param {object} oRequest The request context object.
     * @param {object} oRequest.commandQueue A queue containing the commands to execute.
     *
     * @returns {true} The queue was fully processed and is now empty.
     * @returns {false} The queue processing was halted before the queue was fully processed.
     */
    const processCommands = ({ commandQueue }) => {
        if (commandQueue.timeout !== null) {
            clearTimeout(commandQueue.timeout);
            commandQueue.timeout = null;
        }

        while ((_temp.command = queue.pop(commandQueue)) !== null) {
            if (!processCommand(commandQueue, _temp.command)) {
                return false;
            }
        }
        return true;
    };

    /**
     * This is the JSON response processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.jsonProcessor = (oRequest) => {
        if (successCodes.indexOf(oRequest.response.status) >= 0/*oRequest.response.ok*/) {
            cbk.execute(oRequest, 'onSuccess');
            // Queue and process the commands in the response.
            queueCommands(oRequest)
            processCommands(oRequest);
            return oRequest.returnValue;
        }
        if (redirectCodes.indexOf(oRequest.response.status) >= 0) {
            cbk.execute(oRequest, 'onRedirect');
            req.complete(oRequest);
            window.location = oRequest.response.headers.get('location');
            return oRequest.returnValue;
        }
        if (errorsForAlert.indexOf(oRequest.response.status) >= 0) {
            cbk.execute(oRequest, 'onFailure');
            req.complete(oRequest);
            return oRequest.returnValue;
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
    jaxon.ajax.callback, jaxon.utils.queue, jaxon.utils.types);
