var keypress = require('keypress');
var bebop = require('node-bebop');
var drone = bebop.createClient();
var takeOff = 0;
drone.connect();
var speed = 15;

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key); //use to determine keyname
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  } else {
    switch (key.name)
    {
      case 'w' :
      if (takeOff == 0 ){
       console.log('takeoff\n');
       drone.takeOff();
       takeOff = 1;
     } else { //else move forward
       console.log('forward\n');
        drone.forward(speed);
       //stop drone from moving forward after one second
       setTimeout(function() {
         //term.bold('stop');
         drone.stop();
        },1500);
      }
     break ;

     case 'space' :
       console.log('land\n');
       drone.land() ;
       takeOff = 0;
       if (takeOff == 0)
          setTimeout(function(){process.exit(1);},100);
       break ;

      case 'f' :
       console.log('flip\n');
       drone.backFlip() ;
       //takeOff = 0;
       break ;

    }
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();
