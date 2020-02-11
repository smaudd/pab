function PabDOM() {}

PabDOM.prototype.render = function (component, selector) {
    const root = document.querySelector(selector)
    let child = root.lastElementChild;
    while (child) {
        root.removeChild(child);
        child = root.lastElementChild;
    }
    const { context, nodes } = component
    nodes.forEach(node => {
        root.appendChild(node)
    })
    context.render()
    this.update()
}

PabDOM.prototype.reRender = function (component, selector) {
    const root = document.querySelector(selector).parentElement
    let child = root.lastElementChild;
    while (child) {
        root.removeChild(child);
        child = root.lastElementChild;
    }
    component.nodes.forEach(node => {
        root.appendChild(node)
    })
}

PabDOM.prototype.update = function () {
    document.body.addEventListener('update', (e) => {
        const component = e.detail
        const { template, pabThree, definitions } = e.detail
        const cmp = component.parseTemplate(template, definitions)
        this.reRender(cmp, `[pab-three=${component.pabThree}`)
        cmp.context.render()
    })
}

function Pab({ style, template, script, definitions }) {
    this.script = script
    this.style = style
    this.template = template
    this.definitions = definitions
    return this.parseTemplate(template, definitions)
}

Pab.prototype.render = function() {
    this.script(
        this.definitions,
        {
            setState: this.setState.bind(this),
            onClick: this.onClick.bind(this)
        }
    )
}

Pab.prototype.toNodes = html =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes

Pab.prototype.parseTemplate = function (template, definitions) {
    const variables = template.match(/(?<={)(.*\n?)(?=})/g)
    if (!variables.find(v => v.includes('nodes'))) {
        let parsed = template
        variables.forEach(variable => {
            const replace = `{${variable}}`
            const regex = new RegExp(replace, 'g')
            parsed = parsed.replace(regex, definitions[variable])
        })
        const nodes = this.toNodes(parsed)
        this.pabThree = Math.random()
        nodes[0].setAttribute('pab-three', this.pabThree)
        return {
            nodes, context: this
        }
    }
    console.log('NO INCLUYE', variables)
    return {
        nodes: this.toNodes(template),
        context: this,
    }
}

Pab.prototype.emit = function () {
    const event = new CustomEvent('update', { detail: this })
    document.body.dispatchEvent(event)
}

Pab.prototype.setState = function (key, value) {
    const prev = this.definitions[key]
    this.definitions[key] = value
    if (JSON.stringify(prev) !== JSON.stringify(value)) {
        this.emit()
    }
    return prev
}

Pab.prototype.onClick = function (selector, callback) {
    document.querySelector(selector).addEventListener('click', callback)
}


const TestComponent2 = new Pab({
    definitions: {
        dogName: 'canopillo',
    },
    script: ({ dogName }, { setState, onClick }) => {
        console.log('SCRIPT CALLED')
        onClick('.canopillo', () => {
            setState('dogName', dogName === 'blue' ? 'red' : 'blue')
        })
    },
    style: `
    `,
    template: `
        <div class="canopillo">{canopillo}</div>
    `
})

console.log(TestComponent2)

const TestComponent = new Pab({
    definitions: {
        color: 'yellow',
    },
    script: ({ color }, { setState, onClick }) => {
        console.log('SCRIPT CALLED')
        onClick('.yellow', () => {
            setState('color', color === 'blue' ? 'red' : 'blue')
        })
    },
    style: `
        .red, .purple {
            background-color: red;
            color: white;
        }
    `,
    template: `
        <div class="yellow">${JSON.stringify(TestComponent2)}</div>
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

const DOM = new PabDOM()

DOM.render(TestComponent, '#root')
// TestComponent2.build()
