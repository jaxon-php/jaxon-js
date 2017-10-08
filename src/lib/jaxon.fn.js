/*
Function: jaxon.fn.handler.execute 

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
jaxon.fn.handler.execute = function(command) {
    if (jaxon.fn.handler.isRegistered(command)) {
        // it is important to grab the element here as the previous command
        // might have just created the element
        if (command.id)
            command.target = jaxon.$(command.id);
        // process the command
        if (false == jaxon.fn.handler.call(command)) {
            jaxon.tools.queue.pushFront(jaxon.response, command);
            return false;
        }
    }
    return true;
};

/*
Function: jaxon.fn.callback.create

Create a blank callback object.  Two optional arguments let you 
set the delay time for the onResponseDelay and onExpiration events.

Returns:

object - The callback object.
*/
jaxon.fn.callback.create = function() {
    var xx = jaxon;
    var xc = xx.config;
    var xcb = xx.fn.callback;

    var oCB = {}
    oCB.timers = {};

    oCB.timers.onResponseDelay = xcb.setupTimer(
        (arguments.length > 0) ?
        arguments[0] :
        xc.defaultResponseDelayTime);

    oCB.timers.onExpiration = xcb.setupTimer(
        (arguments.length > 1) ?
        arguments[1] :
        xc.defaultExpirationTime);

    oCB.onRequest = null;
    oCB.onResponseDelay = null;
    oCB.onExpiration = null;
    oCB.beforeResponseProcessing = null;
    oCB.onFailure = null;
    oCB.onRedirect = null;
    oCB.onSuccess = null;
    oCB.onComplete = null;

    return oCB;
};

/*
Function: jaxon.fn.callback.setupTimer

Create a timer to fire an event in the future.  This will
be used fire the onRequestDelay and onExpiration events.

Parameters:

iDelay - (integer):  The amount of time in milliseconds to delay.

Returns:

object - A callback timer object.
*/
jaxon.fn.callback.setupTimer = function(iDelay) {
    return { timer: null, delay: iDelay };
};

/*
Function: jaxon.fn.callback.clearTimer

Clear a callback timer for the specified function.

Parameters:

oCallback - (object):  The callback object (or objects) that
    contain the specified function timer to be cleared.
sFunction - (string):  The name of the function associated
    with the timer to be cleared.
*/
jaxon.fn.callback.clearTimer = function(oCallback, sFunction) {
    if ('undefined' != typeof oCallback.timers) {
        if ('undefined' != typeof oCallback.timers[sFunction]) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    } else if ('object' == typeof oCallback) {
        var iLen = oCallback.length;
        for (var i = 0; i < iLen; ++i)
            jaxon.fn.callback.clearTimer(oCallback[i], sFunction);
    }
};

/*
Function: jaxon.fn.callback.execute

Execute a callback event.

Parameters:

oCallback - (object):  The callback object (or objects) which 
    contain the event handlers to be executed.
sFunction - (string):  The name of the event to be triggered.
args - (object):  The request object for this request.
*/
jaxon.fn.callback.execute = function(oCallback, sFunction, args) {
    if ('undefined' != typeof oCallback[sFunction]) {
        var func = oCallback[sFunction];
        if ('function' == typeof func) {
            if ('undefined' != typeof oCallback.timers[sFunction]) {
                oCallback.timers[sFunction].timer = setTimeout(function() {
                    func(args);
                }, oCallback.timers[sFunction].delay);
            } else {
                func(args);
            }
        }
    } else if ('object' == typeof oCallback) {
        var iLen = oCallback.length;
        for (var i = 0; i < iLen; ++i)
            jaxon.fn.callback.execute(oCallback[i], sFunction, args);
    }
};

/*
Function: jaxon.fn.handler.register

Registers a new command handler.
*/
jaxon.fn.handler.register = function(shortName, func) {
    jaxon.fn.handler.handlers[shortName] = func;
};

/*
Function: jaxon.fn.handler.unregister

Unregisters and returns a command handler.

Parameters:
    shortName - (string): The name of the command handler.
    
Returns:
    func - (function): The unregistered function.
*/
jaxon.fn.handler.unregister = function(shortName) {
    var func = jaxon.fn.handler.handlers[shortName];
    delete jaxon.fn.handler.handlers[shortName];
    return func;
};

/*
Function: jaxon.fn.handler.isRegistered


Parameters:
    command - (object):
        - cmd: The Name of the function.

Returns:

boolean - (true or false): depending on whether a command handler has 
been created for the specified command (object).
    
*/
jaxon.fn.handler.isRegistered = function(command) {
    var shortName = command.cmd;
    if (jaxon.fn.handler.handlers[shortName])
        return true;
    return false;
};

