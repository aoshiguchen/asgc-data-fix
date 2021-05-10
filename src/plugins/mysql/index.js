var mysql = require('mysql');

function MysqlClient(options = {}){
	var host = options.host || '127.0.0.1';
	var port = options.port || 3306;
	var database = options.database;
	var userName = options.userName;
	var password = options.password;
	var url = options.url || `mysql://${userName}:${password}@${host}:${port}/${database}`;

	var ctx = {
		url: url,
		name: database,
		open: function(){
			return new Promise(function (resolve, reject){
				var conn = mysql.createConnection({
				  host: host,
				  port: port,
				  user: userName,
				  password: password,
				  database: database
				});
				ctx.conn = conn;
				resolve();
			});
		},
		close: function(){
			ctx.conn.end();
		},
		find: function(sql){
			return new Promise(function (resolve, reject){
				ctx.conn.query(sql, function (error, results, fields) {
				  if (error){
				  	reject(error);
				  }else{
				  	resolve(results);
				  }
				}); 
			});
		},
		findOne: function(sql){
			return new Promise(function (resolve, reject){
				ctx.conn.query(sql, function (error, results, fields) {
				  if (error){
				  	reject(error);
				  }else{
				  	if(results.length == 0){
				  		resolve(null);
				  	}else{
				  		resolve(results[0]);
				  	}
				  }
				}); 
			});
		},
		execute: function(sql){
			return new Promise(function (resolve, reject){
				ctx.conn.query(sql, function (error, results, fields) {
				  if (error){
				  	reject(error);
				  }else{
				  	resolve(results);
				  }
				}); 
			});
		}
	};

	return ctx;
} 

module.exports = {
	create: function(options) {
		return new MysqlClient(options);
	}
};