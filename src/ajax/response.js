jaxon.ajax.response = {
    /*
    Function: jaxon.ajax.response.received

    Process the response.

    Parameters:

    oRequest - (object):  The request context object.
    */
    received: function(oRequest) {
        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        // sometimes the responseReceived gets called when the request is aborted
        if (oRequest.aborted) {
            return null;
        }

        // Create a response queue for this request.
        oRequest.commandQueue = xx.tools.queue.create(xx.config.commandQueueSize);

        xcb.clearTimer([gcb, lcb], 'onExpiration');
        xcb.clearTimer([gcb, lcb], 'onResponseDelay');
        xcb.execute([gcb, lcb], 'beforeResponseProcessing', oRequest);

        const fProc = xx.ajax.response.processor(oRequest);
        if (!fProc) {
            xcb.execute([gcb, lcb], 'onFailure', oRequest);
            xx.ajax.response.complete(oRequest);
            return;
        }

        return fProc(oRequest);
    },

    /*
    Function: jaxon.ajax.response.complete

    Called by the response command queue processor when all commands have been processed.

    Parameters:

    oRequest - (object):  The request context object.
    */
    complete: function(oRequest) {
        jaxon.ajax.callback.execute(
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
        delete oRequest['responseHandler '];
        delete oRequest['responseContent'];
        delete oRequest['response'];
        delete oRequest['sequence'];
        delete oRequest['status'];
        delete oRequest['cursor'];

        // All the requests queued while waiting must now be processed.
        if(oRequest.mode === 'synchronous') {
            const jq = jaxon.tools.queue;
            const jd = jaxon.cmd.delay;
            // Remove the current request from the send and recv queues.
            jq.pop(jd.q.send);
            jq.pop(jd.q.recv);
            // Process the asynchronous requests received while waiting.
            while((recvRequest = jd.popAsyncRequest(jd.q.recv)) != null) {
                jaxon.ajax.response.received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((nextRequest = jd.popAsyncRequest(jd.q.send)) != null) {
                jaxon.ajax.request.submit(nextRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((nextRequest = jq.peek(jd.q.send)) != null) {
                jaxon.ajax.request.submit(nextRequest);
            }
        }
    },

    /*
    Function: jaxon.ajax.response.process

    While entries exist in the queue, pull and entry out and process it's command.
    When a command returns false, the processing is halted.

    Parameters:

    response - (object): The response, which is a queue containing the commands to execute.
    This should have been created by calling <jaxon.tools.queue.create>.

    Returns:

    true - The queue was fully processed and is now empty.
    false - The queue processing was halted before the queue was fully processed.

    Note:

    - Use <jaxon.cmd.delay.setWakeup> or call this function to cause the queue processing to continue.
    - This will clear the associated timeout, this function is not designed to be reentrant.
    - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
    */
    processCommands: function(commandQueue) {
        if (commandQueue.timeout !== null) {
            clearTimeout(commandQueue.timeout);
            commandQueue.timeout = null;
        }

        let command = null;
        while ((command = jaxon.tools.queue.pop(commandQueue)) != null) {
            try {
                if (jaxon.ajax.handler.execute(command) !== false) {
                    continue;
                }
                if(!command.requeue) {
                    delete command;
                }
                jaxon.tools.queue.pushFront(commandQueue, command);
                return false;
            } catch (e) {
                console.log(e);
            }
            delete command;
        }
        return true;
    },

    /*
    Function: jaxon.ajax.response.queueCommands

    Parse the JSON response into a series of commands.

    Parameters:
    oRequest - (object):  The request context object.
    */
    queueCommands: function(oRequest) {
        const nodes = oRequest.responseContent;
        if (!nodes || !nodes.jxnobj) {
            return;
        }

        oRequest.status.onProcessing();

        const xx = jaxon;
        const xt = xx.tools;

        if (nodes.jxnrv) {
            oRequest.returnValue = nodes.jxnrv;
        }

        nodes.debugmsg && console.log(nodes.debugmsg);

        nodes.jxnobj.forEach(command => xt.queue.push(oRequest.commandQueue, {
            ...command,
            fullName: '*unknown*',
            sequence: oRequest.sequence++,
            response: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));
    },

    /*
    Function: jaxon.ajax.response.processor

    This function attempts to determine, based on the content type of the reponse, what processor
    should be used for handling the response data.

    The default jaxon response will be text/json which will invoke the json response processor.
    Other response processors may be added in the future.  The user can specify their own response
    processor on a call by call basis.

    Parameters:

    oRequest - (object):  The request context object.
    */
    processor: function(oRequest) {
        if (oRequest.responseProcessor !== undefined) {
            return oRequest.responseProcessor;
        }

        // By default, try to use the JSON processor
        return jaxon.ajax.response.json;
    },

    /*
    Function: jaxon.ajax.response.json

    This is the JSON response processor.

    Parameters:

    oRequest - (object):  The request context object.
    */
    json: function(oRequest) {
        const xx = jaxon;
        const xt = xx.tools;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        if (xt.array.is_in(xx.ajax.response.successCodes, oRequest.response.status)) {
            xcb.execute([gcb, lcb], 'onSuccess', oRequest);

            oRequest.sequence = 0;
            xx.ajax.response.queueCommands(oRequest)

            // Queue a last command to clear the queue
            xt.queue.push(oRequest.commandQueue, {
                fullName: 'Response Complete',
                sequence: oRequest.sequence,
                request: oRequest,
                context: oRequest.context,
                cmd: 'rcmplt',
            });

            // do not re-start the queue if a timeout is set
            if (!oRequest.commandQueue.timeout) {
                // Process the commands in the queue
                xx.ajax.response.processCommands(oRequest.commandQueue);
            }
            return oRequest.returnValue;
        }

        if (xt.array.is_in(xx.ajax.response.redirectCodes, oRequest.response.status)) {
            xcb.execute([gcb, lcb], 'onRedirect', oRequest);
            window.location = oRequest.request.getResponseHeader('location');
            xx.ajax.response.complete(oRequest);
            return oRequest.returnValue;
        }

        if (xt.array.is_in(xx.ajax.response.errorsForAlert, oRequest.response.status)) {
            xcb.execute([gcb, lcb], 'onFailure', oRequest);
            xx.ajax.response.complete(oRequest);
            return oRequest.returnValue;
        }

        return oRequest.returnValue;
    },

    /*
    Object: jaxon.ajax.response.successCodes

    This array contains a list of codes which will be returned from the server upon
    successful completion of the server portion of the request.

    These values should match those specified in the HTTP standard.
    */
    successCodes: ['0', '200'],

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

    This array contains a list of status codes returned by the server to indicate that
    the request failed for some reason.
    */
    errorsForAlert: ['400', '401', '402', '403', '404', '500', '501', '502', '503'],

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

    An array of status codes returned from the server to indicate a request for redirect to another URL.

    Typically, this is used by the server to send the browser to another URL.
    This does not typically indicate that the jaxon request should be sent to another URL.
    */
    redirectCodes: ['301', '302', '307']
};
