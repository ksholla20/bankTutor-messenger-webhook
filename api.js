"use strict";

// Imports dependencies
const request = require("request");
      
module.exports = class GraphApi {
    static callSendAPI(sender_psid, response, filedata) {
      // Construct the message body
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      }
      if(filedata){
          request_body["filedata"] = filedata;
      }

      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent!')
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    }
};
