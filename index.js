/* eslint-disable  func-names */
/* eslint-disable  dot-notation */
/* eslint-disable  new-cap */
/* eslint quote-props: ['error', 'consistent']*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports en-US lauguage.
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-trivia
 **/
//also references https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs
//https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/src/index.js
//https://stackoverflow.com/questions/31916488/how-to-put-an-item-in-aws-dynamodb-using-aws-lambda-with-node-js 
 //http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.WritingData
'use strict';
var AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
var sortJsonArray = require('sort-json-array');
const data = require('./data.json');
const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL)
var skillName = "Fab Assistant";

var rn = require('random-number');
var moment = require('moment');
var gen = rn.generator({
  min:  5
, max:  20
, integer: true
});
var gen100 = rn.generator({
  min:  1
, max:  100
, integer: true
});

var genAccount = rn.generator({
  min:  100000000
, max:  999999999
, integer: true
});

var genPhone = rn.generator({
  min:  1000000000
, max:  9999999999
, integer: true
});

var gen10 = rn.generator({
  min:  1
, max:  10
, integer: true
});

var allServices = ['UVerse','DirecTV','DirecTV Now','Wireless','Digital Life','Wireless Home Phone','VoIP'];

var dynamoDBConfiguration = require('./conf.json');

AWS.config.update(dynamoDBConfiguration);
//var dd = new AWS.DynamoDB();
var tableName = 'user_queue';

//var currentWait = gen();
//var slotTime = moment().add(currentWait, 'm');

var states = {
	INBOOKDIA: '_INBOOKDIA',
	BOOKMODE: '_BOOKMODE', // User is booking a slot.
    CHECKINMODE: '_CHECKINMODE', // User is asking a question.
    STARTMODE: '_STARTMODE'  // User first enters app.
};

//stateful handlers. Currently these are used for nothing. 
//I imagine they might be useful if a customer wanted to navigate deeper into detail in a dialogue
//so something like "i have questions about uverse" being caught in the main handlers, switch states to a new state handler, then have that new state handler handle a full dialog asking what kind of question they have, perchance.

