/**
 * Class: jaxon.dom
 */

/**
 * Plain javascript replacement for jQuery's .ready() function.
 * See https://github.com/jfriend00/docReady for a detailed description, copyright and license information.
 */
(function(self) {
    "use strict";

    let readyList = [];
    let readyFired = false;
    let readyEventHandlersInstalled = false;

    /**
     * Call this when the document is ready.
     * This function protects itself against being called more than once
     */
    const ready = () => {
        if (readyFired) {
            return;
        }
        // this must be set to true before we start calling callbacks
        readyFired = true;
        // if a callback here happens to add new ready handlers,
        // the jaxon.dom.ready() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList.forEach(cb => cb.fn.call(window, cb.ctx));
        // allow any closures held by these functions to free
        readyList = [];
    }

    const readyStateChange = () => document.readyState === "complete" && ready();

    /**
     * This is the one public interface
     * jaxon.dom.ready(fn, context);
     * The context argument is optional - if present, it will be passed as an argument to the callback
     */
    self.ready = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        }
        // add the function and context to the list
        readyList.push({ fn: callback, ctx: context });
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
            return;
        }
        if (!readyEventHandlersInstalled) {
            // first choice is DOMContentLoaded event
            document.addEventListener("DOMContentLoaded", ready, false);
            // backup is window load event
            window.addEventListener("load", ready, false);

            readyEventHandlersInstalled = true;
        }
    }
})(jaxon.dom);
