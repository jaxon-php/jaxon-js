/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /**
     * The array of data bags
     * @type {object}
     */
    self.bags = {};

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {*} oVal - The value to be stringified
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
     * Processes request specific parameters and store them in a FormData object.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const toFormData = (oRequest) => {
        const rd = new FormData();
        rd.append('jxnr', oRequest.dNow.getTime());

        // Files to upload
        const input = oRequest.upload.input;
        input.files && input.files.forEach(file => rd.append(input.name, file));

        Object.keys(oRequest.functionName).forEach(sCommand =>
            rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand])));

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.append('jxnargs[]', stringify(oVal));
            }
        }

        if(oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            rd.append('jxnbags', stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = rd;
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    const toUrlEncoded = (oRequest) => {
        const rd = [];
        rd.push('jxnr=' + oRequest.dNow.getTime());

        Object.keys(oRequest.functionName).forEach(sCommand =>
            rd.push(sCommand + '=' + encodeURIComponent(oRequest.functionName[sCommand])));

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.push('jxnargs[]=' + stringify(oVal));
            }
        }

        if(oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            rd.push('jxnbags=' + stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;

        if (oRequest.method === 'GET') {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            // No body for HTTP GET requests
            rd = [];
        }

        oRequest.requestData = rd.join('&');
    };

    /**
     * Function: jaxon.ajax.parameters.process
     *
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
        const func = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            toFormData : toUrlEncoded;
        // Make request parameters.
        oRequest.dNow = new Date();
        func(oRequest);
        delete oRequest.dNow;
    };
})(jaxon.ajax.parameters);
