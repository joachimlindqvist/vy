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

        @View = new View(original_video, settings)
        @Events = new Events(this, @View)
        @hook @View.component('root')

    hook: (el) =>
        el.vy = this

    getCurrentTimePercent: ->
        player = @View.component('player')
        player.currentTime / player.duration

    movePlaySliderToPercent: (percent) ->
        @moveSliderToPercent(@View.component('play-slider'), percent)

    moveLoadSliderToPercent: (percent) ->
        @moveSliderToPercent(@View.component('load-slider'), percent)

    moveSliderToPercent: (slider, percent) ->
        percent = 1 if percent >= 1
        slider.style.right = "#{100 - (percent * 100)}%"

    seekToPercent: (percent) ->
        player = @View.component('player')
        @seekToDuration(percent * player.duration)

    seekToDuration: (duration) ->
        @View.component('player').currentTime = duration

    getSeekPercent: (mouseLeft) ->
        player = @View.component('player')
        (mouseLeft - offset(player).left) / player.width()

    play: -> @View.component('player').play()

    pause: -> @View.component('player').pause()

    mute: ->
        @View.component('player').setAttribute('muted', 'muted')
        @root.setAttribute('muted', 'muted')

    unmute: ->
        @View.component('player').removeAttribute('muted')
        @root.removeAttribute('muted')

    enablePauseButton: ->
        hide @View.component('play')
        show @View.component('pause')

    enablePlayButton: ->
        hide @View.component('pause')
        show @View.component('play')

    setAsPlaying: -> @View.root.setAttribute('playing', 'playing')

    setAsPaused: -> @View.root.removeAttribute('playing')

    isMuted: -> !!@View.component('player').getAttribute('muted')

    isPlaying: -> @View.root?.getAttribute('playing') is 'playing'

    toggleMute: -> if @isMuted() then @unmute() else @mute()

    trigger: (eventName) ->
        @View.component('player').dispatchEvent(new Event(eventName))


window.addEventListener 'load', (e) ->
    for video in document.querySelectorAll('.vy-video')
        settings = JSON.parse video.getAttribute('data-vy-settings')
        video.vy = new Vy(video, settings)

if $?
    $.fn.vy = (options = {}) ->
        @each (i, video) ->
            unless video.vy?
                video.vy = new Vy(video, options)
            return video
