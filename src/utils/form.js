/**
 * Class: jaxon.utils.form
 */

(function(self, dom) {
    /**
     * @param {object} xOptions
     * @param {object} child
     * @param {string} child.type
     * @param {string} child.name
     * @param {string} child.tagName
     * @param {boolean} child.checked
     * @param {boolean} child.disabled
     * @param {mixed} child.value
     * @param {array} child.options
     *
     * @returns {void}
     */
    const _getValue = (xOptions, { type, name, tagName, checked, disabled, value, options }) => {
        if (!name || 'PARAM' === tagName)
            return;
        if (!xOptions.disabled && disabled)
            return;
        const { prefix } = xOptions;
        if (prefix.length > 0 && prefix !== name.substring(0, prefix.length))
            return;
        if ((type === 'radio' || type === 'checkbox') && !checked)
            return;
        if (type === 'file')
            return;

        const values = type !== 'select-multiple' ? value :
            Array.from(options).filter(({ selected }) => selected).map(({ value: v }) => v);
        const keyBegin = name.indexOf('[');

        if (keyBegin < 0) {
            xOptions.values[name] = values;
            return;
        }

        // Parse names into brackets
        let k = name.substring(0, keyBegin);
        let a = name.substring(keyBegin);
        if (xOptions.values[k] === undefined) {
            xOptions.values[k] = {};
        }
        let p = xOptions.values; // pointer reset
        while (a.length > 0) {
            const sa = a.substring(0, a.indexOf(']') + 1);
            const lastKey = k; //save last key
            const lastRef = p; //save last pointer

            a = a.substring(a.indexOf(']') + 1);
            p = p[k];
            k = sa.substring(1, sa.length - 1);
            if (k === '') {
                if ('select-multiple' === type) {
                    k = lastKey; //restore last key
                    p = lastRef;
                } else {
                    k = p.length;
                }
            }
            if (k === undefined) {
                /*check against the global xOptions.values Stack wich is the next(last) usable index */
                k = Object.keys(lastRef[lastKey]).length;
            }
            p[k] = p[k] || {};
        }
        p[k] = values;
    };

    /**
     * @param {object} xOptions
     * @param {array} children
     *
     * @returns {void}
     */
    const _getValues = (xOptions, children) => {
        children.forEach(child => {
            const { childNodes, type } = child;
            if (childNodes !== undefined && type !== 'select-one' && type !== 'select-multiple') {
                _getValues(xOptions, childNodes);
            }
           _getValue(xOptions, child);
        });
    };

    /**
     * Build an associative array of form elements and their values from the specified form.
     *
     * @param {string} formId The unique name (id) of the form to be processed.
     * @param {boolean=false} disabled (optional): Include form elements which are currently disabled.
     * @param {string=''} prefix (optional): A prefix used for selecting form elements.
     *
     * @returns {object} An associative array of form element id and value.
     */
    self.getValues = (formId, disabled = false, prefix = '') => {
        const xOptions = {
            // Submit disabled fields
            disabled: (disabled === true),
            // Only submit fields with a prefix
            prefix: prefix ?? '',
            // Form values
            values: {},
        };

        const form = dom.$(formId);
        if (form && form.childNodes) {
            _getValues(xOptions, form.childNodes);
        }
        return xOptions.values;
    };
})(jaxon.utils.form, jaxon.utils.dom);
