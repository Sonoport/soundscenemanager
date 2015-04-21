function SoundSceneManager(options) {

  if (options.context) {
    this._context = options.context;
  }else {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this._context = new AudioContext();
  }

  this._scenes = [];
  this._sceneFaders = [];
  this._preMuteScene = null;
  this._previousFadeStart = null;
  this._previousFadeEnd = null;

  // Properties
  this.fadeDuration = options.fadeDuration || 2.0;
  this.currentScene = null;
  this.isMuted = false;

  options.scenes.forEach(function(thisScene) {
    this.addScene(thisScene);
    thisScene.fader.gain.value = 0;
    if (thisScene.name === options.startingScene) {
      this.currentScene = thisScene;
      if (options.fadeInAtStart) {
        this.unMute(this._context.currentScene, options.fadeInAtStartDuration || this.fadeDuration);
      }else {
        thisScene.fader.gain.value = 1;
      }
    }
  }.bind(this));
}

SoundSceneManager.prototype.addSoundToScene = function(thisSound, thisSceneName) {
  var selectedScene;

  var selectedScene = this._findSceneByName(thisSceneName);

  if (!selectedScene) {
    console.warn('Scene', thisSceneName, ' not found.');
    return;
  }

  var thisNode = thisSound.node;
  if (typeof thisNode === 'AudioNode' || thisNode.isBaseSound) {
    thisNode.disconnect();
    thisNode.connect(selectedScene.fader);
  }else if (thisNode instanceof Audio) {
    thisNode.crossOrigin = 'anonymous';
    thisSound.sourceNode = this._context.createMediaElementSource(thisNode);
    thisSound.sourceNode.connect(selectedScene.fader);
  }else {
    console.log('Unknown type of sound.node', thisSound, typeof thisNode);
  }

  selectedScene.sounds.push(thisSound);
};

SoundSceneManager.prototype.addScene = function(thisScene) {
  if (!thisScene.maxVolume || typeof thisScene.maxVolume !== 'number') {
    thisScene.maxVolume = 1;
  }

  this._scenes.push(thisScene);
  var newFader = this._context.createGain();
  thisScene.fader = newFader;
  this._sceneFaders.push(newFader);
  thisScene.sounds.forEach(function(thisSound) {
    this.addSoundToScene(thisSound, thisScene.name);
  }.bind(this));
  newFader.connect(this._context.destination);
};

SoundSceneManager.prototype._fadeInScene = function(scene, fadeStartTime, fadeEndTime) {
  console.log('' + this._context.currentTime, ': fading in', scene.name, ':', fadeStartTime, '-', fadeEndTime);
  scene.fader.gain.cancelScheduledValues(this._context.currentTime);
  scene.fader.gain.setValueAtTime(0, fadeStartTime);
  scene.fader.gain.linearRampToValueAtTime(scene.maxVolume, fadeEndTime);

  this._previousFadeStart = fadeStartTime;
  this._previousFadeEnd = fadeEndTime;
}

SoundSceneManager.prototype._fadeOutScene = function(scene, fadeStartTime, fadeEndTime, currentValue) {
  if (currentValue === undefined) {
    currentValue = scene.maxVolume;
  }

  console.log('' + this._context.currentTime, ': fading out', scene.name, ':', fadeStartTime, '-', fadeEndTime, 'from', currentValue);
  scene.fader.gain.cancelScheduledValues(this._context.currentTime);
  scene.fader.gain.setValueAtTime(currentValue, fadeStartTime);
  scene.fader.gain.linearRampToValueAtTime(0, fadeEndTime);
}

SoundSceneManager.prototype._getCurrentValue = function() {
  var currentValue = this.currentScene.maxVolume;
  var remainingTime = (this._previousFadeEnd - this._context.currentTime);
  if (remainingTime > 0) {
    currentValue = (1 - (remainingTime / (this._previousFadeEnd - this._previousFadeStart))) * currentValue;
  }

  return currentValue;
}

SoundSceneManager.prototype._findSceneByName = function(sceneName) {
  var nextScene;
  this._scenes.forEach(function(thisScene) {
    if (thisScene.name === sceneName) {
      nextScene = thisScene;
    }
  });

  return nextScene;
}

SoundSceneManager.prototype.transitionToScene = function(sceneName, startTime, duration) {

  var nextScene;
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
      var currentValue = this._getCurrentValue();
      this._fadeOutScene(this.currentScene, fadeStartTime, fadeEndTime, currentValue);
    }

    this._fadeInScene(nextScene, fadeStartTime, fadeEndTime);
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
  if (this.currentScene) {
    if (!startTime || typeof startTime !== 'number') {
      startTime = this._context.currentTime;
    }

    if (!duration || typeof duration !== 'number') {
      duration = this.fadeDuration;
    }

    var currentValue = this._getCurrentValue();
    this._fadeOutScene(this.currentScene, startTime, startTime + duration, currentValue);
  }

  this.isMuted = true;
};

SoundSceneManager.prototype.unMute = function(startTime, duration) {
  if (this.currentScene) {
    if (!startTime || typeof startTime !== 'number') {
      startTime = this._context.currentTime;
    }

    if (!duration || typeof duration !== 'number') {
      duration = this.fadeDuration;
    }

    this._fadeInScene(this.currentScene, startTime, startTime + duration);
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
