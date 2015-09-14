(function() {
  var Buttons, Component, Controls, Events, Pause, Placeholder, Play, Positioner, Slider, Title, View, createElementFromString, extend, offset,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
    var clientRect;
    clientRect = elem.getBoundingClientRect();
    return {
      top: clientRect.top + window.pageYOffset,
      left: clientRect.left + window.pageXOffset
    };
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

    Vy.prototype.elapsedPercent = function() {
      return this.elapsedSeconds() / player.duration;
    };

    Vy.prototype.elapsedSeconds = function() {
      return this.View.component('player').currentTime;
    };

    Vy.prototype.jumpToPercent = function(percent) {
      var player;
      player = this.View.component('player');
      return this.jumpToSecond(percent * player.duration);
    };

    Vy.prototype.jumpToSecond = function(duration) {
      return this.View.component('player').currentTime = duration;
    };

    Vy.prototype.rewind = function() {
      return this.jumpToSecond(0);
    };

    Vy.prototype.getSeekPercent = function(mouseLeft) {
      var player;
      player = this.View.component('player');
      return (mouseLeft - offset(player).left) / player.offsetWidth;
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

  Component = (function() {
    function Component(name) {
      this.root = this.build(name);
    }

    Component.prototype.toString = function() {
      return this.root.toString();
    };

    return Component;

  })();

  Buttons = (function(superClass) {
    extend1(Buttons, superClass);

    function Buttons() {
      return Buttons.__super__.constructor.apply(this, arguments);
    }

    Buttons.prototype.build = function(name) {
      return "<div class='vy-buttons vy-buttons-" + name + "'></div>";
    };

    return Buttons;

  })(Component);

  Controls = (function(superClass) {
    extend1(Controls, superClass);

    function Controls() {
      return Controls.__super__.constructor.apply(this, arguments);
    }

    Controls.prototype.build = function() {
      return "<div class='vy-controls'></div>";
    };

    return Controls;

  })(Component);

  Pause = (function(superClass) {
    extend1(Pause, superClass);

    function Pause() {
      return Pause.__super__.constructor.apply(this, arguments);
    }

    Pause.prototype.build = function() {
      return "<div class='vy-pause'></div>";
    };

    return Pause;

  })(Component);

  Placeholder = (function(superClass) {
    extend1(Placeholder, superClass);

    function Placeholder() {
      return Placeholder.__super__.constructor.apply(this, arguments);
    }

    Placeholder.prototype.build = function() {
      return "<div class='vy-placeholder'></div>";
    };

    return Placeholder;

  })(Component);

  Play = (function(superClass) {
    extend1(Play, superClass);

    function Play() {
      return Play.__super__.constructor.apply(this, arguments);
    }

    Play.prototype.build = function() {
      return "<div class='vy-play'></div>";
    };

    return Play;

  })(Component);

  Positioner = (function(superClass) {
    extend1(Positioner, superClass);

    function Positioner() {
      return Positioner.__super__.constructor.apply(this, arguments);
    }

    Positioner.prototype.build = function() {
      return "<div class='vy-positioner'></div>";
    };

    return Positioner;

  })(Component);

  Slider = (function(superClass) {
    extend1(Slider, superClass);

    function Slider() {
      return Slider.__super__.constructor.apply(this, arguments);
    }

    Slider.prototype.build = function(name) {
      return "<div class='vy-" + name + "-slider'></div>";
    };

    Slider.prototype.moveToPercent = function(percent) {
      if (percent >= 1) {
        percent = 1;
      }
      return this.root.style.right = (100 - (percent * 100)) + "%";
    };

    return Slider;

  })(Component);

  Title = (function(superClass) {
    extend1(Title, superClass);

    function Title() {
      return Title.__super__.constructor.apply(this, arguments);
    }

    Title.prototype.build = function() {
      return "<div class='vy-title'></div>";
    };

    Title.prototype.set = function(title) {
      this.title = title;
      return this.root.textContent = title;
    };

    return Title;

  })(Component);

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

    Events.prototype.trigger = function(eventName) {
      return this.View.component('player').dispatchEvent(new Event(eventName));
    };

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
            _this.Vy.jumpToPercent(_this.Vy.getSeekPercent(e.clientX));
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
            _this.Vy.jumpToPercent(percent);
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
          return _this.Vy.rewind();
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
          return _this.Vy.movePlaySliderToPercent(_this.Vy.elapsedPercent());
        };
      })(this));
      return setInterval((function(_this) {
        return function() {
          if (_this.Vy.isPlaying()) {
            return _this.trigger('currenttimeupdate');
          }
        };
      })(this), 20);
    };

    return Events;

  })();

  View = (function() {
    var buttonStructure, vyStructure;

    vyStructure = "<div class='vy'> <div class='vy-title'></div> <div class='vy-positioner'> <video class='vy-placeholder'></video> </div> <div class='vy-controls'> <div class='vy-play'></div> <div class='vy-pause'></div> <div class='vy-buttons vy-buttons-left'></div> <div class='vy-buttons vy-buttons-right'></div <div class='vy-play-slider'></div> <div class='vy-load-slider'></div> </div> </div>";

    buttonStructure = '<div class="vy-button"></div>';

    function View(original_video, settings) {
      this.componentCache = {};
      console.log(this.buildComponentTree());
      return;
      this.root = this.buildPlayer(original_video, settings);
      this.insertButtons(settings.buttons);
      this.insertTitle(settings.title);
    }

    View.prototype.buildComponentTree = function() {
      [['title', new Title(), [['positioner', new Positioner()]]], ['placeholder', new Placeholder()], ['controls', new Controls()], ['play', new Play()], ['pause', new Pause()], ['buttonsLeft', new Buttons('left')], ['buttonsRight', new Buttons('right')], ['playSlider', new Slider('play')], ['loadSlider', new Slider('load')]];
      return [
        {
          title: new Title,
          children: {
            positioner: new Positioner(),
            children: {
              placeholder: new Placeholder()
            }
          }
        }
      ];
    };

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
