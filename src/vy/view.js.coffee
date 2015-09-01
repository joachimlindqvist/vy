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

        @componentCache = {}

        @root = @buildPlayer(original_video, settings)
        @insertButtons(settings.buttons)
        @insertTitle(settings.title)

    buildPlayer: (original_video, settings) ->

        player = original_video.cloneNode(true)
        player.classList.add('vy-player')

        vy = createElementFromString(vyStructure, true)
        placeholder = vy.querySelector('video.vy-placeholder')
        placeholder.parentNode.replaceChild(player, placeholder)

        original_video.parentNode.replaceChild(vy, original_video)

        return vy

    insertButtons: (buttons) ->

        buttonScaffold = createElementFromString(buttonStructure)

        for group in Object.keys(buttons)

            wrap = @component("buttons-#{group}")
            buttons[group].reverse() if group == 'right'

            for button in buttons[group]
                buttonElement = buttonScaffold.cloneNode(true)
                buttonElement.classList.add("vy-#{button}")
                buttonElement.textContent = button
                wrap.appendChild(buttonElement)

    insertTitle: (title) ->
        @component("title").textContent = title if title?.length

    component: (name, o = true) ->
        if name of @componentCache
            @componentCache[name]
        else
            comp = if name == 'root' then @root else @root.querySelector(".vy-#{name}")
            @componentCache[name] = comp
