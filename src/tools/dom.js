jaxon.tools.dom = {
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
     * @see <jaxon.$> and <jxn.$>
     */
    $: function(sId) {
        if (!sId)
            return null;

        if (typeof sId !== 'string')
            return sId;

        const oDoc = jaxon.config.baseDocument;
        const obj = oDoc.getElementById(sId);
        if (obj)
            return obj;
        if (oDoc.all)
            return oDoc.all[sId];

        return obj;
    },

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} - The workspace DOM element.
     */
    _getWorkspace: function() {
        const elWorkspace = jaxon.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }

        // Workspace not found. Must be ceated.
        const oDoc = jaxon.config.baseDocument;
        if (!oDoc.body)
            return null;

        const elNewWorkspace = oDoc.createElement('div');
        elNewWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elNewWorkspace.style.display = 'none';
        elNewWorkspace.style.visibility = 'hidden';
        oDoc.body.appendChild(elNewWorkspace);
        return elNewWorkspace;
    },

    /**
     * Insert the specified string of HTML into the document, then extract it.
     * This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.
     *
     * @param {string} sValue - A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} - The (potentially modified) html code or text.
     */
    getBrowserHTML: function(sValue) {
        const elWorkspace = jaxon.tools.dom._getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    },

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element - The element or it's unique name (specified by the ID attribute)
     * @param {string} ttribute - The name of the attribute.
     * @param {string} newData - The value to be compared with the current value of the specified element.
     *
     * @returns {true} - The specified value differs from the current attribute value.
     * @returns {false} - The specified value is the same as the current value.
     */
    willChange: function(element, attribute, newData) {
        if ('string' === typeof element) {
            element = jaxon.$(element);
        }
        if (!element) {
            return false;
        }
        return (newData != element[attribute]);
    },

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName - The name of the function to find.
     *
     * @returns {object} - The function
     */
    findFunction: function (sFuncName) {
        const names = sFuncName.split(".");
        const length = names.length;
        let context = window;
        for (let i = 0; i < length && (context); i++) {
            context = context[names[i]];
            if(!context) {
                return null;
            }
        }
        return context;
    },

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement - The outer element.
     * @param {string} attribute - The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    getInnerObject: function(xElement, attribute) {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len; i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
            if (!xElement) {
                return [null, null];
            }
        }
        return [xElement, attribute];
    },

    /**
     * Create a function by inserting its code in the page using a <script> tag.
     *
     * @param {string} funcCode
     * @param {string|undefined} funcName
     * 
     * @returns {boolean}
     */
    createFunction(funcCode, funcName) {
        if (!funcCode) {
            return;
        }

        const removeTagAfter = funcName === undefined;
        const scriptTagId = 'jaxon_cmd_script_' + (funcName === undefined ?
            'delegate_call' : funcName.toLowerCase().replaceAll('.', '_'));
        if (funcName === undefined) {
            funcName = 'jaxon.cmd.script.context.delegateCall';
        }

        // Remove the tag if it already exists.
        jaxon.cmd.node.remove(scriptTagId);
        // Create a new tag.
        const scriptTag = jaxon.config.baseDocument.createElement('script');
        scriptTag.setAttribute('id', scriptTagId);
        scriptTag.textContent = `
    ${funcName} = ${funcCode}
`;
        jaxon.config.baseDocument.body.appendChild(scriptTag);

        // Since this js code saves the function in a var,
        // the tag can be removed, and the function will still exist.
        if (removeTagAfter) {
            jaxon.cmd.node.remove(scriptTagId);
        }
        return true;
    }
};
