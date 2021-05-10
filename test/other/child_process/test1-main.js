const child_process = require('child_process');

for(let i = 1; i <= 5; i++) {
	var worker_process = child_process.fork('test1-child.js', [i,[{a:1}]]);    
	worker_process.on('close', async function (code) {
	    console.log(`子进程退出:${i}`);
	}); 
	worker_process.on('message', async function (msg) {
	    console.log(`子进程消息:`, msg);
	}); 
}

