/**
 * Class: jaxon.utils.form
 */

(function(self, dom) {
    /*
    Function: _getValue

    Used internally by <_getValues> to extract a single form value.
    This will detect the type of element (radio, checkbox, multi-select) and add it's value(s) to the form values array.

    Modified version for multidimensional arrays
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
            child.options.filter(option => option.selected).map(option => option.value);
        const keyBegin = name.indexOf('[');

        if (keyBegin < 0) {
            aFormValues[name] = values;
            return;
        }

        // Parse names into brackets
        let k = name.substring(0, keyBegin);
        let a = name.substring(keyBegin);
        aFormValues[k] = aFormValues[k] || {};
        let p = aFormValues; // pointer reset
        while (a.length > 0) {
            const sa = a.substring(0, a.indexOf(']') + 1);
            const lastKey = k; //save last key
            const lastRef = p; //save last pointer

            a = a.substring(a.indexOf(']') + 1);
            p = p[k];
            k = sa.substring(1, sa.length - 2);
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

    /*
    Function: _getValues

    Used internally by <jaxon.utils.form.getValues> to recursively get the value
    of form elements.  This function will extract all form element values
    regardless of the depth of the element within the form.
    */
    const _getValues = (aFormValues, children, submitDisabledElements, prefix) => {
        children.forEach(child => {
            if (child.childNodes !== undefined && child.type !== 'select-one' && child.type !== 'select-multiple') {
                _getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            }
           _getValue(aFormValues, child, submitDisabledElements, prefix);
        });
    };

    /*
    Function: jaxon.utils.form.getValues

    Build an associative array of form elements and their values from the specified form.

    Parameters:
    formId - (string): The unique name (id) of the form to be processed.
    disabled - (boolean, optional): Include form elements which are currently disabled.
    prefix - (string, optional): A prefix used for selecting form elements.

    Returns:
    An associative array of form element id and value.
    */
    self.getValues = (formId, disabled, prefix) => {
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
