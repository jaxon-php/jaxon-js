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
    if ('undefined' == typeof command.media)
        command.media = 'screen';
    return jaxon.cmd.style.add(command.data, command.media);
});
jaxon.ajax.handler.register('rcss', function(command) {
    command.fullName = 'removeCSS';
    if ('undefined' == typeof command.media)
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
