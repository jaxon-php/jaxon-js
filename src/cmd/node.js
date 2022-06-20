jaxon.cmd.node = {
    /*
    Function: jaxon.cmd.node.assign

    Assign an element's attribute to the specified value.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to set.
    data - (string):  The new value to be applied.

    Returns:

    true - The operation completed successfully.
    */
    assign: function(element, property, data) {
        if ('string' == typeof element)
            element = jaxon.$(element);

        switch (property) {
            case 'innerHTML':
                element.innerHTML = data;
                break;
            case 'outerHTML':
                if ('undefined' == typeof element.outerHTML) {
                    const r = jaxon.config.baseDocument.createRange();
                    r.setStartBefore(element);
                    const df = r.createContextualFragment(data);
                    element.parentNode.replaceChild(df, element);
                } else element.outerHTML = data;
                break;
            default:
                if (jaxon.tools.dom.willChange(element, property, data))
                    eval('element.' + property + ' = data;');
                break;
        }
        return true;
    },

    /*
    Function: jaxon.cmd.node.append

    Append the specified value to an element's attribute.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute to append to.
    data - (string):  The new value to be appended.

    Returns:

    true - The operation completed successfully.
    */
    append: function(element, property, data) {
        if ('string' == typeof element)
            element = jaxon.$(element);

        // Check if the insertAdjacentHTML() function is available
        if((window.insertAdjacentHTML) || (element.insertAdjacentHTML))
            if(property == 'innerHTML')
                element.insertAdjacentHTML('beforeend', data);
            else if(property == 'outerHTML')
                element.insertAdjacentHTML('afterend', data);
            else
                element[property] += data;
        else
            eval('element.' + property + ' += data;');
        return true;
    },

    /*
    Function: jaxon.cmd.node.prepend

    Prepend the specified value to an element's attribute.

    Parameters:

    element - (object):  The HTML element to effect.
    property - (string):  The name of the attribute.
    data - (string):  The new value to be prepended.

    Returns:

    true - The operation completed successfully.
    */
    prepend: function(element, property, data) {
        if ('string' == typeof element)
            element = jaxon.$(element);

        eval('element.' + property + ' = data + element.' + property);
        return true;
    },

    /*
    Function: jaxon.cmd.node.replace

    Search and replace the specified text.

    Parameters:

    element - (string or object):  The name of, or the element itself which is to be modified.
    sAttribute - (string):  The name of the attribute to be set.
    aData - (array):  The search text and replacement text.

    Returns:

    true - The operation completed successfully.
    */
    replace: function(element, sAttribute, aData) {
        const sReplace = aData['r'];
        const sSearch = (sAttribute === 'innerHTML') ?
            jaxon.tools.dom.getBrowserHTML(aData['s']) : aData['s'];

        if (typeof element === 'string')
            element = jaxon.$(element);

        eval('var txt = element.' + sAttribute);

        let bFunction = false;
        if (typeof txt === 'function') {
            txt = txt.join('');
            bFunction = true;
        }

        let start = txt.indexOf(sSearch);
        if (start > -1) {
            let newTxt = [];
            while (start > -1) {
                const end = start + sSearch.length;
                newTxt.push(txt.substr(0, start));
                newTxt.push(sReplace);
                txt = txt.substr(end, txt.length - end);
                start = txt.indexOf(sSearch);
            }
            newTxt.push(txt);
            newTxt = newTxt.join('');

            if (bFunction) {
                eval('element.' + sAttribute + '=newTxt;');
            } else if (jaxon.tools.dom.willChange(element, sAttribute, newTxt)) {
                eval('element.' + sAttribute + '=newTxt;');
            }
        }
        return true;
    },

    /*
    Function: jaxon.cmd.node.remove

    Delete an element.

    Parameters:

    element - (string or object):  The name of, or the element itself which will be deleted.

    Returns:

    true - The operation completed successfully.
    */
    remove: function(element) {
        if ('string' == typeof element)
            element = jaxon.$(element);

        if (element && element.parentNode && element.parentNode.removeChild)
            element.parentNode.removeChild(element);

        return true;
    },

    /*
    Function: jaxon.cmd.node.create

    Create a new element and append it to the specified parent element.

    Parameters:

    objParent - (string or object):  The name of, or the element itself
        which will contain the new element.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value to be assigned to the id attribute of the new element.

    Returns:

    true - The operation completed successfully.
    */
    create: function(objParent, sTag, sId) {
        if ('string' == typeof objParent)
            objParent = jaxon.$(objParent);
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        if (objParent)
            objParent.appendChild(target);
        return true;
    },

    /*
    Function: jaxon.cmd.node.insert

    Insert a new element before the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    insert: function(objSibling, sTag, sId) {
        if ('string' == typeof objSibling)
            objSibling = jaxon.$(objSibling);
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        objSibling.parentNode.insertBefore(target, objSibling);
        return true;
    },

    /*
    Function: jaxon.cmd.node.insertAfter

    Insert a new element after the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    insertAfter: function(objSibling, sTag, sId) {
        if ('string' == typeof objSibling)
            objSibling = jaxon.$(objSibling);
        const target = jaxon.config.baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextAssign

    Assign a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to assign.
        - command.data: (string or object):  The value to assign to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextAssign: function(command) {
        command.fullName = 'context assign';

        const code = [];
        code.push('this.');
        code.push(command.prop);
        code.push(' = data;');
        code = code.join('');
        command.context.jaxonDelegateCall = function(data) {
            eval(code);
        }
        command.context.jaxonDelegateCall(command.data);
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextAppend

    Appends a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to append to.
        - command.data: (string or object):  The value to append to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextAppend: function(command) {
        command.fullName = 'context append';

        const code = [];
        code.push('this.');
        code.push(command.prop);
        code.push(' += data;');
        code = code.join('');
        command.context.jaxonDelegateCall = function(data) {
            eval(code);
        }
        command.context.jaxonDelegateCall(command.data);
        return true;
    },

    /*
    Function: jaxon.cmd.node.contextPrepend

    Prepend a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the
        following:

        - command.prop: (string):  The name of the member to prepend to.
        - command.data: (string or object):  The value to prepend to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    contextPrepend: function(command) {
        command.fullName = 'context prepend';

        const code = [];
        code.push('this.');
        code.push(command.prop);
        code.push(' = data + this.');
        code.push(command.prop);
        code.push(';');
        code = code.join('');
        command.context.jaxonDelegateCall = function(data) {
            eval(code);
        }
        command.context.jaxonDelegateCall(command.data);
        return true;
    }
};
