var SoundSceneManager  = require('./index.js');

var options ={
	scenes:[{
		name:"ocean",
		sounds:[{
			name:"background",
			model: oceanBgSound,
		},{
			name:"diver",
			model: diverSound,
		}]
		fadeDuration: 5,
	},{
		name:"city",
		sounds:[{
			name:"kitchen",
			model: kitchenSound,
		},{
			name:"club",
			model: clubSound,
		}]
	}],
	fadeDuration: 5,
}

var oceanBgSound;
var diverSound;
var kitchenSound;
var clubSound;

var ssm = SoundSceneManager(options);

