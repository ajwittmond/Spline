function Graph(elem,width,height){
	var obj = this;
	this.elem = elem;
	this.x = 0;
	this.y= 0;
	this.scale = 100;
	elem.width = width;
	elem.height = height;
	
	var grabbed = false;
	var mx = 0;
	var my = 0;
	
	var drawables = []
	
	var clickListeners = [];
	
	var ctx = elem.getContext("2d");
	this.ctx = ctx;
	
	var drawGrid = function(){
		var cx = obj.x+elem.width/2;
		var cy = obj.y+elem.height/2;
		
		ctx.beginPath();
		ctx.fillStyle = "white"
		ctx.setTransform(1,0,0,1,0,0);//identity
		ctx.fillRect(0,0,elem.width,elem.height);
		
		
		ctx.lineWidth = 0.5/obj.scale;
		ctx.setTransform(obj.scale,0,0,-obj.scale,cx,cy);//identity
		//ctx.translate(cx,cy);
		//ctx.scale(obj.scale,obj.scale);
		
		ctx.strokeStyle="black";
		
		var hw = 1/obj.scale * elem.width/2;
		var hh = 1/obj.scale * elem.height/2;
		var left = (-obj.x*1/obj.scale)-hw;
		var right = (-obj.x*1/obj.scale)+hw;
		var bottom = (obj.y*1/obj.scale)-hh;
		var tp = (obj.y*1/obj.scale)+hh;
		
		var base = 10;
		var divs = base;
		var num = base*1/obj.scale;
		if(num>base){
			while(divs<num)
				divs*=base;
		}else{
			while(divs/base>num)
				divs/=base
		}
		
		//get left and bottom starting points;
		var lstart = Math.floor(left/divs) * divs;
		var bstart = Math.floor(bottom/divs) * divs;
		
		ctx.beginPath();
		ctx.strokeStyle = "rgb(200,200,200)";
		//ctx.setLineDash([(divs/10)*(2/3),(divs/10)*(1/3)]);
		
		for(let vloc = lstart; vloc<right; vloc+=divs){
			ctx.moveTo(vloc,bstart);
			ctx.lineTo(vloc,tp);
			ctx.stroke();
		}
		
		for(let hloc = bstart; hloc<tp; hloc+=divs){
			ctx.moveTo(lstart,hloc);
			ctx.lineTo(right,hloc);
			ctx.stroke();
		}

		for(let vloc = lstart; vloc<right; vloc+=divs){
			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.translate(obj.x+elem.width/2,obj.y+elem.height/2)
			ctx.fillStyle= "rgb(100,100,100)"
			ctx.fillText(Math.round(vloc*10000)/10000+"",vloc*obj.scale,-obj.scale*(bottom + (tp-bottom)*0.005),obj.scale * divs)
			ctx.restore();
		}
		
		for(let hloc = bstart; hloc<tp; hloc+=divs){
			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.translate(obj.x+elem.width/2,obj.y+elem.height/2)
			ctx.fillStyle= "rgb(100,100,100)"
			ctx.fillText(Math.round(hloc*10000)/10000+"",obj.scale*(left + (right-left)*0.005),-obj.scale*hloc)
			ctx.restore();
		}
		
		
		ctx.beginPath();
		ctx.strokeStyle = "black"
		//draw axis
		ctx.moveTo(0,tp);
		ctx.lineTo(0,bottom);
		ctx.stroke();
		
		ctx.moveTo(left,0)
		ctx.lineTo(right,0);
		ctx.stroke();
		
	}
	
	elem.onmousedown = function(evt){
		grabbed = true;
		mx = evt.offsetX;
		my = evt.offsetY;
		var r = obj.getViewRect();
		var p = [
					r.left + mx*((r.right-r.left)/elem.offsetWidth),
					r.top + my*((r.bottom-r.top)/elem.offsetHeight) 
				];
		for(let o of clickListeners)
			o.onClick(evt,p)
	}
	elem.onmouseup = function(evt){
		grabbed = false
	}
	elem.onmouseout= function(evt){
	}
	elem.onmousemove = function(evt){
		var nx = evt.offsetX;
		var ny = evt.offsetY;
		if(grabbed){
			obj.x += (nx-mx) * (elem.width/elem.offsetWidth);
			obj.y += (ny-my)  * (elem.height/elem.offsetHeight);
			obj.draw();
		}
		mx=nx;
		my=ny;
		
	}
	elem.addEventListener("wheel",function(evt){
		var r = obj.getViewRect();
		
		var mxInit = r.left + (r.right-r.left)*(evt.offsetX/elem.offsetWidth);
		var myInit = r.top + (r.bottom-r.top)*(evt.offsetY/elem.offsetHeight);
		
		
		//change scale
		var sign = evt.deltaY/Math.abs(evt.deltaY);
		obj.scale+=(obj.scale*sign)/5;
		
		r = obj.getViewRect();
		
		var mxCurr = r.left + (r.right-r.left)*(evt.offsetX/elem.offsetWidth);
		var myCurr = r.top+ (r.bottom-r.top)*(evt.offsetY/elem.offsetHeight);
		
		obj.x+=obj.scale*(mxCurr-mxInit);
		obj.y-=obj.scale*(myCurr-myInit);
		
		evt.preventDefault();
		obj.draw()
	});
	
	this.draw = function(){
		drawGrid();
		var r = this.getViewRect();
		for(let d of drawables)
			d.draw(ctx,r,elem,this)
	}
	
	this.addDrawable = function(obj){
		if(obj.draw){
			drawables.push(obj)
		}else{console.log("not a drawable")}
	}
	
	this.removeDrawable = function(obj){
		drawables.splice(drawables.indexOf(obj),1)
	}
	this.addClickListener = function(obj){
		if(obj.onClick){
			clickListeners.push(obj);
		}
	}
	this.removeClickListener = function(obj){
		var i = clickListeners.indexOf(obj);
		if(i>=0){
			clickListeners.splice(i,1);
		}
	}
	this.getViewRect = function(){
		var hw = 1/obj.scale * elem.width/2;
		var hh = 1/obj.scale * elem.height/2;
		var left = (-obj.x*1/obj.scale)-hw;
		var right = (-obj.x*1/obj.scale)+hw;
		var bottom = (obj.y*1/obj.scale)-hh;
		var tp = (obj.y*1/obj.scale)+hh;
		return {
			left:left,
			right:right,
			top:tp,
			bottom:bottom
		}
	}
}