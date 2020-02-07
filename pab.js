function Pab({ style, html, script, definitions }) {
    this.script = script
    this.style = style
    this.html = html
    this.definitions = definitions
}

Pab.prototype.build = function () {
    document.querySelector('#root').innerHTML = this.genStatic(this)
    this.script(
        this.definitions,
        {
            setState: this.setState.bind(this),
            onClick: this.onClick.bind(this)
        }
    )
}

Pab.prototype.genStatic = function (context) {
    return `
        <style>
            ${context.style}
        </style>
        <div>
            ${context.html(context.definitions)}
        </div>
    `
}

Pab.prototype.setState = function (key, value) {
    const prev = this.definitions[key]
    this.definitions[key] = value
    if (JSON.stringify(prev) !== JSON.stringify(value)) {
        this.build()
    }
    return prev
}

Pab.prototype.onClick = function (selector, callback) {
    document.querySelector(selector).addEventListener('click', callback)
}

const TestComponent = new Pab({
    definitions: {
        color: 'yellow'
    },
    script: ({ color }, { setState, onClick }) => {
        onClick('.red', () => {
            setState('color', color === 'yellow' ? 'red' : 'yellow')
        })
    },
    style: `
        #sind {
            background-color: red;
            color: white;
        }
    `,
    html: ({ color }) => {
        return `
            <div class="red">${color}</div>
        `
    }
})

TestComponent.build()