jaxon.cmd.event = {
    /*
    Function: jaxon.cmd.event.setEvent

    Set an event handler.

    Parameters:

    command - (object): Response command object.
    - id: Element ID
    - prop: Event
    - data: Code

    Returns:

    true - The operation completed successfully.
    */
    setEvent: function(command) {
        command.fullName = 'setEvent';
        const target = command.id;
        const sEvent = command.prop;
        const code = command.data;
        // force to get the target
        if (typeof target === 'string')
            target = jaxon.$(target);
        sEvent = jaxon.tools.string.addOnPrefix(sEvent);
        code = jaxon.tools.string.doubleQuotes(code);
        eval('target.' + sEvent + ' = function(e) { ' + code + '; }');
        return true;
    },

    /*
    Function: jaxon.cmd.event.addHandler

    Add an event handler to the specified target.

    Parameters:

    command - (object): Response command object.
    - id: The id of, or the target itself
    - prop: The name of the event.
    - data: The name of the function to be called

    Returns:

    true - The operation completed successfully.
    */
    addHandler: function(command) {
        if (window.addEventListener) {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                const target = command.id;
                const sEvent = command.prop;
                const sFuncName = command.data;
                if (typeof target === 'string')
                    target = jaxon.$(target);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                eval('target.addEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                const target = command.id;
                const sEvent = command.prop;
                const sFuncName = command.data;
                if (typeof target === 'string')
                    target = jaxon.$(target);
                sEvent = jaxon.tools.string.addOnPrefix(sEvent);
                eval('target.attachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.addHandler(command);
    },

    /*
    Function: jaxon.cmd.event.removeHandler

    Remove an event handler from an target.

    Parameters:

    command - (object): Response command object.
    - id: The id of, or the target itself
    - prop: The name of the event.
    - data: The name of the function to be removed

    Returns:

    true - The operation completed successfully.
    */
    removeHandler: function(command) {
        if (window.removeEventListener) {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                const target = command.id;
                const sEvent = command.prop;
                const sFuncName = command.data;
                if (typeof target === 'string')
                    target = jaxon.$(target);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                eval('target.removeEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                const target = command.id;
                const sEvent = command.prop;
                const sFuncName = command.data;
                if (typeof target === 'string')
                    target = jaxon.$(target);
                sEvent = jaxon.tools.string.addOnPrefix(sEvent);
                eval('target.detachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.removeHandler(command);
    }
};
