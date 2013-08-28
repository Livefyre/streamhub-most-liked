require([
	"jquery",
	"src/streams/most-liked-stream",
	"streamhub-sdk"
], function($, LivefyreMostLikedStream, SDK) {
//	var stream = new LivefyreMostLikedStream({
//		network: "derek_test-0.fyre.co",
//		siteId: "303662",
//		articleId: "8"
//	});
	
	var stream = new LivefyreMostLikedStream({
		network: "gamespot.fyre.co",
		siteId: "297020",
		articleId: "1101:6412828"
	});
	
	stream.on("readable", function() {
		var state;
		while(state = stream.read()) {
			console.log(state);
		};
		console.log("dun");
	});
});