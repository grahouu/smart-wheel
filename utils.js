function sleep(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

function toNumber(digit) {
    return Number(digit.toFixed(1))
}

function dispatchBet(price) {
    c25 = Math.floor(price / 25)
    price = price - c25 * 25

    c5 = Math.floor(price / 5)
    price = Number((price - c5 * 5).toFixed(1))

    if (c5 > 0 && (price == 0.1 || price == 0.3)) {
        c5 = c5 - 1
        price = price + 5
    }

    c1 = Math.floor(price / 1)
    price = Number((price - c1 * 1).toFixed(1))

    if (c1 > 0 && (price == 0.1 || price == 0.3)) {
        c1 = c1 - 1
        price = price + 1
    }

    c05 = Math.floor(price / 0.5)
    price = Number((price - c05 * 0.5).toFixed(1))

    if (c05 > 0 && (price == 0.1 || price == 0.3)) {
        c05 = c05 - 1
        price = price + 0.5
    }

    c02 = Math.round(price / 0.2)
    price = price - c02 * 0.2

    return [
        { coin: '25', count: c25 },
        { coin: '5', count: c5 },
        { coin: '1', count: c1 },
        { coin: '0.5', count: c05 },
        { coin: '0.2', count: c02 }
    ]
}

const typesToSpots = {
    'red': 'red',
    'black': 'black',
    'bottom': 'from1to18',
    'top': 'from19to36',
    'even': 'even',
    'odd': 'odd',
    'third1': '1st12',
    'third2': '2nd12',
    'third3': '3rd12',
    'line1': 'top2to1',
    'line2': 'middle2to1',
    'line3': 'bottom2to1'
}

module.exports = {
    sleep,
    toNumber,
    dispatchBet,
    typesToSpots
}