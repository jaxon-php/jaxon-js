/**
 * Class: jaxon.cmd.form
 */

(function(self, baseDocument) {
    /**
     * Create and return a form input element with the specified parameters.
     *
     * @param {string} type The type of input element desired.
     * @param {string} name The value to be assigned to the name attribute.
     * @param {string} id The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    const getInput = (type, name, id) => {
        const oInput = baseDocument.createElement('input');
        oInput.setAttribute('type', type);
        oInput.setAttribute('name', name);
        oInput.setAttribute('id', id);
        return oInput;
    };

    /**
     * Create a new input element under the specified parent.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.createInput = ({ target: objParent, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    };

    /**
     * Insert a new input element before the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertInput = ({ target: objSibling, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling);
        }
        return true;
    };

    /**
     * Insert a new input element after the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertInputAfter = ({ target: objSibling, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        }
        return true;
    };
})(jaxon.cmd.form, jaxon.config.baseDocument);
