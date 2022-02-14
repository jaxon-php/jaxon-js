jaxon.ajax.parameters = {
    /*
    Function: jaxon.ajax.parameters.upload

    Create a parameter of type upload.

    Parameters:

    id - The id od the upload form element
    */
    /*upload: function(id) {
        return {upload: {id: id}};
    },*/

    /*
    Function: jaxon.ajax.parameters.isUpload

    Check if a parameter is of type upload.

    Parameters:

    parameter - A parameter passed to an Ajax function
    */
    /*isUpload: function(parameter) {
        return (parameter != null && typeof parameter == 'object' && typeof parameter.upload == 'object');
    },*/

    /*
    Function: jaxon.ajax.parameters.toFormData

    Processes request specific parameters and store them in a FormData object.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    toFormData: function(oRequest) {
        const rd = new FormData();
        const input = oRequest.upload.input;
        for (let i = 0, n = input.files.length; i < n; i++) {
            rd.append(input.name, input.files[i]);
        }

        for (let sCommand in oRequest.functionName) {
            if ('constructor' != sCommand) {
                rd.append(sCommand, encodeURIComponent(oRequest.functionName[sCommand]));
            }
        }
        let dNow = new Date();
        rd.append('jxnr', dNow.getTime());
        delete dNow;

        if (oRequest.parameters) {
            let i = 0;
            const iLen = oRequest.parameters.length;
            while (i < iLen) {
                let oVal = oRequest.parameters[i];
                // Don't include upload parameter
                /*if(jaxon.ajax.parameters.isUpload(oVal)) {
                    continue;
                }*/
                if ('object' == typeof oVal && null != oVal) {
                    try {
                        oVal = JSON.stringify(oVal);
                    } catch (e) {
                        oVal = '';
                        // do nothing, if the debug module is installed
                        // it will catch the exception and handle it
                    }
                    oVal = encodeURIComponent(oVal);
                    rd.append('jxnargs[]', oVal);
                    ++i;
                } else {
                    if ('undefined' == typeof oVal || null == oVal) {
                        rd.append('jxnargs[]', '*');
                    } else {
                        let sPrefix = '';
                        const sType = typeof oVal;
                        if ('string' === sType)
                            sPrefix = 'S';
                        else if ('boolean' === sType)
                            sPrefix = 'B';
                        else if ('number' === sType)
                            sPrefix = 'N';
                        oVal = encodeURIComponent(oVal);
                        rd.append('jxnargs[]', sPrefix + oVal);
                    }
                    ++i;
                }
            }
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
        let separator = '';
        for (let sCommand in oRequest.functionName) {
            if ('constructor' != sCommand) {
                rd.push(separator);
                rd.push(sCommand);
                rd.push('=');
                rd.push(encodeURIComponent(oRequest.functionName[sCommand]));
                separator = '&';
            }
        }
        let dNow = new Date();
        rd.push('&jxnr=');
        rd.push(dNow.getTime());
        delete dNow;

        if (oRequest.parameters) {
            let i = 0;
            const iLen = oRequest.parameters.length;
            while (i < iLen) {
                let oVal = oRequest.parameters[i];
                // Don't include upload parameter
                /*if(jaxon.ajax.parameters.isUpload(oVal)) {
                    continue;
                }*/
                if ('object' == typeof oVal && null != oVal) {
                    try {
                        // const oGuard = {};
                        // oGuard.depth = 0;
                        // oGuard.maxDepth = oRequest.maxObjectDepth;
                        // oGuard.size = 0;
                        // oGuard.maxSize = oRequest.maxObjectSize;
                        // oVal = xt._objectToXML(oVal, oGuard);
                        oVal = JSON.stringify(oVal);
                    } catch (e) {
                        oVal = '';
                        // do nothing, if the debug module is installed
                        // it will catch the exception and handle it
                    }
                    rd.push('&jxnargs[]=');
                    oVal = encodeURIComponent(oVal);
                    rd.push(oVal);
                    ++i;
                } else {
                    rd.push('&jxnargs[]=');

                    if ('undefined' == typeof oVal || null == oVal) {
                        rd.push('*');
                    } else {
                        const sType = typeof oVal;
                        if ('string' == sType)
                            rd.push('S');
                        else if ('boolean' == sType)
                            rd.push('B');
                        else if ('number' == sType)
                            rd.push('N');
                        oVal = encodeURIComponent(oVal);
                        rd.push(oVal);
                    }
                    ++i;
                }
            }
        }

        oRequest.requestURI = oRequest.URI;

        if ('GET' == oRequest.method) {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') == -1 ? '?' : '&';
            oRequest.requestURI += rd.join('');
            rd = [];
        }

        oRequest.requestData = rd.join('');
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
        // Make request parameters.
        if (oRequest.upload != false && oRequest.upload.ajax && oRequest.upload.input)
            jaxon.ajax.parameters.toFormData(oRequest);
        else
            jaxon.ajax.parameters.toUrlEncoded(oRequest);
    }
};
