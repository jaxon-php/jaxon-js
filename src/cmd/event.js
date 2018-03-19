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
        var element = command.id;
        var sEvent = command.prop;
        var code = command.data;
        //force to get the element 
        if ('string' == typeof element)
            element = jaxon.$(element);
        sEvent = jaxon.tools.string.addOnPrefix(sEvent);
        code = jaxon.tools.string.doubleQuotes(code);
        eval('element.' + sEvent + ' = function(e) { ' + code + '; }');
        return true;
    },

    /*
    Function: jaxon.cmd.event.addHandler

    Add an event handler to the specified element.

    Parameters:

    command - (object): Response command object.
    - id: The id of, or the element itself
    - prop: The name of the event.
    - data: The name of the function to be called

    Returns:

    true - The operation completed successfully.
    */
    addHandler: function(command) {
        if (window.addEventListener) {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                eval('element.addEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.addOnPrefix(sEvent);
                eval('element.attachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.addHandler(command);
    },

    /*
    Function: jaxon.cmd.event.removeHandler

    Remove an event handler from an element.

    Parameters:

    command - (object): Response command object.
    - id: The id of, or the element itself
    - prop: The name of the event.
    - data: The name of the function to be removed

    Returns:

    true - The operation completed successfully.
    */
    removeHandler: function(command) {
        if (window.removeEventListener) {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                eval('element.removeEventListener("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        } else {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.addOnPrefix(sEvent);
                eval('element.detachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.removeHandler(command);
    }
};