var pubnub;
var game_pin = "testgame";
var users = {};
var current_question = -1;
var game;
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
					correct: 0,
					correct: [],
					key
				}
				pubnub.subscribe({
					channels: [game_pin + m.message + "answers"]
				});
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
			// TODO: rng and user scoring
			if (m.message.key == users[m.message.username].key) {
				console.log("key is valid");
				console.log(m.message.answer);
				if (users[m.message.username].correct[current_question] == null) {
					users[m.message.username].correct[current_question] = game[current_question].correct.includes(m.message.answer);
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
	document.write(game_pin);
}

function end_question() {
	for (let i in users) {
		if (users[i].correct[current_question] != null) {
			pubnub.signal({
				channel: game_pin + i + "answer_right",
				message: users[i].correct[current_question] ? 2 : 1
			});
		}
		else {
			pubnub.signal({
				channel: game_pin + i + "answer_right",
				message: "0"
			});
			
			users[i].correct[current_question] = false; // now they can't answer late
		}
	}
	// TODO: show scoreboard
}

function next_question() {
	current_question++;
	// TODO: show question screen and wait
	pubnub.signal({
		channel: game_pin + "events",
		message: "question"
	});
}
