# asgc-data-fix简介
**asgc-data-fix**是傲世孤尘开源的一个基于node的数据修复框架。

### 特点概述
- **使用简单**：只需简单的配置即可使用。
- **例程丰富**：对于本框架的使用，文档中提供了详细的示例。
- **容易扩展**：支持插件扩展。

### 传统数据修复方式的痛点
- 纯SQL方式
	- 不支持跨库操作
	- 对于修复数据逻辑稍微复杂的场景不太友好
- 写在Java项目中
	- 若依赖Spring容器则可能启动缓慢，增加不必要的开销
	- 若使用业务层DO对象，则耦合太深。若单独定义则过于繁琐

### 为什么使用asgc-data-fix
- 基于node，使用js语法编写，门槛低
- node原生支持json，db或其他操作结果无需映射转换
- asgc-data-fix内置mysql、mongo插件，编写脚本时只用专注于脚本逻辑，DB连接实例打开/关闭无需关心
- asgc-data-fix支持插件扩展，可根据需要替换/扩展功能

### 阅读须知
- 所有示例程序均随框架一起发布，因此安装完成之后可直接阅读源码及附带的示例
- 所有示例程序依赖的配置（如：数据库连接配置）文件已做脱敏处理，原配置文件不会发布。
> 如：脚本依赖`config.json`文件，其中敏感信息已做处理。示例程序中的`config.private.json`文件不会发布。因此示例程序无法直接运行，需要自行修改。

# 快速入门
### 1、安装
```
npm install asgc-data-fix@1.0.3
```

### 2、mysql数据修复示例
##### 2.1、在工作目录编写配置文件（config.json）如下
> 对于数据库连接信息已做脱敏处理，需要自行修改
```
{
	"dev": {
		"chat": {
			"type": "mongo",
			"host": "***",
			"port": 27017,
			"userName": "***",
			"password": "***",
			"database": "wechat"
		},
		"test1": {
			"type": "mysql",
			"host": "***",
			"port": 3306,
			"userName": "***",
			"password": "***",
			"database": "test1"
		}
	},
}
```

##### 2.2、在配置文件同级别目录下编写脚本文件（如：test.js）
```
// 引入依赖
let fix = require('asgc-data-fix');

/**
 * 启动过脚本
 * 1、第一个参数dev代表脚本执行环境为"dev"，对应于配置文件中的dev部分
 * 2、第二个参数是一个数组，数组前面几个参数代表需要的dev环境中的test1、chat实例，这里是mysql、mongo连接实例
 * 3、数组最后一个参数是一个回调函数，是用户脚本的执行入口，回调函数的参数即前面声明的test1、chat实例
 * 4、函数的async修饰根据需要使用，不需要时可以不写，此处需要配合await做异步转同步
 * 5、会调函数执行开始前，框架会自动初始化服务实例（如打开数据库连接）。执行完毕后，框架会自动关闭服务实例（如关闭数据库连接）。
 */
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
```

#### 2.3、执行结果示例
```
load config finished. {"dev":{"chat":{"type":"mongo","host":"122.51.22.55","port":27017,"userName":"asgc","password":"KJlgFFGYG","database":"wechat"},"test1":{"type":"mysql","host":"122.51.22.55","port":3306,"userName":"asgc","password":"YHJIkloB@54dxC","database":"test1"}},"a":{"b":"hello"},"uat":{"chat":{"type":"mongo","url":"mongodb://asgc:KJlgFFGYG@122.51.22.55:27017/wechat"},"test1":{"type":"mysql","host":"122.51.22.55","port":3306,"userName":"asgc","password":"YHJIkloB@54dxC","database":"test1"}}}
load plugins finished. [ 'mongo', 'mysql' ]
======================脚本执行开始
默认环境: dev
======================服务：test1开启成功！
======================服务：chat开启成功！
==========================mysql操作示例==========================
insertResult OkPacket {
  fieldCount: 0,
  affectedRows: 3,
  insertId: 3,
  serverStatus: 2,
  warningCount: 0,
  message: '&Records: 3  Duplicates: 0  Warnings: 0',
  protocol41: true,
  changedRows: 0
}
list [
  RowDataPacket { id: 1, name: '张三' },
  RowDataPacket { id: 2, name: '李四' },
  RowDataPacket { id: 3, name: '王五' }
]
stu RowDataPacket { id: 1, name: '张三111' }
deleteResult OkPacket {
  fieldCount: 0,
  affectedRows: 3,
  insertId: 0,
  serverStatus: 34,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0
}
==========================mongo操作示例==========================
insertWeChatInfoResult { n: 1, ok: 1 }
weChatInfoList [
  {
    _id: 'weChatId1',
    weChatId: 'wxid_trufcrgkcnwr22',
    nickName: '自相矛盾'
  }
]
======================服务：test1关闭.
======================服务：chat关闭.
======================脚本执行结束
```

