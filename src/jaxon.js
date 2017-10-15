/*
    File: jaxon.core.js
    
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
    @license http://www.jaxonproject.org/bsd_license.txt BSD License
*/

/*
Class: jaxon.callback

The global callback object which is active for every request.
*/
jaxon.callback = jaxon.ajax.callback.create();

/*
Class: jaxon
*/

/*
Function: jaxon.request

Initiates a request to the server.
*/
jaxon.request = jaxon.ajax.request.execute;

/*
Object: jaxon.response

The response queue that holds response commands, once received
from the server, until they are processed.
*/
jaxon.response = jaxon.tools.queue.create(jaxon.config.responseQueueSize);

/*
Function: jaxon.register

Registers a new command handler.
Shortcut to <jaxon.ajax.handler.register>
*/
jaxon.register = jaxon.ajax.handler.register;

/*
Function: jaxon.$

Shortcut to <jaxon.tools.dom.$>.
*/
jaxon.$ = jaxon.tools.dom.$;

/*
Function: jaxon.getFormValues

Shortcut to <jaxon.tools.form.getValues>.
*/
jaxon.getFormValues = jaxon.tools.form.getValues;

/*
Boolean: jaxon.isLoaded

true - jaxon module is loaded.
*/
jaxon.isLoaded = true;