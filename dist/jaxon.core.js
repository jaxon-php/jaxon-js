/*
Class: jaxon
*/
var jaxon = {
    /*
    Class: jaxon.debug
    */
    debug: {
        /*
        Class: jaxon.debug.verbose

        Provide a high level of detail which can be used to debug hard to find problems.
        */
        verbose: {},
    },

    /*
    Class: jaxon.ajax
    */
    ajax: {
        callback: {},

        handler: {},

        message: {},

        parameters: {},

        request: {},

        response: {},
    },

    /*
    Class: jaxon.cmd

    Contains the functions for page content, layout, functions and events.
    */
    cmd: {
        delay: {},

        event: {},

        form: {},

        node: {},

        script: {},

        style: {},
    },

    /*
    Class: jaxon.tools

    This contains utility functions which are used throughout the jaxon core.
    */
    tools: {
        dom: {},

        form: {},

        queue: {},

        string: {},

        upload: {},
    },

    /*
    Class: jaxon.dom
    */
    dom: {},
};

/*
    Class: jaxon.config

    This class contains all the default configuration settings.  These
    are application level settings; however, they can be overridden
    by including a jaxon.config definition prior to including the
    <jaxon_core.js> file, or by specifying the appropriate configuration
    options on a per call basis.
*/
jaxon.config = {
    /*
    Object: commonHeaders

    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.

    These headers will be set for both POST and GET requests.
    */
    'commonHeaders': {
        'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'
    },

    /*
    Object: postHeaders

    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.
    */
    'postHeaders': {},

    /*
    Object: getHeaders

    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.
    */
    'getHeaders': {},

    /*
    Boolean: waitCursor

    true - jaxon should display a wait cursor when making a request
    false - jaxon should not show a wait cursor during a request
    */
    'waitCursor': false,

    /*
    Boolean: statusMessages

    true - jaxon should update the status bar during a request
    false - jaxon should not display the status of the request
    */
    'statusMessages': false,

    /*
    Object: baseDocument

    The base document that will be used throughout the code for
    locating elements by ID.
    */
    'baseDocument': document,

    /*
    String: requestURI

    The URI that requests will be sent to.
    */
    'requestURI': document.URL,

    /*
    String: defaultMode

    The request mode.

    'asynchronous' - The request will immediately return, the
    response will be processed when (and if) it is received.

    'synchronous' - The request will block, waiting for the
    response.  This option allows the server to return
    a value directly to the caller.
    */
    'defaultMode': 'asynchronous',

    /*
    String: defaultHttpVersion

    The Hyper Text Transport Protocol version designated in the
    header of the request.
    */
    'defaultHttpVersion': 'HTTP/1.1',

    /*
    String: defaultContentType

    The content type designated in the header of the request.
    */
    'defaultContentType': 'application/x-www-form-urlencoded',

    /*
    Integer: defaultResponseDelayTime

    The delay time, in milliseconds, associated with the
    <jaxon.callback.onRequestDelay> event.
    */
    'defaultResponseDelayTime': 1000,

    /*
    Boolean: convertResponseToJson

    Always convert the reponse content to json.
    */
    'convertResponseToJson': true,

    /*
    Integer: defaultExpirationTime

    The amount of time to wait, in milliseconds, before a request
    is considered expired.  This is used to trigger the
    <jaxon.callback.onExpiration event.
    */
    'defaultExpirationTime': 10000,

    /*
    String: defaultMethod

    The method used to send requests to the server.

    'POST' - Generate a form POST request
    'GET' - Generate a GET request; parameters are appended
    to the <jaxon.config.requestURI> to form a URL.
    */
    'defaultMethod': 'POST', // W3C: Method is case sensitive

    /*
    Integer: defaultRetry

    The number of times a request should be retried
    if it expires.
    */
    'defaultRetry': 5,

    /*
    Object: defaultReturnValue

    The value returned by <jaxon.request> when in asynchronous
    mode, or when a syncrhonous call does not specify the return value.
    */
    'defaultReturnValue': false,

    /*
    Integer: maxObjectDepth

    The maximum depth of recursion allowed when serializing
    objects to be sent to the server in a request.
    */
    'maxObjectDepth': 20,

    /*
    Integer: maxObjectSize

    The maximum number of members allowed when serializing
    objects to be sent to the server in a request.
    */
    'maxObjectSize': 2000,

    'commandQueueSize': 1000,

    'requestQueueSize': 1000,
};

/*
Class: jaxon.config.status

Provides support for updating the browser's status bar during
the request process.  By splitting the status bar functionality
into an object, the jaxon developer has the opportunity to
customize the status bar messages prior to sending jaxon requests.
*/
jaxon.config.status = {
    /*
    Function: update

    Constructs and returns a set of event handlers that will be
    called by the jaxon framework to set the status bar messages.
    */
    update: function() {
        return {
            onRequest: function() {
                window.status = 'Sending Request...';
            },
            onWaiting: function() {
                window.status = 'Waiting for Response...';
            },
            onProcessing: function() {
                window.status = 'Processing...';
            },
            onComplete: function() {
                window.status = 'Done.';
            }
        }
    },

    /*
    Function: dontUpdate

    Constructs and returns a set of event handlers that will be
    called by the jaxon framework where status bar updates
    would normally occur.
    */
    dontUpdate: function() {
        return {
            onRequest: function() {},
            onWaiting: function() {},
            onProcessing: function() {},
            onComplete: function() {}
        }
    }
};

/*
Class: jaxon.config.cursor

Provides the base functionality for updating the browser's cursor
during requests.  By splitting this functionalityh into an object
of it's own, jaxon developers can now customize the functionality
prior to submitting requests.
*/
jaxon.config.cursor = {
    /*
    Function: update

    Constructs and returns a set of event handlers that will be
    called by the jaxon framework to effect the status of the
    cursor during requests.
    */
    update: function() {
        return {
            onWaiting: function() {
                if (jaxon.config.baseDocument.body)
                    jaxon.config.baseDocument.body.style.cursor = 'wait';
            },
            onComplete: function() {
                jaxon.config.baseDocument.body.style.cursor = 'auto';
            }
        }
    },

    /*
    Function: dontUpdate

    Constructs and returns a set of event handlers that will
    be called by the jaxon framework where cursor status changes
    would typically be made during the handling of requests.
    */
    dontUpdate: function() {
        return {
            onWaiting: function() {},
            onComplete: function() {}
        }
    }
};


/**
 * Class: jaxon.tools.dom
 */

