/*

Connect ioBroker states with mqtt gBridge gbridge.kappelt.net to get google assistant / home support

To use this script add the mqtt npm package to js adapte.

*/

var mqtt = require('mqtt');

var gBridgeDevices = {
        "TOPIC1":"ioBrokerState1", /* e.g. "gBridge/u99/d99/onoff" : "tradfri.0.L-65777.lightbulb.state". */
        "TOPIC2":"ioBrokerState2"  /* e.g. "gBridge/u99/d99/brightness" : "tradfri.0.L-65777.lightbulb.brightness". */
    };

var options = {
  port: 8883,
  host: 'mqtt.gbridge.kappelt.net',
  protocol: 'mqtts',
  rejectUnauthorized: false,
  username: "gbridgeUSERNAME", /* e.g. gbridge-u99 */
  password: "gbridgeMQTTPW" /* set on https://gbridge.kappelt.net/profile */
}

var objAll =[];
var firstMsg =[];

if(client) {
    client.end(true); 
}

var client  = mqtt.connect(options);

client.on('connect', function () {
    
   for (gdevice in gBridgeDevices) { 
     
      // subscribe gbrdge topics
      client.subscribe(gdevice, function (err,granted) {
        if (err) {
           console.log(err);
        } 
      })
   }  
})

client.on('message', function (topic, message) {
  
  // ignore first message because it is always true? 
  if(firstMsg[topic] === true) {
      
      firstMsg[topic] = false;
      
  } else {
      
      // converting data for iobroker 
      var realval = message.toString();
      if(message.toString() == "0" || message.toString() == "false") {
           realval = false;
      } else if(message.toString() == "1" || message.toString() == "true") {
          realval = true;
      }
      
      console.log(gBridgeDevices[topic]+" : "+realval);
      setState(gBridgeDevices[topic],realval); 
  }
})

client.on('end', function() {
  console.log("end :(")
})


// publish iobroker states on change 
for (gdevice in gBridgeDevices) { 
   objAll[gBridgeDevices[gdevice]] = gdevice;
   firstMsg[gdevice] = true;
    on({id: gBridgeDevices[gdevice], change: "ne"}, function (obj) {
         gbridgePub(objAll[obj.id],obj.id);
    }); 
}

function gbridgePub(thisTopic,objid) {
    var pubVal = getState(objid).val.toString();
    
    if(typeof getState(objid).val === "boolean") {
      if(getState(objid).val === true) {
         pubVal = '1';
      } else {
          pubVal = '0';
      }
    } 
    client.publish(thisTopic+"/set", pubVal);
    console.log("pub to gbridge: "+thisTopic+"/set :: "+pubVal);
}

