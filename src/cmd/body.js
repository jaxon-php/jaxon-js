/**
 * Class: jaxon.cmd.body
 */

(function(self, dom, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to set.
     * @param {string} command.data The new value to be applied.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ target: element, prop: property, data }) => {
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

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to append to.
     * @param {string} command.data The new value to be appended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ target: element, prop: property, data }) => {
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

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute.
     * @param {string} command.data The new value to be prepended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ target: element, prop: property, data }) => {
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

    /**
     * Search and replace the specified text.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which is to be modified.
     * @param {string} command.prop The name of the attribute to be set.
     * @param {array} command.data The search text and replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target: element, prop: sAttribute, data: aData }) => {
        const sReplace = aData['r'];
        const sSearch = sAttribute === 'innerHTML' ? dom.getBrowserHTML(aData['s']) : aData['s'];
        const [innerElement, innerProperty] = dom.getInnerObject(element, sAttribute);
        if (innerElement !== null) {
            replaceText(innerElement, innerProperty, sSearch, sReplace);
        }
        return true;
    };

    /**
     * Clear an element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will be deleted.
     *
     * @returns {true} The operation completed successfully.
     */
    self.clear = ({ target: element }) => {
        element.innerHTML = '';
        return true;
    };

    /**
     * Delete an element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will be deleted.
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
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will contain the new element.
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
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
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
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
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
})(jaxon.cmd.body, jaxon.utils.dom, jaxon.config.baseDocument);
