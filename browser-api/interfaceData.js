async function getFrame(browser) {
    let targets = await browser.targets()
    let page
    let title

    for (const t of targets) {
        const p = await t.page()
        if (p == null) continue
        title = await p.title()
        if (title.includes('Live Casino')) {
            page = p
            break
        }
    }
    const frameHandle = await page.$('iframe')
    if (frameHandle == null) throw "Iframe not found !"
    const frame = await frameHandle.contentFrame()
    return frame
}

async function getInterfaceData(frame) {
    if (frame) {
        const result = await Promise.all([
            frame.title(),
            getBalance(frame),
            getStatusGame(frame),
            getTotalBetted(frame),
            getLastDigit(frame)
        ])

        return {
            title: result[0],
            wallet: result[1],
            gameStatus: result[2],
            totalBetted: result[3],
            lastDigit: result[4],
        }
    } else {
        console.log('no frame')
    }
}

async function getBalance(frame) {
    const balance = await frame.$eval("span[data-role=balance-label__value]", el => el.innerText)
    return Number(balance.replace(',', '.'))
}

async function getTotalBetted(frame) {
    if (frame == 'test') return 0
    const spans = await frame.$$("span[class^=title--]");

    if (spans.length == 2 && (await (await spans[1].getProperty('innerHTML')).jsonValue()) == "MISE TOTALE") {
        const betted = await frame.$eval("span[data-role=total-bet-label__value]", el => el.innerText)
        return Number(betted.replace(',', '.'))
    }
    return 0
}

async function getSelectedCoin(frame) {
    const selectedChipDiv = await frame.$("div[data-role=selected-chip]")
    const chipDataDiv = await selectedChipDiv.$("div[data-role=chip]")
    const attr = await frame.evaluate(el => el.getAttribute("data-value"), chipDataDiv);
    return Number(attr)
}

async function getLastDigit(frame) {
    await frame.waitForSelector("div[class^=recent-number]");
    const myDiv = await frame.$("div[class^=recent-number]");
    const digitDiv = await myDiv.$("div[data-role=recent-number]")
    const lastDigit = await digitDiv.$eval('span', el => el.innerText);
    return Number(lastDigit)
}

async function getLastDigits(frame) {
    await frame.waitForSelector("div[class^=recent-number]");
    const divRecentNumber = await frame.$("div[class^=recent-number]");
    const allDivs = await divRecentNumber.$$("div[data-role=recent-number]")
    let digits = []
    for (const c of allDivs) {
        const text = await c.$eval('span', el => el.innerText);
        digits.push(Number(text))
    }
    return digits
}

async function getStatusGame(frame) {
    const gameStatus = (await frame.$eval("div[data-role=chip-stack-container]", el => el.className)).includes("hidden") ? 'close' : 'open'
    return gameStatus
}

async function getBetPrice(frame) {
    const bet = await frame.$eval("span[data-role=total-bet-label__value]", el => el.innerText)
    return Number(bet)
}

module.exports = {
    getFrame,
    getBalance,
    getLastDigit,
    getLastDigits,
    getStatusGame,
    getBetPrice,
    getTotalBetted,
    getSelectedCoin,
    getInterfaceData
}