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
};

/*
Function: jaxon.command.handler.execute 

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
jaxon.command.handler.execute = function(command) {
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
};

/*
Function: jaxon.command.callback.create

Create a blank callback object.  Two optional arguments let you 
set the delay time for the onResponseDelay and onExpiration events.

Returns:

object - The callback object.
*/
jaxon.command.callback.create = function() {
    var xx = jaxon;
    var xc = xx.config;
    var xcb = xx.command.callback;

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
Function: jaxon.command.callback.setupTimer

Create a timer to fire an event in the future.  This will
be used fire the onRequestDelay and onExpiration events.

Parameters:

iDelay - (integer):  The amount of time in milliseconds to delay.

Returns:

object - A callback timer object.
*/
jaxon.command.callback.setupTimer = function(iDelay) {
    return { timer: null, delay: iDelay };
};

/*
Function: jaxon.command.callback.clearTimer

Clear a callback timer for the specified function.

Parameters:

oCallback - (object):  The callback object (or objects) that
    contain the specified function timer to be cleared.
sFunction - (string):  The name of the function associated
    with the timer to be cleared.
*/
jaxon.command.callback.clearTimer = function(oCallback, sFunction) {
    if ('undefined' != typeof oCallback.timers) {
        if ('undefined' != typeof oCallback.timers[sFunction]) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    } else if ('object' == typeof oCallback) {
        var iLen = oCallback.length;
        for (var i = 0; i < iLen; ++i)
            jaxon.command.callback.clearTimer(oCallback[i], sFunction);
    }
};

/*
Function: jaxon.command.callback.execute

Execute a callback event.

Parameters:

oCallback - (object):  The callback object (or objects) which 
    contain the event handlers to be executed.
sFunction - (string):  The name of the event to be triggered.
args - (object):  The request object for this request.
*/
jaxon.command.callback.execute = function(oCallback, sFunction, args) {
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
            jaxon.command.callback.execute(oCallback[i], sFunction, args);
    }
};

/*
Function: jaxon.command.handler.register

Registers a new command handler.
*/
jaxon.command.handler.register = function(shortName, func) {
    jaxon.command.handler.handlers[shortName] = func;
};

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
};

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
};

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
};

jaxon.command.handler.register('rcmplt', function(args) {
    jaxon.ajax.response.complete(args.request);
    return true;
});

jaxon.command.handler.register('css', function(args) {
    args.fullName = 'includeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.html.css.add(args.data, args.media);
});
jaxon.command.handler.register('rcss', function(args) {
    args.fullName = 'removeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.html.css.remove(args.data, args.media);
});
jaxon.command.handler.register('wcss', function(args) {
    args.fullName = 'waitForCSS';
    return jaxon.html.css.waitForCSS(args);
});

jaxon.command.handler.register('as', function(args) {
    args.fullName = 'assign/clear';
    try {
        return jaxon.dom.node.assign(args.target, args.prop, args.data);
    } catch (e) {
        // do nothing, if the debug module is installed it will
        // catch and handle the exception
    }
    return true;
});
jaxon.command.handler.register('ap', function(args) {
    args.fullName = 'append';
    return jaxon.dom.node.append(args.target, args.prop, args.data);
});
jaxon.command.handler.register('pp', function(args) {
    args.fullName = 'prepend';
    return jaxon.dom.node.prepend(args.target, args.prop, args.data);
});
jaxon.command.handler.register('rp', function(args) {
    args.fullName = 'replace';
    return jaxon.dom.node.replace(args.id, args.prop, args.data);
});
jaxon.command.handler.register('rm', function(args) {
    args.fullName = 'remove';
    return jaxon.dom.node.remove(args.id);
});
jaxon.command.handler.register('ce', function(args) {
    args.fullName = 'create';
    return jaxon.dom.node.create(args.id, args.data, args.prop);
});
jaxon.command.handler.register('ie', function(args) {
    args.fullName = 'insert';
    return jaxon.dom.node.insert(args.id, args.data, args.prop);
});
jaxon.command.handler.register('ia', function(args) {
    args.fullName = 'insertAfter';
    return jaxon.dom.node.insertAfter(args.id, args.data, args.prop);
});

jaxon.command.handler.register('DSR', jaxon.dom.response.startResponse);
jaxon.command.handler.register('DCE', jaxon.dom.response.createElement);
jaxon.command.handler.register('DSA', jaxon.dom.response.setAttribute);
jaxon.command.handler.register('DAC', jaxon.dom.response.appendChild);
jaxon.command.handler.register('DIB', jaxon.dom.response.insertBefore);
jaxon.command.handler.register('DIA', jaxon.dom.response.insertAfter);
jaxon.command.handler.register('DAT', jaxon.dom.response.appendText);
jaxon.command.handler.register('DRC', jaxon.dom.response.removeChildren);
jaxon.command.handler.register('DER', jaxon.dom.response.endResponse);

jaxon.command.handler.register('c:as', jaxon.dom.node.contextAssign);
jaxon.command.handler.register('c:ap', jaxon.dom.node.contextAppend);
jaxon.command.handler.register('c:pp', jaxon.dom.node.contextPrepend);

jaxon.command.handler.register('s', jaxon.html.js.sleep);
jaxon.command.handler.register('ino', jaxon.html.js.includeScriptOnce);
jaxon.command.handler.register('in', jaxon.html.js.includeScript);
jaxon.command.handler.register('rjs', jaxon.html.js.removeScript);
jaxon.command.handler.register('wf', jaxon.html.js.waitFor);
jaxon.command.handler.register('js', jaxon.html.js.execute);
jaxon.command.handler.register('jc', jaxon.html.js.call);
jaxon.command.handler.register('sf', jaxon.html.js.setFunction);
jaxon.command.handler.register('wpf', jaxon.html.js.wrapFunction);
jaxon.command.handler.register('al', function(args) {
    args.fullName = 'alert';
    alert(args.data);
    return true;
});
jaxon.command.handler.register('cc', jaxon.html.js.confirmCommands);

jaxon.command.handler.register('ci', jaxon.html.forms.createInput);
jaxon.command.handler.register('ii', jaxon.html.forms.insertInput);
jaxon.command.handler.register('iia', jaxon.html.forms.insertInputAfter);

jaxon.command.handler.register('ev', jaxon.dom.events.setEvent);

jaxon.command.handler.register('ah', jaxon.dom.events.addHandler);
jaxon.command.handler.register('rh', jaxon.dom.events.removeHandler);

jaxon.command.handler.register('dbg', function(args) {
    args.fullName = 'debug message';
    return true;
});