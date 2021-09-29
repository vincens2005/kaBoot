var pubnub;
var game_pin = "testgame";
var joined_users = {};
var join_listener = {
	signal: (m) => {
		console.log("message!")
		console.log(m)
		switch(m.channel) {
			case game_pin + "joins":
				if (!joined_users[m.message]) {
					pubnub.signal({
						message: true,
						channel: game_pin + m.message + "letmein"
					});
					joined_users[m.message] = {
						score: 0,
						correct: 0
					}
				}
				else {
					console.log(joined_users[m.message])
					pubnub.signal({
						message: "0",
						channel: game_pin + m.message + "letmein"
					});
				}
				break
			default:
				console.log("peepeepoopoo");
				console.log("message")
		}
	}
};

function start_game() {
	// TODO: game URL
//	game_pin = Math.floor(Math.random() * 10000000);
	pubnub = new PubNub({
		publishKey: "pub-c-cd07b990-56dd-4e2a-9f38-5ed2bf3d968c",
		subscribeKey: "sub-c-d12759ae-2136-11ec-8d5d-a65b09ab59bc"
	});
	pubnub.subscribe({
		channels: [game_pin + "joins"]
	});
	pubnub.addListener(join_listener);
}
