// to do:
// pagination
// undo vote

var token;
var userInfo;
var rAllData;
var listingData;
$.ready(isRedirectedURI())

function isRedirectedURI() {
	uriHash = window.location.hash;
	// if redirected with token
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
					userInfo = response;
				}
			});
		})();
		//end /api/v1/me

		// templating
		var templating = {};
		templating.compileItem = function(item) {
			var source = $('#vote-template').html();
			var template = Handlebars.compile(source);
			return template(item);
		}
		templating.voteBaseUrl = "https://oauth.reddit.com/api/vote?";
		templating.listingItems = [];
		templating.iterate = function(dataArray) {
			for(var i=0; i<dataArray.length; i++) {
				var newObject = {};
				newObject.upvoteEndpoint = templating.voteBaseUrl+"dir=1&id="+dataArray[i].data.name;
				newObject.downvoteEndpoint = templating.voteBaseUrl+"dir=-1&id="+dataArray[i].data.name;
				newObject.title = dataArray[i].data.title;
				newObject.thumbnail = dataArray[i].data.thumbnail;
				templating.listingItems.push(newObject);
			}
			for(var i=0; i<templating.listingItems.length; i++) {
				var newItem = templating.compileItem(templating.listingItems[i]);
				$('#articleListing').append(newItem);
			}
		}
		//end templating

		//get listing data by user input
		function getListingData() {
			
			// need to hit oauth.reddit.com in order to get certain user info, like the likes attr
			var redditEndpoint = "https://oauth.reddit.com/r/";
			var redditHeaders = {"Authorization": "bearer " + token};
			redditEndpoint = redditEndpoint + $('#subredditValue').val() + "/hot.json?limit=10"

			$.ajax({
				url: redditEndpoint,
				headers: redditHeaders,
				method: 'GET',
				// jsonp doesn't work here
				dataType: 'json',
				success: function(response) {
					console.log('listing object: ');
					console.log(response);
					listingData = response;
					templating.iterate(listingData.data.children);
				},
				error: function(jqXHR, exception) {
					var msg = '';
	        if (jqXHR.status === 0) {
	            msg = 'Not connect. Verify Network.';
	        } else if (jqXHR.status == 404) {
	            msg = 'Requested page not found. [404]';
	        } else if (jqXHR.status == 500) {
	            msg = 'Internal Server Error [500].';
	        } else if (exception === 'parsererror') {
	            msg = 'Requested JSON parse failed.';
	        } else if (exception === 'timeout') {
	            msg = 'Time out error.';
	        } else if (exception === 'abort') {
	            msg = 'Ajax request aborted.';
	        } else {
	            msg = 'Uncaught Error. ' + jqXHR.responseText;
	        }
	        $('#errorMessage').text(msg);
				}
			});
		}
		//end getListingData

		$('#subredditButton').on('click', function() {
			getListingData();
		});
		$('body').on('click', '.upvote-arrow', function() {
			var redditEndpoint = $(this).attr('data');
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
		});
		$('body').on('click', '.downvote-arrow', function() {
			var redditEndpoint = $(this).attr('data');
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
		});
		

	}
	// no token :(
	else {
		$('.article-results-view').hide();
	}
}