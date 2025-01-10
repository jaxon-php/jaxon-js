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
 * Shortcut to <jaxon.dialog.lib.labels>.
 */
jaxon.labels = jaxon.dialog.lib.labels;

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
jaxon.processCustomAttrs = jaxon.parser.attr.process;

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

    register('node.assign', cmd.node.assign, 'Node::Assign');
    register('node.append', cmd.node.append, 'Node::Append');
    register('node.prepend', cmd.node.prepend, 'Node::Prepend');
    register('node.replace', cmd.node.replace, 'Node::Replace');
    register('node.clear', cmd.node.clear, 'Node::Clear');
    register('node.remove', cmd.node.remove, 'Node::Remove');
    register('node.create', cmd.node.create, 'Node::Create');
    register('node.insert.before', cmd.node.insertBefore, 'Node::InsertBefore');
    register('node.insert.after', cmd.node.insertAfter, 'Node::InsertAfter');

    register('script.exec.call', cmd.script.execCall, 'Script::ExecJsonCall');
    register('script.exec.expr', cmd.script.execExpr, 'Script::ExecJsonExpr');
    register('script.redirect', cmd.script.redirect, 'Script::Redirect');
    register('script.sleep', cmd.script.sleep, 'Script::Sleep');

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
    register('databag.set', cmd.script.setDatabag, 'Databag::SetValues');
    register('databag.clear', cmd.script.clearDatabag, 'Databag::ClearValue');
    // Dialogs
    register('dialog.confirm', dialog.cmd.confirm, 'Dialog::Confirm');
    register('dialog.alert.show', dialog.cmd.showAlert, 'Dialog::ShowAlert');
    register('dialog.modal.show', dialog.cmd.showModal, 'Dialog::ShowModal');
    register('dialog.modal.hide', dialog.cmd.hideModal, 'Dialog::HideModal');
})(jaxon.register, jaxon.cmd, jaxon.ajax, jaxon.dialog);
