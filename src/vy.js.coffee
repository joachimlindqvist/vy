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

    Events =
        MouseDownOnVideo: false,
        MovingSlider: false

    ControlsAnimationSpeed = 175

    constructor: (original_video, options = {}) ->

        settings =
            buttons:
                left: ['rewind'],
                right: ['sound']
        settings = extend settings, options

        @root = @buildPlayer original_video, settings
        @insertButtons settings.buttons
        @insertTitle settings.title

        @hook @root

        @root.addEventListener 'mouseleave', (e) =>
            Events.MovingSlider = false
            Events.MouseDownOnVideo = false

        @component('play', false).addEventListener 'click', (e) =>
            e.preventDefault()
            @play()

        @component('pause', false).addEventListener 'click', (e) =>
            e.preventDefault()

            if Events.MovingSlider
                @seekToPercent(@getSeekPercent(e.clientX))
                @play()
            else
                @pause()

            Events.MovingSlider = false;
            Events.MouseDownOnVideo = false;

        @component('pause', false).addEventListener 'mousedown', (e) =>
            e.preventDefault()
            Events.MouseDownOnVideo = true

        @component('pause', false).addEventListener 'mousemove', (e) =>
            e.preventDefault();

            if Events.MouseDownOnVideo
                Events.MovingSlider = true;
                percent = @getSeekPercent(e.clientX)
                @seekToPercent(percent);
                @movePlaySliderToPercent(percent);

        @component('player', false).addEventListener 'progress', (e) =>
            currentPercent = this.buffered?.end(0);
            if currentPercent isnt this.duration
                self.moveLoadSliderToPercent(currentPercent)

        @component('rewind', false).addEventListener 'click', (e) =>
            e.stopPropagation()
            @seekToDuration(0)

        @component('sound', false).addEventListener 'click', (e) =>
            e.stopPropagation()
            @toggleMute()

        @component('player', false).addEventListener 'play', (e) =>
            @setAsPlaying()
            @enableControls()

        @component('player', false).addEventListener 'pause', (e) =>
            @setAsPaused()
            @enableTitle()

        @component('player', false).addEventListener 'currenttimeupdate', (e) =>
            @movePlaySliderToPercent(@getCurrentTimePercent())

        setInterval =>
            if @isPlaying()
                currenttimeupdate = new Event('currenttimeupdate');
                @component('player', false).dispatchEvent(currenttimeupdate)
        , 20

    hook: (el) =>
        el.vy = this

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

    getCurrentTimePercent: ->
        player = @component('player', false)
        player.currentTime / player.duration

    movePlaySliderToPercent: (percent) ->
        @moveSliderToPercent @component('play-slider', false), percent

    moveLoadSliderToPercent: (percent) ->
        @moveSliderToPercent @component('load-slider', false), percent

    moveSliderToPercent: (slider, percent) ->
        percent = 1 if percent >= 1
        slider.style.right = "#{100 - (percent * 100)}%"

    seekToPercent: (percent) ->
        player = @component('player', false)
        @seekToDuration(percent * player.duration)

    seekToDuration: (duration) ->
        @component('player', false).currentTime = duration

    getSeekPercent: (mouseLeft) ->
        player = @component('player', false)
        (mouseLeft - offset(player).left) / player.width()

    play: -> @component('player', false).play()

    pause: -> @component('player', false).pause()

    mute: ->
        @component('player', false).setAttribute 'muted', 'muted'
        @root.setAttribute 'muted', 'muted'

    unmute: ->
        @component('player', false).removeAttribute 'muted'
        @root.removeAttribute 'muted'

    enablePauseButton: ->
        hide @component('play', false)
        show @component('pause', false)

    enablePlayButton: ->
        hide @component('pause', false)
        show @component('play', false)

    enableControls: ->
        title = @component('title', false)
        buttons = @component('buttons', false)

    enableTitle: ->
        title = @component('title', false)
        buttons = @component('buttons', false)

    setAsPlaying: -> @root.setAttribute 'playing', 'playing'

    setAsPaused: -> @root.removeAttribute 'playing'

    isMuted: -> !!@component('player', false).getAttribute('muted')

    isPlaying: -> @root?.getAttribute('playing') is 'playing'

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
