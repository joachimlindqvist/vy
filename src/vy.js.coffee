class @Vy

    vyStructure = 
        '<div class="vy">
            <div class="vy-positioner">
                <video class="vy-placeholder"></video>
            </div>
            <div class="vy-controls">
                <div class="vy-play"></div>
                <div class="vy-pause"></div>
                <div class="vy-when-playing"></div>
                <div class="vy-when-hovering right-aligned"></div>
                <div class="vy-play-slider"></div>
                <div class="vy-load-slider"></div>
            </div>
        </div>'
    buttonStructure = '<div class="vy-button"></div>'

    Events = 
        MouseDownOnVideo: false,
        MovingSlider: false

    constructor: (original_video, options = {}) ->

        settings = 
            buttons:
                playing: ['rewind'],
                hovering: ['sound']
        settings = $.extend settings, options

        @root = @buildPlayer original_video, settings
        @root.data('vy', this);
        @insertButtons settings.buttons

        @root.on 'mouseleave', (e) =>
            Events.MovingSlider = false
            Events.MouseDownOnVideo = false

        @component('play').on 'click', (e) =>
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
                percent = @getSeekPercent(e.clientX)
                @seekToPercent(percent);
                @movePlaySliderToPercent(percent);

        @component('player').on 'progress', (e) => 
            currentPercent = this.buffered?.end(0);
            if currentPercent isnt this.duration
                self.moveLoadSliderToPercent(currentPercent)

        @component('rewind').on 'click', (e) =>
            e.stopPropagation()
            @seekToDuration(0)

        @component('sound').on 'click', (e) =>
            e.stopPropagation()
            @toggleMute()

        @component('player').on 'play', (e) =>
            @setAsPlaying()

        @component('player').on 'pause', (e) =>
            @setAsPaused()

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

            wrap = @component "when-#{group}"
            buttons[group].reverse() if wrap.hasClass 'right-aligned'

            for button in buttons[group]
                wrap.append $button.clone().addClass("vy-#{button}").text(button)

    component: (name) -> 
        @root.find ".vy-#{name}"

    getCurrentTimePercent: -> 
        player = @component('player').get(0)
        player.currentTime / player.duration

    movePlaySliderToPercent: (percent) ->
        percent = 1 if percent >= 1
        @component('play-slider').css 'right', "#{100 - (percent * 100)}%"

    moveLoadSliderToPercent: (percent) ->
        percent = 1 if percent >= 1
        @component('load-slider').css 'right', "#{100 - (percent * 100)}%"

    seekToPercent: (percent) -> 
        player = @component('player').get(0)
        @seekToDuration(percent * player.duration)

    seekToDuration: (duration) -> 
        player = @component('player').get(0)
        player.currentTime = duration

    getSeekPercent: (mouseLeft) ->
        player = @component('player')
        pos = player.offset()
        (mouseLeft - pos.left) / player.width()

    play: -> @component('player').get(0).play()

    pause: -> @component('player').get(0).pause()

    mute: ->
        @component('player').attr 'muted', 'muted'
        @root.attr 'muted', 'muted'

    unmute: ->
        @component('player').attr 'muted', null
        @root.attr 'muted', null

    enablePauseButton: ->
        @component('play').hide()
        @component('pause').show()
        @component('when-playing').show()

    enablePlayButton: ->
        @component('pause').hide()
        @component('play').show()
        @component('when-playing').hide()

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