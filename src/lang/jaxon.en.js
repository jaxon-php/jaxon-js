/**
 * translation for: jaxon v.x.x
 * @version: 1.0.0
 * @author: mic <info@joomx.com>
 * @copyright jaxon project
 * @license GNU/GPL
 * @package jaxon x.x.x
 * @since v.x.x.x
 * save as UTF-8
 */

if ('undefined' != typeof jaxon.debug) {
    /*
        Array: text
    */
    jaxon.debug.text = [];
    jaxon.debug.text[100] = 'WARNING: ';
    jaxon.debug.text[101] = 'ERROR: ';
    jaxon.debug.text[102] = 'XAJAX DEBUG MESSAGE:\n';
    jaxon.debug.text[103] = '...\n[LONG RESPONSE]\n...';
    jaxon.debug.text[104] = 'SENDING REQUEST';
    jaxon.debug.text[105] = 'SENT [';
    jaxon.debug.text[106] = ' bytes]';
    jaxon.debug.text[107] = 'CALLING: ';
    jaxon.debug.text[108] = 'URI: ';
    jaxon.debug.text[109] = 'INITIALIZING REQUEST';
    jaxon.debug.text[110] = 'PROCESSING PARAMETERS [';
    jaxon.debug.text[111] = ']';
    jaxon.debug.text[112] = 'NO PARAMETERS TO PROCESS';
    jaxon.debug.text[113] = 'PREPARING REQUEST';
    jaxon.debug.text[114] = 'STARTING XAJAX CALL (deprecated: use jaxon.request instead)';
    jaxon.debug.text[115] = 'STARTING XAJAX REQUEST';
    jaxon.debug.text[116] = 'No response processor is available to process the response from the server.\n';
    jaxon.debug.text[117] = '.\nCheck for error messages from the server.';
    jaxon.debug.text[118] = 'RECEIVED [status: ';
    jaxon.debug.text[119] = ', size: ';
    jaxon.debug.text[120] = ' bytes, time: ';
    jaxon.debug.text[121] = 'ms]:\n';
    jaxon.debug.text[122] = 'The server returned the following HTTP status: ';
    jaxon.debug.text[123] = '\nRECEIVED:\n';
    jaxon.debug.text[124] = 'The server returned a redirect to:<br />';
    jaxon.debug.text[125] = 'DONE [';
    jaxon.debug.text[126] = 'ms]';
    jaxon.debug.text[127] = 'INITIALIZING REQUEST OBJECT';

    /*
        Array: exceptions
    */
    jaxon.debug.exceptions = [];
    jaxon.debug.exceptions[10001] = 'Invalid response XML: The response contains an unknown tag: {data}.';
    jaxon.debug.exceptions[10002] = 'GetRequestObject: XMLHttpRequest is not available, jaxon is disabled.';
    jaxon.debug.exceptions[10003] = 'Queue overflow: Cannot push object onto queue because it is full.';
    jaxon.debug.exceptions[10004] = 'Invalid response XML: The response contains an unexpected tag or text: {data}.';
    jaxon.debug.exceptions[10005] = 'Invalid request URI: Invalid or missing URI; autodetection failed; please specify a one explicitly.';
    jaxon.debug.exceptions[10006] = 'Invalid response command: Malformed response command received.';
    jaxon.debug.exceptions[10007] = 'Invalid response command: Command [{data}] is not a known command.';
    jaxon.debug.exceptions[10008] = 'Element with ID [{data}] not found in the document.';
    jaxon.debug.exceptions[10009] = 'Invalid request: Missing function name parameter.';
    jaxon.debug.exceptions[10010] = 'Invalid request: Missing function object parameter.';

    jaxon.debug.lang = {};
    jaxon.debug.lang.isLoaded = true;
}

if (typeof jaxon.config != 'undefined' && typeof jaxon.config.status != 'undefined') {
    /*
        Object: update
    */
    jaxon.config.status.update = function() {
        return {
            onRequest: function() {
                window.status = 'Sending request...';
            },
            onWaiting: function() {
                window.status = 'Waiting for response...';
            },
            onProcessing: function() {
                window.status = 'Processing...';
            },
            onComplete: function() {
                window.status = 'Done.';
            }
        }
    }
}