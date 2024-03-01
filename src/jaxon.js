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
    // Pseudo command needed to complete queued commands processing.
    register('rcmplt', ({ request }) => {
        ajax.request.complete(request);
        return true;
    }, 'Response complete');

    register('dom.assign', cmd.body.assign, 'Dom::Assign');
    register('dom.append', cmd.body.append, 'Dom::Append');
    register('dom.prepend', cmd.body.prepend, 'Dom::Prepend');
    register('dom.replace', cmd.body.replace, 'Dom::Replace');
    register('dom.clear', cmd.body.clear, 'Dom::Clear');
    register('dom.remove', cmd.body.remove, 'Dom::Remove');
    register('dom.create', cmd.body.create, 'Dom::Create');
    register('dom.insert.before', cmd.body.insert, 'Dom::InsertBefore');
    register('dom.insert.after', cmd.body.insertAfter, 'Dom::InsertAfter');

    register('script.sleep', cmd.script.sleep, 'Script::Sleep');
    register('script.call', cmd.script.call, 'Script::CallJsFunction');
    register('script.alert', cmd.script.alert, 'Script::Alert');
    register('script.confirm', cmd.script.confirm, 'Script::Confirm');
    register('script.redirect', cmd.script.redirect, 'Script::Redirect');

    register('handler.event.set', cmd.event.setEventHandler, 'Script::SetEventHandler');
    register('handler.event.add', cmd.event.addEventHandler, 'Script::AddEventHandler');
    register('handler.add', cmd.event.addHandler, 'Script::AddHandler');
    register('handler.remove', cmd.event.removeHandler, 'Script::RemoveHandler');

    register('script.debug', ({ message }) => {
        console.log(message);
        return true;
    }, 'Debug message');

    // JQuery
    register('jquery.call', cmd.script.jquery, 'JQuery::CallSelector');
    // Pagination
    register('pg.paginate', cmd.script.paginate, 'Paginator::Paginate');
    // Data bags
    register('databag.set', cmd.script.databag, 'Databag:SetValues');

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
