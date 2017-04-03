/*
    File: jaxon.core.js
    
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
    Class: jaxon.config
    
    This class contains all the default configuration settings.  These
    are application level settings; however, they can be overridden
    by including a jaxon.config definition prior to including the
    <jaxon_core.js> file, or by specifying the appropriate configuration
    options on a per call basis.
*/
if ('undefined' == typeof jaxon)
    jaxon = {};

if ('undefined' == typeof jaxon.config)
    jaxon.config = {};

/*
    Function: jaxon.config.setDefault
    
    This function will set a default configuration option if it is 
    not already set.
    
    Parameters:
    option - (string):
        The name of the option that will be set.
        
    defaultValue - (unknown):
        The value to use if a value was not already set.
*/
jaxon.config.setDefault = function(option, defaultValue) {
    if ('undefined' == typeof jaxon.config[option])
        jaxon.config[option] = defaultValue;
}

/*
    Object: commonHeaders
    
    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.
    
    These headers will be set for both POST and GET requests.
*/
jaxon.config.setDefault('commonHeaders', {
    'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'
    });

/*
    Object: postHeaders
    
    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.
*/
jaxon.config.setDefault('postHeaders', {});

/*
    Object: getHeaders
    
    An array of header entries where the array key is the header
    option name and the associated value is the value that will
    set when the request object is initialized.
*/
jaxon.config.setDefault('getHeaders', {});

/*
    Boolean: waitCursor
    
    true - jaxon should display a wait cursor when making a request
    false - jaxon should not show a wait cursor during a request
*/
jaxon.config.setDefault('waitCursor', false);

/*
    Boolean: statusMessages
    
    true - jaxon should update the status bar during a request
    false - jaxon should not display the status of the request
*/
jaxon.config.setDefault('statusMessages', false);

/*
    Object: baseDocument
    
    The base document that will be used throughout the code for
    locating elements by ID.
*/
jaxon.config.setDefault('baseDocument', document);

/*
    String: requestURI
    
    The URI that requests will be sent to.
*/
jaxon.config.setDefault('requestURI', jaxon.config.baseDocument.URL);

/*
    String: defaultMode
    
    The request mode.
    
    'asynchronous' - The request will immediately return, the
        response will be processed when (and if) it is received.
        
    'synchronous' - The request will block, waiting for the
        response.  This option allows the server to return
        a value directly to the caller.
*/
jaxon.config.setDefault('defaultMode', 'asynchronous');

/*
    String: defaultHttpVersion
    
    The Hyper Text Transport Protocol version designated in the 
    header of the request.
*/
jaxon.config.setDefault('defaultHttpVersion', 'HTTP/1.1');

/*
    String: defaultContentType
    
    The content type designated in the header of the request.
*/
jaxon.config.setDefault('defaultContentType', 'application/x-www-form-urlencoded');

/*
    Integer: defaultResponseDelayTime
    
    The delay time, in milliseconds, associated with the 
    <jaxon.callback.global.onRequestDelay> event.
*/
jaxon.config.setDefault('defaultResponseDelayTime', 1000);

/*
    Integer: defaultExpirationTime
    
    The amount of time to wait, in milliseconds, before a request
    is considered expired.  This is used to trigger the
    <jaxon.callback.global.onExpiration event.
*/
jaxon.config.setDefault('defaultExpirationTime', 10000);

/*
    String: defaultMethod
    
    The method used to send requests to the server.
    
    'POST' - Generate a form POST request
    'GET' - Generate a GET request; parameters are appended
        to the <jaxon.config.requestURI> to form a URL.
*/
jaxon.config.setDefault('defaultMethod', 'POST');    // W3C: Method is case sensitive

/*
    Integer: defaultRetry
    
    The number of times a request should be retried
    if it expires.
*/
jaxon.config.setDefault('defaultRetry', 5);

/*
    Object: defaultReturnValue
    
    The value returned by <jaxon.request> when in asynchronous
    mode, or when a syncrhonous call does not specify the
    return value.
*/
jaxon.config.setDefault('defaultReturnValue', false);

/*
    Integer: maxObjectDepth
    
    The maximum depth of recursion allowed when serializing
    objects to be sent to the server in a request.
*/
jaxon.config.setDefault('maxObjectDepth', 20);

/*
    Integer: maxObjectSize
    
    The maximum number of members allowed when serializing
    objects to be sent to the server in a request.
*/
jaxon.config.setDefault('maxObjectSize', 2000);

jaxon.config.setDefault('responseQueueSize', 1000);

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
}

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
}

/*
    Class: jaxon.tools
    
    This contains utility functions which are used throughout
    the jaxon core.
*/
jaxon.tools = {}

/*
    Function: jaxon.tools.$

    Shorthand for finding a uniquely named element within 
    the document.

    Parameters:
    sId - (string):
        The unique name of the element (specified by the 
        ID attribute), not to be confused with the name
        attribute on form elements.
        
    Returns:
    
    object - The element found or null.
    
    Note:
        This function uses the <jaxon.config.baseDocument>
        which allows <jaxon> to operate on the main window
        document as well as documents from contained
        iframes and child windows.
    
    See also:
        <jaxon.$> and <jxn.$>
*/
jaxon.tools.$ = function(sId) {
    if (!sId)
        return null;
    //sId not an string so return it maybe its an object.
    if(typeof sId != 'string')
        return sId;

    var oDoc = jaxon.config.baseDocument;

    var obj = oDoc.getElementById(sId);
    if (obj)
        return obj;
        
    if (oDoc.all)
        return oDoc.all[sId];

    return obj;
}

/*
    Function jaxon.tools.in_array
    
    Looks for a value within the specified array and, if found, 
    returns true; otherwise it returns false.
    
    Parameters:
    array - (object):
        The array to be searched.
        
    valueToCheck - (object):
        The value to search for.
        
    Returns:
    
    true : The value is one of the values contained in the 
        array.
        
    false : The value was not found in the specified array.
*/
jaxon.tools.in_array = function(array, valueToCheck) {
    var i = 0;
    var l = array.length;
    while (i < l) {
        if (array[i] == valueToCheck)
            return true;
        ++i;
    }
    return false;
}

/*
    Function: jaxon.tools.doubleQuotes
    
    Replace all occurances of the single quote character with a double quote character.
    
    Parameters:
    
    haystack - The source string to be scanned.
    
    Returns:  false on error
    
    string - A new string with the modifications applied.
*/
jaxon.tools.doubleQuotes = function(haystack) {
    if(typeof haystack == 'undefined') return false;
    return haystack.replace(new RegExp("'", 'g'), '"');
}

/*
    Function: jaxon.tools.singleQuotes
    
    Replace all occurances of the double quote character with a single
    quote character.
    
    haystack - The source string to be scanned.
    
    Returns:
    
    string - A new string with the modification applied.
*/
/*
jaxon.tools.singleQuotes = function(haystack) {
    return haystack.replace(new RegExp('"', 'g'), "'");
}
*/

/*
    Function: jaxon.tools._escape
    
    Determine if the specified value contains special characters and
    create a CDATA section so the value can be safely transmitted.
    
    Parameters:
    
    data - (string or other):
        The source string value to be evaluated or an object of unknown
        type.
        
    Returns:
    
    string - The string value, escaped if necessary or the object provided
        if it is not a string.
        
    Note:
        When the specified object is NOT a string, the value is returned
        as is.
*/
/*
jaxon.tools._escape = function(data) {
    if ('undefined' == typeof data)
        return data;
    // 'object' is handled elsewhere, 
    // 'string' handled below, 
    // 'number' will be returned here
    // 'boolean' will be returned here
    if ('string' != typeof data)
        return data;
    
    var needCDATA = false;
    
    if (encodeURIComponent(data) != data) {
        needCDATA = true;
        
        var segments = data.split('<![CDATA[');
        var segLen = segments.length;
        data = [];
        for (var i = 0; i < segLen; ++i) {
            var segment = segments[i];
            var fragments = segment.split(']]>');
            var fragLen = fragments.length;
            segment = '';
            for (var j = 0; j < fragLen; ++j) {
                if (0 != j)
                    segment += ']]]]><![CDATA[>';
                segment += fragments[j];
            }
            if (0 != i)
                data.push('<![]]><![CDATA[CDATA[');
            data.push(segment);
        }
        data = data.join('');
    }
    
    if (needCDATA)
        data = '<![CDATA[' + data + ']]>';
    
    return data;
}
*/

/*
    Function: jaxon.tools._enforceDataType 
    
    Ensure that the javascript variable created is of the correct data type.
    
    Parameters:
        value (string)

    Returns:
        
        (unknown) - The value provided converted to the correct data type.
*/
jaxon.tools._enforceDataType = function(value) {
    value = new String(value);
    var type = value.substr(0, 1);
    value = value.substr(1);

    if ('*' == type)
        value = null;
    else if ('N' == type)
        value = value - 0;
    else if ('B' == type)
        value = !!value;
//    else if ('S' == type)
//        value = new String(value);

    return value;
}

/*
    Function: jaxon.tools._nodeToObject
    
    Deserialize a javascript object from an XML node.
    
    Parameters:
    
    node - A node, likely from the xml returned by the server.
    
    Returns:
    
        object - The object extracted from the xml node.
*/
jaxon.tools._nodeToObject = function(node) {
    if (null == node)
        return '';
        
    if ('undefined' != typeof node.nodeName) {
        if ('#cdata-section' == node.nodeName || '#text' == node.nodeName) {
            var data = '';
            do if (node.data) data += node.data; while (node = node.nextSibling);
            return jaxon.tools._enforceDataType(data);
        } else if ('jxnobj' == node.nodeName) {
            var key = null;
            var value = null;
            var data = new Array;
            var child = node.firstChild;
            while (child) {
                if ('e' == child.nodeName) {
                    var grandChild = child.firstChild;
                    while (grandChild) {
                        if ('k' == grandChild.nodeName)
                            // Don't support objects here, only number, string, etc...
                            key = jaxon.tools._enforceDataType(grandChild.firstChild.data);
                        else ('v' == grandChild.nodeName)
                            // Value might be object, string, number, boolean... even null or undefined
                            value = jaxon.tools._nodeToObject(grandChild.firstChild);
                        grandChild = grandChild.nextSibling;
                    }
                    // Allow the value to be null or undefined (or a value)
                    if (null != key) { // && null != value) {
                        data[key] = value;
                        key = value = null;
                    }
                }
                child = child.nextSibling;
            }
            return data;
        }
    }
    
    throw { code: 10001, data: node.nodeName };
}

