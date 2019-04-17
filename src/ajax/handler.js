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
            if (command.id)
                command.target = jaxon.$(command.id);
            // process the command
            if (false == jaxon.ajax.handler.call(command)) {
                jaxon.tools.queue.pushFront(jaxon.response, command);
                return false;
            }
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
        var func = jaxon.ajax.handler.handlers[shortName];
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
        var shortName = command.cmd;
        if (jaxon.ajax.handler.handlers[shortName])
            return true;
        return false;
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
        var shortName = command.cmd;
        return jaxon.ajax.handler.handlers[shortName](command);
    }
};

jaxon.ajax.handler.register('rcmplt', function(args) {
    jaxon.ajax.response.complete(args.request);
    return true;
});

jaxon.ajax.handler.register('css', function(args) {
    args.fullName = 'includeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.cmd.style.add(args.data, args.media);
});
jaxon.ajax.handler.register('rcss', function(args) {
    args.fullName = 'removeCSS';
    if ('undefined' == typeof args.media)
        args.media = 'screen';
    return jaxon.cmd.style.remove(args.data, args.media);
});
jaxon.ajax.handler.register('wcss', function(args) {
    args.fullName = 'waitForCSS';
    return jaxon.cmd.style.waitForCSS(args);
});

jaxon.ajax.handler.register('as', function(args) {
    args.fullName = 'assign/clear';
    try {
        return jaxon.cmd.node.assign(args.target, args.prop, args.data);
    } catch (e) {
        // do nothing, if the debug module is installed it will
        // catch and handle the exception
    }
    return true;
});
jaxon.ajax.handler.register('ap', function(args) {
    args.fullName = 'append';
    return jaxon.cmd.node.append(args.target, args.prop, args.data);
});
jaxon.ajax.handler.register('pp', function(args) {
    args.fullName = 'prepend';
    return jaxon.cmd.node.prepend(args.target, args.prop, args.data);
});
jaxon.ajax.handler.register('rp', function(args) {
    args.fullName = 'replace';
    return jaxon.cmd.node.replace(args.id, args.prop, args.data);
});
jaxon.ajax.handler.register('rm', function(args) {
    args.fullName = 'remove';
    return jaxon.cmd.node.remove(args.id);
});
jaxon.ajax.handler.register('ce', function(args) {
    args.fullName = 'create';
    return jaxon.cmd.node.create(args.id, args.data, args.prop);
});
jaxon.ajax.handler.register('ie', function(args) {
    args.fullName = 'insert';
    return jaxon.cmd.node.insert(args.id, args.data, args.prop);
});
jaxon.ajax.handler.register('ia', function(args) {
    args.fullName = 'insertAfter';
    return jaxon.cmd.node.insertAfter(args.id, args.data, args.prop);
});

jaxon.ajax.handler.register('DSR', jaxon.cmd.tree.startResponse);
jaxon.ajax.handler.register('DCE', jaxon.cmd.tree.createElement);
jaxon.ajax.handler.register('DSA', jaxon.cmd.tree.setAttribute);
jaxon.ajax.handler.register('DAC', jaxon.cmd.tree.appendChild);
jaxon.ajax.handler.register('DIB', jaxon.cmd.tree.insertBefore);
jaxon.ajax.handler.register('DIA', jaxon.cmd.tree.insertAfter);
jaxon.ajax.handler.register('DAT', jaxon.cmd.tree.appendText);
jaxon.ajax.handler.register('DRC', jaxon.cmd.tree.removeChildren);
jaxon.ajax.handler.register('DER', jaxon.cmd.tree.endResponse);

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
jaxon.ajax.handler.register('al', function(args) {
    args.fullName = 'alert';
    alert(args.data);
    return true;
});
jaxon.ajax.handler.register('cc', jaxon.cmd.script.confirmCommands);

jaxon.ajax.handler.register('ci', jaxon.cmd.form.createInput);
jaxon.ajax.handler.register('ii', jaxon.cmd.form.insertInput);
jaxon.ajax.handler.register('iia', jaxon.cmd.form.insertInputAfter);

jaxon.ajax.handler.register('ev', jaxon.cmd.event.setEvent);

jaxon.ajax.handler.register('ah', jaxon.cmd.event.addHandler);
jaxon.ajax.handler.register('rh', jaxon.cmd.event.removeHandler);

jaxon.ajax.handler.register('dbg', function(args) {
    args.fullName = 'debug message';
    console.log(args.data);
    return true;
});
