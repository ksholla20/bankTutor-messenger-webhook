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
const imageBasePath = "https://raw.githubusercontent.com/ksholla20/bankTutor-messenger-webhook/master/assets"
const imagePath = {
    "AccountOpenChecking": `${imageBasePath}/CreateAccount.jpg`,
    "AccountOpenSavings": `${imageBasePath}/CreateAccount.jpg`,
    "TransferMoney": `${imageBasePath}/TransferMoney.png`,
    "GrantLoan": `${imageBasePath}/GrantLoan.png`,
};

const postBackWorkflow = {
    "AccountOpen": {"text": "Which kind of account do you want to open?", "options": [
        {
            "type": "postback",
            "title": "Savings",
            "payload": "AccountOpenSavings",
        },
        {
            "type": "postback",
            "title": "Checking",
            "payload": "AccountOpenChecking",
        }
    ]},
    "CertificateDeposit": {"text": "Which kind of account do you want to open?", "options": [
        {
            "type": "postback",
            "title": "Featured CD account",
            "payload": "featuredcd",
        },
        {
            "type": "postback",
            "title": "Standard Term CD account",
            "payload": "standardcd",
        }
    ]},
    "featuredcd": {"text": "Is Deposit greater than equal to $10,000", "options": [
        {
            "type": "postback",
            "title": "Yes",
            "payload": "featuredcdyes",
        },
        {
            "type": "postback",
            "title": "No",
            "payload": "featuredcdno",
        }
    ]},
    "standardcd": {"text": "Is Deposit greater than equal to $1,000", "options": [
        {
            "type": "postback",
            "title": "Yes",
            "payload": "standardcdyes",
        },
        {
            "type": "postback",
            "title": "No",
            "payload": "standardcdno",
        }
    ]},
    "featuredcdyes": {"text": "What is the term?", "options": [
        {
            "type": "postback",
            "title": "1 - 11 months",
            "payload": "featuredcdyes11",
        },
        {
            "type": "postback",
            "title": "12 - 35 months",
            "payload": "featuredcdyes12",
        },
        {
            "type": "postback",
            "title": "36 months",
            "payload": "featuredcdyes36",
        },
        {
            "type": "postback",
            "title": "37 - 60 months",
            "payload": "featuredcdyes12",
        },
    ]},
    "standardcdyes": {"text": "What is the term?", "options": [
        {
            "type": "postback",
            "title": "7 months",
            "payload": "standardcd6",
        },
        {
            "type": "postback",
            "title": "10 months",
            "payload": "standardcd65",
        },
        {
            "type": "postback",
            "title": "13 months",
            "payload": "standardcd7",
        },
        {
            "type": "postback",
            "title": "25 months",
            "payload": "standardcd65",
        },
        {
            "type": "postback",
            "title": "37 months",
            "payload": "standardcd6",
        },
    ]},
    "featuredcdyes11": {"text": "Interest rate is 0.03%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "featuredcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
    "featuredcdyes12": {"text": "Interest rate is 0.035%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "featuredcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
    "featuredcdyes36": {"text": "Interest rate is 0.04%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "featuredcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcdyes6": {"text": "Interest rate is 0.06%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "standardcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcdyes65": {"text": "Interest rate is 0.065%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "standardcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcdyes7": {"text": "Interest rate is 0.07%", "options": [
        {
            "type": "postback",
            "title": "Select another term?",
            "payload": "standardcdyes",
        },
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Is it Done?",
            "payload": "cdworkflowdone",
        },
    ]},
}
const messageWorkflow = {
    "defaultmessage": {"text": "Don't know what it means"},
    "featuredcdno": {"text": "Minimum opening deposit is $10,000"},
    "standardcdno": {"text": "Minimum opening deposit is $1,000"},
    "cdworkflowdone": {"text": "Thanks, Bye"},
};

function witAiApiCallback(sender_psid, intentId) {
    let response = messageWorkflow["defaultmessage"];
    if(intentId in postBackWorkflow) {
        console.log("PostBack: " + intendId);
        response = Response.genButtonTemplate(postBackWorkflow[intentId].text, postBackWorkflow[intentId].options);
    }
    else if(intentId in messageWorkflow) {
        console.log("Message: " + intendId);
        response = messageWorkflow[intentId];
    }
    else {
        response = Response.genSimpleImageTemplate(imagePath[intentId])
    }
    
    GraphApi.callSendAPI(sender_psid, response);
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
  }
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  witAiApiCallback(sender_psid, received_postback.payload);
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