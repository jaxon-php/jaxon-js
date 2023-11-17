/*
    Class: jaxon.config

    This class contains all the default configuration settings.  These
    are application level settings; however, they can be overridden
    by including a jaxon.config definition prior to including the
    <jaxon_core.js> file, or by specifying the appropriate configuration
    options on a per call basis.
*/
var jaxon = {};

/*
Class: jaxon.debug
*/
jaxon.debug = {
    /*
    Class: jaxon.debug.verbose

    Provide a high level of detail which can be used to debug hard to find problems.
    */
    verbose: {}
};

/*
Class: jaxon.ajax
*/
jaxon.ajax = {};

/*
Class: jaxon.tools

This contains utility functions which are used throughout
the jaxon core.
*/
jaxon.tools = {};

/*
Class: jaxon.cmd

Contains the functions for page content, layout, functions and events.
*/
jaxon.cmd = {};

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
    mode, or when a syncrhonous call does not specify the
    return value.
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


jaxon.tools.array = {
    /*
    Function jaxon.tools.array.is_in

    Looks for a value within the specified array and, if found, returns true; otherwise it returns false.

    Parameters:
        array - (object): The array to be searched.
        valueToCheck - (object): The value to search for.

    Returns:
        true : The value is one of the values contained in the array.
        false : The value was not found in the specified array.
    */
    is_in: function(array, valueToCheck) {
        // It's important to have '==' and not '===' here.
        return array.find(value => value == valueToCheck);
    }
};


jaxon.tools.dom = {
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
     * @see <jaxon.$> and <jxn.$>
     */
    $: function(sId) {
        if (!sId)
            return null;

        if (typeof sId !== 'string')
            return sId;

        const oDoc = jaxon.config.baseDocument;
        const obj = oDoc.getElementById(sId);
        if (obj)
            return obj;
        if (oDoc.all)
            return oDoc.all[sId];

        return obj;
    },

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} - The workspace DOM element.
     */
    _getWorkspace: function() {
        const elWorkspace = jaxon.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }

        // Workspace not found. Must be ceated.
        const oDoc = jaxon.config.baseDocument;
        if (!oDoc.body)
            return null;

        const elNewWorkspace = oDoc.createElement('div');
        elNewWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elNewWorkspace.style.display = 'none';
        elNewWorkspace.style.visibility = 'hidden';
        oDoc.body.appendChild(elNewWorkspace);
        return elNewWorkspace;
    },

    /**
     * Insert the specified string of HTML into the document, then extract it.
     * This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.
     *
     * @param {string} sValue - A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} - The (potentially modified) html code or text.
     */
    getBrowserHTML: function(sValue) {
        const elWorkspace = jaxon.tools.dom._getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    },

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element - The element or it's unique name (specified by the ID attribute)
     * @param {string} ttribute - The name of the attribute.
     * @param {string} newData - The value to be compared with the current value of the specified element.
     *
     * @returns {true} - The specified value differs from the current attribute value.
     * @returns {false} - The specified value is the same as the current value.
     */
    willChange: function(element, attribute, newData) {
        if ('string' === typeof element) {
            element = jaxon.$(element);
        }
        if (!element) {
            return false;
        }
        return (newData != element[attribute]);
    },

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName - The name of the function to find.
     *
     * @returns {object} - The function
     */
    findFunction: function (sFuncName) {
        const names = sFuncName.split(".");
        const length = names.length;
        let context = window;
        for (let i = 0; i < length && (context); i++) {
            context = context[names[i]];
            if(!context) {
                return null;
            }
        }
        return context;
    },

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement - The outer element.
     * @param {string} attribute - The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    getInnerObject: function(xElement, attribute) {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len; i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
            if (!xElement) {
                return [null, null];
            }
        }
        return [xElement, attribute];
    },

    /**
     * Create a function by inserting its code in the page using a <script> tag.
     *
     * @param {string} funcCode
     * @param {string|undefined} funcName
     * 
     * @returns {boolean}
     */
    createFunction(funcCode, funcName) {
        if (!funcCode) {
            return;
        }

        const removeTagAfter = funcName === undefined;
        const scriptTagId = 'jaxon_cmd_script_' + (funcName === undefined ?
            'delegate_call' : funcName.toLowerCase().replaceAll('.', '_'));
        if (funcName === undefined) {
            funcName = 'jaxon.cmd.script.context.delegateCall';
        }

        // Remove the tag if it already exists.
        jaxon.cmd.node.remove(scriptTagId);
        // Create a new tag.
        const scriptTag = jaxon.config.baseDocument.createElement('script');
        scriptTag.setAttribute('id', scriptTagId);
        scriptTag.textContent = `
    ${funcName} = ${funcCode}
`;
        jaxon.config.baseDocument.body.appendChild(scriptTag);

        // Since this js code saves the function in a var,
        // the tag can be removed, and the function will still exist.
        if (removeTagAfter) {
            jaxon.cmd.node.remove(scriptTagId);
        }
        return true;
    }
};


