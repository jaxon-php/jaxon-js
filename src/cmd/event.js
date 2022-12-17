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
        const sEvent = jaxon.tools.string.addOnPrefix(command.prop);
        const sCode = jaxon.tools.string.doubleQuotes(command.data);
        // force to get the target
        const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
        eval('oTarget.' + sEvent + ' = function(e) { ' + sCode + '; }');
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
                const sFuncName = command.data;
                const sEvent = jaxon.tools.string.stripOnPrefix(command.prop);
                // force to get the target
                const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
                eval('oTarget.addEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                const sFuncName = command.data;
                const sEvent = jaxon.tools.string.addOnPrefix(command.prop);
                // force to get the target
                const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
                eval('oTarget.attachEvent("' + sEvent + '", ' + sFuncName + ', false);');
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
                const sFuncName = command.data;
                const sEvent = jaxon.tools.string.stripOnPrefix(command.prop);
                // force to get the target
                const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
                eval('oTarget.removeEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                const sFuncName = command.data;
                const sEvent = jaxon.tools.string.addOnPrefix(command.prop);
                // force to get the target
                const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
                eval('oTarget.detachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.removeHandler(command);
    }
};
