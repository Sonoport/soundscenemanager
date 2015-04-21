# SoundSceneManager
Simple scene manager for fading between various sets of sounds..

[![npm version](https://badge.fury.io/js/soundscenemanager.svg)](http://badge.fury.io/js/soundscenemanager)

# Usage

```
npm install soundscenemanager
```

```js
var soundscenemanager = require('soundscenemanager');

var oceanBgSound = context.createBufferSource();
oceanBgSound.buffer = downloadedOceanBuffer; //some downloaded AudioBuffer

var options = {
	scenes:[{
		name:"ocean",
		sounds:[{
			name:"background",
			node: oceanBgSound,
		}]
	}, {
		name:"city",
		sounds:[{
			name:"kitchen",
			node: kitchenSound,
		}]
	}],
	fadeDuration: 1,
	startingScene: "ocean",
	context: context
}

var s = soundscenemanager(options);

// Transition to the next scene (city).
s.transitionToNextScene(context.currentTime+10, 2);

// Fades out all audio.
s.mute(context.currentTime+20, 2);

```

# API

## Constructor

eg :
```js
var oceanBgSound = context.createBufferSource();
oceanBgSound.buffer = downloadedOceanBuffer;

var options ={
	scenes:[{
		name:"ocean",
		maxVolume : 0.7,
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
			name:"kitchen",
			node: kitchenSound,
		},{
			name:"club",
			node: clubSound,
		}]
	}],
	fadeDuration: 1,
	startingScene: "ocean",
	fadeInAtStart: true,
	fadeInAtStartDuration : 5,
	context: context
}
var s = soundscenemanager(options);
```

- `options` object attribute contains the data about the various scenes in the following format:
	- `scenes` : __Array__ - Array of scene objects which are being managed by this SoundSceneManager. Each scenes object should have the following properties:
		- `name` : __String__ - The name of the scene.
		- `maxVolume` : __Number__ - The maximum volume of this scene [0,1];
		- `fadeInAtStart` : __Boolean__ - If the starting scene should fade in.
		- `fadeInAtStartDuration` : __Number__ - Time taken (sec) for the starting scene to fade in.
		- sounds : __Array__ - Array of sound objects which are a part of this specific scene. Each sound object should have the following properties:
			- `name` : __String__ - A name for identifying the sound object.
			- `node` : __AudioNode__/__SoundModel__/__Audio__ - An AudioNode which will be connected to the SoundSceneManager and faded in/out. It's preferable that this AudioNode isn't connected to any other AudioNodes, as it will be disconnected in the process of initializing the SoundSceneManager. A [Sonoport SoundModel object](https://github.com/sonoport/soundmodels) is also accepted here and so is an [HTML5 Audio](https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement) object.
	- `fadeDuration` : __Number__ - Default duration, in seconds, of all fadesin/fadeouts.
	- `startingScene` : __String__ - The name of the first scene to fade in at startup.
	- `context` : __AudioContext__ - [AudioContext](http://webaudio.github.io/web-audio-api/#the-audiocontext-interface) within which all the AudioNodes are created.

## Methods

- `transitionToScene` : Transition to a given scene. Fades out the audio from the current scene and fades in the audio from the given scene. If the nextScene is the same as current scene, this method will not do anything.

	- eg :

		```js
		s.transitionToScene('nextSceneName', context.currentTime+10, 2);
		```

	- arguments :
		- `nextSceneName` : __String__ - The `name` of the scene to transition to. If `null`, the current scene will fade out.
		- `startTime` : __Number__ - Start time for the transtion in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds of the transtion.

- `transitionToNextScene` : Similar to `transitionToScene` except it transtions to the next scene based on the order of the scenes as defined in the `scenes` array in the constructor options. If the current scene is the last scene in the array, this will transition to the first scene in the array.

	- eg :

		```js
		s.transitionToNextScene(context.currentTime+10, 2);
		```

	- arguments :
		- `startTime` : __Number__ - Start time for the transtion in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds of the transtion.

- `transitionToPrevScene` : Similar to `transitionToScene` except it transtions to the previous scene based on the order of the scenes as defined in the `scenes` array in the constructor options. If the current scene is the first scene in the array, this will transition to the last scene in the array.

	- eg :

		```js
		s.transitionToPrevScene(context.currentTime+10, 2);
		```

	- arguments :
		- `startTime` : __Number__ - Start time for the transtion in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds of the transtion.

- `mute` : Fades out all audio from the SoundSceneManager.

	- eg :

		```js
		s.mute(context.currentTime+10, 2);
		```

	- arguments :
		- `startTime` : __Number__ - Start time for begining of the fadeout in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds taken for the fadeout.

- `unMute` : Fades in all audio from the SoundSceneManager if faded out.

	- eg :

		```js
		s.unMute(context.currentTime+10, 2);
		```

	- arguments :
		- `startTime` : __Number__ - Start time for begining of the fadein in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds taken for the fadein.

- `toggleMute` : Toggles between `mute` and `unMute` APIs based on the current state of the SoundSceneManager.

	- eg :

		```js
		s.toggle(context.currentTime+10, 2);
		```

	- arguments :
		- `startTime` : __Number__ - Start time for begining of the fadein/fadeout in the same time coordinate system as the AudioContext _currentTime_ attribute.
		- `fadeDuration` : __Number__ - Duration in seconds taken for the fadein/fadeout.

- `addScene` : Adding a new scene for the SoundSceneManager to manage.

	- eg :

		```js
		var newScene = {
			name:"ocean",
			sounds:[{
				name:"background",
				node: oceanBgSound,
			},{
				name:"diver",
				node: diverSound,
			}]
		}
		s.addScene(newScene);
		```

	- arguments :
		- `newScene` : __Object__ - A new scene object that should have the following properties :
			- `name` : __String__ - The name of the scene.
			- `maxVolume` : __Number__ - The maximum volume of this scene [0,1];`
			- sounds : __Array__ - Array of sound objects which are a part of this specific scene. Each sound object should have the following properties:
				- `name` : __String__ - A name for identifying the sound object.
				- `node` : __AudioNode__ - An AudioNode which will be connected to the SoundSceneManager and faded in/out. It's preferable that this AudioNode isn't connected to any other AudioNodes, as it will be disconnected in the process of initializing the SoundSceneManager. A [Sonoport SoundModel object](https://github.com/sonoport/soundmodels) is also accepted here and so is an [HTML5 Audio](https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement) object.


- `addSoundToScene` : Add a new sound to ax existing scene.

	- eg :

		```js
		var newSound = {
			name:"background",
			node: oceanBgSound,
		}

		s.addSoundToScene(newSound,sceneName);
		```

	- arguments :
		- `newSound` : __Object__ - A new sound object that should have the following properties :
			- `name` : __String__ - A name for identifying the sound object.
			- `node` : __AudioNode__ - An AudioNode which will be connected to the SoundSceneManager and faded in/out. It's preferable that this AudioNode isn't connected to any other AudioNodes, as it will be disconnected in the process of initializing the SoundSceneManager. A [Sonoport SoundModel object](https://github.com/sonoport/soundmodels) is also accepted here and so is an [HTML5 Audio](https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement) object.
		- `sceneName` : __String__ - The name of the scene we want to add this Sound to.

## Properties

- `fadeDuration` : __Number__ - Default duration, in seconds, of all fadein/fadeouts.

- `currentSound` : __Object__ - The current scene object that's playing or being faded in.

- `isMuted` : __Boolean__ - Indicates if the SoundSceneManager is muted.


# License

Apache-2.0

See License file
