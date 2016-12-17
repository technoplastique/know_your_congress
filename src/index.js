/**
 * App ID for the skill
 */
var APP_ID = 'skills-number-goes-here';//Replace this with your number, found in the Alexa Skills Information Tab

var https = require('https');
var Fuse = require("./fuse.js");
var namelist = require("./names");


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * KnowYourCongress is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var KnowYourCongress = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
KnowYourCongress.prototype = Object.create(AlexaSkill.prototype);
KnowYourCongress.prototype.constructor = KnowYourCongress;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

KnowYourCongress.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

KnowYourCongress.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleWelcomeRequest(response);
};

KnowYourCongress.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

/**
 * override intentHandlers to map intent handling functions.
 */
KnowYourCongress.prototype.intentHandlers = {
        
    "StateIntent": function (intent, session, response) {
        handleStateRequest(intent, session, response);
    },

    "PersonIntent": function (intent, session, response) {
        handlePersonRequest(intent, session, response);
    },

    "SupportedStatesIntent": function (intent, session, response) {
        handleSupportedStateRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};


var STATELIST = {
'alabama': 'al',
'alaska': 'ak',
'arizona': 'az',
'arkansas': 'ar',
'california': 'ca',
'colorado': 'co',
'connecticut': 'ct',
'delaware': 'de',
'florida': 'fl',
'georgia': 'ga',
'hawaii': 'hi',
'idaho': 'id',
'illinois': 'il',
'indiana': 'in',
'iowa': 'ia',
'kansas': 'ks',
'kentucky': 'ky',
'louisiana': 'la',
'maine': 'me',
'maryland': 'md',
'massachusetts': 'ma',
'michigan': 'mi',
'minnesota': 'mn',
'mississippi': 'ms',
'missouri': 'mo',
'montana': 'mt',
'nebraska': 'ne',
'nevada': 'nv',
'new hampshire': 'nh',
'new jersey': 'nj',
'new mexico': 'nm',
'new york': 'ny',
'north carolina': 'nc',
'north dakota': 'nd',
'ohio': 'oh',
'oklahoma': 'ok',
'oregon': 'or',
'pennsylvania': 'pa',
'rhode island': 'ri',
'south carolina': 'sc',
'south dakota': 'sd',
'tennessee': 'tn',
'texas': 'tx',
'utah': 'ut',
'vermont': 'vt',
'virginia': 'va',
'washington': 'wa',
'west virginia': 'wv',
'wisconsin': 'wi',
'wyoming': 'wy',
'american samoa': 'as',
'district of columbia': 'dc',
'guam': 'gu',
'northern mariana islands': 'mp',
'puerto rico': 'pr',
'virgin islands': 'vi'
};

//This might be overkill, but I was getting occassional glitches without it, so here it is.
var ABBREVLIST = {
'al': 'Alabama',
'ak': 'Alaska',
'az': 'Arizona',
'ar': 'Arkansas',
'ca': 'California',
'co': 'Colorado',
'ct': 'Connecticut',
'de': 'Delaware',
'fl': 'Florida',
'ga': 'Georgia',
'hi': 'Hawaii',
'id': 'Idaho',
'il': 'Illinois',
'in': 'Indiana',
'ia': 'Iowa',
'ks': 'Kansas',
'ky': 'Kentucky',
'la': 'Louisiana',
'me': 'Maine',
'md': 'Maryland',
'ma': 'Massachusetts',
'mi': 'Michigan',
'mn': 'Minnesota',
'ms': 'Mississippi',
'mo': 'Missouri',
'mt': 'Montana',
'ne': 'Nebraska',
'nv': 'Nevada',
'nh': 'New Hampshire',
'nj': 'New Jersey',
'nm': 'New Mexico',
'ny': 'New York',
'nc': 'North Carolina',
'nd': 'North Dakota',
'oh': 'Ohio',
'ok': 'Oklahoma',
'or': 'Oregon',
'pa': 'Pennsylvania',
'ri': 'Rhode Island',
'sc': 'South Carolina',
'sd': 'South Dakota',
'tn': 'Tennessee',
'tx': 'Texas',
'ut': 'Utah',
'vt': 'Vermont',
'va': 'Virginia',
'wa': 'Washington',
'wv': 'West Virginia',
'wi': 'Wisconsin',
'wy': 'Wyoming',
'as': 'American Samoa',
'dc': 'District of Columbia',
'gu': 'Guam',
'mp': 'Northern Mariana Islands',
'pr': 'Puerto Rico',
'vi': 'Virgin Islands'
};


/**
 * Welcomes the user and gives them a more informational remprompt.
 */
function handleWelcomeRequest(response) {
    var speechOutput = "Welcome to Know Your Congress. Which state or congressperson would you like to know about? ";
    var repromptOutput = "You can ask things like who represents Iowa? or Who is Charles Grassley? "
        + "When looking for a person, you can also say who is Grassley? or who is Charles? " 
        + "For more about the supported states, territories, and districts, ask what states are supported."
        + "Which state or congressperson would you like to know about?";

    response.ask(speechOutput, repromptOutput);
}


/**
 * Invoked with 'help', gives extra user guidance.
 */
function handleHelpRequest(response) {
    var speechOutput = "You can ask things like who represents Iowa? or Who is Charles Grassley? "
        + "When looking for a person, you can also say who is Grassley? or who is Charles? " 
        + "For more about the supported states, territories, and districts, ask what states are supported. "
        + "Which state or congressperson would you like to know about?";
    var repromptOutput = "Which state or congressperson would you like to know about?";
            
    response.ask(speechOutput, repromptOutput);
}
    

/**
 * Looks up the name provided, either gives an answer, reprompts from a list of names, or says it can't find that person.
 */
function handlePersonRequest(intent, session, response) {
        var firstNameSlot = intent.slots.FirstName;
        var lastNameSlot = intent.slots.LastName;
        var speechOutput = '';
        var cardContent = '';
        var repromptText = '';
        var endpoint = 'https://www.govtrack.us/api/v2/';
        var queryString;
        
        if (!firstNameSlot || !firstNameSlot.value) {
            queryString = 'person/?q=' + lastNameSlot.value;           
        } else if (!lastNameSlot || !lastNameSlot.value) {
            queryString = 'person/?q=' + firstNameSlot.value;
        } else {
        //Tries to match voice to existing congressperson name for fastest API result, otherwise uses original slots
            var options = {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [
                    "first",
                    "last"
                ]
                }; 
                var namecombo = firstNameSlot.value + " " + lastNameSlot.value;
                var fuse = new Fuse(namelist.names, options); // "list" is the item array
                var nameresult = fuse.search(namecombo);
               
                    if (nameresult !== '') {
                        queryString = 'person/?q=' + nameresult[0].first + "%20" + nameresult[0].last;
                    } else { 
                        queryString = 'person/?q=' + firstNameSlot.value + "%20" + lastNameSlot.value;
                    }

        }
            //Get info from GovTrack, round 1        
            https.get(endpoint + queryString, function (res) {
            var personResponseString = '';
            console.log('Status Code: ' + res.statusCode);

            if (res.statusCode != 200) {
                personResponseCallback(new Error("Non 200 Response"));
            }

            res.on('data', function (data) {
                personResponseString += data;
            });

            res.on('end', function () {
                var personResponseObject = JSON.parse(personResponseString);

                if (personResponseObject.error) {
                    console.log("GovTrack error: " + personResponseObject.error.message);
                    personResponseCallback(new Error(personResponseObject.error.message));
                } else {
                    var responsetest = personResponseObject.meta;
                    var totalcount = personResponseObject.meta.total_count;

                    //If more than one person comes up, ask which one
                    if (Number(personResponseObject.meta.total_count) > 1) {
                        speechOutput += "Do you mean ";
                        repromptText += "Please say one of the following names: ";
                        for (var i = 0; i < personResponseObject.objects.length; i++) {
                            if (i < personResponseObject.objects.length - 1) {
                            speechOutput += personResponseObject.objects[i].firstname + " " 
                            + personResponseObject.objects[i].lastname + ", ";
                            repromptText += personResponseObject.objects[i].firstname + " " 
                            + personResponseObject.objects[i].lastname + ", ";
                            } else {
                            speechOutput += "or " + personResponseObject.objects[i].firstname + " " 
                            + personResponseObject.objects[i].lastname + ".";
                            repromptText += "or " + personResponseObject.objects[i].firstname + " " 
                            + personResponseObject.objects[i].lastname + ".";                                
                            }    
                        }
                        response.ask(speechOutput, repromptText);
                    //If API response length is zero, apologize.
                    } else if (Number(personResponseObject.meta.total_count) === 0) { 
                        speechOutput += "I'm sorry, I can't find anyone by that name, please try again.";
                        response.tell(speechOutput);
                    //If API returns just one person, move on to round 2    
                    } else if (Number(personResponseObject.meta.total_count) == 1) { 
                        var id = "role/?person=" + personResponseObject.objects[0].id;
                        
                        https.get(endpoint + id, function (single) {
                            var singleResponseString = '';
                            console.log('Status Code: ' + single.statusCode);

                        if (single.statusCode != 200) {
                            singleResponseCallback(new Error("Non 200 Response"));
                        }

                        single.on('data', function (data) {
                            singleResponseString += data;                        
                        
                        });
                        
                        single.on('end', function () {
                            var singleResponseObject = JSON.parse(singleResponseString),
                                maximum,
                                he,
                                heis,
                                hewas,
                                him,
                                his;

                            if (singleResponseObject.error) {
                                console.log("GovTrack error: " + singleResponseObject.error.message);
                                singleResponseCallback(new Error(singleResponseObject.error.message));
                            } else {
                                if (singleResponseObject.objects.length > 1 ) {
                                    maximum = singleResponseObject.objects.length - 1;
                                } else {
                                    maximum = 0;
                                }
                                
                                //Deal with some gender issues.
                                if (singleResponseObject.objects[maximum].person.gender === 'male') {
                                    he = "he ";
                                    heis = "he is ";
                                    hewas = "he was ";
                                    him = "him ";
                                    his = "his ";
                                } else if (singleResponseObject.objects[maximum].person.gender === 'female') {
                                    he = "she ";
                                    heis = "she is ";
                                    hewas = "she was ";
                                    him = "her ";
                                    his = "hers ";
                                //Some results, especially older ones, don't include a gender.    
                                } else {
                                    he = "they ";
                                    heis = "they are ";
                                    hewas = "they were ";
                                    him = "them ";
                                    his = "their ";
                                }

                                speechOutput += singleResponseObject.objects[maximum].person.firstname + " " 
                                    + singleResponseObject.objects[maximum].person.lastname;
                                
                                //Create a response specific to current congresspeople, including a handy contact info card.
                                if (singleResponseObject.objects[maximum].current === true) {
                                    var d = new Date(singleResponseObject.objects[0].startdate);
                                    speechOutput += " is currently a " + singleResponseObject.objects[maximum].description + ". "
                                        + heis + "a " + singleResponseObject.objects[maximum].party + " who has been in congress since "
                                        + d.getFullYear() + ". ";
                                    
                                        if (singleResponseObject.objects[maximum].leadership_title !== null) {
                                            speechOutput += heis + "the " + singleResponseObject.objects[maximum].leadership_title + ".";
                                        }
                                    var cardTitle = singleResponseObject.objects[maximum].person.firstname + " " 
                                        + singleResponseObject.objects[maximum].person.lastname;
                                        if (singleResponseObject.objects[maximum].phone !== null) {
                                            cardContent += "Phone: " + singleResponseObject.objects[maximum].phone;
                                        }
                                        if (singleResponseObject.objects[maximum].extra.address !== null) {
                                            cardContent += "\nAddress: " + singleResponseObject.objects[maximum].extra.address;
                                        }                                
                                        if (singleResponseObject.objects[maximum].website !== null) {
                                            cardContent += "\nWebsite: " + singleResponseObject.objects[maximum].website;
                                        }                                     
                                        if (singleResponseObject.objects[maximum].person.twitterid !== null) {
                                            cardContent += "\nTwitter: " + singleResponseObject.objects[maximum].person.twitterid;
                                        }
                                        if (singleResponseObject.objects[maximum].person.youtubeid !== null) {
                                            cardContent += "\nYoutube: " + singleResponseObject.objects[maximum].person.youtubeid;
                                        }
                                        
                                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                                
                                //Create a response specific to former congresspeople, no card included.    
                                } else {
                                    var startdate = new Date(singleResponseObject.objects[0].startdate);
                                    var enddate = new Date(singleResponseObject.objects[maximum].enddate);
                                    
                                    speechOutput += " was in congress between "
                                        + startdate.getFullYear() + " and "
                                        + enddate.getFullYear() + ". "
                                    if (singleResponseObject.objects[maximum].party !== null){
                                        speechOutput += hewas + "a " + singleResponseObject.objects[maximum].party + ", and "
                                    }
                                    speechOutput += "at the end of " + his + "congressional career " + hewas + "the "
                                        + singleResponseObject.objects[maximum].description;
                                    
                                         if (singleResponseObject.objects[maximum].leadership_title !== null) {
                                            speechOutput += ", and also the " + singleResponseObject.objects[maximum].leadership_title + ".";
                                        } else {
                                            speechOutput += ". ";
                                        }
                                    response.tell(speechOutput);
                                }

                            }
                                
                        });
                        
                    }).on('error', function (err) {
                        console.log("Communications error: " + err.message);
                        singleResponseCallback(new Error(err.message));
                        });
                        
                    }
                        
                }
            });
            
        }).on('error', function (e) {
            console.log("Communications error: " + e.message);
            personResponseCallback(new Error(e.message));
            });

        if (firstNameSlot.error && lastNameSlot.error) {
            speechOutput = "I'm sorry, I can't look that up right now, please try again later.";
            response.tell(speechOutput);
            } 
}



/**
 * A little help for what states, territories, and districts have info available
 */
function handleSupportedStateRequest(intent, session, response) {
    var repromptOutput = "Which state, district, territory, or congressperson would you like to know about?";
    var speechOutput = "You can ask about any of the 50 US states, as well as "
        + "American Samoa, District of Columbia, Guam, Northern Mariana Islands, Puerto Rico, or the Virgin Islands. "
        + repromptOutput;
        
    response.ask(speechOutput, repromptOutput);
    
}

/**
 * Looks up the state abbreviation from the state name, and also the state name from the state abbreviation.
 */
function getStateAbbrevFromIntent(intent, assignDefault) {

    var stateSlot = intent.slots.State;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.

        if (!stateSlot || !stateSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            };
        } else {
            // For sample skill, default to Iowa.
            return {
                state: 'iowa',
                stateabbrev: STATELIST.iowa
            };
        }
    } else {
        // lookup the city. Sample skill uses well known mapping of a few known cities to station id.
        var stateName = stateSlot.value;
        if (stateName.length > 2 ) {
        if (STATELIST[stateName.toLowerCase()]) {
            return {
                state: stateName,
                stateabbrev: STATELIST[stateName.toLowerCase()],
            }
        } else {
            return {
                error: true,
                state: stateName
            };
        }
    } else {
       return{
           state: ABBREVLIST[stateName.toLowerCase()],
           stateabbrev: stateName,
       }
    }
    }
}

