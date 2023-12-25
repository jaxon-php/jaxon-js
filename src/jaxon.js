/*
    File: jaxon.js

    This file contains the definition of the main jaxon javascript core.

    This is the client side code which runs on the web browser or similar web enabled application.
    Include this in the HEAD of each page for which you wish to use jaxon.
*/

/**
 * Initiates a request to the server.
 */
jaxon.request = jaxon.ajax.request.execute;

/**
 * Registers a new command handler.
 * Shortcut to <jaxon.ajax.handler.register>
 */
jaxon.register = jaxon.ajax.handler.register;

/**
 * Shortcut to <jaxon.utils.dom.$>.
 */
jaxon.$ = jaxon.utils.dom.$;

/**
 * Shortcut to <jaxon.utils.form.getValues>.
 */
jaxon.getFormValues = jaxon.utils.form.getValues;

/**
 * Prints various types of messages on the user screen.
 */
jaxon.msg = jaxon.ajax.message;

/**
 * Shortcut to <jaxon.cmd.script>.
 */
jaxon.js = jaxon.cmd.script;

/**
 * Indicates if jaxon module is loaded.
 */
jaxon.isLoaded = true;

/**
 * Register the command handlers provided by the library.
 */
(function(register, response, cmd) {
    register('rcmplt', ({ request }) => {
        response.complete(request);
        return true;
    }, 'Response complete');

    register('css', cmd.style.add, 'includeCSS');
    register('rcss', cmd.style.remove, 'removeCSS');
    register('wcss', cmd.style.waitForCSS, 'waitForCSS');

    register('as', cmd.node.assign, 'assign/clear');
    register('ap', cmd.node.append, 'append');
    register('pp', cmd.node.prepend, 'prepend');
    register('rp', cmd.node.replace, 'replace');
    register('rm', cmd.node.remove, 'remove');
    register('ce', cmd.node.create, 'create');
    register('ie', cmd.node.insert, 'insert');
    register('ia', cmd.node.insertAfter, 'insertAfter');
    register('c:as', cmd.node.contextAssign, 'context assign');
    register('c:ap', cmd.node.contextAppend, 'context append');
    register('c:pp', cmd.node.contextPrepend, 'context prepend');

    register('s', cmd.script.sleep, 'sleep');
    register('ino', cmd.script.includeScriptOnce, 'includeScriptOnce');
    register('in', cmd.script.includeScript, 'includeScript');
    register('rjs', cmd.script.removeScript, 'removeScript');
    register('wf', cmd.script.waitFor, 'waitFor');
    register('js', cmd.script.execute, 'execute Javascript');
    register('jc', cmd.script.call, 'call js function');
    register('sf', cmd.script.setFunction, 'setFunction');
    register('wpf', cmd.script.wrapFunction, 'wrapFunction');
    register('al', cmd.script.alert, 'alert');
    register('cc', cmd.script.confirm, 'confirm');
    register('rd', cmd.script.redirect, 'redirect');

    register('ci', cmd.form.createInput, 'createInput');
    register('ii', cmd.form.insertInput, 'insertInput');
    register('iia', cmd.form.insertInputAfter, 'insertInputAfter');

    register('ev', cmd.event.setEvent, 'setEvent');
    register('ah', cmd.event.addHandler, 'addHandler');
    register('rh', cmd.event.removeHandler, 'removeHandler');

    register('dbg', ({ data: message }) => {
        console.log(message);
        return true;
    }, 'Debug message');
})(jaxon.register, jaxon.ajax.response, jaxon.cmd);
