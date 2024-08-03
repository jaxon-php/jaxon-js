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
 * Shortcut to <jaxon.ajax.command.register>
 */
jaxon.register = jaxon.ajax.command.register;

/**
 * Shortcut to <jaxon.utils.dom.$>.
 */
jaxon.$ = jaxon.utils.dom.$;

/**
 * Shortcut to <jaxon.ajax.request.setCsrf>.
 */
jaxon.setCsrf = jaxon.ajax.request.setCsrf;

/**
 * Shortcut to the JQuery selector function>.
 */
jaxon.jq = jaxon.parser.query.jq;

/**
 * Shortcut to <jaxon.parser.call.execExpr>.
 */
jaxon.exec = jaxon.parser.call.execExpr;

/**
 * Shortcut to <jaxon.dialog.lib.confirm>.
 */
jaxon.confirm = jaxon.dialog.lib.confirm;

/**
 * Shortcut to <jaxon.dialog.lib.alert>.
 */
jaxon.alert = jaxon.dialog.lib.alert;

/**
 * Shortcut to <jaxon.utils.dom.ready>.
 */
jaxon.dom.ready = jaxon.utils.dom.ready;

/**
 * Shortcut to <jaxon.utils.form.getValues>.
 */
jaxon.getFormValues = jaxon.utils.form.getValues;

/**
 * Shortcut to <jaxon.ajax.parameters.setBag>.
 */
jaxon.setBag = jaxon.ajax.parameters.setBag;

/**
 * Shortcut to <jaxon.parser.attr.process>.
 */
jaxon.processCustomAttrs = () => jaxon.parser.attr.process();

/**
 * Indicates if jaxon module is loaded.
 */
jaxon.isLoaded = true;

/**
 * Register the command handlers provided by the library, and initialize the message object.
 */
(function(register, cmd, ajax, dialog) {
    // Pseudo command needed to complete queued commands processing.
    register('response.complete', (args, { request }) => {
        ajax.response.complete(request);
        return true;
    }, 'Response complete');

    register('dom.assign', cmd.body.assign, 'Dom::Assign');
    register('dom.append', cmd.body.append, 'Dom::Append');
    register('dom.prepend', cmd.body.prepend, 'Dom::Prepend');
    register('dom.replace', cmd.body.replace, 'Dom::Replace');
    register('dom.clear', cmd.body.clear, 'Dom::Clear');
    register('dom.remove', cmd.body.remove, 'Dom::Remove');
    register('dom.create', cmd.body.create, 'Dom::Create');
    register('dom.insert.before', cmd.body.insertBefore, 'Dom::InsertBefore');
    register('dom.insert.after', cmd.body.insertAfter, 'Dom::InsertAfter');

    register('script.call', cmd.script.call, 'Script::CallJsFunction');
    register('script.exec', cmd.script.exec, 'Script::ExecJsonExpression');
    register('script.redirect', cmd.script.redirect, 'Script::Redirect');

    register('script.sleep', ajax.command.sleep, 'Handler::Sleep');
    register('script.confirm', ajax.command.confirm, 'Handler::Confirm');

    register('handler.event.set', cmd.event.setEventHandler, 'Script::SetEventHandler');
    register('handler.event.add', cmd.event.addEventHandler, 'Script::AddEventHandler');
    register('handler.add', cmd.event.addHandler, 'Script::AddHandler');
    register('handler.remove', cmd.event.removeHandler, 'Script::RemoveHandler');

    register('script.debug', ({ message }) => {
        console.log(message);
        return true;
    }, 'Debug message');

    // Pagination
    register('pg.paginate', cmd.script.paginate, 'Paginator::Paginate');
    // Data bags
    register('databag.set', cmd.script.setDatabag, 'Databag:SetValues');
    register('databag.clear', cmd.script.clearDatabag, 'Databag:ClearValue');
    // Dialogs
    register('dialog.message', dialog.cmd.showMessage, 'Dialog:ShowMessage');
    register('dialog.modal.show', dialog.cmd.showModal, 'Dialog:ShowModal');
    register('dialog.modal.hide', dialog.cmd.hideModal, 'Dialog:HideModal');
})(jaxon.register, jaxon.cmd, jaxon.ajax, jaxon.dialog);
