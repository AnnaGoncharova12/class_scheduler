/* 
File name : server.js
Purpose: javascript component of the Bryn Mawr class scheduler project 
Author: Anna Goncharova
Last Modified: 06/30/2021
*/

//setup
var express = require('express');
const bodyParser = require('body-parser');
var FormData = require('form-data');
var fs = require('fs');
const { query } = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname));

//populate the set of available departments at Bryn Mawr College for future use
var brynMawr = new Set();
var conct="ANTH,ARAB,ARCH,ARTD,ARTT,ARTW,BIOL,CHEM,CITY,CMSC,CNSE,COML,CSTS,DSCI,EALC,ECON,EDUC,ENGL,ENVS,FREN,GEOL,GERM,GNST,GREK,"+
"HART,HEBR,HIST,HLTH,INDT,INST,ITAL,LATN,LING,MATH,MEST,PHIL,PHYS,POLS,PSYC,QUAN,RUSS,SOCL,SOWK,SPAN,WRIT,";
var bmArr=conct.split(",");
for(i=0;i< bmArr.length;i++){
brynMawr.add(bmArr[i]);
}

//listen on port 5000
var server = app.listen(5000, function () {
    console.log('Server is running..');
});



//parses a concatenated response string from the DB into several separate classes based on the class ID format
function parseClasses(key, departments ){
    var ans=[];
    var ind=1;
    var start=0;
    for( i=0;i<key.length;i++){
        if(ind<departments.length&&i<=(key.length-4)){
            if(i!=0&&key.substring(i, i+4)==departments[ind]){
                ans.push(key.substring(start, i));
                ind++;
                start=i;
            }   
        }
    }
    ans.push(key.substring(start, key.length));
    console.log(ans);
    return ans;
}
//use axios to send a post request

classesArray=[];
const axios = require('axios');

app.post('/provideSchedules',  (request, result) =>{

    if(false){
       //code to be added to display more options to the user
    }
    else{

    var myClasses=[];
    var currClass=0;

    //get request params
    var college=request.body.school;
    var num=request.body.classes;
    var class1=request.body.class1;
    var class2=request.body.class2;
    var class3=request.body.class3;
    var class4=request.body.class4;
    var class5 =request.body.class5;
    var depts=[class1, class2, class3];

    //build up a new request 
    var reformedRequest="http://localhost:5000/provideSchedulesBackEnd?";
    reformedRequest+='school='+college;
    reformedRequest+='&classes='+num;
    reformedRequest+='&class1='+class1;
    reformedRequest+='&class2='+class2;
    reformedRequest+='&class3='+class3;
 
    if(num>3){
         reformedRequest+='&class4='+class4;
         depts.push(class4);
    }
    if(num>4){
         reformedRequest+='&class5='+class5;
         depts.push(class5);
    }
   
  //send a request to /provideSchedulesBackEnd
    axios.post(reformedRequest).then(res => {
    myClasses=res.data;
    classesArray=myClasses;
    var displayRequest='http://localhost:5000/displayOptions?start=0';
    displayRequest+='&classes='+num;
    displayRequest+='&class1='+class1;
    displayRequest+='&class2='+class2;
    displayRequest+='&class3='+class3;
   
    if(num>3){
         displayRequest+='&class4='+class4;
        
    }
    if(num>4){
        displayRequest+='&class5='+class5;
        
    }
    displayRequest+='&first=true';
    axios.get(displayRequest).then(answer  =>{
        console.log(answer.data);
        result.type('html').status(200);
        result.write(answer.data);
        result.end();
    });
    
    })
    .catch(error => {
    console.error(error);
    result.send("error");
    });
  }
});

