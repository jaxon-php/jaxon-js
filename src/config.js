/*
    Class: jaxon.config

    This class contains all the default configuration settings.  These
    are application level settings; however, they can be overridden
    by including a jaxon.config definition prior to including the
    <jaxon_core.js> file, or by specifying the appropriate configuration
    options on a per call basis.
*/
var jaxon = {};

/*
    Class: jaxon.config

    This class contains all the default configuration settings.  These
    are application level settings; however, they can be overridden
    by including a jaxon.config definition prior to including the
    <jaxon_core.js> file, or by specifying the appropriate configuration
    options on a per call basis.
*/
jaxon.config = {};

/*
Class: jaxon.debug
*/
jaxon.debug = {};

/*
    Class: jaxon.debug.verbose

    Provide a high level of detail which can be used to debug hard to find problems.
*/
jaxon.debug.verbose = {}

/*
Class: jaxon.ajax
*/
jaxon.ajax = {};

/*
Class: jaxon.tools

This contains utility functions which are used throughout
the jaxon core.
*/
jaxon.tools = {};

/*
Class: jaxon.cmd

Contains the functions for page content, layout, functions and events.
*/
jaxon.cmd = {};

/*
Function: jaxon.config.setDefault

This function will set a default configuration option if it is not already set.

Parameters:
option - (string):
The name of the option that will be set.

defaultValue - (unknown):
The value to use if a value was not already set.
*/
jaxon.config.setDefault = function(option, defaultValue) {
    if ('undefined' == typeof jaxon.config[option])
        jaxon.config[option] = defaultValue;
};

/*
Object: commonHeaders

An array of header entries where the array key is the header
option name and the associated value is the value that will
set when the request object is initialized.

These headers will be set for both POST and GET requests.
*/
jaxon.config.setDefault('commonHeaders', {
    'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'
});

/*
Object: postHeaders

An array of header entries where the array key is the header
option name and the associated value is the value that will
set when the request object is initialized.
*/
jaxon.config.setDefault('postHeaders', {});

/*
Object: getHeaders

An array of header entries where the array key is the header
option name and the associated value is the value that will
set when the request object is initialized.
*/
jaxon.config.setDefault('getHeaders', {});

/*
Boolean: waitCursor

true - jaxon should display a wait cursor when making a request
false - jaxon should not show a wait cursor during a request
*/
jaxon.config.setDefault('waitCursor', false);

/*
Boolean: statusMessages

true - jaxon should update the status bar during a request
false - jaxon should not display the status of the request
*/
jaxon.config.setDefault('statusMessages', false);

/*
Object: baseDocument

The base document that will be used throughout the code for
locating elements by ID.
*/
jaxon.config.setDefault('baseDocument', document);

/*
String: requestURI

The URI that requests will be sent to.
*/
jaxon.config.setDefault('requestURI', jaxon.config.baseDocument.URL);

/*
String: defaultMode

The request mode.

'asynchronous' - The request will immediately return, the
response will be processed when (and if) it is received.

'synchronous' - The request will block, waiting for the
response.  This option allows the server to return
a value directly to the caller.
*/
jaxon.config.setDefault('defaultMode', 'asynchronous');

/*
String: defaultHttpVersion

The Hyper Text Transport Protocol version designated in the
header of the request.
*/
jaxon.config.setDefault('defaultHttpVersion', 'HTTP/1.1');

/*
String: defaultContentType

The content type designated in the header of the request.
*/
jaxon.config.setDefault('defaultContentType', 'application/x-www-form-urlencoded');

/*
Integer: defaultResponseDelayTime

The delay time, in milliseconds, associated with the
<jaxon.callback.onRequestDelay> event.
*/
jaxon.config.setDefault('defaultResponseDelayTime', 1000);

/*
Integer: defaultExpirationTime

The amount of time to wait, in milliseconds, before a request
is considered expired.  This is used to trigger the
<jaxon.callback.onExpiration event.
*/
jaxon.config.setDefault('defaultExpirationTime', 10000);

/*
String: defaultMethod

The method used to send requests to the server.

'POST' - Generate a form POST request
'GET' - Generate a GET request; parameters are appended
to the <jaxon.config.requestURI> to form a URL.
*/
jaxon.config.setDefault('defaultMethod', 'POST'); // W3C: Method is case sensitive

/*
Integer: defaultRetry

The number of times a request should be retried
if it expires.
*/
jaxon.config.setDefault('defaultRetry', 5);

/*
Object: defaultReturnValue

The value returned by <jaxon.request> when in asynchronous
mode, or when a syncrhonous call does not specify the
return value.
*/
jaxon.config.setDefault('defaultReturnValue', false);

/*
Integer: maxObjectDepth

The maximum depth of recursion allowed when serializing
objects to be sent to the server in a request.
*/
jaxon.config.setDefault('maxObjectDepth', 20);

/*
Integer: maxObjectSize

The maximum number of members allowed when serializing
objects to be sent to the server in a request.
*/
jaxon.config.setDefault('maxObjectSize', 2000);

jaxon.config.setDefault('responseQueueSize', 1000);

jaxon.config.setDefault('requestQueueSize', 1000);

/*
Class: jaxon.config.status

Provides support for updating the browser's status bar during
the request process.  By splitting the status bar functionality
into an object, the jaxon developer has the opportunity to
customize the status bar messages prior to sending jaxon requests.
*/
jaxon.config.status = {
    /*
        Function: update

        Constructs and returns a set of event handlers that will be
        called by the jaxon framework to set the status bar messages.
    */
    update: function() {
        return {
            onRequest: function() {
                window.status = 'Sending Request...';
            },
            onWaiting: function() {
                window.status = 'Waiting for Response...';
            },
            onProcessing: function() {
                window.status = 'Processing...';
            },
            onComplete: function() {
                window.status = 'Done.';
            }
        }
    },
    /*
        Function: dontUpdate

        Constructs and returns a set of event handlers that will be
        called by the jaxon framework where status bar updates
        would normally occur.
    */
    dontUpdate: function() {
        return {
            onRequest: function() {},
            onWaiting: function() {},
            onProcessing: function() {},
            onComplete: function() {}
        }
    }
};

/*
Class: jaxon.config.cursor

Provides the base functionality for updating the browser's cursor
during requests.  By splitting this functionalityh into an object
of it's own, jaxon developers can now customize the functionality
prior to submitting requests.
*/
jaxon.config.cursor = {
    /*
        Function: update

        Constructs and returns a set of event handlers that will be
        called by the jaxon framework to effect the status of the
        cursor during requests.
    */
    update: function() {
        return {
            onWaiting: function() {
                if (jaxon.config.baseDocument.body)
                    jaxon.config.baseDocument.body.style.cursor = 'wait';
            },
            onComplete: function() {
                jaxon.config.baseDocument.body.style.cursor = 'auto';
            }
        }
    },
    /*
        Function: dontUpdate

        Constructs and returns a set of event handlers that will
        be called by the jaxon framework where cursor status changes
        would typically be made during the handling of requests.
    */
    dontUpdate: function() {
        return {
            onWaiting: function() {},
            onComplete: function() {}
        }
    }
};
