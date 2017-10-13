/*
Function: jaxon.tools.dom.$

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
jaxon.tools.dom.$ = function(sId) {
    if (!sId)
        return null;
    //sId not an string so return it maybe its an object.
    if (typeof sId != 'string')
        return sId;

    var oDoc = jaxon.config.baseDocument;

    var obj = oDoc.getElementById(sId);
    if (obj)
        return obj;

    if (oDoc.all)
        return oDoc.all[sId];

    return obj;
};

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
jaxon.tools.array.is_in = function(array, valueToCheck) {
    var i = 0;
    var l = array.length;
    while (i < l) {
        if (array[i] == valueToCheck)
            return true;
        ++i;
    }
    return false;
};

/*
Function: jaxon.tools.string.doubleQuotes

Replace all occurances of the single quote character with a double quote character.

Parameters:

haystack - The source string to be scanned.

Returns:  false on error

string - A new string with the modifications applied.
*/
jaxon.tools.string.doubleQuotes = function(haystack) {
    if (typeof haystack == 'undefined') return false;
    return haystack.replace(new RegExp("'", 'g'), '"');
};

/*
Function: jaxon.tools.string.singleQuotes

Replace all occurances of the double quote character with a single
quote character.

haystack - The source string to be scanned.

Returns:

string - A new string with the modification applied.
*/
/*
jaxon.tools.string.singleQuotes = function(haystack) {
return haystack.replace(new RegExp('"', 'g'), "'");
}
*/

/*
Function: jaxon.tools.ajax.createRequest

Construct an XMLHttpRequest object dependent on the capabilities
of the browser.

Returns:

object - Javascript XHR object.
*/
jaxon.tools.ajax.createRequest = function() {
    if ('undefined' != typeof XMLHttpRequest) {
        jaxon.tools.ajax.createRequest = function() {
            return new XMLHttpRequest();
        }
    } else if ('undefined' != typeof ActiveXObject) {
        jaxon.tools.ajax.createRequest = function() {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.4.0');
            } catch (e) {
                jaxon.tools.ajax.createRequest = function() {
                    try {
                        return new ActiveXObject('Msxml2.XMLHTTP');
                    } catch (e2) {
                        jaxon.tools.ajax.createRequest = function() {
                            return new ActiveXObject('Microsoft.XMLHTTP');
                        }
                        return jaxon.tools.ajax.createRequest();
                    }
                }
                return jaxon.tools.ajax.createRequest();
            }
        }
    } else if (window.createRequest) {
        jaxon.tools.ajax.createRequest = function() {
            return window.createRequest();
        };
    } else {
        jaxon.tools.ajax.createRequest = function() {
            throw { code: 10002 };
        };
    }

    // this would seem to cause an infinite loop, however, the function should
    // be reassigned by now and therefore, it will not loop.
    return jaxon.tools.ajax.createRequest();
};

/*
Function: jaxon.tools.dom.getBrowserHTML

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
jaxon.tools.dom.getBrowserHTML = function(sValue) {
    var oDoc = jaxon.config.baseDocument;
    if (!oDoc.body)
        return '';

    var elWorkspace = jaxon.$('jaxon_temp_workspace');
    if (!elWorkspace) {
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
};

/*
Function: jaxon.tools.dom.willChange

Tests to see if the specified data is the same as the current value of the element's attribute.

Parameters: 
element - (string or object):
    The element or it's unique name (specified by the ID attribute)
    
attribute - (string):
    The name of the attribute.
    
newData - (string):
    The value to be compared with the current value of the specified element.
    
Returns:

true - The specified value differs from the current attribute value.
false - The specified value is the same as the current value.
*/
jaxon.tools.dom.willChange = function(element, attribute, newData) {
    if ('string' == typeof element)
        element = jaxon.$(element);
    if (element) {
        var oldData;
        eval('oldData=element.' + attribute);
        return (newData != oldData);
    }

    return false;
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
jaxon.tools.form.getValues = function(parent) {
    var submitDisabledElements = false;
    if (arguments.length > 1 && arguments[1] == true)
        submitDisabledElements = true;

    var prefix = '';
    if (arguments.length > 2)
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
            jaxon.tools.form._getValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);

    return aFormValues;
};

/*
Function: jaxon.tools.form._getValues

Used internally by <jaxon.tools.form.getValues> to recursively get the value
of form elements.  This function will extract all form element values 
regardless of the depth of the element within the form.
*/
jaxon.tools.form._getValues = function(aFormValues, children, submitDisabledElements, prefix) {
    var iLen = children.length;
    for (var i = 0; i < iLen; ++i) {
        var child = children[i];
        if (('undefined' != typeof child.childNodes) && (child.type != 'select-one') && (child.type != 'select-multiple'))
            jaxon.tools.form._getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
        jaxon.tools.form._getValue(aFormValues, child, submitDisabledElements, prefix);
    }
};

