jaxon.tools.upload = {
    /*
    Function: jaxon.tools.upload.createIframe

    Create an iframe for file upload.
    */
    createIframe: function(oRequest) {
        const target = 'jaxon_upload_' + oRequest.upload.id;
        // Delete the iframe, in the case it already exists
        jaxon.cmd.node.remove(target);
        // Create the iframe.
        jaxon.cmd.node.insert(oRequest.upload.form, 'iframe', target);
        oRequest.upload.iframe = jaxon.tools.dom.$(target);
        oRequest.upload.iframe.name = target;
        oRequest.upload.iframe.style.display = 'none';
        // Set the form attributes
        oRequest.upload.form.method = 'POST';
        oRequest.upload.form.enctype = 'multipart/form-data';
        oRequest.upload.form.action = jaxon.config.requestURI;
        oRequest.upload.form.target = target;
        return true;
    },

    /*
    Function: jaxon.tools.upload._initialize

    Check upload data and initialize the request.
    */
    _initialize: function(oRequest) {
        if (!oRequest.upload) {
            return false;
        }
        oRequest.upload = { id: oRequest.upload, input: null, form: null, ajax: oRequest.ajax };

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
        if (typeof input.name === 'undefined') {
            console.log('The upload input field with id ' + oRequest.upload.id + ' has no name attribute');
            return false;
        }
        oRequest.upload.input = input;
        oRequest.upload.form = input.form;
        // Having the input field is enough for upload with FormData (Ajax).
        if (oRequest.upload.ajax != false)
            return true;
        // For upload with iframe, we need to get the form too.
        if (!input.form) {
            // Find the input form
            let form = input;
            while (form !== null && form.nodeName !== 'FORM')
                form = form.parentNode;
            if (form === null) {
                console.log('The upload input field with id ' + oRequest.upload.id + ' is not in a form');
                return false;
            }
            oRequest.upload.form = form;
        }
        // If FormData feature is not available, files are uploaded with iframes.
        jaxon.tools.upload.createIframe(oRequest);

        return true;
    },

    /*
    Function: jaxon.tools.upload.initialize

    Check upload data and initialize the request.

    Parameters:

    oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
    */
    initialize: function(oRequest) {
        jaxon.tools.upload._initialize(oRequest);

        // The content type is not set when uploading a file with FormData.
        // It will be set by the browser.
        if (!oRequest.upload || !oRequest.upload.ajax || !oRequest.upload.input) {
            oRequest.append('postHeaders', {
                'content-type': oRequest.contentType
            });
        }
    }
};
