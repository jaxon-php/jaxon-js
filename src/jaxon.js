/*
    File: jaxon.js

    This file contains the definition of the main jaxon javascript core.

    This is the client side code which runs on the web browser or similar web enabled application.
    Include this in the HEAD of each page for which you wish to use jaxon.

    Title: jaxon core javascript library

    Please see <copyright.inc.php> for a detailed description, copyright and license information.
*/

/*
    @package jaxon
    @version $Id: jaxon.core.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2010 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license https://opensource.org/license/bsd-3-clause/ BSD License
*/

/*
Function: jaxon.request

Initiates a request to the server.
*/
jaxon.request = jaxon.ajax.request.execute;

/*
Function: jaxon.register

Registers a new command handler.
Shortcut to <jaxon.ajax.handler.register>
*/
jaxon.register = jaxon.ajax.handler.register;

/*
Function: jaxon.$

Shortcut to <jaxon.utils.dom.$>.
*/
jaxon.$ = jaxon.utils.dom.$;

/*
Function: jaxon.getFormValues

Shortcut to <jaxon.utils.form.getValues>.
*/
jaxon.getFormValues = jaxon.utils.form.getValues;

/*
Object: jaxon.msg

Prints various types of messages on the user screen.
*/
jaxon.msg = jaxon.ajax.message;

/*
Object: jaxon.js

Shortcut to <jaxon.cmd.script>.
*/
jaxon.js = jaxon.cmd.script;

/*
Boolean: jaxon.isLoaded

true - jaxon module is loaded.
*/
jaxon.isLoaded = true;

/*
Object: jaxon.utils.delay.q

The queues that hold synchronous requests as they are sent and processed.
*/
jaxon.utils.delay.q = {
    send: jaxon.utils.queue.create(jaxon.config.requestQueueSize),
    recv: jaxon.utils.queue.create(jaxon.config.requestQueueSize * 2)
};
