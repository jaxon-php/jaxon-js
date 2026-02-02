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
     * Set the values in an entry in the databag.
     *
     * @param {string} sBagName The data bag name.
     * @param {string} sBagKey The data bag entry key.
     * @param {mixed} xValue The entry value.
     *
     * @return {bool}
     */
    self.setBagEntry = (sBagName, sBagKey, xValue) => {
        if (databags[sBagName] === undefined) {
            return false;
        }

        databags[sBagName][sBagKey] = xValue;
        return true;
    };

    /**
     * Get the values in an entry in the databag.
     *
     * @param {string} sBagName The data bag name.
     * @param {string} sBagKey The data bag entry key.
     *
     * @return {object|undefined}
     */
    self.getBagEntry = (sBagName, sBagKey) => databags[sBagName] === undefined ?
        undefined : databags[sBagName][sBagKey];

    /**
     * Set a value in the databag.
     *
     * @param {string} sBagName The data bag name.
     * @param {string} sBagKey The data bag entry key.
     * @param {string} sDataKey The data bag value key.
     * @param {mixed} xValue The entry value.
     *
     * @return {bool}
     */
    self.setBagValue = (sBagName, sBagKey, sDataKey, xValue) => {
        const xBagEntry = self.getBagEntry(sBagName, sBagKey);
        // We need an object to get the data key from.
        if (xBagEntry === undefined || !types.isObject(xBagEntry)) {
            return false;
        }

        const xBag = dom.getInnerObject(sDataKey, xBagEntry);
        if (xBag === null) {
            return false;
        }

        xBag.node[xBag.attr] = xValue;
        return true;
    };

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
        const xBagEntry = self.getBagEntry(sBagName, sBagKey);
        // We need an object to get the data key from.
        if (xBagEntry === undefined || !types.isObject(xBagEntry)) {
            return xDefault;
        }

        return dom.findObject(sDataKey, xBagEntry) ?? xDefault;
    };

    /**
     * Save data in the databags.
     *
     * @param {object} oValues The databags values.
     *
     * @return {void}
     */
    self.setBags = (oValues) => {
        // Make sure the values are objects.
        if (types.isObject(oValues)) {
            Object.keys(oValues).forEach(sBagName => {
                if (types.isObject(oValues[sBagName])) {
                    databags[sBagName] = oValues[sBagName];
                }
            });
        }
    };

    /**
     * Get multiple values from the databag.
     *
     * @param {array} aBags The data bag names.
     *
     * @return {object}
     */
    const getBags = (aBags) => aBags.reduce((oValues, sBagName) =>
        databags[sBagName] === undefined || databags[sBagName] === null ? oValues : {
            ...oValues,
            [sBagName]: databags[sBagName],
        }, {});

    /**
     * Check the validity of a call argument.
     *
     * @param {mixed} xArg
     *
     * @return {bool}
     */
    const callArgIsValid = (xArg) => xArg !== undefined && !types.isFunction(xArg);

    /**
     * Encode a parameter for the request.
     *
     * @param {object} xParam request parameter.
     *
     * @return {string}
     */
    const encodeParameter = (xParam) => encodeURIComponent(JSON.stringify(xParam));

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
        // is an array-like object, that we need to convert to a true array => [...parameters].
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
        fSetter('jxncall', encodeParameter({
            ...func,
            args: [...parameters].filter(xArg => callArgIsValid(xArg)),
        }));
        // Add the databag values, if there's any.
        if (bags.length > 0) {
            fSetter('jxnbags', encodeParameter(getBags(bags)));
        }
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
        if(files) {
            // The "files" var is an array-like object, that we need to convert to a true array.
            [...files].forEach(file => oRequest.requestData.append(field, file));
        }
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
