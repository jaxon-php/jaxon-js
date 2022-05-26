jaxon.ajax.parameters = {
    /**
     * The array of data bags
     * @type {object}
     */
    bags: {},

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {*} oVal - The value to be stringified
     *
     * @returns {string}
     */
    stringify: function(oVal) {
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
    },

    /*
    Function: jaxon.ajax.parameters.toFormData

    Processes request specific parameters and store them in a FormData object.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    toFormData: function(oRequest) {
        const rd = new FormData();
        rd.append('jxnr', oRequest.dNow.getTime());

        // Files to upload
        const input = oRequest.upload.input;
        for (const file of input.files) {
            rd.append(input.name, file);
        }

        for (let sCommand in oRequest.functionName) {
            rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand]));
        }

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.append('jxnargs[]', jaxon.ajax.parameters.stringify(oVal));
            }
        }

        if (oRequest.bags) {
            const oValues = {};
            for (const sBag of oRequest.bags) {
                oValues[sBag] = jaxon.ajax.parameters.bags[sBag] ?
                    jaxon.ajax.parameters.bags[sBag] : '*';
            }
            rd.append('jxnbags', jaxon.ajax.parameters.stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = rd;
    },

    /*
    Function: jaxon.ajax.parameters.toUrlEncoded

    Processes request specific parameters and store them in an URL encoded string.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    toUrlEncoded: function(oRequest) {
        const rd = [];
        rd.push('jxnr=' + oRequest.dNow.getTime());

        for (const sCommand in oRequest.functionName) {
            rd.push(sCommand + '=' + encodeURIComponent(oRequest.functionName[sCommand]));
        }

        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                rd.push('jxnargs[]=' + jaxon.ajax.parameters.stringify(oVal));
            }
        }

        if (oRequest.bags) {
            const oValues = {};
            for (const sBag of oRequest.bags) {
                oValues[sBag] = jaxon.ajax.parameters.bags[sBag] ?
                    jaxon.ajax.parameters.bags[sBag] : '*';
            }
            rd.push('jxnbags=' + jaxon.ajax.parameters.stringify(oValues));
        }

        oRequest.requestURI = oRequest.URI;

        if ('GET' === oRequest.method) {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            rd = [];
        }

        oRequest.requestData = rd.join('&');
    },

    /*
    Function: jaxon.ajax.parameters.process

    Processes request specific parameters and generates the temporary
    variables needed by jaxon to initiate and process the request.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>

    Note:
    This is called once per request; upon a request failure, this
    will not be called for additional retries.
    */
    process: function(oRequest) {
        const func = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            jaxon.ajax.parameters.toFormData : jaxon.ajax.parameters.toUrlEncoded;
        // Make request parameters.
        oRequest.dNow = new Date();
        func(oRequest);
        delete oRequest.dNow;
    }
};
