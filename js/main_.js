$( document ).ready(function() {
    nodeConnect = new NodeSocket(500);
    flying = false;

/*
    $( document ).click(function() {
    	stateIndex = (stateIndex + 1) % 2
  		state = labels[stateIndex]
  		console.log(state)
	});

*/
	$(window).keypress(function (e) {
    switch(e.keyCode.toString()) {
      case '119':
        nodeConnect.forward();
        break;
      case '32':
        if (!flying){
          nodeConnect.takeOff();
          flying = true;
        }
        else {
          nodeConnect.land();
          flying = false;
        }
        break;
    }

  /*
		if (e.keyCode === 0 || e.keyCode === 32) {
			e.preventDefault()
			nodeConnect.takeOff();
		}

    */
	})

});



		var data = [],
			totalPoints = 300;

		function getRandomData() {

			if (data.length > 0)
				data = data.slice(1);

			// Do a random walk

			while (data.length < totalPoints) {

				var prev = data.length > 0 ? data[data.length - 1] : 50,
					y = prev + Math.random() * 10 - 5;

				if (y < 0) {
					y = 0;
				} else if (y > 100) {
					y = 100;
				}

				data.push(y);
			}

			// Zip the generated y values with the x values

			var res = [];
			for (var i = 0; i < data.length; ++i) {
				res.push([i, data[i]])
			}

			return res;
		}

var totalPoints = 20;
var dataContainer = [];
var updateInterval = 30;


var drawRawData = function(chartData) {
    return chartData;
}

var chart_options = {
        series: {
            shadowSize: 1
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
        yaxis: {
            min: 0,
            max: 1,
            tickColor: "#eee",
            tickFormatter: function(v) {
                return v;
            }
        },
        xaxis: {
            show: false,
        },
        colors: ["#6ef146"],
        grid: {
            tickColor: "#eee",
            borderWidth: 0,
        }
};

var plot = $.plot($("#chart"), [drawRawData([0,0.5,0.75])], chart_options);


function update() {

			plot.setData([getRandomData()]);

			// Since the axes don't change, we don't need to call plot.setupGrid()

			plot.draw();
			setTimeout(update, updateInterval);
		}



const SECONDS = 0.25;
const BUFFER_SIZE = SECONDS * 256;
const WEIGHT = 0.95;
var thresh = 0.5;

let buffer = new Array();
let weighted = {
  alpha: -1,
  beta: -1,
  theta: -1,
  engagement: -1
};

window.Device = new Bluetooth.BCIDevice((sample) => {
			if (Bluetooth.BCIDevice.electrodeIndex("AF7") !== sample.electrode) return;

			sample.data.forEach(el => {
				if (buffer.length > BUFFER_SIZE) buffer.shift();
				buffer.push(el);
			});

			if (buffer.length < BUFFER_SIZE) return;

			let psd = window.bci.signal.getPSD(BUFFER_SIZE, buffer);

			let alpha = window.bci.signal.getBandPower(BUFFER_SIZE, psd, 256, "alpha");
			let beta  = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "beta");
			let theta = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "theta");
			let engagement = beta / (alpha + theta);
			let sum = alpha + beta + theta;

			let w_alpha = alpha / sum;
			let w_beta = beta / sum;
			let w_theta = theta / sum;

			if (weighted.alpha < 0) {
				weighted.alpha = w_alpha || 0;
				weighted.beta = w_beta || 0;
				weighted.theta = w_theta || 0;
				weighted.engagement = engagement || 0;
			} else {
				weighted.alpha = weighted.alpha * WEIGHT + (w_alpha || 0) * (1 - WEIGHT);
				weighted.beta =  weighted.beta  * WEIGHT + (w_beta  || 0)  * (1 - WEIGHT);
				weighted.theta = weighted.theta * WEIGHT + (w_theta || 0) * (1 - WEIGHT);
				weighted.engagement = weighted.engagement * WEIGHT + (engagement || 0) * (1 - WEIGHT);
			}

			//console.log(weighted.alpha + " : " + weighted.beta + " : " + weighted.theta);

      plotTarget = weighted.beta
      if (dataContainer.length < totalPoints) {
        dataContainer.push(plotTarget)
      } else {
        dataContainer = dataContainer.slice(1)
        dataContainer.push(plotTarget)
      }
      //console.log(dataContainer)
      //$.plot($("chart"), [drawRawData([0,0.5,0.75])], chart_options);

      if (weighted.alpha  > thresh){
        nodeConnect.forward();
      }

			//window.node.updateRawData(weighted.alpha || 0, "alpha");
			//window.node.updateRawData(weighted.beta  || 0, "beta");
			//window.node.updateRawData(weighted.engagement || 0, "engagement");
		}, (status) => {
			//console.log(status);
			//document.getElementById("battery").innerHTML = status.batteryLevel.toFixed(0) + "%";
		});


update();
