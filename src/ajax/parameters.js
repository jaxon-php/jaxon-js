/**
 * Class: jaxon.ajax.parameters
 *
 * global: jaxon
 */

(function(self, types, version) {
    /**
     * The array of data bags
     *
     * @type {object}
     */
    const databags = {};

    /**
     * Save data in the data bag.
     *
     * @param {string} sBag   The data bag name.
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBag = (sBag, oValues) => databags[sBag] = oValues;

    /**
     * Save data in the data bag.
     *
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBags = (oValues) => Object.keys(oValues).forEach(sBag => self.setBag(sBag, oValues[sBag]));

    /**
     * Clear an entry in the data bag.
     *
     * @param {string} sBag   The data bag name.
     *
     * @return {void}
     */
    self.clearBag = (sBag) => delete databags[sBag];

    /**
     * Make the databag object to send in the HTTP request.
     *
     * @param {array} aBags The data bag names.
     *
     * @return {object}
     */
    const getBagsValues = (aBags) => JSON.stringify(aBags.reduce((oValues, sBag) => ({
        ...oValues,
        [sBag]: databags[sBag] ?? undefined }
    ), {}));

    /**
     * Get the value of a parameter of an ajax call.
     *
     * @param {mixed} oVal - The value to be stringified
     *
     * @returns {mixed}
     */
    const getParamValue = (oVal) => oVal === undefined || types.of(oVal) === 'function' ? null : oVal;

    /**
     * Sets the request parameters in a container.
     *
     * @param {object} oRequest The request object
     * @param {object} oRequest.func The function to call on the server app.
     * @param {object} oRequest.parameters The parameters to pass to the function.
     * @param {array=} oRequest.bags The keys of values to get from the data bag.
     * @param {callable} fSetter A function that sets a single parameter
     *
     * @return {void}
     */
    const setParams = ({ func, parameters, bags = [] }, fSetter) => {
        const dNow = new Date();
        fSetter('jxnr', dNow.getTime());
        fSetter('jxnv', version.number);
        // The parameters value was assigned from the js "arguments" var in a function. So it
        // is an array-like object, that we need to convert to a real array => [...parameters].
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
        fSetter('jxncall', encodeURIComponent(JSON.stringify({
            ...func,
            args: [...parameters].map(xParam => getParamValue(xParam)),
        })));
        // Add the databag values, if required.
        bags.length > 0 && fSetter('jxnbags', encodeURIComponent(getBagsValues(bags)));
    };

    /**
     * Processes request specific parameters and store them in a FormData object.
     *
     * @param {object} oRequest
     *
     * @return {FormData}
     */
    const getFormDataParams = (oRequest) => {
        const rd = new FormData();
        setParams(oRequest, (sParam, sValue) => rd.append(sParam, sValue));

        // Files to upload
        const { name: field, files } = oRequest.upload.input;
        // The "files" var is an array-like object, that we need to convert to a real array.
        files && [...files].forEach(file => rd.append(field, file));
        return rd;
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {string}
     */
    const getUrlEncodedParams = (oRequest) => {
        const rd = [];
        setParams(oRequest, (sParam, sValue) => rd.push(sParam + '=' + sValue));

        if (oRequest.method === 'POST') {
            return rd.join('&');
        }
        // Move the parameters to the URL for HTTP GET requests
        oRequest.requestURI += (oRequest.requestURI.indexOf('?') === -1 ? '?' : '&') + rd.join('&');
        return ''; // The request body is empty
    };

    /**
     * Check if the request has files to upload.
     *
     * @param {object} oRequest The request object
     * @param {object} oRequest.upload The upload object
     *
     * @return {boolean}
     */
    const hasUpload = ({ upload: { form, input } = {} }) => form && input;

    /**
     * Processes request specific parameters and generates the temporary
     * variables needed by jaxon to initiate and process the request.
     *
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     *
     * @param {object} oRequest The request object
     *
     * @return {void}
     */
    self.process = (oRequest) => {
        // Make request parameters.
        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = hasUpload(oRequest) ?
            getFormDataParams(oRequest) : getUrlEncodedParams(oRequest);
    };
})(jaxon.ajax.parameters, jaxon.utils.types, jaxon.version);
