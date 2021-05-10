const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');

if (isMainThread) {
	for(let i = 1; i <= 5; i ++) {
		const worker = new Worker(__filename, {workerData: {num: i}});
		worker.once('message', (result) => {
		 	console.log('square of 5 is :', result);
		});
	}
	
} else {
	function sleep(time){
	  return new Promise(function (resolve, reject){
	    setTimeout(resolve, time);
	  });
	}

	(async function (){
		console.log(`子进程开始:${workerData.num}`);
		await sleep(Math.random() * 5000); // 休眠0~5秒，观察进程数,发现一直只有一个进程
		console.log(`子进程执行完毕:${workerData.num}`);
		parentPort.postMessage(workerData.num * workerData.num);
	})();
}

