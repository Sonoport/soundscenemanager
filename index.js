function SoundSceneManager(options) {

	if (options.context) {

		this._context = options.context;

	}else {

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this._context = new AudioContext();

	}

	this._scenes = [];
	this._preMuteScene = null;
	this._previousFadeStart = null;
	this._previousFadeEnd = null;

	// Properties
	this.fadeDuration = options.fadeDuration || 2.0;
	this.currentScene = null;
	this.isMuted = false;

	options.scenes.forEach(function(thisScene) {

		var newScene = this.addScene(thisScene);
		newScene.fader.gain.value = 0;
		if (newScene.name === options.startingScene) {

			this.currentScene = newScene;
			if (options.fadeInAtStart) {

				var startTime = this._context.currentTime;
				var endTime = this._context.currentTime + options.fadeInAtStartDuration || this.fadeDuration;
				this._fadeInScene(this.currentScene, startTime, endTime, 0);

			}else {

				newScene.fader.gain.value = 1;

			}

		}

	}, this);

}

SoundSceneManager.prototype.addSoundToScene = function(thisSound, thisSceneName) {

	var newSound = {
		name: thisSound.name,
		node: thisSound.node
	};

	var selectedScene = this._findSceneByName(thisSceneName);

	if (!selectedScene) {

		console.warn('Scene', thisSceneName, ' not found.');
		return;

	}

	var thisNode = thisSound.node;
	if (typeof thisNode === 'AudioNode' || thisNode.isBaseSound || thisNode.isBaseEffect) {

		thisNode.disconnect();
		thisNode.connect(selectedScene.fader);

	}else if (thisNode instanceof Audio) {

		thisNode.crossOrigin = 'anonymous';
		newSound.sourceNode = this._context.createMediaElementSource(thisNode);
		newSound.sourceNode.connect(selectedScene.fader);

	}else {

		console.warn('Unknown type of sound.node', thisSound, typeof thisNode);

	}

	selectedScene.sounds.push(newSound);

	return newSound;

};

SoundSceneManager.prototype.addScene = function(thisScene) {

	if (!thisScene.maxVolume || typeof thisScene.maxVolume !== 'number') {

		thisScene.maxVolume = 1;

	}

	var newScene = {
		name: thisScene.name,
		maxVolume: thisScene.maxVolume,
		fadeInAtStart: thisScene.fadeInAtStart,
		fadeInAtStartDuration: thisScene.fadeInAtStartDuration,
		sounds: [],
		fader: this._context.createGain()
	};

	this._scenes.push(newScene);
	thisScene.sounds.forEach(function(thisSound) {

		this.addSoundToScene(thisSound, thisScene.name);

	}, this);
	newScene.fader.connect(this._context.destination);

	return newScene;

};

SoundSceneManager.prototype._fadeInScene = function(scene, fadeStartTime, fadeEndTime, currentValue) {

	// console.log('' + this._context.currentTime, ': fading in', scene.name, 'from', currentValue, ':', fadeStartTime, '-', fadeEndTime);
	scene.fader.gain.cancelScheduledValues(fadeStartTime);
	scene.fader.gain.setValueAtTime(currentValue, fadeStartTime);
	scene.fader.gain.linearRampToValueAtTime(scene.maxVolume, fadeEndTime);

	scene._prevStartValue = currentValue;
	scene._prevTargetValue = scene.maxVolume;
	scene._prevStartTime = fadeStartTime;
	scene._prevEndTime = fadeEndTime;

};

SoundSceneManager.prototype._fadeOutScene = function(scene, fadeStartTime, fadeEndTime, currentValue) {

	if (currentValue === undefined) {

		currentValue = scene.maxVolume;

	}

	// console.log('' + this._context.currentTime, ': fading out', scene.name, 'from', currentValue, ':', fadeStartTime, '-', fadeEndTime);
	scene.fader.gain.cancelScheduledValues(fadeStartTime);
	scene.fader.gain.setValueAtTime(currentValue, fadeStartTime);
	scene.fader.gain.linearRampToValueAtTime(0, fadeEndTime);

	scene._prevStartValue = currentValue;
	scene._prevTargetValue = 0;
	scene._prevStartTime = fadeStartTime;
	scene._prevEndTime = fadeEndTime;

};

