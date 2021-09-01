const utils = require('../utils');
const interfaceData = require('./interfaceData');

async function cancelBet(frame) {
    const div = await frame.$(`button[data-role="undo-button"]`);
    await div.click(options = { delay: 1800 })
}

async function clickCoin(frame, coin) {
    const coinQuery = `div[data-value='${coin}']`
    await frame.waitForSelector(coinQuery);
    const betElem = await frame.$(coinQuery);
    await clickOnElement(frame, betElem)
}

async function placeCoin(frame, coin, spot, repeat) {
    console.log('placeCoin', coin, spot, repeat)
    try {
        const totalBettedInterfaceBefore = await interfaceData.getTotalBetted(frame)
        console.log('totalBettedInterfaceBefore', totalBettedInterfaceBefore)
        await clickCoin(frame, coin)

        let totalBettedInterfaceAfter = await interfaceData.getTotalBetted(frame)
        console.log('ttotalBettedInterfaceAfter', totalBettedInterfaceAfter)

        while (totalBettedInterfaceAfter > totalBettedInterfaceBefore) {
            await interactWithElement(frame, `button[data-role="undo-button"]`, ['click'])
            await utils.sleep(600)
            totalBettedInterfaceAfter = await interfaceData.getTotalBetted(frame)
            console.log(`Click undo-button -> totalBettedInterfaceAfter: ${totalBettedInterfaceAfter}`)
        }


        const spotQuery = `[data-bet-spot-id='${spot}']`
        await frame.waitForSelector(spotQuery);
        const spotDiv = await frame.$(spotQuery);

        for (let index = 0; index < repeat; index++) {

            const selectedCoin = await interfaceData.getSelectedCoin(frame)
            if (selectedCoin != Number(coin)) {
                console.log(`reclick sur le bon coin: ${selectedCoin} to ${coin}`)
                await clickCoin(frame, coin)
            }

            const totalBettedInterfaceBase = await interfaceData.getTotalBetted(frame)
            console.log('totalBettedInterfaceBase', totalBettedInterfaceBase)

            await clickOnElement(frame, spotDiv)
            const totalExpected = utils.toNumber(totalBettedInterfaceBase + parseFloat(coin))
            await utils.sleep(600)

            let expectedBet = false
            while (expectedBet == false) {
                let newTotalBettedInterface = await interfaceData.getTotalBetted(frame)
                console.log('newTotalBettedInterface', newTotalBettedInterface)
                if (newTotalBettedInterface > totalExpected && frame != 'test') {
                    console.log(`ERROR UNDO BET -> bet: ${newTotalBettedInterface} -> expected : ${totalExpected}`)
                    await interactWithElement(frame, `button[data-role="undo-button"]`, ['click'])
                    await utils.sleep(600)
                } else {
                    expectedBet = true
                }
            }


            const bettedInterface = await interfaceData.getTotalBetted(frame)
            if (bettedInterface < totalExpected) index -= 1

        }
        console.log('')
        await utils.sleep(500)
    } catch (error) {
        console.log("ERROR", error)
    }
}

async function placeCoins(frame, coinDispatched, spotName) {
    for (const coinValue of coinDispatched) {
        if (coinValue.count != 0 && frame != 'test')
            await placeCoin(frame, coinValue.coin, spotName, coinValue.count)
    }
    await interactWithElement(frame, `div[data-role='total-bet-label']`, ['move', 'click'])
}

async function placeBet(context) {

    let placedBet = {}

    for (let index = 0; index < context.lastBets.length; index++) {
        if (context.lastBets[index].categoryType == 'double' && context.lastBets[index].status == 'pending')
            placedBet[context.lastBets[index].betType] = utils.toNumber(placedBet[context.lastBets[index].betType] ? placedBet[context.lastBets[index].betType] + context.lastBets[index].money : context.lastBets[index].money)
        if (context.lastBets[index].categoryType == 'thirds' && context.lastBets[index].status == 'pending') {
            for (const t of context.lastBets[index].betTypes) {
                placedBet[t] = utils.toNumber(placedBet[t] ? placedBet[t] + context.lastBets[index].money : context.lastBets[index].money)
            }
        }
    }

    if (context.frame && context.frame != 'test') console.log('placedBet', placedBet)

    const totalBettedInterface = await interfaceData.getTotalBetted(context.frame)
    if (totalBettedInterface != 0) await interactWithElement(context.frame, `button[data-role="undo-button"]`, ['longClick'])

    if (context.frame != 'test') {
        let totalBetted = 0
        for (const key in placedBet) {
            const coinDispatched = utils.dispatchBet(placedBet[key])
                // const nbClick = coinDispatched.reduce(((acc, value) => acc + value.count), 0)
            console.log('coinDispatched', coinDispatched)
            await placeCoins(context.frame, coinDispatched, utils.typesToSpots[key])
            context.lastMoveDate = Date.now()
            totalBetted = utils.toNumber(totalBetted + placedBet[key])
            console.log('totalBetted', totalBetted)
        }
    }
}

async function clickOnElement(frame, elem, x = null, y = null) {
    const rect = await frame.evaluate(el => {
        const { top, left, width, height } = el.getBoundingClientRect();
        return { top, left, width, height };
    }, elem);

    // Use given position or default to center
    const _x = x !== null ? x : rect.width / 2;
    const _y = y !== null ? y : rect.height / 2;


    await frame._frameManager._page.mouse.click(rect.left + _x, rect.top + _y);
}

async function interactWithElement(frame, elemQuery, kind) {
    const elem = await frame.$(elemQuery);
    const rect = await frame.evaluate(el => {
        console.log(el)
        const { top, left, width, height } = el.getBoundingClientRect();
        return { top, left, width, height };
    }, elem);

    // Use given position or default to center
    const _x = rect.width / 2;
    const _y = rect.height / 2;
    const test = await frame.mouse
    for (const k of kind) {
        if (k == 'click')
            await frame._frameManager._page.mouse.click(rect.left + _x, rect.top + _y);
        else if (k == 'move')
            await frame._frameManager._page.mouse.move(rect.left + _x, rect.top + _y);
        else if (k == 'longClick')
            await frame._frameManager._page.mouse.click(rect.left + _x, rect.top + _y, { delay: 3000 });

        await utils.sleep(50)
    }
}

module.exports = {
    placeBet,
    cancelBet,
    clickCoin,
    interactWithElement,
    clickOnElement,
    placeCoin,
    placeCoins
}