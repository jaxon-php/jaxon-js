/**
 * Class: jaxon.utils.form
 *
 * global: jaxon
 */

(function(self, dom) {
    /**
     * Get the object and attribute to be set for a given for entry.
     *
     * @param {object} values
     * @param {string} name
     *
     * @returns {object|null}
     */
    const getValueObject = (values, name) => {
        if (name.indexOf('[') < 0) {
            // No brackets. Simply set the values.
            return { obj: values, attr: name };
        }

        // Parse the base name
        const nameRegex = /(.*?)\[/;
        let matches = name.match(nameRegex);
        // Matches is an array with values like "user[" and "user".
        const result = {
            obj: values,
            attr: matches[1],
        };

        // Parse names into brackets
        const attrRegex = /\[(.*?)\]/;
        let toParse = name.substring(matches[1].length); // The string to be parsed.
        while ((matches = toParse.match(attrRegex)) !== null) {
            if (result.obj[result.attr] === undefined) {
                result.obj[result.attr] = {};
            }
            result.obj = result.obj[result.attr];
            // When found, matches is an array with values like "[email]" and "email".
            result.attr = matches[1];
            toParse = toParse.substring(matches[0].length);
        }
        return result;
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
    const _getValue = (xOptions, { type, name, tagName, checked, disabled, value, options }) => {
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

        const { obj, attr } = getValueObject(xOptions.values, name);
        obj[attr] = type !== 'select-multiple' ? value :
            Array.from(options).filter(({ selected }) => selected).map(({ value: v }) => v);
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
            _getValues(xOptions, form.childNodes);
        }
        return xOptions.values;
    };
})(jaxon.utils.form, jaxon.utils.dom);
