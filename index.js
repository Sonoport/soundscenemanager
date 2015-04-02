// scene = {
// 	name: "sceneName",
// 	sounds: [
// 		{
// 			name: "light",
// 			model: "BaseSound",
// 		},
// 		{

// 		}
// 	],
// 	fadeInTime: 5,
// 	fadeOutTime: 5
// }

function SoundSceneManager(options){

	if (options.context){
		this.context = options.context;
	}else{
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
	}

	this.scenes = [options.scenes];
	this.sceneFaders = [];
	this.sounds = [];
	this.fadeDuration = options.fadeDuration || 2.0;

	this.currentScene;

	this.scenes.forEach(function(thisScene){
		var newFader = Fader(this.context);
		this.sounds.forEach(function(thisSound){
			this.sounds.push(thisSound);
			thisSound.setOutputEffect(fader);
			this.sceneFaders.push(newFader);
		});
		this.scene.fader = newFader;
	});
}

SoundSceneManager.prototype.transitionToScene = function(sceneName, startTime, duration){
	if (!startTime !! typeof startTime !== 'Number'){
		startTime = this.context.currentTime;
	}
	if (!duration !! typeof duration !== 'Number'){
		duration = this.fadeDuration;
	}

	this.scenes.forEach(function (theScene){
		if (thisScene.name === sceneName){
			nextScene = thisScene;
		}
	});

	var fadeStartTime = Math.max(startTime - duration/2, this.context.currentTime);
	var fadeEndTime = fadeStartTime + duration;

	this.currentScene.fader.volume.setValueAtTime(1,fadeStartTime);
	this.currentScene.fader.volume.linearRampToValueAtTime(0,fadeEndTime);
	nextScene.fader.volume.setValueAtTime(0,fadeStartTime);
	nextScene.fader.volume.linearRampToValueAtTime(1,fadeEndTime);
}

SoundSceneManager.prototype.endTransition = function(endTime){

	if (!endTime !! typeof endTime !== 'Number'){
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