app.get('/displayOptions', (req, res)=>{
    console.log("displayOptions");
 if(classesArray.length==0){
     res.send('the search did not find a suitable class schedule');
 }
 else{
     var formattedAnswers=[];
  var start=parseInt(req.query.start);
  var newStart=start+5;
  var prevStart=start-5;
  var num=req.query.classes;
  var class1=req.query.class1;
  var class2=req.query.class2;
  var class3=req.query.class3;
  var class4=req.query.class4;
      var class5 =req.query.class5;
      var first=req.query.first;
      console.log("first "+first);
      var depts=[class1, class2, class3];
        var nextLink="http://localhost:5000/displayOptions?start="+newStart+"&classes="+num+"&class1="+class1+
        "&class2="+class2+"&class3="+class3;
        var prevLink="http://localhost:5000/displayOptions?start="+prevStart+"&classes="+num+"&class1="+class1+
        "&class2="+class2+"&class3="+class3;
    if(num>3){
    nextLink+="&class4="+class4;
    prevLink+="&class4="+class4;
        depts.push(class4);
   }
   if(num>4){
    nextLink="&class5="+class5;
    prevLink="&class5="+class5;
        depts.push(class5);
   }
   nextLink+='&first=false';
   prevLink+='&first=false';
   console.log(start+" start");
   var count=start;
   console.log(classesArray.length);
   while(count<start+5&count<classesArray.length){
formattedAnswers.push(parseClasses(classesArray[count].outerKey, depts));
count++;
   }
   console.log(formattedAnswers);
   console.log("start html");

 //if the html is to be rendered in /provideSchedules
   if(first){
var toSend="";
	  toSend+="<html> <head>  <link rel=\"stylesheet\"  href=\"css/style.css\">	</head><body >" +
      " <div class=\"try\"><ul><li >1</li><li >2</li><li class=\"active\">3</li></ul></div>"+
	  " <h1>This semester you can take: </h1>" ;
      for(j=0;j<formattedAnswers.length;j++){
	 toSend+="<div  class=\"container\" ><div class=\"spacing\">";
                for(i=0;i<formattedAnswers[j].length;i++){
                    toSend+=formattedAnswers[j][i]+" ";
                    console.log(formattedAnswers[j][i]+" ");
                }
                console.log("\n");
                console.log("class");
                toSend+="</div></div>";
            }
            if(prevStart>=0){
                toSend+="<div class=\"button-container\">"+
            "<button onclick=\"location.href = \'"+prevLink+"\';\" class = \"nav-button\" id=\"prev\">Prev</button></div>";
            
            }
            if(newStart<classesArray.length){
            toSend+="<div class=\"button-container\">"+
            "<button onclick=\"location.href = \'"+nextLink+"\';\" class = \"nav-button\" id=\"next\">Next</button></div>";
            }
                toSend+="</body></html>";
                res.send(toSend);
        }

        else{
            res.type('html').status(200);
            res.write("<html> <head>  <link rel=\"stylesheet\"  href=\"css/style.css\">	</head><body >" +
            " <div class=\"try\"><ul><li >1</li><li >2</li><li class=\"active\">3</li></ul></div>"+
            " <h1>This semester you can take: </h1>") ;
            for(j=0;j<formattedAnswers.length;j++){
                res.write("<div  class=\"container\" ><div class=\"spacing\">");
                      for(i=0;i<formattedAnswers[j].length;i++){
                        res.write( toSend+=formattedAnswers[j][i]+" ");
                          console.log(formattedAnswers[j][i]+" ");
                      }
                      console.log("\n");
                      console.log("class");
                      res.write(toSend+="</div></div>");
                  }
                  if(prevStart>=0){
                    res.write("<div class=\"button-container\">"+
                    "<button onclick=\"location.href = \'"+prevLink+"\';\" class = \"nav-button\" id=\"prev\">Prev</button></div>");
                  }
                 if(newStart<classesArray.length){
                  res.write("<div class=\"button-container\">"+
                  "<button onclick=\"location.href = \'"+nextLink+"\';\" class = \"nav-button\" id=\"next\">Next</button></div>");
                 }
                  res.write("</body></html>");
                 
            res.end();
        }

 }
 
});

