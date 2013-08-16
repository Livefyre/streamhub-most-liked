define([
	"jquery",
	"streamhub-sdk",
	"stream/readable",
	"stream/util",
	"src/clients/most-liked-client"
], function(
    $,
    SDK,
    Readable,
    Util,
    LivefyreMostLikedClient
) {
	"use strict";
    var log = SDK.debug('streamhub-most-liked/src/streams/most-liked-stream');
	
	var LivefyreMostLikedStream = function (opts) {
		this.opts = opts || {};

		this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
        this._environment = opts.environment;
        this._contentToPush = [];
        Readable.call(this);
	};
	Util.inherits(LivefyreMostLikedStream, Readable);
	
	LivefyreMostLikedStream.prototype._read = function () {
		/*
		 * Save "this" for later when we do the callback of "getContents" such
		 * that we can reference the appropriate object.. as opposed to "window",
		 * which "this" becomes since the ajax callback is made from "window".
		 */
		var self = this;
		var opts = {
			"network": this._network,
			"siteId": this._siteId,
			"articleId": this._articleId
		};
		if (this._environment) {
			opts.environment = this._environment;
		}
		
		log("Pulling Most Liked Content.");
		LivefyreMostLikedClient.getContent(opts, function (err, data) {
			if (err) {
				self.emit('error', err);
				self._endRead();
				return;
			}
			else if (self._isReading === false) {
                self._endRead();
                return;
			}
			
			var authors = data.authors;
			var allContent = data.content;
			for (var i = 0, contentLen = allContent.length; i < contentLen; i++) {
				var state = allContent[i];
				state.author = authors[state.content.authorId];
				self._buildContentFromState(state, authors);
			}
			
			log("Done building content. Emitting 'readable'.");
			self.push.apply(self, self._contentToPush);
			/*
			 * Enforce contract. Push null so that it knows there's
			 * going to be no more content (most likes endpoint is
			 * currently hardcoded for 25 items, only.. so that's
			 * why we can just assume it's done after running through
			 * it once). 
			 */
			self.push(null);
		});
	};
	
	LivefyreMostLikedStream.prototype._buildContentFromState = function (state, authors) {
		/*
		 * TODO (Derek): This should not be referencing LivefyreStream to process content,
		 * but for sake of not duplicating code, just reusing this. Ultimately, it needs
		 * to be broken out to it's own "Content" constructor/method.
		 */
		var content = SDK.Streams.LivefyreStream.createContent(state);
		
		if (content) {
			this._contentToPush.push(content);
		}
		
		var children = state.childContent || [];
		// Process the children content (if any)
		for (var i = 0, childrenLen = children.length; i < childrenLen; i++) {
			var childContent = this._buildContentFromState(children[i], authors);
			
			if (childContent instanceof SDK.Content.Types.Oembed) {
				content.addAttachment(childContent);
			}
		}
		
		return content;
	};
	
	return LivefyreMostLikedStream;
});