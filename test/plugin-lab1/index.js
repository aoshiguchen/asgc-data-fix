let fix = require('../../src');

fix
.startup('dev', ['testplugin', async function(testplugin){
	testplugin.say('你好帅!');
}]);
