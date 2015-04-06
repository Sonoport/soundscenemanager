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
	this.preMuteScene;

	this.scenes.forEach(function(thisScene, sceneIndex){
		var newFader = new Fader(this.context);
		if(thisScene.name === options.startingScene){
			this.currentScene = thisScene;
		}else{
			newFader.volume.value = 0;
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
	var nextScene;
	if (!startTime || typeof startTime !== 'number'){
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

	if (this.currentScene){
		console.log(""+this.context.currentTime, ": fading out", this.currentScene.name, ":", fadeStartTime, "-",fadeEndTime)
		this.currentScene.fader.volume.cancelScheduledValues(this.context.currentTime);
		this.currentScene.fader.volume.setValueAtTime(100,fadeStartTime);
		this.currentScene.fader.volume.linearRampToValueAtTime(0.00001,fadeEndTime);
	}

	if (nextScene){
		console.log(""+this.context.currentTime, ": fading in", nextScene.name, ":", fadeStartTime, "-",fadeEndTime)
		nextScene.fader.volume.setValueAtTime(0,fadeStartTime);
		nextScene.fader.volume.linearRampToValueAtTime(100,fadeEndTime);
	}

	this.currentScene = nextScene;
}

SoundSceneManager.prototype.transitionToNextScene = function(startTime, duration){
	var currentIndex = this.scenes.indexOf(this.currentScene);
	if (currentIndex < 0){
		console.warn("Unknown current scene", this.currentScene);
		return;
	}
	var nextIndex = (currentIndex+1)%this.scenes.length;
	this.transitionToScene(this.scenes[nextIndex].name, startTime, duration);
}

SoundSceneManager.prototype.transitionToPrevScene = function(startTime, duration){
	var currentIndex = this.scenes.indexOf(this.currentScene);
	if (currentIndex < 0){
		console.warn("Unknown current scene", this.currentScene);
		return;
	}
	var len = this.scenes.length;
	var nextIndex = ((currentIndex-1)%len + len)%len;
	this.transitionToScene(this.scenes[nextIndex].name, startTime, duration);
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

	if (this.currentScene){
		this.currentScene.fader.volume.setValueAtTime(0,endTime);
	}
	if (nextScene){
		nextScene.fader.volume.setValueAtTime(1,endTime);
	}
}

SoundSceneManager.prototype.mute = function(startTime, duration){
	this.preMuteScene = this.currentScene.name;
	this.transitionToScene(null,startTime,duration);
}

SoundSceneManager.prototype.unMute = function(startTime, duration){
	this.transitionToScene(this.preMuteScene,startTime,duration);
	this.preMuteScene = null;
}

SoundSceneManager.prototype.toggleMute = function(startTime, duration){
	if (this.preMuteScene == null){
		this.mute(startTime, duration);
	}else{
		this.unMute(startTime, duration);
	}
}


module.exports = SoundSceneManager;
