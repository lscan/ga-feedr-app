// to do:
// voting is almost working
// pagination

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
				// likes returns whether or not this post has been upvoted or downvoted
				// true means upvoted, false means downvoted, null means no vote
				if(dataArray[i].data.likes == true) {
					// if this thing is upvoted, set the downvote to the regular downvote image and set the upvote to the modded one
					newObject.upvoted = "upmod";
					newObject.downvoted = "down";
					// set the upvote href to nullify the upvote
					newObject.upvoteEndpoint = templating.voteBaseUrl+"dir=0&id="+dataArray[i].data.name;
					newObject.downvoteEndpoint = templating.voteBaseUrl+"dir=-1&id="+dataArray[i].data.name;
				} else if(dataArray[i].data.likes == false) {
					// if this thing is downvoted, set the upvote to the regular upvote image and set the downvote to the modded one
					newObject.upvoted = "up";
					newObject.downvoted = "downmod";
					// set the downvote endpoint to nullify the downvote
					newObject.upvoteEndpoint = templating.voteBaseUrl+"dir=1&id="+dataArray[i].data.name;
					newObject.downvoteEndpoint = templating.voteBaseUrl+"dir=0&id="+dataArray[i].data.name;
				} else {
					newObject.upvoted = "up";
					newObject.downvoted = "down";
					newObject.upvoteEndpoint = templating.voteBaseUrl+"dir=1&id="+dataArray[i].data.name;
					newObject.downvoteEndpoint = templating.voteBaseUrl+"dir=-1&id="+dataArray[i].data.name;
				}
				newObject.title = dataArray[i].data.title;
				newObject.thumbnail = dataArray[i].data.thumbnail;
				newObject.score = dataArray[i].data.score;
				templating.listingItems.push(newObject);
			}
			for(var i=0; i<templating.listingItems.length; i++) {
				var newItem = templating.compileItem(templating.listingItems[i]);
				$('#articleListing').append(newItem);
			}
			
			// add listeners to the vote arrows
			var modUpvotes = document.getElementsByClassName('upmod');
			for(var i=0; i<modUpvotes.length; i++) {
				modUpvotes[i].addEventListener('click', nullifyUpvote);
			}
			var modDownvotes = document.getElementsByClassName('downmod');
			for(var i=0; i<modDownvotes.length; i++) {
				// console.log(modDownvotes[i]);
				modDownvotes[i].addEventListener('click', nullifyDownvote);
			}
			var nonUpvotes = document.getElementsByClassName('up');
			for(var i=0; i<nonUpvotes.length; i++) {
				nonUpvotes[i].addEventListener('click', addUpvote);
			}
			var nonDownvotes = document.getElementsByClassName('down');
			for(var i=0; i<nonDownvotes.length; i++) {
				nonDownvotes[i].addEventListener('click', addDownvote);
			}

		}
		//end templating

		//get listing data by user input
		function getListingData() {
			
			// need to hit the oauth.reddit.com hostname in order to get certain user info, like the likes attr
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
		// $('body').on('click', '.arrow', function() {
		// 	var redditEndpoint = $(this).attr('data');
		// 	var redditHeaders = {"Authorization": "bearer " + token};
		// 	$.ajax({
		// 		url: redditEndpoint,
		// 		headers: redditHeaders,
		// 		method: 'POST',
		// 		dataType: 'json',
		// 		success: function(response) {
		// 			console.log(response);
		// 		}
		// 	});
		// });

		// listener functions
		function nullifyUpvote(e) {
			e.preventDefault();
			// this listener should be attached to any upvoted arrows
			this.className = this.className.replace('upmod', 'up');
			var currentData = this.getAttribute('data');
			postVote(currentData);
			this.setAttribute('href', currentData.replace('dir=0', 'dir=1'));
			this.removeEventListener('click', nullifyUpvote);
			this.addEventListener('click', addUpvote);
		}
		function nullifyDownvote(e) {
			e.preventDefault();
			// this listener should be attached to any downvoted arrows
			this.className = this.className.replace('downmod', 'down');
			var currentData = this.getAttribute('data');
			postVote(currentData);
			this.setAttribute('href', currentData.replace('dir=0', 'dir=-1'));
			this.removeEventListener('click', nullifyDownvote);
			this.addEventListener('click', addDownvote);
		}
		function addUpvote(e) {
			e.preventDefault();
			// this listener should be added to any non-voted upvote arrows
			this.className = this.className.replace('up', 'upmod');
			var currentData = this.getAttribute('data');
			postVote(currentData);
			this.setAttribute('href', currentData.replace('dir=1', 'dir=0'));
			this.removeEventListener('click', addUpvote);
			this.addEventListener('click', nullifyUpvote);
			// if post was previously downvoted:
			var thisParent = this.parentNode;
			var matchingDownvote = thisParent.querySelector('.downmod');
			if(matchingDownvote) {
				matchingDownvote.className = matchingDownvote.className.replace('downmod', 'down');
				var currentData = matchingDownvote.getAttribute('data');
				matchingDownvote.setAttribute('href', currentData.replace('dir=0', 'dir=-1'));
				matchingDownvote.removeEventListener('click', nullifyDownvote);
				matchingDownvote.addEventListener('click', addDownvote);
			}
		}
		function addDownvote(e) {
			e.preventDefault();
			// this listener should be added to any non-voted downvote arrows
			this.className = this.className.replace('down', 'downmod');
			var currentData = this.getAttribute('data');
			postVote(currentData);
			this.setAttribute('href', currentData.replace('dir=-1', 'dir=0'));
			this.removeEventListener('click', addDownvote);
			this.addEventListener('click', nullifyDownvote);
			// if post was previously upvoted:
			var thisParent = this.parentNode;
			var matchingUpvote = thisParent.querySelector('.upmod');
			if(matchingUpvote) {
				matchingUpvote.className = matchingUpvote.className.replace('upmod', 'up');
				var currentData = matchingUpvote.getAttribute('data');
				matchingUpvote.setAttribute('href', currentData.replace('dir=0', 'dir=1'));
				matchingUpvote.removeEventListener('click', nullifyUpvote);
				matchingUpvote.addEventListener('click', addUpvote);
			}
		}
		// to make the ajax request
		function postVote(data) {
			// var redditEndpoint = $(this).attr('data');
			var redditEndpoint = data;
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
		}

	}
	// no token :(
	else {
		$('.article-results-view').hide();
	}
}