'use strict';
const async = require('async');
async function initialize(){
    const puppeteer =  require('puppeteer');
    const browser = await puppeteer.launch({headless:false});
    return browser;
}
async function extractData(browser){
    const initialUrl = "https://www.airbnb.com/rooms/21462489?adults=1&category_tag=Tag%3A8678&children=0&enable_m3_private_room=true&infants=0&pets=0&photo_id=620211456&check_in=2024-01-08&check_out=2024-01-13&source_impression_id=p3_1701745677_sBspff%2BWZAHaD9ty&previous_page_section_name=1000&federated_search_id=68c77021-79f7-4745-a99d-bb921a14d9e6";
    getNecessaryInfo(browser,initialUrl);
    return;
}
async function getNecessaryInfo(browser,url){
    const cheerio = require('cheerio');
    const page = await browser.newPage();
    await page.goto(url,{ waitUntil: ['domcontentloaded','networkidle2'],});
    const bodyEle = await page.waitForSelector('._siy8gh');
    await bodyEle.click(); 
    let html = await page.content();
    let $ = await cheerio.load(html);
    getAvailableDates(html,$);
}
function getAvailableDates(html,$){
    const dateList = [];
    let availableDates = $('._2hyui6e').find('table').find('td[role="button"]').get();
    availableDates.forEach(
        (day)=>{
           if(Object.keys(day).length!=0){dateList.push(day.attribs['aria-label']);}
           dateList.push(day.attribs['aria-label']);
    });
    const cleanedDates = availableDates.filter((ele)=>Object.keys(ele.attribs).length!=0);
    cleanedDates.forEach((ele)=>{
        console.log(ele.attribs['aria-label']);
    })
}
(async()=>{
    const browser = await initialize();
    extractData(browser);
})();
