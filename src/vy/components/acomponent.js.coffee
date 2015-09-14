class Component

    constructor: (name) ->
        @root = @build(name)

    toString: ->
        @root.toString()