jaxon.tools.form = {
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
    getValues: function(parent) {
        const submitDisabledElements = (arguments.length > 1 && arguments[1] == true);

        const prefix = (arguments.length > 2) ? arguments[2] : '';

        if ('string' == typeof parent)
            parent = jaxon.$(parent);

        const aFormValues = {};

        //        JW: Removing these tests so that form values can be retrieved from a specified
        //        container element like a DIV, regardless of whether they exist in a form or not.
        //
        //        if (parent.tagName)
        //            if ('FORM' == parent.tagName.toUpperCase())
        if (parent && parent.childNodes)
            jaxon.tools.form._getValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);

        return aFormValues;
    },

    /*
    Function: jaxon.tools.form._getValues

    Used internally by <jaxon.tools.form.getValues> to recursively get the value
    of form elements.  This function will extract all form element values
    regardless of the depth of the element within the form.
    */
    _getValues: function(aFormValues, children, submitDisabledElements, prefix) {
        const iLen = children.length;
        for (let i = 0; i < iLen; ++i) {
            const child = children[i];
            if (child.childNodes !== undefined && child.type !== 'select-one' && child.type !== 'select-multiple')
                jaxon.tools.form._getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            jaxon.tools.form._getValue(aFormValues, child, submitDisabledElements, prefix);
        }
    },

    /*
    Function: jaxon.tools.form._getValue

    Used internally by <jaxon.tools.form._getValues> to extract a single form value.
    This will detect the type of element (radio, checkbox, multi-select) and add it's value(s) to the form values array.

    Modified version for multidimensional arrays
    */
    _getValue: function(aFormValues, child, submitDisabledElements, prefix) {
        if (!child.name)
            return;

        if ('PARAM' == child.tagName) return;

        if (child.disabled)
            if (true == child.disabled)
                if (false == submitDisabledElements)
                    return;

        if (prefix != child.name.substring(0, prefix.length))
            return;

        if (child.type)
        {
            if (child.type == 'radio' || child.type == 'checkbox')
                if (false == child.checked)
                    return;
            if (child.type == 'file')
                return;
        }

        const name = child.name;

        let values = [];

        if ('select-multiple' == child.type) {
            const jLen = child.length;
            for (let j = 0; j < jLen; ++j) {
                const option = child.options[j];
                if (true == option.selected)
                    values.push(option.value);
            }
        } else {
            values = child.value;
        }

        const keyBegin = name.indexOf('[');
        /* exists name/object before the Bracket?*/
        if (0 <= keyBegin) {
            let n = name;
            let k = n.substr(0, n.indexOf('['));
            let a = n.substr(n.indexOf('['));
            if (aFormValues[k] === undefined)
                aFormValues[k] = {};
            let p = aFormValues; // pointer reset
            while (a.length != 0) {
                const sa = a.substr(0, a.indexOf(']') + 1);

                const lk = k; //save last key
                const lp = p; //save last pointer

                a = a.substr(a.indexOf(']') + 1);
                p = p[k];
                k = sa.substr(1, sa.length - 2);
                if (k == '') {
                    if ('select-multiple' == child.type) {
                        k = lk; //restore last key
                        p = lp;
                    } else {
                        k = p.length;
                    }
                }
                if (k === undefined) {
                    /*check against the global aFormValues Stack wich is the next(last) usable index */
                    k = 0;
                    for (let i in lp[lk]) k++;
                }
                if (p[k] === undefined) {

                    p[k] = {};
                }
            }
            p[k] = values;
        } else {
            aFormValues[name] = values;
        }
    }
};


jaxon.tools.queue = {
    /**
     * Construct and return a new queue object.
     *
     * @param integer size The number of entries the queue will be able to hold.
     *
     * @returns object
     */
    create: function(size) {
        return {
            start: 0,
            count: 0,
            size: size,
            end: 0,
            elements: [],
            timeout: null
        }
    },

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    empty: function(oQueue) {
        return (oQueue.count <= 0);
    },

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    full: function(oQueue) {
        return (oQueue.count >= oQueue.size);
    },

    /**
     * Push a new object into the tail of the buffer maintained by the specified queue object.
     *
     * @param object oQueue The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    push: function(oQueue, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(oQueue)) {
            throw { code: 10003 };
        }

        oQueue.elements[oQueue.end] = obj;
        if(++oQueue.end >= oQueue.size) {
            oQueue.end = 0;
        }
        return ++oQueue.count;
    },

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
    pushFront: function(oQueue, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(oQueue)) {
            throw { code: 10003 };
        }

        // Simply push if the queue is empty
        if(jaxon.tools.queue.empty(oQueue)) {
            return jaxon.tools.queue.push(oQueue, obj);
        }

        // Put the object one position back.
        if(--oQueue.start < 0) {
            oQueue.start = oQueue.size - 1;
        }
        oQueue.elements[oQueue.start] = obj;
        return ++oQueue.count;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    pop: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue)) {
            return null;
        }

        let obj = oQueue.elements[oQueue.start];
        delete oQueue.elements[oQueue.start];
        if(++oQueue.start >= oQueue.size) {
            oQueue.start = 0;
        }
        oQueue.count--;
        return obj;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    peek: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue)) {
            return null;
        }
        return oQueue.elements[oQueue.start];
    }
};


jaxon.tools.string = {
    /*
    Function: jaxon.tools.string.doubleQuotes

    Replace all occurances of the single quote character with a double quote character.

    Parameters:
    haystack - The source string to be scanned.

    Returns:  false on error
    string - A new string with the modifications applied.
    */
    doubleQuotes: function(haystack) {
        if (haystack === undefined) return false;
        return haystack.replace(new RegExp("'", 'g'), '"');
    },

    /*
    Function: jaxon.tools.string.singleQuotes

    Replace all occurances of the double quote character with a single quote character.

    haystack - The source string to be scanned.

    Returns:
    string - A new string with the modification applied.
    */
    singleQuotes: function(haystack) {
        if (haystack === undefined) return false;
        return haystack.replace(new RegExp('"', 'g'), "'");
    },

    /*
    Function: jaxon.tools.string.stripOnPrefix

    Detect, and if found, remove the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    stripOnPrefix: function(sEventName) {
        sEventName = sEventName.toLowerCase();
        if (0 == sEventName.indexOf('on'))
            sEventName = sEventName.replace(/on/, '');

        return sEventName;
    },

    /*
    Function: jaxon.tools.string.addOnPrefix

    Detect, and add if not found, the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    addOnPrefix: function(sEventName) {
        sEventName = sEventName.toLowerCase();
        if (0 != sEventName.indexOf('on'))
            sEventName = 'on' + sEventName;

        return sEventName;
    }
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


jaxon.tools.upload = {
    /*
    Function: jaxon.tools.upload._initialize

    Check upload data and initialize the request.
    */
    _initialize: function(oRequest) {
        if (!oRequest.upload) {
            return false;
        }

        oRequest.upload = {
            id: oRequest.upload,
            input: null,
            form: null,
        };
        const input = jaxon.tools.dom.$(oRequest.upload.id);

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
    },

    /*
    Function: jaxon.tools.upload.initialize

    Check upload data and initialize the request.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    initialize: function(oRequest) {
        // The content type shall not be set when uploading a file with FormData.
        // It will be set by the browser.
        if (!jaxon.tools.upload._initialize(oRequest)) {
            oRequest.postHeaders['content-type'] = oRequest.contentType;
        }
    }
};


jaxon.cmd.delay = {
    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    popAsyncRequest: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue) ||
            jaxon.tools.queue.peek(oQueue).mode === 'synchronous')
        {
            return null;
        }
        return jaxon.tools.queue.pop(oQueue);
    },

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
    retry: function(command, count) {
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
    },

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param response object   The queue to process.
     * @param when integer      The number of milliseconds to wait before starting/restarting the processing of the queue.
     */
    setWakeup: function(response, when) {
        if (response.timeout !== null) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(function() {
            jaxon.ajax.response.process(response);
        }, when);
    },

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of commands to skip.
     * @param skip boolean      Skip the commands or not.
     *
     * @returns boolean
     */
    confirmCallback: function(command, count, skip) {
        if(skip === true) {
            // The last entry in the queue is not a user command.
            // Thus it cannot be skipped.
            while (count > 0 && command.response.count > 1 &&
                jaxon.tools.queue.pop(command.response) !== null) {
                --count;
            }
        }
        // Run a different command depending on whether this callback executes
        // before of after the confirm function returns;
        if(command.requeue === true) {
            // Before => the processing is delayed.
            jaxon.cmd.delay.setWakeup(command.response, 30);
            return;
        }
        // After => the processing is executed.
        jaxon.ajax.response.process(command.response);
    },

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
    confirm: function(command, count, question) {
        // This will be checked in the callback.
        command.requeue = true;
        jaxon.ajax.message.confirm(question, '', function() {
            jaxon.cmd.delay.confirmCallback(command, count, false);
        }, function() {
            jaxon.cmd.delay.confirmCallback(command, count, true);
        });

        // This command must not be processed again.
        command.requeue = false;
        return false;
    }
};


