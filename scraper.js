'use strict';
const async = require('async');
async function initialize(){
    const puppeteer =  require('puppeteer');
    const browser = await puppeteer.launch({headless:false});
    return browser;
}
async function extractData(browser){
    const initialUrl = "https://www.airbnb.com/s/Cupertino--California--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-01-01&monthly_length=3&price_filter_input_type=0&channel=EXPLORE&query=Cupertino%2C%20CA&place_id=ChIJq3fTG1e0j4ARtHjho-E_TTk&date_picker_type=calendar&source=structured_search_input_header&search_type=autocomplete_click";
    const cheerio = require('cheerio');
    const page = await browser.newPage();
    await page.goto(initialUrl, {waitUntil: ['domcontentloaded','networkidle2']});
    let html = await page.content();
    let $ = await cheerio.load(html);
    const links = [];
    const links2 = [];
    let rawLinks = $('div[class="df8mizf atm_5sauks_glywfm dir dir-ltr"]').find('div[data-testid="card-container"]').find('a[aria-hidden="true"]').get();
    let ind = 0;
    rawLinks.forEach((link)=>{
        if(Object.keys(link).length!=0){
            ind++;
            if(ind%6==0){
                links.push(link.attribs['href']);
            }
        }
    })
    let nextButton= $('a[aria-label="Next"]').get();
    let nextButtonLink = "";
    nextButton.forEach((link)=>{
        if(Object.keys(link).length!=0){
            nextButtonLink = "https://www.airbnb.com/"+link.attribs['href'];
           
        } 
    })
    await page.goto(nextButtonLink, {waitUntil: ['domcontentloaded','networkidle2']});
    html = await page.content();
    $ = await cheerio.load(html);
    let rawLinks2 = $('div[class="df8mizf atm_5sauks_glywfm dir dir-ltr"]').find('div[data-testid="card-container"]').find('a[aria-hidden="true"]').get();
    ind = 0;
    rawLinks2.forEach((link2)=>{
        if(Object.keys(link2).length!=0){
            ind++;
            if(ind%6==0){
                links.push(link2.attribs['href']);
            }
        }
    })
    console.log(links.length);
    //getNecessaryInfo(browser,initialUrl,$,cheerio);
    return;
}
async function getNecessaryInfo(browser,url,cheerio){
    const $ = await cheerio.load(html);
    const page = await browser.newPage();
    await page.goto(url,{ waitUntil: ['domcontentloaded','networkidle2']});
    const bodyEle = await page.waitForSelector('._siy8gh');
    await bodyEle.click(); 
    let html = await page.content();
    getAvailableDates(html,$);
}
function getAvailableDates(html,$){
    const dateList = [];
    let availableDates = $('._2hyui6e').find('table').find('td[role="button"]').get();
    availableDates.forEach(
        (day)=>{
           if(Object.keys(day).length!=0){dateList.push(day.attribs['aria-label']);}
          // dateList.push(day.attribs['aria-label']);
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
