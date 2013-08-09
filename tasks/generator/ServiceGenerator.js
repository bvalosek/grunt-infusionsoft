var wordwrap  = require('wordwrap');
var Generator = require('./Generator');

module.exports = ServiceGenerator = require('typedef')

// Create our service interfaces for XML RPC
.class('ServiceGenerator') .extends(Generator) .define({

    // Get that mess ready on constrUCT
    __constructor__: function(service)
    {
        var moduleName = this.moduleName = 'I' + service.serviceName;
        this.append('module.exports = ' + moduleName +
            ' = require(\'typedef\')');
        this.addBreak(2);
        this.addDisclaimer();
        this.addBreak();
        this.addComment(service.description);
        this.append('.interface(\'' + moduleName + '\') .define({');
        this.addBreak();

        service.methods.forEach(function(method, index) {
            if (index) this.code += ',\n';
            this.addMethod(method);
        }.bind(this));

        this.addBreak(2);
        this.append('});');
    },

    __hidden__addMethod: function(method)
    {
        this.addBreak();
        var _this = this;

        var meth = '__xmlrpc__';

        if (method.params[0] != 'apiKey')
            meth += 'insecure__';

        meth += method.name + ': function(';

        method.params.forEach(function(p, n) {
            if (n) meth += ', ';
            meth += _this.normalizeParam(p);
        });

        meth += ')';

        // Comment + wrapped signature
        this.addComment(method.description, 1);
        wordwrap(72)(meth).split('\n').forEach(function(line, index) {
            if (index) _this.code += '\n    ';
            _this.code += '    ' + line;
        });

        this.code += ' {}';
    },

    __hidden__normalizeParam: function(s)
    {
        var m = s.match(/(.*)\s+\(optional\)$/);

        if (m)
            s = '_' + m[1];

        return s.replace(' ', '');
    },

});
