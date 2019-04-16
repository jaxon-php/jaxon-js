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
        var submitDisabledElements = false;
        if (arguments.length > 1 && arguments[1] == true)
            submitDisabledElements = true;

        var prefix = '';
        if (arguments.length > 2)
            prefix = arguments[2];

        if ('string' == typeof parent)
            parent = jaxon.$(parent);

        var aFormValues = {};

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
        var iLen = children.length;
        for (var i = 0; i < iLen; ++i) {
            var child = children[i];
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

        var name = child.name;

        var values = [];

        if ('select-multiple' == child.type) {
            var jLen = child.length;
            for (var j = 0; j < jLen; ++j) {
                var option = child.options[j];
                if (true == option.selected)
                    values.push(option.value);
            }
        } else {
            values = child.value;
        }

        var keyBegin = name.indexOf('[');
        /* exists name/object before the Bracket?*/
        if (0 <= keyBegin) {
            var n = name;
            var k = n.substr(0, n.indexOf('['));
            var a = n.substr(n.indexOf('['));
            if (typeof aFormValues[k] == 'undefined')
                aFormValues[k] = {};
            var p = aFormValues; // pointer reset
            while (a.length != 0) {
                var sa = a.substr(0, a.indexOf(']') + 1);

                var lk = k; //save last key
                var lp = p; //save last pointer

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
                    for (var i in lp[lk]) k++;
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
