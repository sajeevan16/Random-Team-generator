const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  next();
}
app.use(allowCrossDomain);
app.get("/reset/reset/:passcode", (req, res) => {
  if(req.params.passcode == "iconfirmtorest"){
  const fs = require('fs');
  let rawdata = fs.readFileSync('app/data_orig.json');
  let allteam = JSON.parse(rawdata);
  writejson(allteam, 'app/data.json');
  res.json({ time: "Successfully reseted" });
  }else{
    res.json({ time: "Passcode Error" });
  }
});
// simple route
app.get("/:player/:passcode", (req, res) => {
  var moment = require('moment')
  const fs = require('fs');
  console.log(moment().format());
  let rawdata = fs.readFileSync('app/data.json');
  let allteam = JSON.parse(rawdata);
  teams = allteam.players
  var filterdArray = teams.filter(function (el) {
    return el.name == req.params.player &&
           el.passcode == req.params.passcode ;
  });
  if(filterdArray.length == 0){
    res.json({ message: "Team name or Pass code Error" });
  }
  if(filterdArray.length == 1){
    if(filterdArray[0].randomno == ""){
      console.log(allteam);
      var number = allteam.Numbers[Math.floor(Math.random() * allteam.Numbers.length)]
      console.log(allteam.Numbers)
      const index = allteam.Numbers.indexOf(number);
      if (index > -1) {
        allteam.Numbers.splice(index, 1);
      }
      allteam.takedNumbers.push(number);

      for (var i = 0; i < teams.length; i++) {
        if (teams[i].name === req.params.player) {
          teams[i].randomno = number;
          thisTeam = teams[i];
          break;
        }
      }
      allteam.players = teams;
      writejson(allteam, 'app/data.json')
      res.json({ time: 0, teamname: thisTeam.name, RandomNumber: thisTeam.randomno });
    }else{
      res.json({ time: 1, teamname: filterdArray[0].name, RandomNumber: filterdArray[0].randomno });
    }
  }
});
app.get('/', (req, res) => {
  res.sendFile('./index.html', { root: __dirname });
});

app.get('/allteamdata/thisurlgivealldataoftheteam/dontpublic', (req, res) => {
  res.sendFile('.app/data.json', { root: __dirname });
});

require("./app/routes/customer.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect();
  console.log(url);
})();
  const publicIp = require('public-ip');
(async () => {
    console.log(await publicIp.v4());
    //=> '46.5.21.123'
 
    console.log(await publicIp.v6());
    //=> 'fe80::200:f8ff:fe21:67cf'
})();
  console.log(`Server is running on port ${PORT}.`);
});


function writejson(jsonObj, filename){
  var jsonContent = JSON.stringify(jsonObj);
  console.log(jsonContent);
  const fs = require('fs');
  fs.writeFile(filename, jsonContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
      console.log("JSON file has been saved.");
  });
}