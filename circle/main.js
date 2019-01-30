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
		[0,-1],
		[1,0],
		[0,1],
		[-1,0],
		[0,-1],
		[1,0],
		[0,1]
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
	var circleEdgesElem = document.getElementById("circleEdges");
	var circleEdges = parseFloat(circleEdgesElem.value);
	circleEdgesElem.onchange = function(){	
		circleEdges = parseFloat(circleEdgesElem.value);
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
			ctx.moveTo(1,0);
			for(var i = 0; i<circleEdges; i++){
				var theta = 2*Math.PI * (i/circleEdges);
				ctx.lineTo(Math.cos(theta),Math.sin(theta));
			}
			ctx.stroke();
		}
	});
	circleGraph.addDrawable(curve);
	var errorType = 0;
	var errorFuncs = [
		[
			function(){
				return 1;//circle radius is aways 1
			},
			function(t){
				var p = curve.getPoint(t);
				return mag(p);
			}
		],
		[
			function(){
				return 1;//circle radius is aways 1
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
				var theta = Math.PI*2*(t/4)
				return mag(sub(p,[Math.cos(theta),Math.sin(theta)]));
			}
		],
		[
			function(t){
				return Math.cos((t/4)*Math.PI*2);//circle radius is aways 1
			},
			function(t){
				var p = curve.getPoint(t);
				return p[0];
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
		[0,4]
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