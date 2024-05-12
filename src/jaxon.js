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
 * Shortcut to <jaxon.utils.dom.ready>.
 */
jaxon.dom.ready = jaxon.utils.dom.ready;

/**
 * Shortcut to <jaxon.utils.form.getValues>.
 */
jaxon.getFormValues = jaxon.utils.form.getValues;

/**
 * Indicates if jaxon module is loaded.
 */
jaxon.isLoaded = true;

/**
 * Register the command handlers provided by the library, and initialize the message object.
 */
(function(register, cmd, ajax, dialog) {
    // Pseudo command needed to complete queued commands processing.
    register('response.complete', ({ request }) => {
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
    // Dialogs
    register('dialog.message', dialog.cmd.showMessage, 'Dialog:ShowMessage');
    register('dialog.modal.show', dialog.cmd.showModal, 'Dialog:ShowModal');
    register('dialog.modal.hide', dialog.cmd.hideModal, 'Dialog:HideModal');
})(jaxon.register, jaxon.cmd, jaxon.ajax, jaxon.dialog);
