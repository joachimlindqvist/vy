(function() {
  var createElementFromString, extend, offset,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  extend = function(orig, items) {
    var item, key;
    for (key in items) {
      item = items[key];
      orig[key] = item;
    }
    return orig;
  };

  createElementFromString = function(string) {
    var temp;
    temp = document.createElement('div');
    temp.innerHTML = string;
    return temp.childNodes[0];
  };

  offset = function(elem) {
    return alert('implement offset()');
  };

  this.Vy = (function() {
    var ControlsAnimationSpeed, Events, buttonStructure, vyStructure;

    vyStructure = '<div class="vy"> <div class="vy-title"></div> <div class="vy-positioner"> <video class="vy-placeholder"></video> </div> <div class="vy-controls"> <div class="vy-play"></div> <div class="vy-pause"></div> <div class="vy-buttons vy-buttons-left"></div> <div class="vy-buttons vy-buttons-right"></div> <div class="vy-play-slider"></div> <div class="vy-load-slider"></div> </div> </div>';

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
      this.hook = bind(this.hook, this);
      settings = {
        buttons: {
          left: ['rewind'],
          right: ['sound']
        }
      };
      settings = extend(settings, options);
      this.root = this.buildPlayer(original_video, settings);
      this.insertButtons(settings.buttons);
      this.insertTitle(settings.title);
      this.hook(this.root);
      this.root.addEventListener('mouseleave', (function(_this) {
        return function(e) {
          Events.MovingSlider = false;
          return Events.MouseDownOnVideo = false;
        };
      })(this));
      this.component('play', false).addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.play();
        };
      })(this));
      this.component('pause', false).addEventListener('click', (function(_this) {
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
      this.component('pause', false).addEventListener('mousedown', (function(_this) {
        return function(e) {
          e.preventDefault();
          return Events.MouseDownOnVideo = true;
        };
      })(this));
      this.component('pause', false).addEventListener('mousemove', (function(_this) {
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
      this.component('player', false).addEventListener('progress', (function(_this) {
        return function(e) {
          var currentPercent, ref;
          currentPercent = (ref = _this.buffered) != null ? ref.end(0) : void 0;
          if (currentPercent !== _this.duration) {
            return self.moveLoadSliderToPercent(currentPercent);
          }
        };
      })(this));
      this.component('rewind', false).addEventListener('click', (function(_this) {
        return function(e) {
          e.stopPropagation();
          return _this.seekToDuration(0);
        };
      })(this));
      this.component('sound', false).addEventListener('click', (function(_this) {
        return function(e) {
          e.stopPropagation();
          return _this.toggleMute();
        };
      })(this));
      this.component('player', false).addEventListener('play', (function(_this) {
        return function(e) {
          _this.setAsPlaying();
          return _this.enableControls();
        };
      })(this));
      this.component('player', false).addEventListener('pause', (function(_this) {
        return function(e) {
          _this.setAsPaused();
          return _this.enableTitle();
        };
      })(this));
      this.component('player', false).addEventListener('currenttimeupdate', (function(_this) {
        return function(e) {
          return _this.movePlaySliderToPercent(_this.getCurrentTimePercent());
        };
      })(this));
      setInterval((function(_this) {
        return function() {
          var currenttimeupdate;
          if (_this.isPlaying()) {
            currenttimeupdate = new Event('currenttimeupdate');
            return _this.component('player', false).dispatchEvent(currenttimeupdate);
          }
        };
      })(this), 20);
    }

    Vy.prototype.hook = function(el) {
      return el.vy = this;
    };

    Vy.prototype.buildPlayer = function(original_video, settings) {
      var placeholder, player, vy;
      player = original_video.cloneNode(true);
      player.classList.add('vy-player');
      vy = createElementFromString(vyStructure, true);
      placeholder = vy.querySelector('video.vy-placeholder');
      placeholder.parentNode.replaceChild(player, placeholder);
      original_video.parentNode.replaceChild(vy, original_video);
      return vy;
    };

    Vy.prototype.insertButtons = function(buttons) {
      var button, buttonElement, buttonScaffold, group, j, len, ref, results, wrap;
      buttonScaffold = createElementFromString(buttonStructure);
      ref = Object.keys(buttons);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        group = ref[j];
        wrap = this.component("buttons-" + group, false);
        if (group === 'right') {
          buttons[group].reverse();
        }
        results.push((function() {
          var k, len1, ref1, results1;
          ref1 = buttons[group];
          results1 = [];
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            button = ref1[k];
            buttonElement = buttonScaffold.cloneNode(true);
            buttonElement.classList.add("vy-" + button);
            buttonElement.textContent = button;
            results1.push(wrap.appendChild(buttonElement));
          }
          return results1;
        })());
      }
      return results;
    };

    Vy.prototype.insertTitle = function(title) {
      if (title != null ? title.length : void 0) {
        return this.component("title", false).textContent = title;
      }
    };

    Vy.prototype.component = function(name, o) {
      if (o == null) {
        o = true;
      }
      if (o) {
        return $(this.root).find(".vy-" + name);
      } else {
        return this.root.querySelector(".vy-" + name);
      }
    };

    Vy.prototype.getCurrentTimePercent = function() {
      var player;
      player = this.component('player', false);
      return player.currentTime / player.duration;
    };

    Vy.prototype.movePlaySliderToPercent = function(percent) {
      return this.moveSliderToPercent(this.component('play-slider', false), percent);
    };

    Vy.prototype.moveLoadSliderToPercent = function(percent) {
      return this.moveSliderToPercent(this.component('load-slider', false), percent);
    };

    Vy.prototype.moveSliderToPercent = function(slider, percent) {
      if (percent >= 1) {
        percent = 1;
      }
      return slider.style.right = (100 - (percent * 100)) + "%";
    };

    Vy.prototype.seekToPercent = function(percent) {
      var player;
      player = this.component('player', false);
      return this.seekToDuration(percent * player.duration);
    };

    Vy.prototype.seekToDuration = function(duration) {
      return this.component('player', false).currentTime = duration;
    };

    Vy.prototype.getSeekPercent = function(mouseLeft) {
      var player;
      player = this.component('player', false);
      return (mouseLeft - offset(player).left) / player.width();
    };

    Vy.prototype.play = function() {
      return this.component('player', false).play();
    };

    Vy.prototype.pause = function() {
      return this.component('player', false).pause();
    };

    Vy.prototype.mute = function() {
      this.component('player', false).setAttribute('muted', 'muted');
      return this.root.setAttribute('muted', 'muted');
    };

    Vy.prototype.unmute = function() {
      this.component('player', false).removeAttribute('muted');
      return this.root.removeAttribute('muted');
    };

    Vy.prototype.enablePauseButton = function() {
      hide(this.component('play', false));
      return show(this.component('pause', false));
    };

    Vy.prototype.enablePlayButton = function() {
      hide(this.component('pause', false));
      return show(this.component('play', false));
    };

    Vy.prototype.enableControls = function() {
      var buttons, title;
      title = this.component('title', false);
      return buttons = this.component('buttons', false);
    };

    Vy.prototype.enableTitle = function() {
      var buttons, title;
      title = this.component('title', false);
      return buttons = this.component('buttons', false);
    };

    Vy.prototype.setAsPlaying = function() {
      return this.root.setAttribute('playing', 'playing');
    };

    Vy.prototype.setAsPaused = function() {
      return this.root.removeAttribute('playing');
    };

    Vy.prototype.isMuted = function() {
      return !!this.component('player', false).getAttribute('muted');
    };

    Vy.prototype.isPlaying = function() {
      var ref;
      return ((ref = this.root) != null ? ref.getAttribute('playing') : void 0) === 'playing';
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

  window.addEventListener('load', function(e) {
    var j, len, ref, results, settings, video;
    ref = document.querySelectorAll('.vy-video');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      video = ref[j];
      settings = JSON.parse(video.getAttribute('data-vy-settings'));
      results.push(video.vy = new Vy(video, settings));
    }
    return results;
  });

  if (typeof $ !== "undefined" && $ !== null) {
    $.fn.vy = function(options) {
      if (options == null) {
        options = {};
      }
      return this.each(function(i, video) {
        if (video.vy == null) {
          video.vy = new Vy(video, options);
        }
        return video;
      });
    };
  }

}).call(this);

//# sourceMappingURL=vy.js.map
