/*
    File: jaxon.verbose.js
    
    The jaxon verbose debugging module.  This is an optional module, include in your project with care. :)
    
    Title: jaxon verbose debugging module
    
    Please see <copyright.inc.php> for a detailed description, copyright and license information.
*/

/*
    @package jaxon
    @version $Id: jaxon.verbose.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2009 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license http://www.jaxonproject.org/bsd_license.txt BSD License
*/

try {
    if ('undefined' == typeof jaxon)
        throw { name: 'SequenceError', message: 'Error: jaxon core was not detected, verbose module disabled.' }
    if ('undefined' == typeof jaxon.debug)
        throw { name: 'SequenceError', message: 'Error: jaxon debugger was not detected, verbose module disabled.' }
    
    /*
        Class: jaxon.debug.verbose
        
        Provide a high level of detail which can be used to debug hard to find
        problems.
    */
    jaxon.debug.verbose = {}

    /*
        Function: jaxon.debug.verbose.expandObject
        
        Generate a debug message expanding all the first level
        members found therein.
        
        
        Parameters:
        
        obj - (object):  The object to be enumerated.
        
        Returns:
        
        string - The textual representation of all the first
            level members.
    */    
    jaxon.debug.verbose.expandObject = function(obj) {
        var rec = true;
        if (1 < arguments.length)
            rec = arguments[1];
        if ('function' == typeof (obj)) {
            return '[Function]';
        } else if ('object' == typeof (obj)) {
            if (true == rec) {
                var t = ' { ';
                var separator = '';
                for (var m in obj) {
                    t += separator;
                    t += m;
                    t += ': ';
                    try {
                        t += jaxon.debug.verbose.expandObject(obj[m], false);
                    } catch (e) {
                        t += '[n/a]';
                    }
                    separator = ', ';
                }
                t += ' } ';
                return t;
            } else return '[Object]';
        } else return '"' + obj + '"';
    }
    
    /*
        Function: jaxon.debug.verbose.makeFunction
        
        Generate a wrapper function around the specified function.
        
        Parameters:
        
        obj - (object):  The object that contains the function to be
            wrapped.
        name - (string):  The name of the function to be wrapped.
        
        Returns:
        
        function - The wrapper function.
    */        
    jaxon.debug.verbose.makeFunction = function(obj, name) {
        return function() {
            var fun = name;
            fun += '(';

            var separator = '';
            var pLen = arguments.length;
            for (var p = 0; p < pLen; ++p) {
                fun += separator;
                fun += jaxon.debug.verbose.expandObject(arguments[p]);
                separator = ',';
            }
            
            fun += ');';
            
            var msg = '--> ';
            msg += fun;

            jaxon.debug.writeMessage(msg);

            var returnValue = true;
            var code = 'returnValue = obj(';
            separator = '';
            for (var p = 0; p < pLen; ++p) {
                code += separator;
                code += 'arguments[' + p + ']';
                separator = ',';
            }
            code += ');';

            eval(code);
            
            msg = '<-- ';
            msg += fun;
            msg += ' returns ';
            msg += jaxon.debug.verbose.expandObject(returnValue);
            
            jaxon.debug.writeMessage(msg);
            
            return returnValue;
        }
    }
    
    /*
        Function: jaxon.debug.verbose.hook
        
        Generate a wrapper function around each of the functions
        contained within the specified object.
        
        Parameters: 
        
        x - (object):  The object to be scanned.
        base - (string):  The base reference to be prepended to the
            generated wrapper functions.
    */
    jaxon.debug.verbose.hook = function(x, base) {
        for (var m in x) {
            if ('function' == typeof (x[m])) {
                x[m] = jaxon.debug.verbose.makeFunction(x[m], base + m);
            }
        }
    }
    
    jaxon.debug.verbose.hook(jaxon, 'jaxon.');
    jaxon.debug.verbose.hook(jaxon.callback, 'jaxon.callback.');
    jaxon.debug.verbose.hook(jaxon.css, 'jaxon.css.');
    jaxon.debug.verbose.hook(jaxon.dom, 'jaxon.dom.');
    jaxon.debug.verbose.hook(jaxon.events, 'jaxon.events.');
    jaxon.debug.verbose.hook(jaxon.forms, 'jaxon.forms.');
    jaxon.debug.verbose.hook(jaxon.js, 'jaxon.js.');
    jaxon.debug.verbose.hook(jaxon.tools, 'jaxon.tools.');
    jaxon.debug.verbose.hook(jaxon.tools.queue, 'jaxon.tools.queue.');
    jaxon.debug.verbose.hook(jaxon.command, 'jaxon.command.');
    jaxon.debug.verbose.hook(jaxon.command.handler, 'jaxon.command.handler.');
    
    /*
        Boolean: isLoaded
        
        true - indicates that the verbose debugging module is loaded.
    */
    jaxon.debug.verbose.isLoaded = true;
} catch (e) {
    alert(e.name + ': ' + e.message);
}
