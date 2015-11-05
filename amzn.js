var rules = { "pool": true }
var rulesUl, newRuleDiv;
var buddyContainer;

function refreshRules() {

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
		$("#pool").show();
		$("#nopool").hide();
		updateMode(true);
	} else {
		$("#nopool").show();
		$("#pool").hide();
		updateMode(false);
	}
}

function updateMode(isPool) {
	chrome.extension.sendMessage({
		updateMode : true,
		isPool : isPool
	}, function(response) {
		rules = response.rules;
	});
	emptyShowHide(isPool);
}

function emptyShowHide(isPool) {
	buddyContainer.empty();
	var buddy;
	var text;
    if (isPool) { 
    	buddy = rules.user_id
		text = "You are a member of the Associates pool: " + buddy;
    } else { 
    	buddy = rules.buddy_id
    	text = "Your buddy is " + buddy
    }

	if (buddy !== undefined) {
		$(".empty").hide();
		var li = $('<li class="buddy"/>');
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

	chrome.extension.sendMessage({
		addBuddy : buddy
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});

	$("#tag").val("");
}
function addSelf() {
	var buddy = $("#pooltag").val();

	chrome.extension.sendMessage({
		addUser : buddy
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});

	$("#pooltag").val("");
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

$(document).ready(function() {
	buddyContainer = $(".full");
	nopoolDiv = $('#nopool');
	poolDiv = $('#pool');
	
	chrome.extension.sendMessage({
		getRules : true
	}, function(response) {
		rules = response.rules;
		refreshRules();
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