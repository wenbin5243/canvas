var getTimeNow=function(){
	return +new Date();
};

var Game=function(gameName,canvasId){
	var canvas=document.getElementById(canvasId),
		self=this;

	this.context=canvas.getContext("2d");
	this.gameName=gameName;
	this.sprites=[];
	this.keyListeners=[];

	this.HIGH_SCORES_SUFFIX="_highscores";

	this.imageLoadingProgressCallback;
	this.iamges={};
	this.imageUrls=[];
	this.imagesLoaded=0;
	this.imagesFailedToLoad=0;
	this.imagesIndex=0;

	this.startTime=0;
	this.lastTime=0;
	this.gameTime=0;
	this.fps=0;
	this.STARTING_FPS=60;

	this.paused=false;
	this.startedPauseAt=0;
	this.PAUSE_TIMEOUT=100;

	this.soundOn=true;
	this.soundChannels=[];

	this.soundOn=true;
	this.soundChannels=[];
	this.audio=new Audio();
	this.NUM_SOUND_CHANNELS=10;

	for(var i=0;i<this.NUM_SOUND_CHANNELS;++i){
		var audio=new Audio();
		this.soundChannels.push(audio);
	}

	window.onkeypress=function(e){
		self.keyPressed(e);
	};
	window.onkeydown=function(e){
		self.keyPressed(e);
	};
	return this;
};

Game.prototype={
	getImage:function(imageUrl){
		return this.images[imageUrl];
	},
	imageLoadedCallback:function(e){
		this.imagesLoaded++;
	},
	imageLoadErrorCallback:function(e){
		this.imagesFailedToLoad++;
	},

	loadImage:function(imageUrl){
		var image=new Image(),
			self=this;

		image.src=imageUrl;

		image.addEventListener("load",function(e){
			self.imageLoadedCallback(e);
		});
		image.addEventListener("error",function(e){
			self.imageLoadErrorCallback(e);
		});
		this.images[imageUrl]=image;
	},

	loadImages:function(){
		if(this.imagesIndex<this.imageUrls.length){
			this.loadImage(this.imageUrls[this.imagesIndex]);
			this.imagesIndex++;
		}

		return (this.imagesLoaded+this.imagesFailedToLoad)/this.imageUrls.length*100;
	},
	queueImage:function(imageUrl){
		this.imageUrls.push(imageUrl);
	},

	start:function(){
		var self=this;
		this.startTime=getTimeNow();

		window.requestNextAnimationFrame(
			function(time){
				self.animate.call(self,time);
			}
		);
	},

	animate:function(time){
		var self=this;
		if(this.paused){
			setTimeout(function(){
				self.animate.call(self,time);
			},this.PAUSE_TIMEOUT);
		}else{
			this.tick(time);
			this.clearScreen();

			this.startAnimate(time);
			this.paintUnderSprites();

			this.updateSprites(time);
			this.paintSprites(time);

			this.paintOverSprites();
			this.endAnimate();

			window.requestNextAnimationFrame(function(time){
				self.animate.call(self,time);
			});
		}
	},

	tick:function(time){
		this.updateFrameRate(time);
		this.gameTime=(getTimeNow())-this.startTime;
		this.lastTime=time;
	},

	updateFrameRate:function(time){
		if(this.lastTime===0){
			this.fps=this.STARTING_FPS;
		}else{
			this.fps=1000/(time-this.lastTime);
		}
	},
	clearScreen:function(){
		this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);
	},
	updateSprites:function(time){
		for(var i=0;i<this.sprites.length;++i){
			var sprite=this.sprites[i];
			sprite.update(this.context,time);
		};
	},
	paintSprites:function(time){
		for(var i=0;i<this.sprites.length;++i){
			var sprite=this.sprites[i];
			if(sprite.visible){
				sprite.paint(this.context);
			}
		};
	},
	togglePaused:function(){
		var now=getTimeNow();
		this.paused=!this.paused;

		if(this.paused){
			this.startedPauseAt=now;
		}else{
			this.startTime=this.startTime+now-this.startedPauseAt;
			this.lastTime=now;
		}
	}
}