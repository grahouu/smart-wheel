const express = require('express')
const fs = require('fs')
const app = express()
const utils = require('../utils')
const interfaceData = require('./interfaceData')
const interfaceActions = require('./interfaceActions')
const browserManager = require('./browserManager')

//ENV
const port = 1001
let tmpData = JSON.parse(fs.readFileSync('./browser-api/tmp.json'))
let state = {
    browser: null,
    page: null,
    frame: null,
    lastUrl: tmpData.url ? tmpData.url : null,
    lastUrlDate: tmpData.date ? tmpData.date : null,
    chromeUrl: tmpData.chromeUrl ? tmpData.chromeUrl : null
}

if (process.env.ENV == 'dev') {
    process.once('SIGUSR2', function() {
        console.log('SIGUR2');
        process.kill(process.pid, 'SIGUSR2');
    });
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async(req, res, next) => {
    if (!state.browser || !state.page || !state.frame)
        await browserManager.startBrowser(state)
    next()
})

app.get('/open-browser', async(req, res) => {
    if (!state.browser || !state.page || !state.frame)
        await browserManager.startBrowser(state)

    if (state.frame) {
        return res.send((await interfaceData.getInterfaceData(state.frame)))
    } else {
        return res.send('no opened chrome')
    }
})

app.get('/close-browser', async(req, res) => {
    state = await browserManager.closeBrowser(state)
    return res.send('')
})

app.get('/interface-info', async(req, res) => {
    if (state.frame) {
        return res.send((await interfaceData.getInterfaceData(state.frame)))
    } else {
        return res.send('no opened chrome')
    }
})

app.post('/bet', async(req, res) => {
    if (state.browser && state.page && state.frame) {
        const coinDispatched = utils.dispatchBet(req.body.price)
        const typesToSpots = utils.typesToSpots[req.body.placement]

        if (!typesToSpots) return res.status(400).send("Spot type not exist")

        await interfaceActions.placeCoins(state.frame, coinDispatched, typesToSpots)
        return res.send((await interfaceData.getInterfaceData(state.frame)))
    } else {
        return res.send('no opened chrome')
    }
})

app.post('/bet/cancel', async(req, res) => {
    if (state.browser && state.page && state.frame) {
        await interfaceActions.cancelBet(state.frame)
        return res.send((await interfaceData.getInterfaceData(state.frame)))
    } else {
        return res.send('no opened chrome')
    }
})

app.get('/', async(req, res) => {
    return res.send('Hello')
})

app.listen(port, () => {
    console.log(`Browser-api started, listening at http://localhost:${port}`)
})