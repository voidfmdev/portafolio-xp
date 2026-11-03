import { afterEach, describe, expect, it } from 'vitest'
import { keepTabInside, tabbableElements } from './a11y'

function setup(html: string): HTMLElement {
  const container = document.createElement('div')
  container.tabIndex = -1
  container.innerHTML = html
  document.body.append(container)
  return container
}

function tab(container: HTMLElement, shiftKey = false) {
  let prevented = false
  keepTabInside(
    { key: 'Tab', shiftKey, preventDefault: () => (prevented = true) },
    container,
  )
  return prevented
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('tabbableElements', () => {
  it('lists what Tab reaches and skips disabled, hidden and tabindex=-1', () => {
    const container = setup(`
      <button id="a">a</button>
      <button disabled>b</button>
      <a href="#x" id="c">c</a>
      <a>no href</a>
      <div tabindex="-1">d</div>
      <div hidden><button>e</button></div>
      <input id="f" />
      <input type="hidden" />
    `)
    expect(tabbableElements(container).map((element) => element.id)).toEqual([
      'a',
      'c',
      'f',
    ])
  })
})

describe('keepTabInside', () => {
  it('wraps Tab from the last element to the first, and Shift+Tab back', () => {
    const container = setup('<button>first</button><button>last</button>')
    const [first, last] = Array.from(container.querySelectorAll('button'))

    last.focus()
    expect(tab(container)).toBe(true)
    expect(document.activeElement).toBe(first)

    expect(tab(container, true)).toBe(true)
    expect(document.activeElement).toBe(last)
  })

  it('goes to the last element on Shift+Tab from the container itself', () => {
    const container = setup('<button>first</button><button>last</button>')
    container.focus()
    tab(container, true)
    expect(document.activeElement).toBe(container.querySelectorAll('button')[1])
  })

  it('leaves Tab alone between elements', () => {
    const container = setup('<button>first</button><button>last</button>')
    container.querySelector('button')?.focus()
    expect(tab(container)).toBe(false)
  })

  it('keeps the focus on the container when nothing inside can take it', () => {
    const container = setup('<p>text</p>')
    container.focus()
    expect(tab(container)).toBe(true)
    expect(document.activeElement).toBe(container)
  })
})
