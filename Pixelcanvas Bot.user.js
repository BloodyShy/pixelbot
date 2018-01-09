// ==UserScript==
// @name         Pixelcanvas Bot
// @namespace    http://tampermonkey.net/
// @version      0.9.2
// @description  Pixelcanvas Bot for mlpixel.org
// @author       Some Anon
// @match        https://pixelcanvas.io/*
// @match        http://pixelcanvas.io/*
// @run-at      document-start
// @require  https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM.getValue
// @grant       GM_getValue
// @grant       GM.setValue
// @grant       GM_setValue
// ==/UserScript==
/*
 * DO NOT VIOLATE THE NAP!
                                     __  _.--''``''--..
                                    /  \/              `.
                                   ( /  \___             \
                                   | |      `'-.    __    \
                     ___           ( '.       __`.'` \`.   \
              ___   (   `.         /\    ,. .'__\  / `:_\   \
             (   `-. `.   `.      /  \_ __.` / .-| |'.|= \   |
              `-.   `-.`.   `.   :    r__,' ( (WW| \W)j   |  |
                 `.    `.\   _\  |    |    \_\_`/   ``-. /  /
        .--'''```-_`-,   `  (  | |    |            \__/.` .`
       /         ( ```    __ \  \|    \    -,______.-'/  /
      /           `-._   (  `.\  '.    \      /'.   .' .'
     /         ,.--''>`-. `-. `   |     `.   (  |  /  /   _
    (         |     / 8Y8`_: `_:. |       \   \ | l  ( ,:' \
    |        .'    |     (   (    (        \   |\ |   \  )  )
    |       .'     | 8Y8  `---:.__-\        \  | `.    `` .'
    |       |      |     8Y8        \        \ j   `'-..-'
    |       '.    / \        /       |        |
    |        |.--'   |      /-,______|        |
    l        |     _/      /     .-. |       / \
     \       '.   /       /     ( (` /      /   \
  __  \       |   |      |      |\ ``    _.'     )
.' /   \      |__/|      |      | `-._.-'(       |
| (_    |      |  |      |      |      |  \      |
'   `'-`       |  |       \     |       \  `.___/
 `-.._________/   \________)     \_______) 
 */
//initial variables
cooldown = 90000;
countdown = 0;
pixel_count = 0;
timestampp = 0;
cnt403 = 0;
cnt400 = 0;
got_fingerprint = 0;
first_template = "mlpol-aryanne";
second_template = "mlpol-property";
toggle_sound = 0;
bot_active = 1;
(async () => {
  first_template = await GM.getValue("first_template", "mlpol-aryanne");
  second_template = await GM.getValue("second_template", "mlpol-property");
  toggle_sound = await GM.getValue("toggle_sound", 0);
  bot_active = await GM.getValue("bot_active", 1);
})();

htmlFragmentBot = `
<div style="position: absolute; left: 4em; top: 1em;">
  <div id="boto" style="background-color: rgba(0, 0, 0, 0.85); color: rgb(250, 250, 250); text-align: center; vertical-align: text-bottom; width:300px; min-height: 45px; height: auto; border-radius: 21px; padding: 0px;">
    <div id="bot" style="cursor: pointer;">Bot Loading....</div>
    <div id="botconf">
      <div id="srv_message" style="font-size: 14px;"></div>
      <div>1.
        <select id="first_template">
        </select>
      </div>
      <div>2.
        <select id="second_template">
        </select>
      </div>
      <div>
        <span id="last_pixel" style="font-size: 14px;">(x: -, y: -, clr: -)</span> <span id="seccounter">-- s</span>
      </div>
      <div id="sound" style="font-size:12px; cursor: pointer; color: rgb(211, 211, 211);">
        <span id="toggle_sound">&#10008;</span><span>Play loud annoying sound on Captcha</span>
      </div>
    </div>
  </div>
  <audio id="captcha_audio" src="http://mlpixel.org/captcha.mp3"></audio>
`;

