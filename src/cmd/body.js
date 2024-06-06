/**
 * Class: jaxon.cmd.body
 */

(function(self, dom, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to set.
     * @param {string} command.data The new value to be applied.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ target: element, prop: property, data: value }) => {
        const xElt = dom.getInnerObject(property, element);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value;
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to append to.
     * @param {string} command.data The new value to be appended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ target: element, prop: property, data: value }) => {
        const xElt = dom.getInnerObject(property, element);
        if (xElt !== null) {
            xElt.node[xElt.attr] = xElt.node[xElt.attr] + value;
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute.
     * @param {string} command.data The new value to be prepended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ target: element, prop: property, data: value }) => {
        const xElt = dom.getInnerObject(property, element);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value + xElt.node[xElt.attr];
        }
        return true;
    };

    /**
     * Replace a text in the value of a given property in an element
     *
     * @param {object} xElt The value returned by the dom.getInnerObject() function
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xElt, sSearch, sReplace) => {
        const bFunction = (typeof xElt.node[xElt.attr] === 'function');
        const sCurText = bFunction ? xElt.node[xElt.attr].join('') : xElt.node[xElt.attr];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElt.node, xElt.attr, sNewText)) {
            xElt.node[xElt.attr] = sNewText;
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The element which is to be modified.
     * @param {string} command.prop The name of the attribute to be set.
     * @param {object} command.data The search text and replacement text.
     * @param {object} command.data.s The search text.
     * @param {object} command.data.r The replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target: element, prop, data: { s: search, r: replace } }) => {
        const xElt = dom.getInnerObject(prop, element);
        if (xElt !== null) {
            replaceText(xElt, prop === 'innerHTML' ? dom.getBrowserHTML(search) : search, replace);
        }
        return true;
    };

    /**
     * Delete an element.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The element which will be deleted.
     *
     * @returns {true} The operation completed successfully.
     */
    self.remove = ({ target: element }) => {
        dom.removeElement(element);
        return true;
    };

    /**
     * Create a new element and append it to the specified parent element.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The element which will contain the new element.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value to be assigned to the id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.create = ({ target: element, data: sTag, prop: sId }) => {
        if (element) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.appendChild(target);
        }
        return true;
    };

    /**
     * Insert a new element before the specified element.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value that will be assigned to the new element's id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insert = ({ target: element, data: sTag, prop: sId }) => {
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element);
        }
        return true;
    };

    /**
     * Insert a new element after the specified element.
     *
     * @param {object} command The Response command object.
     * @param {Element} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value that will be assigned to the new element's id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ target: element, data: sTag, prop: sId }) => {
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element.nextSibling);
        }
        return true;
    };

    /**
     * Assign a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to assign.
     * @param {string|object} command.data The value to assign to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextAssign = ({ context, prop: sAttribute, data: value }) => {
        const xElt = dom.getInnerObject(sAttribute, context);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value;
        }
        return true;
    };

    /**
     * Appends a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to append to.
     * @param {string|object} command.data The value to append to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextAppend = ({ context, prop: sAttribute, data: value }) => {
        const xElt = dom.getInnerObject(sAttribute, context);
        if (xElt !== null) {
            xElt.node[xElt.attr] = xElt.node[xElt.attr] + value;
        }
        return true;
    };

    /**
     * Prepend a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to prepend to.
     * @param {string|object} command.data The value to prepend to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextPrepend = ({ context, prop: sAttribute, data: value }) => {
        const xElt = dom.getInnerObject(sAttribute, context);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value + xElt.node[xElt.attr];
        }
        return true;
    };
})(jaxon.cmd.body, jaxon.utils.dom, jaxon.config.baseDocument);
