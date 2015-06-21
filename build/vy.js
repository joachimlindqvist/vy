this.Vy = (function() {
  var Events, buttonStructure, vyStructure;

  vyStructure = '<div class="vy"> <div class="vy-positioner"> <video class="vy-placeholder"></video> </div> <div class="vy-controls"> <div class="vy-play"></div> <div class="vy-pause"></div> <div class="vy-when-playing"></div> <div class="vy-when-hovering right-aligned"></div> <div class="vy-play-slider"></div> <div class="vy-load-slider"></div> </div> </div>';

  buttonStructure = '<div class="vy-button"></div>';

  Events = {
    MouseDownOnVideo: false,
    MovingSlider: false
  };

  function Vy(original_video, options) {
    var settings;
    if (options == null) {
      options = {};
    }
    settings = {
      buttons: {
        playing: ['rewind'],
        hovering: ['sound']
      }
    };
    settings = $.extend(settings, options);
    this.root = this.buildPlayer(original_video, settings);
    this.root.data('vy', this);
    this.insertButtons(settings.buttons);
    this.root.on('mouseleave', (function(_this) {
      return function(e) {
        Events.MovingSlider = false;
        return Events.MouseDownOnVideo = false;
      };
    })(this));
    this.component('play').on('click', (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.play();
      };
    })(this));
    this.component('pause').on('click', (function(_this) {
      return function(e) {
        e.preventDefault();
        if (Events.MovingSlider) {
          _this.seekToPercent(_this.getSeekPercent(e.clientX));
          _this.play();
        } else {
          _this.pause();
        }
        Events.MovingSlider = false;
        return Events.MouseDownOnVideo = false;
      };
    })(this));
    this.component('pause').on('mousedown', (function(_this) {
      return function(e) {
        e.preventDefault();
        return Events.MouseDownOnVideo = true;
      };
    })(this));
    this.component('pause').on('mousemove', (function(_this) {
      return function(e) {
        var percent;
        e.preventDefault();
        if (Events.MouseDownOnVideo) {
          Events.MovingSlider = true;
          percent = _this.getSeekPercent(e.clientX);
          _this.seekToPercent(percent);
          return _this.movePlaySliderToPercent(percent);
        }
      };
    })(this));
    this.component('player').on('progress', (function(_this) {
      return function(e) {
        var currentPercent, ref;
        currentPercent = (ref = _this.buffered) != null ? ref.end(0) : void 0;
        if (currentPercent !== _this.duration) {
          return self.moveLoadSliderToPercent(currentPercent);
        }
      };
    })(this));
    this.component('rewind').on('click', (function(_this) {
      return function(e) {
        e.stopPropagation();
        return _this.seekToDuration(0);
      };
    })(this));
    this.component('sound').on('click', (function(_this) {
      return function(e) {
        e.stopPropagation();
        return _this.toggleMute();
      };
    })(this));
    this.component('player').on('play', (function(_this) {
      return function(e) {
        return _this.setAsPlaying();
      };
    })(this));
    this.component('player').on('pause', (function(_this) {
      return function(e) {
        return _this.setAsPaused();
      };
    })(this));
    this.component('player').on('currenttimeupdate', (function(_this) {
      return function(e) {
        return _this.movePlaySliderToPercent(_this.getCurrentTimePercent());
      };
    })(this));
    setInterval((function(_this) {
      return function() {
        if (_this.isPlaying()) {
          return _this.component('player').trigger('currenttimeupdate');
        }
      };
    })(this), 20);
  }

  Vy.prototype.buildPlayer = function(original_video, settings) {
    var player, root;
    player = $(original_video).clone().addClass('vy-player');
    root = $(vyStructure).find('video.vy-placeholder').replaceWith(player).end();
    return root;
  };

  Vy.prototype.insertButtons = function(buttons) {
    var $button, button, group, j, len, ref, results, wrap;
    $button = $(buttonStructure);
    ref = Object.keys(buttons);
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      group = ref[j];
      wrap = this.component("when-" + group);
      if (wrap.hasClass('right-aligned')) {
        buttons[group].reverse();
      }
      results.push((function() {
        var k, len1, ref1, results1;
        ref1 = buttons[group];
        results1 = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          button = ref1[k];
          results1.push(wrap.append($button.clone().addClass("vy-" + button).text(button)));
        }
        return results1;
      })());
    }
    return results;
  };

  Vy.prototype.component = function(name) {
    return this.root.find(".vy-" + name);
  };

  Vy.prototype.getCurrentTimePercent = function() {
    var player;
    player = this.component('player').get(0);
    return player.currentTime / player.duration;
  };

  Vy.prototype.movePlaySliderToPercent = function(percent) {
    if (percent >= 1) {
      percent = 1;
    }
    return this.component('play-slider').css('right', (100 - (percent * 100)) + "%");
  };

  Vy.prototype.moveLoadSliderToPercent = function(percent) {
    if (percent >= 1) {
      percent = 1;
    }
    return this.component('load-slider').css('right', (100 - (percent * 100)) + "%");
  };

  Vy.prototype.seekToPercent = function(percent) {
    var player;
    player = this.component('player').get(0);
    return this.seekToDuration(percent * player.duration);
  };

  Vy.prototype.seekToDuration = function(duration) {
    var player;
    player = this.component('player').get(0);
    return player.currentTime = duration;
  };

  Vy.prototype.getSeekPercent = function(mouseLeft) {
    var player, pos;
    player = this.component('player');
    pos = player.offset();
    return (mouseLeft - pos.left) / player.width();
  };

  Vy.prototype.play = function() {
    return this.component('player').get(0).play();
  };

  Vy.prototype.pause = function() {
    return this.component('player').get(0).pause();
  };

  Vy.prototype.mute = function() {
    this.component('player').attr('muted', 'muted');
    return this.root.attr('muted', 'muted');
  };

  Vy.prototype.unmute = function() {
    this.component('player').attr('muted', null);
    return this.root.attr('muted', null);
  };

  Vy.prototype.enablePauseButton = function() {
    this.component('play').hide();
    this.component('pause').show();
    return this.component('when-playing').show();
  };

  Vy.prototype.enablePlayButton = function() {
    this.component('pause').hide();
    this.component('play').show();
    return this.component('when-playing').hide();
  };

  Vy.prototype.setAsPlaying = function() {
    return this.root.attr('playing', 'playing');
  };

  Vy.prototype.setAsPaused = function() {
    return this.root.attr('playing', null);
  };

  Vy.prototype.isMuted = function() {
    return !!this.component('player').attr('muted');
  };

  Vy.prototype.isPlaying = function() {
    var ref;
    return ((ref = this.root[0]) != null ? ref.getAttribute('playing') : void 0) === 'playing';
  };

  Vy.prototype.toggleMute = function() {
    if (this.isMuted()) {
      return this.unmute();
    } else {
      return this.mute();
    }
  };

  return Vy;

})();

$.fn.vy = function(options) {
  if (options == null) {
    options = {};
  }
  return this.each(function(i, video) {
    var $video, vy;
    $video = $(video);
    if ($video.data('vy') == null) {
      vy = new Vy($(video)[0], options);
      $video.replaceWith(vy.root);
      video = vy.root[0];
    }
    return video;
  });
};

//# sourceMappingURL=vy.js.map
