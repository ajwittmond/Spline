var circleGraph;
var errorGraph;



var grabbed = false;
var mx,my

//bezier calculations

function mag(vec){
	return Math.sqrt((vec[0]*vec[0]) + (vec[1]*vec[1]))
}

function lterp(a,b,t){
	return [
		a[0] + (b[0]-a[0])*t,
		a[1] + (b[1]-a[1])*t
	]
}

function qterp(a,b,c,t){
	return lterp(lterp(a,b,t),lterp(b,c,t),t)
}

function cterp(a,b,c,d,t){
	return lterp(qterp(a,b,c,t),qterp(b,c,d,t),t)
}


//takes array of lists of four points that create a bezier curve
function PiecewhileBezierCurve(curves){
	this.getPoint = function(t){
		var pts = curves[Math.floor(t)];
		return cterp(pts[0],pts[1],pts[2],pts[3],t%1);
	}
	this.getMax = function(){
		return curves.length
	}
}

function ErrorCalculator(exactFunc,approxFunc,interval){
	this.exactFunc = exactFunc;
	this.approxFunc = approxFunc;
	this.interval = interval;
	
	this.draw = function(ctx,rect,elem){
		var start = Math.max(rect.left,this.interval[0]);
		var end = Math.min(rect.right,this.interval[1]);
		var step = (rect.right-rect.left)/elem.width;
		
		if(start<end){
			ctx.beginPath();
			ctx.strokeStyle = "black"
			ctx.moveTo(start,this.approxFunc(start)-this.exactFunc(start))
			start+=step;
			do{
				start = Math.min(this.interval[1],start)
				var val = this.approxFunc(start)-this.exactFunc(start);
				if (val<=0)
					ctx.strokeStyle = "red"
				else
					ctx.strokeStyle = "green"
				ctx.lineTo(start,val)
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(start,val);
				
				start+=step;
			}while(start<end);
		}
		
		
	}
	
	
	this.approxIntegral = function(step){
		var integral = 0;
		for(let pos = this.interval[0]; pos<interval[1]; pos+=step){
			integral += (this.approxFunc(pos)-this.exactFunc(pos))*step;
		}
		return integral;
	}
	
	this.approxAbsIntegral = function(step){
		var integral = 0;
		for(let pos = this.interval[0]; pos<interval[1]; pos+=step){
			integral += Math.abs((this.approxFunc(pos)-this.exactFunc(pos))*step);
		}
		return integral;
	}
	
	this.approxSquareIntegral = function(step){
		var integral = 0;
		for(let pos = this.interval[0]; pos<interval[1]; pos+=step){
			let val = (this.approxFunc(pos)-this.exactFunc(pos))*step;
			integral += val*val;
		}
		return integral;
	}
}


function init(){
	
	var curve = new BezierCurve(
	[
		[-1,0],
		[-1,-1],
		[1,1],
		[1,0]
	]
	)
	curve.color = "red";
	var curveStepElem = document.getElementById("curveStep");
	curve.step = parseFloat(curveStepElem.value);
	curveStepElem.onchange = function(){
		curve.step = parseFloat(curveStepElem.value);
		console.log(curve.step)
		circleGraph.draw();
	}
	curve.pointsAndTangents = false;
	var sineStepElem = document.getElementById("sineStep");
	var sineStep = parseFloat(sineStepElem.value);
	sineStepElem.onchange = function(){	
		sineStepEdges = parseFloat(circleEdgesElem.value);
		circleGraph.draw();
	}
	
	var errorCalc;
	
	var stepElem = document.getElementById("integralStep")
	
	var integral = document.getElementById("integralOfError");
	var absIntegral = document.getElementById("absIntegralOfError");
	var squareIntegral = document.getElementById("squareIntegralOfError");
	
	var calcErrorIntegrals = function(){
		var step = parseFloat(stepElem.value);
		integral.innerHTML = ""+errorCalc.approxIntegral(step);
		absIntegral.innerHTML = ""+errorCalc.approxAbsIntegral(step);
		squareIntegral.innerHTML = ""+errorCalc.approxSquareIntegral(step);
	}
	
	stepElem.onchange = calcErrorIntegrals;
	
	var cg = document.getElementById("circleGraph");
	circleGraph = new Graph(cg,cg.width,cg.width);
	
	eg = document.getElementById("errorGraph");
	errorGraph = new Graph(eg,eg.width,eg.width*(2/3))
	
	var numElem = document.getElementById("num");
	
	curve.k = parseFloat(numElem.value);
	
	circleGraph.addDrawable({
		draw: function(ctx,rect){
			
			ctx.beginPath();
			ctx.strokeStyle= "green"
			ctx.moveTo(-1,-1);
			for(let x = -1; x<=1; x+=sineStep){
				let theta = Math.PI/2*x;
				ctx.lineTo(x,Math.sin(theta));
			}
			ctx.lineTo(1,1);
			ctx.stroke();
		}
	});
	circleGraph.addDrawable(curve);
	var errorType = 0;
	var errorFuncs = [
		[//this slot is not used here
			function(){
				return 1;
			},
			function(t){
				var p = curve.getPoint(t);
				return mag(p);
			}
		],
		[
			function(t){
				var theta = curve.getPoint(t)[0];
				return Math.abs(Math.sin(theta)/Math.pow(1+Math.pow(Math.cos(theta),2),3/2));
			},
			function(t){
				return curve.getCurvature(t);
			}
		],
		[
			function(t){
				return 0;//circle radius is aways 1
			},
			function(t){
				var p = curve.getPoint(t);
				var theta = (-Math.PI/2) + t*Math.PI;
				return mag(sub(p,[-1+(2*t),Math.sin(theta)]));
			}
		],
		[
			function(t){
				var p = curve.getPoint(t);
				return Math.sin(p[0]);//circle radius is aways 1
			},
			function(t){
				var p = curve.getPoint(t);
				return p[1];
			}
		]
		
	
	]
	
	//radius error
	errorCalc = new ErrorCalculator(
		function(t){
			return errorFuncs[errorType][0](t);
		},
		function(t){
			return errorFuncs[errorType][1](t);
		},
		[0,1]
	);
	
	errorGraph.addDrawable(errorCalc);
	
	numElem.onchange = function(){
		curve.k = parseFloat(numElem.value);
		circleGraph.draw();
		errorGraph.draw();
		calcErrorIntegrals();
	}
	
	
	circleGraph.draw();
	errorGraph.draw();
	calcErrorIntegrals();
	
	var getErrorType = function(){
		errorType = parseInt(document.querySelector('input[name="errorType"]:checked').value)
		errorGraph.draw();
		calcErrorIntegrals();
	}
	
	document.getElementById("radiusError").onchange=getErrorType;
	document.getElementById("curvatureError").onchange=getErrorType;
	document.getElementById("distError").onchange=getErrorType;
	document.getElementById("xAxisError").onchange=getErrorType;
	
	getErrorType();
	
}

window.onload = init;