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
        element = jaxon.$(element);
        sEvent = jaxon.tools.string.addOnPrefix(sEvent);
        code = jaxon.tools.string.doubleQuotes(code);
        element[sEvent] = new Function(code);
        // eval('element.' + sEvent + ' = function(e) { ' + code + '; }');
        return true;
    },

    /*
    Function: jaxon.cmd.event.addHandler

    Add an event handler to the specified element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        which will have the event handler assigned.
    sEvent - (string):  The name of the event.
    sFuncName - (string):  The function to be called.

    Returns:

    true - The operation completed successfully.
    */
    addHandler: function(element, sEvent, sFuncName) {
        if (window.addEventListener) {
            jaxon.cmd.event.addHandler = function(command) {
                command.fullName = 'addHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                element.addEventListener(sEvent, window[sFuncName], false);
                // eval('element.addEventListener("' + sEvent + '", ' + sFuncName + ', false);');
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
                return element.attachEvent(sEvent, window[sFuncName]);
                // eval('element.attachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                // return true;
            }
        }
        return jaxon.cmd.event.addHandler(element, sEvent, sFuncName);
    },

    /*
    Function: jaxon.cmd.event.removeHandler

    Remove an event handler from an element.

    Parameters:

    element - (string or object):  The name of, or the element itself which will have the event handler removed.
    event - (string):  The name of the event for which this handler is associated.
    sFuncName - The function to be removed.

    Returns:

    true - The operation completed successfully.
    */
    removeHandler: function(element, sEvent, sFuncName) {
        if (window.removeEventListener) {
            jaxon.cmd.event.removeHandler = function(command) {
                command.fullName = 'removeHandler';
                var element = command.id;
                var sEvent = command.prop;
                var sFuncName = command.data;
                if ('string' == typeof element)
                    element = jaxon.$(element);
                sEvent = jaxon.tools.string.stripOnPrefix(sEvent);
                element.removeEventListener(sEvent, window[sFuncName], false);
                // eval('element.removeEventListener("' + sEvent + '", ' + sFuncName + ', false);');
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
                element.detachEvent(sEvent, window[sFuncName]);
                // eval('element.detachEvent("' + sEvent + '", ' + sFuncName + ', false);');
                return true;
            }
        }
        return jaxon.cmd.event.removeHandler(element, sEvent, sFuncName);
    }
};