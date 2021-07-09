/* 
File name : server.js
Purpose: modifies the database so as to create a class instance for ewach time slot occupied by a given class
(makes querying for no time overlap easier)
Author: Anna Goncharova
Last Modified: 06/30/2021
*/

//setup
var express = require('express');
const bodyParser = require('body-parser');
const { query } = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 


//listen on port 5000
var server = app.listen(5000, function () {
    console.log('Server is running..');
});

var arr = new Array("M", "T", "W", "Th", "F");
var daysOfTheWeek= new Set();
for(var n of arr){
    daysOfTheWeek.add(n);
}
app.get('/try', function (req, res) {
   
    var sql = require("mssql");

    // config for the database
    var config = {
      user: 'sa',
     password: '123',
        server: 'localhost', 
        database: 'SchoolDB' ,
        options: {
            
            trustServerCertificate: true
        }
    };

    // connect to the database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create a Request object
        var request = new sql.Request();
        var count=0;
           
        // query to the database and get the records
        request.query('select  Registration_ID, Days_and_Times from brynMawrClasses ', function (err, recordset) {
            
            if (err) console.log(err)

            
           var myClasses=recordset.recordset;
           for(k=0;k<myClasses.length;k++){
             
              
               var str=myClasses[k].Days_and_Times;
               var q=0;
               
               while(q<str.length){
                   var days = new Set();
                   //get the days for a given class
                  while(q<str.length&&(/[a-zA-Z]/).test(str.charAt(q))){
                       if(q<(str.length-1)&&str.charAt(q)=='T'&&str.charAt(q+1)=='h'){
                           days.add('Th');
                           q+=2;
                       }
                       else{
                           if(daysOfTheWeek.has(str.substring(q, q+1))){
                               days.add(str.substring(q, q+1));
                           }
                           q++;
                       }
                  }
                  q++;//skip the space

                  //get the times for a given class
                  if(q<str.length){
                      var sh, sm, eh, em;
                       var startH=str.substring(q, q+2);
                       q+=3;
                       var startM=str.substring(q, q+2);
                       q+=2;
                       if(startH.charAt(0)=='0'){
                           sh=parseInt(startH.substring(1, 2), 10);
                       }
                       else{
                        sh=parseInt(startH.substring(0, 2), 10);
                       }
                       if(startM.charAt(0)=='0'){
                        sm=parseInt(startM.substring(1, 2), 10);
                    }
                    else{
                     sm=parseInt(startM.substring(0, 2), 10);
                    }
                       if(str.substring(q, q+2)=='pm'&&sh!=12){
                           sh+=12
                       }
                       var timeStart=sh*100+sm;
                       q+=3;
                       var endH=str.substring(q, q+2);
                       q+=3;
                       var endM=str.substring(q, q+2);
                       q+=2;

                       if(endH.charAt(0)=='0'){
                           eh=parseInt(endH.substring(1, 2), 10);
                       }
                       else{
                        eh=parseInt(endH.substring(0, 2), 10);
                       }
                       if(endM.charAt(0)=='0'){
                        em=parseInt(endM.substring(1, 2), 10);
                    }
                    else{
                     em=parseInt(endM.substring(0, 2), 10);
                    }
                       if(str.substring(q, q+2)=='pm'&&eh!=12){
                           eh+=12
                       }
                      var timeEnd=eh*100+em;
                       q+=3;
                        for(var currDay of days){
                            reqClass=new sql.Request();
                            console.log(myClasses[k]);
                            var addition='INSERT INTO class_instances VALUES('+count+',\''+myClasses[k].Registration_ID+"\',\'"+currDay+"\',"+timeStart+","+timeEnd+");";
                            console.log(addition);
                            count++;
                            
                            reqClass.query(addition, function(e, r){
                                if(e) console.log(e);
                               
                            });
                            
                        }
                  }
                 
                    
               }
               
           }
            res.send("successful");
            
        });
    });
});

