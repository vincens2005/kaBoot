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
		return false;
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
	return true;
}

function handle_message_event(m) {
	if (m.channel.endsWith("events")) {
		// handle game events
		if (m.message == "question") {
			console.log("question asked");
			show_screen("pickanswer");
		}
		if (m.message == "getready") {
			document.querySelector("#condescending-message").innerHTML = "get ready...";
			show_screen("condescending");
		}
	}
	if (m.channel.endsWith(username + "answer_right")) {
		let right_answers = [
			"Correct!",
			"You got it right!",
			"You did it!",
			"You answered correctly!"
		];
		
		let wrong_answers = [
			"you are a dumbass",
			"idiot!!!",
			"you got it wrong",
			"this is proof that you are stupid",
			"you're really dumb",
			"incorrect!",
			"you suck at ka🅱️oot",
			"as evidenced by the fact that you answered this quesion incorrectly, you are a moron.",
			"you're mom",
			"your dumbassery levels are inordinately high",
			"fuckwit"
		];
		
		let slow_answers = [
			"too slow!",
			"you didn't answer",
			"what took you so long?",
			"you are dumb"
		];
		document.querySelector("#screen-correct").classList.remove("incorrect");
		document.querySelector("#screen-correct").classList.remove("correct");
		document.querySelector("#screen-correct").classList.remove("cyclecolors");

		// 0 = no answer, 1 = wrong, 2 = correct
		switch (m.message) {
			case 1:
				console.log("you are a dumbass");
				document.querySelector("#screen-correct").classList.add("incorrect");
				document.querySelector("#answer-message").innerHTML = randarr(wrong_answers);
				break;
			case 2:
				console.log("you got it right");
				document.querySelector("#screen-correct").classList.add("correct");
				document.querySelector("#answer-message").innerHTML = randarr(right_answers);
				break;
			default:
				console.log("why're you so slow?");
				document.querySelector("#screen-correct").classList.add("incorrect");
				document.querySelector("#answer-message").innerHTML = randarr(slow_answers);
				break;
		}
		
		show_screen("correct");
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
	
	let passive_aggressions = [
		"are you a dumbass?",
		"sure that was right?",
		"lucky or smart?",
		"I bet you're gonna get it wrong because you're stupid",
		"was that a misclick?"
	];
	document.querySelector("#condescending-message").innerHTML = randarr(passive_aggressions);
	show_screen("condescending");
}

function show_screen(screen) {
	let screens = ["correct", "condescending", "pickanswer", "joingame"];
	for (let i of screens) {
		if (i == screen) {
			document.querySelector("#screen-" + i).classList.remove("hidden");
			continue;
		}
		document.querySelector("#screen-" + i).classList.add("hidden");
	}
}

function randint(min, max) {
	return Math.floor(Math.random() * max) + min;
}

function randarr(array) {
	return array[randint(0, array.length - 1)];
}

function join_button_pressed() {
	let game_pin = document.querySelector("#gamepin").value;
	document.querySelector("#gamepin").value = "";
	document.querySelector("#gamepin").removeAttribute("inputmode");
	document.querySelector("#gamepin").removeAttribute("patterntype");
	document.querySelector("#gamepin").placeholder = "Nickname";
	document.querySelector("#joinbutton").innerHTML = "Let's go!";
	document.querySelector("#gamepin").blur();
	document.querySelector("#joinbutton").onclick = async () => {
		username = document.querySelector("#gamepin").value;
		document.querySelector("#condescending-message").innerHTML = "loading...";
		show_screen("condescending");
		let joined = await join_game(game_pin);
		if (!joined) location = location;
		show_screen("correct");
		document.querySelector("#answer-message").innerHTML = "you're in!";
	}
}

function checkinput(e) {
	if (e.keyCode == 13) document.querySelector("#joinbutton").click();
}

function init() {
	document.querySelector("#gamepin").value = "";
}