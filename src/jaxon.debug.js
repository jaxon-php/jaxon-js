/*
    File: jaxon.debug.js
    
    This optional file contains the debugging module for use with jaxon.
    If you include this module after the standard <jaxon_core.js> module, you will receive debugging messages,
    including errors, that occur during the processing of your jaxon requests.
    
    Title: jaxon debugging module
    
    Please see <copyright.inc.php> for a detailed description, copyright and license information.
*/

/*
    @package jaxon
    @version $Id: jaxon.debug.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2009 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license http://www.jaxonproject.org/bsd_license.txt BSD License
*/

try
{
    /*
        Class: jaxon.debug

        This object contains the variables and functions used to display process state
        messages and to trap error conditions and report them to the user via
        a secondary browser window or alert messages as necessary.
    */
    if ('undefined' == typeof jaxon)
        throw { name: 'SequenceError', message: 'Error: Jaxon core was not detected, debug module disabled.' }
        
    if ('undefined' == typeof jaxon.debug)
        jaxon.debug = {}

    /*
        String: jaxon.debug.workId
        
        Stores a 'unique' identifier for this session so that an existing debugging
        window can be detected, else one will be created.
    */
    jaxon.debug.workId = 'jaxonWork'+ new Date().getTime();

    /*
        String: jaxon.debug.windowSource
        
        The default URL that is given to the debugging window upon creation.
    */
    jaxon.debug.windowSource = 'about:blank';

    /*
        String: jaxon.debug.windowID
        
        A 'unique' name used to identify the debugging window that is attached
        to this jaxon session.
    */
    jaxon.debug.windowID = 'jaxon_debug_'+jaxon.debug.workId;

    /*
        String: windowStyle
        
        The parameters that will be used to create the debugging window.
    */
    if ('undefined' == typeof jaxon.debug.windowStyle)
        jaxon.debug.windowStyle = 
            'width=800,' +
            'height=600,' +
            'scrollbars=yes,' +
            'resizable=yes,' +
            'status=yes';
            
    /*
        String: windowTemplate
        
        The HTML template and CSS style information used to populate the
        debugging window upon creation.
    */
    if ('undefined' == typeof jaxon.debug.windowTemplate)
        jaxon.debug.windowTemplate = 
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">' +
            '<html><head>' +
            '<title>jaxon debug output</title>' +
            '<style type="text/css">' +
            '/* <![CDATA[ */' +
            '.debugEntry { margin: 3px; padding: 3px; border-top: 1px solid #999999; } ' +
            '.debugDate { font-weight: bold; margin: 2px; } ' +
            '.debugText { margin: 2px; } ' +
            '.warningText { margin: 2px; font-weight: bold; } ' +
            '.errorText { margin: 2px; font-weight: bold; color: #ff7777; }' +
            '/* ]]> */' +
            '</style>' +
            '</head><body>' +
            '<h2>jaxon debug output</h2>' +
            '<div id="debugTag"></div>' +
            '</body></html>';

    /*
        Object: window
        
        A reference to the debugging window, once constructed, where messages will
        be displayed throughout the request process.  This is constructed internally
        as needed.
    */

    /*
        Function: jaxon.debug.getExceptionText
        
        Parameters:
        e - (object): Exception
    */
    jaxon.debug.getExceptionText = function(e) {
        if ('undefined' != typeof e.code) {
            if ('undefined' != typeof jaxon.debug.exceptions[e.code]) {
                var msg = jaxon.debug.exceptions[e.code];
                if ('undefined' != typeof e.data) {
                    msg.replace('{data}', e.data);
                }
                return msg;
            }
        } else if ('undefined' != typeof e.name) {
            var msg = e.name;
            if ('undefined' != typeof e.message) {
                msg += ': ';
                msg += e.message;
            }
            return msg;
        }
        return 'An unknown error has occurred.';
    }

    /*
        Function: jaxon.debug.writeMessage
        
        Output a debug message to the debug window if available or send to an
        alert box.  If the debug window has not been created, attempt to 
        create it.
        
        Parameters:
        
        text - (string):  The text to output.
        
        prefix - (string):  The prefix to use; this is prepended onto the 
            message; it should indicate the type of message (warning, error)
            
        cls - (stirng):  The className that will be applied to the message;
            invoking a style from the CSS provided in 
            <jaxon.debug.windowTemplate>.  Should be one of the following:
            - warningText
            - errorText
    */
    jaxon.debug.writeMessage = function(text, prefix, cls) {
        try {
            var xd = jaxon.debug;
            if ('undefined' == typeof xd.window || true == xd.window.closed) {
                xd.window = window.open(xd.windowSource, xd.windowID, xd.windowStyle);
                if ("about:blank" == xd.windowSource)
                    xd.window.document.write(xd.windowTemplate);
            }
            var xdw = xd.window;
            var xdwd = xdw.document;
            if ('undefined' == typeof prefix)
                prefix = '';
            if ('undefined' == typeof cls)
                cls = 'debugText';
            
            text = jaxon.debug.prepareDebugText(text);
            
            var debugTag = xdwd.getElementById('debugTag');
            var debugEntry = xdwd.createElement('div');
            var debugDate = xdwd.createElement('span');
            var debugText = xdwd.createElement('pre');
            
            debugDate.innerHTML = new Date().toString();
            debugText.innerHTML = prefix + text;
            
            debugEntry.appendChild(debugDate);
            debugEntry.appendChild(debugText);
            debugTag.insertBefore(debugEntry, debugTag.firstChild);
            // don't allow 'style' issues to hinder the debug output
            try {
                debugEntry.className = 'debugEntry';
                debugDate.className = 'debugDate';
                debugText.className = cls;
            } catch (e) {
            }
        } catch (e) {
            if (text.length > 1000) text = text.substr(0,1000) + jaxon.debug.text[102];
            alert(jaxon.debug.text[102] + text);
        }
    }

    /*
        Function: jaxon.debug.prepareDebugText
        
        Convert special characters to their HTML equivellents so they will show up in the <jaxon.debug.window>.
        
        Parameters:
            text - (string): Debug text
    */
    jaxon.debug.prepareDebugText = function(text) {
        try {
            text = text.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br />');
            return text;
        } catch (e) {
            jaxon.debug.stringReplace = function(haystack, needle, newNeedle) {
                var segments = haystack.split(needle);
                haystack = '';
                for (var i = 0; i < segments.length; ++i) {
                    if (0 != i)
                        haystack += newNeedle;
                    haystack += segments[i];
                }
                return haystack;
            }
            jaxon.debug.prepareDebugText = function(text) {
                text = jaxon.debug.stringReplace(text, '&', '&amp;');
                text = jaxon.debug.stringReplace(text, '<', '&lt;');
                text = jaxon.debug.stringReplace(text, '>', '&gt;');
                text = jaxon.debug.stringReplace(text, '\n', '<br />');
                return text;
            }
            jaxon.debug.prepareDebugText(text);
        }
    }

    /*
        Function: jaxon.debug.executeCommand
        
        Catch any exceptions that are thrown by a response command handler
        and display a message in the debugger.
        
        This is a wrapper function which surrounds the standard 
        <jaxon.executeCommand> function.
    */
    jaxon.debug.executeCommand = jaxon.executeCommand;
    jaxon.executeCommand = function(args) {
        try {
            if ('undefined' == typeof args.cmd)
                throw { code: 10006 };
            if (false == jaxon.command.handler.isRegistered(args))
                throw { code: 10007, data: args.cmd };
            return jaxon.debug.executeCommand(args);
        } catch(e) {
            var msg = 'ExecuteCommand (';
            if ('undefined' != typeof args.sequence) {
                msg += '#';
                msg += args.sequence;
                msg += ', ';
            }
            if ('undefined' != typeof args.cmdFullName) {
                msg += '"';
                msg += args.cmdFullName;
                msg += '"';
            }
            msg += '):\n';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
        }
        return true;
    }

    /*
        Function: jaxon.parseAttributes
        
        Catch any exception thrown during the parsing of response command attributes and display an appropriate debug message.
        
        This is a wrapper around the standard <jaxon.parseAttributes> function.
        
        Parameters:
            child - (object): Childnode
            obj - (object): Object
            
    */
    jaxon.debug.parseAttributes = jaxon.parseAttributes;
    jaxon.parseAttributes = function(child, obj) {
        try {
            jaxon.debug.parseAttributes(child, obj);
        } catch(e) {
            var msg = 'ParseAttributes:\n';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
        }
    }

    jaxon.debug.commandHandler = jaxon.command.handler.unregister('dbg');
    jaxon.command.handler.register('dbg', function(args) {
        args.cmdFullName = 'debug message';
        jaxon.debug.writeMessage(args.data, jaxon.debug.text[100], 'warningText');
        return jaxon.debug.commandHandler(args);
    });


    /*
        Function: jaxon.tools.$
        
        Catch any exceptions thrown while attempting to locate an HTML element by it's unique name.
        
        This is a wrapper around the standard <jaxon.tools.$> function.
        
        Parameters:
        sId - (string): Element ID or name
        
    */
    jaxon.debug.$ = jaxon.tools.$;
    jaxon.tools.$ = function(sId) {
        try {
            var returnValue = jaxon.debug.$(sId);
            if ('object' != typeof returnValue)
                throw { code: 10008 };
        }
        catch (e) {
            var msg = '$:';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[100], 'warningText');
        }
        return returnValue;
    }

    /*
        Function: jaxon.tools._objectToXML
        
        Generate a message indicating that a javascript object is
        being converted to xml.  Indicate the max depth and size.  Then
        display the size of the object upon completion.  Catch any 
        exceptions thrown during the conversion process.
        
        This is a wrapper around the standard <jaxon.tools._objectToXML> function.
        
        Parameters:
            obj - (object): 
            guard - (object): 
            
    */
    jaxon.debug._objectToXML = jaxon.tools._objectToXML;
    jaxon.tools._objectToXML = function(obj, guard) {
        try {
            if (0 == guard.size) {
                var msg = 'OBJECT TO XML: maxDepth = ';
                msg += guard.maxDepth;
                msg += ', maxSize = ';
                msg += guard.maxSize;
                jaxon.debug.writeMessage(msg);
            }
            var r = jaxon.debug._objectToXML(obj, guard);
            if (0 == guard.depth) {
                var msg = 'OBJECT TO XML: size = ';
                msg += guard.size;
                jaxon.debug.writeMessage(msg);
            }
            return r;
        } catch(e) {
            var msg = 'ObjectToXML: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
        }
        return '';
    }

    /*
        Function: jaxon._internalSend
        
        Generate a message indicating that the jaxon request is
        about the be sent to the server.
        
        This is a wrapper around the standard <jaxon._internalSend> 
        function.
    */
    jaxon.debug._internalSend = jaxon._internalSend;
    jaxon._internalSend = function(oRequest) {
        try {
            jaxon.debug.writeMessage(jaxon.debug.text[104]);
            jaxon.debug.writeMessage(
                jaxon.debug.text[105] + 
                oRequest.requestData.length + 
                jaxon.debug.text[106]
                );
            oRequest.beginDate = new Date();
            jaxon.debug._internalSend(oRequest);
        } catch (e) {
            var msg = 'InternalSend: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.submitRequest
        
        Generate a message indicating that a request is ready to be 
        submitted; providing the URL and the function being invoked.
        
        Catch any exceptions thrown and display a message.
        
        This is a wrapper around the standard <jaxon.submitRequest>
        function.
    */
    jaxon.debug.submitRequest = jaxon.submitRequest;
    jaxon.submitRequest = function(oRequest) {
        var msg = oRequest.method;
        msg += ': ';
        text = decodeURIComponent(oRequest.requestData);
        text = text.replace(new RegExp('&jxn', 'g'), '\n&jxn');
        text = text.replace(new RegExp('<jxnobj>', 'g'), '\n<jxnobj>');
        text = text.replace(new RegExp('<e>', 'g'), '\n<e>');
        text = text.replace(new RegExp('</jxnobj>', 'g'), '\n</jxnobj>\n');
        msg += text;
        jaxon.debug.writeMessage(msg);
        msg = jaxon.debug.text[107];
        var separator = '\n';
        for (var mbr in oRequest.functionName) {
            msg += separator;
            msg += mbr;
            msg += ': ';
            msg += oRequest.functionName[mbr];
            separator = '\n';
        }
        msg += separator;
        msg += jaxon.debug.text[108];
        msg += separator;
        msg += oRequest.URI;
        jaxon.debug.writeMessage(msg);
        
        try {
            return jaxon.debug.submitRequest(oRequest);
        } catch (e) {
            jaxon.debug.writeMessage(e.message);
            if (0 < oRequest.retry)
                throw e;
        }
    }

    /*
        Function: jaxon.initializeRequest
        
        Generate a message indicating that the request object is
        being initialized.
        
        This is a wrapper around the standard <jaxon.initializeRequest>
        function.
    */
    jaxon.debug.initializeRequest = jaxon.initializeRequest;
    jaxon.initializeRequest = function(oRequest) {
        try {
            var msg = jaxon.debug.text[109];
            jaxon.debug.writeMessage(msg);
            return jaxon.debug.initializeRequest(oRequest);
        } catch (e) {
            var msg = 'InitializeRequest: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.processParameters
        
        Generate a message indicating that the request object is
        being populated with the parameters provided.
        
        This is a wrapper around the standard <jaxon.processParameters>
        function.
    */
    jaxon.debug.processParameters = jaxon.processParameters;
    jaxon.processParameters = function(oRequest) {
        try {
            if ('undefined' != typeof oRequest.parameters) {
                var msg = jaxon.debug.text[110];
                msg += oRequest.parameters.length;
                msg += jaxon.debug.text[111];
                jaxon.debug.writeMessage(msg);
            } else {
                var msg = jaxon.debug.text[112];
                jaxon.debug.writeMessage(msg);
            }
            return jaxon.debug.processParameters(oRequest);
        } catch (e) {
            var msg = 'ProcessParameters: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.prepareRequest
        
        Generate a message indicating that the request is being
        prepared.  This may occur more than once for a request
        if it errors and a retry is attempted.
        
        This is a wrapper around the standard <jaxon.prepareRequest>
    */
    jaxon.debug.prepareRequest = jaxon.prepareRequest;
    jaxon.prepareRequest = function(oRequest) {
        try {
            var msg = jaxon.debug.text[113];
            jaxon.debug.writeMessage(msg);
            return jaxon.debug.prepareRequest(oRequest);
        } catch (e) {
            var msg = 'PrepareRequest: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.call
        
        Validates that a function name was provided, generates a message 
        indicating that a jaxon call is starting and sets a flag in the
        request object indicating that debugging is enabled for this call.
        
        This is a wrapper around the standard <jaxon.call> function.
    */
    jaxon.debug.call = jaxon.call;
    jaxon.call = function() {
        try {
            jaxon.debug.writeMessage(jaxon.debug.text[114]);
            
            var numArgs = arguments.length;
            
            if (0 == numArgs)
                throw { code: 10009 };
            
            var functionName = arguments[0];
            var oOptions = {}
            if (1 < numArgs)
                oOptions = arguments[1];
            
            oOptions.debugging = true;
            
            return jaxon.debug.call(functionName, oOptions);
        } catch (e) {
            var msg = 'Call: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.request
        
        Validates that a function name was provided, generates a message 
        indicating that a jaxon request is starting and sets a flag in the
        request object indicating that debugging is enabled for this request.
        
        This is a wrapper around the standard <jaxon.request> function.
    */
    jaxon.debug.request = jaxon.request;
    jaxon.request = function() {
        try {
            jaxon.debug.writeMessage(jaxon.debug.text[115]);
            
            var numArgs = arguments.length;
            
            if (0 == numArgs)
                throw { code: 10010 };
            
            var oFunction = arguments[0];
            var oOptions = {}
            if (1 < numArgs)
                oOptions = arguments[1];
            
            oOptions.debugging = true;
            
            return jaxon.debug.request(oFunction, oOptions);
        } catch (e) {
            var msg = 'Request: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.getResponseProcessor
        
        Generate an error message when no reponse processor is available
        to process the type of response returned from the server.
        
        This is a wrapper around the standard <jaxon.getResponseProcessor>
        function.
    */
    jaxon.debug.getResponseProcessor = jaxon.getResponseProcessor;
    jaxon.getResponseProcessor = function(oRequest) {
        try {
            var fProc = jaxon.debug.getResponseProcessor(oRequest);
            
            if ('undefined' == typeof fProc) { 
                var msg = jaxon.debug.text[116];
                try {
                    var contentType = oRequest.request.getResponseHeader('content-type');
                    msg += "Content-Type: ";
                    msg += contentType;
                    if ('text/html' == contentType) {
                        msg += jaxon.debug.text[117];
                    }
                } catch (e) {
                }
                jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            }
            
            return fProc;
        } catch (e) {
            var msg = 'GetResponseProcessor: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.responseReceived
        
        Generate a message indicating that a response has been received
        from the server; provide some statistical data regarding the
        response and the response time.
        
        Catch any exceptions that are thrown during the processing of
        the response and generate a message.
        
        This is a wrapper around the standard <jaxon.responseReceived>
        function.
    */
    jaxon.debug.responseReceived = jaxon.responseReceived;
    jaxon.responseReceived = function(oRequest) {
        var xx = jaxon;
        var xt = xx.tools;
        var xd = xx.debug;
        
        var oRet;
        
        try {
            var status = oRequest.request.status;
            if (xt.in_array(xx.responseSuccessCodes, status)) {
                var packet = oRequest.request.responseText;
                packet = packet.replace(new RegExp('<cmd', 'g'), '\n<cmd');
                packet = packet.replace(new RegExp('<jxn>', 'g'), '\n<jxn>');
                packet = packet.replace(new RegExp('<jxnobj>', 'g'), '\n<jxnobj>');
                packet = packet.replace(new RegExp('<e>', 'g'), '\n<e>');
                packet = packet.replace(new RegExp('</jxnobj>', 'g'), '\n</jxnobj>\n');
                packet = packet.replace(new RegExp('</jxn>', 'g'), '\n</jxn>');
                oRequest.midDate = new Date();
                var msg = jaxon.debug.text[118];
                msg += oRequest.request.status;
                msg += jaxon.debug.text[119];
                msg += packet.length;
                msg += jaxon.debug.text[120];
                msg += (oRequest.midDate - oRequest.beginDate);
                msg += jaxon.debug.text[121];
                msg += packet;
                xd.writeMessage(msg);
            } else if (xt.in_array(xx.responseErrorsForAlert, status)) {
                var msg = jaxon.debug.text[122];
                msg += status;
                msg += jaxon.debug.text[123];
                msg += oRequest.request.responseText;
                xd.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            } else if (xt.in_array(xx.responseRedirectCodes, status)) {
                var msg = jaxon.debug.text[124];
                msg += oRequest.request.getResponseHeader('location');
                xd.writeMessage(msg);
            }
            oRet = xd.responseReceived(oRequest);
        } catch (e) {
            var msg = 'ResponseReceived: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            xd.writeMessage(msg, jaxon.debug.text[101], 'errorText');
        }
        
        return oRet;
    }

    /*
        Function: jaxon.completeResponse
        
        Generate a message indicating that the request has completed
        and provide some statistics regarding the request and response.
        
        This is a wrapper around the standard <jaxon.completeResponse>
        function.
    */
    jaxon.debug.completeResponse = jaxon.completeResponse;
    jaxon.completeResponse = function(oRequest) {
        try {
            var returnValue = jaxon.debug.completeResponse(oRequest);
            oRequest.endDate = new Date();
            var msg = jaxon.debug.text[125];
            msg += (oRequest.endDate - oRequest.beginDate);
            msg += jaxon.debug.text[126];
            jaxon.debug.writeMessage(msg);
            return returnValue;
        } catch (e) {
            var msg = 'CompleteResponse: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.tools.getRequestObject
        
        Generate a message indicating that the request object is 
        being initialized.
        
        Catch any exceptions that are thrown during the process or
        initializing a new request object.
        
        This is a wrapper around the standard <jaxon.getRequestObject>
        function.
    */
    jaxon.debug.getRequestObject = jaxon.tools.getRequestObject;
    jaxon.tools.getRequestObject = function() {
        try {
            jaxon.debug.writeMessage(jaxon.debug.text[127]);
            return jaxon.debug.getRequestObject();
        } catch (e) {
            var msg = 'GetRequestObject: ';
            msg += jaxon.debug.getExceptionText(e);
            msg += '\n';
            jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            throw e;
        }
    }

    /*
        Function: jaxon.dom.assign
        
        Catch any exceptions thrown during the assignment and 
        display an error message.
        
        This is a wrapper around the standard <jaxon.dom.assign>
        function.
    */
    if (jaxon.dom.assign) {
        jaxon.debug.assign = jaxon.dom.assign;
        jaxon.dom.assign = function(element, property, data) {
            try {
                return jaxon.debug.assign(element, property, data);
            } catch (e) {
                var msg = 'jaxon.dom.assign: ';
                msg += jaxon.debug.getExceptionText(e);
                msg += '\n';
                msg += 'Eval: element.';
                msg += property;
                msg += ' = data;\n';
                jaxon.debug.writeMessage(msg, jaxon.debug.text[101], 'errorText');
            }
            return true;
        }
    }

    /*
        Function: jaxon.tools.queue.retry
    */
    if (jaxon.tools) {
        if (jaxon.tools.queue) {
            if (jaxon.tools.queue.retry) {
                if ('undefined' == typeof jaxon.debug.tools)
                    jaxon.debug.tools = {};
                if ('undefined' == typeof jaxon.debug.tools.queue)
                    jaxon.debug.tools.queue = {};
                jaxon.debug.tools.queue.retry = jaxon.tools.queue.retry;
                jaxon.tools.queue.retry = function(obj, count) {
                    if (jaxon.debug.tools.queue.retry(obj, count))
                        return true;
                    // no 'exceeded' message for sleep command
                    if (obj.cmd && 's' == obj.cmd)
                        return false;
                    jaxon.debug.writeMessage('Retry count exceeded.');
                    return false;
                }
            }
        }
    }

    /*
        Boolean: jaxon.debug.isLoaded
        
        true - indicates that the debugging module is loaded
    */
    jaxon.debug.isLoaded = true;

    /*
        Section: Redefine shortcuts.
        
        Must redefine these shortcuts so they point to the new debug (wrapper) versions:
        - <jxn.$>
        - <jxn.getFormValues>
        - <jxn.call>

        Must redefine these shortcuts as well:
        - <jaxon.$>
        - <jaxon.getFormValues>
    */
    jxn = {}

    jxn.$ = jaxon.tools.$;
    jxn.getFormValues = jaxon.tools.getFormValues;
    jxn.call = jaxon.call;
    jxn.request = jaxon.request;

    jaxon.$ = jaxon.tools.$;
    jaxon.getFormValues = jaxon.tools.getFormValues;
} catch (e) {
    alert(e.name + ': ' + e.message);
}
