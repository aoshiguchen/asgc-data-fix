let num = process.argv[2];

// 父进程不能直接向子进程传json对象，需要转成字符串
// console.log(process.argv[3]);

function sleep(time){
  return new Promise(function (resolve, reject){
    setTimeout(resolve, time);
  });
}

(async function (){
	console.log(`子进程开始:${num}`);
	await sleep(Math.random() * 5000); // 休眠0~5秒，观察进程数,发现一直只有一个进程
	console.log(`子进程执行完毕:${num}`);
	process.send({ result: num * num});
})();