/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
const env = require('dotenv');

var inMemoryStorage = new builder.MemoryBotStorage();

// Creating the Bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
const bot = new builder.UniversalBot(
    connector,
    [
        (session) => {
            session.beginDialog('ensureProfile', session.userData.profile);
        },
        (session, results) => {
            const profile = session.userData.profile = results.response;
            session.endConversation(`Hello ${profile.name}, we are excited to work with you!`);
        }
    ]
);

// HELP Function
bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]).triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args) => {
        // Runs just before the dialog launches
        // Overrides default behaviour (of overthrowing the stack)
        session.beginDialog(args.action, args);
    }
});

bot.dialog('ensureProfile', [
    (session, args, next) => {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, `What's your name?`);
        } else {
            next();
        }
    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.company) {
            builder.Prompts.text(session, `What company do you work for?`);
        } else {
            next();
        }
    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.profile.company = results.response;
        }
        if (!session.dialogData.profile.email) {
            builder.Prompts.text(session, `What is your email?`);
        } else {
            next();
        }
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.email = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

// Initial Sales Dialog
bot.dialog('startSale', [
    (session) => {
        var projectOptions = [`Website`, `Web App`, `Mobile App`, `Database`, `Other`];

        builder.Prompts.choice(
            session,
            `Please choose an option:`,
            projectOptions,
            { listStyle: builder.ListStyle.button }
        )
    },
    (session, results) => {
        var card = new builder.HeroCard(session);

        //Show Typing
        session.sendTyping();

        card.title(results.response.entity);

        card.images([builder.CardImage.create(session, 'data:image/jpeg;base64,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')])
        
        card.subtitle('Click this card to enter your project details and get started!');

        card.tap(new builder.CardAction.openUrl(session, `https://www.xlr8dev.com`));

        var message = new builder.Message(session).attachments([card]);
        
        session.endDialog(message);
    }
]).triggerAction({
    matches: /^sale$/i,
    onSelectAction: (session, args) => {
        // Runs just before the dialog launches
        // Overrides default behaviour (of overthrowing the stack)
        session.beginDialog(args.action, args);
    }
});


// ----------------- Fundamental Functions ----------------------

// HELP Function
bot.dialog('help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]).triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args) => {
        // Runs just before the dialog launches
        // Overrides default behaviour (of overthrowing the stack)
        session.beginDialog(args.action, args);
    }
});

// Expose the Bot
const server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(
    process.env.PORT || 1234,
    () => console.log('Server Ready!')
);