var pubnub;
var game_pin;
var users = {};
var current_question = -1;
var game;
var answer_times = {};
var time_left = 30;
var countdown;
var listener = {
	signal: m => {
		console.log("message!")
		console.log(m)
		if (m.channel == game_pin + "joins") {
			if (!users[m.message]) {
				let key = Math.floor(Math.random() * 10000000);
				pubnub.signal({
					message: key,
					channel: game_pin + m.message + "letmein"
				});
				
				users[m.message] = {
					score: 0,
					correct: [],
					key
				};
				
				pubnub.subscribe({
					channels: [game_pin + m.message + "answers"]
				});
				
				let e = document.createElement("div");
				e.innerText = m.message;
				document.querySelector("#playernames").appendChild(e);
			}
			else {
				console.log(users[m.message])
				pubnub.signal({
					message: "0",
					channel: game_pin + m.message + "letmein"
				});
			}
			return;
		}
	},
	message: m => {
		if (m.channel.endsWith("answers")) {
			console.log("Got answer!")
			console.log(m.channel)
			if (m.message.key == users[m.message.username].key) {
				console.log("key is valid");
				console.log(m.message.answer);
				if (users[m.message.username].correct[current_question] == null) {
					users[m.message.username].correct[current_question] = game[current_question].correct.includes(m.message.answer);
					
					// flip answer correctness randomly
					if (Math.random() > 0.6) users[m.message.username].correct[current_question] = !users[m.message.username].correct[current_question];
					answer_times[m.message.username] = time_left;
				}
			}
		}
	}
};

async function start_game() {
	// TODO: game URL
	game = await fetch("test_game.json").then(a => a.json());
	game_pin = Math.floor(Math.random() * 10000000);
	pubnub = new PubNub({
		publishKey: "pub-c-cd07b990-56dd-4e2a-9f38-5ed2bf3d968c",
		subscribeKey: "sub-c-d12759ae-2136-11ec-8d5d-a65b09ab59bc"
	});
	pubnub.subscribe({
		channels: [game_pin + "joins"]
	});
	pubnub.addListener(listener);
	document.querySelector("#gamepin").innerHTML = game_pin;
	show_screen("lobby");
}

function end_question() {
	clearInterval(countdown);
	for (let i in users) {
		if (users[i].correct[current_question] != null) {
			pubnub.signal({
				channel: game_pin + i + "answer_right",
				message: users[i].correct[current_question] ? 2 : 1
			});
			users[i].score += users[i].correct[current_question] * answer_times[i] * 50  * Math.random();
		}
		else {
			pubnub.signal({
				channel: game_pin + i + "answer_right",
				message: "0"
			});		
			users[i].correct[current_question] = false; // now they can't answer late
		}
	}
	
	document.querySelector("#skipbutton").innerHTML = "Next";
	document.querySelector("#skipbutton").onclick = show_scoreboard;
	document.querySelector("#timeleft").classList.add("ohidden");
	
	for (let i in game[current_question].answers) {
		if (game[current_question].correct.includes(Number(i))) continue;
		document.querySelector("#ans-" + i).classList.add("ohidden");
	}
}

function show_scoreboard() {
	let players = [];
	for (let i in users) {
		players.push({
			name: i,
			score: Math.floor(users[i].score)
		});
	}
	players.sort((a, b) => {
		if (a.score < b.score) {
			return -1;
		}
		if (a.score > b.score) {
			return 1;
		}
		return 0;
	});
	players.splice(5, players.length - 5);
	document.querySelector("#scoreboard").innerHTML = "";
	fill_template("scoreboard-template", {players}, "scoreboard");
	show_screen("scoreboard");
}

function next_question() {
	answer_times = {};
	time_left = 30;
	current_question++;
	document.querySelector("#question-message").innerHTML = game[current_question].question;
	show_screen("question");
	pubnub.signal({
		channel: game_pin + "events",
		message: "getready"
	});
	setTimeout(() => {
		document.querySelector("#screen-questionanswers").innerHTML = "";
		fill_template("answers-template", game[current_question], "screen-questionanswers");
		show_screen("questionanswers");
		pubnub.signal({
			channel: game_pin + "events",
			message: "question"
		});
		countdown = setInterval(() => {
			time_left -= 1;
			document.querySelector("#timeleft").innerHTML = time_left;
			if (time_left <= 0) {
				end_question();
			}
		}, 1000)
	}, 1000);
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
	document.querySelector("#" + target_id).innerHTML += html;
}

function show_screen(screen) {
	let screens = ["scoreboard", "question", "questionanswers", "startgame", "lobby"];
	for (let i of screens) {
		if (i == screen) {
			document.querySelector("#screen-" + i).classList.remove("hidden");
			continue;
		}
		document.querySelector("#screen-" + i).classList.add("hidden");
	}
}
