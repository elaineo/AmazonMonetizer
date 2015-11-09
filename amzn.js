var rules;
var re = /\D+-\d+/;

function refreshRules(rules) {

	$("#poolCheck").prop("checked", false);
	$("#nopoolCheck").prop("checked", false);
	$("#pool").hide();
	$("#nopool").hide();

	if (rules.pool) {
		$("#poolCheck").prop("checked", true);
		$("#pool").show();
		emptyShowHide(true);
	} else {
		$("#nopoolCheck").prop("checked", true);
		$("#nopool").show();
		emptyShowHide(false);
	}
}

function changeMode() {
	if ($("#poolCheck").attr("checked")) {
		updateMode(true)
		refreshRules({"pool": true})
	} else {
		updateMode(false)
		refreshRules({"pool": false})
	}
}

function updateMode(isPool) {
	chrome.extension.sendMessage({
		updateMode : true,
		isPool : isPool
	}, function(response) {
		console.log(response);
		rules = response.rules;
		emptyShowHide(isPool);
	});
}

function emptyShowHide(isPool) {
	buddyContainer.empty();
	var buddy;
	var text;
    if (isPool) { 
    	buddy = rules.user_id
		text = "You are a member of the Associates pool: <span class='buddy'>" + buddy + "</span>";
    } else { 
    	buddy = rules.buddy_id
    	text = "Your buddy is: <span class='buddy'>" + buddy + "</span>"
    }

	if (buddy !== undefined) {
		$(".empty").hide();
		var li = $('<p />');
		var removeLink = '<a href="#" class="editBuddy">Change</a>';		
		li.append(text + removeLink);
		buddyContainer.append(li);
		$(".full").show();
	} else {
		$(".full").hide();
		$(".empty").show();
		$(".empty").children(".cancel").hide();
	}
}

function addBuddy() {
	var buddy = $("#tag").val();
	if (!re.test(buddy)) { $("#tag").val("INVALID ID"); return }

	chrome.extension.sendMessage({
		addBuddy : buddy
	}, function(response) {
		rules = response.rules;
		refreshRules(rules);
	});

	$("#tag").val("");
}
function addSelf() {
	var buddy = $("#pooltag").val();
	if (!re.test(buddy)) { $("#pooltag").val("INVALID ID"); return }

	chrome.extension.sendMessage({
		addUser : buddy
	});

	$("#pooltag").val("");
	rules.user_id = buddy;
	emptyShowHide(true);
}

function editBuddy() {
	$(".full").hide();
	$(".empty").show();
	if (rules.pool)
		$("#pooltag").val(rules.user_id);
	else
		$("#tag").val(rules.buddy_id);
	$(".empty").children(".cancel").show();
}
function cancelEdit() {
	$(".full").show();
	$(".empty").hide();
}

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) { 
		console.log(request);
		if (request.rules !== undefined) {
			rules = request.rules; 
		 	refreshRules(rules);
	 	}
	});

$(document).ready(function() {
	buddyContainer = $(".full");
	nopoolDiv = $('#nopool');
	poolDiv = $('#pool');
	
	chrome.extension.sendMessage({
		getRules : true
	}, function(response) {
		rules = response.rules;
		refreshRules(rules);
	});

	$("input[name=mode]:radio").change(function () {
		changeMode();
	});

	$('#tagBtn').click(function() {
		addBuddy();
	});
	$('#pooltagBtn').click(function() {
		addSelf();
	});
	$(document.body).on('click', '.editBuddy' ,function(){
		editBuddy();
	});
	$(".cancel").click(function() {
		cancelEdit();
	})

	$('input[name=name]').focus();
});