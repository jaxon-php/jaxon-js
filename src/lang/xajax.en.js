/**
 * translation for: xajax v.x.x
 * @version: 1.0.0
 * @author: mic <info@joomx.com>
 * @copyright xajax project
 * @license GNU/GPL
 * @package xajax x.x.x
 * @since v.x.x.x
 * save as UTF-8
 */

if ('undefined' != typeof xajax.debug) {
	/*
		Array: text
	*/
	xajax.debug.text = [];
	xajax.debug.text[100] = 'WARNING: ';
	xajax.debug.text[101] = 'ERROR: ';
	xajax.debug.text[102] = 'XAJAX DEBUG MESSAGE:\n';
	xajax.debug.text[103] = '...\n[LONG RESPONSE]\n...';
	xajax.debug.text[104] = 'SENDING REQUEST';
	xajax.debug.text[105] = 'SENT [';
	xajax.debug.text[106] = ' bytes]';
	xajax.debug.text[107] = 'CALLING: ';
	xajax.debug.text[108] = 'URI: ';
	xajax.debug.text[109] = 'INITIALIZING REQUEST';
	xajax.debug.text[110] = 'PROCESSING PARAMETERS [';
	xajax.debug.text[111] = ']';
	xajax.debug.text[112] = 'NO PARAMETERS TO PROCESS';
	xajax.debug.text[113] = 'PREPARING REQUEST';
	xajax.debug.text[114] = 'STARTING XAJAX CALL (deprecated: use xajax.request instead)';
	xajax.debug.text[115] = 'STARTING XAJAX REQUEST';
	xajax.debug.text[116] = 'No response processor is available to process the response from the server.\n';
	xajax.debug.text[117] = '.\nCheck for error messages from the server.';
	xajax.debug.text[118] = 'RECEIVED [status: ';
	xajax.debug.text[119] = ', size: ';
	xajax.debug.text[120] = ' bytes, time: ';
	xajax.debug.text[121] = 'ms]:\n';
	xajax.debug.text[122] = 'The server returned the following HTTP status: ';
	xajax.debug.text[123] = '\nRECEIVED:\n';
	xajax.debug.text[124] = 'The server returned a redirect to:<br />';
	xajax.debug.text[125] = 'DONE [';
	xajax.debug.text[126] = 'ms]';
	xajax.debug.text[127] = 'INITIALIZING REQUEST OBJECT';

	/*
		Array: exceptions
	*/
	xajax.debug.exceptions = [];
	xajax.debug.exceptions[10001] = 'Invalid response XML: The response contains an unknown tag: {data}.';
	xajax.debug.exceptions[10002] = 'GetRequestObject: XMLHttpRequest is not available, xajax is disabled.';
	xajax.debug.exceptions[10003] = 'Queue overflow: Cannot push object onto queue because it is full.';
	xajax.debug.exceptions[10004] = 'Invalid response XML: The response contains an unexpected tag or text: {data}.';
	xajax.debug.exceptions[10005] = 'Invalid request URI: Invalid or missing URI; autodetection failed; please specify a one explicitly.';
	xajax.debug.exceptions[10006] = 'Invalid response command: Malformed response command received.';
	xajax.debug.exceptions[10007] = 'Invalid response command: Command [{data}] is not a known command.';
	xajax.debug.exceptions[10008] = 'Element with ID [{data}] not found in the document.';
	xajax.debug.exceptions[10009] = 'Invalid request: Missing function name parameter.';
	xajax.debug.exceptions[10010] = 'Invalid request: Missing function object parameter.';

	xajax.debug.lang = {};
	xajax.debug.lang.isLoaded = true;
}

if (typeof xajax.config != 'undefined' && typeof xajax.config.status != 'undefined') {
	/*
		Object: update
	*/
	xajax.config.status.update = function() {
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
