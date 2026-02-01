/**
 * Class: jaxon.ajax.parameters
 *
 * global: jaxon
 */

(function(self, types, dom, version) {
    /**
     * The array of data bags
     *
     * @type {object}
     */
    const databags = {};

    /**
     * Save data in the data bag.
     *
     * @param {string} sBagName   The data bag name.
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBag = (sBagName, oValues) => databags[sBagName] = oValues;

    /**
     * Save data in the data bag.
     *
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBags = (oValues) => Object.keys(oValues)
        .forEach(sBagName => self.setBag(sBagName, oValues[sBagName]));

    /**
     * Get a single value from the databag.
     *
     * @param {string} sBagName The data bag name.
     * @param {string} sBagKey The data bag entry key.
     * @param {string} sDataKey The data bag value key.
     * @param {mixed} xDefault The default value.
     *
     * @return {mixed}
     */
    self.getBagValue = (sBagName, sBagKey, sDataKey, xDefault) => {
        const xValue = dom.findObject(`${sBagName}.${sBagKey}.${sDataKey}`, databags);
        return xValue !== null ? xValue : xDefault;
    };

    /**
     * Get multiple values from the databag.
     *
     * @param {array} aBags The data bag names.
     *
     * @return {object}
     */
    const getBagsValues = (aBags) => aBags.reduce((oValues, sBagName) =>
        databags[sBagName] === undefined || databags[sBagName] === null ? oValues : {
            ...oValues,
            [sBagName]: databags[sBagName],
        }, {});

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
            args: [...parameters].filter(xParam => xParam !== undefined && !types.isFunction(xParam)),
        })));
        // Add the databag values, if required.
        bags.length > 0 && fSetter('jxnbags', encodeURIComponent(JSON.stringify(getBagsValues(bags))));
    };

    /**
     * Processes request specific parameters and store them in a FormData object.
     *
     * @param {object} oRequest
     *
     * @return {FormData}
     */
    const setFormDataParams = (oRequest) => {
        oRequest.requestData = new FormData();
        setParams(oRequest, (sParam, sValue) => oRequest.requestData.append(sParam, sValue));

        // Files to upload
        const { name: field, files } = oRequest.upload.input;
        // The "files" var is an array-like object, that we need to convert to a real array.
        files && [...files].forEach(file => oRequest.requestData.append(field, file));
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {string}
     */
    const setUrlEncodedParams = (oRequest) => {
        const rd = [];
        setParams(oRequest, (sParam, sValue) => rd.push(sParam + '=' + sValue));

        if (oRequest.method === 'POST') {
            oRequest.requestData = rd.join('&');
            return;
        }
        // Move the parameters to the URL for HTTP GET requests
        oRequest.requestURI += (oRequest.requestURI.indexOf('?') === -1 ? '?' : '&') + rd.join('&');
        oRequest.requestData = ''; // The request body is empty
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
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     *
     * @param {object} oRequest The request object
     *
     * @return {void}
     */
    self.process = (oRequest) => hasUpload(oRequest) ?
        setFormDataParams(oRequest) : setUrlEncodedParams(oRequest);
})(jaxon.ajax.parameters, jaxon.utils.types, jaxon.utils.dom, jaxon.version);
