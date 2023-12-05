'use strict';
const async = require('async');
async function initialize(){
    const puppeteer =  require('puppeteer');
    const browser = await puppeteer.launch({headless:false});
    return browser;
}
async function extractData(browser){
    const initialUrl = "https://www.airbnb.com/s/Cupertino--California--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-01-01&monthly_length=3&price_filter_input_type=0&channel=EXPLORE&query=Cupertino%2C%20CA&place_id=ChIJq3fTG1e0j4ARtHjho-E_TTk&date_picker_type=calendar&source=structured_search_input_header&search_type=autocomplete_click";
    const page = await browser.newPage();
    page.goto(initialUrl);
}
(async()=>{
    const browser = await initialize();
    extractData(browser);
})();