/*
    Function: jaxon.tools.getRequestObject
    
    Construct an XMLHttpRequest object dependent on the capabilities
    of the browser.
    
    Returns:
    
    object - Javascript XHR object.
*/
jaxon.tools.getRequestObject = function() {
    if ('undefined' != typeof XMLHttpRequest) {
        jaxon.tools.getRequestObject = function() {
            return new XMLHttpRequest();
        }
    } else if ('undefined' != typeof ActiveXObject) {
        jaxon.tools.getRequestObject = function() {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.4.0');
            } catch (e) {
                jaxon.tools.getRequestObject = function() {
                    try {
                        return new ActiveXObject('Msxml2.XMLHTTP');
                    } catch (e2) {
                        jaxon.tools.getRequestObject = function() {
                            return new ActiveXObject('Microsoft.XMLHTTP');
                        }
                        return jaxon.tools.getRequestObject();
                    }
                }
                return jaxon.tools.getRequestObject();
            }
        }
    } else if (window.createRequest) {
        jaxon.tools.getRequestObject = function() {
            return window.createRequest();
        };
    } else {
        jaxon.tools.getRequestObject = function() {
            throw { code: 10002 };
        };
    }
    
    // this would seem to cause an infinite loop, however, the function should
    // be reassigned by now and therefore, it will not loop.
    return jaxon.tools.getRequestObject();
}

/*
    Function: jaxon.tools.getBrowserHTML
    
    Insert the specified string of HTML into the document, then 
    extract it.  This gives the browser the ability to validate
    the code and to apply any transformations it deems appropriate.
    
    Parameters:
    
    sValue - (string):
        A block of html code or text to be inserted into the
        browser's document.
        
    Returns:
    
    The (potentially modified) html code or text.
*/
jaxon.tools.getBrowserHTML = function(sValue) {
    var oDoc = jaxon.config.baseDocument;
    if (!oDoc.body)
        return '';
        
    var elWorkspace = jaxon.$('jaxon_temp_workspace');
    if (!elWorkspace)
    {
        elWorkspace = oDoc.createElement('div');
        elWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elWorkspace.style.display = 'none';
        elWorkspace.style.visibility = 'hidden';
        oDoc.body.appendChild(elWorkspace);
    }
    elWorkspace.innerHTML = sValue;
    var browserHTML = elWorkspace.innerHTML;
    elWorkspace.innerHTML = '';    
    
    return browserHTML;
}

/*
    Function: jaxon.tools.willChange
    
    Tests to see if the specified data is the same as the current
    value of the element's attribute.
    
    Parameters: 
    element - (string or object):
        The element or it's unique name (specified by the ID attribute)
        
    attribute - (string):
        The name of the attribute.
        
    newData - (string):
        The value to be compared with the current value of the specified
        element.
        
    Returns:
    
    true - The specified value differs from the current attribute value.
    false - The specified value is the same as the current value.
*/
jaxon.tools.willChange = function(element, attribute, newData) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    if (element) {
        var oldData;        
        eval('oldData=element.'+attribute);
        return (newData != oldData);
    }

    return false;
}

/*
    Function: jaxon.tools.getFormValues
    
    Build an associative array of form elements and their values from
    the specified form.
    
    Parameters: 
    
    element - (string): The unique name (id) of the form to be processed.
    disabled - (boolean, optional): Include form elements which are currently disabled.
    prefix - (string, optional): A prefix used for selecting form elements.

    Returns:
    
    An associative array of form element id and value.
*/
jaxon.tools.getFormValues = function(parent) {
    var submitDisabledElements = false;
    if (arguments.length > 1 && arguments[1] == true)
        submitDisabledElements = true;
    
    var prefix = '';
    if(arguments.length > 2)
        prefix = arguments[2];
    
    if ('string' == typeof parent)
        parent = jaxon.$(parent);
    
    var aFormValues = {};
    
//        JW: Removing these tests so that form values can be retrieved from a specified
//        container element like a DIV, regardless of whether they exist in a form or not.
//
//        if (parent.tagName)
//            if ('FORM' == parent.tagName.toUpperCase())
    if (parent)
        if (parent.childNodes)
            jaxon.tools._getFormValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);
    
    return aFormValues;
}

/*
    Function: jaxon.tools._getFormValues
    
    Used internally by <jaxon.tools.getFormValues> to recursively get the value
    of form elements.  This function will extract all form element values 
    regardless of the depth of the element within the form.
*/
jaxon.tools._getFormValues = function(aFormValues, children, submitDisabledElements, prefix)
{
    var iLen = children.length;
    for (var i = 0; i < iLen; ++i) {
        var child = children[i];
        if (('undefined' != typeof child.childNodes) && (child.type != 'select-one') && (child.type != 'select-multiple'))
            jaxon.tools._getFormValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
        jaxon.tools._getFormValue(aFormValues, child, submitDisabledElements, prefix);
    }
}

/*
    Function: jaxon.tools._getFormValue
    
    Used internally by <jaxon.tools._getFormValues> to extract a single form value.
    This will detect the type of element (radio, checkbox, multi-select) and 
    add it's value(s) to the form values array.

    Modified version for multidimensional arrays
*/
jaxon.tools._getFormValue = function(aFormValues, child, submitDisabledElements, prefix)
{
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
        if (child.type == 'radio' || child.type == 'checkbox')
            if (false == child.checked)
                return;

    var name = child.name;

    var values = [];

    if ('select-multiple' == child.type) {
        var jLen = child.length;
        for (var j = 0; j < jLen; ++j) {
            var option = child.options[j];
            if (true == option.selected)
                values.push(option.value);
        }
    } else {
        values = child.value;
    }

    var keyBegin = name.indexOf('[');
    /* exists name/object before the Bracket?*/
    if (0 <= keyBegin) {
        var n = name;
        var k = n.substr(0, n.indexOf('['));
        var a = n.substr(n.indexOf('['));
        if (typeof aFormValues[k] == 'undefined')
            aFormValues[k] = {};
        var p = aFormValues; // pointer reset
        while (a.length != 0) {
            var sa = a.substr(0, a.indexOf(']')+1);

            var lk = k; //save last key
            var lp = p; //save last pointer

            a = a.substr(a.indexOf(']')+1);
            p = p[k];
            k = sa.substr(1, sa.length-2);
            if (k == '') {
                if ('select-multiple' == child.type) {
                    k = lk; //restore last key
                    p = lp;
                } else {
                    k = p.length;
                }
            }
            if (typeof k == 'undefined')
            {
                /*check against the global aFormValues Stack wich is the next(last) usable index */
                k=0;
                for (var i in lp[lk]) k++;
            }
            if (typeof p[k] == 'undefined'){

                p[k] ={};
            }
        }
        p[k] = values;
    } else {
        aFormValues[name] = values;
    }
}


/*
    Function: jaxon.tools.stripOnPrefix
    
    Detect, and if found, remove the prefix 'on' from the specified 
    string.  This is used while working with event handlers.
    
    Parameters: 
    
    sEventName - (string): The string to be modified.
    
    Returns:
    
    string - The modified string.
*/
jaxon.tools.stripOnPrefix = function(sEventName) {
    sEventName = sEventName.toLowerCase();
    if (0 == sEventName.indexOf('on'))
        sEventName = sEventName.replace(/on/,'');
    
    return sEventName;
}

/*
    Function: jaxon.tools.addOnPrefix
    
    Detect, and add if not found, the prefix 'on' from the specified 
    string.  This is used while working with event handlers.
    
    Parameters: 
    
    sEventName - (string): The string to be modified.
    
    Returns:
    
    string - The modified string.
*/
jaxon.tools.addOnPrefix = function(sEventName) {
    sEventName = sEventName.toLowerCase();
    if (0 != sEventName.indexOf('on'))
        sEventName = 'on' + sEventName;
    
    return sEventName;
}



/*
    Class: jaxon.tools.xml
    
    An object that contains utility function for processing
    xml response packets.
*/
jaxon.tools.xml = {};

/*
    Function: jaxon.tools.xml.parseAttributes 
    
    Take the parameters passed in the command of the XML response
    and convert them to parameters of the args object.  This will 
    serve as the command object which will be stored in the 
    response command queue.
    
    Parameters: 
    
    child - (object):  The xml child node which contains the 
        attributes for the current response command.
        
    obj - (object):  The current response command that will have the
        attributes applied.
*/
jaxon.tools.xml.parseAttributes = function(child, obj) {
    var iLen = child.attributes.length;
    for (var i = 0; i < iLen; ++i) {
        var attr = child.attributes[i];
        obj[attr.name] = attr.value;
    }
}

/*
    Function: jaxon.tools.xml.parseChildren
    
    Parses the child nodes of the command of the response XML.  Generally,
    the child nodes contain the data element of the command; this member
    may be an object, which will be deserialized by <jaxon._nodeToObject>
    
    Parameters: 
    
    child - (object):   The xml node that contains the child (data) for
        the current response command object.
        
    obj - (object):  The response command object.
*/
jaxon.tools.xml.parseChildren = function(child, obj) {
    obj.data = '';
    if (0 < child.childNodes.length) {
        if (1 < child.childNodes.length) {
            var grandChild = child.firstChild;
            do {
                if ('#cdata-section' == grandChild.nodeName || '#text' == grandChild.nodeName) {
                    obj.data += grandChild.data;
                }
            } while (grandChild = grandChild.nextSibling);
        } else {
            var grandChild = child.firstChild;
            if ('jxnobj' == grandChild.nodeName) {
                obj.data = jaxon.tools._nodeToObject(grandChild);
                return;
            } else if ('#cdata-section' == grandChild.nodeName || '#text' == grandChild.nodeName) {
                obj.data = grandChild.data;
            }
        }
    } else if ('undefined' != typeof child.data) {
        obj.data = child.data;
    }
    
    obj.data = jaxon.tools._enforceDataType(obj.data);
}

/*
    Function: jaxon.tools.xml.processFragment
    
    Parameters: 
    
    xmlNode - (object):  The first xml node in the xml fragment.
    seq - (number):  A counter used to keep track of the sequence
        of this command in the response.
    oRet - (object):  A variable that is used to return the request
        "return value" for use with synchronous requests.
*/
jaxon.tools.xml.processFragment = function(xmlNode, seq, oRet, oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    while (xmlNode) {
        if ('cmd' == xmlNode.nodeName) {
            var obj = {};
            obj.fullName = '*unknown*';
            obj.sequence = seq;
            obj.request = oRequest;
            obj.context = oRequest.context;
            
            xt.xml.parseAttributes(xmlNode, obj);
            xt.xml.parseChildren(xmlNode, obj);
            
            xt.queue.push(xx.response, obj);
        } else if ('jxnrv' == xmlNode.nodeName) {
            oRet = xt._nodeToObject(xmlNode.firstChild);
        } else if ('debugmsg' == xmlNode.nodeName) {
            // txt = xt._nodeToObject(xmlNode.firstChild);
        } else {
            throw { code: 10004, data: xmlNode.nodeName };
        }
        ++seq;
        xmlNode = xmlNode.nextSibling;
    }
    return oRet;
}

