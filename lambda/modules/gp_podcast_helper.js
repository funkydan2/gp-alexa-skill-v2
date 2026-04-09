"use strict";
const parsePodcast = require("node-podcast-parser");
const _ = require("lodash");
const URI = "https://gympiepresbyterian.org.au/sermons/index.xml";

async function getPodcast() {
  const { default: got } = await import("got");
  const response = await got(URI);

  return new Promise(function(resolve, reject) {
    parsePodcast(response.body, (err, data) => {
      if (err) {
        console.error("Parsing error", err);
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function GPPodcastHelper() {}

GPPodcastHelper.prototype.getEpisodeURL = function(episode) {
  return getPodcast()
    .then(function(pod) {
      if (_.isUndefined(episode)) {
        episode = 0;
      }
      var URL = pod.episodes[episode].enclosure.url.replace(
        "http://",
        "https://"
      );
      console.log("URL", URL);
      return URL;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

GPPodcastHelper.prototype.getTitle = function(episode) {
  return getPodcast()
    .then(function(pod) {
      if (_.isUndefined(episode)) {
        episode = 0;
      }
      return pod.episodes[episode].title;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

GPPodcastHelper.prototype.getDate = function(episode) {
  return getPodcast()
    .then(function(pod) {
      if (_.isUndefined(episode)) {
        episode = 0;
      }
      return pod.episodes[episode].published;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

GPPodcastHelper.prototype.getEpisode = function(episode) {
  //This function will return an object with a pre-roll string and the URL of the episode
  return getPodcast()
    .then(function(pod) {
      if (_.isUndefined(episode)) {
        episode = 0;
      }

      const prompt =
        "This is a sermon from Gympie Presbyterian Church called " +
        pod.episodes[episode].title +
        " it was recorded on " +
        pod.episodes[episode].published.toDateString();
      //Alexa must download the MP3 file over https
      const mp3URL = pod.episodes[episode].enclosure.url.replace(
        "http://",
        "https://"
      );

      console.log("Prompt", prompt);

      const podcast = { preRoll: prompt, mp3URL: mp3URL };
      return podcast;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

module.exports = GPPodcastHelper;
