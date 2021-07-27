const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const tesseract = require('tesseract.js');
const querystring = require('querystring');
const request = require('request');
const path = require('path');
const fs = require("fs");

var code = "";
var good_code = 0;
var bad_code = 0;
var _THREAD = 5
var start_time = Date.now()
var captchat = true;
var headless_mode = true;
var confirm_final_with_ip = false;
var time_sleep_hours = 0;
var sleep = false;
var email = "";
var password = "";

async function add_code(text){
  const path = './good_code.txt'
  try {
    if (!fs.existsSync(path)) {
    fs.createWriteStream(path);
    }
    fs.appendFile(path, text + '\n',function(err){
      if(err) throw err;
      console.log('IS WRITTEN')
      });
  } catch(err) {
    console.error(err)
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function generate_code(){
  var final_code = "";
  var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var number = "0123456789";
  var tiny = "abcdefghijklmnopqrstuvwxyz";
  var choice_1 = ["4", "5"];
  var choice_2 = ["1", "2"];
  var uppercase_number = choice_1[getRandomInt(2)];
  var number_number = choice_2[getRandomInt(2)]
  var tiny_number = 10 - (parseInt(uppercase_number) + parseInt(number_number))
  var num_number = 0
  var num_uppercase = 0
  var num_tiny = 0
  function add_uppercase(){
      // if(num_uppercase < parseInt(uppercase_number)){
        if(num_uppercase < parseInt(uppercase_number) && getRandomInt(2) == 1){
          final_code = final_code + uppercase[getRandomInt(26)];
          num_uppercase = num_uppercase + 1
      }
  }
  function add_number(){
        if(num_number < parseInt(number_number) && getRandomInt(3) == 1){
        if(parseInt(number_number) == 1){
          final_code = final_code + number[getRandomInt(10)];
          num_number = num_number + 1;
        }else{
          if(parseInt(number_number) == 2){
              final_code = final_code + number[getRandomInt(10)];
              num_number = num_number + 1;
          }
        }
  }
  }
  function add_tiny(){
      if(num_tiny < tiny_number){
      final_code = final_code +  tiny[getRandomInt(10)];
      num_tiny = num_tiny + 1
      }
  }
  while (final_code.length != 10){
      var func = [add_uppercase(), add_number(), add_tiny()]
      func[getRandomInt(3)] 
  }
  return final_code;
}

var bcolors = {
  HEADER : '\033[95m',
  OKBLUE : '\033[94m',
  OKGREEN : '\033[92m',
  WARNING : '\033[93m',
  FAIL : '\033[91m',
  ENDC : '\033[0m',
  BOLD : '\033[1m',
  UNDERLINE : '\033[4m',
}  

function getRuntime(){
  var milliseconds = Date.now() - start_time
  var day = `0${new Date(milliseconds).getDate() - 1}`.slice(-2);
  var hours = `0${new Date(milliseconds).getHours() - 1}`.slice(-2);
  var minutes = `0${new Date(milliseconds).getMinutes()}`.slice(-2);
  var seconds = `0${new Date(milliseconds).getSeconds()}`.slice(-2);
  if(day == '-1' || day == '0-1'){
      day = "00";
  }
  if(hours == '-1' || hours == '0-1'){
      hours = '00'
  }
  if(24 - time_sleep_hours != 24 && time_sleep_hours < 24){
    if(hours == `0${(24 - time_sleep_hours).toString()}`.slice(-2)){
      sleep = true;
    }

    if(hours == (23).toString() && minutes == (59).toString() && seconds == (59).toString()){
      sleep = false;
    }
  }

  return`${day}:${hours}:${minutes}:${seconds}`
  }

  
(async () => {
  const browser = await puppeteer.launch({
    args: [
      '--user-agent=' + randomUseragent.getRandom(),
      "--enable-features=NetworkService", "--no-sandbox",
      // '--proxy-server=socks5://p.webshare.io:9999'
    ],
    headless: headless_mode,

  });
  const page = await browser.newPage();
  await page.goto('https://www.jeu.princedelu.fr/index.php?authMode=login');
  var result = connection(page);
  await result.then(async function(reponse) {
    if(reponse.error == true){
      if(reponse.alert == true){
        console.log(reponse)
      }else{
        if(reponse.email_err != ' '){
          console.log(reponse.email_err)
        }
        if(reponse.password_err != ' '){
          console.log(reponse.password_err)
        }
      }
      await page.close();
      await browser.close();
    }else{
      if(reponse.error == false){
        console.log(bcolors.OKGREEN + "Connection successful" + bcolors.ENDC);
      }
    }
  })
  try{
    await page.goto('https://www.jeu.princedelu.fr/saisie-code-unique.php');
  }catch{}
  const elements = await page.$('.bloc-code')
  if (!fs.existsSync("./image")) {
    try {
      await fs.mkdirSync("./image")
      }catch{}
  }
  await elements.screenshot({ path: './image/screen.png' })
  const { data: { text } } = await tesseract.recognize(
    './image/screen.png',
    'eng',
    { logger: m => console.log(m) }
  )
  console.log("\nLoading...")
  if(new Boolean(headless_mode) == false){
    code = await text.slice(2, text.length).replace("\n", "").replace(" ", "");
  }else{
    code = await text.replace("\n", "").replace(" ", "");
  }
  menu();
  for (let i = 0; i < _THREAD; i++) {
    await site_request(page,browser);
  }
})();



async function connection(page){
  let LoginData = querystring.stringify({email: email, password:password});
  let User_Agent = randomUseragent.getRandom();
  return await page.evaluate(async (LoginData, User_Agent) => {
    return fetch("https://www.jeu.princedelu.fr/functions/auth/login.php", {
      method: "POST",
      body:  LoginData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": User_Agent
      }
    }).then(reponse => reponse.json())
  },LoginData, User_Agent)
}


async function menu(){
  console.clear()
  console.log(" <---------> GENERATOR CODE MONITOR <--------->\n\n" + "       Active Threads: " + bcolors.OKGREEN + _THREAD + bcolors.ENDC + " | Bad code: " + bcolors.FAIL +bad_code + bcolors.ENDC +  "\n      Codes Found: " + bcolors.OKGREEN + good_code + bcolors.ENDC + " | Runtime: " + bcolors.OKBLUE + getRuntime() + bcolors.ENDC +"\n\n" + "   <--------------------------------------->")
  setTimeout(() => {
    if(captchat == true){
      menu();
    }
  }, 1000);
}


async function confirm_code(page){
  let User_Agent = randomUseragent.getRandom();
  return await page.evaluate(async (User_Agent) => {
    return fetch("https://www.jeu.princedelu.fr/confirmation-participation.php", {
      method: "GET",
      headers: {
        "User-Agent": User_Agent
      }
    }).then(reponse => reponse.text())
  },User_Agent)
  }

function sleep_time(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function site_request(page, browser){
while(true){
if(sleep == false){
const User_Agent = randomUseragent.getRandom()
//let postData = querystring.stringify({captcha: code, email: email, code_1: generate_code(), code_2: generate_code(), code_3: generate_code(), code_4: generate_code(), code_5: generate_code()});
let postData = querystring.stringify({captcha: code, email: email, code_1: generate_code()});
let postData_parse = querystring.parse(postData);
try {
  var reponse = await page.evaluate(async (postData, User_Agent) => {
    return fetch("https://www.jeu.princedelu.fr/functions/insert-code.php", {
      method: "POST",
      body:  postData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": User_Agent
      }
      
    }).then(reponse => reponse.json())
  },postData, User_Agent)
} catch{
  connection(page);
  site_request(page, browser)
}
if(reponse){
  if(reponse.captcha_err == ""){
  if(reponse.code_err_1 == "Bravo vous avez saisi le bon code!"){
      add_code("Code : " + postData_parse.code_1 + ", Reponse : " + JSON.stringify(reponse))
      good_code ++
      if(new Boolean(confirm_final_with_ip) == false){
        confirm_code(page);
      }
    }else{
      bad_code ++
    }
    if(reponse.code_err_1 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas." && reponse.code_err_1 != "Bravo vous avez saisi le bon code!"){
      connection(page);
    }
    site_request(page, browser);
  }else{
    captchat = false;
    console.log("Mauvais code captcha, veuillez relancer le bot")
    await page.close();
    await browser.close();

  }
} 
}else{
  await sleep_time(1000);
}
}
}