/*
    Class: jaxon.tools.queue
    
    This contains the code and variables for building, populating
    and processing First In Last Out (FILO) buffers.
*/
jaxon.tools.queue = {}

/*
    Function: create
    
    Construct and return a new queue object.
    
    Parameters: 
    
    size - (integer):
        The number of entries the queue will be able to hold.
*/
jaxon.tools.queue.create = function(size) {
    return {
        start: 0,
        size: size,
        end: 0,
        commands: [],
        timeout: null
    }
}

/*
    Function: jaxon.tools.queue.retry
    
    Maintains a retry counter for the given object.
    
    Parameters: 
    
    obj - (object):
        The object to track the retry count for.
        
    count - (integer):
        The number of times the operation should be attempted
        before a failure is indicated.
        
    Returns:
    
    true - The object has not exhausted all the retries.
    false - The object has exhausted the retry count specified.
*/
jaxon.tools.queue.retry = function(obj, count) {
    var retries = obj.retries;
    if (retries) {
        --retries;
        if (1 > retries)
            return false;
    } else retries = count;
    obj.retries = retries;
    return true;
}

/*
    Function: jaxon.tools.queue.rewind
    
    Rewind the buffer head pointer, effectively reinserting the 
    last retrieved object into the buffer.
    
    Parameters: 
    
    theQ - (object):
        The queue to be rewound.
*/
jaxon.tools.queue.rewind = function(theQ) {
    if (0 < theQ.start)
        --theQ.start;
    else
        theQ.start = theQ.size;
}

/*
    Function: jaxon.tools.queue.setWakeup
    
    Set or reset a timeout that is used to restart processing
    of the queue.  This allows the queue to asynchronously wait
    for an event to occur (giving the browser time to process
    pending events, like loading files)
    
    Parameters: 
    
    theQ - (object):
        The queue to process upon timeout.
        
    when - (integer):
        The number of milliseconds to wait before starting/
        restarting the processing of the queue.
*/
jaxon.tools.queue.setWakeup = function(theQ, when) {
    if (null != theQ.timeout) {
        clearTimeout(theQ.timeout);
        theQ.timeout = null;
    }
    theQ.timout = setTimeout(function() { jaxon.tools.queue.process(theQ); }, when);
}

/*
    Function: jaxon.tools.queue.process
    
    While entries exist in the queue, pull and entry out and
    process it's command.  When a command returns false, the
    processing is halted.
    
    Parameters: 
    
    theQ - (object): The queue object to process.  This should
        have been crated by calling <jaxon.tools.queue.create>.
    
    Returns:

    true - The queue was fully processed and is now empty.
    false - The queue processing was halted before the 
        queue was fully processed.
        
    Note:
    
    - Use <jaxon.tools.queue.setWakeup> or call this function to 
    cause the queue processing to continue.

    - This will clear the associated timeout, this function is not 
    designed to be reentrant.
    
    - When an exception is caught, do nothing; if the debug module 
    is installed, it will catch the exception and handle it.
*/
jaxon.tools.queue.process = function(theQ) {
    if (null != theQ.timeout) {
        clearTimeout(theQ.timeout);
        theQ.timeout = null;
    }
    var obj = jaxon.tools.queue.pop(theQ);
    while (null != obj) {
        try {
            if (false == jaxon.executeCommand(obj)) 
                return false;
        } catch (e) {
            console.log(e);
        }
        delete obj;
        
        obj = jaxon.tools.queue.pop(theQ);
    }
    return true;
}

/*
    Function: jaxon.tools.queue.push
    
    Push a new object into the tail of the buffer maintained by the
    specified queue object.
    
    Parameters: 
    
    theQ - (object):
        The queue in which you would like the object stored.
        
    obj - (object):
        The object you would like stored in the queue.
*/
jaxon.tools.queue.push = function(theQ, obj) {
    var next = theQ.end + 1;
    if (next > theQ.size)
        next = 0;
    if (next != theQ.start) {                
        theQ.commands[theQ.end] = obj;
        theQ.end = next;
    } else
        throw { code: 10003 }
}

/*
    Function: jaxon.tools.queue.pushFront
    
    Push a new object into the head of the buffer maintained by 
    the specified queue object.  This effectively pushes an object
    to the front of the queue... it will be processed first.
    
    Parameters: 
    
    theQ - (object):
        The queue in which you would like the object stored.
        
    obj - (object):
        The object you would like stored in the queue.
*/
jaxon.tools.queue.pushFront = function(theQ, obj) {
    jaxon.tools.queue.rewind(theQ);
    theQ.commands[theQ.start] = obj;
}

/*
    Function: jaxon.tools.queue.pop
    
    Attempt to pop an object off the head of the queue.
    
    Parameters: 
    
    theQ - (object):
        The queue object you would like to modify.
        
    Returns:
    
    object - The object that was at the head of the queue or
        null if the queue was empty.
*/
jaxon.tools.queue.pop = function(theQ) {
    var next = theQ.start;
    if (next == theQ.end)
        return null;
    next++;
    if (next > theQ.size)
        next = 0;
    var obj = theQ.commands[theQ.start];
    delete theQ.commands[theQ.start];
    theQ.start = next;
    return obj;
}

/*
    Class: jaxon.responseProcessor
*/
jaxon.responseProcessor = {};

/*
    Function: jaxon.responseProcessor.json
    
    Parse the JSON response into a series of commands.  The commands
    are constructed by calling <jaxon.tools.xml.parseAttributes> and 
    <jaxon.tools.xml.parseChildren>.
    
    Parameters: 
    
    oRequest - (object):  The request context object.
*/


jaxon.tools.json = {}

jaxon.tools.json.processFragment = function(nodes, seq, oRet, oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    for (nodeName in nodes) {
        if ('jxnobj' == nodeName) {
            for (a in nodes[nodeName])
            {
            
             /*
             prevents from using not numbered indexes of 'jxnobj'
             nodes[nodeName][a]= "0" is an valid jaxon response stack item
             nodes[nodeName][a]= "pop" is an method from somewhere but not from jxnobj
             */
             if( parseInt(a) !=a)  continue;
            
             var obj = nodes[nodeName][a];
   
             obj.fullName = '*unknown*';
             obj.sequence = seq;
             obj.request = oRequest;
             obj.context = oRequest.context;
             xt.queue.push(xx.response, obj);
             ++seq;
   
            }
        } else if ('jxnrv' == nodeName) {
            oRet = nodes[nodeName];
        } else if ('debugmsg' == nodeName) {
             txt = nodes[nodeName];
        } else
            throw { code: 10004, data: obj.fullName}
    }
    return oRet;
}

