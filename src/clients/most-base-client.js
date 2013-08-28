define(["jquery", "streamhub-sdk/util", "base64"], function($, util) {

    /**
     * A Client for requesting Livefyre's Most API Service
     * @exports streamhub-most-api/clients/livefyre-most-api-client
     */
    var LivefyreMostBaseClient = {};

    /**
     * Fetches content from Livefyre's API with the supplied arguments.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The name of the network in the livefyre platform
     * @param opts.articleId {string} The livefyre collectionId for the conversation stream
     * @param callback {function} A callback that is called upon success/failure of the
     * stream request. Callback signature is "function(error, data)".
     */
    LivefyreMostBaseClient.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        
        var url = [
            "http://bootstrap.",
            (opts.network === "livefyre.com") ? opts.environment || "livefyre.com" : opts.network,
            "/api/v3.0/site/",
            opts.siteId,
            "/article/",
            btoa(opts.articleId),
            "/top/",
            this.type,
            "/"
        ].join("");

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data, status, jqXhr) {
                if (data.status == "error") {
                    return callback(data.msg);
                }
                callback(null, data.data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
        
    };
    
    return LivefyreMostBaseClient;
});