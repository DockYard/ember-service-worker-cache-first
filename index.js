/* jshint node: true */
'use strict';

var Config = require('./lib/config');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-service-worker-cache-first',

  included: function(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options['esw-cache-first'] = this.app.options['esw-cache-first'] || {};
  },

  treeForServiceWorker(swTree, appTree) {
    var options = this.app.options['esw-cache-first'];
    var configFile = new Config([appTree], options);

    return mergeTrees([swTree, configFile]);
  }
};
