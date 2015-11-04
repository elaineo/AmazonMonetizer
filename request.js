var 
	rules,
	lastRequestId;

if(localStorage['rules']){
	rules = JSON.parse(localStorage['rules']);
}
else{
	rules = [];
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	return redirectToMatchingRule(details);
}, {
	urls : ["http://www.amazon.com/*"]
}, ["blocking"]);

function redirectToMatchingRule(details) {
	// detect product page
	console.log(details.url);
	var tag = "&tag=elaineou-20";
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
	if ( typeof request.rule !== 'undefined') {
		rules.push(request.rule);
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.removeAllRules !== 'undefined') {
		rules = [];
		updateLocalStorage(rules)
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.getRules !== 'undefined') {
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.toggleIndex !== 'undefined') {
		rules[request.toggleIndex].isActive = !rules[request.toggleIndex].isActive;
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.editIndex !== 'undefined') {
		rules[request.editIndex] = request.updatedRule;
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.removeIndex !== 'undefined') {
		rules.splice(request.removeIndex, 1);
		updateLocalStorage(rules);
		sendResponse({
			rules : this.rules
		});
	} else if ( typeof request.getIndex !== 'undefined') {
		sendResponse({
			rule : rules[request.getIndex]
		});
	}
});

function updateLocalStorage(rules){
	localStorage['rules'] = JSON.stringify(rules);
}
