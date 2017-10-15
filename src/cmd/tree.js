jaxon.cmd.tree = {
    startResponse: function(args) {
        jxnElm = [];
    },

    createElement: function(args) {
        eval(
            [args.tgt, ' = document.createElement(args.data)']
            .join('')
        );
    },

    setAttribute: function(args) {
        args.context.jaxonDelegateCall = function() {
            eval(
                [args.tgt, '.setAttribute(args.key, args.data)']
                .join('')
            );
        }
        args.context.jaxonDelegateCall();
    },

    appendChild: function(args) {
        args.context.jaxonDelegateCall = function() {
            eval(
                [args.par, '.appendChild(', args.data, ')']
                .join('')
            );
        }
        args.context.jaxonDelegateCall();
    },

    insertBefore: function(args) {
        args.context.jaxonDelegateCall = function() {
            eval(
                [args.tgt, '.parentNode.insertBefore(', args.data, ', ', args.tgt, ')']
                .join('')
            );
        }
        args.context.jaxonDelegateCall();
    },

    insertAfter: function(args) {
        args.context.jaxonDelegateCall = function() {
            eval(
                [args.tgt, 'parentNode.insertBefore(', args.data, ', ', args.tgt, '.nextSibling)']
                .join('')
            );
        }
        args.context.jaxonDelegateCall();
    },

    appendText: function(args) {
        args.context.jaxonDelegateCall = function() {
            eval(
                [args.par, '.appendChild(document.createTextNode(args.data))']
                .join('')
            );
        }
        args.context.jaxonDelegateCall();
    },

    removeChildren: function(args) {
        var skip = args.skip || 0;
        var remove = args.remove || -1;
        var element = null;
        args.context.jaxonDelegateCall = function() {
            eval(['element = ', args.data].join(''));
        }
        args.context.jaxonDelegateCall();
        var children = element.childNodes;
        for (var i in children) {
            if (isNaN(i) == false && children[i].nodeType == 1) {
                if (skip > 0) skip = skip - 1;
                else if (remove != 0) {
                    if (remove > 0)
                        remove = remove - 1;
                    element.removeChild(children[i]);
                }
            }
        }
    },

    endResponse: function(args) {
        jxnElm = [];
    }
};