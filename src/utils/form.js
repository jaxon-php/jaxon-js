/**
 * Class: jaxon.utils.form
 *
 * global: jaxon
 */

(function(self, dom, logger) {
    /**
     * @param {string} type
     * @param {string} name
     * @param {string} tagName
     * @param {string} prefix
     * @param {mixed} value
     * @param {boolean} checked
     * @param {boolean} withDisabled
     * @param {boolean} disabled
     *
     * @returns {void}
     */
    const fieldIsInvalid = (type, name, tagName, prefix, value, checked, withDisabled, disabled) =>
        // Do not read value of fields without name, or param fields.
        !name || 'PARAM' === tagName ||
        // Do not read value of disabled fields
        (!withDisabled && disabled) ||
        // Only read values with the given prefix, if provided.
        (prefix.length > 0 && prefix !== name.substring(0, prefix.length)) ||
        // Values of radio and checkbox, when they are not checked, are omitted.
        ((type === 'radio' || type === 'checkbox') && !checked) ||
        // Values of dropdown select, when they are undefined, are omitted.
        ((type === 'select-one' || type === 'select-multiple') && value === undefined) ||
        // Do not read value from file fields.
        type === 'file';

    /**
     * Get the value of a multiple select field.
     *
     * @param {array} options
     *
     * @returns {array}
     */
    const getSelectedValues = (options) => Array.from(options)
        .filter(({ selected }) => selected).map(({ value }) => value);

    /**
     * Get the value of a form field.
     *
     * @param {string} type
     * @param {object} values
     * @param {array} options
     *
     * @returns {mixed}
     */
    const getSimpleFieldValue = (type, value, options) =>
        // For select multiple fields, take the last selected value, as PHP does.
        // Unlike PHP, Javascript will set "value" as the first selected value.
        type !== 'select-multiple' ? value : getSelectedValues(options).pop();

    /**
     * Set the value of a form field.
     *
     * @param {object} values
     * @param {string} varName
     * @param {string} varKeys
     * @param {string} type
     * @param {mixed} falue
     * @param {array} options
     *
     * @returns {void}
     */
    const setFieldValue = (values, varName, varKeys, type, value, options) => {
        const result = { obj: values, key: varName };

        // Parse names into brackets
        const keyRegex = /\[(.*?)\]/;
        while ((matches = varKeys.match(keyRegex)) !== null) {
            // When found, matches is an array with values like "[email]" and "email".
            const key = matches[1].trim();
            if (key === '') {
                // The field is defined as an array in the form (eg users[]).
                const currentValue = result.obj[result.key] ?? [];
                result.obj[result.key] = type === 'select-multiple' ?
                    getSelectedValues(options) : [...currentValue, value];
                // Nested arrays are not supported. So the function returns here.
                return;
            }

            if (result.obj[result.key] === undefined) {
                result.obj[result.key] = {};
            }
            // The field is an object.
            result.obj = result.obj[result.key];
            result.key = key;
            varKeys = varKeys.substring(matches[0].length);
        }

        // The field is an object.
        result.obj[result.key] = getSimpleFieldValue(type, value, options);
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
        const { prefix, formId, withDisabled } = xOptions;

        if (fieldIsInvalid(type, name, tagName, prefix, value, checked, withDisabled, disabled)) {
            return;
        }

        // Check the name validity
        const nameRegex = /^([a-zA-Z_][a-zA-Z0-9_-]*)((\[[a-zA-Z0-9_-]*\])*)$/;
        let matches = name.match(nameRegex);
        if (!matches) {
            // Invalid name
            logger.warning(`Invalid field name ${name} in form ${formId}.`);
            logger.warning(`The value of the field ${name} in form ${formId} is ignored.`);
            return;
        }

        if (!matches[3]) {
            // No keys into brackets. Simply set the values.
            xOptions.values[name] = getSimpleFieldValue(type, value, options);
            return;
        }

        // Matches is an array with values like user[name][first], "user", "[name][first]" and "[first]".
        const varName = matches[1];
        const varKeys = matches[2];
        // The xOptions.values parameter must be passed by reference.
        setFieldValue(xOptions.values, varName, varKeys, type, value, options);
    };

    /**
     * @param {object} xOptions
     * @param {array} children
     *
     * @returns {void}
     */
    const getValues = (xOptions, children) => {
        children.forEach(child => {
            const { childNodes = null, type } = child;
            if (childNodes !== null && type !== 'select-one' && type !== 'select-multiple') {
                getValues(xOptions, childNodes);
            }
            getValue(xOptions, child);
        });
    };

    /**
     * Build an associative array of form elements and their values from the specified form.
     *
     * @param {string} formId The unique name (id) of the form to be processed.
     * @param {boolean=false} withDisabled (optional): Include form elements which are currently disabled.
     * @param {string=''} prefix (optional): A prefix used for selecting form elements.
     *
     * @returns {object} An associative array of form element id and value.
     */
    self.getValues = (formId, withDisabled = false, prefix = '') => {
        const xOptions = {
            formId,
            // Submit disabled fields
            withDisabled: (withDisabled === true),
            // Only submit fields with a prefix
            prefix: prefix ?? '',
            // Form values
            values: {},
        };

        const { childNodes } = dom.$(formId) ?? {};
        if (childNodes) {
            getValues(xOptions, childNodes);
        }
        return xOptions.values;
    };
})(jaxon.utils.form, jaxon.utils.dom, jaxon.utils.logger);
