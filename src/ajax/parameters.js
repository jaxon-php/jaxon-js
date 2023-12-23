/**
 * Class: jaxon.ajax.parameters
 */

(function(self, version) {
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
        const sType = typeof oVal;
        if (sType === 'object') {
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
     * Sets the request parameters in a container.
     *
     * @param {object} oRequest The request object
     * @param {callable} fSetter A function that sets a single parameter
     *
     * @return {void}
     */
    const setParams = (oRequest, fSetter) => {
        fSetter('jxnr', oRequest.dNow.getTime());
        fSetter('jxnv', `${version.major}.${version.minor}.${version.patch}`);

        Object.keys(oRequest.functionName).forEach(sCommand =>
            fSetter(sCommand, encodeURIComponent(oRequest.functionName[sCommand])));
        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                fSetter('jxnargs[]', stringify(oVal));
            }
        }
        if (oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            fSetter('jxnbags', stringify(oValues));
        }
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
        input.files && input.files.forEach(file => rd.append(input.name, file));
        return rd;
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const getUrlEncodedParams = (oRequest) => {
        const rd = [];
        setParams(oRequest, (sParam, sValue) => rd.push(sParam + '=' + sValue));

        // Move the parameters to the URL for HTTP GET requests
        if (oRequest.method === 'GET') {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            rd = [];
        }
        return rd.join('&');
    };

    /**
     * Processes request specific parameters and generates the temporary
     * variables needed by jaxon to initiate and process the request.
     *
     * @param {object} oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
     *
     * @return {void}
     *
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     */
    self.process = (oRequest) => {
        // Make request parameters.
        oRequest.dNow = new Date();
        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            getFormDataParams(oRequest) : getUrlEncodedParams(oRequest);
        delete oRequest.dNow;
    };
})(jaxon.ajax.parameters, jaxon.version);