/*
Function: jaxon.tools.form._getValue

Used internally by <jaxon.tools.form._getValues> to extract a single form value.
This will detect the type of element (radio, checkbox, multi-select) and 
add it's value(s) to the form values array.

Modified version for multidimensional arrays
*/
jaxon.tools.form._getValue = function(aFormValues, child, submitDisabledElements, prefix) {
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
            var sa = a.substr(0, a.indexOf(']') + 1);

            var lk = k; //save last key
            var lp = p; //save last pointer

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
            if (typeof k == 'undefined') {
                /*check against the global aFormValues Stack wich is the next(last) usable index */
                k = 0;
                for (var i in lp[lk]) k++;
            }
            if (typeof p[k] == 'undefined') {

                p[k] = {};
            }
        }
        p[k] = values;
    } else {
        aFormValues[name] = values;
    }
};

/*
Function: jaxon.tools.upload.initialize

Check upload data and initialize the request.
*/
jaxon.tools.upload.initialize = function(oRequest) {
    var input = jaxon.tools.dom.$(oRequest.upload.id);
    if(input == null) {
        console.log('Unable to find input field for file upload with id ' + oRequest.upload.id);
        return false;
    }
    if(input.type != 'file') {
        console.log('The upload input field with id ' + oRequest.upload.id + ' is not of type file');
        return false;
    }
    if(typeof input.name == 'undefined') {
        console.log('The upload input field with id ' + oRequest.upload.id + ' has no name attribute');
        return false;
    }
    oRequest.upload.input = input;
    oRequest.upload.form = input.form;
    // Having the input field is enough for upload with FormData (Ajax).
    if (oRequest.upload.ajax != false)
        return true;
    // For upload with iframe, we need to get the form too.
    if(!input.form) {
        // Find the input form
        var form = input;
        while(form != null && form.nodeName != 'FORM')
            form = form.parentNode;
        if(form == null) {
            console.log('The upload input field with id ' + oRequest.upload.id + ' is not in a form');
            return false;
        }
        oRequest.upload.form = form;
    }
    // If FormData feature is not available, files are uploaded with iframes.
    jaxon.tools.upload.createIframe(oRequest);
    return true;
};

/*
Function: jaxon.tools.upload.createIframe

Create an iframe for file upload.
*/
jaxon.tools.upload.createIframe = function(oRequest) {
    var target = 'jaxon_upload_' + oRequest.upload.id;
    // Delete the iframe, in the case it already exists
    jaxon.dom.node.remove(target);
    // Create the iframe.
    jaxon.dom.node.insert(oRequest.upload.form, 'iframe', target);
    oRequest.upload.iframe = jaxon.tools.dom.$(target);
    oRequest.upload.iframe.name = target;
    oRequest.upload.iframe.style.display = 'none';
    // Set the form attributes
    oRequest.upload.form.method = 'POST';
    oRequest.upload.form.enctype = 'multipart/form-data';
    oRequest.upload.form.action = jaxon.config.requestURI;
    oRequest.upload.form.target = target;
    return true;
};

/*
Function: jaxon.tools.string.stripOnPrefix

Detect, and if found, remove the prefix 'on' from the specified 
string.  This is used while working with event handlers.

Parameters: 

sEventName - (string): The string to be modified.

Returns:

string - The modified string.
*/
jaxon.tools.string.stripOnPrefix = function(sEventName) {
    sEventName = sEventName.toLowerCase();
    if (0 == sEventName.indexOf('on'))
        sEventName = sEventName.replace(/on/, '');

    return sEventName;
};

/*
Function: jaxon.tools.string.addOnPrefix

Detect, and add if not found, the prefix 'on' from the specified 
string.  This is used while working with event handlers.

Parameters: 

sEventName - (string): The string to be modified.

Returns:

string - The modified string.
*/
jaxon.tools.string.addOnPrefix = function(sEventName) {
    sEventName = sEventName.toLowerCase();
    if (0 != sEventName.indexOf('on'))
        sEventName = 'on' + sEventName;

    return sEventName;
};

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
};

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
};

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
};

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
};

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
};

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
};

/*
Function: jaxon.ajax.processor.json

Parse the JSON response into a series of commands.  The commands
are constructed by calling <jaxon.tools.xml.parseAttributes> and 
<jaxon.tools.xml.parseChildren>.

Parameters: 

oRequest - (object):  The request context object.
*/

jaxon.tools.ajax.processFragment = function(nodes, seq, oRet, oRequest) {
    var xx = jaxon;
    var xt = xx.tools;
    for (nodeName in nodes) {
        if ('jxnobj' == nodeName) {
            for (a in nodes[nodeName]) {

                /*
                prevents from using not numbered indexes of 'jxnobj'
                nodes[nodeName][a]= "0" is an valid jaxon response stack item
                nodes[nodeName][a]= "pop" is an method from somewhere but not from jxnobj
                */
                if (parseInt(a) != a) continue;

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
            throw { code: 10004, data: obj.fullName }
    }
    return oRet;
};

/**
 * String functions for Jaxon
 * See http://javascript.crockford.com/remedial.html for more explanation
 */

/**
 * Substiture variables in the string
 *
 * @return string
 */
if (!String.prototype.supplant) {
    String.prototype.supplant = function(o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function(a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}