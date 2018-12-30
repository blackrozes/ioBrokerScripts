
/* 
swith off/on fritz box leds

Load additional npm modules 'netatmo-api' (config javascript adapter)

Usage: Provide fbIP and load additional npm modules 'xml2js' (config javascript adapter)
call  set_led(state) function state is "1" to switch on and "2" to switch off. 

*/


var parseString = require('xml2js').parseString;
var request = require('request');
var fbIP = "" /* ID Adress of your fritzbox */

function set_led(state) {

    request('http://'+fbIP+'/login_sid.lua', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          parseString(body, {
                explicitArray: false,
                mergeAttrs: true
             }, 
             function (err, result) {
                if (err) {
                   log("Fehler: " + err);
                } else {
                   if(result.SessionInfo.SID !="0000000000000000") {
                       
                        var headers = {
                            'User-Agent':       'Super Agent/0.0.1',
                            'Content-Type':    'multipart/form-data'
                        }
                        
                        var options = {
                            url: 'http://'+fbIP+'/system/led_display.lua?sid='+result.SessionInfo.SID,
                            method: 'POST',
                            headers: headers,
                           form: {'led_display': state,'apply': '','sid': result.SessionInfo.SID}
                        }
                        
                        // Start the request
                        var xcode = request(options, function (error, response, body) { });
                     
  
                   } else {
                       log.error("No seession ID");
                       
                   }
                }
             });
          
       } else  {
         log(error);
       }
    });
}
