var SoundSceneManager  = require('./index.js');
var Looper = require('soundmodels/models/Looper');


window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var oceanBgSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/Ocean_Amb_V2.mp3', null, function(){
	oceanBgSound.play();
});
var diverSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/Diver_V2.mp3', null, function(){
	diverSound.play();
});
var kitchenSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/restaurent.wav', null, function(){
	kitchenSound.play();
});
var clubSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/jazz.wav', null, function(){
	clubSound.play();
});

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
	fadeDuration: 2,
	context: context
}

var ssm = new SoundSceneManager(options);
console.log('starting transition at ', context.currentTime + 10);
ssm.transitionToScene('city', context.currentTime + 10);
ssm.transitionToScene('ocean', context.currentTime + 20);