//this function querries the DB to find suitable classes that do not overlap
app.post('/provideSchedulesBackEnd', (req, res) => {
    var sql = require("mssql");

    // config for the database
    var config = {
      user: 'sa',
     password: '123',
        server: 'localhost', 
        database: 'SchoolDB' ,
        options: {
            
            trustServerCertificate: true
        },
        requestTimeout: 1000000
    };
    var college=req.query.school;
    var num=req.query.classes;
    var class1=req.query.class1;
    var class2=req.query.class2;
    var class3=req.query.class3;
     var class4=req.query.class4;
      var class5 =req.query.class5;
    console.log("I am in back end");
    console.log(class1);
    console.log(class2);
    console.log(class3);
    console.log(class4);
    console.log(class5);
    console.log(college);
    console.log(num);
    //res.send("successful");
    /*
    res.type('html').status(200);
    res.write("<html> <head>  <link rel=\"stylesheet\"  href=\"style.css\">	</head><body >"+
	" <h1>This semester you can take:</h1><div id=\"myListings\" class=\"ML\" >");
    */
    sql.connect(config, async function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
        if(college=='brynmawr'){
            if(num==3){
                var queryText="select noOverLapCount.outerKey from (select  count(noOverLap.key1) "+
                "as count1, noOverLap.key1 as outerKey FROM (SELECT A.ID AS \'F\', B.ID AS \'S\', C.ID AS \'T\' , "+
               " CONCAT(A.ID, B.ID, C.ID) as \'key1\' "+
                "FROM class_instances A, class_instances B, class_instances C  WHERE (A.Day_Of_The_Week<>B.Day_Of_The_Week OR "+
               "A.end_time<=B.start_time OR B.end_time<=A.start_time) AND (A.Day_Of_The_Week<>C.Day_Of_The_Week OR "+
           "  A.end_time<=C.start_time OR C.end_time<=A.start_time)  AND (C.Day_Of_The_Week<>B.Day_Of_The_Week OR " +
             "  C.end_time<=B.start_time OR B.end_time<=C.start_time)  "+
              "and A.Dept=\'"+class1+"\' and B.Dept=\'"+class2+"\' AND C.Dept=\'"+class3+"\' ) as noOverLap group by noOverLap.key1) " +
               "as noOverLapCount "+
                "inner join (select overLap.key1 as outerKeyTwo, count(overLap.key1) as count2 FROM (SELECT A.ID AS \'F\', B.ID AS \'S\', C.ID AS \'T\',  "+
               "  "+
               " CONCAT(A.ID, B.ID, C.ID) "+
               "as \'key1\' FROM class_instances A, class_instances B, class_instances C "+
               "WHERE   A.Dept=\'"+class1+"\' and B.Dept=\'"+class2+"\' AND C.Dept=\'"+class3+"\' ) as overLap "+
               "group by overLap.key1) as OverLapCount on outerKey=outerKeyTwo and count1=count2;";
                console.log(queryText);
            }
     else if(num==4){
            
         var queryText="select noOverLapCount.outerKey from (select  count(noOverLap.key1) "+
         "as count1, noOverLap.key1 as outerKey FROM (SELECT A.ID AS \'F\', B.ID AS \'S\', C.ID AS \'T\', D.ID AS \'FT\', "+
        " CONCAT(A.ID, B.ID, C.ID, D.ID) as \'key1\' "+
         "FROM class_instances A, class_instances B, class_instances C, class_instances D WHERE (A.Day_Of_The_Week<>B.Day_Of_The_Week OR "+
        "A.end_time<=B.start_time OR B.end_time<=A.start_time) AND (A.Day_Of_The_Week<>C.Day_Of_The_Week OR "+
    "  A.end_time<=C.start_time OR C.end_time<=A.start_time) AND (A.Day_Of_The_Week<>D.Day_Of_The_Week OR "+
        "A.end_time<=D.start_time OR D.end_time<=A.start_time) AND (C.Day_Of_The_Week<>B.Day_Of_The_Week OR " +
      "  C.end_time<=B.start_time OR B.end_time<=C.start_time) AND (B.Day_Of_The_Week<>D.Day_Of_The_Week OR "+
        "B.end_time<=D.start_time OR D.end_time<=B.start_time) and (C.Day_Of_The_Week<>D.Day_Of_The_Week OR "+
        "C.end_time<=D.start_time OR C.end_time<=D.start_time) "+
       "and A.Dept=\'"+class1+"\' and B.Dept=\'"+class2+"\' AND C.Dept=\'"+class3+"\' and D.Dept=\'"+class4+"\') as noOverLap group by noOverLap.key1)" +
        "as noOverLapCount "+
         "inner join (select overLap.key1 as outerKeyTwo, count(overLap.key1) as count2 FROM (SELECT A.ID AS \'F\', B.ID AS \'S\', C.ID AS \'T\', "+
        " D.ID AS \'FT\', "+
        " CONCAT(A.ID, B.ID, C.ID, D.ID) "+
        "as \'key1\' FROM class_instances A, class_instances B, class_instances C, class_instances D "+
        "WHERE   A.Dept=\'"+class1+"\' and B.Dept=\'"+class2+"\' AND C.Dept=\'"+class3+"\' and D.Dept=\'"+class4+"\') as overLap "+
        "group by overLap.key1) as OverLapCount on outerKey=outerKeyTwo and count1=count2;";
     }
   
         console.log(queryText);
         var  myClasses;
       
        var flag=false;
    
  
        function wrapper(){
            request.query(queryText, function(e, r){
              
               
                    if(e) console.log(e);
                  myClasses=r.recordset;
                  res.send(myClasses);
             flag=true;
       
                });
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve('xxx');
                    }, 1000)
                  })
        }
          
        
         await  wrapper();

            console.log("hi");
          
           
        }
        else{
        res.send("unable to query the database");
        }
        
        
    });

});
//this function redirects the user to the page where they can pick their desired classes
app.post('/chooseSchoolAndNumClasses', (req, res) => {
   // res.send(`Full name is:${req.body.school} ${req.body.classes}.`);
   var college=req.body.school;
   var num=req.body.classes;
   res.type('html').status(200);
   res.write("<html> <head>  <link rel=\"stylesheet\"  href=\"css/style.css\">	</head><body >"+
   " <div class=\"try\"><ul><li >1</li><li class=\"active\">2</li><li>3</li></ul></div><div class=\"container\">"+
   "  <h1>Find a class schedule for Fall 2021</h1><h2>Pick your areas of interest</h2>");
   res.write(  "<form action=\"http://localhost:5000/provideSchedules\" method=\"POST\">");
   res.write(" <input type=\"hidden\"  name=\"school\" value=\"brynmawr\">");
   res.write(" <input type=\"hidden\"  name=\"classes\" value=\""+num+"\">");
  //res.write("<div class=\"myOptions\"");
for(i=0;i<num;i++){
    var f=i+1;
res.write( "<div class =\"dropdown-container\">Class#"+f+"<select name=\"class"+f+"\" >");

if(college=="brynmawr"){
    for(var j of brynMawr){
    res.write(  "<option value=\""+j+"\">"+j+"</option>");
    }
}
res.write("  </select><br/></div>");
}
   res.write("<button type=\"submit\" class=\"myButton\">Submit</button></form></div></body></html>");
   res.end();

  });
  


