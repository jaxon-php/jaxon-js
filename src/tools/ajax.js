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
    },

    /*
    Function: jaxon.tools.ajax.retry

    Maintains a retry counter for the given object.

    Parameters:
    obj - (object):
        The object to track the retry count for.
    count - (integer):
        The number of times the operation should be attempted before a failure is indicated.

    Returns:
    true - The object has not exhausted all the retries.
    false - The object has exhausted the retry count specified.
    */
    retry: function(obj, count) {
        var retries = obj.retries;
        if(retries) {
            --retries;
            if(1 > retries)
                return false;
        } else retries = count;
        obj.retries = retries;
        return true;
    }
};
