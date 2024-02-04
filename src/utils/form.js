/**
 * Class: jaxon.utils.form
 */

(function(self, dom) {
    /**
     * @param {object} aFormValues
     * @param {object} child
     * @param {boolean} submitDisabledElements
     * @param {string} prefix
     *
     * @returns {void}
     */
    const _getValue = (aFormValues, child, submitDisabledElements, prefix) => {
        if (!child.name || 'PARAM' === child.tagName)
            return;
        if (!submitDisabledElements && child.disabled)
            return;
        if (prefix !== child.name.substring(0, prefix.length))
            return;
        if ((child.type === 'radio' || child.type === 'checkbox') && !child.checked)
            return;
        if (child.type === 'file')
            return;

        const name = child.name;
        const values = child.type !== 'select-multiple' ? child.value :
            child.options.filter(({ selected }) => selected).map(({ value }) => value);
        const keyBegin = name.indexOf('[');

        if (keyBegin < 0) {
            aFormValues[name] = values;
            return;
        }

        // Parse names into brackets
        let k = name.substring(0, keyBegin);
        let a = name.substring(keyBegin);
        if (aFormValues[k] === undefined) {
            aFormValues[k] = {};
        }
        let p = aFormValues; // pointer reset
        while (a.length > 0) {
            const sa = a.substring(0, a.indexOf(']') + 1);
            const lastKey = k; //save last key
            const lastRef = p; //save last pointer

            a = a.substring(a.indexOf(']') + 1);
            p = p[k];
            k = sa.substring(1, sa.length - 1);
            if (k === '') {
                if ('select-multiple' === child.type) {
                    k = lastKey; //restore last key
                    p = lastRef;
                } else {
                    k = p.length;
                }
            }
            if (k === undefined) {
                /*check against the global aFormValues Stack wich is the next(last) usable index */
                k = Object.keys(lastRef[lastKey]).length;
            }
            p[k] = p[k] || {};
        }
        p[k] = values;
    };

    /**
     * @param {object} aFormValues
     * @param {array} children
     * @param {boolean} submitDisabledElements
     * @param {string} prefix
     *
     * @returns {void}
     */
    const _getValues = (aFormValues, children, submitDisabledElements, prefix) => {
        children.forEach(child => {
            if (child.childNodes !== undefined && child.type !== 'select-one' && child.type !== 'select-multiple') {
                _getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            }
           _getValue(aFormValues, child, submitDisabledElements, prefix);
        });
    };

    /**
     * Build an associative array of form elements and their values from the specified form.
     *
     * @param {string} formId The unique name (id) of the form to be processed.
     * @param {boolean} disabled (optional): Include form elements which are currently disabled.
     * @param {string=''} prefix (optional): A prefix used for selecting form elements.
     *
     * @returns {object} An associative array of form element id and value.
     */
    self.getValues = (formId, disabled, prefix = '') => {
        const submitDisabledElements = (disabled === true);
        const prefixValue = prefix ?? '';
        const form = dom.$(formId);
        const aFormValues = {};
        if (form && form.childNodes) {
            _getValues(aFormValues, form.childNodes, submitDisabledElements, prefixValue);
        }
        return aFormValues;
    };
})(jaxon.utils.form, jaxon.utils.dom);
