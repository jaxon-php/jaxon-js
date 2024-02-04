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
 * Register the command handlers provided by the library, and initialize the message object.
 */
(function(register, cmd, ajax) {
    register('rcmplt', ({ request }) => {
        ajax.request.complete(request);
        return true;
    }, 'Response complete');

    register('as', cmd.body.assign, 'assign/clear');
    register('ap', cmd.body.append, 'append');
    register('pp', cmd.body.prepend, 'prepend');
    register('rp', cmd.body.replace, 'replace');
    register('rm', cmd.body.remove, 'remove');
    register('ce', cmd.body.create, 'create');
    register('ie', cmd.body.insert, 'insert');
    register('ia', cmd.body.insertAfter, 'insertAfter');
    register('c:as', cmd.body.contextAssign, 'context assign');
    register('c:ap', cmd.body.contextAppend, 'context append');
    register('c:pp', cmd.body.contextPrepend, 'context prepend');

    register('s', cmd.script.sleep, 'sleep');
    register('jc', cmd.script.call, 'call js function');
    register('al', cmd.script.alert, 'alert');
    register('cc', cmd.script.confirm, 'confirm');
    register('rd', cmd.script.redirect, 'redirect');

    register('se', cmd.event.setEventHandler, 'setEventHandler');
    register('ae', cmd.event.addEventHandler, 'addEventHandler');
    register('ah', cmd.event.addHandler, 'addHandler');
    register('rh', cmd.event.removeHandler, 'removeHandler');

    register('dbg', ({ data: message }) => {
        console.log(message);
        return true;
    }, 'Debug message');

    /**
     * Class: jaxon.ajax.message
     */
    ajax.message = {
        /**
         * Print a success message on the screen.
         *
         * @param {string} content The message content.
         * @param {string} title The message title.
         *
         * @returns {void}
         */
        success: (content, title) => alert(content),

        /**
         * Print an info message on the screen.
         *
         * @param {string} content The message content.
         * @param {string} title The message title.
         *
         * @returns {void}
         */
        info: (content, title) => alert(content),

        /**
         * Print a warning message on the screen.
         *
         * @param {string} content The message content.
         * @param {string} title The message title.
         *
         * @returns {void}
         */
        warning: (content, title) => alert(content),

        /**
         * Print an error message on the screen.
         *
         * @param {string} content The message content.
         * @param {string} title The message title.
         *
         * @returns {void}
         */
        error: (content, title) => alert(content),

        /**
         * Ask a confirm question to the user.
         *
         * @param {string} question The confirm question.
         * @param {string} title The confirm title.
         * @param {callable} yesCallback The function to call if the user answers yesn.
         * @param {callable} noCallback The function to call if the user answers no.
         *
         * @returns {void}
         */
        confirm: (question, title, yesCallback, noCallback) => {
            if(confirm(question)) {
                yesCallback();
                return;
            }
            noCallback && noCallback();
        },
    };
})(jaxon.register, jaxon.cmd, jaxon.ajax);
