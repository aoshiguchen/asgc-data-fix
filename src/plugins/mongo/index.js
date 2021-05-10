var mongo = require('mongodb');

const _MongoClient = mongo.MongoClient;
const Long = mongo.Long;

function Page(options = {}){
	if(!(this instanceof Page)){
		throw new Error('错误的方法调用！');
	}
	this.no = options.no || 1;
	this.size = options.size || 15;
	this.data = options.data || [];
}

function MongoClient(options = {}){
	var host = options.host || '127.0.0.1';
	var port = options.port || 27017;
	var database = options.database;
	var userName = options.userName;
	var password = options.password;
	if (!options.url && (!database || !userName || !password)) {
		throw new Error('mongo连接参数有误!');
	}
	var url = options.url || `mongodb://${userName}:${password}@${host}:${port}/${database}`;

	var ctx = {
		url: url,
		name: database,
		open: function(){
			return new Promise(function (resolve, reject){
				_MongoClient.connect(url, {
					useUnifiedTopology: true
				},(err, conn)=>{
					if(err){
						reject(err);
					}else{
						ctx.conn = conn;
			        	resolve();
					}
			    });
			});
		},
		close: function(){
			ctx.conn.close();
		}, 
		create: function(collection){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).createCollection(collection, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		findOne: function(collection, query){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).findOne(query, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		findPage: function(collection, query, page){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).find(query).skip((page.no - 1) * page.size).limit(page.size).toArray((err, result) => {
					if(err){
						reject(err);
					}else{
						page.data = result;
			        	resolve(page);
					}
				});
			});
		},
		find: function(collection, query, sort = {}){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).find(query).sort(sort).toArray((err, result) => {
					if(err){
						console.log('异常信息',err)
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		count: function(collection, query){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).find(query).count((err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		findAndModify: function(collection, query, update, _new){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).findAndModify(query, [], update, {new: _new}, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		insertOne: function(collection, doc){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).insertOne(doc, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		insert: function(collection, docs){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).insertMany(docs, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		updateOne: function(collection, query, update){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).updateOne(query, {$set: update}, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		update: function(collection, query, update){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).updateMany(query, {$set: update}, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		deleteOne: function(collection, query){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).deleteOne(query, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		delete: function(collection, query){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).deleteMany(query, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		drop: function(collection){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).drop((err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		collections: function(){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collections((err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		collectionNames: function(){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collections((err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result.map(col => col.collectionName));
					}
				});
			});
		},
		aggregate: function(collection, aggregates){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).aggregate(aggregates,{allowDiskUse:true}).toArray((err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		ensureIndex: function(collection, selector, options){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).ensureIndex(selector, options, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			}); 
		},
		indexInformation: function(collection){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).indexInformation((err,result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		},
		dropIndex: function(collection, index){
			return new Promise(function (resolve, reject){
				ctx.conn.db(ctx.database).collection(collection).dropIndex(index, (err, result) => {
					if(err){
						reject(err);
					}else{
			        	resolve(result);
					}
				});
			});
		}
	};

	return ctx;
}

module.exports = {
	create: function(options) {
		return new MongoClient(options);
	}
};