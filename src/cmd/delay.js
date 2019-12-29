jaxon.cmd.delay = {
    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    popAsyncRequest: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue))
        {
            return null;
        }
        if(jaxon.tools.queue.peek(oQueue).mode == 'synchronous')
        {
            return null;
        }
        return jaxon.tools.queue.pop(oQueue);
    },

    /**
     * Maintains a retry counter for the given object.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of times the operation should be attempted before a failure is indicated.
     *
     * @returns boolean
     *      true - The object has not exhausted all the retries.
     *      false - The object has exhausted the retry count specified.
     */
    retry: function(command, count) {
        var retries = command.retries;
        if(retries) {
            --retries;
            if(1 > retries) {
                return false;
            }
        } else {
            retries = count;
        }
        command.retries = retries;
        return true;
    },

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param response object   The queue to process upon timeout.
     * @param when integer      The number of milliseconds to wait before starting/restarting the processing of the queue.
     */
    setWakeup: function(response, when) {
        if (null != response.timeout) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(function() {
            jaxon.ajax.response.process(response);
        }, when);
    }
};