/**
 * Looks up information about the state from the API, returns a list of who represents the state or territory.
 */
function handleStateRequest(intent, session, response) {
    console.log('State request');
    
    var stateList = getStateAbbrevFromIntent(intent, false);
    
    var speechOutput = '';
    
    var endpoint = 'https://www.govtrack.us/api/v2/role/';
    var queryString = '?state=' + stateList.stateabbrev + '&current=true';
    
        https.get(endpoint + queryString, function (res) {
        var stateResponseString = '';
        console.log('Status Code: ' + res.statusCode);

        if (res.statusCode != 200) {
            stateResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            stateResponseString += data;
        });

        res.on('end', function () {
            var stateResponseObject = JSON.parse(stateResponseString);

            if (stateResponseObject.error) {
                console.log("GovTrack error: " + stateResponseObject.error.message);
                stateResponseCallback(new Error(stateResponseObject.error.message));
            } else {
                var responsetest = stateResponseObject.meta;
                //If API response length is zero, apologize.
                if (Number(stateResponseObject.objects.length) === 0) {
                    speechOutput += "I'm sorry, I can't look that up right now. Please try again."
                }
                //If it's less than 10 names, include their description. Otherwise, just names.
                if (stateResponseObject.objects.length < 10) {
                    speechOutput += stateList.state + " is represented by "
                    for (var i = 0; i < stateResponseObject.objects.length; i++) {
                        speechOutput += stateResponseObject.objects[i].person.firstname + " " 
                        + stateResponseObject.objects[i].person.lastname + ", "
                        + stateResponseObject.objects[i].description + ". ";
                    }
                } else {
                    speechOutput += stateList.state + " is represented by "
                    for (var i = 0; i < stateResponseObject.objects.length; i++) {
                        speechOutput += stateResponseObject.objects[i].person.firstname + " " 
                        + stateResponseObject.objects[i].person.lastname + ", ";
                    }
                }
                    response.tell(speechOutput);
            }
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        stateResponseCallback(new Error(e.message));
        });

       if (stateList.error) {
        speechOutput = "I'm sorry, I can't look that up right now.";
        response.tell(speechOutput);
        }

}


// Create the handler that responds to the Alexa Request. So important. So easy to forget.
exports.handler = function (event, context) {
    var knowYourCongress = new KnowYourCongress();
    knowYourCongress.execute(event, context);
};
