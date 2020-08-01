'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "SomeRandomString"
const request = require('request');
const GraphApi = require('./api');
const WitAiApi = require('./witai');
const Response = require('./response');
const imageBasePath = "https://github.com/ksholla20/bankTutor-messenger-webhook/blob/master/assets"
const imagePath = {
    "AccountOpenChecking": `CreateAccount.jpg`,
    "AccountOpenSavings": `CreateAccount.jpg`,
    "TransferMoney": `TransferMoney.png`,
    "GrantLoan": `GrantLoan.png`,
};

function witAiApiCallback(sender_psid, intentId) {
    let response = {
      "text": "Don't know what it means"
    }
    let filedata = null;
    switch(intentId) {
        case "AccountOpenChecking": response = Response.genSimpleImageTemplate(); filedata = `@/assets/${imagePath[intentId]};type=image/jpeg`; break;
        case "AccountOpenSavings": response = Response.genSimpleImageTemplate(); filedata = `@/assets/${imagePath[intentId]};type=image/jpeg`; break;
        case "TransferMoney": response = Response.genSimpleImageTemplate(); filedata = `@/assets/${imagePath[intentId]};type=image/png`; break;
        case "GrantLoan": response = Response.genSimpleImageTemplate(); filedata = `@/assets/${imagePath[intentId]};type=image/png`; break;
        case "AccountOpen": response = Response.genButtonTemplate("Which kind of account do you want to open?",
            [
              {
                "type": "postback",
                "title": "Savings",
                "payload": "savingsopen",
              },
              {
                "type": "postback",
                "title": "Checking",
                "payload": "checkingopen",
              }
            ]
        ); break;
    }
    
    GraphApi.callSendAPI(sender_psid, response, filedata);
    if(intentId !== "AccountOpen") {
        GraphApi.callSendAPI(sender_psid, Response.genWebUrlButton("Click Here To Open", `${imageBasePath}/${imagePath[intentId]}`));
    }
}
// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  console.log(received_message);
  const greeting = WitAiApi.firstTrait(received_message.nlp, 'wit$greetings');
  if (greeting && greeting.confidence > 0.8) {
    GraphApi.callSendAPI(sender_psid, {"text": 'Hi there!'});
  }
  // Check if the message contains text
  else if (received_message.text) {    
    // Create the payload for a basic text message
    WitAiApi.callIntentAPI(received_message.text, sender_psid, witAiApiCallback);
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
      response = Response.genGenericTemplate(attachment_url, "Is this the right picture?", "Tap a button to answer.",[
          {
              "type": "postback",
              "title": "Yes!",
              "payload": "yes",
          },
          {
              "type": "postback",
              "title": "No!",
              "payload": "no",
          }
      ]);
    GraphApi.callSendAPI(sender_psid, response);
  } 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch(payload) {
      case "yes": response = { "text": "Thanks!" }; break;
      case "no": response = { "text": "Oops, try sending another image." }; break;
      case "savingsopen": witAiApiCallback(sender_psid, "AccountOpenSavings"); return;
      case "checkingopen": witAiApiCallback(sender_psid, "AccountOpenChecking"); return;
  }
  // Send the message to acknowledge the postback
  GraphApi.callSendAPI(sender_psid, response);
}


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      //console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.get('/test', (req, res) => {

  // Your verify token. Should be a random string.
    
  // Parse the query params
  let q = req.query['q'];
    WitAiApi.callIntentAPI(q);
});