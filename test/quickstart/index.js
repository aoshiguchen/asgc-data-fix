let fix = require('../../src');

fix.startup('dev', ['test1', 'chat', async function(test1DB, chatDB){

	console.log('==========================mysql操作示例==========================');
	// 新增
	let insertResult = await test1DB.execute(`
			insert into stu(id,name) values 
			(1, '张三'),
			(2, '李四'),
			(3, '王五')
		`);
	console.log('insertResult', insertResult);
	// 查询列表
	console.log('list', await test1DB.find(`select * from stu`));
	// 更新
	await test1DB.execute(`
		update stu set name = '张三111' where id = 1
		`);
	// 查询单条
	console.log('stu', await test1DB.findOne(`select * from stu where id = 1`));
	// 删除
	let deleteResult = await test1DB.execute(`delete from stu`);
	console.log('deleteResult', deleteResult);

	console.log('==========================mongo操作示例==========================');
	// 新增
	let insertWeChatInfoResult = await chatDB.insertOne('WeChatInfo', {
		_id:'weChatId1',
		weChatId: 'wxid_trufcrgkcnwr22',
		nickName: '自相矛盾'
	});
	console.log('insertWeChatInfoResult', insertWeChatInfoResult.result);
	// 查询
	let weChatInfoList = await chatDB.find('WeChatInfo', {});
	console.log('weChatInfoList', weChatInfoList);
	// 删除
	await chatDB.delete('WeChatInfo');

}]);
