var Fader = require('soundmodels/effects/Fader');

function SoundSceneManager(options){

	if (options.context){
		this.context = options.context;
	}else{
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
	}

	this.scenes = options.scenes;
	this.sceneFaders = [];
	this.sounds = [];
	this.fadeDuration = options.fadeDuration || 2.0;

	this.currentScene;

	this.scenes.forEach(function(thisScene, sceneIndex){
		var newFader = new Fader(this.context);
		if (sceneIndex !== 0){
			newFader.volume.value = 0;
		}else{
			this.currentScene = thisScene;
		}
		thisScene.sounds.forEach(function(thisSound){
			this.sounds.push(thisSound);
			thisSound.model.setOutputEffect(newFader);
			newFader.disconnect();
			this.sceneFaders.push(newFader);
		}.bind(this));
		thisScene.fader = newFader;
		newFader.connect(this.context.destination);
	}.bind(this));
}

SoundSceneManager.prototype.transitionToScene = function(sceneName, startTime, duration){
	if (!startTime || typeof startTime !== 'number'){
		console.log('no start time!!');
		startTime = this.context.currentTime;
	}
	if (!duration || typeof duration !== 'number'){
		duration = this.fadeDuration;
	}

	this.scenes.forEach(function (thisScene){
		if (thisScene.name === sceneName){
			nextScene = thisScene;
		}
	});

	if (!nextScene){
		console.warn("No next scene", sceneName, "to transitions to");
	}

	var fadeStartTime = Math.max(startTime - duration/2, this.context.currentTime);
	var fadeEndTime = fadeStartTime + duration;

	console.log(this.context.currentTime, "Starting fade out at ", fadeStartTime, fadeEndTime);
	this.currentScene.fader.volume.setValueAtTime(100,fadeStartTime);
	this.currentScene.fader.volume.linearRampToValueAtTime(0,fadeEndTime);
	nextScene.fader.volume.setValueAtTime(0,fadeStartTime);
	nextScene.fader.volume.linearRampToValueAtTime(100,fadeEndTime);

	this.currentScene = nextScene;
}

SoundSceneManager.prototype.endTransition = function(endTime){

	if (!endTime || typeof endTime !== 'number'){
		endTime = this.context.currentTime;
	}

	this.scenes.forEach(function (theScene){
		if (thisScene.name === sceneName){
			nextScene = thisScene;
		}
	});

	this.currentScene.fader.volume.setValueAtTime(0,endTime);
	nextScene.fader.volume.setValueAtTime(1,endTime);
}


module.exports = SoundSceneManager;
