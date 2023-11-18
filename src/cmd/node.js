/**
 * Class: jaxon.cmd.node
 */

(function(self, dom, baseDocument) {
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
    self.assign = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data;
        return true;
    };

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
    self.append = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = element.innerHTML + data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = element.outerHTML + data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + data;
        return true;
    };

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
    self.prepend = function(element, property, data) {
        element = dom.$(element);
        if (property === 'innerHTML') {
            element.innerHTML = data + element.innerHTML;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data + element.outerHTML;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = data + innerElement[innerProperty];
        return true;
    };

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
    self.replace = function(element, sAttribute, aData) {
        const sReplace = aData['r'];
        const sSearch = (sAttribute === 'innerHTML') ?
            dom.getBrowserHTML(aData['s']) : aData['s'];
        element = dom.$(element);
        const [innerElement, innerAttribute] = dom.getInnerObject(element, sAttribute);
        if(!innerElement) {
            return true;
        }
        let txt = innerElement[innerAttribute];

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

            if (bFunction || dom.willChange(element, sAttribute, newTxt)) {
                innerElement[innerAttribute] = newTxt;
            }
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.remove

    Delete an element.

    Parameters:

    element - (string or object):  The name of, or the element itself which will be deleted.

    Returns:

    true - The operation completed successfully.
    */
    self.remove = function(element) {
        element = dom.$(element);
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.create

    Create a new element and append it to the specified parent element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        which will contain the new element.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value to be assigned to the id attribute of the new element.

    Returns:

    true - The operation completed successfully.
    */
    self.create = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.appendChild(target);
        return true;
    };

    /*
    Function: jaxon.cmd.node.insert

    Insert a new element before the specified element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insert = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element);
        return true;
    };

    /*
    Function: jaxon.cmd.node.insertAfter

    Insert a new element after the specified element.

    Parameters:

    element - (string or object):  The name of, or the element itself
        that will be used as the reference point for insertion.
    sTag - (string):  The tag name for the new element.
    sId - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertAfter = function(element, sTag, sId) {
        element = dom.$(element);
        if (!element || !element.parentNode) {
            return true;
        }
        const target = baseDocument.createElement(sTag);
        target.setAttribute('id', sId);
        element.parentNode.insertBefore(target, element.nextSibling);
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextAssign

    Assign a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to assign.
        - command.data: (string or object):  The value to assign to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextAssign = function(command) {
        command.fullName = 'context assign';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextAppend

    Appends a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to append to.
        - command.data: (string or object):  The value to append to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextAppend = function(command) {
        command.fullName = 'context append';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = innerElement[innerProperty] + command.data;
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextPrepend

    Prepend a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.prop: (string):  The name of the member to prepend to.
        - command.data: (string or object):  The value to prepend to the member.
        - command.context: (object):  The current script context object which
            is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextPrepend = function(command) {
        command.fullName = 'context prepend';

        const [innerElement, innerProperty] = dom.getInnerObject(this, command.prop);
        if(!innerElement) {
            return true;
        }
        innerElement[innerProperty] = command.data + innerElement[innerProperty];
        return true;
    };
})(jaxon.cmd.node, jaxon.utils.dom, jaxon.config.baseDocument);
