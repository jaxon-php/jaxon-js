jaxon.tools.form = {
    /*
    Function: jaxon.tools.form.getValues

    Build an associative array of form elements and their values from the specified form.

    Parameters:
    element - (string): The unique name (id) of the form to be processed.
    disabled - (boolean, optional): Include form elements which are currently disabled.
    prefix - (string, optional): A prefix used for selecting form elements.

    Returns:
    An associative array of form element id and value.
    */
    getValues: function(parent) {
        const submitDisabledElements = (arguments.length > 1 && arguments[1] == true);

        const prefix = (arguments.length > 2) ? arguments[2] : '';

        if ('string' == typeof parent)
            parent = jaxon.$(parent);

        const aFormValues = {};

        //        JW: Removing these tests so that form values can be retrieved from a specified
        //        container element like a DIV, regardless of whether they exist in a form or not.
        //
        //        if (parent.tagName)
        //            if ('FORM' == parent.tagName.toUpperCase())
        if (parent && parent.childNodes)
            jaxon.tools.form._getValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);

        return aFormValues;
    },

    /*
    Function: jaxon.tools.form._getValues

    Used internally by <jaxon.tools.form.getValues> to recursively get the value
    of form elements.  This function will extract all form element values
    regardless of the depth of the element within the form.
    */
    _getValues: function(aFormValues, children, submitDisabledElements, prefix) {
        const iLen = children.length;
        for (let i = 0; i < iLen; ++i) {
            const child = children[i];
            if (('undefined' != typeof child.childNodes) && (child.type != 'select-one') && (child.type != 'select-multiple'))
                jaxon.tools.form._getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            jaxon.tools.form._getValue(aFormValues, child, submitDisabledElements, prefix);
        }
    },

    /*
    Function: jaxon.tools.form._getValue

    Used internally by <jaxon.tools.form._getValues> to extract a single form value.
    This will detect the type of element (radio, checkbox, multi-select) and add it's value(s) to the form values array.

    Modified version for multidimensional arrays
    */
    _getValue: function(aFormValues, child, submitDisabledElements, prefix) {
        if (!child.name)
            return;

        if ('PARAM' == child.tagName) return;

        if (child.disabled)
            if (true == child.disabled)
                if (false == submitDisabledElements)
                    return;

        if (prefix != child.name.substring(0, prefix.length))
            return;

        if (child.type)
        {
            if (child.type == 'radio' || child.type == 'checkbox')
                if (false == child.checked)
                    return;
            if (child.type == 'file')
                return;
        }

        const name = child.name;

        let values = [];

        if ('select-multiple' == child.type) {
            const jLen = child.length;
            for (let j = 0; j < jLen; ++j) {
                const option = child.options[j];
                if (true == option.selected)
                    values.push(option.value);
            }
        } else {
            values = child.value;
        }

        const keyBegin = name.indexOf('[');
        /* exists name/object before the Bracket?*/
        if (0 <= keyBegin) {
            let n = name;
            let k = n.substr(0, n.indexOf('['));
            let a = n.substr(n.indexOf('['));
            if (typeof aFormValues[k] == 'undefined')
                aFormValues[k] = {};
            let p = aFormValues; // pointer reset
            while (a.length != 0) {
                const sa = a.substr(0, a.indexOf(']') + 1);

                const lk = k; //save last key
                const lp = p; //save last pointer

                a = a.substr(a.indexOf(']') + 1);
                p = p[k];
                k = sa.substr(1, sa.length - 2);
                if (k == '') {
                    if ('select-multiple' == child.type) {
                        k = lk; //restore last key
                        p = lp;
                    } else {
                        k = p.length;
                    }
                }
                if (typeof k == 'undefined') {
                    /*check against the global aFormValues Stack wich is the next(last) usable index */
                    k = 0;
                    for (let i in lp[lk]) k++;
                }
                if (typeof p[k] == 'undefined') {

                    p[k] = {};
                }
            }
            p[k] = values;
        } else {
            aFormValues[name] = values;
        }
    }
};
