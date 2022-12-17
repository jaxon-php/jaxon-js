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
        if ('string' === typeof element)
            element = jaxon.$(element);
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
        let context = window;
        const names = sFuncName.split(".");
        const length = names.length;

        for(let i = 0; i < length && (context); i++) {
            context = context[names[i]];
        }
        return context;
    }
};
