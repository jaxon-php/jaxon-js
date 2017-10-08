/*
Function: jaxon.html.js.includeScriptOnce

Add a reference to the specified script file if one does not
already exist in the HEAD of the current document.

This will effecitvely cause the script file to be loaded in
the browser.

Parameters: 

fileName - (string):  The URI of the file.

Returns:

true - The reference exists or was added.
*/
jaxon.html.js.includeScriptOnce = function(command) {
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
    return jaxon.html.js.includeScript(command);
};

/*
Function: jaxon.html.js.includeScript

Adds a SCRIPT tag referencing the specified file.  This
effectively causes the script to be loaded in the browser.

Parameters: 

command (object) - Xajax response object

Returns:

true - The reference was added.
*/
jaxon.html.js.includeScript = function(command) {
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
};

/*
Function: jaxon.html.js.removeScript

Locates a SCRIPT tag in the HEAD of the document which references
the specified file and removes it.

Parameters: 

command (object) - Xajax response object
        
Returns:

true - The script was not found or was removed.
*/
jaxon.html.js.removeScript = function(command) {
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
                    jaxon.html.js.execute(args);
                }
                var parent = script.parentNode;
                parent.removeChild(script);
            }
        }
    }
    return true;
};

/*
Function: jaxon.html.js.sleep

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
jaxon.html.js.sleep = function(command) {
    command.fullName = 'sleep';
    // inject a delay in the queue processing
    // handle retry counter
    if (jaxon.tools.queue.retry(command, command.prop)) {
        jaxon.ajax.response.setWakeup(jaxon.response, 100);
        return false;
    }
    // wake up, continue processing queue
    return true;
};

/*
Function: jaxon.html.js.confirmCommands

Prompt the user with the specified text, if the user responds by clicking
cancel, then skip the specified number of commands in the response command
queue.  If the user clicks Ok, the command processing resumes normal
operation.

Parameters:

 command (object) - jaxon response object
     
Returns:

true - The operation completed successfully.
*/
jaxon.html.js.confirmCommands = function(command) {
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
};

/*
Function: jaxon.html.js.execute

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
jaxon.html.js.execute = function(args) {
    args.fullName = 'execute Javascript';
    var returnValue = true;
    args.context = args.context ? args.context : {};
    args.context.jaxonDelegateCall = function() {
        eval(args.data);
    };
    args.context.jaxonDelegateCall();
    return returnValue;
};

/*
Function: jaxon.html.js.waitFor

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
jaxon.html.js.waitFor = function(args) {
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
    } catch (e) {}
    if (false == bResult) {
        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.tools.queue.retry(args, args.prop)) {
            jaxon.ajax.response.setWakeup(jaxon.response, 100);
            return false;
        }
        // give up, continue processing queue
    }
    return true;
};

/*
Function: jaxon.html.js.call

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
jaxon.html.js.call = function(args) {
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
};

/*
Function: jaxon.html.js.setFunction

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
jaxon.html.js.setFunction = function(args) {
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
};

/*
Function: jaxon.html.js.wrapFunction

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
jaxon.html.js.wrapFunction = function(args) {
    args.fullName = 'wrapFunction';

    var code = new Array();
    code.push(args.func);
    code.push(' = jaxon.html.js.makeWrapper(');
    code.push(args.func);
    code.push(', args.prop, args.data, args.type, args.context);');
    args.context.jaxonDelegateCall = function() {
        eval(code.join(''));
    }
    args.context.jaxonDelegateCall();
    return true;
};

/*
Function: jaxon.html.js.makeWrapper


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
jaxon.html.js.makeWrapper = function(origFun, args, codeBlocks, returnVariable, context) {
    var originalCall = '';
    if (0 < returnVariable.length) {
        originalCall += returnVariable;
        originalCall += ' = ';
    }
    var originalCall = 'origFun(';
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
};

/*
Function: jaxon.html.css.add

Add a LINK reference to the specified .css file if it does not
already exist in the HEAD of the current document.

Parameters:

filename - (string):  The URI of the .css file to reference.

media - (string):  The media type of the css file (print/screen/handheld,..)

Returns:

true - The operation completed successfully.
*/
jaxon.html.css.add = function(fileName, media) {
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
};

/*
Function: jaxon.html.css.remove

Locate and remove a LINK reference from the current document's
HEAD.

Parameters:

filename - (string):  The URI of the .css file.

Returns:

true - The operation completed successfully.
*/
jaxon.html.css.remove = function(fileName, media) {
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
};

/*
Function: jaxon.html.css.waitForCSS

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
jaxon.html.css.waitForCSS = function(args) {
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
            } catch (e) {}
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
            jaxon.ajax.response.setWakeup(jaxon.response, 10);
            return false;
        }
        // give up, continue processing queue
    }
    return true;
};

/*
Function: jaxon.html.forms.getInput

Create and return a form input element with the specified parameters.

Parameters:

type - (string):  The type of input element desired.
name - (string):  The value to be assigned to the name attribute.
id - (string):  The value to be assigned to the id attribute.

Returns:

object - The new input element.
*/
jaxon.html.forms.getInput = function(type, name, id) {
    if ('undefined' == typeof window.addEventListener) {
        jaxon.html.forms.getInput = function(type, name, id) {
            return jaxon.config.baseDocument.createElement('<input type="' + type + '" name="' + name + '" id="' + id + '">');
        }
    } else {
        jaxon.html.forms.getInput = function(type, name, id) {
            var oDoc = jaxon.config.baseDocument;
            var Obj = oDoc.createElement('input');
            Obj.setAttribute('type', type);
            Obj.setAttribute('name', name);
            Obj.setAttribute('id', id);
            return Obj;
        }
    }
    return jaxon.html.forms.getInput(type, name, id);
};

/*
Function: jaxon.html.forms.createInput

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
jaxon.html.forms.createInput = function(command) {
    command.fullName = 'createInput';
    var objParent = command.id;

    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objParent)
        objParent = jaxon.$(objParent);
    var target = jaxon.html.forms.getInput(sType, sName, sId);
    if (objParent && target) {
        objParent.appendChild(target);
    }
    return true;
};

/*
Function: jaxon.html.forms.insertInput

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
jaxon.html.forms.insertInput = function(command) {
    command.fullName = 'insertInput';
    var objSibling = command.id;
    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.html.forms.getInput(sType, sName, sId);
    if (target && objSibling && objSibling.parentNode)
        objSibling.parentNode.insertBefore(target, objSibling);
    return true;
};

/*
Function: jaxon.html.forms.insertInputAfter

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
jaxon.html.forms.insertInputAfter = function(command) {
    command.fullName = 'insertInputAfter';
    var objSibling = command.id;
    var sType = command.type;
    var sName = command.data;
    var sId = command.prop;
    if ('string' == typeof objSibling)
        objSibling = jaxon.$(objSibling);
    var target = jaxon.html.forms.getInput(sType, sName, sId);
    if (target && objSibling && objSibling.parentNode)
        objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
    return true;
};