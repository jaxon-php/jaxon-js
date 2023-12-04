/**
 * Class: jaxon.cmd.node
 */

(function(self, dom, baseDocument) {
    /*
    Function: jaxon.cmd.node.assign

    Assign an element's attribute to the specified value.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (object):  The HTML element to effect.
        - command.prop - (string):  The name of the attribute to set.
        - command.data - (string):  The new value to be applied.

    Returns:

    true - The operation completed successfully.
    */
    self.assign = (command) => {
        command.fullName = 'assign/clear';

        const { target: element, prop: property, data } = command;
        if (property === 'innerHTML') {
            element.innerHTML = data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = data;
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.append

    Append the specified value to an element's attribute.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (object):  The HTML element to effect.
        - command.prop - (string):  The name of the attribute to append to.
        - command.data - (string):  The new value to be appended.

    Returns:

    true - The operation completed successfully.
    */
    self.append = (command) => {
        command.fullName = 'append';

        const { target: element, prop: property, data } = command;
        if (property === 'innerHTML') {
            element.innerHTML = element.innerHTML + data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = element.outerHTML + data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = innerElement[innerProperty] + data;
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.prepend

    Prepend the specified value to an element's attribute.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (object):  The HTML element to effect.
        - command.prop - (string):  The name of the attribute.
        - command.data - (string):  The new value to be prepended.

    Returns:

    true - The operation completed successfully.
    */
    self.prepend = (command) => {
        command.fullName = 'prepend';

        const { target: element, prop: property, data } = command;
        if (property === 'innerHTML') {
            element.innerHTML = data + element.innerHTML;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data + element.outerHTML;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = data + innerElement[innerProperty];
        }
        return true;
    };

    /**
     * Replace a text in the value of a given property in an element
     *
     * @param {object} xElement The element to search in
     * @param {string} sProperty The attribute to search in
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xElement, sProperty, sSearch, sReplace) => {
        const bFunction = (typeof xElement[sProperty] === 'function');
        const sCurText = bFunction ? xElement[sProperty].join('') : xElement[sProperty];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElement, sProperty, sNewText)) {
            xElement[sProperty] = sNewText;
        }
    };

    /*
    Function: jaxon.cmd.node.replace

    Search and replace the specified text.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (string or object):  The element which is to be modified.
        - command.sAttribute - (string):  The name of the attribute to be set.
        - command.aData - (array):  The search text and replacement text.

    Returns:

    true - The operation completed successfully.
    */
    self.replace = (command) => {
        command.fullName = 'replace';

        const { target: element, prop: sAttribute, data: aData } = command;
        const sReplace = aData['r'];
        const sSearch = sAttribute === 'innerHTML' ? dom.getBrowserHTML(aData['s']) : aData['s'];
        const [innerElement, innerProperty] = dom.getInnerObject(element, sAttribute);
        if (innerElement !== null) {
            replaceText(innerElement, innerProperty, sSearch, sReplace);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.remove

    Delete an element.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (string or object):  The element which will be deleted.

    Returns:

    true - The operation completed successfully.
    */
    self.remove = (command) => {
        command.fullName = 'remove';

        const { target: element } = command;
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.create

    Create a new element and append it to the specified parent element.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (string or object):  The element which will contain the new element.
        - command.data - (string):  The tag name for the new element.
        - command.prop - (string):  The value to be assigned to the id attribute of the new element.

    Returns:

    true - The operation completed successfully.
    */
    self.create = (command) => {
        command.fullName = 'create';

        const { target: element, data: sTag, prop: sId } = command;
        if (element) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.appendChild(target);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.insert

    Insert a new element before the specified element.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (string or object):  The element that will be used as the reference point for insertion.
        - command.data - (string):  The tag name for the new element.
        - command.prop - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insert = (command) => {
        command.fullName = 'insert';

        const { target: element, data: sTag, prop: sId } = command;
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.insertAfter

    Insert a new element after the specified element.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.target - (string or object):  The element that will be used as the reference point for insertion.
        - command.data - (string):  The tag name for the new element.
        - command.prop - (string):  The value that will be assigned to the new element's id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertAfter = (command) => {
        command.fullName = 'insertAfter';

        const { target: element, data: sTag, prop: sId } = command;
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element.nextSibling);
        }
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
    self.contextAssign = (command) => {
        command.fullName = 'context assign';

        const { context, prop: sAttribute, data } = command;
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = data;
        }
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
    self.contextAppend = (command) => {
        command.fullName = 'context append';

        const { context, prop: sAttribute, data } = command;
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = innerElement[innerProperty] + data;
        }
        return true;
    };

    /*
    Function: jaxon.cmd.node.contextPrepend

    Prepend a value to a named member of the current script context object.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.prop: (string):  The name of the member to prepend to.
        - command.data: (string or object):  The value to prepend to the member.
        - command.context: (object):  The current script context object which is accessable via the 'this' keyword.

    Returns:

    true - The operation completed successfully.
    */
    self.contextPrepend = (command) => {
        command.fullName = 'context prepend';

        const { context, prop: sAttribute, data } = command;
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = data + innerElement[innerProperty];
        }
        return true;
    };
})(jaxon.cmd.node, jaxon.utils.dom, jaxon.config.baseDocument);
