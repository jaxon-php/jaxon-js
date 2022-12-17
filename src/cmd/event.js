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
        oTarget[sEvent] = new Function('e', sCode);
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
        command.fullName = 'addHandler';
        const sFuncName = command.data;
        const sEvent = jaxon.cmd.event.getName(command.prop);
        // force to get the target
        const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
        return jaxon.cmd.event._addHandler(oTarget, sEvent, sFuncName);
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
        command.fullName = 'removeHandler';
        const sFuncName = command.data;
        const sEvent = jaxon.cmd.event.getName(command.prop);
        // force to get the target
        const oTarget = (typeof command.id === 'string') ? jaxon.$(command.id) : command.id;
        return jaxon.cmd.event._removeHandler(oTarget, sEvent, sFuncName);
    }
};

if(window.addEventListener) {
    jaxon.cmd.event.getName = function(event) {
        return jaxon.tools.string.stripOnPrefix(event);
    };

    jaxon.cmd.event._addHandler = function(target, event, func) {
        target.addEventListener(event, window[func], false);
        return true;
    };

    jaxon.cmd.event._removeHandler = function(target, event, func) {
        target.removeEventListener(event, window[func], false);
        return true;
    };
} else {
    jaxon.cmd.event.getName = function(event) {
        return jaxon.tools.string.addOnPrefix(event);
    };

    jaxon.cmd.event._addHandler = function(target, event, func) {
        target.attachEvent(event, window[func]);
        return true;
    };

    jaxon.cmd.event._removeHandler = function(target, event, func) {
        target.detachEvent(event, window[func]);
        return true;
    };
}
