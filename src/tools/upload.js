jaxon.tools.upload = {
    /*
    Function: jaxon.tools.upload._initialize

    Check upload data and initialize the request.
    */
    _initialize: function(oRequest) {
        if (!oRequest.upload) {
            return false;
        }

        oRequest.upload = {
            id: oRequest.upload,
            input: null,
            form: null,
            ajax: oRequest.ajax,
        };
        const input = jaxon.tools.dom.$(oRequest.upload.id);

        if (!input) {
            console.log('Unable to find input field for file upload with id ' + oRequest.upload.id);
            return false;
        }
        if (input.type !== 'file') {
            console.log('The upload input field with id ' + oRequest.upload.id + ' is not of type file');
            return false;
        }
        if (input.files.length === 0) {
            console.log('There is no file selected for upload in input field with id ' + oRequest.upload.id);
            return false;
        }
        if (input.name === undefined) {
            console.log('The upload input field with id ' + oRequest.upload.id + ' has no name attribute');
            return false;
        }
        oRequest.upload.input = input;
        oRequest.upload.form = input.form;
        return true;
    },

    /*
    Function: jaxon.tools.upload.initialize

    Check upload data and initialize the request.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    initialize: function(oRequest) {
        // The content type is not set when uploading a file with FormData.
        // It will be set by the browser.
        if (!jaxon.tools.upload._initialize(oRequest)) {
            oRequest.append('postHeaders', {
                'content-type': oRequest.contentType
            });
        }
    }
};
