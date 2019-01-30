function bezierCurve(p1,t1,p2,t2,t){
	var a = (t2[0]-2*p2[0]+t1[0]+2*p1[0]);
	var b = (3*p2[0]-t2[0]-2*t1[0]-3*p1[0]);
	var c = t1[0];
	var d = p1[0];
	var e = (t2[1]-2*p2[1]+t1[1]+2*p1[1]);
	var f = (3*p2[1]-t2[1]-2*t1[1]-3*p1[1]);
	var g = t1[1];
	var h = p1[1];
	return [
		(Math.pow(t,3)*a) +
		(Math.pow(t,2)*b) +
		(t*c) + 
		d,
		(Math.pow(t,3)*e) +
		(Math.pow(t,2)*f) +
		(t*g) + 
		h
	]
}

function mul(a,b){
	return [
		a[0]*b,
		a[1]*b
	]
}

function add(a,b){
	return [
		a[0]+b[0],
		a[1]+b[1]
	]
}

function sub(a,b){
	return [
		a[0]-b[0],
		a[1]-b[1]
	]
}


//takes array of lists of four points that create a bezier curve
function BezierCurve(points,step,k,color){
	this.points = points || [];
	this.step = step || 0.1;
	this.k = k;
	this.color = color || "black"
	this.draw = function(ctx,r,elem,graph){
		for(let i in this.points){
			let point = this.points[i];
			ctx.beginPath();
			ctx.fillStyle = (i==0 || i==this.points.length-1)? "red":"blue";
			ctx.arc(point[0],point[1],1/graph.scale*2,0,Math.PI*2);
			ctx.fill();
		}
		if(this.points.length>=4){			
			ctx.beginPath();
			ctx.strokeStyle = this.color;
			ctx.moveTo(this.points[1][0],this.points[1][1]);
			for(let i = 1; i<this.points.length-2; i++){
				var t = 0;
				while(t<1){
					var p = bezierCurve(this.points[i],mul(sub(this.points[i+1],this.points[i-1]),this.k),this.points[i+1],mul(sub(this.points[i+2],this.points[i]),this.k),t);
					ctx.lineTo(p[0],p[1]);
					t+=this.step;
				}
			}
			ctx.stroke();
		}
	}
	this.getPoint = function(t){
		var i = Math.floor(t);
		t-=i;
		if(i>=0 && i<this.points.length-3){
			i+=1;
			return bezierCurve(this.points[i],mul(sub(this.points[i+1],this.points[i-1]),this.k),this.points[i+1],mul(sub(this.points[i+2],this.points[i]),this.k),t);
		}
	}
	this.getCurvature = function(t){		
		var i = Math.floor(t);
		t-=i;
		if(i>=0 && i<this.points.length-3){
			i+=1;
			var p1 = this.points[i]
			var t1 = mul(sub(this.points[i+1],this.points[i-1]),this.k)
			var p2 = this.points[i+1]
			var t2 = mul(sub(this.points[i+2],this.points[i]),this.k)
			
			var a = (t2[0]-2*p2[0]+t1[0]+2*p1[0]);
			var b = (3*p2[0]-t2[0]-2*t1[0]-3*p1[0]);
			var c = t1[0];
			var d = p1[0];
			var e = (t2[1]-2*p2[1]+t1[1]+2*p1[1]);
			var f = (3*p2[1]-t2[1]-2*t1[1]-3*p1[1]);
			var g = t1[1];
			var h = p1[1];
			
			var t2 = t*t;
			var t3 = t*t*t;
			
			
			var crossMag = Math.abs(12*e*b*t2 + 6*e*c*t + 6*a*f*t2 + 4*b*f*t + 2*c*f - 12*a*f*t2 - 6*a*g*t - 6*e*b*t2 - 4*b*f*t - 2*b*g);
			
			var vpMag = Math.pow(Math.pow(3*a*t2 + 2*b*t + c,2)+Math.pow(3*e*t2 + 2*f*t + g,2),3/2)
			
			return crossMag/vpMag
		}
	}
}