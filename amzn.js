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
		emptyShowHide(true);
	} else {
		$("#nopool").show();
		$("#pool").hide();
		emptyShowHide(false);
	}
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
		var removeLink = '<a href="#" class="removeRuleButton">Change</a>';		
		li.append(text + removeLink);
		buddyContainer.append(li);
		$(".full").show();
	} else {
		$(".full").hide();
		$(".empty").show();
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

function removeAllRules() {
	
	chrome.extension.sendMessage({
		removeAllRules : true
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}


function editRule(index, rule) {
	
	chrome.extension.sendMessage({
		editIndex : index,
		updatedRule : rule
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}

function removeRule(index) {
	
	chrome.extension.sendMessage({
		removeIndex : index
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}

function convertRuleToEditMode(ruleParent, editIndex, rule){
	ruleParent.empty();

	var editRuleDiv = $('<div class="edit-rule" />');

	var fromInput =	$('<input type="text" class="fromInput" name="fromInput" />').val(rule.from);
	var seperator = $('<span class="seperator">&gt;</span>');
	var toInput = $('<input type="text" class="toInput" name="toInput" />').val(rule.to);
	var updateRuleButton = $('<input type="button" value="Update" name="AddRule" />');

	editRuleDiv.append(fromInput).append(seperator).append(toInput).append(updateRuleButton);

	updateRuleButton.click(function(){
		var updatedRule = {
			from : fromInput.val(),
			to : toInput.val(),
			isActive: true
		};

		editRule(editIndex, updatedRule);
	});

	ruleParent.append(editRuleDiv);
}

function getRuleFromListItem(listItem){
	var from = listItem.children('.from').text();
	var to = listItem.children('.to').text();

	return {
		from:from,
		to:to,
	};
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
	

	$('#rules').delegate('.active', 'click', function() {
		toggleRule(parseInt($(this).parent().attr('data-rule-index')));
	});
	
	$('#rules').delegate('.removeRuleButton', 'click', function() {
		removeRule(parseInt($(this).parent().attr('data-rule-index')));
	});

	$('#rules').delegate('.editRuleButton', 'click', function() {
		var ruleParent = $(this).parent();
		var editIndex = parseInt(ruleParent.attr('data-rule-index'));

		chrome.extension.sendMessage({
			getIndex : editIndex
		}, function(response) {
			convertRuleToEditMode(ruleParent, editIndex, response.rule);
		});		
	});	

	$('input[name=name]').focus();
});