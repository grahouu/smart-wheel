const fs = require('fs')
const puppeteer = require('puppeteer')
const token = require('./token')
const utils = require('../utils')

async function startBrowser(state) {
    if (Date.now() > state.lastUrlDate + (20 * 60 * 1000)) {
        await saveIntmpFile('chromeUrl', undefined)
        state.chromeUrl = undefined
    }

    if (!state.lastUrl || (state.lastUrlDate && Date.now() > state.lastUrlDate + (20 * 60 * 1000))) {
        state.lastUrl = await token.casinoExtra()
        await saveIntmpFile('url', state.lastUrl)
        await saveIntmpFile('date', Date.now())
    }


    if (state.chromeUrl) {
        state.browser = await puppeteer.connect({
            browserWSEndpoint: state.chromeUrl,
            headless: false,
            defaultViewport: null,
            args: [
                '--window-size=1090,740',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--mute-audio',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
                "--window-position=0,600"
            ]
        })
        const pages = await state.browser.pages()
        for (const page of pages) {
            const title = await page.title()
            if (title.includes('Live Casino')) state.page = page
        }
    } else {
        state.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--window-size=1090,740',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--mute-audio',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
                "--window-position=0,600"
            ]
        });
        state.page = await state.browser.newPage()
        await state.page.goto(state.lastUrl)
    }

    await utils.sleep(3000)
    const frameHandle = await state.page.$('iframe')
    state.frame = frameHandle ? await frameHandle.contentFrame() : state.page
    await saveIntmpFile('chromeUrl', (await state.browser.wsEndpoint()))
    return state
}

async function saveIntmpFile(key, value) {
    console.log("saveIntmpFile", key, value)
    let tmpData = JSON.parse(fs.readFileSync('./browser-api/tmp.json'))
    tmpData[key] = value
    fs.writeFileSync('./browser-api/tmp.json', JSON.stringify(tmpData, null, 2))
}

async function closeBrowser(state) {
    if (state.browser) {
        await state.browser.close()
        state.browser = null
        state.page = null
        state.frame = null
        state.chromeUrl = null
        await saveIntmpFile('chromeUrl', undefined)
    }

    return state
}

module.exports = {
    startBrowser,
    closeBrowser
}