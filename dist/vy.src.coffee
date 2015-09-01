extend = (orig, items) ->
    for key, item of items
        orig[key] = item
    orig

createElementFromString = (string) ->
    temp = document.createElement 'div'
    temp.innerHTML = string
    return temp.childNodes[0]

offset = (elem) ->
    alert 'implement offset()'



class @Vy

    constructor: (original_video, options = {}) ->

        settings =
            buttons:
                left: ['rewind'],
                right: ['sound']
        settings = extend settings, options

        View = new View(original_video, settings)
        Event = new Events(View)
        @hook View.root

    hook: (el) =>
        el.vy = this

    component: (name, o = true) ->
        if o
            $(View.root).find ".vy-#{name}"
        else
            View.root.querySelector ".vy-#{name}"

    getCurrentTimePercent: ->
        player = View.component('player', false)
        player.currentTime / player.duration

    movePlaySliderToPercent: (percent) ->
        @moveSliderToPercent View.component('play-slider', false), percent

    moveLoadSliderToPercent: (percent) ->
        @moveSliderToPercent View.component('load-slider', false), percent

    moveSliderToPercent: (slider, percent) ->
        percent = 1 if percent >= 1
        slider.style.right = "#{100 - (percent * 100)}%"

    seekToPercent: (percent) ->
        player = View.component('player', false)
        @seekToDuration(percent * player.duration)

    seekToDuration: (duration) ->
        View.component('player', false).currentTime = duration

    getSeekPercent: (mouseLeft) ->
        player = View.component('player', false)
        (mouseLeft - offset(player).left) / player.width()

    play: -> View.component('player', false).play()

    pause: -> View.component('player', false).pause()

    mute: ->
        View.component('player', false).setAttribute 'muted', 'muted'
        @root.setAttribute 'muted', 'muted'

    unmute: ->
        View.component('player', false).removeAttribute 'muted'
        @root.removeAttribute 'muted'

    enablePauseButton: ->
        hide View.component('play', false)
        show View.component('pause', false)

    enablePlayButton: ->
        hide View.component('pause', false)
        show View.component('play', false)

    setAsPlaying: -> View.root.setAttribute 'playing', 'playing'

    setAsPaused: -> View.root.removeAttribute 'playing'

    isMuted: -> !!View.component('player', false).getAttribute('muted')

    isPlaying: -> View.root?.getAttribute('playing') is 'playing'

    toggleMute: -> if @isMuted() then @unmute() else @mute()


window.addEventListener 'load', (e) ->
    for video in document.querySelectorAll '.vy-video'
        settings = JSON.parse video.getAttribute('data-vy-settings')
        video.vy = new Vy(video, settings)

if $?
    $.fn.vy = (options = {}) ->
        @each (i, video) ->
            unless video.vy?
                video.vy = new Vy(video, options)
            return video

class Events

    Events =
        MouseDownOnVideo: false,
        MovingSlider: false

    constructor: (View) ->
        @View = View
        @bind()

    bind: ->

        View.root.addEventListener 'mouseleave', (e) =>
            Events.MovingSlider = false
            Events.MouseDownOnVideo = false

        View.component('play', false).addEventListener 'click', (e) =>
            e.preventDefault()
            @play()

        View.component('pause', false).addEventListener 'click', (e) =>
            e.preventDefault()

            if Events.MovingSlider
                @seekToPercent(@getSeekPercent(e.clientX))
                @play()
            else
                @pause()

            Events.MovingSlider = false;
            Events.MouseDownOnVideo = false;

        View.component('pause', false).addEventListener 'mousedown', (e) =>
            e.preventDefault()
            Events.MouseDownOnVideo = true

        View.component('pause', false).addEventListener 'mousemove', (e) =>
            e.preventDefault();

            if Events.MouseDownOnVideo
                Events.MovingSlider = true;
                percent = @getSeekPercent(e.clientX)
                @seekToPercent(percent);
                @movePlaySliderToPercent(percent);

        View.component('player', false).addEventListener 'progress', (e) =>
            currentPercent = this.buffered?.end(0);
            if currentPercent isnt this.duration
                self.moveLoadSliderToPercent(currentPercent)

        View.component('rewind', false).addEventListener 'click', (e) =>
            e.stopPropagation()
            @seekToDuration(0)

        View.component('sound', false).addEventListener 'click', (e) =>
            e.stopPropagation()
            @toggleMute()

        View.component('player', false).addEventListener 'play', (e) =>
            @setAsPlaying()

        View.component('player', false).addEventListener 'pause', (e) =>
            @setAsPaused()

        View.component('player', false).addEventListener 'currenttimeupdate', (e) =>
            @movePlaySliderToPercent(@getCurrentTimePercent())

        setInterval =>
            if @isPlaying()
                currenttimeupdate = new Event('currenttimeupdate');
                View.component('player', false).dispatchEvent(currenttimeupdate)
        , 20

class View

    vyStructure =
        '<div class="vy">
            <div class="vy-title"></div>
            <div class="vy-positioner">
                <video class="vy-placeholder"></video>
            </div>
            <div class="vy-controls">
                <div class="vy-play"></div>
                <div class="vy-pause"></div>
                <div class="vy-buttons vy-buttons-left"></div>
                <div class="vy-buttons vy-buttons-right"></div>
                <div class="vy-play-slider"></div>
                <div class="vy-load-slider"></div>
            </div>
        </div>'
    buttonStructure = '<div class="vy-button"></div>'

    constructor: (original_video, settings) ->

        @root = @buildPlayer original_video, settings
        @insertButtons settings.buttons
        @insertTitle settings.title

    buildPlayer: (original_video, settings) ->

        player = original_video.cloneNode(true)
        player.classList.add('vy-player')

        vy = createElementFromString(vyStructure, true)
        placeholder = vy.querySelector('video.vy-placeholder')
        placeholder.parentNode.replaceChild(player, placeholder)

        original_video.parentNode.replaceChild(vy, original_video)

        return vy

    insertButtons: (buttons) ->

        buttonScaffold = createElementFromString buttonStructure

        for group in Object.keys buttons

            wrap = @component "buttons-#{group}", false
            buttons[group].reverse() if group == 'right'

            for button in buttons[group]
                buttonElement = buttonScaffold.cloneNode(true)
                buttonElement.classList.add "vy-#{button}"
                buttonElement.textContent = button
                wrap.appendChild buttonElement

    insertTitle: (title) ->
        @component("title", false).textContent = title if title?.length

    component: (name, o = true) ->
        if o
            $(@root).find ".vy-#{name}"
        else
            @root.querySelector ".vy-#{name}"
