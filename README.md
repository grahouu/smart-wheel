# SMART-WHEEL

Smart wheel is composed of 3 parts
- [Smart-api](#smart-api)
- [Browser-api](#browser-api)
- app-cli

## Install

    npm install

## Run the app

    npm run
    OR
    npm run watch 

# Smart-api
# Browser-api

This api rest allow to manage the window chrome and to do the actions on the game.


## Endpoints

`GET /open-browser` : http://localhost:1001/open-browser

    curl -i -H 'Accept: application/json' http://localhost:1001/open-browser

`GET /close-browser` : http://localhost:1001/close-browser

    curl -i -H 'Accept: application/json' http://localhost:1001/close-browser
`GET /interface-info` : http://localhost:1001/interface-info

    curl -i -H 'Accept: application/json' http://localhost:1001/interface-info

`POST /bet`
```
curl -i -H 'Accept: application/json' -d 'placement=red&price=2.5' http://localhost:1001/bet
```
### Request body :
```
{
    placement: "red",
    price: 2.5
}
```
`POST /bet/cancel`
```
curl -i -H 'Accept: application/json' -d '' http://localhost:1001/bet/cancel
```



