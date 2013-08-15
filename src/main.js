require([
	"jquery",
	"src/streams/livefyre-most-liked-stream",
	"streamhub-sdk"
], function($, LivefyreMostLikedStream, SDK) {
	/* var stream = new LivefyreMostLikedStream({
		network: "derek_test-0.fyre.co",
		siteId: "303662",
		articleId: "8"
	});*/
	
	var stream = new LivefyreMostLikedStream({
		network: "gamespot.fyre.co",
		siteId: "297020",
		articleId: "1101:6412828"
	});
	
	var listView = new SDK.Views.ListView({ el: document.getElementById('stream')});
	var streamManager = new SDK.StreamManager({});
	streamManager.set({mostLiked: stream});
	streamManager.bind(listView).start();
});