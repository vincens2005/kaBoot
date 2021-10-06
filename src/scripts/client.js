var pubnub;
var username = "ThiccGuy69"; // TODO: username picker and stuff
var game_key;
var answer_channel;
async function pubnub_join_event(game_pin) {
	let channel_name = game_pin + username + "letmein";
	await pubnub.subscribe({
		channels: [channel_name]
	});
	return new Promise((resolve, reject) => {
		let on_message = (m) => {
			if (m.channel != channel_name) return;
			resolve(m.message);
			pubnub.unsubscribe({
				channels: [channel_name]
			});
			pubnub.removeListener({
				signal: on_message
			});
		}
		
		pubnub.addListener({
			signal: on_message
		});
	})
}

async function join_game(game_pin) {
	pubnub = new PubNub({
		publishKey: "pub-c-cd07b990-56dd-4e2a-9f38-5ed2bf3d968c",
		subscribeKey: "sub-c-d12759ae-2136-11ec-8d5d-a65b09ab59bc"
	});
	await pubnub.signal({
		message: username,
		channel: game_pin + "joins"
	});
	let allowed_in = await pubnub_join_event(game_pin, username);
	if (allowed_in == "0") {
		console.log("please kindly go kill yourself");
		return;
	}
	game_key = allowed_in;
	console.log("game join accepted!!!");
	
	pubnub.subscribe({
		channels: [game_pin + "events", game_pin + username + "answer_right"]
	});
	answer_channel = game_pin + username + "answers";
	
	pubnub.addListener({
		signal: handle_message_event
	});
}

function handle_message_event(m) {
	if (m.channel.endsWith("events")) {
		// TODO: handle game events
		if (m.message == "question") {
			// TODO: handle question
			console.log("question asked");
		}
	}
	if (m.channel.endsWith(username + "answer_right")) {
		// TODO: show answer right / wrong screen
		// 0 = no answer, 1 = wrong, 2 = correct
		switch (m.message) {
			case 1:
				console.log("you are a dumbass");
				break;
			case 2:
				console.log("you got it right");
				break;
			default:
				console.log("why're you so slow?")
				break;
		}
	}
}

function answer_question(index) {
	pubnub.publish({
		channel: answer_channel,
		message: {
			username,
			answer: index,
			key: game_key
		}
	});
}
