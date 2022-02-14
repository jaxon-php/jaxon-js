jaxon.cmd.form = {
    /*
    Function: jaxon.cmd.form.getInput

    Create and return a form input element with the specified parameters.

    Parameters:

    type - (string):  The type of input element desired.
    name - (string):  The value to be assigned to the name attribute.
    id - (string):  The value to be assigned to the id attribute.

    Returns:

    object - The new input element.
    */
    getInput: function(type, name, id) {
        if ('undefined' == typeof window.addEventListener) {
            jaxon.cmd.form.getInput = function(type, name, id) {
                return jaxon.config.baseDocument.createElement('<input type="' + type + '" name="' + name + '" id="' + id + '">');
            }
        } else {
            jaxon.cmd.form.getInput = function(type, name, id) {
                const oDoc = jaxon.config.baseDocument;
                const Obj = oDoc.createElement('input');
                Obj.setAttribute('type', type);
                Obj.setAttribute('name', name);
                Obj.setAttribute('id', id);
                return Obj;
            }
        }
        return jaxon.cmd.form.getInput(type, name, id);
    },

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
    createInput: function(command) {
        command.fullName = 'createInput';
        const objParent = command.id;

        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        if ('string' == typeof objParent)
            objParent = jaxon.$(objParent);
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    },

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
    insertInput: function(command) {
        command.fullName = 'insertInput';
        const objSibling = command.id;
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        if ('string' == typeof objSibling)
            objSibling = jaxon.$(objSibling);
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling);
        return true;
    },

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
    insertInputAfter: function(command) {
        command.fullName = 'insertInputAfter';
        const objSibling = command.id;
        const sType = command.type;
        const sName = command.data;
        const sId = command.prop;
        if ('string' == typeof objSibling)
            objSibling = jaxon.$(objSibling);
        const target = jaxon.cmd.form.getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode)
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        return true;
    }
};