jaxon.responseProcessor.json = function (oRequest) {
    
    var xx = jaxon;
    var xt = xx.tools;
    var xcb = xx.callback;
    var gcb = xcb.global;
    var lcb = oRequest.callback;
    
    var oRet = oRequest.returnValue;
    
    if (xt.in_array(xx.responseSuccessCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onSuccess', oRequest);
        var seq = 0;
        if (oRequest.request.responseText) {
            try {
                var responseJSON = eval('('+oRequest.request.responseText+')');
            } catch (ex) {
                throw(ex);
            }
            if ( ('object' == typeof responseJSON) && ('object' == typeof responseJSON.jxnobj) ) {
                oRequest.status.onProcessing();
                oRet = xt.json.processFragment(responseJSON, seq, oRet, oRequest);
            } else {
            }
        } 
        var obj = {};
        obj.fullName = 'Response Complete';
        obj.sequence = seq;
        obj.request = oRequest;
        obj.context = oRequest.context;
        obj.cmd = 'rcmplt';
        xt.queue.push(xx.response, obj);
        
        // do not re-start the queue if a timeout is set
        if (null == xx.response.timeout)
            xt.queue.process(xx.response);
    } else if (xt.in_array(xx.responseRedirectCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onRedirect', oRequest);
        window.location = oRequest.request.getResponseHeader('location');
        xx.completeResponse(oRequest);
    } else if (xt.in_array(xx.responseErrorsForAlert, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onFailure', oRequest);
        xx.completeResponse(oRequest);
    }
    
    return oRet;

    
}

/*
    Function: jaxon.responseProcessor.xml
    
    Parse the response XML into a series of commands.  The commands
    are constructed by calling <jaxon.tools.xml.parseAttributes> and 
    <jaxon.tools.xml.parseChildren>.
    
    Parameters: 
    
    oRequest - (object):  The request context object.
*/
jaxon.responseProcessor.xml = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    var xcb = xx.callback;
    var gcb = xcb.global;
    var lcb = oRequest.callback;
    
    var oRet = oRequest.returnValue;
    
    if (xt.in_array(xx.responseSuccessCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onSuccess', oRequest);
        var seq = 0;
        if (oRequest.request.responseXML) {
            var responseXML = oRequest.request.responseXML;
            if (responseXML.documentElement) {
                oRequest.status.onProcessing();
                
                var child = responseXML.documentElement.firstChild;
                oRet = xt.xml.processFragment(child, seq, oRet, oRequest);
            }
        } 
        var obj = {};
        obj.fullName = 'Response Complete';
        obj.sequence = seq;
        obj.request = oRequest;
        obj.context = oRequest.context;
        obj.cmd = 'rcmplt';
        xt.queue.push(xx.response, obj);
        
        // do not re-start the queue if a timeout is set
        if (null == xx.response.timeout)
            xt.queue.process(xx.response);
    } else if (xt.in_array(xx.responseRedirectCodes, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onRedirect', oRequest);
        window.location = oRequest.request.getResponseHeader('location');
        xx.completeResponse(oRequest);
    } else if (xt.in_array(xx.responseErrorsForAlert, oRequest.request.status)) {
        xcb.execute([gcb, lcb], 'onFailure', oRequest);
        xx.completeResponse(oRequest);
    }
    
    return oRet;
}

/*
    Class: jaxon.js
    
    Contains the functions for javascript file and function
    manipulation.
*/
jaxon.js = {}

/*
    Function: jaxon.js.includeScriptOnce
    
    Add a reference to the specified script file if one does not
    already exist in the HEAD of the current document.
    
    This will effecitvely cause the script file to be loaded in
    the browser.

    Parameters: 
    
    fileName - (string):  The URI of the file.
    
    Returns:
    
    true - The reference exists or was added.
*/
jaxon.js.includeScriptOnce = function(command) {
    command.fullName = 'includeScriptOnce';
    var fileName = command.data;
    // Check for existing script tag for this file.
    var oDoc = jaxon.config.baseDocument;
    var loadedScripts = oDoc.getElementsByTagName('script');
    var iLen = loadedScripts.length;
    for (var i = 0; i < iLen; ++i) {
        var script = loadedScripts[i];
        if (script.src) {
            if (0 <= script.src.indexOf(fileName))
                return true;
        }
    }
    return jaxon.js.includeScript(command);
}

/*
    Function: jaxon.js.includeScript
    
    Adds a SCRIPT tag referencing the specified file.  This
    effectively causes the script to be loaded in the browser.
    
    Parameters: 
    
    command (object) - Xajax response object
    
    Returns:
    
    true - The reference was added.
*/
jaxon.js.includeScript = function(command) {
    command.fullName = 'includeScript';
    var oDoc = jaxon.config.baseDocument;
    var objHead = oDoc.getElementsByTagName('head');
    var objScript = oDoc.createElement('script');
    objScript.src = command.data;
    if ('undefined' == typeof command.type) objScript.type = 'text/javascript';
    else objScript.type = command.type;
    if ('undefined' != typeof command.type) objScript.setAttribute('id', command.elm_id);
    objHead[0].appendChild(objScript);
    return true;
}

/*
    Function: jaxon.js.removeScript
    
    Locates a SCRIPT tag in the HEAD of the document which references
    the specified file and removes it.
    
    Parameters: 
    
    command (object) - Xajax response object
            
    Returns:
    
    true - The script was not found or was removed.
*/
jaxon.js.removeScript = function(command) {
    command.fullName = 'removeScript';
    var fileName = command.data;
    var unload = command.unld;
    var oDoc = jaxon.config.baseDocument;
    var loadedScripts = oDoc.getElementsByTagName('script');
    var iLen = loadedScripts.length;
    for (var i = 0; i < iLen; ++i) {
        var script = loadedScripts[i];
        if (script.src) {
            if (0 <= script.src.indexOf(fileName)) {
                if ('undefined' != typeof unload) {
                    var args = {};
                    args.data = unload;
                    args.context = window;
                    jaxon.js.execute(args);
                }
                var parent = script.parentNode;
                parent.removeChild(script);
            }
        }
    }
    return true;
}

/*
    Function: jaxon.js.sleep
    
    Causes the processing of items in the queue to be delayed
    for the specified amount of time.  This is an asynchronous
    operation, therefore, other operations will be given an
    opportunity to execute during this delay.
    
    Parameters:
    
    args - (object):  The response command containing the following
        parameters.
        - args.prop: The number of 10ths of a second to sleep.
    
    Returns:
    
    true - The sleep operation completed.
    false - The sleep time has not yet expired, continue sleeping.
*/
jaxon.js.sleep = function(command) {
    command.fullName = 'sleep';
    // inject a delay in the queue processing
    // handle retry counter
    if (jaxon.tools.queue.retry(command, command.prop)) {
        jaxon.tools.queue.setWakeup(jaxon.response, 100);
        return false;
    }
    // wake up, continue processing queue
    return true;
}

/*
    Function: jaxon.js.confirmCommands
    
    Prompt the user with the specified text, if the user responds by clicking
    cancel, then skip the specified number of commands in the response command
    queue.  If the user clicks Ok, the command processing resumes normal
    operation.
    
    Parameters:
    
     command (object) - jaxon response object
         
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.js.confirmCommands = function(command) {
    command.fullName = 'confirmCommands';
    var msg = command.data;
    var numberOfCommands = command.id;
    if (false == confirm(msg)) {
        while (0 < numberOfCommands) {
            jaxon.tools.queue.pop(jaxon.response);
            --numberOfCommands;
        }
    }
    return true;
}

/*
    Function: jaxon.js.execute
    
    Execute the specified string of javascript code, using the current
    script context.
    
    Parameters:
    
    args - The response command object containing the following:
        - args.data: (string):  The javascript to be evaluated.
        - args.context: (object):  The javascript object that to be
            referenced as 'this' in the script.
            
    Returns:
    
    unknown - A value set by the script using 'returnValue = '
    true - If the script does not set a returnValue.
*/
jaxon.js.execute = function(args) {
    args.fullName = 'execute Javascript';
    var returnValue = true;
    args.context = args.context ? args.context : {};
    args.context.jaxonDelegateCall = function() {
        eval(args.data);
    };
    args.context.jaxonDelegateCall();
    return returnValue;
}

/*
    Function: jaxon.js.waitFor
    
    Test for the specified condition, using the current script
    context; if the result is false, sleep for 1/10th of a
    second and try again.
    
    Parameters:
    
    args - The response command object containing the following:
    
        - args.data: (string):  The javascript to evaluate.
        - args.prop: (integer):  The number of 1/10ths of a
            second to wait before giving up.
        - args.context: (object):  The current script context object
            which is accessable in the javascript being evaulated
            via the 'this' keyword.
    
    Returns:
    
    false - The condition evaulates to false and the sleep time
        has not expired.
    true - The condition evaluates to true or the sleep time has
        expired.
*/
jaxon.js.waitFor = function(args) {
    args.fullName = 'waitFor';

    var bResult = false;
    var cmdToEval = 'bResult = (';
    cmdToEval += args.data;
    cmdToEval += ');';
    try {
        args.context.jaxonDelegateCall = function() {
            eval(cmdToEval);
        }
        args.context.jaxonDelegateCall();
    } catch (e) {
    }
    if (false == bResult) {
        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.tools.queue.retry(args, args.prop)) {
            jaxon.tools.queue.setWakeup(jaxon.response, 100);
            return false;
        }
        // give up, continue processing queue
    }
    return true;
}

/*
    Function: jaxon.js.call
    
    Call a javascript function with a series of parameters using 
    the current script context.
    
    Parameters:
    
    args - The response command object containing the following:
        - args.data: (array):  The parameters to pass to the function.
        - args.func: (string):  The name of the function to call.
        - args.context: (object):  The current script context object
            which is accessable in the function name via the 'this'
            keyword.
            
    Returns:
    
    true - The call completed successfully.
*/
jaxon.js.call = function(args) {
    args.fullName = 'call js function';
    
    var parameters = args.data;
    
    var scr = new Array();
    scr.push(args.func);
    scr.push('(');
    if ('undefined' != typeof parameters) {
        if ('object' == typeof parameters) {
            var iLen = parameters.length;
            if (0 < iLen) {
                scr.push('parameters[0]');
                for (var i = 1; i < iLen; ++i)
                    scr.push(', parameters[' + i + ']');
            }
        }
    }
    scr.push(');');
    args.context.jaxonDelegateCall = function() {
        eval(scr.join(''));
    }
    args.context.jaxonDelegateCall();
    return true;
}

/*
    Function: jaxon.js.setFunction

    Constructs the specified function using the specified javascript
    as the body of the function.
    
    Parameters:
    
    args - The response command object which contains the following:
    
        - args.func: (string):  The name of the function to construct.
        - args.data: (string):  The script that will be the function body.
        - args.context: (object):  The current script context object
            which is accessable in the script name via the 'this' keyword.
            
    Returns:
    
    true - The function was constructed successfully.
*/
jaxon.js.setFunction = function(args) {
    args.fullName = 'setFunction';

    var code = new Array();
    code.push(args.func);
    code.push(' = function(');
    if ('object' == typeof args.prop) {
        var separator = '';
        for (var m in args.prop) {
            code.push(separator);
            code.push(args.prop[m]);
            separator = ',';
        }
    } else code.push(args.prop);
    code.push(') { ');
    code.push(args.data);
    code.push(' }');
    args.context.jaxonDelegateCall = function() {
        eval(code.join(''));
    }
    args.context.jaxonDelegateCall();
    return true;
}

/*
    Function: jaxon.js.wrapFunction
    
    Construct a javascript function which will call the original function with 
    the same name, potentially executing code before and after the call to the
    original function.
    
    Parameters:
    
    args - (object):  The response command object which will contain 
        the following:
        
        - args.func: (string):  The name of the function to be wrapped.
        - args.prop: (string):  List of parameters used when calling the function.
        - args.data: (array):  The portions of code to be called before, after
            or even between calls to the original function.
        - args.context: (object):  The current script context object which is 
            accessable in the function name and body via the 'this' keyword.
            
    Returns:
    
    true - The wrapper function was constructed successfully.
*/
jaxon.js.wrapFunction = function(args) {
    args.fullName = 'wrapFunction';

    var code = new Array();
    code.push(args.func);
    code.push(' = jaxon.js.makeWrapper(');
    code.push(args.func);
    code.push(', args.prop, args.data, args.type, args.context);');
    args.context.jaxonDelegateCall = function() {
        eval(code.join(''));
    }
    args.context.jaxonDelegateCall();
    return true;
}

/*
    Function: jaxon.js.makeWrapper
    

    Helper function used in the wrapping of an existing javascript function.

    Parameters:    
    
    origFun - (string):  The name of the original function.
    args - (string):  The list of parameters used when calling the function.
    codeBlocks - (array):  Array of strings of javascript code to be executed
        before, after and perhaps between calls to the original function.
    returnVariable - (string):  The name of the variable used to retain the
        return value from the call to the original function.
    context - (object):  The current script context object which is accessable
        in the function name and body via the 'this' keyword.
        
    Returns:
    
    object - The complete wrapper function.
*/
jaxon.js.makeWrapper = function(origFun, args, codeBlocks, returnVariable, context) {
    var originalCall = '';
    if (0 < returnVariable.length) {
        originalCall += returnVariable;
        originalCall += ' = ';
    }
    var originalCall =     'origFun(';
    originalCall += args;
    originalCall += '); ';
    
    var code = 'wrapper = function(';
    code += args;
    code += ') { ';
    
    if (0 < returnVariable.length) {
        code += ' var ';
        code += returnVariable;
        code += ' = null;';
    }
    var separator = '';
    var bLen = codeBlocks.length;
    for (var b = 0; b < bLen; ++b) {
        code += separator;
        code += codeBlocks[b];
        separator = originalCall;
    }
    if (0 < returnVariable.length) {
        code += ' return ';
        code += returnVariable;
        code += ';';
    }
    code += ' } ';
    
    var wrapper = null;
    context.jaxonDelegateCall = function() {
        eval(code);
    }
    context.jaxonDelegateCall();
    return wrapper;
}

/*
    Class: jaxon.dom
*/
jaxon.dom = {}

/*
    Function: jaxon.dom.assign
    
    Assign an element's attribute to the specified value.
    
    Parameters:
    
    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to set.
    data - (string):  The new value to be applied.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.assign = function(element, property, data) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    
    switch (property) {
    case 'innerHTML':
            element.innerHTML = data;
        break;
    case 'outerHTML':
        if ('undefined' == typeof element.outerHTML) {
            var r = jaxon.config.baseDocument.createRange();
            r.setStartBefore(element);
            var df = r.createContextualFragment(data);
            element.parentNode.replaceChild(df, element);
        } else element.outerHTML = data;
        break;
    default:
        if (jaxon.tools.willChange(element, property, data))
            eval('element.' + property + ' = data;');
        break;
    }
    return true;
}

/*
    Function: jaxon.dom.append
    
    Append the specified value to an element's attribute.
    
    Parameters:
    
    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to append to.
    data - (string):  The new value to be appended.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.append = function(element, property, data) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    
    eval('element.' + property + ' += data;');
    return true;
}

/*
    Function: jaxon.dom.prepend
    
    Prepend the specified value to an element's attribute.
    
    Parameters:
    
    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute.
    data - (string):  The new value to be prepended.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.prepend = function(element, property, data) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    
    eval('element.' + property + ' = data + element.' + property);
    return true;
}

/*
    Function: jaxon.dom.replace
    
    Search and replace the specified text.
    
    Parameters:
    
    element - (string or object):  The name of, or the element itself which is
        to be modified.
    sAttribute - (string):  The name of the attribute to be set.
    aData - (array):  The search text and replacement text.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.replace = function(element, sAttribute, aData) {
    var sSearch = aData['s'];
    var sReplace = aData['r'];
    
    if (sAttribute == 'innerHTML')
        sSearch = jaxon.tools.getBrowserHTML(sSearch);
    
    if ('string' == typeof element)
        element = jaxon.$(element);
    
    eval('var txt = element.' + sAttribute);
    
    var bFunction = false;
    if ('function' == typeof txt) {
        txt = txt.join('');
        bFunction = true;
    }
    
    var start = txt.indexOf(sSearch);
    if (start > -1) {
        var newTxt = [];
        while (start > -1) {
            var end = start + sSearch.length;
            newTxt.push(txt.substr(0, start));
            newTxt.push(sReplace);
            txt = txt.substr(end, txt.length - end);
            start = txt.indexOf(sSearch);
        }
        newTxt.push(txt);
        newTxt = newTxt.join('');
        
        if (bFunction) {
            eval('element.' + sAttribute + '=newTxt;');
        } else if (jaxon.tools.willChange(element, sAttribute, newTxt)) {
            eval('element.' + sAttribute + '=newTxt;');
        }
    }
    return true;
}

/*
    Function: jaxon.dom.remove
    
    Delete an element.
    
    Parameters:
    
    element - (string or object):  The name of, or the element itself which
        will be deleted.
        
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.remove = function(element) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    
    if (element && element.parentNode && element.parentNode.removeChild)
        element.parentNode.removeChild(element);

    return true;
}

/*
    Function: jaxon.dom.create
    
    Create a new element and append it to the specified parent element.
    
    Parameters:
    
    objParent - (string or object):  The name of, or the element itself
        which will contain the new element.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value to be assigned to the id attribute of
        the new element.
        
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.create = function(objParent, sTag, sId) {
    if ('string' == typeof objParent)
        objParent = jaxon.$(objParent);
    var target = jaxon.config.baseDocument.createElement(sTag);
    target.setAttribute('id', sId);
    if (objParent)
        objParent.appendChild(target);
    return true;
}

/*
    Function: jaxon.dom.insert
    
    Insert a new element before the specified element.

    Parameters:
    
    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's
        id attribute.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.insert = function(objSibling, sTag, sId) {
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.config.baseDocument.createElement(sTag);
    target.setAttribute('id', sId);
    objSibling.parentNode.insertBefore(target, objSibling);
    return true;
}

/*
    Function: jaxon.dom.insertAfter
    
    Insert a new element after the specified element.

    Parameters:
    
    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's
        id attribute.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.insertAfter = function(objSibling, sTag, sId) {
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.config.baseDocument.createElement(sTag);
    target.setAttribute('id', sId);
    objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
    return true;
}

/*
    Function: jaxon.dom.contextAssign
    
    Assign a value to a named member of the current script context object.
    
    Parameters:
    
    args - (object):  The response command object which will contain the
        following:
        
        - args.prop: (string):  The name of the member to assign.
        - args.data: (string or object):  The value to assign to the member.
        - args.context: (object):  The current script context object which
            is accessable via the 'this' keyword.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.contextAssign = function(args) {
    args.fullName = 'context assign';

    var code = [];
    code.push('this.');
    code.push(args.prop);
    code.push(' = data;');
    code = code.join('');
    args.context.jaxonDelegateCall = function(data) {
        eval(code);
    }
    args.context.jaxonDelegateCall(args.data);
    return true;
}

/*
    Function: jaxon.dom.contextAppend
    
    Appends a value to a named member of the current script context object.
    
    Parameters:
    
    args - (object):  The response command object which will contain the
        following:
        
        - args.prop: (string):  The name of the member to append to.
        - args.data: (string or object):  The value to append to the member.
        - args.context: (object):  The current script context object which
            is accessable via the 'this' keyword.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.contextAppend = function(args) {
    args.fullName = 'context append';

    var code = [];
    code.push('this.');
    code.push(args.prop);
    code.push(' += data;');
    code = code.join('');
    args.context.jaxonDelegateCall = function(data) {
        eval(code);
    }
    args.context.jaxonDelegateCall(args.data);
    return true;
}

/*
    Function: jaxon.dom.contextPrepend
    
    Prepend a value to a named member of the current script context object.
    
    Parameters:
    
    args - (object):  The response command object which will contain the
        following:
        
        - args.prop: (string):  The name of the member to prepend to.
        - args.data: (string or object):  The value to prepend to the member.
        - args.context: (object):  The current script context object which
            is accessable via the 'this' keyword.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.dom.contextPrepend = function(args) {
    args.fullName = 'context prepend';

    var code = [];
    code.push('this.');
    code.push(args.prop);
    code.push(' = data + this.');
    code.push(args.prop);
    code.push(';');
    code = code.join('');
    args.context.jaxonDelegateCall = function(data) {
        eval(code);
    }
    args.context.jaxonDelegateCall(args.data);
    return true;
}


/*
    Class: jaxon.domResponse
*/
jaxon.domResponse = {}

jaxon.domResponse.startResponse = function(args) {
    jxnElm = [];
}

jaxon.domResponse.createElement = function(args) {
    eval(
        [ args.tgt, ' = document.createElement(args.data)' ]
        .join('')
        );
}

jaxon.domResponse.setAttribute = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [ args.tgt, '.setAttribute(args.key, args.data)' ]
            .join('')
            );
    }
    args.context.jaxonDelegateCall();
}