# 进阶篇
### 1、配置文件
##### 1.1、配置文件格式
> 如下所示：配置文件采用json格式
- dev、uat代表环境，可根据需要自行定义，当脚本在dev环境执行时，将取dev节点下面的配置
- test1、chat代表服务实例别名
- type，目前asgc-data-fix内置插件只包含mysql与mongo，type为mysql代表test1为mysql连接实例。若自定义插件，type可设置为自定义插件名
- 其他，除了type以外其他参数由插件自己定义，如下数据库连接参数是内置插件所需要的。若自定义插件，可根据需要定义相关配置项

```
{
	// 环境配置
	"dev": {
		// 实例配置
		"test1": {
			"type": "mysql",
			"host": "***",
			"port": 3306,
			"userName": "***",
			"password": "***",
			"database": "test1"
		},
		"chat": {
			"type": "mongo",
			"host": "***",
			"port": 27017,
			"userName": "***",
			"password": "***",
			"database": "test1"
		}
	},
	"uat": {

	}
}
```
##### 1.2、配置文件加载机制
- `fix.loadConfig()`可指定配置文件路径进行加载，需要在`fix.startup()`执行之前，支持相对路径和绝对路径
- `fix.loadConfig()`传入路径可以不包含文件扩展名`.json`。当不包含扩展名时（如: `myconfig`），会先加载`myconfig.json`文件，然后加载`myconfig.private.json`文件，且优先使用后者的实例配置
- 默认情况下，若不主动调用`fix.loadConfig()`加载配置，直接`fix.startup()`启动脚本时，相当于调了	`fix.loadConfig('config').startup()`，之后再执行脚本
- 多次调用`fix.loadConfig()`，以最后一次加载的配置为准。

### 2、指定所在环境
- `startup`方法第一个参数传入一个字符串，可作为脚本默认执行环境
```
fix.startup('dev', ['test1',async function(test1DB){

}]);
```
- `startup`方法第一个参数若直接省略，直接传入一个数组参数的情况下，脚本没有默认执行环境
```
fix.startup(['dev:test1','uat:chat',async function(test1DB){

}]);
```
- `startup`方法数组参数除了最后一个参数为回调方法外，前面几个参数用于声明所需要的服务实例。如上脚本，需要dev环境的test1实例、uat环境的chat实例
- 脚本声明的服务实例，依赖的环境优先取`dev:test1`这种方式指定的环境，若此处未指定则会取默认环境
- 脚本声明的服务实例必须指定环境，若未指定则执行会报错

### 3、内置的mysql实例方法
- `open`打开mysql数据库连接，在执行脚本前，框架会自动创建mysql实例，调用`open`方法
- `close`关闭mysql数据库连接，在执行脚本结束后，框架会自动调用该实例的`close`方法
- `execute`执行sql
- `findOne`可用`execute`取代，但当查询结果确定最多只有一个时，可用此方法，避免每次取数组第一个

