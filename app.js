var token;
var qs;
$.ready(isRedirectedURI())

function isRedirectedURI() {
	uriHash = window.location.hash;
	if(uriHash.length>0) {
		
		//set access token
		token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('access_token') !== null) return true; })[0].split('=')[1];

		//endpoint that we're going to hit
		var redditEndpoint;
		
		// call the Reddit endpoint with configured URI
		// $.ajax({
		// 	url: redditEndpoint,
		// 	method: 'GET',
		// 	dataType: 'jsonp',
		// 	success: function(response) {
		// 		console.log(response);
		// 	}
		// });

	}
	else {
		$('.article-results-view').hide();
	}
}