window.eval('oldFetch = window.fetch;window.fetch = function(a){if(arguments[0]=="/api/me"){FP = JSON.parse(arguments[1]["body"])["fingerprint"];console.log("Got FINGERPRINT:", FP);window.fetch = oldFetch;}return oldFetch.apply(this, arguments);}');

window.eval('Object.defineProperty(navigator, \'userAgent\', {value: \'Mozilla/5.0 \' + Math.floor((Math.random()*Math.pow(10,17))).toString()  + \'(compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)\'});');

window.addEventListener('load', function() {
  template_list = null;
  pixelcnt_list = null;
  loadGUI();
  setStatus("Waiting for Fingerprint...");
  setStatusColor("rgba(100, 100, 0, 0.75)");
  checkForFingerprint();
}, false);

function checkForFingerprint() {
  if(typeof window.eval('FP') !== 'undefined'){
    FP = window.eval('FP');
    console.log("Catched Fingerprint = " + FP);
    got_fingerprint = 1;
    botStatus();
    setPixel();
  } else {
    console.log("no");
    setTimeout(checkForFingerprint,300);
  }
}

//Create Statusbar for Bot
function loadGUI(){
  var div = document.createElement('div');
  div.setAttribute('class', 'post block bc2');
  div.innerHTML = htmlFragmentBot;
  document.body.appendChild(div);
  updateloop();
  updatecntloop();
  uiSound();
  botStatus();
  document.getElementById('bot').onclick = function(e){
    bot_active = 1 - bot_active;
    GM.setValue("bot_active", bot_active);
    botStatus();
    if (bot_active == 1){
      if (Date.now() >= timestampp + cooldown){
        setPixel();
      } else {
        console.log("[PixelBot] Old time still running....");
        updatePixelCount();
      }
    }
  };
  document.getElementById('sound').onclick = function(e){
    toggle_sound = !toggle_sound;
    GM.setValue("toggle_sound", toggle_sound);
    uiSound();
  };
  document.getElementById('first_template').onchange = function(e){
    first_template = this.value;
    GM.setValue("first_template", first_template);
  };
  document.getElementById('second_template').onchange = function(e){
    second_template = this.value;
    GM.setValue("second_template", second_template);
  };
}

//status of bot on/off
function botStatus(){
  if (bot_active == 0) {
    setStatus("Click to activate Bot");
    setStatusColor("rgba(0, 0, 0, 0.75)");
    document.getElementById("botconf").style.display = "none";
    document.getElementById("boto").style.lineHeight = "45px";
  } else {
    document.getElementById("botconf").style.display = "block";
    document.getElementById("boto").style.lineHeight = "normal";
  }
}
//status of sound on/off
function uiSound(){
    if(toggle_sound){
      document.getElementById('toggle_sound').innerHTML = '&#10004;';
      document.getElementById('sound').style.color = "rgb(250, 250, 250)";
    } else {
      document.getElementById('toggle_sound').innerHTML = '&#10008;';
      document.getElementById('sound').style.color = "rgb(211, 211, 211)";
    }
}

//load list of available Templates every 10 minutes
function updateloop(){
  console.log("Updating Template List");
  // Get JSON of available templates
  var xmlhttp = new XMLHttpRequest();
  var url = "https://raw.githubusercontent.com/BloodyShy/pixelbot/master/list.php";
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      template_list = JSON.parse(this.responseText);
      loadSelect();
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
  setTimeout(updateloop, 600000);
}
//load list of missing pixels every 40s
function updatecntloop(){
  console.log("Updating Pixelcount List");
  // Get JSON of available templates
  var xmlhttpn = new XMLHttpRequest();
  var urln = "https://raw.githubusercontent.com/BloodyShy/pixelbot/master/imbin.php";
  xmlhttpn.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      pixelcnt_list = JSON.parse(this.responseText);
      //GOT LIST HERE
    }
  };
  xmlhttpn.open("GET", urln, true);
  xmlhttpn.send();
  setTimeout(updatecntloop, 40000);
}

