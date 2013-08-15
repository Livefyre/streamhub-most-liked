define([
	"jquery",
	"streamhub-sdk",
	"src/clients/livefyre-most-liked-client"
], function(
    $,
    SDK,
    LivefyreMostLikedClient
) {
	var LivefyreMostLikedStream = function (opts) {
		SDK.Stream.call(this);
		this.opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleId = opts.articleId;
        this.environment = opts.environment;
	};
	$.extend(LivefyreMostLikedStream.prototype, SDK.Stream.prototype);
	
	LivefyreMostLikedStream.prototype._read = function () {
		/*
		 * Save "this" for later when we do the callback of "getContents" such
		 * that we can reference the appropriate object.. as opposed to "window",
		 * which "this" becomes since the ajax callback is made from "window".
		 */
		var self = this;
		var opts = {
			"network": this.network,
			"siteId": this.siteId,
			"articleId": this.articleId
		};
		if (this.environment) {
			opts.environment = this.environment;
		}
		
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
				var content = allContent[i];
				content.author = authors[content.content.authorId];
				self._buildContent(content, authors);
			}
		});
	};
	
	LivefyreMostLikedStream.prototype._buildContent = function (data, authors) {
		/*
		 * TODO (Derek): This should not be referencing LivefyreStream to process content,
		 * but for sake of not duplicating code, just reusing this. Ultimately, it needs
		 * to be broken out to it's own "Content" constructor/method.
		 */
		var content = SDK.Streams.LivefyreStream.createContent(data);
		
		if (content) {
			if (data.content.annotations &&
				data.content.annotations.likes) {
				content.likes = data.content.annotations.likes;
			}
			this._push(content);
		}
		
		var children = data.childContent || [];
		// Process the children content (if any)
		for (var i = 0, childrenLen = children.length; i < childrenLen; i++) {
			var childContent = this._buildContent(children[i], authors);
			
			if (childContent instanceof SDK.Content.Types.Oembed) {
				content.addAttachment(childContent);
			}
		}
		
		return content;
	};
	
	return LivefyreMostLikedStream;
});