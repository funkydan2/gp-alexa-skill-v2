"use strict";
module.change_code = 1;
const _ = require("lodash");
const Alexa = require('ask-sdk-core');
const AmazonDateParser = require("amazon-date-parser");

//My Modules
const GPDataHelper = require("./modules/gp_data_helper.js");
const GPPodcastHelper = require("./modules/gp_podcast_helper.js");

// Helper Functions 
function convertAmDate(amDate) {
  // This function returns TODAY's date if the amDate is undefined.
  if (_.isEmpty(amDate)) {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }

    return yyyy + "-" + mm + "-" + dd;
  } else {
    var dateObj = new AmazonDateParser(amDate);
    //We're going to assume if the user says 'This Week' they mean
    //'the sermon at the first service which happens this week!
    return dateObj.startDate.toString();
  }
}

async function getPlaybackInfo(handlerInput) {
  const context = handlerInput.requestEnvelope.context;
  let token = 0;
  let offsetInMilliseconds = 0;

  if (context && context.AudioPlayer && context.AudioPlayer.token) {
    token = Number(context.AudioPlayer.token);
    if (Number.isNaN(token)) {
      token = 0;
    }
  }

  if (context && context.AudioPlayer && context.AudioPlayer.offsetInMilliseconds) {
    offsetInMilliseconds = Number(context.AudioPlayer.offsetInMilliseconds) || 0;
  }

  return { token, offsetInMilliseconds };
}


// Request Handlers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Gympie Presbyterian Church Skill. You can ask me for sermon titles, bible readings, or ask to play the latest sermon podcast. What would you like to do?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Gympie Presbyterian Church', speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const SermonTitleIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'sermontitle';
  },
  async handle(handlerInput) {
    const dateValue = handlerInput.requestEnvelope.request.intent.slots.DATE?.value;
    const date = convertAmDate(dateValue);
    const gpHelper = new GPDataHelper();
    const sermonTitle = await gpHelper.getSermonTitle(date);
    const speech = sermonTitle
      ? `The sermon title is ${sermonTitle}`
      : `Sorry. We haven't got a sermon title for ${date}. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .reprompt(speech)
      .getResponse();
  }
};

const SermonPassageIntentHandler = { 
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'sermonpassage';
  },
  async handle(handlerInput) {
    const dateValue = handlerInput.requestEnvelope.request.intent.slots.DATE?.value;
    const date = convertAmDate(dateValue);
    const gpHelper = new GPDataHelper();
    const sermonPassage = await gpHelper.getSermonPassage(date);
    const speech = sermonPassage
      ? `The sermon passage is ${sermonPassage}`
      : `Sorry. We haven't got a sermon passage for ${date}. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .reprompt(speech)
      .getResponse();
  }
};
const OtherPassageIntentHandler = { 
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'otherpassage';
  },
  async handle(handlerInput) {
    const dateValue = handlerInput.requestEnvelope.request.intent.slots.DATE?.value;
    const date = convertAmDate(dateValue);
    const gpHelper = new GPDataHelper();
    const otherPassage = await gpHelper.getOtherPassage(date);
    const speech = otherPassage
      ? `The other passage is ${otherPassage}`
      : `Sorry. We haven't got an other passage for ${date}. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .reprompt(speech)
      .getResponse();
  }
};

const SermonSeriesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'sermonseries';
  },
  async handle(handlerInput) {
    const dateValue = handlerInput.requestEnvelope.request.intent.slots.DATE?.value;
    const date = convertAmDate(dateValue);
    const gpHelper = new GPDataHelper();
    const sermonSeries = await gpHelper.getSermonSeries(date);
    const speech = sermonSeries
      ? `The sermon series is ${sermonSeries}`
      : `Sorry. We haven't got a sermon series for ${date}. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .reprompt(speech)
      .getResponse();
  }
};

const PodcastIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'podcast' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayAudioIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent');
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);

    const playBehavior = 'REPLACE_ALL';
    const podcast = new GPPodcastHelper();
        
    const podcastEp = await podcast.getEpisode(0);
    const speakOutput = podcastEp.preRoll;

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .withSimpleCard('Gympie Presbyterian Church', speakOutput)
        .addAudioPlayerPlayDirective(
            playBehavior,
            podcastEp.mp3URL,
            playbackInfo.token,
            playbackInfo.offsetInMilliseconds
            )
        .withShouldEndSession(true)
        .getResponse();
  }
};

const NextIntentHandler = { 
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const playBehavior = 'REPLACE_ALL';
    const podcast = new GPPodcastHelper();

    let episodeNum = Number(playbackInfo.token);

    if (_.isUndefined(episodeNum)) {
      return handlerInput.responseBuilder
        .speak('Something has gone wrong skipping to the next track!')
        .getResponse();
    }

    if (episodeNum >= 9) {
      return handlerInput.responseBuilder
        .speak('No more sermons here. For more sermons, visit our website.')
        .getResponse();
    } else {
      episodeNum += 1;
      const podcastEp = await podcast.getEpisode(episodeNum)
      const speakOutput = 'Playing the next episode. ' + podcastEp.preRoll;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withSimpleCard('Gympie Presbyterian Church', speakOutput)
        .addAudioPlayerPlayDirective(
            playBehavior,
            podcastEp.mp3URL,
            episodeNum,
            playbackInfo.offsetInMilliseconds
            )
        .withShouldEndSession(true)
        .getResponse();
      }
  }
};

const PreviousIntentHandler = {
  canHandle(handlerInput){
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const playBehavior = 'REPLACE_ALL';
    const podcast = new GPPodcastHelper();
      
    let episode = Number(playbackInfo.token);

    if (_.isUndefined(episode)) {
      return handlerInput.responseBuilder
        .speak('Something has gone wrong skipping to the next track!')
        .getResponse();
    }
    
    if (episode == 0) {
      return handlerInput.responseBuilder
        .speak('No more sermons here. For more sermons, visit our website.')
        .getResponse();
    } else {
      episode -= 1;
      const podcastEp = await podcast.getEpisode(episode)
      const speakOutput = 'Playing the previous episode. ' + podcastEp.preRoll;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withSimpleCard('Gympie Presbyterian Church', speakOutput)
        .addAudioPlayerPlayDirective(
            playBehavior,
            podcastEp.mp3URL,
            playbackInfo.token - 1,
            playbackInfo.offsetInMilliseconds
            )
        .withShouldEndSession(true)
        .getResponse();
      }
  }
};

const PauseIntentHandler = { 
  canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
 };

 const UnsupportedAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent'
                );
    },
    async handle(handlerInput) {
        const speakOutput = 'Sorry, this skill doesn\'t support that function.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withSimpleCard('Gympie Presbyterian Church', speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = { 
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  async handle(handlerInput) {
    const speech = 'You can ask me for the title, passage, or series of a sermon on a specific date. For example, you can say "What is the sermon title for this Sunday?"';

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = { 
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent';
  },
  async handle(handlerInput) {
    const speech = 'Thanks for using Gympie Presbyterian on Alexa. Goodbye!';

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const ErrorHandler = { 
  canHandle() {
    return true;
  },
  async handle(handlerInput, error) {
    console.error(error);
    const speech = 'Sorry, I had trouble doing what you asked. Please try again.';

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(speech)
      .withSimpleCard('Gympie Presbyterian Church', speech)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SermonTitleIntentHandler,
    SermonPassageIntentHandler,
    OtherPassageIntentHandler,
    SermonSeriesIntentHandler,
    PodcastIntentHandler,
    NextIntentHandler,
    PreviousIntentHandler,
    PauseIntentHandler,
    UnsupportedAudioIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
