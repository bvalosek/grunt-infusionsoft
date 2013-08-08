var util     = require('util');
var typedef  = require('typedef');
var _        = require('underscore');
var fs       = require('fs');
var wordwrap = require('wordwrap');
var Q        = require('q');

module.exports = Generator = require('typedef')

.class('Generator') .define({

    __constructor__: function()
    {
        this.code = '';
    },

    __fluent__append: function(txt)
    {
        this.code += txt;
        return this;
    },

    __fluent__addBreak: function(count)
    {
        count = count || 1;

        for (var x = 0; x < count; x++)
            this.code += '\n';

        return this;
    },

    // Append a wrapped comment block
    __fluent__addComment: function(txt, lvl)
    {
        var _this = this;
        lvl       = lvl || 0;
        wordwrap(80 - lvl*4)(txt).split('\n').forEach(function(line) {
            for (var n = 0; n < lvl; n++) _this.code += '    ';
            _this.code += '// ' + line + '\n';
        });

        return this;
    },

    // Standard banner
    __fluent__addDisclaimer: function()
    {
        this.addComment('THIS CODE WAS GENERATED BY AN AUTOMATED TOOL. ' +
            'Editing it is not recommended. For more information, see ' +
            'http://github.com/bvalosek/grunt-infusionsoft');

        return this;
    },

    // Will probably just be a directory
    writeFile: function(filepath)
    {
        if (this.fileName)
            filepath = filepath + '/' + this.fileName;

        return Q.nfcall(fs.writeFile, filepath, this.code);
    },

});
