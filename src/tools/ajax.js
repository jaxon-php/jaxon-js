jaxon.tools.ajax = {
    /*
    Function: jaxon.tools.ajax.createRequest

    Construct an XMLHttpRequest object dependent on the capabilities of the browser.

    Returns:
    object - Javascript XHR object.
    */
    createRequest: function() {
        if ('undefined' != typeof XMLHttpRequest) {
            jaxon.tools.ajax.createRequest = function() {
                return new XMLHttpRequest();
            }
        } else if ('undefined' != typeof ActiveXObject) {
            jaxon.tools.ajax.createRequest = function() {
                try {
                    return new ActiveXObject('Msxml2.XMLHTTP.4.0');
                } catch (e) {
                    jaxon.tools.ajax.createRequest = function() {
                        try {
                            return new ActiveXObject('Msxml2.XMLHTTP');
                        } catch (e2) {
                            jaxon.tools.ajax.createRequest = function() {
                                return new ActiveXObject('Microsoft.XMLHTTP');
                            }
                            return jaxon.tools.ajax.createRequest();
                        }
                    }
                    return jaxon.tools.ajax.createRequest();
                }
            }
        } else if (window.createRequest) {
            jaxon.tools.ajax.createRequest = function() {
                return window.createRequest();
            };
        } else {
            jaxon.tools.ajax.createRequest = function() {
                throw { code: 10002 };
            };
        }

        // this would seem to cause an infinite loop, however, the function should
        // be reassigned by now and therefore, it will not loop.
        return jaxon.tools.ajax.createRequest();
    }
};
