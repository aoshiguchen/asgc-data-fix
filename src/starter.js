let Callback = require('./util/callback');
let types = require('./util/type');
let fs = require("fs");

let logInfo = "======================";

class Starter {
	constructor() {
		this.config = {};
		this.isLoadConfig = false;
		this.isLoadPlugin = {};
		this.plugins = {};
	}
	loadConfig(path) {
		if (!types.isString(path)) {
			throw new Error(`path:${path}不是一个字符串!`);
		}
		let _path = `${process.cwd()}/${path}`;
		if (!fs.existsSync(_path)) {
			throw new Error(`配置文件'${path}'不存在!`);
		}
		try{
			this.config = require(_path);
		}catch(e){
			throw new Error(`配置文件'${path}'格式有误!`);
		}
		this.isLoadConfig = true;
		return this;
	}
	loadPlugin(path) {
		if (this.isLoadPlugin[path]) {
			return;
		}
		if (!types.isString(path)) {
			throw new Error(`path:${path}不是一个字符串!`);
		}
		if (!fs.existsSync(path)) {
			// throw new Error(`配置文件'${path}'不存在!`);
			return;
		}
		var files = fs.readdirSync(path);
		for(let file of files) {
			let pluginDir = path + '/' + file;
			var stat = fs.statSync(pluginDir);
			if(!stat.isDirectory()){
				continue;
			}
			try{
				let plugin = require(pluginDir);
				if (!(types.isFunction(plugin.create) || types.isAsyncFunction(plugin.create))) {
					throw new Error('插件异常!');
				}
				this.plugins[file] = plugin;
			}catch(e){
				// console.log(`插件:${file} 加载失败!`, e);
			}
		}
		this.isLoadPlugin[path] = true;
	}
	startup(env, args) {
		if (!this.isLoadConfig) {
			this.loadConfig('config.json');
		}
		this.loadPlugin(`${__dirname}/plugins`);
		this.loadPlugin(`${process.cwd()}/plugins`);
		console.log('load plugins finished.', Object.keys(this.plugins));
		if (types.isArray(env)) {
			args = env;
			env = null;
		}
		let callback = new Callback(args,[]);
	
		console.log(`${logInfo}脚本执行开始`);
		if (env) {
			console.log(`默认环境: ${env}`);
		}

		let params = args.slice(0, args.length - 1);
		let scriptContext = {};
		for(let param of params){
			if(!param){
				console.log(`${logInfo}参数：${param}格式有误！`);
				return;
			}
			let tmp = param.split(':');
			if(tmp.length < 1 || tmp.length > 2){
				console.log(`${logInfo}参数：${param}格式有误！`);
				return;
			}
			let _env = null;
			let _name = null;
			if (tmp.length == 1) {
				_env = env;
				_name = tmp[0];
			} else {
				_env = tmp[0];
				_name = tmp[1];
			}

			if (!_env) {
				console.log(`${logInfo}参数：db:${_name} 未指定环境！`);
				return;
			}

			let envConfig = this.config[_env];
			if (!envConfig) {
				console.log(`${logInfo}环境'${_env}'配置不存在！`);
				return;
			}
			let envDBConfig = envConfig[_name];
			if (!envDBConfig) {
				console.log(`${logInfo}环境'${_env}' 配置项'${_name}'不存在`);
				return;
			}

			let type = envDBConfig.type;
			if (!type) {
				console.log(`${logInfo}环境'${_env}' 配置项'${_name}' 类型未配置!`);
				return;
			}

			if (this.plugins[type]) {
				scriptContext[param] = this.plugins[type].create(envDBConfig);
			} else {
				console.log(`${logInfo}环境'${_env}' 配置项'${_name}' 不支持的类型!`);
				return;
			}
			scriptContext[param]._name = _name;
		}

		var ctx = {};
		ctx.dbs = [];

		callback.filter(async function(name, db){
			if(!db){
				console.log(`${logInfo}服务：${name}配置错误！`);
				callback.stop();
				return;
			}
			try{
				if (types.isFunction(db.open) || types.isAsyncFunction(db.open)) {
					await db.open();
					console.log(`${logInfo}服务：${name}开启成功！`);
				}
				
				ctx.dbs.push(db);
				
				return db;
			}catch(e){
				console.log(`${logInfo}服务：${name}开启失败！`);
				callback.stop();
			}
			return;
		});

		callback.after(async function(){
			// 自动关闭连接
			for(var db of this.dbs){
				if (types.isFunction(db.close) || types.isAsyncFunction(db.close)) {
					console.log(`${logInfo}服务：${db._name}关闭.`);
					db.close();
				}
				
			}

			console.log(`${logInfo}脚本执行结束`);
		});

		callback.invoked(scriptContext, ctx);
	}
}

module.exports = Starter;