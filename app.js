var token;
$.ready(isRedirectedURI())

function isRedirectedURI() {
	uriHash = window.location.hash;
	if(uriHash.length>0) {
		
		//set access token
		token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('access_token') !== null) return true; })[0].split('=')[1];

		//endpoint that we're going to hit
		var redditEndpoint = "https://oauth.reddit.com/api/v1/me";
		var redditHeaders = {"Authorization": "bearer " + token};
		
		// call the Reddit endpoint with configured URI
		$.ajax({
			url: redditEndpoint,
			headers: redditHeaders,
			method: 'GET',
			dataType: 'json',
			success: function(response) {
				console.log(response);
			}
		});

	}
	else {
		$('.article-results-view').hide();
	}
}

// 57126528-Fl-5nx_L3X5tHnT_u5RLHqk0t9Y