define([
	"jquery",
	"stream/readable",
	"src/clients/most-liked-client",
	"state-to-content",
	"streamhub-sdk/debug",
	"streamhub-sdk/content/types/oembed",
	"inherits"
], function(
    $,
    Readable,
    LivefyreMostLikedClient,
    StateToContent,
    Debug,
    Oembed,
    Inherits
) {
	"use strict";
    var log = Debug('streamhub-most-liked/src/streams/most-liked-stream');
	
    
    /**
     * Constructor for Most Liked content.
     * 
     * @constructor
     * @augments Readable https://github.com/Livefyre/stream/src/readable.js
     * @param {Object} opts Configuration parameters for a Most Liked stream.
     * @param {string} opts.network Your Livefyre network (e.g. example.fyre.co)
     * @param {string} opts.siteId Your Livefyre site Id (e.g. 123456789)
     * @param {string} opts.articleId The article Id associated with the conversation
     * that you want to grab the "Most Liked" content for.
     * @param {string} [opts.environment = livefyre.com] The domain URL that corresponds
     * to the environment you want to target (e.g. t402.livefyre.com)
     */
	var LivefyreMostLikedStream = function (opts) {
		this.opts = opts || {};

		this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
        this._environment = opts.environment;
        this._contentToPush = [];
        Readable.call(this);
	};
	Inherits(LivefyreMostLikedStream, Readable);
	
	/**
	 * The method called in order to pull the Most Liked data, parse it
	 * and then emit a "readable" call such that it can eventually be
	 * rendered.
	 * 
	 * @private
	 */
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
	
	/**
	 * Transforms a state into a piece of display-able content
	 * 
	 * @param state {JSON Object} A raw "Most Liked" state from the request 
	 * @param authors {Object} An associative array used to look up authors
	 * @returns
	 */
	LivefyreMostLikedStream.prototype._buildContentFromState = function (state, authors) {
		/*
		 * TODO (Derek?): This should not be referencing LivefyreStream to process content,
		 * but for sake of not duplicating code, just reusing this. Ultimately, it needs
		 * to be broken out to it's own "Content" constructor/method.
		 */
		var content = StateToContent.transform(state, authors[state.content.authorId]);
		
		if (content) {
			this._contentToPush.push(content);
		}
		
		var children = state.childContent || [];
		// Process the children content (if any)
		for (var i = 0, childrenLen = children.length; i < childrenLen; i++) {
			var childContent = this._buildContentFromState(children[i], authors);
			
			if (childContent instanceof Oembed) {
				content.addAttachment(childContent);
			}
		}
		
		return content;
	};
	
	return LivefyreMostLikedStream;
});