jaxon.domResponse.appendChild = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [ args.par, '.appendChild(', args.data, ')' ]
            .join('')
            );
    }
    args.context.jaxonDelegateCall();
}

jaxon.domResponse.insertBefore = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [ args.tgt, '.parentNode.insertBefore(', args.data, ', ', args.tgt, ')' ]
            .join('')
            );
    }
    args.context.jaxonDelegateCall();
}

jaxon.domResponse.insertAfter = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [ args.tgt, 'parentNode.insertBefore(', args.data, ', ', args.tgt, '.nextSibling)' ]
            .join('')
            );
    }
    args.context.jaxonDelegateCall();
}

jaxon.domResponse.appendText = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [ args.par, '.appendChild(document.createTextNode(args.data))' ]
            .join('')
            );
    }
    args.context.jaxonDelegateCall();
}

jaxon.domResponse.removeChildren = function(args) {
    var skip = args.skip || 0;
    var remove = args.remove || -1;
    var element = null;
    args.context.jaxonDelegateCall = function() {
        eval( [ 'element = ', args.data ].join( '' ) );
    }
    args.context.jaxonDelegateCall();
    var children = element.childNodes;
    for (var i in children) {
        if (isNaN(i) == false && children[i].nodeType == 1) {
            if (skip > 0) skip = skip - 1;
            else if (remove != 0) {
                if (remove > 0)
                    remove = remove - 1;
                element.removeChild(children[i]);
            }
        }
    }
}

jaxon.domResponse.endResponse = function(args) {
    jxnElm = [];
}


/*
    Class: jaxon.css
*/
jaxon.css = {}

/*
    Function: jaxon.css.add
    
    Add a LINK reference to the specified .css file if it does not
    already exist in the HEAD of the current document.
    
    Parameters:
    
    filename - (string):  The URI of the .css file to reference.

    media - (string):  The media type of the css file (print/screen/handheld,..)
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.css.add = function(fileName, media) {
    var oDoc = jaxon.config.baseDocument;
    var oHeads = oDoc.getElementsByTagName('head');
    var oHead = oHeads[0];
    var oLinks = oHead.getElementsByTagName('link');
    
    var found = false;
    var iLen = oLinks.length;
    for (var i = 0; i < iLen && false == found; ++i)
        if (0 <= oLinks[i].href.indexOf(fileName) && oLinks[i].media == media)
            found = true;
    
    if (false == found) {
        var oCSS = oDoc.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
    }
    
    return true;
}

/*
    Function: jaxon.css.remove
    
    Locate and remove a LINK reference from the current document's
    HEAD.
    
    Parameters:
    
    filename - (string):  The URI of the .css file.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.css.remove = function(fileName, media) {
    var oDoc = jaxon.config.baseDocument;
    var oHeads = oDoc.getElementsByTagName('head');
    var oHead = oHeads[0];
    var oLinks = oHead.getElementsByTagName('link');
    
    var i = 0;
    while (i < oLinks.length)
        if (0 <= oLinks[i].href.indexOf(fileName) && oLinks[i].media == media)
            oHead.removeChild(oLinks[i]);
        else ++i;
    
    return true;
}

/*
    Function: jaxon.css.waitForCSS
    
    Attempt to detect when all .css files have been loaded once
    they are referenced by a LINK tag in the HEAD of the current
    document.
    
    Parameters:
    
    args - (object):  The response command object which will contain
        the following:
        
        - args.prop - (integer):  The number of 1/10ths of a second
            to wait before giving up.
    
    Returns:
    
    true - The .css files appear to be loaded.
    false - The .css files do not appear to be loaded and the timeout
        has not expired.
*/
jaxon.css.waitForCSS = function(args) {
    var oDocSS = jaxon.config.baseDocument.styleSheets;
    var ssEnabled = [];
    var iLen = oDocSS.length;
    for (var i = 0; i < iLen; ++i) {
        ssEnabled[i] = 0;
        try {
            ssEnabled[i] = oDocSS[i].cssRules.length;
        } catch (e) {
            try {
                ssEnabled[i] = oDocSS[i].rules.length;
            } catch (e) {
            }
        }
    }
    
    var ssLoaded = true;
    var iLen = ssEnabled.length;
    for (var i = 0; i < iLen; ++i)
        if (0 == ssEnabled[i])
            ssLoaded = false;
    
    if (false == ssLoaded) {
        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.tools.queue.retry(args, args.prop)) {
            jaxon.tools.queue.setWakeup(jaxon.response, 10);
            return false;
        }
        // give up, continue processing queue
    }
    return true;
}


