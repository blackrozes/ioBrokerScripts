/*

Use your neighbors rain sensors with netatmo API  

1. Create Account https://auth.netatmo.com/access/checklogin
2. Create APP https://dev.netatmo.com/en-US/resources/technical/introduction
3. Create iobrokerState
4. Load additional npm modules 'netatmo-api' (config javascript adapter)
5. Add script to iobroker 

*/

clearInterval(checkRain);

var checkRain = setInterval(function(){
    
    var NetatmoClient = require('netatmo-api');
    
    /* coordinates boundingbox arround your location first look at then use this https://boundingbox.klokantech.com/  */
    var lat_sw = ""; /*south-west latitude*/
    var lon_sw = ""; /*south-west longitude*/
    var lat_ne = ""; /*noth-east latitude*/
    var lon_ne = "";  /*noth-east longitude*/

    /*How many station should be rechecked */
    var recheckStations = 1;
    
    /*iobroker State e.g. netatmo.0.rain*/
    iobrokerState = "";
    
    /*APP*/
    var clientId = '';
    var clientSecret = '';
    
    /*Account*/
    var username = '';
    var password = '';
    
    var client = new NetatmoClient({
    	clientId: clientId,
    	clientSecret: clientSecret
    });
     
    client.getToken({
    	grant_type: 'password',
    	username: username, 
    	password: 'password
    }, function (err, result) {
        if (err) {
           console.log(err);
            return; 
        }
        
        client.getPublicData({ access_token: result.access_token, lat_ne: lat_ne, lon_ne:lon_ne, lat_sw:lat_sw,lon_sw:lon_sw, required_data: "rain", filter: true  }, function (err, result) {
            if (err) {
               console.log(err);
                return;
            }

            var rain = 0;
            
           result.body.forEach(function(station) { 
                
                for (var device in  station.measures){  
                   if(typeof station.measures[device].rain_live !== "undefined") {
                       if(station.measures[device].rain_live*1 > 0) {
                           rain++;                         
                       }                      
                   }
               }
           });
           if(rain > recheckStations) {
               console.log("rain");
               setState(iobrokerState,true);  
               return true;                
           }           
           
           if(rain <= 1) {
               console.log("no rain");
               setState(iobrokerState,false); 
           }       
        });
    }); 
}, 180000);    
