var SoundSceneManager  = require('./index.js');
var Looper = require('soundmodels/models/Looper');


window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var toLoad = 0;

function loadManager(callback){
	toLoad++;
	var onload = function(){
		toLoad--;
		if (typeof callback === 'function'){
			callback();
		}
		if (toLoad === 0){
			if (typeof onLoadAll === 'function'){
				onLoadAll();
			}
		}
	};
	return onload;
}

var oceanBgSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/Ocean_Amb_V2.mp3', null, loadManager());
var diverSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/Diver_V2.mp3', null, loadManager());
var kitchenSound = new Looper(context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/restaurent.wav', null, loadManager());
var clubSound = new Audio('https://dl.dropboxusercontent.com/u/77191118/sounds/jazz.wav');
clubSound.loop = true;

var options ={
	scenes:[{
		name:"ocean",
		sounds:[{
			name:"background",
			node: oceanBgSound,
		},{
			name:"diver",
			node: diverSound,
		}]
	},{
		name:"city",
		sounds:[{
			name:"club",
			node: clubSound,
		},{
			name:"kitchen",
			node: kitchenSound,
		}]
	}],
	fadeDuration: 1,
	startingScene: "ocean",
	fadeInAtStart: true,
	fadeInAtStartDuration: 5,
	context: context
};

var nextButton ;
var prevButton ;
var muteButton ;
var sceneSpan;

window.addEventListener('load', function(){
	nextButton = document.getElementById('next');
	prevButton = document.getElementById('prev');
	muteButton = document.getElementById('mute');
	sceneSpan = document.getElementById('scene');
});

function onLoadAll(){
	var ssm = new SoundSceneManager(options);
	window.ssm = ssm;
	console.log('starting SSM ', context.currentTime);

	oceanBgSound.play();
	diverSound.play();
	// kitchenSound.play();
	clubSound.play();

	nextButton.addEventListener('click', function(){
		ssm.transitionToNextScene();
	});

	prevButton.addEventListener('click', function(){
		ssm.transitionToPrevScene();
	});

	muteButton.addEventListener('click', function(){
		ssm.toggleMute();
	});
}



