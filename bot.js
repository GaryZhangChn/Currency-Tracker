const https = require('https'); //for external APIs
const redis = require("redis");   //for database
const client = redis.createClient(
     {host: 'redis-19923.c258.us-east-1-4.ec2.cloud.redislabs.com',
      port: '19923',
      password: 'Ew8HJpXoY1JwfWJyQPJalqRGEvgzI6Om'
     }
  );
function reqPrice(symbol)
{
     var options = 
  {
     port: '443',
     method: 'GET',
     hostname: "api.binance.com",
     path: "/api/v3/ticker/price?symbol="+symbol
  };
  return new Promise(function(resolve) {
    callback1 = function(response)
    {
      var str = ''; 
      response.on('data', (chunk) => {
          str += chunk;
          });
      response.on('end', function () { 
        const jsondata=JSON.parse(str);
        resolve(jsondata);
      });
    };
    https.request(options,callback1).end();
  });
}
function req24hr(symbol)
{
     var options = 
  {
     port: '443',
     method: 'GET',
     hostname: "api.binance.com",
     path: "/api/v3/ticker/24hr?symbol="+symbol
  };
  return new Promise(function(resolve) {
    callback1 = function(response)
    {
      var str = ""; 
      response.on('data', function(chunk) { str += chunk; });
      response.on('end', function () { 
        const jsondata=JSON.parse(str);
        resolve(jsondata);
      });
    };
    https.request(options,callback1).end();
  });
}
function reqBid(symbol)
{
     var options = 
  {
     port: '443',
     method: 'GET',
     hostname: "api.binance.com",
     path: "/api/v3/ticker/bookTicker?symbol="+symbol
  };
  return new Promise(function(resolve) {
    callback1 = function(response)
    {
      var str = ""; 
      response.on('data', function(chunk) { str += chunk; });
      response.on('end', function () { 
        jsondata = JSON.parse(str);
        resolve(jsondata);
      });
    };
    https.request(options,callback1).end();
  });
}
function reqAvg(symbol)
{
     var options = 
  {
     port: '443',
     method: 'GET',
     hostname: "api.binance.com",
     path: "/api/v3/avgPrice?symbol="+symbol
  };
  return new Promise(function(resolve) {
    callback1 = function(response)
    {
      var str = ""; 
      response.on('data', function(chunk) { str += chunk; });
      response.on('end', function () { 
        resolve(str);
      });
    };
    https.request(options,callback1).end();
  });
}

function reqRedisSetList(username, notes){

               return new Promise(function(resolve) {
               function callback(err, reply)
               {
                   console.log(reply);
                   resolve(reply);
               }
               client.lpush(username, notes, callback);  
                });
            }
