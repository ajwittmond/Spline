var graph;

var k = 0.77
//bezier calculations



function init(){
	
	var gElem = document.getElementById("graph");
	
	graph = new Graph(gElem,gElem.width,gElem.height);
	
	
	var addPoints = document.getElementById("addpoints");
	var movePoints = document.getElementById("movePoints");
	addPoints.onchange = function(){
		movePoints.checked = false;
	}
	movePoints.onchange = function(){
		addPoints.checked = false;
	}
	
	var snapToGridElem = document.getElementById("snapToGrid");
	snapToGridElem.onchange = function(evt){
		graph.snapInputToGrid = snapToGridElem.checked;
	}
	graph.snapInputToGrid = snapToGridElem.checked;
	
	var scalingElem = document.getElementById("scalingGrid");
	var fixedElem = document.getElementById("fixedGrid");
	var setGridType = function(){
		graph.scaleGrid = scalingElem.checked
		graph.draw();
	}
	setGridType();
	scalingElem.onchange = setGridType;
	fixedElem.onchange = setGridType;
	
	var gridWElem = document.getElementById("gridWidth");
	var gridHElem = document.getElementById("gridHeight");
	var setGridDim = function(){
		graph.setGridDimensions(parseFloat(gridWElem.value),parseFloat(gridHElem.value));
		graph.draw();
	}
	gridWElem.onchange = setGridDim;
	gridHElem.onchange = setGridDim;
	
	var curve = new BezierCurve();
	graph.addDrawable(curve);
	graph.addDrawable({
		draw:function(){
			var dim = graph.getGridDimensions();
			gridWElem.value = dim[0];
			gridHElem.value = dim[1];
		}
	})
	graph.addClickListener({
		onClick: function(evt,p){
			if(addPoints.checked){
				curve.points.push(p);
				graph.draw();
			}else if(movePoints.checked){
				var point = curve.points[0];
				var last = Math.pow(point[0]-p[0],2)+Math.pow(point[1]-p[1],2);
				for(let pt of curve.points){
					let curr = Math.pow(pt[0]-p[0],2)+Math.pow(pt[1]-p[1],2);
					if(curr<last){
						point = pt;
						last = curr;
					}
				}
				point[0] = p[0]
				point[1] = p[1]
				graph.draw();
			}
		}
	});
	
	
	var stepElem = document.getElementById("step");
	stepElem.onchange = function(){
		graph.step = parseFloat(stepElem.value);
	}
	
	var kElem = document.getElementById("k");
	kElem.onchange = function(){
		k = parseFloat(kElem.value)
		curve.k = k;
		graph.draw();
	}
	kElem.value = k
	curve.k = k;
	
	document.getElementById("reset").onclick = function(evt){
		curve.points.length = 0;
		graph.draw();
	}
	
	graph.draw();
	
}

window.onload = init;