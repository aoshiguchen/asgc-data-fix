let fix = require('../../src');

fix
.loadConfig('./config1.json')
.startup('dev', ['testplugin', async function(testplugin){
	testplugin.say('你好帅!');
}]);
