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