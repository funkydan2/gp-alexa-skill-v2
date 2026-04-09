/* global describe, it, context */

'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
let expect = chai.expect;
const GPPodcastHelper = require('../modules/gp_podcast_helper.js');
chai.config.includeStack = true;

describe('GPPodcastHelper', function() {
  const subject = new GPPodcastHelper();
  
  describe('#getPodcastURL', function() {
    context('with the Gympie Pres Podcast RSS', function() {
      it('returns matching url', function() {
        const value = subject.getEpisode(0).then(function(url) {return url.mp3URL});
        return expect(value).to.eventually.eq('https://f001.backblazeb2.com/file/GympieSermonAudio/AllAuthority/20260405_AuthoritySpeaks_DS.mp3');
      })
    })
  })
})