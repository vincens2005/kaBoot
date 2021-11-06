var blank_question = {
	question: "",
	answers: ["", "", "", ""],
	correct: [],
	timelimit: 15
};

var game = [];
var current_question = 0;

function deepclone(object) {
	let object2 = Array.isArray(object) ? [] : {};
	for (let i in object) {
		if (typeof object[i] == "object" && object[i].length) {
			object2[i] = deepclone(object[i]);
			continue;
		}
		object2[i] = object[i];
	}
	return object2;
}

function get_question(index) {
	if (!game[index]) {
		game[index] = deepclone(blank_question);
		return game[index];
	}
	for (let i in blank_question) {
		if (!game[index][i]) {
			game[index][i] = blank_question[i];
		}
	}
	return game[index];
}

function show_screen(screen) {
	let screens = {
		question: game.length ? get_question(current_question) : blank_question,
		questions: {game},
		start: {},
		gamecode: {}
	};

	screens.question = deepclone(screens.question);
	
	for (let i in screens.question.answers) {
		let ans = {
			text: screens.question.answers[i],
			correct: screens.question.correct.includes(Number(i))
		};
		screens.question.answers[i] = ans;
	}
	
	for (let i in screens) {
		if (i == screen) {
			fill_template(i + "-template", screens[i], "screen-" + i);
			document.querySelector("#screen-" + i).classList.remove("hidden");
			continue;
		}
		document.querySelector("#screen-" + i).classList.add("hidden");
	}
}

function edit_question(index) {
	current_question = index;
	show_screen("question");
}

/** automatically fills out handlebars template
 * @param {String} template_id - the id of the template element
 * @param {Object} data - the data to fill.
 * @param {String} target_id - the id of the element to put the final HTML
 * @param {Object} handlebar_options - extra handlebars config
 */
function fill_template(template_id, data, target_id, handlebar_options) {
	if (typeof data != "object") {
		return;
	}
	if (!handlebar_options) {
		handlebar_options = {};
	}
	var template = Handlebars.compile(document.querySelector("#" + template_id).innerHTML, handlebar_options);
	var html = template(data);
	document.querySelector("#" + target_id).innerHTML = html;
}

function updatescreen() {
	let question = get_question(current_question);
	question.correct = [];
	question.question = document.querySelector("#question").value ?? "";
	question.timelimit = Number(document.querySelector("#timelimit").value || "15");
	for (let i = 0; i < 4; i++) {
		question.answers[i] = document.querySelector("#answer-" + i).value ?? "";
		if (document.querySelector("#checkbox-" + i).checked) {
			question.correct.push(i);
		}
	}
}

function copygame() {
	navigator.clipboard.writeText(JSON.stringify(game));
	document.querySelector("#copybutton").innerHTML = "Copied!";
}

async function init() {
	if (document.querySelector("#gameurl").value) game = await fetch(document.querySelector("#gameurl").value).then(a => a.json());
	show_screen("questions");
}

function checkinput(e) {
	if (e.keyCode == 13) init();
}