jaxon.cmd.event = {
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
    setEvent: function(command) {
        command.fullName = 'setEvent';
        const sEvent = jaxon.tools.string.addOnPrefix(command.prop);
        const sCode = jaxon.tools.string.doubleQuotes(command.data);
        // force to get the target
        const oTarget = jaxon.$(command.id);
        jaxon.tools.dom.createFunction(`(e) => { ${sCode} }`);
        oTarget[sEvent] = jaxon.cmd.script.context.delegateCall;
        return true;
    },

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
    addHandler: function(command) {
        command.fullName = 'addHandler';
        const sFuncName = command.data;
        const sEvent = jaxon.cmd.event.getName(command.prop);
        // force to get the target
        const oTarget = jaxon.$(command.id);
        return jaxon.cmd.event._addHandler(oTarget, sEvent, sFuncName);
    },

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
    removeHandler: function(command) {
        command.fullName = 'removeHandler';
        const sFuncName = command.data;
        const sEvent = jaxon.cmd.event.getName(command.prop);
        // force to get the target
        const oTarget = jaxon.$(command.id);
        return jaxon.cmd.event._removeHandler(oTarget, sEvent, sFuncName);
    }
};

if(window.addEventListener) {
    jaxon.cmd.event.getName = function(event) {
        return jaxon.tools.string.stripOnPrefix(event);
    };

    jaxon.cmd.event._addHandler = function(target, event, func) {
        target.addEventListener(event, jaxon.tools.dom.findFunction(func), false);
        return true;
    };

    jaxon.cmd.event._removeHandler = function(target, event, func) {
        target.removeEventListener(event, jaxon.tools.dom.findFunction(func), false);
        return true;
    };
} else {
    jaxon.cmd.event.getName = function(event) {
        return jaxon.tools.string.addOnPrefix(event);
    };

    jaxon.cmd.event._addHandler = function(target, event, func) {
        target.attachEvent(event, jaxon.tools.dom.findFunction(func));
        return true;
    };

    jaxon.cmd.event._removeHandler = function(target, event, func) {
        target.detachEvent(event, jaxon.tools.dom.findFunction(func));
        return true;
    };
}


jaxon.cmd.form = {
    /*
    Function: jaxon.cmd.form.getInput

    Create and return a form input element with the specified parameters.

    Parameters:

    type - (string):  The type of input element desired.
    name - (string):  The value to be assigned to the name attribute.
    id - (string):  The value to be assigned to the id attribute.

    Returns:

    object - The new input element.
    */
    getInput: function(type, name, id) {
        if (window.addEventListener === undefined) {
            jaxon.cmd.form.getInput = function(type, name, id) {
                return jaxon.config.baseDocument.createElement('<input type="' + type + '" name="' + name + '" id="' + id + '">');
            }
        } else {
            jaxon.cmd.form.getInput = function(type, name, id) {
                const oDoc = jaxon.config.baseDocument;
                const Obj = oDoc.createElement('input');
                Obj.setAttribute('type', type);
                Obj.setAttribute('name', name);
                Obj.setAttribute('id', id);
                return Obj;
            }
        }
        return jaxon.cmd.form.getInput(type, name, id);
    },

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
    createInput: function(command) {
        command.fullName = 'createInput';
        const objParent = ('string' == typeof command.id) ? jaxon.$(command.id) : command.id;
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    },

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
    insertInput: function(command) {
        command.fullName = 'insertInput';
        const objSibling = ('string' == typeof command.id) ? jaxon.$(command.id) : command.id;
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling);
        return true;
    },

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
    insertInputAfter: function(command) {
        command.fullName = 'insertInputAfter';
        const objSibling = ('string' == typeof command.id) ? jaxon.$(command.id) : command.id;
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        return true;
    }
};


