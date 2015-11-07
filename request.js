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
//rules = { "pool": true }
//updateLocalStorage(rules)

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
		updateRemoteUser( sendResponse );
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
		updateRemoteMode( sendResponse );
	} 
});

// activate or inactivate existing user
function updateRemoteMode( callback ) {
	var rules = JSON.parse(localStorage['rules']);
	if (rules.pool && rules.user_db) {
		updateUserDB(true, updatePoolID); 
		//updatePoolID();
	} else if (!rules.pool && rules.user_db) updateUserDB(false); 
}

// save a new user, inactivate existing user
function updateRemoteUser( callback ) {
	var rules = JSON.parse(localStorage['rules']);
	if (rules.user_db) updateUserDB(false, newUserDB);
	else newUserDB(); 
}

// inactivate user in database after change
// also release buddy
function updateUserDB(is_pool, callback) {
	console.log("updateUserDB");
	var rules = JSON.parse(localStorage['rules']);
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		console.log(xmlhttp.readyState);
		if(xmlhttp.readyState == XMLHttpRequest.DONE) {
			console.log(JSON.parse(xmlhttp.responseText));
			if (callback === undefined) {
				chrome.extension.sendMessage({rules: rules});
				return;
			}
			callback();
		}
	}
	if (is_pool) {
	 	xmlhttp.open("POST", POOL_SERVER + "create", true);
	 	var tagData = {"tag": rules.user_id};
	 } else {
	 	xmlhttp.open("POST", POOL_SERVER + "inactivate", true);
	 	var tagData = {"id": rules.user_db, "pool": rules.pool_id};
	 }
 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(tagData));
}

// add user to database
function newUserDB() {
	console.log("newUserDB");
	var rules = JSON.parse(localStorage['rules']);
	var tagData = {"tag": rules.user_id};
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == XMLHttpRequest.DONE) {
			var newRule = JSON.parse(xmlhttp.responseText);
			console.log(newRule);
			rules.user_db = newRule._id
			updateLocalStorage(rules);
			updatePoolID();
		}
	}
 	xmlhttp.open("POST", POOL_SERVER + "create", true);
 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(tagData));
}

// get a new poolbuddy, release old poolbuddy
function updatePoolID() {
	console.log("updatePoolID");
	var rules = JSON.parse(localStorage['rules']);
	if (rules.pool_id !== undefined)
		var tagData = {"tag": rules.pool_id};
	else
		var tagData = {}
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == XMLHttpRequest.DONE) {
			var newRule = JSON.parse(xmlhttp.responseText);
			console.log(newRule);
			rules.pool_id = newRule.tag
			updateLocalStorage(rules);
			chrome.extension.sendMessage({rules: rules});
		}
	}
 	xmlhttp.open("POST", POOL_SERVER + "joinpool", true);
 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(tagData));
}

function updateLocalStorage(rules){
	localStorage['rules'] = JSON.stringify(rules);
}
