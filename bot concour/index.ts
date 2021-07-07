
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

async function add_code(text){
  const path = './goo_code.txt'
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


//function generate_code(){
//  const list = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//  var final_code = "";
//  for (let i = 0; i < 10; i++) {
//    const element = list[getRandomInt(62)];
//    final_code = final_code + element;
//  }
//  return final_code;
//}


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
      if(num_uppercase < parseInt(uppercase_number)){
          final_code = final_code + uppercase[getRandomInt(26)];
          num_uppercase = num_uppercase + 1
      }
  }
  function add_number(){
      //if(num_number < parseInt(number_number)){
      //    final_code = final_code + number[getRandomInt(10)];
      //    num_number = num_number + 1
      //}
      if(num_number < parseInt(number_number) && getRandomInt(3) == 1){
        if(parseInt(number_number) == 1){
          final_code = final_code + number[getRandomInt(10)];
          num_number = num_number + 1;
        }else{
          if(parseInt(number_number) == 2){
              final_code = final_code + number[getRandomInt(10)] + number[getRandomInt(10)];
              num_number = num_number + 2;
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
  const day = `0${new Date(milliseconds).getDate() - 1}`.slice(-2);
  const hours = `0${new Date(milliseconds).getHours() - 1}`.slice(-2);
  const minutes = `0${new Date(milliseconds).getMinutes()}`.slice(-2);
  const seconds = `0${new Date(milliseconds).getSeconds()}`.slice(-2);
  return`${day}:${hours}:${minutes}:${seconds}`
  }

(async () => {
  const browser = await puppeteer.launch({
    args: [
      '--user-agent=' + randomUseragent.getRandom(),
      "--enable-features=NetworkService", "--no-sandbox",
      // '--proxy-server=' + proxy
    ],
    headless: headless_mode,
  });
  const page = await browser.newPage();
  await page.goto('https://www.jeu.princedelu.fr/index.php?authMode=login');
  const username_input = await page.$('#email');
  const password_input = await page.$('#pass-word');
  await username_input.type("matthisplusvite@gmail.com")
  await password_input.type("")
  await page.click("#login")
  await page.waitFor(4000);
  await page.goto('https://www.jeu.princedelu.fr/saisie-code-unique.php');
  const elements = await page.$('.bloc-code')
  if (!fs.existsSync("./image")) {
    try {
      await fs.mkdirSync("./image")
      } catch {}
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


async function menu(){
  console.clear();
  console.log(" <---------> GENERATOR CODE MONITOR <--------->\n\n" + "       Active Threads: " + bcolors.OKGREEN + _THREAD + bcolors.ENDC + " | Bad code: " + bcolors.FAIL +bad_code + bcolors.ENDC +  "\n      Codes Found: " + bcolors.OKGREEN + good_code + bcolors.ENDC + " | Runtime: " + bcolors.OKBLUE + getRuntime() + bcolors.ENDC +"\n\n" + "   <--------------------------------------->")
  setTimeout(() => {
    if(captchat == true){
      menu();
    }
  }, 1000);
}

async function site_request(page, browser){
const User_Agent = randomUseragent.getRandom()
let postData = querystring.stringify({ captcha: code, email: "MATTHISPLUSVITE@GMAIL.COM", code_1: generate_code(), code_2: generate_code(), code_3: generate_code(), code_4: generate_code(), code_5: generate_code()});
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
if(reponse){
  if(reponse.captcha_err == ""){
  if(reponse.code_err_1 == "Bravo vous avez saisi le bon code!" || reponse.code_err_1 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas."){
      add_code(postData.code_1)
      good_code ++
    }else{
      bad_code ++
    }
    if(reponse.code_err_2 == "Bravo vous avez saisi le bon code!" || reponse.code_err_2 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas."){
      add_code(postData.code_2)
      good_code ++
    }else{
      bad_code ++
    }
    if(reponse.code_err_3 == "Bravo vous avez saisi le bon code!" || reponse.code_err_3 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas."){
      add_code(postData.code_3)
      good_code ++
    }else{
      bad_code ++
    }
    if(reponse.code_err_4 == "Bravo vous avez saisi le bon code!" || reponse.code_err_4 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas."){
      add_code(postData.code_4)
      good_code ++
    }else{
      bad_code ++
    }
    if(reponse.code_err_5 == "Bravo vous avez saisi le bon code!" || reponse.code_err_5 != "Ce code est d\u00e9j\u00e0 utilis\u00e9 ou n'existe pas."){
      add_code(postData.code_5)
      good_code ++
    }else{
      bad_code ++
    }
    site_request(page, browser);
  }else{
    captchat = false;
    console.log("Mauvais code captcha, veuillez relancer le bot")
    try {
      page.close();
      browser.close();
    } catch {}

  }
}
}
