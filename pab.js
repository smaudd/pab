function Pab({ style, template, script, definitions }) {
    this.script = script
    this.style = style
    this.template = template
    this.definitions = definitions
    this.build = function () {
        const root = document.querySelector('#root')
        const nodes = this.genStatic(this)
        let child = root.lastElementChild;
        while (child) {
            root.removeChild(child);
            child = root.lastElementChild;
        }
        nodes.forEach(node => {
            root.appendChild(node, node)
        })
        this.script(
            this.definitions,
            {
                setState: this.setState.bind(this),
                onClick: this.onClick.bind(this)
            }
        )
    }
}

Pab.prototype.htmlToElement = function (html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

Pab.prototype.toNodes = html =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes

Pab.prototype.parseTemplate = function (template, definitions) {
    const variables = template.match(/(?<={)(.*\n?)(?=})/g)
    let parsed = template
    variables.forEach(variable => {
        const replace = `{${variable}}`
        const regex = new RegExp(replace, 'g')
        parsed = parsed.replace(regex, definitions[variable])
    })
    return this.toNodes(parsed)
}

Pab.prototype.genStatic = function (context) {
    document.querySelector('style').innerHTML += this.style
    const template = this.parseTemplate(context.template, context.definitions)
    // return `
    //     <style>
    //         ${context.style}
    //     </style>
    //     <div>
    //         ${template}
    //     </div>
    // `
    return template
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
        color: 'yellow',
        patata: 'patata'
    },
    script: ({ color, patata }, { setState, onClick }) => {
        onClick('.red', () => {
            setState('color', color === 'yellow' ? 'red' : 'yellow')
        })

        onClick('.purple', () => {
            setState('patata', patata === 'blue' ? 'red' : 'blue')
        })
    },
    style: `
        .red, .purple {
            background-color: red;
            color: white;
        }
    `,
    template: `
        <div class="red">{color}</div>
        <div class="purple">{patata}</div>
    `
})

// const TestComponent2 = new Pab({
//     definitions: {
//         color: 'red'
//     },
//     script: ({ color }, { setState, onClick }) => {
//         onClick('.purple', () => {
//             setState('color', color === 'white' ? 'black' : 'white')
//         })
//     },
//     style: `
//         #sind {
//             background-color: red;
//             color: white;
//         }
//     `,
//     template: ({ color }) => {
//         return `
//             <div class="purple">${color}</div>
//         `
//     }
// })


TestComponent.build()
// TestComponent2.build()
