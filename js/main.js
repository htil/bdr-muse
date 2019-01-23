var thresh = 0.3;
var chart_options = {};

$( document ).ready(function() {
  // We use an inline data source in the example, usually data would
  		// be fetched from a server
      nodeConnect = new NodeSocket(500);
      flying = false;
      connected = false;
      //select = $('select').formSelect();

      $(window).keypress(function (e) {
        //console.log(e.keyCode)
        switch(e.keyCode.toString()) {
          case '99':
            if(!connected){
              window.Device.connect()
              connected = true;
            }
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

        /*
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
  			}*/

  			return res;
  		}

  		// Set up the control widget

  		var updateInterval = 30;
      /*
  		$("#updateInterval").val(updateInterval).change(function () {
  			var v = $(this).val();
  			if (v && !isNaN(+v)) {
  				updateInterval = +v;
  				if (updateInterval < 1) {
  					updateInterval = 1;
  				} else if (updateInterval > 2000) {
  					updateInterval = 2000;
  				}
  				$(this).val("" + updateInterval);
  			}
  		});*/



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

      			console.log(weighted.alpha + " : " + weighted.beta + " : " + weighted.theta);

            plotTarget = weighted.beta
            if (data.length < totalPoints) {
              data.push(plotTarget)
            } else {
              data = data.slice(1)
              data.push(plotTarget)
            }

            res = []
            for (var i = 0; i < data.length; ++i) {
              res.push([i, data[i]])
            }


            //plot.setData([drawRawData(res)]);
            //plot.draw();

            //console.log(data)
            //$.plot($("chart"), [drawRawData([0,0.5,0.75])], chart_options);

            if (plotTarget  > thresh){
                nodeConnect.forward();
                chart_options.colors = ["#6ef146"];
            } else {
                chart_options.colors = ["#F5D552"];
            }

            $.plot("#chart", [ drawRawData(res) ], chart_options);

      			//window.node.updateRawData(weighted.alpha || 0, "alpha");
      			//window.node.updateRawData(weighted.beta  || 0, "beta");
      			//window.node.updateRawData(weighted.engagement || 0, "engagement");
      		}, (status) => {
      			//console.log(status);
      			document.getElementById("batteryLevel").innerHTML = status.batteryLevel.toFixed(0) + "%";
      		});



  		//update();
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
