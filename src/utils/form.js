/**
 * Class: jaxon.utils.form
 *
 * global: jaxon
 */

(function(self, dom) {
    /**
     * Set the value of a form field.
     *
     * @param {object} values
     * @param {string} fieldName
     * @param {mixed} fieldValue
     * @param {string} formId
     *
     * @returns {void}
     */
    const setFieldValue = (values, fieldName, fieldValue, formId) => {
        // Check the name validity
        const nameRegex = /^([a-zA-Z_][a-zA-Z0-9_-]*)((\[[a-zA-Z0-9_-]*\])*)$/;
        let matches = fieldName.match(nameRegex);
        if (!matches) {
            // Invalid name
            console.warn(`Invalid field name ${fieldName} in form ${formId}.`);
            console.warn(`The value of the field ${fieldName} in form ${formId} is ignored.`);
            return;
        }

        if (!matches[3]) {
            // No keys into brackets. Simply set the values.
            values[fieldName] = fieldValue;
            return;
        }

        // Matches is an array with values like user[name][first], "user", "[name][first]" and "[first]".
        const result = {
            obj: values,
            key: matches[1],
        };
        // Parse names into brackets
        let arrayKeys = matches[2];
        const keyRegex = /\[(.*?)\]/;
        while ((matches = arrayKeys.match(keyRegex)) !== null) {
            // When found, matches is an array with values like "[email]" and "email".
            const key = matches[1].trim();
            if (key === '') {
                // The field is defined as an array in the form (eg users[]).
                if (result.obj[result.key] === undefined) {
                    result.obj[result.key] = [];
                }
                result.obj[result.key].push(fieldValue);
                // Nested arrays are not supported. So the function returns here.
                return;
            }

            // The field is an object.
            if (result.obj[result.key] === undefined) {
                result.obj[result.key] = {};
            }
            result.obj = result.obj[result.key];
            result.key = key;

            arrayKeys = arrayKeys.substring(matches[0].length);
        }
        // The field is an object.
        result.obj[result.key] = fieldValue;
    };

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
    const getValue = (xOptions, { type, name, tagName, checked, disabled, value, options }) => {
        // Do not read value of fields without name, or param fields.
        if (!name || 'PARAM' === tagName)
            return;
        // Do not read value of disabled fields
        if (!xOptions.disabled && disabled)
            return;
        const { prefix } = xOptions;
        // Only read values with the given prefix, if provided.
        if (prefix.length > 0 && prefix !== name.substring(0, prefix.length))
            return;
        // Values of radio and checkbox, when they are not checked, are omitted.
        if ((type === 'radio' || type === 'checkbox') && !checked)
            return;
        // Do not read value from file fields.
        if (type === 'file')
            return;

        // Update the form values.
        const fieldValue = type !== 'select-multiple' ? value :
            Array.from(options).filter(({ selected }) => selected).map(({ value: v }) => v);
        // The xOptions.values parameter must be passed by reference.
        setFieldValue(xOptions.values, name, fieldValue, xOptions.formId);
    };

    /**
     * @param {object} xOptions
     * @param {array} children
     *
     * @returns {void}
     */
    const getValues = (xOptions, children) => {
        children.forEach(child => {
            const { childNodes, type } = child;
            if (childNodes !== undefined && type !== 'select-one' && type !== 'select-multiple') {
                getValues(xOptions, childNodes);
            }
            getValue(xOptions, child);
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
            formId,
            // Submit disabled fields
            disabled: (disabled === true),
            // Only submit fields with a prefix
            prefix: prefix ?? '',
            // Form values
            values: {},
        };

        const form = dom.$(formId);
        if (form && form.childNodes) {
            getValues(xOptions, form.childNodes);
        }
        return xOptions.values;
    };
})(jaxon.utils.form, jaxon.utils.dom);
