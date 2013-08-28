define(["src/clients/most-base-client"], function(BaseClient) {
	/*
	 * TODO (Derek)?: Not sure if I need to inherit any base
	 * constructor's members yet, but if we do, need to change
	 * the way we inherit here....
	 */
	var LivefyreMostLikedClient = {
		type: "likes"
	};
	$.extend(LivefyreMostLikedClient, BaseClient);
	
	return LivefyreMostLikedClient;
});