//load templates into drop-down menu
function loadSelect(){
  if(template_list == null)
    return;
  var keys = [];
  for(var k in template_list) keys.push(k);
  keys.sort(function(a, b){
    if(template_list[a]["name"] < template_list[b]["name"]) return -1;
    if(template_list[a]["name"] > template_list[b]["name"]) return 1;
    return 0;
  });
  var first = document.getElementById("first_template");
  var second = document.getElementById("second_template");
  var i;
  for(i = 0; i < keys.length; i++) {
    var name = keys[i];
    if(template_list[name]["bot"] == "no")
      continue;
    var selectf = document.createElement("option");
    selectf.value = name;
    selectf.innerHTML = template_list[name]["name"];
    first.add(selectf);
    var selects = document.createElement("option");
    selects.value = name;
    selects.innerHTML = template_list[name]["name"];
    second.add(selects);
  }
  document.getElementById("first_template").value = first_template;
  document.getElementById("second_template").value = second_template;
}

//update functions for Statusbar
function updatePixelCount(){
  setStatus("Bot Active | Pixels set: " + pixel_count);
  setStatusColor("rgba(0, 100, 0, 0.75)");
}
function setStatus(message){
  document.getElementById("bot").innerHTML = message;
}
function setStatusColor(color){
  document.getElementById("boto").style.backgroundColor = color;
}

//Get page-wide XMLHttpRequest instead of just on scriplevel
function getXMLHttp(){
   try {
      return XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
   }
   catch(evt){
      return new XMLHttpRequest();
   }
}

//countdown
function tick(){
  if (countdown == 0){
    document.getElementById("seccounter").innerHTML = "---";
    return;
  }
  document.getElementById("seccounter").innerHTML = countdown + " s";
  countdown -= 1;
  window.setTimeout(tick, 1000);
}
function waiting(cd){
  countdown = Math.floor(cd / 1000);
  tick();
  window.setTimeout(setPixel, cd);
}

//Get JSON with HTTP Request
var getJSON = function(url, callback) {
  var xhr = getXMLHttp();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    console.log("STATUS: " . status);
    if (status == 200) {
      callback(null, xhr.response);
    } else {
      callback(status, null);
    }
  };
  xhr.onerror = function(){
    console.log("[PixelBot] Couldn't connect to Bot-Server, trying again in 15s.");
    cooldown = 15000;
    setStatus("Template or mlpixel.org not available.");
    setStatusColor("rgba(100, 10, 0, 0.75)");
    waiting(cooldown);
    timestampp = Date.now();
  };
  xhr.send();
};