jaxon.cmd.node = {
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
    assign: function(element, property, data) {
        element = jaxon.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data;
            return true;
        }

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data;
        return true;
    },

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
    append: function(element, property, data) {
        element = jaxon.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = element.innerHTML + data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = element.outerHTML + data;
            return true;
        }

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + data;
        return true;
    },

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
    prepend: function(element, property, data) {
        element = jaxon.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data + element.innerHTML;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data + element.outerHTML;
            return true;
        }

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data + innerElement[innerProperty];
        return true;
    },

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
    replace: function(element, sAttribute, aData) {
        const sReplace = aData['r'];
        const sSearch = (sAttribute === 'innerHTML') ?
            jaxon.tools.dom.getBrowserHTML(aData['s']) : aData['s'];
        element = jaxon.$(element);
        const [innerElement, innerAttribute] = jaxon.tools.dom.getInnerObject(element, sAttribute);
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

            if (bFunction || jaxon.tools.dom.willChange(element, sAttribute, newTxt)) {
                innerElement[innerAttribute] = newTxt;
            }
        }
        return true;
    },

    /*
    Function: jaxon.cmd.node.remove

    Delete an element.

    Parameters:

    element - (string or object):  The name of, or the element itself which will be deleted.

    Returns:

    true - The operation completed successfully.
    */
    remove: function(element) {
        element = jaxon.$(element);
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
        return true;
    },

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
    create: function(element, sTag, sId) {
        element = jaxon.$(element);
        if (!element) {
            return true;
        }
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.appendChild(target);
        return true;
    },

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
    insert: function(element, sTag, sId) {
        element = jaxon.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element);
        return true;
    },

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
    insertAfter: function(element, sTag, sId) {
        element = jaxon.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element.nextSibling);
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextAssign

    Assign a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to assign.
        - command.data: (string or object):  The value to assign to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextAssign: function(command) {
        command.fullName = 'context assign';

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data;
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextAppend

    Appends a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to append to.
        - command.data: (string or object):  The value to append to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextAppend: function(command) {
        command.fullName = 'context append';

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + command.data;
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextPrepend

    Prepend a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to prepend to.
        - command.data: (string or object):  The value to prepend to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextPrepend: function(command) {
        command.fullName = 'context prepend';

        const [innerElement, innerProperty] = jaxon.tools.dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data + innerElement[innerProperty];
        return true;
    }
};


jaxon.cmd.script = {
    /*
    Function: jaxon.cmd.script.includeScriptOnce

    Add a reference to the specified script file if one does not already exist in the HEAD of the current document.

    This will effecitvely cause the script file to be loaded in the browser.

    Parameters:

    fileName - (string):  The URI of the file.

    Returns:

    true - The reference exists or was added.
    */
    includeScriptOnce: function(command) {
        command.fullName = 'includeScriptOnce';

        const fileName = command.data;
        // Check for existing script tag for this file.
        const oDoc = jaxon.config.baseDocument;
        const loadedScripts = oDoc.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loaded = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (loaded) {
            return true;
        }
        return jaxon.cmd.script.includeScript(command);
    },

    /*
    Function: jaxon.cmd.script.includeScript

    Adds a SCRIPT tag referencing the specified file.
    This effectively causes the script to be loaded in the browser.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The reference was added.
    */
    includeScript: function(command) {
        command.fullName = 'includeScript';

        const oDoc = jaxon.config.baseDocument;
        const objHead = oDoc.getElementsByTagName('head');
        const objScript = oDoc.createElement('script');
        objScript.src = command.data;
        objScript.type = command.type || 'text/javascript';
        if (command.elm_id) {
            objScript.setAttribute('id', command.elm_id);
        }
        objHead[0].appendChild(objScript);
        return true;
    },

    /*
    Function: jaxon.cmd.script.removeScript

    Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The script was not found or was removed.
    */
    removeScript: function(command) {
        command.fullName = 'removeScript';
        const fileName = command.data;
        const oDoc = jaxon.config.baseDocument;
        const loadedScripts = oDoc.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loaded = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (!loaded) {
            return true;
        }
        if (command.unld) {
            // Execute the provided unload function.
            jaxon.cmd.script.execute({ data: command.unld, context: window });
        }
        script.parentNode.removeChild(script);
        return true;
    },

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
    sleep: function(command) {
        command.fullName = 'sleep';
        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.cmd.delay.retry(command, command.prop)) {
            jaxon.cmd.delay.setWakeup(command.response, 100);
            return false;
        }
        // wake up, continue processing queue
        return true;
    },

    /*
    Function: jaxon.cmd.script.alert

    Show the specified message.

    Parameters:

    command (object) - jaxon response object

    Returns:

    true - The operation completed successfully.
    */
    alert: function(command) {
        command.fullName = 'alert';
        jaxon.ajax.message.info(command.data);
        return true;
    },

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
    confirm: function(command) {
        command.fullName = 'confirm';
        jaxon.cmd.delay.confirm(command, command.count, command.data);
        return false;
    },

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
    call: function(command) {
        command.fullName = 'call js function';
        jaxon.cmd.script.context = command.context ?? {};

        const func = jaxon.tools.dom.findFunction(command.func);
        if(!func) {
            return true;
        }
        func.apply(jaxon.cmd.script.context, command.data);
        return true;
    },

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
    execute: function(command) {
        command.fullName = 'execute Javascript';
        jaxon.cmd.script.context = command.context ?? {};

        const jsCode = `() => {
    ${command.data}
}`;
        jaxon.tools.dom.createFunction(jsCode);
        jaxon.cmd.script.context.delegateCall();
        return true;
    },

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
    waitFor: function(command) {
        command.fullName = 'waitFor';
        jaxon.cmd.script.context = command.context ?? {};

        try {
            const jsCode = `() => {
    return (${command.data});
}`;
            jaxon.tools.dom.createFunction(jsCode);
            const bResult = jaxon.cmd.script.context.delegateCall();
            if (!bResult) {
                // inject a delay in the queue processing
                // handle retry counter
                if (jaxon.cmd.delay.retry(command, command.prop)) {
                    jaxon.cmd.delay.setWakeup(command.response, 100);
                    return false;
                }
                // give up, continue processing queue
            }
        } catch (e) {}
        return true;
    },

    /**
     * Get function parameters as string
     *
     * @param {string|object} parameters 
     */
    getParameters: function(parameters) {
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
    },

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
    setFunction: function(command) {
        command.fullName = 'setFunction';

        const funcParams = jaxon.cmd.script.getParameters(command.prop);
        const jsCode = `(${funcParams}) => {
    ${command.data}
}`;
        jaxon.tools.dom.createFunction(jsCode, command.func);
        return true;
    },

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
    wrapped: {}, // Original wrapped functions will be saved here.
    wrapFunction: function(command) {
        command.fullName = 'wrapFunction';
        jaxon.cmd.script.context = command.context ?? {};

        const func = jaxon.tools.dom.findFunction(command.func);
        if(!func) {
            return true;
        }

        // Save the existing function
        const wrappedFuncName = command.func.toLowerCase().replaceAll('.', '_');
        if (!jaxon.cmd.script.wrapped[wrappedFuncName]) {
            jaxon.cmd.script.wrapped[wrappedFuncName] = func;
        }

        const varDefine = command.type ? `let ${command.type} = null;` : '// No return value';
        const varAssign = command.type ? `${command.type} = ` : '';
        const varReturn = command.type ? `return ${command.type};` : '// No return value';
        const funcParams = jaxon.cmd.script.getParameters(command.prop);
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

        jaxon.tools.dom.createFunction(jsCode, command.func);
        jaxon.cmd.script.context.delegateCall();
        return true;
    }
};


