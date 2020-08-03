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
            "title": "Short term",
            "payload": "featuredcdshortterm",
        },
        {
            "type": "postback",
            "title": "Long term",
            "payload": "featuredcdlongterm",
        }
    ]},
    "standardcdyes": {"text": "What is the term?", "options": [
        {
            "type": "postback",
            "title": "Short term",
            "payload": "standardcdshortterm",
        },
        {
            "type": "postback",
            "title": "Long term",
            "payload": "standardcdlongterm",
        }
    ]},
    "featuredcdshortterm": {"text": "How many months?", "options": [
        {
            "type": "postback",
            "title": "1 - 11 months",
            "payload": "featuredcdyes11",
        },
        {
            "type": "postback",
            "title": "12 - 35 months",
            "payload": "featuredcdyes12",
        }
    ]},
    "featuredcdlongterm": {"text": "How many months?", "options": [
        {
            "type": "postback",
            "title": "36 months",
            "payload": "featuredcdyes36",
        },
        {
            "type": "postback",
            "title": "37 - 60 months",
            "payload": "featuredcdyes12",
        }
    ]},
    "featuredcdyes11": {"text": "Interest rate is 0.03%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
    "featuredcdyes12": {"text": "Interest rate is 0.035%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
    "featuredcdyes36": {"text": "Interest rate is 0.04%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcdshortterm": {"text": "How many months?", "options": [
        {
            "type": "postback",
            "title": "7 months",
            "payload": "standardcd6",
        },
        {
            "type": "postback",
            "title": "13 months",
            "payload": "standardcd7",
        }
    ]},
    "standardcdlongterm": {"text": "How many months?", "options": [
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
    "standardcd6": {"text": "Interest rate is 0.06%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcd65": {"text": "Interest rate is 0.065%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
    "standardcd7": {"text": "Interest rate is 0.07%", "options": [
        {
            "type": "postback",
            "title": "Select different account type?",
            "payload": "CertificateDeposit",
        },
        {
            "type": "postback",
            "title": "Thanks. I'm done",
            "payload": "cdworkflowdone",
        },
    ]},
};

const messageWorkflow = {
    "defaultmessage": {"text": "Don't know what it means"},
    "featuredcdno": {"text": "Minimum opening deposit is $10,000"},
    "standardcdno": {"text": "Minimum opening deposit is $1,000"},
    "cdworkflowdone": {"text": "Thanks, Bye"},
};

const quickReplyWorkflow = {
    "standardcdyes": {"text": "What is the term duration in months?", "options":[
        {
            "title": "7",
            "payload": "standardcd6"
        },
        {
            "title": "13",
            "payload": "standardcd7"
        },
        {
            "title": "25",
            "payload": "standardcd65"
        },
        {
            "title": "37",
            "payload": "standardcd6"
        },
    ]},
    "featuredcdyes": {"text": "What is the term duration in months?", "options":[
        {
            "title": "1-11",
            "payload": "featuredcdyes11"
        },
        {
            "title": "12-35",
            "payload": "featuredcdyes12"
        },
        {
            "title": "36",
            "payload": "featuredcdyes36"
        },
        {
            "title": "37-60",
            "payload": "featuredcdyes12"
        },
    ]},
};

exports.imagePath = imagePath;
exports.postBackWorkflow = postBackWorkflow;
exports.messageWorkflow = messageWorkflow;
exports.quickReplyWorkflow = quickReplyWorkflow;
