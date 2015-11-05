var 
	rules,
	lastRequestId;

/*
  Rules Format
  rules = {
	pool: true,
	user_id: "elaineou-20",	 // for pool
	pool_id: "warrenmar-20", // for pool
	buddy_id: "elaineou-20"  // for nopool
  }
*/

if(localStorage['rules']){
	rules = { "pool": true }
	//rules = JSON.parse(localStorage['rules']);
}
else{
	rules = { "pool": true }
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	return redirectToMatchingRule(details, rules);
}, {
	urls : ["http://www.amazon.com/*", "https://www.amazon.com/*"]
}, ["blocking"]);

function redirectToMatchingRule(details, rules) {
	// detect product page
	console.log(details.url);
	// get appropriate tag
	if (rules.pool) 
		var tag = rules.pool_id;
	else
		var tag = rules.buddy_id;
	if (tag === undefined)
		tag = "&tag=elaineou-20"
	else
		tag = "&tag=" + tag
	if ( ( details.url.indexOf("/dp/") > -1 || details.url.indexOf("/gp/") > -1 ) 
											&& details.url.indexOf(tag) < 0 ) {
		// get rid of other people's tags
		var redirectUrl = details.url.split("&tag")[0]
		return { redirectUrl : redirectUrl + tag };
	}
	else
		return;
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if ( typeof request.removeAllRules !== 'undefined') {
		rules = [];
		updateLocalStorage(rules)
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.getRules !== 'undefined') {
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.addUser !== 'undefined') {
		rules["user_id"] = request.addUser;
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.addBuddy !== 'undefined') {
		rules["buddy_id"] = request.addBuddy;
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.updateMode !== 'undefined') {
		rules["pool"] = request.isPool;
		updateLocalStorage(rules);
		// update remote storage too
		// remove person from pool, or add person to pool
		sendResponse({
			rules : this.rules
		});
	} 
});

function updateLocalStorage(rules){
	localStorage['rules'] = JSON.stringify(rules);
}
