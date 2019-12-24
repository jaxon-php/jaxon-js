jaxon.tools.queue = {
    /**
     * Construct and return a new queue object.
     *
     * @param integer size The number of entries the queue will be able to hold.
     *
     * @returns object
     */
    create: function(size) {
        return {
            start: 0,
            count: 0,
            size: size,
            end: 0,
            elements: [],
            timeout: null
        }
    },

    /**
     * Check id a queue is empty.
     *
     * @param object theQ The queue to check.
     *
     * @returns boolean
     */
    empty: function(theQ) {
        return (theQ.count <= 0);
    },

    /**
     * Check id a queue is empty.
     *
     * @param object theQ The queue to check.
     *
     * @returns boolean
     */
    full: function(theQ) {
        return (theQ.count >= theQ.size);
    },

    /**
     * Push a new object into the tail of the buffer maintained by the specified queue object.
     *
     * @param object theQ   The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    push: function(theQ, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(theQ)) {
            throw { code: 10003 };
        }

        theQ.elements[theQ.end] = obj;
        if(++theQ.end >= theQ.size) {
            theQ.end = 0;
        }
        return ++theQ.count;
    },

    /**
     * Push a new object into the head of the buffer maintained by the specified queue object.
     *
     * This effectively pushes an object to the front of the queue... it will be processed first.
     *
     * @param object theQ   The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    pushFront: function(theQ, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(theQ)) {
            throw { code: 10003 };
        }

        // Simply push if the queue is empty
        if(jaxon.tools.queue.empty(theQ)) {
            return jaxon.tools.queue.push(theQ, obj);
        }

        // Put the object one position back.
        if(--theQ.start < 0) {
            theQ.start = theQ.size - 1;
        }
        theQ.elements[theQ.start] = obj;
        return ++theQ.count;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object theQ   The queue object you would like to modify.
     *
     * @returns object|null The object that was at the head of the queue or null if the queue was empty.
     */
    pop: function(theQ) {
        if(jaxon.tools.queue.empty(theQ)) {
            return null;
        }

        let obj = theQ.elements[theQ.start];
        delete theQ.elements[theQ.start];
        if(++theQ.start >= theQ.size) {
            theQ.start = 0;
        }
        theQ.count--;
        return obj;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object theQ   The queue object you would like to modify.
     *
     * @returns object|null The object that was at the head of the queue or null if the queue was empty.
     */
    peek: function(theQ) {
        if(jaxon.tools.queue.empty(theQ)) {
            return null;
        }
        return theQ.elements[theQ.start];
    }
};
