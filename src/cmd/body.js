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
     * @param {string} command.attr The name of the attribute to set.
     * @param {string} command.value The new value to be applied.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = value;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = value;
            return true;
        }

        const [innerElement, innerAttribute] = dom.getInnerObject(target, attr);
        if (innerElement !== null) {
            innerElement[innerAttribute] = value;
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.attr The name of the attribute to append to.
     * @param {string} command.value The new value to be appended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = target.innerHTML + value;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = target.outerHTML + value;
            return true;
        }

        const [innerElement, innerAttribute] = dom.getInnerObject(target, attr);
        if (innerElement !== null) {
            innerElement[innerAttribute] = innerElement[innerAttribute] + value;
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.attr The name of the attribute.
     * @param {string} command.value The new value to be prepended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = value + target.innerHTML;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = value + target.outerHTML;
            return true;
        }

        const [innerElement, innerAttribute] = dom.getInnerObject(target, attr);
        if (innerElement !== null) {
            innerElement[innerAttribute] = value + innerElement[innerAttribute];
        }
        return true;
    };

    /**
     * Replace a text in the value of a given attribute in an element
     *
     * @param {object} xElement The element to search in
     * @param {string} sAttribute The attribute to search in
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xElement, sAttribute, sSearch, sReplace) => {
        const bFunction = (typeof xElement[sAttribute] === 'function');
        const sCurText = bFunction ? xElement[sAttribute].join('') : xElement[sAttribute];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElement, sAttribute, sNewText)) {
            xElement[sAttribute] = sNewText;
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which is to be modified.
     * @param {string} command.attr The name of the attribute to be set.
     * @param {array} command.search The search text and replacement text.
     * @param {array} command.replace The search text and replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target, attr, search, replace }) => {
        const sSearch = attr === 'innerHTML' ? dom.getBrowserHTML(search) : search;
        const [innerElement, innerAttribute] = dom.getInnerObject(target, attr);
        if (innerElement !== null) {
            replaceText(innerElement, innerAttribute, sSearch, replace);
        }
        return true;
    };

    /**
     * Clear an element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which is to be modified.
     * @param {string} command.attr The name of the attribute to clear.
     *
     * @returns {true} The operation completed successfully.
     */
    self.clear = ({ target, attr }) => {
        self.assign({ target, attr, value: '' });
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
    self.remove = ({ target }) => {
        dom.removeElement(target);
        return true;
    };

    /**
     * @param {string} sTag The tag name for the new element.
     * @param {string} sId The id attribute of the new element.
     *
     * @returns {object}
     */
    const createNewTag = (sTag, sId) => {
        const newTag = baseDocument.createElement(sTag);
        newTag.setAttribute('id', sId);
        return newTag;
    };

    /**
     * Create a new element and append it to the specified parent element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will contain the new element.
     * @param {string} command.tag.name The tag name for the new element.
     * @param {string} command.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.create = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.appendChild(createNewTag(sTag, sId));
        return true;
    };

    /**
     * Insert a new element before the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.tag.name The tag name for the new element.
     * @param {string} command.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insert = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target);
        return true;
    };

    /**
     * Insert a new element after the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.tag.name The tag name for the new element.
     * @param {string} command.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target.nextSibling);
        return true;
    };
})(jaxon.cmd.body, jaxon.utils.dom, jaxon.config.baseDocument);
