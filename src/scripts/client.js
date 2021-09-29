var pubnub;

async function pubnub_join_event(game_pin, username) {
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
				message: on_message
			});
		}
		
		pubnub.addListener({
			signal: on_message
		});
	})
}

async function join_game(game_pin, username) {
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
		alert("please kindly go kill yourself");
		return;
	}
	alert("game join accepted!!!");
}
