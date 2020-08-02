"use strict";

// Imports dependencies
const request = require("request");
const WIT_ACCESS_TOKEN = process.env.WIT_ACCESS_TOKEN || "OCW5DRPHNTV7MAFGE3G5D4GTFHQRPIGF";

module.exports = class WitAiApi {
    static firstTrait(nlp, name) {
      return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
    }

    static callIntentAPI(query, sender_psid, callback) {
      // Send the HTTP request to the Messenger Platform
        console.log(query);
      request({
        "uri": "https://api.wit.ai/message",
        "qs": { "v": "20200801","q": query},
        "auth": {'bearer': WIT_ACCESS_TOKEN},
        "method": "GET"
      }, (err, res, body) => {
        if (!err) {
          console.log(res.body);
          const info = JSON.parse(res.body);
          const intent = info.intents.sort(function(a, b){return b.confidence-a.confidence})[0];
          if(intent)
              callback(sender_psid, intent.name);
          else
              callback(sender_psid, query);
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    }
};
