/**
 * Class: jaxon.utils.dom
 */

(function(self, baseDocument, jq) {
    /**
     * Shorthand for finding a uniquely named element within the document.
     *
     * @param {string} sId - The unique name of the element (specified by the ID attribute)
     *
     * @returns {object} The element found or null.
     *
     * @see <self.$>
     */
    self.$ = (sId) => !sId ? null :
        (typeof sId === 'string' ? baseDocument.getElementById(sId) : sId);

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} The workspace DOM element.
     */
    const _getWorkspace = () => {
        const elWorkspace = self.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }
        // Workspace not found. Must be created.
        if (!baseDocument.body) {
            return null;
        }

        const elNewWorkspace = baseDocument.createElement('div');
        elNewWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elNewWorkspace.style.display = 'none';
        elNewWorkspace.style.visibility = 'hidden';
        baseDocument.body.appendChild(elNewWorkspace);
        return elNewWorkspace;
    };

    /**
     * Insert the specified string of HTML into the document, then extract it.
     * This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.
     *
     * @param {string} sValue A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} The (potentially modified) html code or text.
     */
    self.getBrowserHTML = (sValue) => {
        const elWorkspace = _getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element The element or it's unique name (specified by the ID attribute)
     * @param {string} attribute The name of the attribute.
     * @param {string} newData The value to be compared with the current value of the specified element.
     *
     * @returns {true} The specified value differs from the current attribute value.
     * @returns {false} The specified value is the same as the current value.
     */
    self.willChange = (element, attribute, newData) => {
        element = self.$(element);
        return !element ? false : (newData != element[attribute]);
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element The element or it's unique name (specified by the ID attribute)
     *
     * @returns {void}
     */
    self.removeElement = (element) => {
        element = self.$(element);
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
    };

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName The name of the function to find.
     * @param {object} context
     *
     * @returns {object|null}
     */
    self.findFunction = function (sFuncName, context = window) {
        const names = sFuncName.split(".");
        for (let i = 0, length = names.length; i < length && (context); i++) {
            context = context[names[i]];
        }
        return context ?? null;
    };

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement The outer element.
     * @param {string} attribute The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    self.getInnerObject = (xElement, attribute) => {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len && (xElement); i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
        }
        return !xElement ? [null, null] : [xElement, attribute];
    };

    /**
     * The jQuery object.
     * Will be undefined if the library is not installed.
     *
     * @var {object}
     */
    self.jq = jq;

    /**
     * Call the jQuery DOM selector
     *
     * @param {string|object} xSelector
     * @param {object} xContext
     *
     * @returns {object}
     */
    self.jqSelect = (xSelector, xContext = null) => {
        // Todo: Allow the use of an alternative library instead of jQuery.
        return !xContext ? self.jq(xSelector) : self.jq(xSelector, xContext);
    };
})(jaxon.utils.dom, jaxon.config.baseDocument, window.jQuery);