(function(self, baseDocument) {
    /**
     * Shorthand for finding a uniquely named element within the document.
     *
     * Note:
     *     This function uses the <jaxon.config.baseDocument> which allows <jaxon> to operate on the
     *     main window document as well as documents from contained iframes and child windows.
     *
     * @param {string} sId - The unique name of the element (specified by the ID attribute)
     * Not to be confused with the name attribute on form elements.
     *
     * @returns {object} - The element found or null.
     *
     * @see <self.$>
     */
    self.$ = sId => !sId ? null : (typeof sId !== 'string' ? sId : baseDocument.getElementById(sId));

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} - The workspace DOM element.
     */
    const _getWorkspace = function() {
        const elWorkspace = self.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }
        // Workspace not found. Must be ceated.
        if (!baseDocument.body) {
            return null;
        }

        const elNewWorkspace = baseDocument.createElement('div');
        elNewWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elNewWorkspace.style.display = 'none';
        elNewWorkspace.style.visibility = 'hidden';
        baseDocument.body.appendChild(elNewWorkspace);
        return elNewWorkspace;
    };

    /**
     * Insert the specified string of HTML into the document, then extract it.
     * This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.
     *
     * @param {string} sValue - A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} - The (potentially modified) html code or text.
     */
    self.getBrowserHTML = function(sValue) {
        const elWorkspace = _getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element - The element or it's unique name (specified by the ID attribute)
     * @param {string} attribute - The name of the attribute.
     * @param {string} newData - The value to be compared with the current value of the specified element.
     *
     * @returns {true} - The specified value differs from the current attribute value.
     * @returns {false} - The specified value is the same as the current value.
     */
    self.willChange = function(element, attribute, newData) {
        if (typeof element === 'string') {
            element = self.$(element);
        }
        return !element ? false : (newData != element[attribute]);
    };

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName - The name of the function to find.
     *
     * @returns {object} - The function
     */
    self.findFunction = function (sFuncName) {
        const names = sFuncName.split(".");
        for (let i = 0, length = names.length, context = window; i < length && (context); i++) {
            context = context[names[i]];
        }
        return context ?? null;
    };

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement - The outer element.
     * @param {string} attribute - The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    self.getInnerObject = function(xElement, attribute) {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len && (xElement); i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
        }
        return [xElement ?? null, (xElement) ? attribute : null];
    };

    /**
     * Create a function by inserting its code in the page using a <script> tag.
     *
     * @param {string} funcCode
     * @param {string|undefined} funcName
     * 
     * @returns {boolean}
     */
    self.createFunction = function(funcCode, funcName) {
        if (!funcCode) {
            return;
        }

        const removeTagAfter = funcName === undefined;
        const scriptTagId = 'jaxon_cmd_script_' + (funcName === undefined ?
            'delegate_call' : funcName.toLowerCase().replaceAll('.', '_'));
        funcName = funcName ?? 'jaxon.cmd.script.context.delegateCall';

        // Remove the tag if it already exists.
        jaxon.cmd.node.remove(scriptTagId);
        // Create a new tag.
        const scriptTag = baseDocument.createElement('script');
        scriptTag.setAttribute('id', scriptTagId);
        scriptTag.textContent = `
    ${funcName} = ${funcCode}
`;
        baseDocument.body.appendChild(scriptTag);

        // Since this js code saves the function in a var,
        // the tag can be removed, and the function will still exist.
        removeTagAfter && jaxon.cmd.node.remove(scriptTagId);
        return true;
    };
})(jaxon.tools.dom, jaxon.config.baseDocument);


/**
 * Class: jaxon.tools.form
 */

(function(self, dom) {
    /*
    Function: _getValue

    Used internally by <_getValues> to extract a single form value.
    This will detect the type of element (radio, checkbox, multi-select) and add it's value(s) to the form values array.

    Modified version for multidimensional arrays
    */
    const _getValue = function(aFormValues, child, submitDisabledElements, prefix) {
        if (!child.name || 'PARAM' === child.tagName)
            return;
        if (!submitDisabledElements && child.disabled)
            return;
        if (prefix !== child.name.substring(0, prefix.length))
            return;
        if ((child.type === 'radio' || child.type === 'checkbox') && !child.checked)
            return;
        if (child.type === 'file')
            return;

        const name = child.name;
        const values = child.type !== 'select-multiple' ? child.value :
            child.options.filter(option => option.selected).map(option => option.value);
        const keyBegin = name.indexOf('[');

        if (keyBegin < 0) {
            aFormValues[name] = values;
            return;
        }

        // Parse names into brackets
        let k = name.substring(0, keyBegin);
        let a = name.substring(keyBegin);
        aFormValues[k] = aFormValues[k] || {};
        let p = aFormValues; // pointer reset
        while (a.length > 0) {
            const sa = a.substring(0, a.indexOf(']') + 1);
            const lastKey = k; //save last key
            const lastRef = p; //save last pointer

            a = a.substring(a.indexOf(']') + 1);
            p = p[k];
            k = sa.substring(1, sa.length - 2);
            if (k === '') {
                if ('select-multiple' === child.type) {
                    k = lastKey; //restore last key
                    p = lastRef;
                } else {
                    k = p.length;
                }
            }
            if (k === undefined) {
                /*check against the global aFormValues Stack wich is the next(last) usable index */
                k = Object.keys(lastRef[lastKey]).length;
            }
            p[k] = p[k] || {};
        }
        p[k] = values;
    };

    /*
    Function: _getValues

    Used internally by <jaxon.tools.form.getValues> to recursively get the value
    of form elements.  This function will extract all form element values
    regardless of the depth of the element within the form.
    */
    const _getValues = function(aFormValues, children, submitDisabledElements, prefix) {
        children.forEach(child => {
            if (child.childNodes !== undefined && child.type !== 'select-one' && child.type !== 'select-multiple') {
                _getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            }
           _getValue(aFormValues, child, submitDisabledElements, prefix);
        });
    };

    /*
    Function: jaxon.tools.form.getValues

    Build an associative array of form elements and their values from the specified form.

    Parameters:
    element - (string): The unique name (id) of the form to be processed.
    disabled - (boolean, optional): Include form elements which are currently disabled.
    prefix - (string, optional): A prefix used for selecting form elements.

    Returns:
    An associative array of form element id and value.
    */
    self.getValues = function(parent) {
        const submitDisabledElements = (arguments.length > 1 && arguments[1] == true);
        const prefix = (arguments.length > 2) ? arguments[2] : '';
        if (typeof parent === 'string') {
            parent = dom.$(parent);
        }
        const aFormValues = {};
        if (parent && parent.childNodes) {
            _getValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);
        }
        return aFormValues;
    };
})(jaxon.tools.form, jaxon.tools.dom);


/**
 * Class: jaxon.tools.queue
 */

