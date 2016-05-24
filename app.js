var token;
var userInfo;
var rAllData;
$.ready(isRedirectedURI())

function isRedirectedURI() {
	uriHash = window.location.hash;
	if(uriHash.length>0) {
		
		//set access token
		token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('access_token') !== null) return true; })[0].split('=')[1];

		//get user info
		(function() {
			var redditEndpoint = "https://oauth.reddit.com/api/v1/me";
			var redditHeaders = {"Authorization": "bearer " + token};
			$.ajax({
				url: redditEndpoint,
				headers: redditHeaders,
				method: 'GET',
				dataType: 'json',
				success: function(response) {
					console.log(response);
					userInfo = response;
				}
			});
		})();
		//end /api/v1/me

		//get top posts on r/all
		(function() {
			var redditEndpoint = "https://www.reddit.com/r/all/hot.json";
			$.ajax({
				url: redditEndpoint,
				method: 'GET',
				dataType: 'json',
				success: function(response) {
					console.log(response);
					rAllData = response;
				}
			});
		})();
		//end /r/all/hot

		//example vote on a post
		/*(function() {
			var redditEndpoint = "https://oauth.reddit.com/api/vote?dir=1&id=t3_4kqr3d";
			var redditHeaders = {"Authorization": "bearer " + token};
			$.ajax({
				url: redditEndpoint,
				headers: redditHeaders,
				method: 'POST',
				dataType: 'json',
				success: function(response) {
					console.log(response);
				}
			});
		})();*/
		//end vote

	}
	else {
		$('.article-results-view').hide();
	}
}