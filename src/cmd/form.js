/**
 * Class: jaxon.cmd.form
 */

(function(self, baseDocument) {
    /*
    Create and return a form input element with the specified parameters.

    Parameters:

    type - (string):  The type of input element desired.
    name - (string):  The value to be assigned to the name attribute.
    id - (string):  The value to be assigned to the id attribute.

    Returns:

    object - The new input element.
    */
    const getInput = (type, name, id) => {
        const oInput = baseDocument.createElement('input');
        oInput.setAttribute('type', type);
        oInput.setAttribute('name', name);
        oInput.setAttribute('id', id);
        return oInput;
    };

    /*
    Function: jaxon.cmd.form.createInput

    Create a new input element under the specified parent.

    Parameters:

    objParent - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.createInput = (command) => {
        command.fullName = 'createInput';

        const { target: objParent, type: sType, data: sName, prop: sId } = command;
        const target = getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.form.insertInput

    Insert a new input element before the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertInput = (command) => {
        command.fullName = 'insertInput';

        const { target: objSibling, type: sType, data: sName, prop: sId } = command;
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling);
        }
        return true;
    };

    /*
    Function: jaxon.cmd.form.insertInputAfter

    Insert a new input element after the specified element.

    Parameters:

    objSibling - (string or object):  The name of, or the element itself
        that will be used as the reference for the insertion.
    sType - (string):  The value to be assigned to the type attribute.
    sName - (string):  The value to be assigned to the name attribute.
    sId - (string):  The value to be assigned to the id attribute.

    Returns:

    true - The operation completed successfully.
    */
    self.insertInputAfter = (command) => {
        command.fullName = 'insertInputAfter';

        const { target: objSibling, type: sType, data: sName, prop: sId } = command;
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        }
        return true;
    };
})(jaxon.cmd.form, jaxon.config.baseDocument);
