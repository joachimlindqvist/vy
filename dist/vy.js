(function() {
  var Events, View, createElementFromString, extend, offset,
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
      this.View = new View(original_video, settings);
      this.Events = new Events(this, this.View);
      this.hook(this.View.component('root'));
    }

    Vy.prototype.hook = function(el) {
      return el.vy = this;
    };

    Vy.prototype.getCurrentTimePercent = function() {
      var player;
      player = this.View.component('player');
      return player.currentTime / player.duration;
    };

    Vy.prototype.movePlaySliderToPercent = function(percent) {
      return this.moveSliderToPercent(this.View.component('play-slider'), percent);
    };

    Vy.prototype.moveLoadSliderToPercent = function(percent) {
      return this.moveSliderToPercent(this.View.component('load-slider'), percent);
    };

    Vy.prototype.moveSliderToPercent = function(slider, percent) {
      if (percent >= 1) {
        percent = 1;
      }
      return slider.style.right = (100 - (percent * 100)) + "%";
    };

    Vy.prototype.seekToPercent = function(percent) {
      var player;
      player = this.View.component('player');
      return this.seekToDuration(percent * player.duration);
    };

    Vy.prototype.seekToDuration = function(duration) {
      return this.View.component('player').currentTime = duration;
    };

    Vy.prototype.getSeekPercent = function(mouseLeft) {
      var player;
      player = this.View.component('player');
      return (mouseLeft - offset(player).left) / player.width();
    };

    Vy.prototype.play = function() {
      return this.View.component('player').play();
    };

    Vy.prototype.pause = function() {
      return this.View.component('player').pause();
    };

    Vy.prototype.mute = function() {
      this.View.component('player').setAttribute('muted', 'muted');
      return this.root.setAttribute('muted', 'muted');
    };

    Vy.prototype.unmute = function() {
      this.View.component('player').removeAttribute('muted');
      return this.root.removeAttribute('muted');
    };

    Vy.prototype.enablePauseButton = function() {
      hide(this.View.component('play'));
      return show(this.View.component('pause'));
    };

    Vy.prototype.enablePlayButton = function() {
      hide(this.View.component('pause'));
      return show(this.View.component('play'));
    };

    Vy.prototype.setAsPlaying = function() {
      return this.View.root.setAttribute('playing', 'playing');
    };

    Vy.prototype.setAsPaused = function() {
      return this.View.root.removeAttribute('playing');
    };

    Vy.prototype.isMuted = function() {
      return !!this.View.component('player').getAttribute('muted');
    };

    Vy.prototype.isPlaying = function() {
      var ref;
      return ((ref = this.View.root) != null ? ref.getAttribute('playing') : void 0) === 'playing';
    };

    Vy.prototype.toggleMute = function() {
      if (this.isMuted()) {
        return this.unmute();
      } else {
        return this.mute();
      }
    };

    Vy.prototype.trigger = function(eventName) {
      return this.View.component('player').dispatchEvent(new Event(eventName));
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

  Events = (function() {
    var ActiveEvents;

    ActiveEvents = {
      MouseDownOnVideo: false,
      MovingSlider: false
    };

    function Events(Vy, View) {
      this.View = View;
      this.Vy = Vy;
      this.init();
    }

    Events.prototype.init = function() {
      this.View.component('root').addEventListener('mouseleave', (function(_this) {
        return function(e) {
          ActiveEvents.MovingSlider = false;
          return ActiveEvents.MouseDownOnVideo = false;
        };
      })(this));
      this.View.component('play').addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.Vy.play();
        };
      })(this));
      this.View.component('pause').addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          if (Events.MovingSlider) {
            _this.Vy.seekToPercent(_this.Vy.getSeekPercent(e.clientX));
            _this.Vy.play();
          } else {
            _this.Vy.pause();
          }
          ActiveEvents.MovingSlider = false;
          return ActiveEvents.MouseDownOnVideo = false;
        };
      })(this));
      this.View.component('pause').addEventListener('mousedown', (function(_this) {
        return function(e) {
          e.preventDefault();
          return ActiveEvents.MouseDownOnVideo = true;
        };
      })(this));
      this.View.component('pause').addEventListener('mousemove', (function(_this) {
        return function(e) {
          var percent;
          e.preventDefault();
          if (ActiveEvents.MouseDownOnVideo) {
            ActiveEvents.MovingSlider = true;
            percent = _this.Vy.getSeekPercent(e.clientX);
            _this.Vy.seekToPercent(percent);
            return _this.Vy.movePlaySliderToPercent(percent);
          }
        };
      })(this));
      this.View.component('player').addEventListener('progress', (function(_this) {
        return function(e) {
          var currentPercent, ref;
          currentPercent = (ref = _this.buffered) != null ? ref.end(0) : void 0;
          if (currentPercent !== _this.duration) {
            return _this.Vy.moveLoadSliderToPercent(currentPercent);
          }
        };
      })(this));
      this.View.component('rewind').addEventListener('click', (function(_this) {
        return function(e) {
          e.stopPropagation();
          return _this.Vy.seekToDuration(0);
        };
      })(this));
      this.View.component('sound').addEventListener('click', (function(_this) {
        return function(e) {
          e.stopPropagation();
          return _this.Vy.toggleMute();
        };
      })(this));
      this.View.component('player').addEventListener('play', (function(_this) {
        return function(e) {
          return _this.Vy.setAsPlaying();
        };
      })(this));
      this.View.component('player').addEventListener('pause', (function(_this) {
        return function(e) {
          return _this.Vy.setAsPaused();
        };
      })(this));
      this.View.component('player').addEventListener('currenttimeupdate', (function(_this) {
        return function(e) {
          return _this.Vy.movePlaySliderToPercent(_this.Vy.getCurrentTimePercent());
        };
      })(this));
      return setInterval((function(_this) {
        return function() {
          if (_this.Vy.isPlaying()) {
            return _this.Vy.trigger('currenttimeupdate');
          }
        };
      })(this), 20);
    };

    return Events;

  })();

  View = (function() {
    var buttonStructure, vyStructure;

    vyStructure = '<div class="vy"> <div class="vy-title"></div> <div class="vy-positioner"> <video class="vy-placeholder"></video> </div> <div class="vy-controls"> <div class="vy-play"></div> <div class="vy-pause"></div> <div class="vy-buttons vy-buttons-left"></div> <div class="vy-buttons vy-buttons-right"></div> <div class="vy-play-slider"></div> <div class="vy-load-slider"></div> </div> </div>';

    buttonStructure = '<div class="vy-button"></div>';

    function View(original_video, settings) {
      this.componentCache = {};
      this.root = this.buildPlayer(original_video, settings);
      this.insertButtons(settings.buttons);
      this.insertTitle(settings.title);
    }

    View.prototype.buildPlayer = function(original_video, settings) {
      var placeholder, player, vy;
      player = original_video.cloneNode(true);
      player.classList.add('vy-player');
      vy = createElementFromString(vyStructure, true);
      placeholder = vy.querySelector('video.vy-placeholder');
      placeholder.parentNode.replaceChild(player, placeholder);
      original_video.parentNode.replaceChild(vy, original_video);
      return vy;
    };

    View.prototype.insertButtons = function(buttons) {
      var button, buttonElement, buttonScaffold, group, j, len, ref, results, wrap;
      buttonScaffold = createElementFromString(buttonStructure);
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

    View.prototype.insertTitle = function(title) {
      if (title != null ? title.length : void 0) {
        return this.component("title").textContent = title;
      }
    };

    View.prototype.component = function(name, o) {
      var comp;
      if (o == null) {
        o = true;
      }
      if (name in this.componentCache) {
        return this.componentCache[name];
      } else {
        comp = name === 'root' ? this.root : this.root.querySelector(".vy-" + name);
        return this.componentCache[name] = comp;
      }
    };

    return View;

  })();

}).call(this);