/*
Function: jaxon.fn.handler.call

Calls the registered command handler for the specified command
(you should always check isRegistered before calling this function)

Parameters:
    command - (object):
        - cmd: The Name of the function.

Returns:
    true - (boolean) :
*/
jaxon.fn.handler.call = function(command) {
    var shortName = command.cmd;
    return jaxon.fn.handler.handlers[shortName](command);
};

jaxon.fn.handler.register('rcmplt', function(args) {
    jaxon.ajax.response.complete(args.request);
    return true;
});

jaxon.fn.handler.register('css', function(args) {
    args.fullName = 'includeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.html.css.add(args.data, args.media);
});
jaxon.fn.handler.register('rcss', function(args) {
    args.fullName = 'removeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.html.css.remove(args.data, args.media);
});
jaxon.fn.handler.register('wcss', function(args) {
    args.fullName = 'waitForCSS';
    return jaxon.html.css.waitForCSS(args);
});

jaxon.fn.handler.register('as', function(args) {
    args.fullName = 'assign/clear';
    try {
        return jaxon.dom.node.assign(args.target, args.prop, args.data);
    } catch (e) {
        // do nothing, if the debug module is installed it will
        // catch and handle the exception
    }
    return true;
});
jaxon.fn.handler.register('ap', function(args) {
    args.fullName = 'append';
    return jaxon.dom.node.append(args.target, args.prop, args.data);
});
jaxon.fn.handler.register('pp', function(args) {
    args.fullName = 'prepend';
    return jaxon.dom.node.prepend(args.target, args.prop, args.data);
});
jaxon.fn.handler.register('rp', function(args) {
    args.fullName = 'replace';
    return jaxon.dom.node.replace(args.id, args.prop, args.data);
});
jaxon.fn.handler.register('rm', function(args) {
    args.fullName = 'remove';
    return jaxon.dom.node.remove(args.id);
});
jaxon.fn.handler.register('ce', function(args) {
    args.fullName = 'create';
    return jaxon.dom.node.create(args.id, args.data, args.prop);
});
jaxon.fn.handler.register('ie', function(args) {
    args.fullName = 'insert';
    return jaxon.dom.node.insert(args.id, args.data, args.prop);
});
jaxon.fn.handler.register('ia', function(args) {
    args.fullName = 'insertAfter';
    return jaxon.dom.node.insertAfter(args.id, args.data, args.prop);
});

jaxon.fn.handler.register('DSR', jaxon.dom.tree.startResponse);
jaxon.fn.handler.register('DCE', jaxon.dom.tree.createElement);
jaxon.fn.handler.register('DSA', jaxon.dom.tree.setAttribute);
jaxon.fn.handler.register('DAC', jaxon.dom.tree.appendChild);
jaxon.fn.handler.register('DIB', jaxon.dom.tree.insertBefore);
jaxon.fn.handler.register('DIA', jaxon.dom.tree.insertAfter);
jaxon.fn.handler.register('DAT', jaxon.dom.tree.appendText);
jaxon.fn.handler.register('DRC', jaxon.dom.tree.removeChildren);
jaxon.fn.handler.register('DER', jaxon.dom.tree.endResponse);

jaxon.fn.handler.register('c:as', jaxon.dom.node.contextAssign);
jaxon.fn.handler.register('c:ap', jaxon.dom.node.contextAppend);
jaxon.fn.handler.register('c:pp', jaxon.dom.node.contextPrepend);

jaxon.fn.handler.register('s', jaxon.html.js.sleep);
jaxon.fn.handler.register('ino', jaxon.html.js.includeScriptOnce);
jaxon.fn.handler.register('in', jaxon.html.js.includeScript);
jaxon.fn.handler.register('rjs', jaxon.html.js.removeScript);
jaxon.fn.handler.register('wf', jaxon.html.js.waitFor);
jaxon.fn.handler.register('js', jaxon.html.js.execute);
jaxon.fn.handler.register('jc', jaxon.html.js.call);
jaxon.fn.handler.register('sf', jaxon.html.js.setFunction);
jaxon.fn.handler.register('wpf', jaxon.html.js.wrapFunction);
jaxon.fn.handler.register('al', function(args) {
    args.fullName = 'alert';
    alert(args.data);
    return true;
});
jaxon.fn.handler.register('cc', jaxon.html.js.confirmCommands);

jaxon.fn.handler.register('ci', jaxon.html.forms.createInput);
jaxon.fn.handler.register('ii', jaxon.html.forms.insertInput);
jaxon.fn.handler.register('iia', jaxon.html.forms.insertInputAfter);

jaxon.fn.handler.register('ev', jaxon.dom.events.setEvent);

jaxon.fn.handler.register('ah', jaxon.dom.events.addHandler);
jaxon.fn.handler.register('rh', jaxon.dom.events.removeHandler);

jaxon.fn.handler.register('dbg', function(args) {
    args.fullName = 'debug message';
    return true;
});