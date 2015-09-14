class Title extends Component

    build: ->
        "<div class='vy-title'></div>"

    set: (title) ->
        @title = title
        @root.textContent = title