jaxon.cmd.style = {
    /*
    Function: jaxon.cmd.style.add

    Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.

    Parameters:

    filename - (string):  The URI of the .css file to reference.
    media - (string):  The media type of the css file (print/screen/handheld,..)

    Returns:

    true - The operation completed successfully.
    */
    add: function(fileName, media) {
        const oDoc = jaxon.config.baseDocument;
        const oHeads = oDoc.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = oHead.getElementsByTagName('link')
            .find(link => link.href.indexOf(fileName) >= 0 && link.media == media);
        if (found) {
            return true;
        }

        const oCSS = oDoc.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
        return true;
    },

    /*
    Function: jaxon.cmd.style.remove

    Locate and remove a LINK reference from the current document's HEAD.

    Parameters:

    filename - (string):  The URI of the .css file.

    Returns:

    true - The operation completed successfully.
    */
    remove: function(fileName, media) {
        const oDoc = jaxon.config.baseDocument;
        const oHeads = oDoc.getElementsByTagName('head');
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
    waitForCSS: function(command) {
        const oDocSS = jaxon.config.baseDocument.styleSheets;
        const ssLoaded = oDocSS
            .map(oDoc => oDoc.cssRules.length ?? oDoc.rules.length ?? 0)
            .every(enabled => enabled !== 0);
        if (ssLoaded) {
            return;
        }

        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.cmd.delay.retry(command, command.prop)) {
            jaxon.cmd.delay.setWakeup(command.response, 10);
            return false;
        }

        // give up, continue processing queue
        return true;
    }
};


jaxon.ajax.callback = {
    /*
    Function: jaxon.ajax.callback.create

    Create a blank callback object.
    Two optional arguments let you set the delay time for the onResponseDelay and onExpiration events.

    Returns:

    object - The callback object.
    */
    create: function() {
        const xc = jaxon.config;
        const xcb = jaxon.ajax.callback;

        return {
            timers: {
                onResponseDelay: xcb.setupTimer((arguments.length > 0) ?
                    arguments[0] : xc.defaultResponseDelayTime),
                onExpiration: xcb.setupTimer((arguments.length > 1) ?
                    arguments[1] : xc.defaultExpirationTime),
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
    },

    /*
    Function: jaxon.ajax.callback.setupTimer

    Create a timer to fire an event in the future.
    This will be used fire the onRequestDelay and onExpiration events.

    Parameters:

    iDelay - (integer):  The amount of time in milliseconds to delay.

    Returns:

    object - A callback timer object.
    */
    setupTimer: function(iDelay) {
        return { timer: null, delay: iDelay };
    },

    /*
    Function: jaxon.ajax.callback.clearTimer

    Clear a callback timer for the specified function.

    Parameters:

    oCallback - (object):  The callback object (or objects) that
        contain the specified function timer to be cleared.
    sFunction - (string):  The name of the function associated
        with the timer to be cleared.
    */
    clearTimer: function(oCallback, sFunction) {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => jaxon.ajax.callback.clearTimer(oCb, sFunction));
            return;
        }

        if (oCallback.timers[sFunction] !== undefined) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    },

    /*
    Function: jaxon.ajax.callback.execute

    Execute a callback event.

    Parameters:

    oCallback - (object):  The callback object (or objects) which
        contain the event handlers to be executed.
    sFunction - (string):  The name of the event to be triggered.
    args - (object):  The request object for this request.
    */
    execute: function(oCallback, sFunction, args) {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => jaxon.ajax.callback.execute(oCb, sFunction, args));
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
    }
};