function retPixel()
{
  //fetchstat = window.wrappedJSObject.fetchstat;
  //fetchval = window.wrappedJSObject.fetchval;
  fetchstat = window.eval('fetchstat');
  fetchval = window.eval('fetchval');
  if (fetchstat == 0){
    window.setTimeout(retPixel,1000);
  } else {
    if(fetchstat == 422){
      if(pixel_count >= 10){
        console.log("[PixelBot] Captcha happened, waiting 3sec before reloading.");
        window.setTimeout(function(e){window.location.reload(false);},3000);
        return;
      }
      if(toggle_sound){
        document.getElementById('captcha_audio').play();
      }
      new Notification("You need to solve a Captcha!");
      alert("Set pixel yourself and solve Captcha!");
      if(toggle_sound){
        document.getElementById('captcha_audio').pause();
        document.getElementById('captcha_audio').currentTime = 0;
      }
      cooldown = 20000;
      waiting(cooldown);
      timestampp = Date.now();
      setStatus("Captcha occured...");
      setStatusColor("rgba(100, 10, 0, 0.75)");
      return;
    } else if(fetchstat == 200){
      pixel_count += 1;
      updatePixelCount();
    } else if(fetchstat == 400){
      setStatus("Waiting for cooldown...");
      setStatusColor("rgba(0, 100, 0, 0.75)");
      cnt400 += 1;
      if(cnt400 == 3){
        console.log("[PixelBot] Cooldown was running in the last 3 tries. Reloading Page...");
        window.location.reload(false);
      }
    } else if(fetchstat >= 401){
      console.log("[PixelBot] Setting Pixel didn't work, trying again in 10s.");
      cnt403 += 1;
      if(cnt403 == 3){
        console.log("[PixelBot] Last 3 tries failed. Reloading Page...");
        window.location.reload(false);
      }
      cooldown = 15000;
      setStatus("Failed, try again in 15s.");
      setStatusColor("rgba(100, 10, 0, 0.75)");
      waiting(cooldown);
      timestampp = Date.now();
      return;
    }
    if(Number.isFinite(fetchval.waitSeconds)){
      cnt403 = 0;
      cnt400 = 0;
      //cooldown = fetchval.waitSeconds * 1000 + Math.floor(Math.random() * 101 + 20);
      cooldown = Math.max(fetchval.waitSeconds * 1000 - 1500, 500);
      console.log("[PixelBot] Setting next pixel in " + cooldown + " milliseconds.");
      waiting(cooldown);
      timestampp = Date.now();
    }
  }
}


//Set Pixel
function setPixel(template = "")
{
  if(template == "")
    template = first_template;
  if (bot_active == 0){
    return;
  }
  setStatus("Setting pixel...");
  setStatusColor("rgba(100, 100, 0, 0.75)");
  var imurl = 'http://mlpixel.org/getpixel.php?name=' + template;
  if (location.protocol == 'https:'){
    //HTTPS is currently not supported by mlpixel.org
    window.location.href = "http://pixelcanvas.io";
    //imurl = 'https://mlpixel.org/getpixel.php?name=' + template;
  }
  getJSON(imurl,
  function(err, data) {
    if (err != null) {
      console.log('[PixelBot] Something went wrong: ' + err + ' trying again in 20s.');
      if(err == 404)
        setStatus("Template not available, trying again in 20s");
      else
        setStatus("Failed, try again in 20s.");
      setStatusColor("rgba(100, 10, 0, 0.75)");
      cooldown = 20000;
      waiting(cooldown);
      timestampp = Date.now();
    } else {
      //check for message from server
      if (data.message != null){
        console.log("[PixelBot] Got message from Server");
        if (data.place_pixel == 0)
          setStatus(data.message);
        else
          document.getElementById("srv_message").innerHTML = data.message;
        setStatusColor("rgba(20, 20, 150, 0.75)");
      } else {
          document.getElementById("srv_message").innerHTML = "";
      }
      //set pixel
      if (data.place_pixel == 1){
        console.log("[PixelBot] Setting Pixel: x: " + data.x + " y: " + data.y + " colour: " + data.clr);
        document.getElementById("last_pixel").innerHTML = "(x: " + data.x + ", y: " + data.y + ", clr: " + data.clr + ")";
        window.eval('fetchstat = 0;');
        var a = data.x + data.y + 8;
        window.eval('fetch("api/pixel", {method: "POST",headers: {"Content-Type": "application/json"},body: JSON.stringify({ x: ' + data.x + ', y: ' + data.y + ', color: ' + data.clr + ', fingerprint: "' + FP + '", token : null' + ', a: ' + a + ' })}).then(function(res){fetchstat = res.status;return res;}).then(function(res){return res.json();}).then(function(json){fetchval = json;});');
        //wait for answer and check if successful
        window.setTimeout(retPixel,1000);
      } else if (data.complete == 1 && template == first_template){
        console.log("First template finished, switching to second one.");
        setPixel(second_template);
      } else {
        cooldown = 20000;
        waiting(cooldown);
        timestampp = Date.now();
      }
    }
  });
}
