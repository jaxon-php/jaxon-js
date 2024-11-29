/**
 * Class: jaxon.ajax.parameters
 */

(function(self, str, version) {
    /**
     * The array of data bags
     *
     * @type {object}
     */
    self.bags = {};

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {mixed} oVal - The value to be stringified
     *
     * @returns {string}
     */
    const stringify = (oVal) => {
        if (oVal === undefined ||  oVal === null) {
            return '*';
        }
        const sType = str.typeOf(oVal);
        if (sType === 'object' || sType === 'array') {
            try {
                return encodeURIComponent(JSON.stringify(oVal));
            } catch (e) {
                oVal = '';
                // do nothing, if the debug module is installed
                // it will catch the exception and handle it
            }
        }
        oVal = encodeURIComponent(oVal);
        if (sType === 'string') {
            return 'S' + oVal;
        }
        if (sType === 'boolean') {
            return 'B' + oVal;
        }
        if (sType === 'number') {
            return 'N' + oVal;
        }
        return oVal;
    };

    /**
     * Make the databag object to send in the HTTP request.
     *
     * @param {array} aKeys The keys of values to get from the data bag.
     *
     * @return {object}
     */
    const getBagsParam = (aKeys) => JSON.stringify(aKeys.reduce((oValues, sKey) => ({
        ...oValues,
        [sKey]: self.bags[sKey] ?? '*' }
    ), {}));

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
        fSetter('jxnv', `${version.major}.${version.minor}.${version.patch}`);

        Object.keys(func).forEach(sParam => fSetter(sParam, encodeURIComponent(func[sParam])));

        // The parameters value was assigned from the js "arguments" var in a function. So it
        // is an array-like object, that we need to convert to a real array => [...parameters].
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
        [...parameters].forEach(xParam => fSetter('jxnargs[]', stringify(xParam)));

        bags.length > 0 && fSetter('jxnbags', encodeURIComponent(getBagsParam(bags)));
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
        const input = oRequest.upload.input;
        // The "input.files" var is an array-like object, that we need to convert to a real array.
        input.files && [...input.files].forEach(file => rd.append(input.name, file));
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
        oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
        oRequest.requestURI += rd.join('&');
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
    const hasUpload = ({ upload }) => upload && upload.form && upload.input;

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
})(jaxon.ajax.parameters, jaxon.utils.string, jaxon.version);
