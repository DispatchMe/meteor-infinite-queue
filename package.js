Package.describe({
  name: 'dispatch:infinite-queue',
  version: '0.0.3',
  summary: 'Simple infinite queue'
});

Package.onUse(function (api) {
  api.use('raix:eventemitter@0.1.2');

  api.export('InfiniteQueue');
  api.addFiles('lib/common.js', ['client', 'server']);
});
