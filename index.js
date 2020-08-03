'use strict';
const {imagePath, postBackWorkflow, messageWorkflow, quickReplyWorkflow} = require("./workflow");
// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "SomeRandomString"
const request = require('request');
const GraphApi = require('./api');
const WitAiApi = require('./witai');
const Response = require('./response');

function witAiApiCallback(sender_psid, intentId) {
    let response = messageWorkflow["defaultmessage"];
    console.log(intentId);
    if(intentId in quickReplyWorkflow) {
        response = Response.genQuickReply(quickReplyWorkflow[intentId].text, quickReplyWorkflow[intentId].options);
    }
    else if(intentId in postBackWorkflow) {
        response = Response.genButtonTemplate(postBackWorkflow[intentId].text, postBackWorkflow[intentId].options);
    }
    else if(intentId in messageWorkflow) {
        response = messageWorkflow[intentId];
    }
    else if(intentId in imagePath) {
        response = Response.genSimpleImageTemplate(imagePath[intentId])
    }
    
    GraphApi.callSendAPI(sender_psid, response);
}
// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  console.log(received_message);
  const greeting = WitAiApi.firstTrait(received_message.nlp, 'wit$greetings');
  const thanks = WitAiApi.firstTrait(received_message.nlp, 'wit$thanks');
  const bye = WitAiApi.firstTrait(received_message.nlp, 'wit$bye');

  if (greeting && greeting.confidence > 0.8) {
    GraphApi.callSendAPI(sender_psid, {"text": 'Hi there! What do you want to seek?'});
  }
  else if(thanks && thanks.confidence > 0.8) {
    GraphApi.callSendAPI(sender_psid, {"text": 'You are welcome. Can I help you with anything else?'});
  }
  else if(bye && bye.confidence > 0.8) {
    GraphApi.callSendAPI(sender_psid, {"text": 'Good bye! Have a Nice day'});
  }
  // Check if the message contains text
  else if (received_message.text) {    
    // Create the payload for a basic text message
    WitAiApi.callIntentAPI(received_message.text, sender_psid, witAiApiCallback);
  }
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  witAiApiCallback(sender_psid, received_postback.payload);
}

// Handles messaging_quickreply events
function handleQuickReply(sender_psid, received_quickreply) {
  witAiApiCallback(sender_psid, received_quickreply.payload);
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
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if(webhook_event.quick_reply) {
        handleQuickReply(sender_psid, webhook_event.quick_reply);
      }
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