### 4、内置的mongo实例方法
- `open`打开mongodb数据库连接，在执行脚本前，框架会自动创建mongodb实例，调用`open`方法
- `close`关闭mongodb数据库连接，在执行脚本结束后，框架会自动调用该实例的`close`方法
- `create` 创建一个表（mongodb中称之为集合）
- `findOne` 查询一条记录
- `findPage` 查询分页
- `find` 查询列表
- `count` 查询数据条数
- `findAndModify` 查询并且更新，可指定返回更新之前或更新之后的数据
- `insertOne` 新增单条记录
- `insert` 批量新增
- `updateOne` 更新单条记录
- `update` 批量更新
- `deleteOne` 删除单条记录
- `delete` 批量删除
- `drop` 删除表
- `collections` 获取数据库下所有表对象
- `collectionNames` 获取数据库下所有表名
- `aggregate` 聚合操作
- `ensureIndex` 新增索引
- `indexInformation` 获取索引信息
- `dropIndex` 删除索引

### 5、自定义插件扩展
- 执行脚本前，框架会自动加载内置插件（mysql、mongo）。紧接着会加载脚本同级别目录下的插件（脚本同级别下的plugins目录）
- 加载插件时，若插件目录不存在，或插件目录下不存在`可加载`的的插件，将直接忽略
- 插件的三要素
	- 一个插件对应于插件目录下一个文件夹
	- 插件文件夹下必须存在`index.js`文件
	- 插件文件夹下的`index.js`中必须导出一个`create`方法
- 只要自定义插件满足插件三要素定义，就可以正常在我们脚本中使用了。
- 需要注意的是，插件三要素只规定了插件必须导出`create`方法，并不要求提供`open`、`close`方法，若插件不涉及资源的打开及释放，可以不用提供。

- 插件目录结构示例：
```
--|plugins
	--|myplugin
		--|index.js
```

- 插件`index.js`内容示例
> 具体内容可参见`asgc-data-fix/test/plugin-lab1`
```
class MyPlugin {
	constructor(options) {
		console.log('MyPlugin create...', options);
		this.name = options.name || '';
	}
	open(){
		console.log('MyPlugin open...');
	}
	close(){
		console.log('MyPlugin close...');
	}
	say(msg){
		console.log(`MyPlugin sayHello ${this.name} ${msg}`);
	}
}

module.exports = {
	create: function(options) {
		return new MyPlugin(options);
	}
}
```

# 使用场景
#### 数据修复
> 此类需求可能跨多个库，但涉及环境只有一个，因此可采用如下形式
```
fix.startup('dev', ['customer', 'employee', async function(customerDB, employeeDB){
	// TODO
}]);
```
#### 数据同步
> 此类需求可用于数据备份，或将生产环境数据同步到测试环境，可在测试环境使用生产环境数据测试。这种情况跨环境，可采用如下形式
```
fix.startup(['pro:customer', 'uat:customer', async function(proCustomerDB, uatEmployeeDB){
	// TODO
}]);
```

# 加餐-多线程
- 可使用`child_process`fork多进程来实现多线程的效果。（参见示例程序asgc-data-fix/test/other/child_process）
	- 虽然进程数过多，有点浪费资源，但绝大多数情况下用这个足够了
	- 父进程向子进程传递参数`可能`需要转为json字符串，子进程需要还原为json对象，此处可能麻烦一丢丢
	- [Node.js v14.16.1 child_process文档](http://nodejs.cn/api/child_process.html)
	- [从Node.js的child_process模块来学习父子进程之间的通信](https://blog.csdn.net/liangklfang/article/details/51125108)
- （推荐）可使用`worker_threads`实现多线程。（参见示例程序asgc-data-fix/test/other/worker_threads) 
	- Node.js V10.5.0 开始引入
	- 运行过程中不会产生多个进程
	- 父进程向子进程传第参数，子进程获取参数没有上述问题
	- [Node.js v14.16.1 work_threads文档](http://nodejs.cn/api/worker_threads.html)
	- [深入理解 Node.js Worker Threads](https://blog.csdn.net/u010862794/article/details/107519722)
	- [理解Node.js中的"多线程"](https://zhuanlan.zhihu.com/p/74879045)
