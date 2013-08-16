require.config({
  paths: {
    jquery: 'lib/jquery/jquery',
    text: 'lib/requirejs-text/text',
    base64: 'lib/base64/base64',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    hgn: 'lib/requirejs-hogan-plugin/hgn',
    "event-emitter": "lib/event-emitter/src/event-emitter"
  },
  packages: [{
	  name: "streamhub-sdk",
	  location: "lib/streamhub-sdk/src"
  }, {
	  name: "stream",
	  location: "lib/stream/src"
  }],
  shim: {
    jquery: {
        exports: '$'
    }
  },
//  urlArgs: "_=" +  (new Date()).getTime()
});
