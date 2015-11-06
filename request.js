var 
	rules,
	lastRequestId;

var POOL_SERVER = "http://127.0.0.1:3000/";
// var POOL_SERVER = "http://52.32.21.141/";

/*
  Rules Format
  rules = {
	pool: true,
	user_id: "elaineou-20",	 // for pool
	user_db: "1231234",      // for server db
	pool_id: "warrenmar-20", // for pool
	buddy_id: "elaineou-20"  // for nopool
  }
*/

if(localStorage['rules']){
	console.log(localStorage['rules']);
	rules = JSON.parse(localStorage['rules']);
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

function updateRemote() {
	if (rules.pool && rules.user_id) {
		if (rules.user_db === undefined) updateUserDB();
		if (rules.pool_id === undefined) updatePoolID();
	} else if (!rules.pool && rules.user_db) removeUserDB(); 
}

// add user to database
function updateUserDB(rules) {
	var tagData = {"tag": rules.user_id};
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == XMLHttpRequest.DONE) {
			var newRule = JSON.parse(xmlhttp.responseText);
			rules.user_db = newRule._id
			updateLocalStorage(rules);
		}
	}
 	xmlhttp.open("POST", POOL_SERVER + "create", true);
 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(tagData));
}

function updatePoolID(rules) {
	var tagData = {"tag": rules.user_id};
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == XMLHttpRequest.DONE) {
			var newRule = JSON.parse(xmlhttp.responseText);
			rules.user_db = newRule._id
			updateLocalStorage(rules);
		}
	}
 	xmlhttp.open("POST", POOL_SERVER + "create", true);
 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(tagData));
}

function updateLocalStorage(rules){
	localStorage['rules'] = JSON.stringify(rules);
}
