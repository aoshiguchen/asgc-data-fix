var type = require('./type');

var Callback = function(args,_default){
	if(!(this instanceof Callback)){
		return new callback(args,context);
	}

	var fn,argv = [];

	if(type.isFunction(args) || type.isAsyncFunction(args)){
		fn = args;
	}else if(type.isArray(args)){
		if(args.length <= 0){
			throw new Error('arguments invalid !');
		}else{
			argv = args.slice(0,args.length - 1);
			fn = args[args.length - 1];

			if(!type.isFunction(fn)  && !type.isAsyncFunction(fn)){
				throw new Error('arguments invalid !');
			}
		}
	}else{
		throw new Error('arguments invalid !');
	}

	this.fn = fn;
	this.argv = argv;
	this.filterCb = null;
	this.afterCb = null
	this.isStop = false;

	if(argv.length == 0 && _default){
		this.argv = _default;
	}	
};

Callback.prototype.stop = function(){
	this.isStop = true;
};

Callback.prototype.filter = function(filter){
	this.filterCb = filter;
};

Callback.prototype.after = function(after){
	this.afterCb = after;
};

Callback.prototype.invoked = async function(data = {},context){
	var params = [];

	try{
		for(var item of this.argv){
			if(this.isStop){
				break;
			}
			if(this.filterCb){
				params.push(await this.filterCb.call(context, item, data[item]));
			}else{
				params.push(data[item]);
			}
		}
		var res;
		if(!this.isStop){
			res = await this.fn.apply(context,params);
		}
	}finally{
		if(this.afterCb){
			await this.afterCb.call(context, '--');
		}
	}

	return res;
};

module.exports = Callback;