/*
    Class: jaxon.forms
*/
jaxon.forms = {}

/*
    Function: jaxon.forms.getInput
    
    Create and return a form input element with the specified parameters.
    
    Parameters:
    
    type - (string):  The type of input element desired.
    name - (string):  The value to be assigned to the name attribute.
    id - (string):  The value to be assigned to the id attribute.
    
    Returns:
    
    object - The new input element.
*/
jaxon.forms.getInput = function(type, name, id) {
    if ('undefined' == typeof window.addEventListener) {
        jaxon.forms.getInput = function(type, name, id) {
            return jaxon.config.baseDocument.createElement('<input type="'+type+'" name="'+name+'" id="'+id+'">');
        }
    } else {
        jaxon.forms.getInput = function(type, name, id) {
            var oDoc = jaxon.config.baseDocument;
            var Obj = oDoc.createElement('input');
            Obj.setAttribute('type', type);
            Obj.setAttribute('name', name);
            Obj.setAttribute('id', id);
            return Obj;
        }
    }
    return jaxon.forms.getInput(type, name, id);
}

/*
    Function: jaxon.forms.createInput
    
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
jaxon.forms.createInput = function(command) {
    command.fullName = 'createInput';
    var objParent = command.id;

    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objParent)
        objParent = jaxon.$(objParent);
    var target = jaxon.forms.getInput(sType, sName, sId);
    if (objParent && target)
    {
        objParent.appendChild(target);
    }
    return true;
}

/*
    Function: jaxon.forms.insertInput
    
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
jaxon.forms.insertInput = function(command) {
    command.fullName = 'insertInput';
    var objSibling = command.id;
    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.forms.getInput(sType, sName, sId);
    if (target && objSibling && objSibling.parentNode)
        objSibling.parentNode.insertBefore(target, objSibling);
    return true;
}

/*
    Function: jaxon.forms.insertInputAfter

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
jaxon.forms.insertInputAfter = function(command) {
    command.fullName = 'insertInputAfter';
    var objSibling = command.id;
    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.forms.getInput(sType, sName, sId);
    if (target && objSibling && objSibling.parentNode)
        objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
    return true;
}

/*
    Class: jaxon.events
*/
jaxon.events = {}

/*
    Function: jaxon.events.setEvent
    
    Set an event handler.
    
    Parameters:
    
    command - (object): Response command object.
    - id: Element ID
    - prop: Event
    - data: Code    

    Returns:
    
    true - The operation completed successfully.
*/
jaxon.events.setEvent = function(command) {
    command.fullName = 'setEvent';
    var element = command.id;
    var sEvent = command.prop;
    var code = command.data;
    //force to get the element 
    element = jaxon.$(element);
    sEvent = jaxon.tools.addOnPrefix(sEvent);
    code = jaxon.tools.doubleQuotes(code);
    eval('element.' + sEvent + ' = function(e) { ' + code + '; }');
    return true;
}

