jaxon.cmd.delay = {
    /*
    Function: jaxon.cmd.delay.retry

    Maintains a retry counter for the given object.

    Parameters:
    command - (object):
        The object to track the retry count for.
    count - (integer):
        The number of times the operation should be attempted before a failure is indicated.

    Returns:
    true - The object has not exhausted all the retries.
    false - The object has exhausted the retry count specified.
    */
    retry: function(command, count) {
        var retries = command.retries;
        if(retries) {
            --retries;
            if(1 > retries)
                return false;
        } else retries = count;
        command.retries = retries;
        return true;
    },

    /*
    Function: jaxon.cmd.delay.setWakeup

    Set or reset a timeout that is used to restart processing of the queue.
    This allows the queue to asynchronously wait for an event to occur (giving the browser time
    to process pending events, like loading files)

    Parameters:

    response - (object):
        The queue to process upon timeout.

    when - (integer):
        The number of milliseconds to wait before starting/restarting the processing of the queue.
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
