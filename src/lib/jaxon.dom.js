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
            if (jaxon.tools.dom.willChange(element, property, data))
                eval('element.' + property + ' = data;');
            break;
    }
    return true;
};

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
};

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
};

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
        sSearch = jaxon.tools.dom.getBrowserHTML(sSearch);

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
        } else if (jaxon.tools.dom.willChange(element, sAttribute, newTxt)) {
            eval('element.' + sAttribute + '=newTxt;');
        }
    }
    return true;
};

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
};

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
};

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
};

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
};

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
};

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
};

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
};

jaxon.dom.response.startResponse = function(args) {
    jxnElm = [];
};

jaxon.dom.response.createElement = function(args) {
    eval(
        [args.tgt, ' = document.createElement(args.data)']
        .join('')
    );
};

jaxon.dom.response.setAttribute = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [args.tgt, '.setAttribute(args.key, args.data)']
            .join('')
        );
    }
    args.context.jaxonDelegateCall();
};

jaxon.dom.response.appendChild = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [args.par, '.appendChild(', args.data, ')']
            .join('')
        );
    }
    args.context.jaxonDelegateCall();
};

jaxon.dom.response.insertBefore = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [args.tgt, '.parentNode.insertBefore(', args.data, ', ', args.tgt, ')']
            .join('')
        );
    }
    args.context.jaxonDelegateCall();
};

jaxon.dom.response.insertAfter = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [args.tgt, 'parentNode.insertBefore(', args.data, ', ', args.tgt, '.nextSibling)']
            .join('')
        );
    }
    args.context.jaxonDelegateCall();
};

jaxon.dom.response.appendText = function(args) {
    args.context.jaxonDelegateCall = function() {
        eval(
            [args.par, '.appendChild(document.createTextNode(args.data))']
            .join('')
        );
    }
    args.context.jaxonDelegateCall();
};

jaxon.dom.response.removeChildren = function(args) {
    var skip = args.skip || 0;
    var remove = args.remove || -1;
    var element = null;
    args.context.jaxonDelegateCall = function() {
        eval(['element = ', args.data].join(''));
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
};

jaxon.dom.response.endResponse = function(args) {
    jxnElm = [];
};

/*
Function: jaxon.dom.events.setEvent

Set an event handler.

Parameters:

command - (object): Response command object.
- id: Element ID
- prop: Event
- data: Code    

Returns:

true - The operation completed successfully.
*/
jaxon.dom.events.setEvent = function(command) {
    command.fullName = 'setEvent';
    var element = command.id;
    var sEvent = command.prop;
    var code = command.data;
    //force to get the element 
    element = jaxon.$(element);
    sEvent = jaxon.tools.string.addOnPrefix(sEvent);
    code = jaxon.tools.string.doubleQuotes(code);
    eval('element.' + sEvent + ' = function(e) { ' + code + '; }');
    return true;
};

/*
Function: jaxon.dom.events.addHandler

Add an event handler to the specified element.

Parameters:

element - (string or object):  The name of, or the element itself
    which will have the event handler assigned.
sEvent - (string):  The name of the event.
fun - (string):  The function to be called.

Returns:

true - The operation completed successfully.
*/
jaxon.dom.events.addHandler = function(element, sEvent, fun) {
    if (window.addEventListener) {
        jaxon.dom.events.addHandler = function(command) {
            command.fullName = 'addHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
            eval('element.addEventListener("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    } else {
        jaxon.dom.events.addHandler = function(command) {
            command.fullName = 'addHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.string.addOnPrefix(sEvent);
            eval('element.attachEvent("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    }
    return jaxon.dom.events.addHandler(element, sEvent, fun);
};

/*
Function: jaxon.dom.events.removeHandler

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
jaxon.dom.events.removeHandler = function(element, sEvent, fun) {
    if (window.removeEventListener) {
        jaxon.dom.events.removeHandler = function(command) {
            command.fullName = 'removeHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
            eval('element.removeEventListener("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    } else {
        jaxon.dom.events.removeHandler = function(command) {
            command.fullName = 'removeHandler';
            var element = command.id;
            var sEvent = command.prop;
            var fun = command.data;
            if ('string' == typeof element)
                element = jaxon.$(element);
            sEvent = jaxon.tools.string.addOnPrefix(sEvent);
            eval('element.detachEvent("' + sEvent + '", ' + fun + ', false);');
            return true;
        }
    }
    return jaxon.dom.events.removeHandler(element, sEvent, fun);
};

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
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
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