/*
    Function: jaxon.events.addHandler
    
    Add an event handler to the specified element.
    
    Parameters:
    
    element - (string or object):  The name of, or the element itself
        which will have the event handler assigned.
    sEvent - (string):  The name of the event.
    fun - (string):  The function to be called.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.events.addHandler = function(element, sEvent, fun) {
    if (window.addEventListener) {
        jaxon.events.addHandler = function(command) {
            command.fullName = 'addHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.stripOnPrefix(sEvent);
            eval('element.addEventListener("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    } else {
        jaxon.events.addHandler = function(command) {
            command.fullName = 'addHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.addOnPrefix(sEvent);
            eval('element.attachEvent("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    }
    return jaxon.events.addHandler(element, sEvent, fun);
}

/*
    Function: jaxon.events.removeHandler
    
    Remove an event handler from an element.
    
    Parameters:
    
    element - (string or object):  The name of, or the element itself which
        will have the event handler removed.
    event - (string):  The name of the event for which this handler is 
        associated.
    fun - The function to be removed.
    
    Returns:
    
    true - The operation completed successfully.
*/
jaxon.events.removeHandler = function(element, sEvent, fun) {
    if (window.removeEventListener) {
        jaxon.events.removeHandler = function(command) {
            command.fullName = 'removeHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.stripOnPrefix(sEvent);
            eval('element.removeEventListener("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    } else {
        jaxon.events.removeHandler = function(command) {
            command.fullName = 'removeHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.addOnPrefix(sEvent);
            eval('element.detachEvent("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    }
    return jaxon.events.removeHandler(element, sEvent, fun);
}

/*
    Class: jaxon.callback
*/
jaxon.callback = {}

/*
    Function: jaxon.callback.create
    
    Create a blank callback object.  Two optional arguments let you 
    set the delay time for the onResponseDelay and onExpiration events.
    
    Returns:
    
    object - The callback object.
*/
jaxon.callback.create = function() {
    var xx = jaxon;
    var xc = xx.config;
    var xcb = xx.callback;
    
    var oCB = {}
    oCB.timers = {};
    
    oCB.timers.onResponseDelay = xcb.setupTimer(
        (arguments.length > 0) 
            ? arguments[0] 
            : xc.defaultResponseDelayTime);
    
    oCB.timers.onExpiration = xcb.setupTimer(
        (arguments.length > 1) 
            ? arguments[1] 
            : xc.defaultExpirationTime);

    oCB.onRequest = null;
    oCB.onResponseDelay = null;
    oCB.onExpiration = null;
    oCB.beforeResponseProcessing = null;
    oCB.onFailure = null;
    oCB.onRedirect = null;
    oCB.onSuccess = null;
    oCB.onComplete = null;
    
    return oCB;
}

/*
    Function: jaxon.callback.setupTimer
    
    Create a timer to fire an event in the future.  This will
    be used fire the onRequestDelay and onExpiration events.
    
    Parameters:
    
    iDelay - (integer):  The amount of time in milliseconds to delay.
    
    Returns:
    
    object - A callback timer object.
*/
jaxon.callback.setupTimer = function(iDelay)
{
    return { timer: null, delay: iDelay };
}

/*
    Function: jaxon.callback.clearTimer
    
    Clear a callback timer for the specified function.
    
    Parameters:
    
    oCallback - (object):  The callback object (or objects) that
        contain the specified function timer to be cleared.
    sFunction - (string):  The name of the function associated
        with the timer to be cleared.
*/
jaxon.callback.clearTimer = function(oCallback, sFunction)
{
    if ('undefined' != typeof oCallback.timers) {
        if ('undefined' != typeof oCallback.timers[sFunction]) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    } else if ('object' == typeof oCallback) {
        var iLen = oCallback.length;
        for (var i = 0; i < iLen; ++i)
            jaxon.callback.clearTimer(oCallback[i], sFunction);
    }
}

/*
    Function: jaxon.callback.execute
    
    Execute a callback event.
    
    Parameters:
    
    oCallback - (object):  The callback object (or objects) which 
        contain the event handlers to be executed.
    sFunction - (string):  The name of the event to be triggered.
    args - (object):  The request object for this request.
*/
jaxon.callback.execute = function(oCallback, sFunction, args) {
    if ('undefined' != typeof oCallback[sFunction]) {
        var func = oCallback[sFunction];
        if ('function' == typeof func) {
            if ('undefined' != typeof oCallback.timers[sFunction]) {
                oCallback.timers[sFunction].timer = setTimeout(function() { 
                    func(args);
                }, oCallback.timers[sFunction].delay);
            }
            else {
                func(args);
            }
        }
    } else if ('object' == typeof oCallback) {
        var iLen = oCallback.length;
        for (var i = 0; i < iLen; ++i)
            jaxon.callback.execute(oCallback[i], sFunction, args);
    }
}

/*
    Class: jaxon.callback.global
    
    The global callback object which is active for every request.
*/
jaxon.callback.global = jaxon.callback.create();

/*
    Class: jaxon
*/

/*
    Object: jaxon.response
    
    The response queue that holds response commands, once received
    from the server, until they are processed.
*/    
jaxon.response = jaxon.tools.queue.create(jaxon.config.responseQueueSize);

/*
    Object: responseSuccessCodes
    
    This array contains a list of codes which will be returned from the 
    server upon successful completion of the server portion of the 
    request.
    
    These values should match those specified in the HTTP standard.
*/
jaxon.responseSuccessCodes = ['0', '200'];

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
    Object: responseErrorsForAlert
    
    This array contains a list of status codes returned by
    the server to indicate that the request failed for some
    reason.
*/
jaxon.responseErrorsForAlert = ['400','401','402','403','404','500','501','502','503'];

// 10.3.1 300 Multiple Choices
// 10.3.2 301 Moved Permanently
// 10.3.3 302 Found
// 10.3.4 303 See Other
// 10.3.5 304 Not Modified
// 10.3.6 305 Use Proxy
// 10.3.7 306 (Unused)
// 10.3.8 307 Temporary Redirect

/*
    Object: responseRedirectCodes
    
    An array of status codes returned from the server to
    indicate a request for redirect to another URL.
    
    Typically, this is used by the server to send the browser
    to another URL.  This does not typically indicate that
    the jaxon request should be sent to another URL.
*/
jaxon.responseRedirectCodes = ['301','302','307'];

/*
    Class: jaxon.command
    
    The object that manages commands and command handlers.
*/
if ('undefined' == typeof jaxon.command)
    jaxon.command = {};

/*
    Function: jaxon.command.create 
    
    Creates a new command (object) that will be populated with
    command parameters and eventually passed to the command handler.
*/
jaxon.command.create = function(sequence, request, context) {
    var newCmd = {};
    newCmd.cmd = '*';
    newCmd.fullName = '* unknown command name *';
    newCmd.sequence = sequence;
    newCmd.request = request;
    newCmd.context = context;
    return newCmd;
}

/*
    Class: jaxon.command.handler
    
    The object that manages command handlers.
*/
if ('undefined' == typeof jaxon.command.handler)
    jaxon.command.handler = {};

/*
    Object: handlers
    
    An array that is used internally in the jaxon.command.handler object
    to keep track of command handlers that have been registered.
*/
if ('undefined' == typeof jaxon.command.handler.handlers)
    jaxon.command.handler.handlers = [];

/*
    Function: jaxon.command.handler.register
    
    Registers a new command handler.
*/
jaxon.command.handler.register = function(shortName, func) {
    jaxon.command.handler.handlers[shortName] = func;
}

/*
    Function: jaxon.command.handler.unregister
    
    Unregisters and returns a command handler.
    
    Parameters:
        shortName - (string): The name of the command handler.
        
    Returns:
        func - (function): The unregistered function.
*/
jaxon.command.handler.unregister = function(shortName) {
    var func = jaxon.command.handler.handlers[shortName];
    delete jaxon.command.handler.handlers[shortName];
    return func;
}

/*
    Function: jaxon.command.handler.isRegistered
    
    
    Parameters:
        command - (object):
            - cmd: The Name of the function.

    Returns:

    boolean - (true or false): depending on whether a command handler has 
    been created for the specified command (object).
        
*/
jaxon.command.handler.isRegistered = function(command) {
    var shortName = command.cmd;
    if (jaxon.command.handler.handlers[shortName])
        return true;
    return false;
}

/*
    Function: jaxon.command.handler.call
    
    Calls the registered command handler for the specified command
    (you should always check isRegistered before calling this function)

    Parameters:
        command - (object):
            - cmd: The Name of the function.

    Returns:
        true - (boolean) :
*/
jaxon.command.handler.call = function(command) {
    var shortName = command.cmd;
    return jaxon.command.handler.handlers[shortName](command);
}

jaxon.command.handler.register('rcmplt', function(args) {
    jaxon.completeResponse(args.request);
    return true;
});

jaxon.command.handler.register('css', function(args) {
    args.fullName = 'includeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.css.add(args.data, args.media);
});
jaxon.command.handler.register('rcss', function(args) {
    args.fullName = 'removeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.css.remove(args.data, args.media);
});
jaxon.command.handler.register('wcss', function(args) {
    args.fullName = 'waitForCSS';
    return jaxon.css.waitForCSS(args);
});

jaxon.command.handler.register('as', function(args) {
    args.fullName = 'assign/clear';
    try {
        return jaxon.dom.assign(args.target, args.prop, args.data);
    } catch (e) {
        // do nothing, if the debug module is installed it will
        // catch and handle the exception
    }
    return true;
});
jaxon.command.handler.register('ap', function(args) {
    args.fullName = 'append';
    return jaxon.dom.append(args.target, args.prop, args.data);
});
jaxon.command.handler.register('pp', function(args) {
    args.fullName = 'prepend';
    return jaxon.dom.prepend(args.target, args.prop, args.data);
});
jaxon.command.handler.register('rp', function(args) {
    args.fullName = 'replace';
    return jaxon.dom.replace(args.id, args.prop, args.data);
});
jaxon.command.handler.register('rm', function(args) {
    args.fullName = 'remove';
    return jaxon.dom.remove(args.id);
});
jaxon.command.handler.register('ce', function(args) {
    args.fullName = 'create';
    return jaxon.dom.create(args.id, args.data, args.prop);
});
jaxon.command.handler.register('ie', function(args) {
    args.fullName = 'insert';
    return jaxon.dom.insert(args.id, args.data, args.prop);
});
jaxon.command.handler.register('ia', function(args) {
    args.fullName = 'insertAfter';
    return jaxon.dom.insertAfter(args.id, args.data, args.prop);
});

jaxon.command.handler.register('DSR', jaxon.domResponse.startResponse);
jaxon.command.handler.register('DCE', jaxon.domResponse.createElement);
jaxon.command.handler.register('DSA', jaxon.domResponse.setAttribute);
jaxon.command.handler.register('DAC', jaxon.domResponse.appendChild);
jaxon.command.handler.register('DIB', jaxon.domResponse.insertBefore);
jaxon.command.handler.register('DIA', jaxon.domResponse.insertAfter);
jaxon.command.handler.register('DAT', jaxon.domResponse.appendText);
jaxon.command.handler.register('DRC', jaxon.domResponse.removeChildren);
jaxon.command.handler.register('DER', jaxon.domResponse.endResponse);

jaxon.command.handler.register('c:as', jaxon.dom.contextAssign);
jaxon.command.handler.register('c:ap', jaxon.dom.contextAppend);
jaxon.command.handler.register('c:pp', jaxon.dom.contextPrepend);

jaxon.command.handler.register('s', jaxon.js.sleep);
jaxon.command.handler.register('ino', jaxon.js.includeScriptOnce);
jaxon.command.handler.register('in', jaxon.js.includeScript);
jaxon.command.handler.register('rjs', jaxon.js.removeScript);
jaxon.command.handler.register('wf', jaxon.js.waitFor);
jaxon.command.handler.register('js', jaxon.js.execute);
jaxon.command.handler.register('jc', jaxon.js.call);
jaxon.command.handler.register('sf', jaxon.js.setFunction);
jaxon.command.handler.register('wpf', jaxon.js.wrapFunction);
jaxon.command.handler.register('al', function(args) {
    args.fullName = 'alert';
    alert(args.data);
    return true;
});
jaxon.command.handler.register('cc', jaxon.js.confirmCommands);

jaxon.command.handler.register('ci', jaxon.forms.createInput);
jaxon.command.handler.register('ii', jaxon.forms.insertInput);
jaxon.command.handler.register('iia', jaxon.forms.insertInputAfter);

jaxon.command.handler.register('ev', jaxon.events.setEvent);

jaxon.command.handler.register('ah', jaxon.events.addHandler);
jaxon.command.handler.register('rh', jaxon.events.removeHandler);

jaxon.command.handler.register('dbg', function(args) {
    args.fullName = 'debug message';
    return true;
});

/*
    Function: jaxon.initializeRequest
    
    Initialize a request object, populating default settings, where
    call specific settings are not already provided.
    
    Parameters:
    
    oRequest - (object):  An object that specifies call specific settings
        that will, in addition, be used to store all request related
        values.  This includes temporary values used internally by jaxon.
*/
jaxon.initializeRequest = function(oRequest) {
    var xx = jaxon;
    var xc = xx.config;
    
    oRequest.append = function(opt, def) {
        if ('undefined' != typeof this[opt]) {
            for (var itmName in def)
                if ('undefined' == typeof this[opt][itmName])
                    this[opt][itmName] = def[itmName];
        } else this[opt] = def;
    }
    
    oRequest.append('commonHeaders', xc.commonHeaders);
    oRequest.append('postHeaders', xc.postHeaders);
    oRequest.append('getHeaders', xc.getHeaders);

    oRequest.set = function(option, defaultValue) {
        if ('undefined' == typeof this[option])
            this[option] = defaultValue;
    }
    
    oRequest.set('statusMessages', xc.statusMessages);
    oRequest.set('waitCursor', xc.waitCursor);
    oRequest.set('mode', xc.defaultMode);
    oRequest.set('method', xc.defaultMethod);
    oRequest.set('URI', xc.requestURI);
    oRequest.set('httpVersion', xc.defaultHttpVersion);
    oRequest.set('contentType', xc.defaultContentType);
    oRequest.set('retry', xc.defaultRetry);
    oRequest.set('returnValue', xc.defaultReturnValue);
    oRequest.set('maxObjectDepth', xc.maxObjectDepth);
    oRequest.set('maxObjectSize', xc.maxObjectSize);
    oRequest.set('context', window);
    
    var xcb = xx.callback;
    var gcb = xcb.global;
    var lcb = xcb.create();
    
    lcb.take = function(frm, opt) {
        if ('undefined' != typeof frm[opt]) {
            lcb[opt] = frm[opt];
            lcb.hasEvents = true;
        }
        delete frm[opt];
    }
    
    lcb.take(oRequest, 'onRequest');
    lcb.take(oRequest, 'onResponseDelay');
    lcb.take(oRequest, 'onExpiration');
    lcb.take(oRequest, 'beforeResponseProcessing');
    lcb.take(oRequest, 'onFailure');
    lcb.take(oRequest, 'onRedirect');
    lcb.take(oRequest, 'onSuccess');
    lcb.take(oRequest, 'onComplete');
    
    if ('undefined' != typeof oRequest.callback) {
        if (lcb.hasEvents)
            oRequest.callback = [oRequest.callback, lcb];
    } else
        oRequest.callback = lcb;
    
    oRequest.status = (oRequest.statusMessages) 
        ? xc.status.update() 
        : xc.status.dontUpdate();
    
    oRequest.cursor = (oRequest.waitCursor) 
        ? xc.cursor.update() 
        : xc.cursor.dontUpdate();
    
    oRequest.method = oRequest.method.toUpperCase();
    if ('GET' != oRequest.method)
        oRequest.method = 'POST';    // W3C: Method is case sensitive
    
    oRequest.requestRetry = oRequest.retry;
    
    oRequest.append('postHeaders', {
        'content-type': oRequest.contentType
        });
        
    delete oRequest['append'];
    delete oRequest['set'];
    delete oRequest['take'];

    if ('undefined' == typeof oRequest.URI)
        throw { code: 10005 }
}

/*
    Function: jaxon.processParameters
    
    Processes request specific parameters and generates the temporary 
    variables needed by jaxon to initiate and process the request.
    
    Parameters:
    
    oRequest - A request object, created initially by a call to
        <jaxon.initializeRequest>
    
    Note:
    This is called once per request; upon a request failure, this 
    will not be called for additional retries.
*/
jaxon.processParameters = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    
    var rd = [];
    
    var separator = '';
    for (var sCommand in oRequest.functionName) {
        if ('constructor' != sCommand) {
            rd.push(separator);
            rd.push(sCommand);
            rd.push('=');
            rd.push(encodeURIComponent(oRequest.functionName[sCommand]));
            separator = '&';
        }
    }
    var dNow = new Date();
    rd.push('&jxnr=');
    rd.push(dNow.getTime());
    delete dNow;

    if (oRequest.parameters) {
        var i = 0;
        var iLen = oRequest.parameters.length;
        while (i < iLen) {
            var oVal = oRequest.parameters[i];
            if ('object' == typeof oVal && null != oVal) {
                try {
//                    var oGuard = {};
//                    oGuard.depth = 0;
//                    oGuard.maxDepth = oRequest.maxObjectDepth;
//                    oGuard.size = 0;
//                    oGuard.maxSize = oRequest.maxObjectSize;
                    //oVal = xt._objectToXML(oVal, oGuard);
                    oVal = JSON.stringify(oVal);
                } catch (e) {
                    oVal = '';
                    // do nothing, if the debug module is installed
                    // it will catch the exception and handle it
                }
                rd.push('&jxnargs[]=');
                oVal = encodeURIComponent(oVal);
                rd.push(oVal);
                ++i;
            } else {
                rd.push('&jxnargs[]=');

                if ('undefined' == typeof oVal || null == oVal) {
                    rd.push('*');
                } else {
                    var sType = typeof oVal;
                    if ('string' == sType)
                        rd.push('S');
                    else if ('boolean' == sType)
                        rd.push('B');
                    else if ('number' == sType)
                        rd.push('N');
                    oVal = encodeURIComponent(oVal);
                    rd.push(oVal);
                }
                ++i;
            }
        }
    }
    
    oRequest.requestURI = oRequest.URI;
    
    if ('GET' == oRequest.method) {
        oRequest.requestURI += oRequest.requestURI.indexOf('?')== -1 ? '?' : '&';
        oRequest.requestURI += rd.join('');
        rd = [];
    }
    
    oRequest.requestData = rd.join('');
}

/*
    Function: jaxon.prepareRequest
    
    Prepares the XMLHttpRequest object for this jaxon request.
    
    Parameters:
    
    oRequest - (object):  An object created by a call to <jaxon.initializeRequest>
        which already contains the necessary parameters and temporary variables
        needed to initiate and process a jaxon request.
    
    Note: 
    This is called each time a request object is being prepared for a 
    call to the server.  If the request is retried, the request must be
    prepared again.
*/
jaxon.prepareRequest = function(oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    
    oRequest.request = xt.getRequestObject();
    
    oRequest.setRequestHeaders = function(headers) {
         if ('object' == typeof headers) {
            for (var optionName in headers)
                this.request.setRequestHeader(optionName, headers[optionName]);
        }
    }
    oRequest.setCommonRequestHeaders = function() {
        this.setRequestHeaders(this.commonHeaders);
        if (this.challengeResponse)
            this.request.setRequestHeader('challenge-response', this.challengeResponse);
    }
    oRequest.setPostRequestHeaders = function() {
        this.setRequestHeaders(this.postHeaders);
    }
    oRequest.setGetRequestHeaders = function() {
        this.setRequestHeaders(this.getHeaders);
    }
    
    if ('asynchronous' == oRequest.mode) {
        // references inside this function should be expanded
        // IOW, don't use shorthand references like xx for jaxon
        oRequest.request.onreadystatechange = function() {
            if (oRequest.request.readyState != 4)
                return;
            jaxon.responseReceived(oRequest);
        }
        oRequest.finishRequest = function() {
            return this.returnValue;
        }
    } else {
        oRequest.finishRequest = function() {
            return jaxon.responseReceived(oRequest);
        }
    }
    
    if ('undefined' != typeof oRequest.userName && 'undefined' != typeof oRequest.password) {
        oRequest.open = function() {
            this.request.open(
                this.method, 
                this.requestURI, 
                'asynchronous' == this.mode, 
                oRequest.userName, 
                oRequest.password);
        }
    } else {
        oRequest.open = function() {
            this.request.open(
                this.method, 
                this.requestURI, 
                'asynchronous' == this.mode);
        }
    }
    
    if ('POST' == oRequest.method) {    // W3C: Method is case sensitive
        oRequest.applyRequestHeaders = function() {
            this.setCommonRequestHeaders();
            try {
                this.setPostRequestHeaders();
            } catch (e) {
                this.method = 'GET';
                this.requestURI += this.requestURI.indexOf('?')== -1 ? '?' : '&';
                this.requestURI += this.requestData;
                this.requestData = '';
                if (0 == this.requestRetry) this.requestRetry = 1;
                throw e;
            }
        }
    } else {
        oRequest.applyRequestHeaders = function() {
            this.setCommonRequestHeaders();
            this.setGetRequestHeaders();
        }
    }
}

/*
    Function: jaxon.request
    
    Initiates a request to the server.

    Parameters:
    
    functionName - (object):  An object containing the name of the function to execute
    on the server. The standard request is: {jxnfun:'function_name'}
        
    oRequest - (object, optional):  A request object which 
        may contain call specific parameters.  This object will be
        used by jaxon to store all the request parameters as well
        as temporary variables needed during the processing of the
        request.
    
*/
jaxon.request = function() {
    var numArgs = arguments.length;
    if (0 == numArgs)
        return false;
    
    var oRequest = {}
    if (1 < numArgs)
        oRequest = arguments[1];
    
    oRequest.functionName = arguments[0];
    
    var xx = jaxon;
    
    xx.initializeRequest(oRequest);
    xx.processParameters(oRequest);
    while (0 < oRequest.requestRetry) {
        try {
            --oRequest.requestRetry;
            xx.prepareRequest(oRequest);
            return xx.submitRequest(oRequest);
        } catch (e) {
            jaxon.callback.execute(
                [jaxon.callback.global, oRequest.callback],
                'onFailure',
                oRequest
                );
            if (0 == oRequest.requestRetry)
                throw e;
        }
    }
}

/*
    Function: jaxon.submitRequest
    
    Create a request object and submit the request using the specified
    request type; all request parameters should be finalized by this 
    point.  Upon failure of a POST, this function will fall back to a 
    GET request.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon.submitRequest = function(oRequest) {
    oRequest.status.onRequest();
    
    var xcb = jaxon.callback;
    var gcb = xcb.global;
    var lcb = oRequest.callback;
    
    xcb.execute([gcb, lcb], 'onResponseDelay', oRequest);
    xcb.execute([gcb, lcb], 'onExpiration', oRequest);
    xcb.execute([gcb, lcb], 'onRequest', oRequest);
    
    oRequest.open();
    oRequest.applyRequestHeaders();

    oRequest.cursor.onWaiting();
    oRequest.status.onWaiting();
    
    jaxon._internalSend(oRequest);
    
    // synchronous mode causes response to be processed immediately here
    return oRequest.finishRequest();
}

/*
    Function: jaxon._internalSend
    
    This function is used internally by jaxon to initiate a request to the
    server.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon._internalSend = function(oRequest) {
    // this may block if synchronous mode is selected
    oRequest.request.send(oRequest.requestData);
}

/*
    Function: jaxon.abortRequest
    
    Abort the request.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon.abortRequest = function(oRequest)
{
    oRequest.aborted = true;
    oRequest.request.abort();
    jaxon.completeResponse(oRequest);
}

/*
    Function: jaxon.responseReceived
    
    Process the response.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon.responseReceived = function(oRequest) {
    var xx = jaxon;
    var xcb = xx.callback;
    var gcb = xcb.global;
    var lcb = oRequest.callback;
    // sometimes the responseReceived gets called when the
    // request is aborted
    if (oRequest.aborted)
        return;
    
    xcb.clearTimer([gcb, lcb], 'onExpiration');
    xcb.clearTimer([gcb, lcb], 'onResponseDelay');
    
    xcb.execute([gcb, lcb], 'beforeResponseProcessing', oRequest);

    var challenge = oRequest.request.getResponseHeader('challenge');
    if (challenge) {
        oRequest.challengeResponse = challenge;
        xx.prepareRequest(oRequest);
        return xx.submitRequest(oRequest);
    }
    
    var fProc = xx.getResponseProcessor(oRequest);
    if ('undefined' == typeof fProc) {
        xcb.execute([gcb, lcb], 'onFailure', oRequest);
        xx.completeResponse(oRequest);
        return;
    }
    
    return fProc(oRequest);
}

/*
    Function: jaxon.getResponseProcessor
    
    This function attempts to determine, based on the content type of the
    reponse, what processor should be used for handling the response data.
    
    The default jaxon response will be text/xml which will invoke the
    jaxon xml response processor.  Other response processors may be added
    in the future.  The user can specify their own response processor on
    a call by call basis.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon.getResponseProcessor = function(oRequest) {
    var fProc;
    
    if ('undefined' == typeof oRequest.responseProcessor) {
        var cTyp = oRequest.request.getResponseHeader('content-type');
        if (cTyp) {
            if (0 <= cTyp.indexOf('text/xml')) {
                fProc = jaxon.responseProcessor.xml;
            } else if (0 <= cTyp.indexOf('application/json')) {
                fProc = jaxon.responseProcessor.json;
            }
        }
    } else fProc = oRequest.responseProcessor;
    
    return fProc;
}

/*
    Function: jaxon.executeCommand 
    
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
jaxon.executeCommand = function(command) {
    if (jaxon.command.handler.isRegistered(command)) {
        // it is important to grab the element here as the previous command
        // might have just created the element
        if (command.id)
            command.target = jaxon.$(command.id);
        // process the command
        if (false == jaxon.command.handler.call(command)) {
            jaxon.tools.queue.pushFront(jaxon.response, command);
            return false;
        }
    }
    return true;
}

/*
    Function: jaxon.completeResponse
    
    Called by the response command queue processor when all commands have 
    been processed.
    
    Parameters:
    
    oRequest - (object):  The request context object.
*/
jaxon.completeResponse = function(oRequest) {
    jaxon.callback.execute(
        [jaxon.callback.global, oRequest.callback],
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
    delete oRequest['challengeResponse'];
}

/*
    Function: jaxon.$
    
    Shortcut to <jaxon.tools.$>.
*/
jaxon.$ = jaxon.tools.$;

/*
    Function: jaxon.getFormValues
    
    Shortcut to <jaxon.tools.getFormValues>.
*/
jaxon.getFormValues = jaxon.tools.getFormValues;

/*
    Boolean: jaxon.isLoaded
    
    true - jaxon module is loaded.
*/
jaxon.isLoaded = true;


/*
    Class: jxn
    
    Contains shortcut's to frequently used functions.
*/
jxn = {}

/*
    Function: jxn.$
    
    Shortcut to <jaxon.tools.$>.
*/
jxn.$ = jaxon.tools.$;

/*
    Function: jxn.getFormValues
    
    Shortcut to <jaxon.tools.getFormValues>.
*/
jxn.getFormValues = jaxon.tools.getFormValues;

jxn.request = jaxon.request;

// if ('undefined' == typeof JSON) jaxon.js.includeScript({data:jaxon.config.JavaScriptURI+'jaxon/js/jaxon.json.js'});