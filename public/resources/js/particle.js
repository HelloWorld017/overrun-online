var Particle = function(x, y, sizeX, sizeY, life, color, reduceX, reduceY, motionX, motionY){
	this.x = x;
	this.y = y;
	this.sizeX = (sizeX === undefined) ? 50 : sizeX;
	this.sizeY = (sizeY  === undefined) ? this.sizeX : sizeY;
	this.current = 0;
	this.life = (life === undefined) ? 100 : life;

	this.color = color || "#000";
	this.reduceX  = reduceX || 0;
	this.reduceY = (reduceY === undefined) ? this.reduceX : reduceY;
	this.motionX = motionX || 0;
	this.motionY = motionY || 0;

	this.render = Particle.defaultRender(this);

	this.doUpdate = function(_this){
		_this.sizeX = Math.max(0, _this.sizeX - _this.reduceX);
		_this.sizeY = Math.max(0, _this.sizeY - _this.reduceY);
		_this.x += _this.motionX;
		_this.y += _this.motionY;
	};
};

Particle.prototype.update = function(){
	if(this.current <= this.life){
		this.current++;
		this.doUpdate(this);
	}
};

Particle.defaultRender = function(v){
	return function(ctx){
		ctx.fillStyle = v.color;

		ctx.beginPath();
		ctx.ellipse(v.x, v.y, v.sizeX, v.sizeY, 0, 0, Math.PI * 2);
		ctx.fill();
	};
};

Particle.custom = function(x, y, sizeX, sizeY, life, color, init, update, render){
	this.x = x;
	this.y = y;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.current = 0;
	this.life = (life === undefined) ? 100 : life;
	this.color = color;
	this.doUpdate = update;
	this.render = render || Particle.defaultRender(this);
	init(this);
};

Particle.update = function(){
	particles.forEach(function(v){
		v.update();
	});
};

Particle.custom.prototype.update = Particle.prototype.update;

var particles = [];

Particle.garbageCollect = function(){
	particles = particles.filter(function(v){
		return v.life > v.current;
	});
	setTimeout(Particle.garbageCollect, 5000);
}

Particle.renderParticle = function(ctx){
	particles.forEach(function(v){
		v.render(ctx, v);
	});
}
