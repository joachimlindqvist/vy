class Slider extends Component

    build: (name) ->
        "<div class='vy-#{name}-slider'></div>"

    moveToPercent: (percent) ->
        percent = 1 if percent >= 1
        @root.style.right = "#{100 - (percent * 100)}%"