jaxon.ajax.handler = {
    /*
    Object: jaxon.ajax.handler.handlers

    An array that is used internally in the jaxon.fn.handler object
    to keep track of command handlers that have been registered.
    */
    handlers: [],

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
    execute: function(command) {
        if (jaxon.ajax.handler.isRegistered(command)) {
            // it is important to grab the element here as the previous command
            // might have just created the element
            if (command.id) {
                command.target = jaxon.$(command.id);
            }
            // process the command
            return jaxon.ajax.handler.call(command);
        }
        return true;
    },

    /*
    Function: jaxon.ajax.handler.register

    Registers a new command handler.
    */
    register: function(shortName, func) {
        jaxon.ajax.handler.handlers[shortName] = func;
    },

    /*
    Function: jaxon.ajax.handler.unregister

    Unregisters and returns a command handler.

    Parameters:
        shortName - (string): The name of the command handler.

    Returns:
        func - (function): The unregistered function.
    */
    unregister: function(shortName) {
        const func = jaxon.ajax.handler.handlers[shortName];
        delete jaxon.ajax.handler.handlers[shortName];
        return func;
    },

    /*
    Function: jaxon.ajax.handler.isRegistered


    Parameters:
        command - (object):
            - cmd: The Name of the function.

    Returns:

    boolean - (true or false): depending on whether a command handler has
    been created for the specified command (object).

    */
    isRegistered: function(command) {
        return (jaxon.ajax.handler.handlers[command.cmd]) ? true : false;
    },

    /*
    Function: jaxon.ajax.handler.call

    Calls the registered command handler for the specified command
    (you should always check isRegistered before calling this function)

    Parameters:
        command - (object):
            - cmd: The Name of the function.

    Returns:
        true - (boolean) :
    */
    call: function(command) {
        return jaxon.ajax.handler.handlers[command.cmd](command);
    }
};

jaxon.ajax.handler.register('rcmplt', function(command) {
    jaxon.ajax.response.complete(command.request);
    return true;
});

jaxon.ajax.handler.register('css', function(command) {
    command.fullName = 'includeCSS';
    if (command.media === undefined)
        command.media = 'screen';
    return jaxon.cmd.style.add(command.data, command.media);
});
jaxon.ajax.handler.register('rcss', function(command) {
    command.fullName = 'removeCSS';
    if (command.media === undefined)
        command.media = 'screen';
    return jaxon.cmd.style.remove(command.data, command.media);
});
jaxon.ajax.handler.register('wcss', function(command) {
    command.fullName = 'waitForCSS';
    return jaxon.cmd.style.waitForCSS(command);
});

jaxon.ajax.handler.register('as', function(command) {
    command.fullName = 'assign/clear';
    try {
        return jaxon.cmd.node.assign(command.target, command.prop, command.data);
    } catch (e) {
        // do nothing, if the debug module is installed it will
        // catch and handle the exception
    }
    return true;
});
jaxon.ajax.handler.register('ap', function(command) {
    command.fullName = 'append';
    return jaxon.cmd.node.append(command.target, command.prop, command.data);
});
jaxon.ajax.handler.register('pp', function(command) {
    command.fullName = 'prepend';
    return jaxon.cmd.node.prepend(command.target, command.prop, command.data);
});
jaxon.ajax.handler.register('rp', function(command) {
    command.fullName = 'replace';
    return jaxon.cmd.node.replace(command.id, command.prop, command.data);
});
jaxon.ajax.handler.register('rm', function(command) {
    command.fullName = 'remove';
    return jaxon.cmd.node.remove(command.id);
});
jaxon.ajax.handler.register('ce', function(command) {
    command.fullName = 'create';
    return jaxon.cmd.node.create(command.id, command.data, command.prop);
});
jaxon.ajax.handler.register('ie', function(command) {
    command.fullName = 'insert';
    return jaxon.cmd.node.insert(command.id, command.data, command.prop);
});
jaxon.ajax.handler.register('ia', function(command) {
    command.fullName = 'insertAfter';
    return jaxon.cmd.node.insertAfter(command.id, command.data, command.prop);
});

jaxon.ajax.handler.register('c:as', jaxon.cmd.node.contextAssign);
jaxon.ajax.handler.register('c:ap', jaxon.cmd.node.contextAppend);
jaxon.ajax.handler.register('c:pp', jaxon.cmd.node.contextPrepend);

jaxon.ajax.handler.register('s', jaxon.cmd.script.sleep);
jaxon.ajax.handler.register('ino', jaxon.cmd.script.includeScriptOnce);
jaxon.ajax.handler.register('in', jaxon.cmd.script.includeScript);
jaxon.ajax.handler.register('rjs', jaxon.cmd.script.removeScript);
jaxon.ajax.handler.register('wf', jaxon.cmd.script.waitFor);
jaxon.ajax.handler.register('js', jaxon.cmd.script.execute);
jaxon.ajax.handler.register('jc', jaxon.cmd.script.call);
jaxon.ajax.handler.register('sf', jaxon.cmd.script.setFunction);
jaxon.ajax.handler.register('wpf', jaxon.cmd.script.wrapFunction);
jaxon.ajax.handler.register('al', jaxon.cmd.script.alert);
jaxon.ajax.handler.register('cc', jaxon.cmd.script.confirm);

