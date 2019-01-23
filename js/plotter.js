var ScatterPlot2D = function(id, x_range, y_range, x_title, y_title, size) {
	data = {}
	divID = id
	colorIndex = 0
	hexColorMap = ["#e31a1c", "377db8", "#4dae49", "#974ea2", "#ff7e00"] 
	size = size;
 	var layout = {
		xaxis: {
			range: x_range,
			title: x_title
		},
		yaxis: {
			range: y_range,
			title: y_title
		},
			title:'Band Power Plot'
	};

	this.addCategory = function(id) {
		//data[id] = { type: 'scatter', mode: 'markers', x: [], y: [], name: "test", marker: { size: 12, color: hexColorMap[colorIndex] }, text: ['TestA']};	
		data[id] = { type: 'scatter', mode: 'markers', x: [], y: [], marker: { size: size }, line: {color: "#66c2a4"}};	
	}

	this.getData = function() {
		var output = [];
		for (category in data) {
			output.push(data[category]);
		}
		return output;
	}

	this.plot = function(x, y, id) {
		if (data[id] == undefined) {
			this.addCategory(id);
			data[id].marker.color = hexColorMap[colorIndex];
			//data[id].marker.symbol = "circle-open-dot";
			colorIndex++;
			//colorIndex = (colorIndex + 1) % hexColorMap.length
		}
		data[id].x.push(x);
		data[id].y.push(y);
		data[id].name = id
		data[id].text = Date.now();
		Plotly.newPlot(divID, this.getData(), layout);
		Plotly.redraw(divID)
	}
}



plot = new ScatterPlot2D("tester", [-0.3, 1.3], [-0.3, 1.3], "Alpha", "Beta", 6);
labels = ["Eyes Open", "Eyes Closed"];
stateIndex = 0;
state = labels[stateIndex]


var ScatterPlot3D = function(id, x_range, y_range, z_range, x_title, y_title, z_title, size) {
	data = {}
	divID = id
	colorIndex = 0
	hexColorMap = ["#e31a1c", "377db8", "#4dae49", "#974ea2", "#ff7e00"]
	size = size;

	
}






