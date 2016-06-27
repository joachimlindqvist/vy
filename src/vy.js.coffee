class @Vy

    vyStructure =
        '<div class="vy">
            <div class="vy-title"></div>
            <div class="vy-positioner">
                <video class="vy-placeholder"></video>
            </div>
            <div class="vy-controls">
                <div class="vy-play"></div>
                <div class="vy-pause">
                    <div class="uil-flickr-css">
                        <div></div><div></div>
                    </div>
                </div>
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
        settings = $.extend settings, options

        @root = @buildPlayer original_video, settings
        @root.data('vy', this);
        @insertButtons settings.buttons
        @insertTitle settings.title

        @root.on 'mouseleave', (e) =>
            Events.MovingSlider = false
            Events.MouseDownOnVideo = false

        @component('play').on 'click', (e) =>
            e.preventDefault()
            @play()

        @component('title').on 'click', (e) =>
            e.preventDefault()
            @play()

        @component('pause').on 'click', (e) =>
            e.preventDefault()
            if Events.MovingSlider
                @seekToPercent(@getSeekPercent(e.clientX))
                @play()
            else
                @pause()

            Events.MovingSlider = false;
            Events.MouseDownOnVideo = false;

        @component('pause').on 'mousedown', (e) =>
            e.preventDefault()
            Events.MouseDownOnVideo = true

        @component('pause').on 'mousemove', (e) =>
            e.preventDefault();

            if Events.MouseDownOnVideo
                Events.MovingSlider = true;
                @pause()
                percent = @getSeekPercent(e.clientX)
                @seekToPercent(percent)
                @movePlaySliderToPercent(percent)

        @component('player').on 'progress', (e) =>
            @moveLoadSliderToPercent(@getCurrentLoadPercent())

        @component('rewind').on 'click', (e) =>
            e.stopPropagation()
            @seekToDuration(0)

        @component('sound').on 'click', (e) =>
            e.stopPropagation()
            @toggleMute()

        @component('player').on 'play', (e) =>
            @setAsPlaying()
            @enableControls()

        @component('player').on 'pause', (e) =>
            if !Events.MovingSlider
                @setAsPaused()
                @enableTitle()

        @component('player').on 'currenttimeupdate', (e) =>
            @movePlaySliderToPercent(@getCurrentTimePercent())

        setInterval =>
            @component('player').trigger('currenttimeupdate') if @isPlaying()
        , 20

    buildPlayer: (original_video, settings) ->
        player = $(original_video).clone().addClass('vy-player')
        root = $(vyStructure).find('video.vy-placeholder').replaceWith(player).end()
        return root

    insertButtons: (buttons) ->

        $button = $(buttonStructure)

        for group in Object.keys buttons

            wrap = @component "buttons-#{group}"
            buttons[group].reverse() if group == 'right'

            for button in buttons[group]
                wrap.append $button.clone().addClass("vy-#{button}").text(button)

    insertTitle: (title) ->
        @component("title").text(title) if title?.length

    component: (name) ->
        @root.find ".vy-#{name}"

    getCurrentTimePercent: ->
        @currentTime() / @duration()

    getCurrentLoadPercent: ->
        @buffered() / @duration()

    timeLeft: ->
        @duration() - @currentTime()

    movePlaySliderToPercent: (percent) ->
        percent = 1 if percent >= 1
        @component('play-slider').css 'right', "#{100 - (percent * 100)}%"

    moveLoadSliderToPercent: (percent) ->
        percent = 1 if percent >= 1
        @component('load-slider').css 'right', "#{100 - (percent * 100)}%"

    seekToPercent: (percent) ->
        @seekToDuration(percent * @rawPlayer().duration)

    seekToDuration: (duration) ->
        @rawPlayer().currentTime = duration

    getSeekPercent: (mouseLeft) ->
        player = @component('player')
        pos = player.offset()
        (mouseLeft - pos.left) / player.width()

    rawPlayer: ->
        @component('player').get(0)

    buffered: ->
        return 0 if @rawPlayer().buffered.length == 0
        @rawPlayer().buffered.end(0)

    duration: ->
        @rawPlayer().duration

    currentTime: ->
        @rawPlayer().currentTime

    play: -> @component('player').get(0).play()

    pause: -> @component('player').get(0).pause()

    mute: ->
        @component('player').attr 'muted', 'muted'
        @root.attr 'muted', 'muted'

    unmute: ->
        @component('player').attr 'muted', null
        @root.attr 'muted', null

    enableControls: ->
        title = @component('title')
        buttons = @component('buttons')
        title.animate(
            bottom: "#{(-1 * title.height())}px",
            ControlsAnimationSpeed,
            'swing',
            -> buttons.animate(bottom: '0em', ControlsAnimationSpeed)
        )

    enableTitle: ->
        title = @component('title')
        buttons = @component('buttons')
        buttons.animate(
            bottom: "#{(-1 * buttons.height())}px",
            ControlsAnimationSpeed,
            'swing',
            -> title.animate(bottom: '1em', ControlsAnimationSpeed)
        )

    setAsPlaying: -> @root.attr 'playing', 'playing'

    setAsPaused: -> @root.attr 'playing', null

    isMuted: -> !!@component('player').attr('muted')

    isPlaying: -> @root[0]?.getAttribute('playing') is 'playing'

    toggleMute: ->
        if @isMuted() then @unmute() else @mute()

$.fn.vy = (options = {}) ->
    @each (i, video) ->
        $video = $(video);
        unless $video.data('vy')?
            vy = new Vy($(video)[0], options)
            $video.replaceWith vy.root
            video = vy.root[0]
        return video

$ ->
    $('.vy-video').each (i, video) ->
        $video = $(video)
        options = $video.data('vy-settings') || {}
        $video.vy options
