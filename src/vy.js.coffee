extend = (orig, items) ->
    for key, item of items
        orig[key] = item
    orig

createElementFromString = (string) ->
    temp = document.createElement 'div'
    temp.innerHTML = string
    return temp.childNodes[0]

offset = (elem) ->
    clientRect = elem.getBoundingClientRect()

    top: clientRect.top + window.pageYOffset
    left: clientRect.left + window.pageXOffset

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

    elapsedPercent: ->
        @elapsedSeconds() / player.duration

    elapsedSeconds: ->
        @View.component('player').currentTime

    jumpToPercent: (percent) ->
        player = @View.component('player')
        @jumpToSecond(percent * player.duration)

    jumpToSecond: (duration) ->
        @View.component('player').currentTime = duration

    rewind: ->
        @jumpToSecond(0)

    getSeekPercent: (mouseLeft) ->
        player = @View.component('player')
        (mouseLeft - offset(player).left) / player.offsetWidth

    play: -> @View.component('player').play()

    pause: -> @View.component('player').pause()

    mute: ->
        @View.component('player').setAttribute('muted', 'muted')
        @root.setAttribute('muted', 'muted')

    unmute: ->
        @View.component('player').removeAttribute('muted')
        @root.removeAttribute('muted')

    setAsPlaying: -> @View.root.setAttribute('playing', 'playing')

    setAsPaused: -> @View.root.removeAttribute('playing')

    isMuted: -> !!@View.component('player').getAttribute('muted')

    isPlaying: -> @View.root?.getAttribute('playing') is 'playing'

    toggleMute: -> if @isMuted() then @unmute() else @mute()

window.addEventListener 'load', (e) ->
    for video in document.querySelectorAll('.vy-video')
        settings = JSON.parse(video.getAttribute('data-vy-settings'))
        video.vy = new Vy(video, settings)

if $?
    $.fn.vy = (options = {}) ->
        @each (i, video) ->
            unless video.vy?
                video.vy = new Vy(video, options)
            return video
