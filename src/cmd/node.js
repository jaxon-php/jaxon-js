/**
 * Class: jaxon.cmd.
 *
 * global: jaxon
 */

(function(self, attr, dom, types, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {Element} xTarget The target DOM element.
     * @param {object} xElt The attribute.
     * @param {string} xElt.node The node of the attribute.
     * @param {object} xElt.attr The name of the attribute.
     * @param {mixed} xValue The new value of the attribute.
     *
     * @returns {void}
     */
    const setNodeAttr = (xTarget, { node: xNode, attr: sAttr }, xValue) => {
        if (sAttr !== 'outerHTML' || !xTarget.parentNode) {
            xNode[sAttr] = xValue;
            // Process Jaxon custom attributes in the new node HTML content.
            sAttr === 'innerHTML' && attr.process(xTarget, false);
            return;
        }
        // When setting the outerHTML value, we need to have a parent node, and to
        // get the newly inserted node, where we'll process our custom attributes.
        // The initial target node is actually removed from the DOM, thus cannot be used.
        (new MutationObserver((aMutations, xObserver) => {
            xObserver.disconnect();
            // Process Jaxon custom attributes in the new node HTML content.
            xTarget = aMutations[0]?.addedNodes[0];
            xTarget && attr.process(xTarget, true);
        })).observe(xNode.parentNode, { attributes: false, childList: true, subtree: false });
        xNode[sAttr] = xValue;
    };

    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} args The command arguments.
     * @param {string} args.attr The name of the attribute to set.
     * @param {string} args.value The new value to be applied.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ attr, value }, { target }) => {
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            setNodeAttr(target, xElt, value);
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.attr The name of the attribute to append to.
     * @param {string} args.value The new value to be appended.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ attr, value }, { target }) => {
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            setNodeAttr(target, xElt, xElt.node[xElt.attr] + value);
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.attr The name of the attribute.
     * @param {string} args.value The new value to be prepended.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ attr, value }, { target }) => {
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            setNodeAttr(target, xElt, value + xElt.node[xElt.attr]);
        }
        return true;
    };

    /**
     * Replace a text in the value of a given attribute in an element
     *
     * @param {Element} xTarget The target DOM element.
     * @param {object} xElt The value returned by the dom.getInnerObject() function
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xTarget, xElt, sSearch, sReplace) => {
        const bFunction = types.isFunction(xElt.node[xElt.attr]);
        const sCurText = bFunction ? xElt.node[xElt.attr].join('') : xElt.node[xElt.attr];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElt.node, xElt.attr, sNewText)) {
            setNodeAttr(xTarget, xElt, sNewText);
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} args The command arguments.
     * @param {string} args.attr The name of the attribute to be set.
     * @param {string} args.search The search text and replacement text.
     * @param {string} args.replace The search text and replacement text.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ attr, search, replace }, { target }) => {
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            replaceText(target, xElt, attr === 'innerHTML' ?
                dom.getBrowserHTML(search) : search, replace);
        }
        return true;
    };

    /**
     * Clear an element.
     *
     * @param {object} args The command arguments.
     * @param {object} context The command context.
     *
     * @returns {true} The operation completed successfully.
     */
    self.clear = (args, context) => {
        self.assign({ ...args, value: '' }, context);
        return true;
    };

    /**
     * Delete an element.
     *
     * @param {object} args The command arguments.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.remove = (args, { target }) => {
        target.remove();
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
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.create = ({ tag: { id: sId, name: sTag } }, { target }) => {
        target && target.appendChild(createNewTag(sTag, sId));
        return true;
    };

    /**
     * Insert a new element before the specified element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertBefore = ({ tag: { id: sId, name: sTag } }, { target }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target);
        return true;
    };

    /**
     * Insert a new element after the specified element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ tag: { id: sId, name: sTag } }, { target }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target.nextSibling);
        return true;
    };
})(jaxon.cmd.node, jaxon.parser.attr, jaxon.utils.dom, jaxon.utils.types,
    jaxon.config.baseDocument);
