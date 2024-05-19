/**
 * Class: jaxon.cmd.body
 */

(function(self, dom, types, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute to set.
     * @param {string} args.value The new value to be applied.
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

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value;
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute to append to.
     * @param {string} args.value The new value to be appended.
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

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = xElt.node[xElt.attr] + value;
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute.
     * @param {string} args.value The new value to be prepended.
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

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value + xElt.node[xElt.attr];
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
        const bFunction = types.isFunction(xElement[sAttribute]);
        const sCurText = bFunction ? xElement[sAttribute].join('') : xElement[sAttribute];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElement, sAttribute, sNewText)) {
            xElement[sAttribute] = sNewText;
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which is to be modified.
     * @param {string} args.attr The name of the attribute to be set.
     * @param {array} args.search The search text and replacement text.
     * @param {array} args.replace The search text and replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target, attr, search, replace }) => {
        const sSearch = attr === 'innerHTML' ? dom.getBrowserHTML(search) : search;
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            replaceText(xElt.node, xElt.attr, sSearch, replace);
        }
        return true;
    };

    /**
     * Clear an element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which is to be modified.
     * @param {string} args.attr The name of the attribute to clear.
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which will be deleted.
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which will contain the new element.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element that will be used as the reference point for insertion.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element that will be used as the reference point for insertion.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target.nextSibling);
        return true;
    };
})(jaxon.cmd.body, jaxon.utils.dom, jaxon.utils.types, jaxon.config.baseDocument);
