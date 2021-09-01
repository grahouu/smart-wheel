const puppeteer = require('puppeteer');
const { sleep } = require('../utils');
const querystring = require('querystring');

async function banzai() {
    console.log(`Get url for Banzai platform`)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.banzaislots.com/fr/game/evolution/immersive-roulette/real');
        await page.waitForSelector('.btn-secondary-dark');
        await page.evaluate(() => {
            let elements = document.getElementsByClassName('btn-secondary-dark');
            for (let element of elements)
                element.click();
        });
        await page.waitForSelector('#modalLoginUsername');
        await sleep(500);
        await page.focus('#modalLoginUsername')
        await page.type('#modalLoginUsername', 'grahou', { delay: 2 })
        await sleep(500)
        await page.focus('#modalLoginPassword')
        await page.type('#modalLoginPassword', 'BWhatever02!', { delay: 2 })
        await sleep(500);
        await (await page.$('button[type=submit]')).press('Enter')
        await page.waitForSelector('iframe[class=game-iframe]');
        await sleep(13000)
        const frameHandle = await page.$('iframe[class=game-iframe]');
        const frame = await frameHandle.contentFrame();
        const button = await frame.$("button[data-role=plus-table-button]");
        await button.click()
        await frame.waitForSelector('iframe');
        await sleep(4000)
        const gameIframe = await frame.$('iframe')
        const src = await gameIframe.getProperty('src')
        const value = await src.jsonValue()
        await browser.close();

        let params = querystring.parse(value.split('#')[1])
        const url = `https://evolution.game-program.com/frontend/evo/r2/#table_id=LightningTable01&category=roulette&game=roulette&EVOSESSIONID=${params.EVOSESSIONID}`
        console.log(url)
        return url
    } catch (error) {
        console.log(error)
        await browser.close();
    }
}

async function casinoExtra() {
    console.log(`Get url for CasinoExtra platform`)
    const wheelUrl = 'https://www.casinoextra2.com/fr/casino/suggested/lightning-roulette/'
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(wheelUrl);
        await sleep(4000)
        await page.evaluate(() => {
            let elements = document.getElementsByClassName('user-login-button');
            elements[0].click()
        });
        await sleep(3000)
        let form = await page.$('div[class="login-wrapper"]')
        let inputs = await form.$$('input')
        let submit = await form.$('button[type="submit"]')

        inputs[0].type('alexis-collin@hotmail.fr')
        await sleep(500)
        inputs[1].type('CWhatever03!')
        await sleep(500)
        submit.click()
        await sleep(3000)

        await page.goto(wheelUrl);
        await sleep(10000)
        let frameHandle = await page.$('#desktop-game');
        // console.log("FRAMEHANDLE ------------------------------------------------------------- \n", frameHandle)
        const frame = await frameHandle.contentFrame();
        // console.log("FRAME ------------------------------------------------------------- \n", frame)
        const button = await frame.$('button[data-role="lobby-button"]');
        await button.click()
        await sleep(5000)
        const gameIframe = await frame.$('#inGameLobby')
            // console.log("gameIframe ------------------------------------------------------------- \n", gameIframe)
        const src = await gameIframe.getProperty('src')
        const value = await src.jsonValue()
            // console.log(value)
        await browser.close();
        const EVOSESSIONID = value.split('EVOSESSIONID=')[1]
        const url = `https://evolution.game-program.com/frontend/evo/r2/#table_id=LightningTable01&category=roulette&game=roulette&EVOSESSIONID=${EVOSESSIONID}`
        console.log(url)
        return url
    } catch (error) {
        console.log(error)
        await browser.close();
    }
}

module.exports = {
    casinoExtra,
    banzai
}