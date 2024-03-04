'use strict';
/*
    Scraping airbnb data to create raw data
*/

const async = require('async');
async function initialize(){
    const puppeteer =  require('puppeteer');
    const browser = await puppeteer.launch({});
    //const browser = await puppeteer.launch({headless:false});
    return browser;
}

async function extractData(browser){
    const initialUrl = "https://www.airbnb.com/s/Cupertino--California--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-01-01&monthly_length=3&price_filter_input_type=0&channel=EXPLORE&query=Cupertino%2C%20CA&place_id=ChIJq3fTG1e0j4ARtHjho-E_TTk&date_picker_type=calendar&source=structured_search_input_header&search_type=autocomplete_click";
    const cheerio = require('cheerio');
    //Foreign Language url
    const url = "https://www.airbnb.com/rooms/49374597?category_tag=Tag%3A8047&enable_m3_private_room=true&photo_id=1397657353&check_in=2024-02-07&check_out=2024-02-08&source_impression_id=p3_1706995450_DpmitJLeKRmhQ%2FVP&previous_page_section_name=1000&federated_search_id=b7b49550-c147-45f4-8fee-b8ed8eb6e12b";
    const url3 = "https://www.airbnb.com/rooms/43317241?adults=1&children=0&enable_m3_private_room=true&infants=0&pets=0&source_impression_id=p3_1702953405_1FcmuSzQ46dfyoOm&previous_page_section_name=1000&federated_search_id=b8a01a5b-bd90-4bd2-a2e9-7059c710cfcd";
    const links = [];
    const columns = ['RoomID','PropertyName','HostName','HostId','Price','Star','ReviewNumber','AvailableDates','Amenities','timeStamp']
    const dataArray = [];
    const dateFunction = ()=>{
        const date = new Date();
        const year = date.getFullYear();
        const day = date.getDay()<10?"0"+(date.getDay()+1):date.getDay()+1;
        //add 0 for the single digit month
        const month = date.getMonth()<10?"0"+(date.getMonth()+1):date.getMonth()+1;
        return year+"-"+month+"-"+day;
    }
    const today = dateFunction();
    let tArr = [];
    dataArray.push(columns);
    const page = await browser.newPage();
    await page.goto(initialUrl, {waitUntil: ['domcontentloaded','networkidle2']});

   await getLinks(links,page,cheerio);
   for(const link of links){
       tArr = await getNecessaryInfo(page,link,cheerio);
       await tArr.push(today);
       await dataArray.push(tArr);
    }
    return dataArray;
}
function exportAsCsv(dataArray){
    const fs = require("fs");
    let str = "";
    dataArray.forEach((arr)=>{
        arr.forEach((field)=>{
            if(typeof filed==="object"){
                str+"["+field+"],";
            }
            str = str+field+",";
        })
        str = str.substring(0,str.length-1);
        str = str+"\n";
    })
    fs.writeFile('airbnb.csv',str,function(err, file){
        if(err)throw err;
        console.log('File Saved');
    });
}
const getLinks = async function(links, page, cheerio) {
    let nextButtonLink = "";
    //while (true) {
        const html = await page.content();
        const $ = cheerio.load(html);
        const rawLinks = $('div[class="df8mizf atm_5sauks_glywfm dir dir-ltr"]').find('div[data-testid="card-container"]').find('a[aria-hidden="true"]').get();
        const nextButton = $('a[aria-label="Next"]').get();
        rawLinks.forEach((link) => {
            if (Object.keys(link).length !== 0) {
                const href = "https://www.airbnb.com/" + link.attribs['href'];
                if (!links.includes(href)) {
                    links.push(href);
                }
            }
        });

        if (nextButton.length !== 0) {
            nextButtonLink = "https://www.airbnb.com/" + nextButton[0].attribs['href'];
            await page.goto(nextButtonLink, { waitUntil: ['domcontentloaded', 'networkidle2'] });
        } else {
         // break;
        }
   // }
}
async function getNecessaryInfo(page,url,cheerio){
    const regUrlToId = /\d+/i;
    const arr = [];
    await page.goto(url,{ waitUntil: ['domcontentloaded','networkidle2']});
    //Removing translator pop up
    let html = await page.content();
    const $ = await cheerio.load(html);
    await arr.push(regUrlToId.exec(url)[0]);
    //Fields to scrape: name(WIP), price(done), review stars(done), number of reviews(done), host name, host id, host identity verification, neighborhood(low priority), neighborhood group(low priority), dates available for booking(halfway), Amenities, Safety & property, Cancellation Policy, 
    await getData(arr, $);
    await getAvailableDates($,arr);
    await getAmenities(page,cheerio,arr);
    return arr;
}
function getData(arr,$){
    const regPrice = /\$(.*?)\s/;
    const regReview = /\d*/i;
    //Fix the efficiency of the code later
    const propertyName = '"'+$('div[data-plugin-in-point-id="TITLE_DEFAULT"]').find('h1').text()+'"';
    const hostName = ($('div[class="t1pxe1a4 atm_c8_8ycq01 atm_g3_adnk3f atm_fr_rvubnj atm_cs_qo5vgd dir dir-ltr"]').text()).replace("Hosted by ","");
    const hostId = $('div[class="c1u4hpjh atm_mk_stnw88 atm_tk_idpfg4 atm_6i_idpfg4 atm_fq_idpfg4 atm_n3_idpfg4 dir dir-ltr"]').find('a').attr('href')??$('div[class="h1144bf3 atm_h0_exct8b__oggzyc dir dir-ltr"]').find('a').attr('href');
    const numStar =  $('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[data-testid="pdp-reviews-highlight-banner-host-rating"]').find('div[aria-hidden="true"]').text()!=""?$('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[data-testid="pdp-reviews-highlight-banner-host-rating"]').find('div[aria-hidden="true"]').text():$('div[data-plugin-in-point-id="OVERVIEW_DEFAULT_V2"]').find('div[class="r1lutz1s atm_c8_o7aogt atm_c8_l52nlx__oggzyc dir dir-ltr"]').text();
    const numReviews =  $('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[class="r16onr0j atm_c8_exq1xd atm_g3_1pezo5y atm_fr_7aerd4 atm_gq_myb0kj atm_vv_qvpr2i atm_c8_8nb4eg__14195v1 atm_g3_1dpnnv7__14195v1 atm_fr_11dsdeo__14195v1 atm_gq_idpfg4__14195v1 dir dir-ltr"]').text()!=""?$('div[data-plugin-in-point-id="GUEST_FAVORITE_BANNER"]').find('div[class="r16onr0j atm_c8_exq1xd atm_g3_1pezo5y atm_fr_7aerd4 atm_gq_myb0kj atm_vv_qvpr2i atm_c8_8nb4eg__14195v1 atm_g3_1dpnnv7__14195v1 atm_fr_11dsdeo__14195v1 atm_gq_idpfg4__14195v1 dir dir-ltr"]').text():regReview.exec($('div[class="rk4wssy atm_c8_fkimz8 atm_g3_11yl58k atm_fr_4ym3tx atm_cs_qo5vgd atm_h3_ftgil2 atm_9s_1txwivl atm_h_1h6ojuz atm_cx_1y44olf atm_c8_8ycq01__oggzyc atm_g3_adnk3f__oggzyc atm_fr_rvubnj__oggzyc dir dir-ltr"]').find('a').text())[0];
    let propertyPrice = regPrice.exec($('div[data-testid="book-it-default"]').find('span[class="_tyxjp1"]').text())??regPrice.exec($('div[data-testid="book-it-default"]').find('span[class="_1y74zjx"]').text());
    if(propertyPrice!=null&&propertyPrice.length!=0)propertyPrice = propertyPrice[1];
    arr.push(propertyName);
    arr.push(hostName);
    arr.push(hostId);
    arr.push(propertyPrice);
    arr.push(numStar);
    arr.push(numReviews);
}
async function getAmenities(page,cheerio,arr){

    try{
        const showAllButton = await page.waitForSelector('div[class="b9672i7 atm_h3_xvenqj atm_h3_f13iio__oggzyc dir dir-ltr"] > button');
        await showAllButton.click();
        //Making sure Amenities Banner to be Visible
        await page.waitForSelector('div[aria-label="What this place offers"]');
        const html = await page.content();
        const $ = await cheerio.load(html);
        const ameStr = "'[";
        const wholeAmenities = $('div[aria-label="What this place offers"] li');
        const ameNum = wholeAmenities.get().length;
        for(let i = 0; i < ameNum; i++){
            let amenities = wholeAmenities.find('div[class="m1ec1bsa atm_9s_1txwivl atm_ar_1bp4okc atm_fc_1h6ojuz atm_am_ggq5uc atm_vy_1osqo2v dir dir-ltr"]'+`:eq(${i})`);
            ameStr = ameStr+"*/"+amenities.text();
        }
        ameStr = ameStr+"]'"
            arr.push(ameStr);
    }
    catch(e){
        arr.push("'[]'");
    }
    return;
}
function getAvailableDates($,arr){
    let dateList = "'[";
    const monthDict = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12
    }
    const regAvailable = /(.*?)\.\s(.*?)[\.\,\s]/;
    let availableDates = $('._2hyui6e').find('table').find('td[role="button"]').get();
    const cleanedDates = availableDates.filter((ele)=>Object.keys(ele.attribs).length!=0);
    cleanedDates.forEach((ele)=>{
        let regData = regAvailable.exec(ele.attribs['aria-label']);
        let splitDate = regData[1].replace(/,/g,'').split(' ');
        let date = monthDict[splitDate[2]]+"/"+splitDate[0]+"/"+splitDate[3]
        if(regData[2]=="Available"){
            dateList = dateList+"*/"+date+"|"+"A";
        }
        else{
            dateList = dateList+"*/"+date+"|"+"U";
        }
    })
    dateList = dateList+"]'"
    arr.push(dateList);
}
async function autoScroll(page, maxScrolls){
    await page.evaluate(async (maxScrolls) => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var scrolls = 0;  // scrolls counter
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;  // increment counter

                // stop scrolling if reached the end or the maximum number of scrolls
                if(totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, maxScrolls);  // pass maxScrolls to the function
}

function getLastLink($){
    const lastLink = $('nav[aria-label="Search results pagination"]').find('a').get();
    const lLink = lastLink[lastLink.length-2].attribs["href"];
    return lLink;
}

(async()=>{
    const browser = await initialize();
    const dataArr = await extractData(browser);
    exportAsCsv(dataArr);
    await browser.close();
})();


module.exports = {
    "getLinks": getLinks,
    "initialize":initialize
};