jaxon.ajax.handler.register('ci', jaxon.cmd.form.createInput);
jaxon.ajax.handler.register('ii', jaxon.cmd.form.insertInput);
jaxon.ajax.handler.register('iia', jaxon.cmd.form.insertInputAfter);

jaxon.ajax.handler.register('ev', jaxon.cmd.event.setEvent);

jaxon.ajax.handler.register('ah', jaxon.cmd.event.addHandler);
jaxon.ajax.handler.register('rh', jaxon.cmd.event.removeHandler);

jaxon.ajax.handler.register('dbg', function(command) {
    command.fullName = 'debug message';
    console.log(command.data);
    return true;
});


jaxon.ajax.message = {
    /*
    Function: jaxon.ajax.message.success

    Print a success message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    success: function(content, title) {
        alert(content);
    },

    /*
    Function: jaxon.ajax.message.info

    Print an info message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    info: function(content, title) {
        alert(content);
    },

    /*
    Function: jaxon.ajax.message.warning

    Print a warning message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    warning: function(content, title) {
        alert(content);
    },

    /*
    Function: jaxon.ajax.message.error

    Print an error message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    error: function(content, title) {
        alert(content);
    },

    /*
    Function: jaxon.ajax.message.confirm

    Print an error message on the screen.

    Parameters:
        question - (string):  The confirm question.
        title - (string):  The confirm title.
        yesCallback - (Function): The function to call if the user answers yes.
        noCallback - (Function): The function to call if the user answers no.
    */
    confirm: function(question, title, yesCallback, noCallback) {
        if(confirm(question)) {
            yesCallback();
            return;
        }
        if(noCallback !== undefined) {
            noCallback();
        }
    }
};


jaxon.ajax.parameters = {
    /**
     * The array of data bags
     * @type {object}
     */
    bags: {},

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {*} oVal - The value to be stringified
     *
     * @returns {string}
     */
    stringify: function(oVal) {
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
    },

    /*
    Function: jaxon.ajax.parameters.toFormData

    Processes request specific parameters and store them in a FormData object.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    toFormData: function(oRequest) {
        const rd = new FormData();
        rd.append('jxnr', oRequest.dNow.getTime());

        // Files to upload
        const input = oRequest.upload.input;
        for (const file of input.files) {
            rd.append(input.name, file);
        }

        for (let sCommand in oRequest.functionName) {
            rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand]));
        }

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.append('jxnargs[]', jaxon.ajax.parameters.stringify(oVal));
            }
        }

        if (oRequest.bags) {
            const oValues = {};
            for (const sBag of oRequest.bags) {
                oValues[sBag] = jaxon.ajax.parameters.bags[sBag] ?? '*';
            }
            rd.append('jxnbags', jaxon.ajax.parameters.stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = rd;
    },

    /*
    Function: jaxon.ajax.parameters.toUrlEncoded

    Processes request specific parameters and store them in an URL encoded string.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    toUrlEncoded: function(oRequest) {
        const rd = [];
        rd.push('jxnr=' + oRequest.dNow.getTime());

        for (const sCommand in oRequest.functionName) {
            rd.push(sCommand + '=' + encodeURIComponent(oRequest.functionName[sCommand]));
        }

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.push('jxnargs[]=' + jaxon.ajax.parameters.stringify(oVal));
            }
        }

        if (oRequest.bags) {
            const oValues = {};
            for (const sBag of oRequest.bags) {
                oValues[sBag] = jaxon.ajax.parameters.bags[sBag] ?? '*';
            }
            rd.push('jxnbags=' + jaxon.ajax.parameters.stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;

        if ('GET' === oRequest.method) {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            rd = [];
        }

        oRequest.requestData = rd.join('&');
    },

    /*
    Function: jaxon.ajax.parameters.process

    Processes request specific parameters and generates the temporary
    variables needed by jaxon to initiate and process the request.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>

    Note:
    This is called once per request; upon a request failure, this
    will not be called for additional retries.
    */
    process: function(oRequest) {
        const func = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            jaxon.ajax.parameters.toFormData : jaxon.ajax.parameters.toUrlEncoded;
        // Make request parameters.
        oRequest.dNow = new Date();
        func(oRequest);
        delete oRequest.dNow;
    }
};


