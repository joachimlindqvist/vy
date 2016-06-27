(function() {
  this.Vy = (function() {
    var ControlsAnimationSpeed, Events, buttonStructure, vyStructure;

    vyStructure = '<div class="vy"> <div class="vy-title"></div> <div class="vy-positioner"> <video class="vy-placeholder"></video> </div> <div class="vy-controls"> <div class="vy-play"></div> <div class="vy-pause"> <div class="uil-flickr-css"> <div></div><div></div> </div> </div> <div class="vy-buttons vy-buttons-left"></div> <div class="vy-buttons vy-buttons-right"></div> <div class="vy-play-slider"></div> <div class="vy-load-slider"></div> </div> </div>';

    buttonStructure = '<div class="vy-button"></div>';

    Events = {
      MouseDownOnVideo: false,
      MovingSlider: false
    };

    ControlsAnimationSpeed = 175;

    function Vy(original_video, options) {
      var settings;
      if (options == null) {
        options = {};
      }
      settings = {
        buttons: {
          left: ['rewind'],
          right: ['sound']
        }
      };
      settings = $.extend(settings, options);
      this.root = this.buildPlayer(original_video, settings);
      this.root.data('vy', this);
      this.insertButtons(settings.buttons);
      this.insertTitle(settings.title);
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
      this.component('title').on('click', (function(_this) {
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
            _this.pause();
            percent = _this.getSeekPercent(e.clientX);
            _this.seekToPercent(percent);
            return _this.movePlaySliderToPercent(percent);
          }
        };
      })(this));
      this.component('player').on('progress', (function(_this) {
        return function(e) {
          return _this.moveLoadSliderToPercent(_this.getCurrentLoadPercent());
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
          _this.setAsPlaying();
          return _this.enableControls();
        };
      })(this));
      this.component('player').on('pause', (function(_this) {
        return function(e) {
          if (!Events.MovingSlider) {
            _this.setAsPaused();
            return _this.enableTitle();
          }
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
        wrap = this.component("buttons-" + group);
        if (group === 'right') {
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

    Vy.prototype.insertTitle = function(title) {
      if (title != null ? title.length : void 0) {
        return this.component("title").text(title);
      }
    };

    Vy.prototype.component = function(name) {
      return this.root.find(".vy-" + name);
    };

    Vy.prototype.getCurrentTimePercent = function() {
      return this.currentTime() / this.duration();
    };

    Vy.prototype.getCurrentLoadPercent = function() {
      return this.buffered() / this.duration();
    };

    Vy.prototype.timeLeft = function() {
      return this.duration() - this.currentTime();
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
      return this.seekToDuration(percent * this.rawPlayer().duration);
    };

    Vy.prototype.seekToDuration = function(duration) {
      return this.rawPlayer().currentTime = duration;
    };

    Vy.prototype.getSeekPercent = function(mouseLeft) {
      var player, pos;
      player = this.component('player');
      pos = player.offset();
      return (mouseLeft - pos.left) / player.width();
    };

    Vy.prototype.rawPlayer = function() {
      return this.component('player').get(0);
    };

    Vy.prototype.buffered = function() {
      if (this.rawPlayer().buffered.length === 0) {
        return 0;
      }
      return this.rawPlayer().buffered.end(0);
    };

    Vy.prototype.duration = function() {
      return this.rawPlayer().duration;
    };

    Vy.prototype.currentTime = function() {
      return this.rawPlayer().currentTime;
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

    Vy.prototype.enableControls = function() {
      var buttons, title;
      title = this.component('title');
      buttons = this.component('buttons');
      return title.animate({
        bottom: (-1 * title.height()) + "px"
      }, ControlsAnimationSpeed, 'swing', function() {
        return buttons.animate({
          bottom: '0em'
        }, ControlsAnimationSpeed);
      });
    };

    Vy.prototype.enableTitle = function() {
      var buttons, title;
      title = this.component('title');
      buttons = this.component('buttons');
      return buttons.animate({
        bottom: (-1 * buttons.height()) + "px"
      }, ControlsAnimationSpeed, 'swing', function() {
        return title.animate({
          bottom: '1em'
        }, ControlsAnimationSpeed);
      });
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

  $(function() {
    return $('.vy-video').each(function(i, video) {
      var $video, options;
      $video = $(video);
      options = $video.data('vy-settings') || {};
      return $video.vy(options);
    });
  });

}).call(this);

//# sourceMappingURL=vy.js.map
