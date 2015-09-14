class Events

    ActiveEvents =
        MouseDownOnVideo: false,
        MovingSlider: false

    constructor: (Vy, View) ->
        @View = View
        @Vy = Vy
        @init()

    trigger: (eventName) ->
        @View.component('player').dispatchEvent(new Event(eventName))

    init: ->

        @View.component('root').addEventListener('mouseleave', (e) =>
            ActiveEvents.MovingSlider = false
            ActiveEvents.MouseDownOnVideo = false
        )

        @View.component('play').addEventListener('click', (e) =>
            e.preventDefault()
            @Vy.play()
        )

        @View.component('pause').addEventListener('click', (e) =>
            e.preventDefault()

            if Events.MovingSlider
                @Vy.jumpToPercent(@Vy.getSeekPercent(e.clientX))
                @Vy.play()
            else
                @Vy.pause()

            ActiveEvents.MovingSlider = false;
            ActiveEvents.MouseDownOnVideo = false;
        )

        @View.component('pause').addEventListener('mousedown', (e) =>
            e.preventDefault()
            ActiveEvents.MouseDownOnVideo = true
        )

        @View.component('pause').addEventListener('mousemove', (e) =>
            e.preventDefault();

            if ActiveEvents.MouseDownOnVideo
                ActiveEvents.MovingSlider = true;
                percent = @Vy.getSeekPercent(e.clientX)
                @Vy.jumpToPercent(percent);
                @Vy.movePlaySliderToPercent(percent);
        )

        @View.component('player').addEventListener('progress', (e) =>
            currentPercent = this.buffered?.end(0);
            if currentPercent isnt this.duration
                @Vy.moveLoadSliderToPercent(currentPercent)
        )

        @View.component('rewind').addEventListener('click', (e) =>
            e.stopPropagation()
            @Vy.rewind()
        )

        @View.component('sound').addEventListener('click', (e) =>
            e.stopPropagation()
            @Vy.toggleMute()
        )

        @View.component('player').addEventListener('play', (e) =>
            @Vy.setAsPlaying()
        )

        @View.component('player').addEventListener('pause', (e) =>
            @Vy.setAsPaused()
        )

        @View.component('player').addEventListener('currenttimeupdate', (e) =>
            @Vy.movePlaySliderToPercent(@Vy.elapsedPercent())
        )

        setInterval( =>
                if @Vy.isPlaying() then @trigger 'currenttimeupdate'
            , 20
        )
