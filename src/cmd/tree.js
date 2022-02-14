jaxon.cmd.tree = {
    startResponse: function(command) {
        jxnElm = [];
    },

    createElement: function(command) {
        eval(
            [command.tgt, ' = document.createElement(command.data)']
            .join('')
        );
    },

    setAttribute: function(command) {
        command.context.jaxonDelegateCall = function() {
            eval(
                [command.tgt, '.setAttribute(command.key, command.data)']
                .join('')
            );
        }
        command.context.jaxonDelegateCall();
    },

    appendChild: function(command) {
        command.context.jaxonDelegateCall = function() {
            eval(
                [command.par, '.appendChild(', command.data, ')']
                .join('')
            );
        }
        command.context.jaxonDelegateCall();
    },

    insertBefore: function(command) {
        command.context.jaxonDelegateCall = function() {
            eval(
                [command.tgt, '.parentNode.insertBefore(', command.data, ', ', command.tgt, ')']
                .join('')
            );
        }
        command.context.jaxonDelegateCall();
    },

    insertAfter: function(command) {
        command.context.jaxonDelegateCall = function() {
            eval(
                [command.tgt, 'parentNode.insertBefore(', command.data, ', ', command.tgt, '.nextSibling)']
                .join('')
            );
        }
        command.context.jaxonDelegateCall();
    },

    appendText: function(command) {
        command.context.jaxonDelegateCall = function() {
            eval(
                [command.par, '.appendChild(document.createTextNode(command.data))']
                .join('')
            );
        }
        command.context.jaxonDelegateCall();
    },

    removeChildren: function(command) {
        let skip = command.skip || 0;
        let remove = command.remove || -1;
        let element = null;
        command.context.jaxonDelegateCall = function() {
            eval(['element = ', command.data].join(''));
        }
        command.context.jaxonDelegateCall();
        const children = element.childNodes;
        for (let i in children) {
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

    endResponse: function(command) {
        jxnElm = [];
    }
};
