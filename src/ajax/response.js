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
        oRequest.response = xx.tools.queue.create(xx.config.responseQueueSize);

        xcb.clearTimer([gcb, lcb], 'onExpiration');
        xcb.clearTimer([gcb, lcb], 'onResponseDelay');
        xcb.execute([gcb, lcb], 'beforeResponseProcessing', oRequest);

        const fProc = xx.ajax.response.processor(oRequest);
        if (null == fProc) {
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
        delete oRequest['response'];
        delete oRequest['set'];
        delete oRequest['open'];
        delete oRequest['setRequestHeaders'];
        delete oRequest['setCommonRequestHeaders'];
        delete oRequest['setPostRequestHeaders'];
        delete oRequest['setGetRequestHeaders'];
        delete oRequest['applyRequestHeaders'];
        delete oRequest['finishRequest'];
        delete oRequest['status'];
        delete oRequest['cursor'];

        // All the requests queued while waiting must now be processed.
        if('synchronous' == oRequest.mode) {
            let jq = jaxon.tools.queue;
            let jd = jaxon.cmd.delay;
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
    process: function(response) {
        if (null != response.timeout) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        let command = null;
        while ((command = jaxon.tools.queue.pop(response)) != null) {
            try {
                if (false == jaxon.ajax.handler.execute(command)) {
                    if(command.requeue == true) {
                        jaxon.tools.queue.pushFront(response, command);
                    } else {
                        delete command;
                    }
                    return false;
                }
            } catch (e) {
                console.log(e);
            }
            delete command;
        }
        return true;
    },

    /*
    Function: jaxon.ajax.response.processFragment

    Parse the JSON response into a series of commands.

    Parameters:
    oRequest - (object):  The request context object.
    */
    processFragment: function(nodes, seq, oRet, oRequest) {
        const xx = jaxon;
        const xt = xx.tools;
        for (nodeName in nodes) {
            if ('jxnobj' == nodeName) {
                for (a in nodes[nodeName]) {
                    /*
                    prevents from using not numbered indexes of 'jxnobj'
                    nodes[nodeName][a]= "0" is an valid jaxon response stack item
                    nodes[nodeName][a]= "pop" is an method from somewhere but not from jxnobj
                    */
                    if (parseInt(a) != a) continue;

                    const command = nodes[nodeName][a];
                    command.fullName = '*unknown*';
                    command.sequence = seq;
                    command.response = oRequest.response;
                    command.request = oRequest;
                    command.context = oRequest.context;
                    xt.queue.push(oRequest.response, command);
                    ++seq;
                }
            } else if ('jxnrv' == nodeName) {
                oRet = nodes[nodeName];
            } else if ('debugmsg' == nodeName) {
                txt = nodes[nodeName];
            } else {
                throw { code: 10004, data: command.fullName };
            }
        }
        return oRet;
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
        if ('undefined' != typeof oRequest.responseProcessor) {
            return oRequest.responseProcessor;
        }

        let cTyp = oRequest.request.getResponseHeader('content-type');
        if(!cTyp) {
            return null;
        }
        let responseText = '';
        if(0 <= cTyp.indexOf('application/json')) {
            responseText = oRequest.request.responseText;
        }
        else if(0 <= cTyp.indexOf('text/html')) {
            responseText = oRequest.request.responseText;
            // Verify if there is any other output before the Jaxon response.
            let jsonStart = responseText.indexOf('{"jxnobj"');
            if(jsonStart < 0) { // No jaxon data in the response
                return null;
            }
            if(jsonStart > 0) {
                responseText = responseText.substr(jsonStart);
            }
        }

        try {
            oRequest.request.responseJSON = JSON.parse(responseText);
            return jaxon.ajax.response.json;
        } catch (ex) {
            return null; // Cannot decode JSON response
        }
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

        let oRet = oRequest.returnValue;

        if (xt.array.is_in(xx.ajax.response.successCodes, oRequest.request.status)) {
            xcb.execute([gcb, lcb], 'onSuccess', oRequest);

            let seq = 0;
            if ('object' == typeof oRequest.request.responseJSON &&
                'object' == typeof oRequest.request.responseJSON.jxnobj) {
                oRequest.status.onProcessing();
                oRet = xx.ajax.response.processFragment(oRequest.request.responseJSON, seq, oRet, oRequest);
            } else {}

            const command = {};
            command.fullName = 'Response Complete';
            command.sequence = seq;
            command.request = oRequest;
            command.context = oRequest.context;
            command.cmd = 'rcmplt';
            xt.queue.push(oRequest.response, command);

            // do not re-start the queue if a timeout is set
            if (null == oRequest.response.timeout) {
                xx.ajax.response.process(oRequest.response);
            }
        } else if (xt.array.is_in(xx.ajax.response.redirectCodes, oRequest.request.status)) {
            xcb.execute([gcb, lcb], 'onRedirect', oRequest);
            window.location = oRequest.request.getResponseHeader('location');
            xx.ajax.response.complete(oRequest);
        } else if (xt.array.is_in(xx.ajax.response.errorsForAlert, oRequest.request.status)) {
            xcb.execute([gcb, lcb], 'onFailure', oRequest);
            xx.ajax.response.complete(oRequest);
        }

        return oRet;
    },

    /*
    Function: jaxon.ajax.response.upload

    Process the file upload response received in an iframe.

    Parameters:

    oRequest - (object):  The request context object.
    */
    upload: function(oRequest) {
        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        let endRequest = false;
        const res = oRequest.upload.iframe.contentWindow.res;
        if (!res || !res.code) {
            // Show the error message with the selected dialog library
            jaxon.ajax.message.error('The server returned an invalid response');
            // End the request
            endRequest = true;
        } else if (res.code === 'error') {
            // Todo: show the error message with the selected dialog library
            jaxon.ajax.message.error(res.msg);
            // End the request
            endRequest = true;
        }

        if (endRequest) {
            // End the request
            xcb.clearTimer([gcb, lcb], 'onExpiration');
            xcb.clearTimer([gcb, lcb], 'onResponseDelay');
            xcb.execute([gcb, lcb], 'onFailure', oRequest);
            jaxon.ajax.response.complete(oRequest);
            return;
        }

        if (res.code === 'success') {
            oRequest.requestData += '&jxnupl=' + encodeURIComponent(res.upl);
            jaxon.ajax.request._send(oRequest);
        }
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