exports.handler = async function(context, event, callback) {
	let twiml = new Twilio.twiml.MessagingResponse();
	const command = event.Body.split(" ");
	switch(command[0]) {
	    case "Price":
	        resMessage = await reqPrice(command[1]);
	        twiml.message("the market price for "+command[1]+" is: " + 
	        "\n\n" + JSON.stringify(resMessage.price));
	        break;
        case "24hrs":
            resMessage = await req24hr(command[1]);
            twiml.message("The past 24-hour for "+command[1]+" stat: " + 
            "\n Price changed:\n" + resMessage.priceChange + "("+resMessage.priceChangePercent+"%)"+
            "\n Weighted Average Price: "+ resMessage.weightedAvgPrice +
            "\n Previous Close Price: "+ resMessage.prevClosePrice +
            "\n Last Qty: "+ resMessage.lastQty +
            "\n Last Price: "+ resMessage.lastPrice +
            "\n Open Price: "+ resMessage.openPrice +
            "\n Highest Price: "+ resMessage.highPrice +
            "\n Lowest Price: "+ resMessage.lowPrice +
            "\n Trade Count: "+ resMessage.count);
            break;
        case "Bid":
            resMessage = await reqBid(command[1]);
            twiml.message("the market prices are: " + 
            "\nBid Price: " + resMessage.bidPrice +
            "\nBid Quantity: " + resMessage.bidQty +
            "\nAsk Price: " + resMessage.askPrice + 
            "\nAsk Quantity: " + resMessage.askQty);
            break;
        case "Avg":
            resMessage = await reqAvg(command[1]);
            twiml.message("the market prices are: " + "\n\n" + resMessage);
            break;
        case "Symbol":
            twiml.message(
            "------Sample Symbols------ " + 
            "\n" + "ETHBTC: Etherum to Bitcoin"+
            "\n" + "ETHUSDT: Etherum to Tether USDT"+
            "\n" + "ETHEUR: Etherum to Euro"+
            "\n" + "ETHAUD: Etherum to Australian Dallar"+
            "\n" + "ETHGBP: Etherum to British Pound"+
            "\n" + "DOGEBTC: Dogecoin to Bitcoin"+
            "\n" + "DOGEUSDT: Dogecoin to Tether USDT"+
            "\n" + "DOGEEUR: Dogecoin to Euro"+
            "\n" + "DOGEGBP: Dogecoin to British Pound"+
            "\n" + "DOGEAUD: Dogecoin to Australian Dallar"+
            "\n" + "BTCUSDT: Bitcoin to Tether USDT"+
            "\n" + "BTCGBP: Bitcoin to British Pound"+
            "\n" + "BTCAUD: Bitcoin to to Australian Dallar"+
            "\n" + "LTCBTC: Litecoin to Bitcoin"+
            "\n" + "LTCETH: Litecoin to to Etherum"+
            "\n" + "LTCUSDT: Litecoin to Tether USDT"+
            "\n" + "LTCEUR: Litecoin to Euro"+
            "\n" + "FILBTC: Filecoin to Bitcoin"+
            "\n" + "FILUSDT: Filecoin to Tether USDT"+
            "\n" + "FILBNB: Filecoin to Binance Coin"
                );
            break;
        case "Viewlog":
           function reqRedisGetList(username){
               return new Promise(function(resolve) {
               function callback3(err, reply)
               {
                   console.log(err);
                   resolve("\nerror: "+ err + "\n" +reply);
               }
            //   var getAll = '';
            //   getAll= username + ' 0 -1';
               client.lrange(username, 0, -1, callback3);  
                });
            }
            resMessage = await reqRedisGetList(command[1]);
            twiml.message(resMessage);
            break;
        case "Log":
            var noteStr = '';
            if (command[4]) {
                noteStr = command[2] + ' ' + command[3] + ' at price: ' + command[4];
                resMessage = await reqRedisSetList(command[1], noteStr);
                twiml.message(resMessage);
              }
              else {
                  rate = await reqPrice(command[2]);
                  noteStr = rate.symbol + ' ' + command[3] + ' at price: ' + rate.price;
                  resMessage = await reqRedisSetList(command[1], noteStr);
                  twiml.message(resMessage);
              }
            break;
        default:
            twiml.message(
                "\nWelcome to the Binance API bot! " + 
                "\nBelow commands are case-sensitive, use (variable) and [optional]"+
                "\n\n" + "to return the latest price for the entered two currency: "+
                "\n" + "type: Price (symbol) "+
                "\n\n" + "to return the past 24-hour ticker price change statistics: "+
                "\n" + "type: 24hrs (symbol) "+
                "\n\n" + "to return the current bid (price & quantity): "+
                "\n" + "type: Bid (symbol) "+
                "\n\n" + "to return the average traded price: "+
                "\n" + "type: Avg (symbol) "+
                "\n\n" + "to initialize your log account: "+
                "\n" + "type: Viewlog init (your name) [position holding] "+
                "\n\n" + "to log your trading note: "+
                "\n" + "type: Log (your name) (symbol) (quantity) [price] "+
                "\n\n" + "to see all the symbols "+
                "\n" + "type: Symbol "
                );
	}

	callback(null, twiml);
};