jaxon.ajax.request = {
    /*
    Function: jaxon.ajax.request.initialize

    Initialize a request object, populating default settings, where
    call specific settings are not already provided.

    Parameters:

    oRequest - (object):  An object that specifies call specific settings
        that will, in addition, be used to store all request related
        values.  This includes temporary values used internally by jaxon.
    */
    initialize: function(oRequest) {
        const xx = jaxon;
        const xc = xx.config;
        const xcb = xx.ajax.callback;
        const lcb = xcb.create();

        const aHeaders = ['commonHeaders', 'postHeaders', 'getHeaders'];
        aHeaders.forEach(sHeader => {
            oRequest[sHeader] = { ...xc[sHeader], ...oRequest[sHeader] };
        });

        const oOptions = {
            statusMessages: xc.statusMessages,
            waitCursor: xc.waitCursor,
            mode: xc.defaultMode,
            method: xc.defaultMethod,
            URI: xc.requestURI,
            httpVersion: xc.defaultHttpVersion,
            contentType: xc.defaultContentType,
            convertResponseToJson: xc.convertResponseToJson,
            retry: xc.defaultRetry,
            returnValue: xc.defaultReturnValue,
            maxObjectDepth: xc.maxObjectDepth,
            maxObjectSize: xc.maxObjectSize,
            context: window,
            upload: false,
            aborted: false,
        };
        Object.keys(oOptions).forEach(sOption => {
            oRequest[sOption] = oRequest[sOption] ?? oOptions[sOption];
        });

        const aCallbacks = ['onPrepare', 'onRequest', 'onResponseDelay', 'onExpiration',
            'beforeResponseProcessing', 'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];
        aCallbacks.forEach(sCallback => {
            if(oRequest[sCallback] !== undefined) {
                lcb[sCallback] = oRequest[sCallback];
                lcb.hasEvents = true;
                delete oRequest[sCallback];
            }
        });

        if(oRequest.callback !== undefined) {
            // Add the timers attribute, if it is not defined.
            if(oRequest.callback.timers === undefined) {
                oRequest.callback.timers = [];
            }
            if(lcb.hasEvents) {
                oRequest.callback = [oRequest.callback, lcb];
            }
        } else {
            oRequest.callback = lcb;
        }

        oRequest.status = (oRequest.statusMessages) ?
            xc.status.update() :
            xc.status.dontUpdate();

        oRequest.cursor = (oRequest.waitCursor) ?
            xc.cursor.update() :
            xc.cursor.dontUpdate();

        oRequest.method = oRequest.method.toUpperCase();
        if(oRequest.method !== 'GET')
            oRequest.method = 'POST'; // W3C: Method is case sensitive

        oRequest.requestRetry = oRequest.retry;

        // Look for upload parameter
        jaxon.tools.upload.initialize(oRequest);

        if(oRequest.URI === undefined)
            throw { code: 10005 };
    },

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
    prepare: function(oRequest) {
        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onPrepare', oRequest);

        // Check if the request must be aborted
        if(oRequest.aborted === true) {
            return false;
        }

        oRequest.responseHandler = function(responseContent) {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if(jaxon.tools.queue.empty(jaxon.cmd.delay.q.send) || oRequest.mode === 'synchronous') {
                jaxon.ajax.response.received(oRequest);
            } else {
                jaxon.tools.queue.push(jaxon.cmd.delay.q.recv, oRequest);
            }
        };

        // No request is submitted while there are pending requests in the outgoing queue.
        const submitRequest = jaxon.tools.queue.empty(jaxon.cmd.delay.q.send);
        if(oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            jaxon.tools.queue.push(jaxon.cmd.delay.q.send, oRequest);
            jaxon.tools.queue.push(jaxon.cmd.delay.q.recv, oRequest);
        } else if(!submitRequest) {
            // Asynchronous requests are queued in send queue only if they are not submitted.
            jaxon.tools.queue.push(jaxon.cmd.delay.q.send, oRequest);
        }
        return submitRequest;
    },

    /*
    Function: jaxon.ajax.request.submit

    Create a request object and submit the request using the specified request type;
    all request parameters should be finalized by this point.
    Upon failure of a POST, this function will fall back to a GET request.

    Parameters:
    oRequest - (object):  The request context object.
    */
    submit: function(oRequest) {
        oRequest.status.onRequest();

        const xx = jaxon;
        const xcb = xx.ajax.callback;
        const gcb = xx.callback;
        const lcb = oRequest.callback;

        xcb.execute([gcb, lcb], 'onResponseDelay', oRequest);
        xcb.execute([gcb, lcb], 'onExpiration', oRequest);
        xcb.execute([gcb, lcb], 'onRequest', oRequest);

        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        const headers = {
            ...oRequest.commonHeaders,
            ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
        };

        fetch(oRequest.requestURI, {
            method: oRequest.method,
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            redirect: "manual", // manual, *follow, error
            headers,
            body: oRequest.requestData,
        }).then(response => {
            // Save the reponse object
            oRequest.response = response;
            // Get the response content
            return oRequest.convertResponseToJson ? response.json() : response.text();
        }).then(oRequest.responseHandler);

        return oRequest.returnValue;
    },

    /*
    Function: jaxon.ajax.request.abort

    Abort the request.

    Parameters:

    oRequest - (object):  The request context object.
    */
    abort: function(oRequest) {
        oRequest.aborted = true;
        oRequest.request.abort();
        jaxon.ajax.response.complete(oRequest);
    },

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
    execute: function(functionName, functionArgs) {
        if(functionName === undefined)
            return false;

        const oRequest = functionArgs ?? {};
        oRequest.functionName = functionName;

        const xx = jaxon;
        xx.ajax.request.initialize(oRequest);
        xx.ajax.parameters.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                if(xx.ajax.request.prepare(oRequest))
                {
                    --oRequest.requestRetry;
                    return xx.ajax.request.submit(oRequest);
                }
                return null;
            } catch (e) {
                jaxon.ajax.callback.execute([jaxon.callback, oRequest.callback], 'onFailure', oRequest);
                if(oRequest.requestRetry === 0)
                    throw e;
            }
        }
    }
};


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


/**
 * Class: jaxon.dom
 */
jaxon.dom = {};

/**
 * Plain javascript replacement for jQuery's .ready() function.
 * See https://github.com/jfriend00/docReady for a detailed description, copyright and license information.
 */
(function(funcName, baseObj) {
    "use strict";
    // The public function name defaults to window.docReady
    // but you can modify the last line of this function to pass in a different object or method name
    // if you want to put them in a different namespace and those will be used instead of
    // window.docReady(...)
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    let readyList = [];
    let readyFired = false;
    let readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (let i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({ fn: callback, ctx: context });
        }
        // if document already ready to go, schedule the ready function to run
        // IE only safe when readyState is "complete", others safe when readyState is "interactive"
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
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
})("ready", jaxon.dom);


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
Class: jaxon.callback

The global callback object which is active for every request.
*/
jaxon.callback = jaxon.ajax.callback.create();

/*
Class: jaxon
*/

/*
Function: jaxon.request

Initiates a request to the server.
*/
jaxon.request = jaxon.ajax.request.execute;

/*
Object: jaxon.response

The response queue that holds response commands, once received
from the server, until they are processed.
*/
// jaxon.response = jaxon.tools.queue.create(jaxon.config.commandQueueSize);

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
