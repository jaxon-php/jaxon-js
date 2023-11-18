/**
 * Class: jaxon.utils.dom
 */

(function(self, baseDocument) {
    /**
     * Shorthand for finding a uniquely named element within the document.
     *
     * Note:
     *     This function uses the <jaxon.config.baseDocument> which allows <jaxon> to operate on the
     *     main window document as well as documents from contained iframes and child windows.
     *
     * @param {string} sId - The unique name of the element (specified by the ID attribute)
     * Not to be confused with the name attribute on form elements.
     *
     * @returns {object} - The element found or null.
     *
     * @see <self.$>
     */
    self.$ = sId => !sId ? null : (typeof sId !== 'string' ? sId : baseDocument.getElementById(sId));

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} - The workspace DOM element.
     */
    const _getWorkspace = function() {
        const elWorkspace = self.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }
        // Workspace not found. Must be ceated.
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
     * @param {string} sValue - A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} - The (potentially modified) html code or text.
     */
    self.getBrowserHTML = function(sValue) {
        const elWorkspace = _getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element - The element or it's unique name (specified by the ID attribute)
     * @param {string} attribute - The name of the attribute.
     * @param {string} newData - The value to be compared with the current value of the specified element.
     *
     * @returns {true} - The specified value differs from the current attribute value.
     * @returns {false} - The specified value is the same as the current value.
     */
    self.willChange = function(element, attribute, newData) {
        if (typeof element === 'string') {
            element = self.$(element);
        }
        return !element ? false : (newData != element[attribute]);
    };

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName - The name of the function to find.
     *
     * @returns {object} - The function
     */
    self.findFunction = function (sFuncName) {
        const names = sFuncName.split(".");
        for (let i = 0, length = names.length, context = window; i < length && (context); i++) {
            context = context[names[i]];
        }
        return context ?? null;
    };

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement - The outer element.
     * @param {string} attribute - The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    self.getInnerObject = function(xElement, attribute) {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len && (xElement); i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
        }
        return [xElement ?? null, (xElement) ? attribute : null];
    };

    /**
     * Create a function by inserting its code in the page using a <script> tag.
     *
     * @param {string} funcCode
     * @param {string|undefined} funcName
     * 
     * @returns {boolean}
     */
    self.createFunction = function(funcCode, funcName) {
        if (!funcCode) {
            return;
        }

        const removeTagAfter = funcName === undefined;
        const scriptTagId = 'jaxon_cmd_script_' + (funcName === undefined ?
            'delegate_call' : funcName.toLowerCase().replaceAll('.', '_'));
        funcName = funcName ?? 'jaxon.cmd.script.context.delegateCall';

        // Remove the tag if it already exists.
        jaxon.cmd.node.remove(scriptTagId);
        // Create a new tag.
        const scriptTag = baseDocument.createElement('script');
        scriptTag.setAttribute('id', scriptTagId);
        scriptTag.textContent = `
    ${funcName} = ${funcCode}
`;
        baseDocument.body.appendChild(scriptTag);

        // Since this js code saves the function in a var,
        // the tag can be removed, and the function will still exist.
        removeTagAfter && jaxon.cmd.node.remove(scriptTagId);
        return true;
    };
})(jaxon.utils.dom, jaxon.config.baseDocument);
