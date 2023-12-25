'use strict';
/*
    Scraping airbnb data to create raw data
*/
const async = require('async');
async function initialize(){
    const puppeteer =  require('puppeteer');
    const browser = await puppeteer.launch({headless:false});
    return browser;
}
async function extractData(browser){
    const initialUrl = "https://www.airbnb.com/s/Cupertino--California--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-01-01&monthly_length=3&price_filter_input_type=0&channel=EXPLORE&query=Cupertino%2C%20CA&place_id=ChIJq3fTG1e0j4ARtHjho-E_TTk&date_picker_type=calendar&source=structured_search_input_header&search_type=autocomplete_click";
    const cheerio = require('cheerio');
    const url = "https://www.airbnb.com/rooms/21462489?adults=1&category_tag=Tag%3A8678&children=0&enable_m3_private_room=true&infants=0&pets=0&photo_id=620211456&check_in=2024-01-08&check_out=2024-01-13&source_impression_id=p3_1702953405_YEDcbnLJAO6J0wqT&previous_page_section_name=1000&federated_search_id=b8a01a5b-bd90-4bd2-a2e9-7059c710cfcd";
    const url2 = "https://www.airbnb.com/rooms/629906090926698015?adults=1&category_tag=Tag%3A8678&enable_m3_private_room=true&photo_id=1403690596&check_in=2023-12-20&source_impression_id=p3_1702953405_KpYbpAlGlu6v7yrl&previous_page_section_name=1000&federated_search_id=b8a01a5b-bd90-4bd2-a2e9-7059c710cfcd&guests=1";
    const url3 = "https://www.airbnb.com/rooms/43317241?adults=1&children=0&enable_m3_private_room=true&infants=0&pets=0&check_in=2024-01-15&check_out=2024-01-20&source_impression_id=p3_1702953405_1FcmuSzQ46dfyoOm&previous_page_section_name=1000&federated_search_id=b8a01a5b-bd90-4bd2-a2e9-7059c710cfcd";
    const page = await browser.newPage();
   // getNecessaryInfo(page,url,cheerio);
    //return;
    await page.goto(initialUrl, {waitUntil: ['domcontentloaded','networkidle2']});
    let html;
    let $;
    const links = [];
    const dataArray = [];
    let rawLinks = ""; 
    let nextButton = "";
    let nextButtonLink = "";
    let lastLink;
    let lLink = "";
    let tArr = [];
    //while(lastLink!=nextButtonLink){
        lastLink = nextButtonLink;
        html = await page.content();
        $ = await cheerio.load(html);
        rawLinks = $('div[class="df8mizf atm_5sauks_glywfm dir dir-ltr"]').find('div[data-testid="card-container"]').find('a[aria-hidden="true"]').get();
        nextButton= $('a[aria-label="Next"]').get();
        rawLinks.forEach((link)=>{
            if(Object.keys(link).length!=0){
                if(lLink!=link.attribs['href']){
                    lLink = link.attribs['href'];
                    links.push("https://www.airbnb.com/"+link.attribs['href']);
                }
            }
        });
        nextButton.forEach((link)=>{
            if(Object.keys(link).length!=0){
                nextButtonLink = "https://www.airbnb.com/"+link.attribs['href'];
               
            } 
        });
        await page.goto(nextButtonLink, {waitUntil: ['domcontentloaded','networkidle2']});
    //}
   for(const link of links){
       tArr = await getNecessaryInfo(page,link,cheerio);
       console.log(link);
       console.log(tArr);
       await dataArray.push(tArr);
    }
    console.log(dataArray);
    //getNecessaryInfo(browser,initialUrl,$,cheerio);
    return;
}
async function getNecessaryInfo(page,url,cheerio){
    const arr = [];
    await page.goto(url,{ waitUntil: ['domcontentloaded','networkidle2']});
    const bodyEle = await page.waitForSelector('._siy8gh');
    await bodyEle.click(); 
    let html = await page.content();
    const $ = await cheerio.load(html);
    await getData(arr, $);
    //getAvailableDates(html,$);
    return arr;
}
function getData(arr,$){
    const regPrice = /(\$.*?\s)/;
    const regReview = /\d*/i;
    const numStar =  $('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[data-testid="pdp-reviews-highlight-banner-host-rating"]').find('div[aria-hidden="true"]').text()!=""?$('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[data-testid="pdp-reviews-highlight-banner-host-rating"]').find('div[aria-hidden="true"]').text():$('div[data-plugin-in-point-id="OVERVIEW_DEFAULT_V2"]').find('div[class="r1lutz1s atm_c8_o7aogt atm_c8_l52nlx__oggzyc dir dir-ltr"]').text();
    const numReviews =  $('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[class="r16onr0j atm_c8_exq1xd atm_g3_1pezo5y atm_fr_7aerd4 atm_gq_myb0kj atm_vv_qvpr2i atm_c8_8nb4eg__14195v1 atm_g3_1dpnnv7__14195v1 atm_fr_11dsdeo__14195v1 atm_gq_idpfg4__14195v1 dir dir-ltr"]').text()!=""?$('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[class="r16onr0j atm_c8_exq1xd atm_g3_1pezo5y atm_fr_7aerd4 atm_gq_myb0kj atm_vv_qvpr2i atm_c8_8nb4eg__14195v1 atm_g3_1dpnnv7__14195v1 atm_fr_11dsdeo__14195v1 atm_gq_idpfg4__14195v1 dir dir-ltr"]').text():regReview.exec($('div[class="rk4wssy atm_c8_fkimz8 atm_g3_11yl58k atm_fr_4ym3tx atm_cs_qo5vgd atm_h3_ftgil2 atm_9s_1txwivl atm_h_1h6ojuz atm_cx_1y44olf atm_c8_8ycq01__oggzyc atm_g3_adnk3f__oggzyc atm_fr_rvubnj__oggzyc dir dir-ltr"]').find('a').text())[0];
    let price = regPrice.exec($('div[data-testid="book-it-default"]').find('span[class="_tyxjp1"]').text())??regPrice.exec($('div[data-testid="book-it-default"]').find('span[class="_1y74zjx"]').text());
    if(price.length!=0)price = price[1];
    arr.push(price);
    arr.push(numStar);
    arr.push(numReviews);
    //return [price,numStar,numReviews];

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
function getLastLink($){
    const lastLink = $('nav[aria-label="Search results pagination"]').find('a').get();
    const lLink = lastLink[lastLink.length-2].attribs["href"];
    return lLink;
}
(async()=>{
    const browser = await initialize();
    extractData(browser);
})();
