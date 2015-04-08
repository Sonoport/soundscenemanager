var Fader = require('soundmodels/effects/Fader');

function SoundSceneManager(options){

	if (options.context){
		this._context = options.context;
	}else{
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this._context = new AudioContext();
	}

	this._scenes = [];
	this._sceneFaders = [];
	this._preMuteScene;
	this._previousFadeStart;
	this._previousFadeEnd;

	// Properties
	this.fadeDuration = options.fadeDuration || 2.0;
	this.currentScene;
	this.isMuted = false;

	options.scenes.forEach(function(thisScene){
		this.addScene(thisScene);
		if(thisScene.name === options.startingScene){
			this.currentScene = thisScene;
		}else{
			thisScene.fader.volume.value = 0;
		}
	}.bind(this));
}

SoundSceneManager.prototype.addSoundToScene = function(thisSound, thisSceneName){
	var selectedScene;

	this._scenes.forEach(function (thisScene){
		if (thisScene.name === thisSceneName){
			selectedScene = thisScene;
		}
	}.bind(this));

	if(!selectedScene){
		console.warn("Scene", thisSceneName, " not found.");
		return
	}

	thisSound.node.disconnect();
	thisSound.node.connect(selectedScene.fader);
	selectedScene.sounds.push(thisSound);
}

SoundSceneManager.prototype.addScene = function(thisScene){
	if (!thisScene.maxVolume || typeof thisScene.maxVolume !== 'number'){
		thisScene.maxVolume = 100;
	}
	this._scenes.push(thisScene);
	var newFader = new Fader(this._context);
	thisScene.fader = newFader;
	this._sceneFaders.push(newFader);
	thisScene.sounds.forEach(function(thisSound){
		this.addSoundToScene(thisSound, thisScene.name);
	}.bind(this));
	newFader.connect(this._context.destination);
}

SoundSceneManager.prototype.transitionToScene = function(sceneName, startTime, duration){

	var nextScene;
	if (!startTime || typeof startTime !== 'number'){
		startTime = this._context.currentTime;
	}
	if (!duration || typeof duration !== 'number'){
		duration = this.fadeDuration;
	}

	this._scenes.forEach(function (thisScene){
		if (thisScene.name === sceneName){
			nextScene = thisScene;
		}
	});

	if (!nextScene){
		console.warn("Unknown next scene.")
		return;
	}

	if (nextScene === this.currentScene){
		console.warn("Current scene and next scene are the same. No transition done.")
		return;
	}

	if (!this.isMuted){
		var fadeStartTime = Math.max(startTime - duration/2, this._context.currentTime);
		var fadeEndTime = fadeStartTime + duration;

		if (this.currentScene){
			console.log(""+this._context.currentTime, ": fading out", this.currentScene.name, ":", fadeStartTime, "-",fadeEndTime);


			var currentValue = this.currentScene.maxVolume;
			var remainingTime = (this._previousFadeEnd-this._context.currentTime);
			if (remainingTime >0){
				currentValue = (1-(remainingTime/(this._previousFadeEnd-this._previousFadeStart)))*currentValue;
				// console.log(currentValue);
			}

			this.currentScene.fader.volume.cancelScheduledValues(this._context.currentTime);
			this.currentScene.fader.volume.setValueAtTime(currentValue,fadeStartTime);
			this.currentScene.fader.volume.linearRampToValueAtTime(0,fadeEndTime);
		}

		if (nextScene){
			console.log(""+this._context.currentTime, ": fading in", nextScene.name, ":", fadeStartTime, "-",fadeEndTime)
			nextScene.fader.volume.cancelScheduledValues(this._context.currentTime);
			nextScene.fader.volume.setValueAtTime(0,fadeStartTime);
			nextScene.fader.volume.linearRampToValueAtTime(nextScene.maxVolume,fadeEndTime);
		}

		this._previousFadeStart = fadeStartTime;
		this._previousFadeEnd = fadeEndTime;
	}

	this.currentScene = nextScene;

}

SoundSceneManager.prototype.transitionToNextScene = function(startTime, duration){
	var currentIndex = this._scenes.indexOf(this.currentScene);
	if (currentIndex < 0){
		console.warn("Unknown current scene", this.currentScene);
		return;
	}
	var nextIndex = (currentIndex+1)%this._scenes.length;
	this.transitionToScene(this._scenes[nextIndex].name, startTime, duration);
}

SoundSceneManager.prototype.transitionToPrevScene = function(startTime, duration){
	var currentIndex = this._scenes.indexOf(this.currentScene);
	if (currentIndex < 0){
		console.warn("Unknown current scene", this.currentScene);
		return;
	}
	var len = this._scenes.length;
	var nextIndex = ((currentIndex-1)%len + len)%len;
	this.transitionToScene(this._scenes[nextIndex].name, startTime, duration);
}

SoundSceneManager.prototype.endTransition = function(endTime){

	if (!endTime || typeof endTime !== 'number'){
		endTime = this._context.currentTime;
	}

	this._scenes.forEach(function (theScene){
		if (thisScene.name === sceneName){
			nextScene = thisScene;
		}
	});

	if (this.currentScene){
		this.currentScene.fader.volume.cancelScheduledValues(this._context.currentTime);
		this.currentScene.fader.volume.setValueAtTime(0,endTime);
	}
	if (nextScene){
		nextScene.fader.volume.cancelScheduledValues(this._context.currentTime);
		nextScene.fader.volume.setValueAtTime(nextScene.maxVolume,endTime);
	}
}

SoundSceneManager.prototype.mute = function(startTime, duration){
	if (!startTime || typeof startTime !== 'number'){
		startTime = this._context.currentTime;
	}
	if (!duration || typeof duration !== 'number'){
		duration = this.fadeDuration;
	}

	if (this.currentScene){
		console.log(""+this._context.currentTime, ": muting", this.currentScene.name, ":", startTime, "-",startTime+duration);

		var currentValue = this.currentScene.maxVolume;
		var remainingTime = (this._previousFadeEnd-this._context.currentTime);
		if (remainingTime >0){
			currentValue = (1-(remainingTime/(this._previousFadeEnd-this._previousFadeStart)))*currentValue;
			// console.log(currentValue);
		}

		this.currentScene.fader.volume.cancelScheduledValues(this._context.currentTime);
		this.currentScene.fader.volume.setValueAtTime(currentValue,startTime);
		this.currentScene.fader.volume.linearRampToValueAtTime(0,startTime+duration);

		this._previousFadeStart = startTime;
		this._previousFadeEnd = startTime+duration;
	}
	this.isMuted = true;
}

SoundSceneManager.prototype.unMute = function(startTime, duration){
	if (this.currentScene){
		if (!startTime || typeof startTime !== 'number'){
			startTime = this._context.currentTime;
		}
		if (!duration || typeof duration !== 'number'){
			duration = this.fadeDuration;
		}

		console.log(""+this._context.currentTime, ": unmuting", this.currentScene.name, ":", startTime, "-",startTime+duration)

		this.currentScene.fader.volume.cancelScheduledValues(this._context.currentTime);
		this.currentScene.fader.volume.setValueAtTime(0,startTime);
		this.currentScene.fader.volume.linearRampToValueAtTime(this.currentScene.maxVolume,startTime+duration);

		this._previousFadeStart = startTime;
		this._previousFadeEnd = startTime+duration;
	}
	this.isMuted = false;
}

SoundSceneManager.prototype.toggleMute = function(startTime, duration){
	if (this.isMuted === false){
		this.mute(startTime, duration);
	}else{
		this.unMute(startTime, duration);
	}
}


module.exports = SoundSceneManager;
