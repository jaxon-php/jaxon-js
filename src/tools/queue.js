jaxon.tools.queue = {
    /*
    Function: create

    Construct and return a new queue object.

    Parameters: 
    size - (integer):
        The number of entries the queue will be able to hold.
    */
    create: function(size) {
        return {
            start: 0,
            size: size,
            end: 0,
            commands: [],
            timeout: null
        }
    },

    /*
    Function: jaxon.tools.queue.retry

    Maintains a retry counter for the given object.

    Parameters: 
    obj - (object):
        The object to track the retry count for.
    count - (integer):
        The number of times the operation should be attempted before a failure is indicated.
        
    Returns:
    true - The object has not exhausted all the retries.
    false - The object has exhausted the retry count specified.
    */
    retry: function(obj, count) {
        var retries = obj.retries;
        if (retries) {
            --retries;
            if (1 > retries)
                return false;
        } else retries = count;
        obj.retries = retries;
        return true;
    },

    /*
    Function: jaxon.tools.queue.rewind

    Rewind the buffer head pointer, effectively reinserting the last retrieved object into the buffer.

    Parameters: 
    theQ - (object):
        The queue to be rewound.
    */
    rewind: function(theQ) {
        if (0 < theQ.start)
            --theQ.start;
        else
            theQ.start = theQ.size;
    },

    /*
    Function: jaxon.tools.queue.push

    Push a new object into the tail of the buffer maintained by the specified queue object.

    Parameters: 
    theQ - (object):
        The queue in which you would like the object stored.
    obj - (object):
        The object you would like stored in the queue.
    */
    push: function(theQ, obj) {
        var next = theQ.end + 1;
        if (next > theQ.size)
            next = 0;
        if (next != theQ.start) {
            theQ.commands[theQ.end] = obj;
            theQ.end = next;
        } else
            throw { code: 10003 }
    },

    /*
    Function: jaxon.tools.queue.pushFront

    Push a new object into the head of the buffer maintained by the specified queue object.
    This effectively pushes an object to the front of the queue... it will be processed first.

    Parameters: 
    theQ - (object):
        The queue in which you would like the object stored.
    obj - (object):
        The object you would like stored in the queue.
    */
    pushFront: function(theQ, obj) {
        jaxon.tools.queue.rewind(theQ);
        theQ.commands[theQ.start] = obj;
    },

    /*
    Function: jaxon.tools.queue.pop

    Attempt to pop an object off the head of the queue.

    Parameters: 
    theQ - (object):
        The queue object you would like to modify.
        
    Returns:
    object - The object that was at the head of the queue or
        null if the queue was empty.
    */
    pop: function(theQ) {
        var next = theQ.start;
        if (next == theQ.end)
            return null;
        next++;
        if (next > theQ.size)
            next = 0;
        var obj = theQ.commands[theQ.start];
        delete theQ.commands[theQ.start];
        theQ.start = next;
        return obj;
    }
};