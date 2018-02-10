// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";
import socket from "./socket.js"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import run_memory from "./memory.jsx";
//import run_demo from "./demo.jsx";

function init() {
	let root = document.getElementById('game');
	if(root) {
		let channel = socket.channel("games:memory", {});
		run_memory(root, channel);
		channel.join()
		  .receive("ok", resp => { console.log("Joined successfully", resp); })
		  .receive("error", resp => { console.log("Unable to join", resp); });
	}
}

// Use jQuery to delay until page loaded.
$(init);