(function(self) {
    /**
     * Construct and return a new queue object.
     *
     * @param integer size The number of entries the queue will be able to hold.
     *
     * @returns object
     */
    self.create = size => ({
        start: 0,
        count: 0,
        size: size,
        end: 0,
        elements: [],
        timeout: null
    });

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    self.empty = oQueue => oQueue.count <= 0;

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    self.full = oQueue => oQueue.count >= oQueue.size;

    /**
     * Push a new object into the tail of the buffer maintained by the specified queue object.
     *
     * @param object oQueue The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    self.push = function(oQueue, obj) {
        // No push if the queue is full.
        if(self.full(oQueue)) {
            throw { code: 10003 };
        }

        oQueue.elements[oQueue.end] = obj;
        if(++oQueue.end >= oQueue.size) {
            oQueue.end = 0;
        }
        return ++oQueue.count;
    };

    /**
     * Push a new object into the head of the buffer maintained by the specified queue object.
     *
     * This effectively pushes an object to the front of the queue... it will be processed first.
     *
     * @param object oQueue The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    self.pushFront = function(oQueue, obj) {
        // No push if the queue is full.
        if(self.full(oQueue)) {
            throw { code: 10003 };
        }

        // Simply push if the queue is empty
        if(self.empty(oQueue)) {
            return self.push(oQueue, obj);
        }

        // Put the object one position back.
        if(--oQueue.start < 0) {
            oQueue.start = oQueue.size - 1;
        }
        oQueue.elements[oQueue.start] = obj;
        return ++oQueue.count;
    };

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    self.pop = function(oQueue) {
        if(self.empty(oQueue)) {
            return null;
        }

        let obj = oQueue.elements[oQueue.start];
        delete oQueue.elements[oQueue.start];
        if(++oQueue.start >= oQueue.size) {
            oQueue.start = 0;
        }
        oQueue.count--;
        return obj;
    };

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    self.peek = function(oQueue) {
        if(self.empty(oQueue)) {
            return null;
        }
        return oQueue.elements[oQueue.start];
    };
})(jaxon.tools.queue);


/**
 * Class: jaxon.tools.string
 */

(function(self) {
    /*
    Function: jaxon.tools.string.doubleQuotes

    Replace all occurances of the single quote character with a double quote character.

    Parameters:
    haystack - The source string to be scanned.

    Returns:  false on error
    string - A new string with the modifications applied.
    */
    self.doubleQuotes = haystack =>
        haystack === undefined ? false : haystack.replace(new RegExp("'", 'g'), '"');

    /*
    Function: jaxon.tools.string.singleQuotes

    Replace all occurances of the double quote character with a single quote character.

    haystack - The source string to be scanned.

    Returns:
    string - A new string with the modification applied.
    */
    self.singleQuotes = haystack =>
        haystack === undefined ? false : haystack.replace(new RegExp('"', 'g'), "'");

    /*
    Function: jaxon.tools.string.stripOnPrefix

    Detect, and if found, remove the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    self.stripOnPrefix = function(sEventName) {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') === 0 ? sEventName.replace(/on/, '') : sEventName;
    };

    /*
    Function: jaxon.tools.string.addOnPrefix

    Detect, and add if not found, the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    self.addOnPrefix = function(sEventName) {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') !== 0 ? 'on' + sEventName : sEventName;
    };

    /**
     * String functions for Jaxon
     * See http://javascript.crockford.com/remedial.html for more explanation
     */

    /**
     * Substitute variables in the string
     *
     * @return string
     */
    if (!String.prototype.supplant) {
        String.prototype.supplant = function(o) {
            return this.replace(
                /\{([^{}]*)\}/g,
                function(a, b) {
                    const r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }
})(jaxon.tools.string);


/**
 * Class: jaxon.tools.upload
 */

(function(self, dom, console) {
    /**
     * @param {object} oRequest
     *
     * @return {bool}
     */
    const initRequest = function(oRequest) {
        if (!oRequest.upload) {
            return false;
        }

        oRequest.upload = {
            id: oRequest.upload,
            input: null,
            form: null,
        };
        const input = dom.$(oRequest.upload.id);

        if (!input) {
            console.log('Unable to find input field for file upload with id ' + oRequest.upload.id);
            return false;
        }
        if (input.type !== 'file') {
            console.log('The upload input field with id ' + oRequest.upload.id + ' is not of type file');
            return false;
        }
        if (input.files.length === 0) {
            console.log('There is no file selected for upload in input field with id ' + oRequest.upload.id);
            return false;
        }
        if (input.name === undefined) {
            console.log('The upload input field with id ' + oRequest.upload.id + ' has no name attribute');
            return false;
        }
        oRequest.upload.input = input;
        oRequest.upload.form = input.form;
        return true;
    };

    /**
     * Check upload data and initialize the request.
     *
     * @param {object} oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
     *
     * @return {void}
     */
    self.initialize = function(oRequest) {
        // The content type shall not be set when uploading a file with FormData.
        // It will be set by the browser.
        if (!initRequest(oRequest)) {
            oRequest.postHeaders['content-type'] = oRequest.contentType;
        }
    }
})(jaxon.tools.upload, jaxon.tools.dom, console);


/**
 * Class: jaxon.cmd.delay
 */

(function(self, rsp, queue, msg) {
    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    self.popAsyncRequest = oQueue =>
        queue.empty(oQueue) || queue.peek(oQueue).mode === 'synchronous' ?
        null : queue.pop(oQueue);

    /**
     * Maintains a retry counter for the given object.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of times the operation should be attempted before a failure is indicated.
     *
     * @returns boolean
     *      true - The object has not exhausted all the retries.
     *      false - The object has exhausted the retry count specified.
     */
    self.retry = function(command, count) {
        let retries = command.retries;
        if(retries) {
            --retries;
            if(1 > retries) {
                return false;
            }
        } else {
            retries = count;
        }
        command.retries = retries;
        // This command must be processed again.
        command.requeue = true;
        return true;
    };

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param response object   The queue to process.
     * @param when integer      The number of milliseconds to wait before starting/restarting the processing of the queue.
     */
    self.setWakeup = function(response, when) {
        if (response.timeout !== null) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(function() {
            rsp.process(response);
        }, when);
    };

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of commands to skip.
     * @param skip boolean      Skip the commands or not.
     *
     * @returns boolean
     */
    const confirmCallback = function(command, count, skip) {
        if(skip === true) {
            // The last entry in the queue is not a user command.
            // Thus it cannot be skipped.
            while (count > 0 && command.response.count > 1 &&
                queue.pop(command.response) !== null) {
                --count;
            }
        }
        // Run a different command depending on whether this callback executes
        // before of after the confirm function returns;
        if(command.requeue === true) {
            // Before => the processing is delayed.
            self.setWakeup(command.response, 30);
            return;
        }
        // After => the processing is executed.
        rsp.process(command.response);
    };

    /**
     * Ask a confirm question and skip the specified number of commands if the answer is ok.
     *
     * The processing of the queue after the question is delayed so it occurs after this function returns.
     * The 'command.requeue' attribute is used to determine if the confirmCallback is called
     * before (when using the blocking confirm() function) or after this function returns.
     * @see confirmCallback
     *
     * @param command object    The object to track the retry count for.
     * @param question string   The question to ask to the user.
     * @param count integer     The number of commands to skip.
     *
     * @returns boolean
     */
    self.confirm = function(command, count, question) {
        // This will be checked in the callback.
        command.requeue = true;
        msg.confirm(question, '', function() {
            confirmCallback(command, count, false);
        }, function() {
            confirmCallback(command, count, true);
        });

        // This command must not be processed again.
        command.requeue = false;
        return false;
    };
})(jaxon.cmd.delay, jaxon.ajax.response, jaxon.tools.queue, jaxon.ajax.message);


/**
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, script) {
    /**
     *  Set an event handler.
     *
     * @param {object} command - Response command object.
     * - id: Element ID
     * - prop: Event
     * - data: Code
     *
     * @returns {true} - The operation completed successfully.
     */
    self.setEvent = function(command) {
        command.fullName = 'setEvent';
        const sEvent = str.addOnPrefix(command.prop);
        const sCode = str.doubleQuotes(command.data);
        // force to get the target
        const oTarget = dom.$(command.id);
        dom.createFunction(`(e) => { ${sCode} }`);
        oTarget[sEvent] = script.context.delegateCall;
        return true;
    };

    const getName = window.addEventListener ? str.stripOnPrefix : str.addOnPrefix;

    const _addHandler = window.addEventListener ?
        (target, event, func) => target.addEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.attachEvent(event, dom.findFunction(func));

    const _removeHandler = window.addEventListener ?
        (target, event, func) => target.removeEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.detachEvent(event, dom.findFunction(func));

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command - Response command object.
     * - id: The id of, or the target itself
     * - prop: The name of the event.
     * - data: The name of the function to be called
     *
     * @returns {true} - The operation completed successfully.
     */
    self.addHandler = function(command) {
        command.fullName = 'addHandler';
        const sFuncName = command.data;
        const sEvent = getName(command.prop);
        // force to get the target
        const oTarget = dom.$(command.id);
        return _addHandler(oTarget, sEvent, sFuncName);
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command - Response command object.
     * - id: The id of, or the target itself
     * - prop: The name of the event.
     * - data: The name of the function to be called
     *
     * @returns {true} - The operation completed successfully.
     */
    self.removeHandler = function(command) {
        command.fullName = 'removeHandler';
        const sFuncName = command.data;
        const sEvent = getName(command.prop);
        // force to get the target
        const oTarget = dom.$(command.id);
        return _removeHandler(oTarget, sEvent, sFuncName);
    };
})(jaxon.cmd.event, jaxon.tools.dom, jaxon.tools.string, jaxon.cmd.script);


/**
 * Class: jaxon.cmd.form
 */

(function(self, dom, baseDocument) {
    /*
    Create and return a form input element with the specified parameters.

    Parameters:

    type - (string):  The type of input element desired.
    name - (string):  The value to be assigned to the name attribute.
    id - (string):  The value to be assigned to the id attribute.

    Returns:

    object - The new input element.
    */
    const getInput = function(type, name, id) {
        const oInput = baseDocument.createElement('input');
        oInput.setAttribute('type', type);
        oInput.setAttribute('name', name);
        oInput.setAttribute('id', id);
        return oInput;
    };

    /*
    Function: jaxon.cmd.form.createInput

    Create a new input element under the specified parent.

    Parameters:

    objParent - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.createInput = function(command) {
        command.fullName = 'createInput';
        const objParent = dom.$(command.id);
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.form.insertInput

    Insert a new input element before the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertInput = function(command) {
        command.fullName = 'insertInput';
        const objSibling = dom.$(command.id);
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling);
        return true;
    };

    /*
    Function: jaxon.cmd.form.insertInputAfter

    Insert a new input element after the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertInputAfter = function(command) {
        command.fullName = 'insertInputAfter';
        const objSibling = dom.$(command.id);
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        return true;
    };
})(jaxon.cmd.form, jaxon.tools.dom, jaxon.config.baseDocument);


/**
 * Class: jaxon.cmd.node
 */

(function(self, dom, baseDocument) {
    /*
    Function: jaxon.cmd.node.assign

    Assign an element's attribute to the specified value.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to set.
    data - (string):  The new value to be applied.

    Returns:

    true - The operation completed successfully.
    */
    self.assign = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.append

    Append the specified value to an element's attribute.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to append to.
    data - (string):  The new value to be appended.

    Returns:

    true - The operation completed successfully.
    */
    self.append = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = element.innerHTML + data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = element.outerHTML + data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.prepend

    Prepend the specified value to an element's attribute.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute.
    data - (string):  The new value to be prepended.

    Returns:

    true - The operation completed successfully.
    */
    self.prepend = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data + element.innerHTML;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data + element.outerHTML;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data + innerElement[innerProperty];
        return true;
    };

    /*
    Function: jaxon.cmd.node.replace

    Search and replace the specified text.

    Parameters:

    element - (string or object):  The name of, or the element itself which is to be modified.
    sAttribute - (string):  The name of the attribute to be set.
    aData - (array):  The search text and replacement text.

    Returns:

    true - The operation completed successfully.
    */
    self.replace = function(element, sAttribute, aData) {
        const sReplace = aData['r'];
        const sSearch = (sAttribute === 'innerHTML') ?
            dom.getBrowserHTML(aData['s']) : aData['s'];
        element = dom.$(element);
        const [innerElement, innerAttribute] = dom.getInnerObject(element, sAttribute);
        if(!innerElement) {
            return true;
        }
        let txt = innerElement[innerAttribute];

        let bFunction = false;
        if (typeof txt === 'function') {
            txt = txt.join('');
            bFunction = true;
        }

        let start = txt.indexOf(sSearch);
        if (start > -1) {
            let newTxt = [];
            while (start > -1) {
                const end = start + sSearch.length;
                newTxt.push(txt.substr(0, start));
                newTxt.push(sReplace);
                txt = txt.substr(end, txt.length - end);
                start = txt.indexOf(sSearch);
            }
            newTxt.push(txt);
            newTxt = newTxt.join('');

            if (bFunction || dom.willChange(element, sAttribute, newTxt)) {
                innerElement[innerAttribute] = newTxt;
            }
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.remove

    Delete an element.

    Parameters:

    element - (string or object):  The name of, or the element itself which will be deleted.

    Returns:

    true - The operation completed successfully.
    */
    self.remove = function(element) {
        element = dom.$(element);
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.create

    Create a new element and append it to the specified parent element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        which will contain the new element.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value to be assigned to the id attribute of the new element.

    Returns:

    true - The operation completed successfully.
    */
    self.create = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.appendChild(target);
        return true;
    };

    /*
    Function: jaxon.cmd.node.insert

    Insert a new element before the specified element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insert = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element);
        return true;
    };

    /*
    Function: jaxon.cmd.node.insertAfter

    Insert a new element after the specified element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertAfter = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element.nextSibling);
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextAssign

    Assign a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to assign.
        - command.data: (string or object):  The value to assign to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextAssign = function(command) {
        command.fullName = 'context assign';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextAppend

    Appends a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to append to.
        - command.data: (string or object):  The value to append to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextAppend = function(command) {
        command.fullName = 'context append';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + command.data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextPrepend

    Prepend a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to prepend to.
        - command.data: (string or object):  The value to prepend to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextPrepend = function(command) {
        command.fullName = 'context prepend';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data + innerElement[innerProperty];
        return true;
    };
})(jaxon.cmd.node, jaxon.tools.dom, jaxon.config.baseDocument);


/**
 * Class: jaxon.cmd.script
 */

(function(self, delay, msg, dom, baseDocument, window) {
    /*
    Function: jaxon.cmd.script.includeScriptOnce

    Add a reference to the specified script file if one does not already exist in the HEAD of the current document.

    This will effecitvely cause the script file to be loaded in the browser.

    Parameters:

    fileName - (string):  The URI of the file.

    Returns:

    true - The reference exists or was added.
    */
    self.includeScriptOnce = function(command) {
        command.fullName = 'includeScriptOnce';

        const fileName = command.data;
        // Check for existing script tag for this file.
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (loadedScript) {
            return true;
        }
        return self.includeScript(command);
    };

    /*
    Function: jaxon.cmd.script.includeScript

    Adds a SCRIPT tag referencing the specified file.
    This effectively causes the script to be loaded in the browser.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The reference was added.
    */
    self.includeScript = function(command) {
        command.fullName = 'includeScript';

        const objHead = baseDocument.getElementsByTagName('head');
        const objScript = baseDocument.createElement('script');
        objScript.src = command.data;
        objScript.type = command.type || 'text/javascript';
        if (command.elm_id) {
            objScript.setAttribute('id', command.elm_id);
        }
        objHead[0].appendChild(objScript);
        return true;
    };

    /*
    Function: jaxon.cmd.script.removeScript

    Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The script was not found or was removed.
    */
    self.removeScript = function(command) {
        command.fullName = 'removeScript';
        const fileName = command.data;
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (!loadedScript) {
            return true;
        }
        if (command.unld) {
            // Execute the provided unload function.
            self.execute({ data: command.unld, context: window });
        }
        loadedScript.parentNode.removeChild(loadedScript);
        return true;
    };

    /*
    Function: jaxon.cmd.script.sleep

    Causes the processing of items in the queue to be delayed for the specified amount of time.
    This is an asynchronous operation, therefore, other operations will be given an opportunity
    to execute during this delay.

    Parameters:

    command - (object):  The response command containing the following parameters.
        - command.prop: The number of 10ths of a second to sleep.

    Returns:

    true - The sleep operation completed.
    false - The sleep time has not yet expired, continue sleeping.
    */
    self.sleep = function(command) {
        command.fullName = 'sleep';
        // inject a delay in the queue processing
        // handle retry counter
        if (delay.retry(command, command.prop)) {
            delay.setWakeup(command.response, 100);
            return false;
        }
        // wake up, continue processing queue
        return true;
    };

    /*
    Function: jaxon.cmd.script.alert

    Show the specified message.

    Parameters:

    command (object) - jaxon response object

    Returns:

    true - The operation completed successfully.
    */
    self.alert = function(command) {
        command.fullName = 'alert';
        msg.info(command.data);
        return true;
    };

    /*
    Function: jaxon.cmd.script.confirm

    Prompt the user with the specified question, if the user responds by clicking cancel,
    then skip the specified number of commands in the response command queue.
    If the user clicks Ok, the command processing resumes normal operation.

    Parameters:

    command (object) - jaxon response object

    Returns:

    false - Stop the processing of the command queue until the user answers the question.
    */
    self.confirm = function(command) {
        command.fullName = 'confirm';
        delay.confirm(command, command.count, command.data);
        return false;
    };

    /*
    Function: jaxon.cmd.script.call

    Call a javascript function with a series of parameters using the current script context.

    Parameters:

    command - The response command object containing the following:
        - command.data: (array):  The parameters to pass to the function.
        - command.func: (string):  The name of the function to call.
        - command.context: (object):  The current script context object which is accessable in the
            function name via the 'this keyword.

    Returns:

    true - The call completed successfully.
    */
    self.call = function(command) {
        command.fullName = 'call js function';
        self.context = command.context ?? {};

        const func = dom.findFunction(command.func);
        if(!func) {
            return true;
        }
        func.apply(self.context, command.data);
        return true;
    };

    /*
    Function: jaxon.cmd.script.execute

    Execute the specified string of javascript code, using the current script context.

    Parameters:

    command - The response command object containing the following:
        - command.data: (string):  The javascript to be evaluated.
        - command.context: (object):  The javascript object that to be referenced as 'this' in the script.

    Returns:

    unknown - A value set by the script using 'returnValue = '
    true - If the script does not set a returnValue.
    */
    self.execute = function(command) {
        command.fullName = 'execute Javascript';
        self.context = command.context ?? {};

        const jsCode = `() => {
    ${command.data}
}`;
        dom.createFunction(jsCode);
        self.context.delegateCall();
        return true;
    };

    /*
    Function: jaxon.cmd.script.waitFor

    Test for the specified condition, using the current script context;
    if the result is false, sleep for 1/10th of a second and try again.

    Parameters:

    command - The response command object containing the following:

        - command.data: (string):  The javascript to evaluate.
        - command.prop: (integer):  The number of 1/10ths of a second to wait before giving up.
        - command.context: (object):  The current script context object which is accessable in
            the javascript being evaulated via the 'this' keyword.

    Returns:

    false - The condition evaulates to false and the sleep time has not expired.
    true - The condition evaluates to true or the sleep time has expired.
    */
    self.waitFor = function(command) {
        command.fullName = 'waitFor';
        self.context = command.context ?? {};

        try {
            const jsCode = `() => {
    return (${command.data});
}`;
            dom.createFunction(jsCode);
            const bResult = self.context.delegateCall();
            if (!bResult) {
                // inject a delay in the queue processing
                // handle retry counter
                if (delay.retry(command, command.prop)) {
                    delay.setWakeup(command.response, 100);
                    return false;
                }
                // give up, continue processing queue
            }
        } catch (e) {}
        return true;
    };

    /**
     * Get function parameters as string
     *
     * @param {string|object} parameters 
     */
    const getParameters = function(parameters) {
        if (parameters === undefined) {
            return '';
        }
        if (Array.isArray(parameters)) {
            return parameters.join(', ');
        }
        if (typeof parameters === 'object') {
            return parameters.values().join(', ');
        }
        return parameters;
    };

    /*
    Function: jaxon.cmd.script.setFunction

    Constructs the specified function using the specified javascript as the body of the function.

    Parameters:

    command - The response command object which contains the following:

        - command.func: (string):  The name of the function to construct.
        - command.data: (string):  The script that will be the function body.
        - command.context: (object):  The current script context object
            which is accessable in the script name via the 'this' keyword.

    Returns:

    true - The function was constructed successfully.
    */
    self.setFunction = function(command) {
        command.fullName = 'setFunction';

        const funcParams = getParameters(command.prop);
        const jsCode = `(${funcParams}) => {
    ${command.data}
}`;
        dom.createFunction(jsCode, command.func);
        return true;
    };

    /*
    Function: jaxon.cmd.script.wrapFunction

    Construct a javascript function which will call the original function with the same name,
    potentially executing code before and after the call to the original function.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.func: (string):  The name of the function to be wrapped.
        - command.prop: (string):  List of parameters used when calling the function.
        - command.data: (array):  The portions of code to be called before, after
            or even between calls to the original function.
        - command.context: (object):  The current script context object which is
            accessable in the function name and body via the 'this' keyword.

    Returns:

    true - The wrapper function was constructed successfully.
    */
    self.wrapped = {}; // Original wrapped functions will be saved here.
    self.wrapFunction = function(command) {
        command.fullName = 'wrapFunction';
        self.context = command.context ?? {};

        const func = dom.findFunction(command.func);
        if(!func) {
            return true;
        }

        // Save the existing function
        const wrappedFuncName = command.func.toLowerCase().replaceAll('.', '_');
        if (!self.wrapped[wrappedFuncName]) {
            self.wrapped[wrappedFuncName] = func;
        }

        const varDefine = command.type ? `let ${command.type} = null;` : '// No return value';
        const varAssign = command.type ? `${command.type} = ` : '';
        const varReturn = command.type ? `return ${command.type};` : '// No return value';
        const funcParams = getParameters(command.prop);
        const funcCodeBefore = command.data[0];
        const funcCodeAfter = command.data[1] || '// No call after';

        const jsCode = `(${funcParams}) => {
    ${varDefine}
    ${funcCodeBefore}

    const wrappedFuncName = "${command.func}".toLowerCase().replaceAll('.', '_');
    // Call the wrapped function (saved in jaxon.cmd.script.wrapped) with the same parameters.
    ${varAssign}jaxon.cmd.script.wrapped[wrappedFuncName](${funcParams});
    ${funcCodeAfter}
    ${varReturn}
}`;

        dom.createFunction(jsCode, command.func);
        self.context.delegateCall();
        return true;
    }
})(jaxon.cmd.script, jaxon.cmd.delay, jaxon.ajax.message,
    jaxon.tools.dom, jaxon.config.baseDocument, window);


/**
 * Class: jaxon.cmd.style
 */

(function(self, delay, baseDocument) {
    /*
    Function: jaxon.cmd.style.add

    Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.

    Parameters:

    filename - (string):  The URI of the .css file to reference.
    media - (string):  The media type of the css file (print/screen/handheld,..)

    Returns:

    true - The operation completed successfully.
    */
    self.add = function(fileName, media) {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = oHead.getElementsByTagName('link')
            .find(link => link.href.indexOf(fileName) >= 0 && link.media == media);
        if (found) {
            return true;
        }

        const oCSS = baseDocument.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
        return true;
    };

    /*
    Function: jaxon.cmd.style.remove

    Locate and remove a LINK reference from the current document's HEAD.

    Parameters:

    filename - (string):  The URI of the .css file.

    Returns:

    true - The operation completed successfully.
    */
    self.remove = function(fileName, media) {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const oLinks = oHead.getElementsByTagName('link');
        oLinks.filter(link = oLinks[i].href.indexOf(fileName) >= 0 && oLinks[i].media == media)
            .forEach(link => oHead.removeChild(link));
        return true;
    },

    /*
    Function: jaxon.cmd.style.waitForCSS

    Attempt to detect when all .css files have been loaded once they are referenced by a LINK tag
    in the HEAD of the current document.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.prop - (integer):  The number of 1/10ths of a second to wait before giving up.

    Returns:

    true - The .css files appear to be loaded.
    false - The .css files do not appear to be loaded and the timeout has not expired.
    */
    self.waitForCSS = function(command) {
        const oDocSS = baseDocument.styleSheets;
        const ssLoaded = oDocSS
            .map(styleSheet => styleSheet.cssRules.length ?? styleSheet.rules.length ?? 0)
            .every(enabled => enabled !== 0);
        if (ssLoaded) {
            return;
        }

        // inject a delay in the queue processing
        // handle retry counter
        if (delay.retry(command, command.prop)) {
            delay.setWakeup(command.response, 10);
            return false;
        }
        // Give up, continue processing queue
        return true;
    };
})(jaxon.cmd.style, jaxon.cmd.delay, jaxon.config.baseDocument);


/**
 * Class: jaxon.ajax.callback
 */

(function(self, config) {
    /*
    Create a timer to fire an event in the future.
    This will be used fire the onRequestDelay and onExpiration events.

    Parameters:

    iDelay - (integer):  The amount of time in milliseconds to delay.

    Returns:

    object - A callback timer object.
    */
    const setupTimer = function(iDelay) {
        return { timer: null, delay: iDelay };
    };

    /*
    Function: jaxon.ajax.callback.create

    Create a blank callback object.
    Two optional arguments let you set the delay time for the onResponseDelay and onExpiration events.

    Returns:

    object - The callback object.
    */
    self.create = function() {
        return {
            timers: {
                onResponseDelay: setupTimer((arguments.length > 0) ?
                    arguments[0] : config.defaultResponseDelayTime),
                onExpiration: setupTimer((arguments.length > 1) ?
                    arguments[1] : config.defaultExpirationTime),
            },
            onPrepare: null,
            onRequest: null,
            onResponseDelay: null,
            onExpiration: null,
            beforeResponseProcessing: null,
            onFailure: null,
            onRedirect: null,
            onSuccess: null,
            onComplete: null,
        };
    };

    /*
    Object: jaxon.ajax.callback.callback

    The global callback object which is active for every request.
    */
    self.callback = self.create();

    /*
    Function: jaxon.ajax.callback.execute

    Execute a callback event.

    Parameters:

    oCallback - (object):  The callback object (or objects) which
        contain the event handlers to be executed.
    sFunction - (string):  The name of the event to be triggered.
    args - (object):  The request object for this request.
    */
    self.execute = function(oCallback, sFunction, args) {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => self.execute(oCb, sFunction, args));
            return;
        }

        if (oCallback[sFunction] === undefined || 'function' !== typeof oCallback[sFunction]) {
            return;
        }

        if (oCallback.timers[sFunction] === undefined) {
            oCallback[sFunction](args);
            return;
        }

        oCallback.timers[sFunction].timer = setTimeout(function() {
            oCallback[sFunction](args);
        }, oCallback.timers[sFunction].delay);
    };

    /*
    Function: jaxon.ajax.callback.clearTimer

    Clear a callback timer for the specified function.

    Parameters:

    oCallback - (object):  The callback object (or objects) that
        contain the specified function timer to be cleared.
    sFunction - (string):  The name of the function associated
        with the timer to be cleared.
    */
    self.clearTimer = function(oCallback, sFunction) {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => self.clearTimer(oCb, sFunction));
            return;
        }

        if (oCallback.timers[sFunction] !== undefined) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    };
})(jaxon.ajax.callback, jaxon.config);


/**
 * Class: jaxon.ajax.handler
 */

(function(self, rsp, node, style, script, form, evt, dom, console) {
    /*
    An array that is used internally in the jaxon.fn.handler object
    to keep track of command handlers that have been registered.
    */
    const handlers = [];

    /*
    Function: jaxon.ajax.handler.execute

    Perform a lookup on the command specified by the response command
    object passed in the first parameter.  If the command exists, the
    function checks to see if the command references a DOM object by
    ID; if so, the object is located within the DOM and added to the
    command data.  The command handler is then called.

    If the command handler returns true, it is assumed that the command
    completed successfully.  If the command handler returns false, then the
    command is considered pending; jaxon enters a wait state.  It is up
    to the command handler to set an interval, timeout or event handler
    which will restart the jaxon response processing.

    Parameters:

    obj - (object):  The response command to be executed.

    Returns:

    true - The command completed successfully.
    false - The command signalled that it needs to pause processing.
    */
    self.execute = function(command) {
        if (self.isRegistered(command)) {
            // it is important to grab the element here as the previous command
            // might have just created the element
            if (command.id) {
                command.target = dom.$(command.id);
            }
            // process the command
            return self.call(command);
        }
        return true;
    };

    /*
    Function: jaxon.ajax.handler.register

    Registers a new command handler.
    */
    self.register = function(shortName, func) {
        handlers[shortName] = func;
    };

    /*
    Function: jaxon.ajax.handler.unregister

    Unregisters and returns a command handler.

    Parameters:
        shortName - (string): The name of the command handler.

    Returns:
        func - (function): The unregistered function.
    */
    self.unregister = function(shortName) {
        const func = handlers[shortName];
        delete handlers[shortName];
        return func;
    };

    /*
    Function: jaxon.ajax.handler.isRegistered

    Parameters:
        command - (object): The Name of the function.

    Returns:

    boolean - (true or false): depending on whether a command handler has
    been created for the specified command (object).

    */
    self.isRegistered = function(command) {
        return command.cmd !== undefined && handlers[command.cmd] !== undefined;
    };

    /*
    Function: jaxon.ajax.handler.call

    Calls the registered command handler for the specified command
    (you should always check isRegistered before calling this function)

    Parameters:
        command - (object): The Name of the function.

    Returns:
        true - (boolean) :
    */
    self.call = function(command) {
        return handlers[command.cmd](command);
    };

    self.register('rcmplt', function(command) {
        rsp.complete(command.request);
        return true;
    });

    self.register('css', function(command) {
        command.fullName = 'includeCSS';
        if (command.media === undefined)
            command.media = 'screen';
        return style.add(command.data, command.media);
    });
    self.register('rcss', function(command) {
        command.fullName = 'removeCSS';
        if (command.media === undefined)
            command.media = 'screen';
        return style.remove(command.data, command.media);
    });
    self.register('wcss', function(command) {
        command.fullName = 'waitForCSS';
        return style.waitForCSS(command);
    });

    self.register('as', function(command) {
        command.fullName = 'assign/clear';
        try {
            return node.assign(command.target, command.prop, command.data);
        } catch (e) {
            // do nothing, if the debug module is installed it will
            // catch and handle the exception
        }
        return true;
    });
    self.register('ap', function(command) {
        command.fullName = 'append';
        return node.append(command.target, command.prop, command.data);
    });
    self.register('pp', function(command) {
        command.fullName = 'prepend';
        return node.prepend(command.target, command.prop, command.data);
    });
    self.register('rp', function(command) {
        command.fullName = 'replace';
        return node.replace(command.id, command.prop, command.data);
    });
    self.register('rm', function(command) {
        command.fullName = 'remove';
        return node.remove(command.id);
    });
    self.register('ce', function(command) {
        command.fullName = 'create';
        return node.create(command.id, command.data, command.prop);
    });
    self.register('ie', function(command) {
        command.fullName = 'insert';
        return node.insert(command.id, command.data, command.prop);
    });
    self.register('ia', function(command) {
        command.fullName = 'insertAfter';
        return node.insertAfter(command.id, command.data, command.prop);
    });

    self.register('c:as', node.contextAssign);
    self.register('c:ap', node.contextAppend);
    self.register('c:pp', node.contextPrepend);

    self.register('s', script.sleep);
    self.register('ino', script.includeScriptOnce);
    self.register('in', script.includeScript);
    self.register('rjs', script.removeScript);
    self.register('wf', script.waitFor);
    self.register('js', script.execute);
    self.register('jc', script.call);
    self.register('sf', script.setFunction);
    self.register('wpf', script.wrapFunction);
    self.register('al', script.alert);
    self.register('cc', script.confirm);

    self.register('ci', form.createInput);
    self.register('ii', form.insertInput);
    self.register('iia', form.insertInputAfter);

    self.register('ev', evt.setEvent);

    self.register('ah', evt.addHandler);
    self.register('rh', evt.removeHandler);

    self.register('dbg', function(command) {
        command.fullName = 'debug message';
        console.log(command.data);
        return true;
    });
})(jaxon.ajax.handler, jaxon.ajax.response, jaxon.cmd.node, jaxon.cmd.style,
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.tools.dom, console);


/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /*
    Function: jaxon.ajax.message.success

    Print a success message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.success = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.info

    Print an info message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.info = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.warning

    Print a warning message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.warning = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.error

    Print an error message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.error = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.confirm

    Print an error message on the screen.

    Parameters:
        question - (string):  The confirm question.
        title - (string):  The confirm title.
        yesCallback - (Function): The function to call if the user answers yes.
        noCallback - (Function): The function to call if the user answers no.
    */
    self.confirm = function(question, title, yesCallback, noCallback) {
        if(confirm(question)) {
            yesCallback();
            return;
        }
        noCallback && noCallback();
    };
})(jaxon.ajax.message);


/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /**
     * The array of data bags
     * @type {object}
     */
    self.bags = {};

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {*} oVal - The value to be stringified
     *
     * @returns {string}
     */
    const stringify = function(oVal) {
        if (oVal === undefined ||  oVal === null) {
            return '*';
        }
        const sType = typeof oVal;
        if (sType === 'object') {
            try {
                return encodeURIComponent(JSON.stringify(oVal));
            } catch (e) {
                oVal = '';
                // do nothing, if the debug module is installed
                // it will catch the exception and handle it
            }
        }
        oVal = encodeURIComponent(oVal);
        if (sType === 'string') {
            return 'S' + oVal;
        }
        if (sType === 'boolean') {
            return 'B' + oVal;
        }
        if (sType === 'number') {
            return 'N' + oVal;
        }
        return oVal;
    };

    /**
     * Processes request specific parameters and store them in a FormData object.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const toFormData = function(oRequest) {
        const rd = new FormData();
        rd.append('jxnr', oRequest.dNow.getTime());

        // Files to upload
        const input = oRequest.upload.input;
        input.files && input.files.forEach(file => rd.append(input.name, file));

        Object.keys(oRequest.functionName).forEach(sCommand =>
            rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand])));

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.append('jxnargs[]', stringify(oVal));
            }
        }

        if(oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            rd.append('jxnbags', stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = rd;
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const toUrlEncoded = function(oRequest) {
        const rd = [];
        rd.push('jxnr=' + oRequest.dNow.getTime());

        Object.keys(oRequest.functionName).forEach(sCommand =>
            rd.push(sCommand + '=' + encodeURIComponent(oRequest.functionName[sCommand])));

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.push('jxnargs[]=' + stringify(oVal));
            }
        }

        if(oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            rd.push('jxnbags=' + stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;

        if (oRequest.method === 'GET') {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            // No body for HTTP GET requests
            rd = [];
        }

        oRequest.requestData = rd.join('&');
    };

    /**
     * Function: jaxon.ajax.parameters.process
     *
     * Processes request specific parameters and generates the temporary
     * variables needed by jaxon to initiate and process the request.
     *
     * @param {object} oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
     *
     * @return {void}
     *
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     */
    self.process = function(oRequest) {
        const func = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            toFormData : toUrlEncoded;
        // Make request parameters.
        oRequest.dNow = new Date();
        func(oRequest);
        delete oRequest.dNow;
    };
})(jaxon.ajax.parameters);


/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, upload, queue, delay, window) {
    /**
     * @param {object} oRequest
     *
     * @return {void}
     */
    const initCallbacks = function(oRequest) {
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
    const initialize = function(oRequest) {
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
    const prepare = function(oRequest) {
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
    const submit = function(oRequest) {
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
    self.abort = function(oRequest) {
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
    self.execute = function(functionName, functionArgs) {
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
    jaxon.ajax.callback, jaxon.tools.upload, jaxon.tools.queue, jaxon.cmd.delay, window);


/**
 * Class: jaxon.ajax.response
 */

(function(self, config, handler, req, cbk, queue, delay, window, console) {
    /*
    Called by the response command queue processor when all commands have been processed.

    Parameters:

    oRequest - (object):  The request context object.
    */
    self.complete = function(oRequest) {
        cbk.execute([cbk.callback, oRequest.callback], 'onComplete', oRequest);
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
            // Remove the current request from the send and recv queues.
            queue.pop(delay.q.send);
            queue.pop(delay.q.recv);
            // Process the asynchronous requests received while waiting.
            while((recvRequest = delay.popAsyncRequest(delay.q.recv)) != null) {
                received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((nextRequest = delay.popAsyncRequest(delay.q.send)) != null) {
                req.submit(nextRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((nextRequest = queue.peek(delay.q.send)) != null) {
                req.submit(nextRequest);
            }
        }
    };

    /**
     * Process a single command
     * 
     * @param {object} command The command to process
     *
     * @returns {boolean}
     */
    const processCommand = function(command) {
        try {
            if (handler.execute(command) !== false) {
                return true;
            }
            if(!command.requeue) {
                delete command;
                return true;
            }
            queue.pushFront(commandQueue, command);
            return false;
        } catch (e) {
            console.log(e);
        }
        delete command;
        return true;
    };

    /*
    While entries exist in the queue, pull and entry out and process it's command.
    When a command returns false, the processing is halted.

    Parameters:

    response - (commandQueue): A queue containing the commands to execute.
    This should have been created by calling <queue.create>.

    Returns:

    true - The queue was fully processed and is now empty.
    false - The queue processing was halted before the queue was fully processed.

    Note:

    - Use <jaxon.cmd.delay.setWakeup> or call this function to cause the queue processing to continue.
    - This will clear the associated timeout, this function is not designed to be reentrant.
    - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
    */
    const processCommands = function(commandQueue) {
        if (commandQueue.timeout !== null) {
            clearTimeout(commandQueue.timeout);
            commandQueue.timeout = null;
        }

        let command = null;
        while ((command = queue.pop(commandQueue)) !== null) {
            if (!processCommand(command)) {
                return false;
            }
        }
        return true;
    };

    /*
    Parse the JSON response into a series of commands.

    Parameters:
    oRequest - (object):  The request context object.
    */
    const queueCommands = function(oRequest) {
        const nodes = oRequest.responseContent;
        if (!nodes || !nodes.jxnobj) {
            return;
        }

        oRequest.status.onProcessing();

        if (nodes.jxnrv) {
            oRequest.returnValue = nodes.jxnrv;
        }

        nodes.debugmsg && console.log(nodes.debugmsg);

        nodes.jxnobj.forEach(command => queue.push(oRequest.commandQueue, {
            ...command,
            fullName: '*unknown*',
            sequence: oRequest.sequence++,
            response: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));
    };

    /*
    This array contains a list of codes which will be returned from the server upon
    successful completion of the server portion of the request.

    These values should match those specified in the HTTP standard.
    */
    const successCodes = ['0', '200'];

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
    This array contains a list of status codes returned by the server to indicate that
    the request failed for some reason.
    */
    const errorsForAlert = ['400', '401', '402', '403', '404', '500', '501', '502', '503'];

    // 10.3.1 300 Multiple Choices
    // 10.3.2 301 Moved Permanently
    // 10.3.3 302 Found
    // 10.3.4 303 See Other
    // 10.3.5 304 Not Modified
    // 10.3.6 305 Use Proxy
    // 10.3.7 306 (Unused)
    // 10.3.8 307 Temporary Redirect

    /*
    An array of status codes returned from the server to indicate a request for redirect to another URL.

    Typically, this is used by the server to send the browser to another URL.
    This does not typically indicate that the jaxon request should be sent to another URL.
    */
    const redirectCodes = ['301', '302', '307'];

    /*
    Function: jsonProcessor

    This is the JSON response processor.

    Parameters:

    oRequest - (object):  The request context object.
    */
    const jsonProcessor = function(oRequest) {
        // It's important to have '==' and not '===' here.
        if (successCodes.find(code => code == oRequest.response.status) !== undefined) {
            cbk.execute([cbk.callback, oRequest.callback], 'onSuccess', oRequest);

            oRequest.sequence = 0;
            queueCommands(oRequest)

            // Queue a last command to clear the queue
            queue.push(oRequest.commandQueue, {
                fullName: 'Response Complete',
                sequence: oRequest.sequence,
                request: oRequest,
                context: oRequest.context,
                cmd: 'rcmplt',
            });

            // do not re-start the queue if a timeout is set
            if (!oRequest.commandQueue.timeout) {
                // Process the commands in the queue
                processCommands(oRequest.commandQueue);
            }
            return oRequest.returnValue;
        }
        // It's important to have '==' and not '===' here.
        if (redirectCodes.find(code => code == oRequest.response.status) !== undefined) {
            cbk.execute([cbk.callback, oRequest.callback], 'onRedirect', oRequest);
            window.location = oRequest.request.getResponseHeader('location');
            self.complete(oRequest);
            return oRequest.returnValue;
        }
        // It's important to have '==' and not '===' here.
        if (errorsForAlert.find(code => code == oRequest.response.status) !== undefined) {
            cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
            self.complete(oRequest);
            return oRequest.returnValue;
        }
        return oRequest.returnValue;
    };

    /*
    Function: jaxon.ajax.response.received

    Process the response.

    Parameters:

    oRequest - (object):  The request context object.
    */
    self.received = function(oRequest) {
        // sometimes the responseReceived gets called when the request is aborted
        if (oRequest.aborted) {
            return null;
        }

        // Create a response queue for this request.
        oRequest.commandQueue = queue.create(config.commandQueueSize);

        cbk.clearTimer([cbk.callback, oRequest.callback], 'onExpiration');
        cbk.clearTimer([cbk.callback, oRequest.callback], 'onResponseDelay');
        cbk.execute([cbk.callback, oRequest.callback], 'beforeResponseProcessing', oRequest);

        const fProc = oRequest.responseProcessor ?? jsonProcessor;
        return fProc(oRequest);
    };
})(jaxon.ajax.response, jaxon.config, jaxon.ajax.handler, jaxon.ajax.request,
    jaxon.ajax.callback, jaxon.tools.queue, jaxon.cmd.delay, window, console);


/**
 * Class: jaxon.dom
 */

/**
 * Plain javascript replacement for jQuery's .ready() function.
 * See https://github.com/jfriend00/docReady for a detailed description, copyright and license information.
 */
(function(self) {
    "use strict";

    let readyList = [];
    let readyFired = false;
    let readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    const ready = () => {
        if (readyFired) {
            return;
        }
        // this must be set to true before we start calling callbacks
        readyFired = true;
        // if a callback here happens to add new ready handlers,
        // the jaxon.dom.ready() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList.forEach(cb => cb.fn.call(window, cb.ctx));
        // allow any closures held by these functions to free
        readyList = [];
    }

    const readyStateChange = () => document.readyState === "complete" && ready();

    // This is the one public interface
    // jaxon.dom.ready(fn, context);
    // the context argument is optional - if present, it will be passed as an argument to the callback
    self.ready = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        }
        // add the function and context to the list
        readyList.push({ fn: callback, ctx: context });
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
            return;
        }
        if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})(jaxon.dom);


/*
    File: jaxon.js

    This file contains the definition of the main jaxon javascript core.

    This is the client side code which runs on the web browser or similar web enabled application.
    Include this in the HEAD of each page for which you wish to use jaxon.

    Title: jaxon core javascript library

    Please see <copyright.inc.php> for a detailed description, copyright and license information.
*/

/*
    @package jaxon
    @version $Id: jaxon.core.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2010 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license http://www.jaxonproject.org/bsd_license.txt BSD License
*/

/*
Function: jaxon.request

Initiates a request to the server.
*/
jaxon.request = jaxon.ajax.request.execute;

/*
Function: jaxon.register

Registers a new command handler.
Shortcut to <jaxon.ajax.handler.register>
*/
jaxon.register = jaxon.ajax.handler.register;

/*
Function: jaxon.$

Shortcut to <jaxon.tools.dom.$>.
*/
jaxon.$ = jaxon.tools.dom.$;

/*
Function: jaxon.getFormValues

Shortcut to <jaxon.tools.form.getValues>.
*/
jaxon.getFormValues = jaxon.tools.form.getValues;

/*
Object: jaxon.msg

Prints various types of messages on the user screen.
*/
jaxon.msg = jaxon.ajax.message;

/*
Object: jaxon.js

Shortcut to <jaxon.cmd.script>.
*/
jaxon.js = jaxon.cmd.script;

/*
Boolean: jaxon.isLoaded

true - jaxon module is loaded.
*/
jaxon.isLoaded = true;

/*
Object: jaxon.cmd.delay.q

The queues that hold synchronous requests as they are sent and processed.
*/
jaxon.cmd.delay.q = {
    send: jaxon.tools.queue.create(jaxon.config.requestQueueSize),
    recv: jaxon.tools.queue.create(jaxon.config.requestQueueSize * 2)
};


/*
Class: jaxon.command

This class is defined for compatibility with previous versions,
since its functions are used in other packages.
*/
jaxon.command = {
    /*
    Class: jaxon.command.handler
    */
    handler: {},

    /*
    Function: jaxon.command.handler.register

    Registers a new command handler.
    */
    handler: {
        register: jaxon.ajax.handler.register
    },

    /*
    Function: jaxon.command.create

    Creates a new command (object) that will be populated with
    command parameters and eventually passed to the command handler.
    */
    create: function(sequence, request, context) {
        return {
            cmd: '*',
            fullName: '* unknown command name *',
            sequence: sequence,
            request: request,
            context: context
        };
    }
};

/*
Class: jxn

Contains shortcut's to frequently used functions.
*/
const jxn = {
    /*
    Function: jxn.$

    Shortcut to <jaxon.tools.dom.$>.
    */
    $: jaxon.tools.dom.$,

    /*
    Function: jxn.getFormValues

    Shortcut to <jaxon.tools.form.getValues>.
    */
    getFormValues: jaxon.tools.form.getValues,

    request: jaxon.request
};
