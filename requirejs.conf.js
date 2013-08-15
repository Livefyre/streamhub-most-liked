require.config({
  paths: {
    jquery: 'lib/jquery/jquery',
    text: 'lib/requirejs-text/text',
    base64: 'lib/base64/base64',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    hgn: 'lib/requirejs-hogan-plugin/hgn'
  },
  packages: [{
	  name: "streamhub-sdk",
	  location: "lib/streamhub-sdk/src/"
  }],
  shim: {
    jquery: {
        exports: '$'
    }
  },
//  urlArgs: "_=" +  (new Date()).getTime()
});
