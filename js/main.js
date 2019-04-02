var thresh = 0.3;
var chart_options = {};

$( document ).ready(function() {
  // We use an inline data source in the example, usually data would be fetched from a server
	nodeConnect = new NodeSocket(500);
	flying = false;
	connected = false;

	$(window).keypress(async function (e) {
			switch(e.key) {
			case 'c':
				if (!connected) {
					await window.Device.connect();
					connected = true;
				}
				break;
			case ' ':
				if (!flying) {
					nodeConnect.takeOff();
					flying = true;
				}
				else {
					nodeConnect.land();
					flying = false;
				}
				break;
			}
	});

      chart_options = {

        grid: {
            borderWidth: 0,
        },
        lines: {
            show: true,
            lineWidth: 0.5,
            fill: true,
            fillColor: {
                colors: [{
                    opacity: 0.1
                }, {
                    opacity: 1
                }]
            }
        },
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: 0,
				max: 1
			},
			xaxis: {
				show: false
			}
		};

		var data = [];
		data.fill(1,0,20);
		var totalPoints = 80;
		var res = [];
		var plot = $.plot("#chart", [ getRandomData() ], chart_options);

  		function getRandomData() {

  			return res;
  		}

  		// Set up the control widget

		var updateInterval = 30;
  		function update() {
  			plot.setData([getRandomData()]);
  			// Since the axes don't change, we don't need to call plot.setupGrid()
  			plot.draw();
  			setTimeout(update, updateInterval);
  		}


	var drawRawData = function(chartData) {
		return chartData;
	}



	const SECONDS = 0.25;
	const BUFFER_SIZE = SECONDS * 256;
	const WEIGHT = 0.95;

	let buffer = new Array();
	let weighted = {
		alpha: -1,
		beta: -1,
		theta: -1,
		gamma: -1,
		engagement: -1
	};

	window.Device = new BCIDevice({
		dataHandler: data => {
			data.data.forEach(el => {
				if (buffer.length > BUFFER_SIZE) buffer.shift();
				buffer.push(el);
			});

			if (buffer.length < BUFFER_SIZE) return;

			let psd = window.bci.signal.getPSD(BUFFER_SIZE, buffer);

			let alpha = window.bci.signal.getBandPower(BUFFER_SIZE, psd, 256, "alpha");
			let beta  = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "beta");
			let theta = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "theta");
			let gamma = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "gamma");
			let engagement = beta / (alpha + theta);
			let sum = alpha + beta + theta + gamma;

			let w_alpha = alpha / sum;
			let w_beta = beta / sum;
			let w_theta = theta / sum;
			let w_gamma = gamma / sum;

			if (weighted.alpha < 0) {
				weighted.alpha = w_alpha || 0;
				weighted.beta = w_beta || 0;
				weighted.theta = w_theta || 0;
				weighted.gamma = w_gamma || 0;
				weighted.engagement = engagement || 0;
			} else {
				weighted.alpha = weighted.alpha * WEIGHT + (w_alpha || 0) * (1 - WEIGHT);
				weighted.beta =  weighted.beta  * WEIGHT + (w_beta  || 0)  * (1 - WEIGHT);
				weighted.theta = weighted.theta * WEIGHT + (w_theta || 0) * (1 - WEIGHT);
				weighted.gamma = weighted.gamma * WEIGHT + (w_gamma || 0) * (1 - WEIGHT);
				weighted.engagement = weighted.engagement * WEIGHT + (engagement || 0) * (1 - WEIGHT);
			}

			plotTarget = weighted.gamma;
			if (data.length < totalPoints) {
				data.push(plotTarget);
			} else {
				data = data.data.slice(1)
				data.push(plotTarget);
			}

			res = [];
			for (var i = 0; i < data.length; ++i) {
				res.push([i, data[i]]);
			}

			if (plotTarget  > thresh){
				nodeConnect.sendEngagementROS(weighted.engagement);
				chart_options.colors = ["#6ef146"];
			} else {
				chart_options.colors = ["#F5D552"];
			}
			$.plot("#chart", [ drawRawData(res) ], chart_options);
			window.node.updateRawData(weighted.alpha || 0, "alpha");
			window.node.updateRawData(weighted.beta  || 0, "beta");
			window.node.updateRawData(weighted.engagement || 0, "engagement");
		},
		statusHandler: status => {
			console.log(status)
			document.getElementById("batteryLevel").innerHTML = status.batteryLevel.toFixed(0) + "%";
		},
		connectionHandler: connected => {
			console.log(connected)
		}
	});

var handleInput = function(ev) {
  //console.log(ev)
}

document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, {autoTrigger: true, onCloseEnd:handleInput});
});

var selectedThresh = null
$("li").on('click', function() {
  thresh = parseFloat($(this)[0].innerText)
  if (selectedThresh) {
      selectedThresh.css({"background-color":"white"})
      selectedThresh = $(this)
      selectedThresh.css({"background-color":"#D8D6D8"})
  } else {
      selectedThresh = $(this)
      selectedThresh.css({"background-color":"#D8D6D8"})
  }



  selectedThresh = $(this);

});

});