//but these existing handlers are useless.. use them only as models.
//and register your new ones at the bottom.
var bookModeHandlers = Alexa.CreateStateHandler(states.BOOKMODE, {
	'NewSession': function () {
		this.handler.state = '';
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
	
	/** Name intent should look somehting like this:
	{
      "intent": "MyNameIsIntent",
      "slots":[
        {
          "name":"firstname",
          "type":"AMAZON.US_FIRST_NAME"
        }
      ]
    }
	*/
	/*'CheckinIntent' : function(){
		
		var myName = this.event.request.intent.slots.firstname.value;
		var speechText = "Thank you " + myName + ". ";
        speechText += "An employee will call your name at approximately ";
		speechText += slotTime.format('h:mm a') + ".";
		speechText += " Feel free to browse the store and check out our new iPhones while you wait."
		this.handler.state = '';
		this.emit(':tellWithCard', speechText, skillName, speechText);
	}	)*/

});

var checkinModeHandlers = Alexa.CreateStateHandler(states.CHECKINMODE, {
	'NewSession': function () {
		this.handler.state = '';
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
	//HA THESE LITERALLY DONT EXIST NOW
	'AMAZON.YesIntent': function() {
		this.handler.state = states.BOOKMODE;
        this.emit(':ask', 'What name should I use for the booking?', 'Tell me your name!');
    },
	
	//reset back to the start on No
	'AMAZON.NoIntent': function() {
        this.emit('NewSession');
    }

});

//https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html#using-ssml-in-your-response how to use SSML to be awesome
var handlers = {
	
	'NewSession': function() {
        //this.handler.state = states.STARTMODE;
        var speechText = '<audio src="https://rockmasterflex69.github.io/alexa_checkin/att_tone.mp3" />Welcome to ' + skillName + '. ';
        speechText += "You can use this for assistance like: I need help with my account. ";
        var repromptText = "For instructions on what you can say, please say help me.";
        this.emit(':ask', speechText, repromptText);
    },
	
	'HomeIntent': function() {
        //this.handler.state = states.STARTMODE;
        this.emit('AMAZON.HelpIntent');
    },

    /**"LanguageIntent": function () {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        var speechOutput = "";
        if(this.event.request.intent.slots.Language.value && this.event.request.intent.slots.Language.value.toLowerCase() == "java") {
            speechOutput = Data.java[getRandomInt(0, 2)];
        } else if(this.event.request.intent.slots.Language.value && this.event.request.intent.slots.Language.value.toLowerCase() == "ionic framework") {
            speechOutput = Data.ionic[getRandomInt(0, 3)];
        } else {
            speechOutput = "I don't have anything interesting to share regarding what you've asked."
        }
        this.emit(':tellWithCard', speechOutput, skillName, speechOutput);
    },*/

    "AboutIntent": function () {
        var speechOutput = '<say-as interpret-as="interjection">howdy</say-as>, This is the best skill ever made by Echo Fabulous. ';
		speechOutput += 'Team members:  Elissa, Rocky, Youness, Jane, Manjula, and Nelson are the coolest folks around. I know I like to talk a big game sometimes, but the truth is, I would be really sad without their efforts. <say-as interpret-as="interjection">bravo</say-as> , You should give them some money! <say-as interpret-as="interjection">kaching</say-as> ';
		speechOutput += " . Special thanks to the Flex Force Free Coffee Program, Armin Van Buuren, Stack Overflow, Git hub, and the entire Amazon Ecosystem for working so well with itself and absolutely nothing else. "
        this.emit(':tellWithCard', speechOutput, skillName, speechOutput);
    },
	
	"MoreInfoIntent": function () {
		var speechOutput = "";
		var intentSlots = this.event.request.intent.slots;
		var product = "";
		var product_phonetic = "";
		if (intentSlots.product.value){
			product = slotValue(intentSlots.product, true).toLowerCase();
			product_phonetic = intentSlots.product.value;
		}
		else if(this.attributes['product']){
			product = this.attributes['product'];
			product_phonetic = this.attributes['product_phonetic'];
		}
		else{
			this.emit('AMAZON.HelpIntent');
		}
		
		var infoData = data[product];
		speechOutput += "Additional information on: " + product_phonetic + ", from my databanks. ";
		speechOutput += infoData.more;
		
        this.emit(':tellWithCard', speechOutput, skillName, speechOutput);
    },
	
	"InfoIntent": function () {
		console.log("In InfoIntent");
		var speechOutput = "";
		var intentSlots = this.event.request.intent.slots;
		if (this.event.request.dialogState === 'STARTED' || this.event.request.dialogState !== 'COMPLETED'){
			this.emit(':delegate');
		}else{
			console.log(JSON.stringify(intentSlots.product));
			var product = slotValue(intentSlots.product, true).toLowerCase();
			//var product = intentSlots.product.value.toLowerCase();
			console.log("User mentioned Product: %s", product);
			console.log(JSON.stringify(data));
			var infoData = data[product];
			if(infoData){
				this.attributes['product'] = product;
				this.attributes['product_phonetic'] = intentSlots.product.value;
			
				speechOutput += "I found some information on: " + intentSlots.product.value + ", in my databanks. ";
				speechOutput += infoData.info;
				//maybe change state here
				speechOutput += " Would you like to know more? Say MORE INFO, Or just say HOME to go back. "
				this.emit(':ask', speechOutput, speechOutput);
			}
			else{
				//the product clearly got pulled in wrong
				this.emit('InfoIntent');
			}
		}
		
        this.emit(':tellWithCard', speechOutput, skillName, speechOutput);
    },
	
	/**"ServiceIntent": function () {
        var speechOutput = "The estimated wait time for employee assistance is ";
		speechOutput += currentWait;
		speechOutput += " minutes. ";
		speechOutput += "Would you like to reserve a slot? " 
		this.handler.state = states.CHECKINMODE;
        this.emit(':ask', speechOutput, speechOutput);
    },*/
	
	"NeedEmployeeIntent": function () {
		var jsonItem = "";
		
		console.log("in NeedEmployeeIntent");
		//enables the catch all
		
		
		if (this.event.request.dialogState === 'STARTED'){
			/*var updatedIntent = this.event.request.intent;
			if(this.attributes['product']){
				updatedIntent.slots.problem.value = 'something else';
			}*/
			this.emit(':delegate'); //updatedIntent - this didnt work and its verbatim copied code from amazon. GO FIGURE //above is where you are supposed to be able to pre-fill values and still delegate
		}else if(this.event.request.dialogState !== 'COMPLETED'){
            this.emit(':delegate');
		}else{
			
			/*if(!intentSlots.phone.value){
				var repromptSpeech = "Tell me your phone number or 0 if you don't have one";
				var slotToElicit = 'phone';
				var speechOutput = "If you have an AT&T account, It will save time if you give me a phone number linked to your account. Speak your number if you have one, or say zero if you don't. ";
				this.emit(':elicitSlot',slotToElicit, speechOutput, repromptSpeech);
			}else{
				//this.handler.state = states.INBOOKDIA;
				myPhoneNumber = intentSlots.phone.value;
			}*/
			var intentSlots = this.event.request.intent.slots;
			var myPhoneNumber = intentSlots.phone.value;
			
			var speechOutput = '<say-as interpret-as="interjection">ooh la la</say-as>, your problem: ' + intentSlots.problem.value + ', requires one of my human associates to step in. <say-as interpret-as="interjection">fancy that</say-as><break time="2s"/>';	
			
			var accountNumber = 0;
			var numLines = 0;
			var numServices = 1;
			var hasServices = "No";
			if(gen100() > 10){
				accountNumber = genAccount();
				numLines = gen10();
				numServices = Math.floor(Math.random() * allServices.length)+1;
				hasServices = allServices.sort(() => .5 - Math.random()).slice(0,numServices);
			}
			
			//get a proposed time based on the waiting people.
			getNextTimeSlot(proposed_time=>{
				console.log("Real proposed time: %s", proposed_time.format('YYYY-MM-DDTHH:mm:ss'));
				var minutesToWait = proposed_time.diff(moment(),'minutes');
				if(minutesToWait > 15){
					speechOutput += '<say-as interpret-as="interjection">aw man</say-as>, We are experiencing higher than average wait times! We dont have time to explain why we dont have time to explain why your wait time will be so long! <say-as interpret-as="interjection">bummer</say-as> <break time="1s"/>';
				}
				
				speechOutput += "The estimated wait time for employee assistance is ";
				
				speechOutput += minutesToWait
				speechOutput += " minutes. ";
				
				if(minutesToWait > 15){
					speechOutput += 'You might consider a leisurely stroll outside the store until you get a text notification from us. ';
				}
				
				speechOutput += "An employee will call for: " + intentSlots.name.value + "; at around " + proposed_time.format('h:mm a') + '. ';
				speechOutput += 'In the meantime, feel free to browse our <emphasis level="strong">extensive</emphasis> collection of off-brand android phones. ';
				speechOutput += 'And watch out for Chuck Norris. He once shot down an airplane with his finger by shouting, <say-as interpret-as="interjection">bang</say-as>. ';
				
				if(isNaN(myPhoneNumber)){
					myPhoneNumber = genPhone();
				}
				
				jsonItem = {
				'checkin_timestamp': moment().format('YYYY-MM-DDTHH:mm:ss'),
				'proposed_time': proposed_time.format('YYYY-MM-DDTHH:mm:ss'),
				'name': intentSlots.name.value,
				'phone_number': parseInt(myPhoneNumber),
				'problem': intentSlots.problem.value,
				'num_lines': numLines,
				'account_number': accountNumber,
				'services': hasServices,
				'handled': 0
				};
				
			
				putDynamoItem(jsonItem, theResult=>{
					this.response.speak(speechOutput);
					this.emit(':responseReady');
				});
				
			});
			
			
			//Dump this into the db with a bunch of fake info;
			
			//https://github.com/alexa/alexa-cookbook/blob/master/aws/Amazon-DynamoDB/read/src/index.js
			
						
			
		}
   /*
		var speechOutput = "The estimated wait time for employee assistance is ";
		speechOutput += currentWait;
		speechOutput += " minutes. ";
		speechOutput += "Would you like to reserve a slot? " 
		this.handler.state = states.CHECKINMODE;
        this.emit(':ask', speechOutput, speechOutput);*/
    },

    "AMAZON.HelpIntent": function () {
        var speechOutput = "";
        speechOutput += "Here are some things you can say: ";
        speechOutput += "I have a question about a product or service. ";
        speechOutput += "I need help with something. ";
        speechOutput += "You can also say stop if you're done. ";
        speechOutput += "So how can I help?";
        this.emit(':ask', speechOutput, speechOutput);
    },
	
	"Unhandled": function () {
        var speechOutput = "";
        speechOutput += "Here are some things you can say: ";
        speechOutput += "I have a question about a product or service. ";
        speechOutput += "I need help with something. ";
        speechOutput += "You can also say stop if you're done. ";
        speechOutput += "So how can I help?";
        this.emit(':ask', speechOutput, speechOutput);
    },
	
	"SessionEndedRequest": function () {
        var speechOutput = "Thanks for using " + skillName + ".";
        this.emit(':tell', speechOutput);
    },

    "AMAZON.StopIntent": function () {
        var speechOutput = "Thanks for using " + skillName + ".";
        this.emit(':tell', speechOutput);
    },

    "AMAZON.CancelIntent": function () {
        var speechOutput = "Thanks for using " + skillName + ".";
        this.emit(':tell', speechOutput);
    }
	
};

function putDynamoItem(params, callback){
	var documentClient = new AWS.DynamoDB.DocumentClient();
	console.log("JSON Item: %j", params); 
	
	documentClient.put({
             'TableName': tableName,
             'Item': params
			},(err, data) => {              //needing stringify on this for avoiding silent errors is ridiculous
				if (err) console.log("Error: " + err);
				else console.log("Success: " + data);
				callback(data);
			});	
}

//https://github.com/alexa/alexa-cookbook/blob/master/aws/Amazon-DynamoDB/read/src/index.js
function getNextTimeSlot(callback){
	
	//step 1: pull the most recent person waiting in the queue out of the queue.
	//step 2: find out what their estimated service time is
	//step 3: add random wait time to that. If it doesnt exist, add random wait time to now.
	//step 4: return that new time
	
	var documentClient = new AWS.DynamoDB.DocumentClient();
	
	var scanQuery = {TableName: tableName,
             FilterExpression: 'handled = :handled',
			 ExpressionAttributeValues : {':handled' : 0}
	};
	documentClient.scan(scanQuery,(err, data) => {              //needing stringify on this for avoiding silent errors is ridiculous
				if (err) console.log("Error: " + err);
				else console.log("Success: " + JSON.stringify(data));
				var nextTime = moment().add(gen(), 'm');
				
				if(data.Count > 0){
					var sortedData = sortJsonArray(data.Items,'proposed_time','des');
					var nextWait = gen();
					console.log(JSON.stringify(sortedData));
					var previousSlot = moment(sortedData[0].proposed_time);
					if(previousSlot.isBefore(moment())){
						console.log("Warning: your employees are REALLY SLOW. DOUBLING RANDOM WAIT TIME AT CURRENT");
						nextTime = moment().add(nextWait*2, 'm');
					}else{
						nextTime = previousSlot.add(nextWait, 'm');
					}
					//if the current time is already ahead of the previous proposed wait time
					//then DOUBLE the random wait time and set a new wait time. These employees must be REAL SLOW
					
				}
				callback(nextTime);
	});	
}

function slotValue(slot, useId){
    let value = slot.value;
    let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
        let resolutionValue = resolution.values[0].value;
        value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }
    return value;
}

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageString;
    alexa.registerHandlers(handlers, checkinModeHandlers, bookModeHandlers);
    alexa.execute();
};