SoundSceneManager.prototype._getCurrentValue = function(scene, rampType) {

	if (!rampType) {

		rampType = 'linear';

	}

	var currentValue = scene._prevTargetValue || scene.fader.gain.value;
	if (scene._prevEndTime && scene._prevEndTime > this._context.currentTime) {

		if (rampType === 'linear') {

			currentValue =  scene._prevStartValue + (scene._prevTargetValue - scene._prevStartValue) * ((this._context.currentTime - scene._prevStartTime) / (scene._prevEndTime - scene._prevStartTime));

		}

	}

	return currentValue;

};

SoundSceneManager.prototype._findSceneByName = function(sceneName) {

	var nextScene;
	this._scenes.forEach(function(thisScene) {

		if (thisScene.name === sceneName) {

			nextScene = thisScene;

		}

	});

	return nextScene;

};

SoundSceneManager.prototype.transitionToScene = function(sceneName, startTime, duration) {

	if (!startTime || typeof startTime !== 'number') {

		startTime = this._context.currentTime;

	}

	if (!duration || typeof duration !== 'number') {

		duration = this.fadeDuration;

	}

	var nextScene = this._findSceneByName(sceneName);

	if (!nextScene) {

		console.warn('Unknown next scene.');
		return;

	}

	if (nextScene === this.currentScene) {

		console.warn('Current scene and next scene are the same. No transition done.');
		return;

	}

	if (!this.isMuted) {

		var fadeStartTime = Math.max(startTime - duration / 2, this._context.currentTime);
		var fadeEndTime = fadeStartTime + duration;

		if (this.currentScene) {

			var currentValue = this._getCurrentValue(this.currentScene, 'linear');
			this._fadeOutScene(this.currentScene, fadeStartTime, fadeEndTime, currentValue);

		}

		var nextCurrentValue = this._getCurrentValue(nextScene, 'linear');
		this._fadeInScene(nextScene, fadeStartTime, fadeEndTime, nextCurrentValue);

	}

	this.currentScene = nextScene;

};

SoundSceneManager.prototype.transitionToNextScene = function(startTime, duration) {

	var currentIndex = this._scenes.indexOf(this.currentScene);
	var nextIndex = (currentIndex + 1) % this._scenes.length;
	this.transitionToScene(this._scenes[nextIndex].name, startTime, duration);

};

SoundSceneManager.prototype.transitionToPrevScene = function(startTime, duration) {

	var currentIndex = this._scenes.indexOf(this.currentScene);
	var len = this._scenes.length;
	var nextIndex = ((currentIndex - 1) % len + len) % len;
	this.transitionToScene(this._scenes[nextIndex].name, startTime, duration);

};

SoundSceneManager.prototype.mute = function(startTime, duration) {

	if (this.currentScene && !this.isMuted) {

		if (!startTime || typeof startTime !== 'number') {

			startTime = this._context.currentTime;

		}

		if (!duration || typeof duration !== 'number') {

			duration = this.fadeDuration;

		}

		var currentValue = this._getCurrentValue(this.currentScene, 'linear');
		this._fadeOutScene(this.currentScene, startTime, startTime + duration, currentValue);

	}

	this.isMuted = true;

};

SoundSceneManager.prototype.unMute = function(startTime, duration) {

	if (this.currentScene && this.isMuted) {

		if (!startTime || typeof startTime !== 'number') {

			startTime = this._context.currentTime;

		}

		if (!duration || typeof duration !== 'number') {

			duration = this.fadeDuration;

		}

		var nextCurrentValue = this._getCurrentValue(this.currentScene, 'linear');
		this._fadeInScene(this.currentScene, startTime, startTime + duration, nextCurrentValue);

	}

	this.isMuted = false;

};

SoundSceneManager.prototype.toggleMute = function(startTime, duration) {

	if (this.isMuted === false) {

		this.mute(startTime, duration);

	}else {

		this.unMute(startTime, duration);

	}

};

module.exports = SoundSceneManager;
