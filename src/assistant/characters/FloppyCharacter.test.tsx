import { fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferencesProvider } from '../../app/PreferencesProvider'
import { PREFERENCE_KEYS } from '../../app/preferences'
import { storage } from '../../lib/storage'
import { CHARACTER_ANIMATIONS, type CharacterAnimation } from '../Character'
import { FloppyCharacter } from './FloppyCharacter'

beforeEach(() => {
  localStorage.clear()
})

function renderFloppy(animation: CharacterAnimation, onDone = vi.fn()) {
  const result = render(
    <PreferencesProvider>
      <FloppyCharacter animation={animation} onDone={onDone} />
    </PreferencesProvider>,
  )
  const svg = result.container.querySelector('svg')!
  return { ...result, svg, figure: svg.firstElementChild!, onDone }
}

describe('FloppyCharacter', () => {
  it('is decorative: the balloon carries the words', () => {
    const { svg } = renderFloppy('idle')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
  })

  it.each(CHARACTER_ANIMATIONS)('takes the "%s" pose', (animation) => {
    const { svg } = renderFloppy(animation)
    expect(svg).toHaveAttribute('data-animation', animation)
  })

  it('reports the end of greet and hide, not of the loops inside it', () => {
    const { figure, onDone, rerender } = renderFloppy('greet')
    fireEvent.animationEnd(figure.querySelector('g')!)
    expect(onDone).not.toHaveBeenCalled()

    fireEvent.animationEnd(figure)
    expect(onDone).toHaveBeenCalledWith('greet')

    rerender(
      <PreferencesProvider>
        <FloppyCharacter animation="hide" onDone={onDone} />
      </PreferencesProvider>,
    )
    fireEvent.animationEnd(figure)
    expect(onDone).toHaveBeenLastCalledWith('hide')
  })

  it('does not report the loops', () => {
    const { figure, onDone } = renderFloppy('talk')
    fireEvent.animationEnd(figure)
    expect(onDone).not.toHaveBeenCalled()
  })

  it('stands still with "Reduce animations" and ends greet and hide at once', () => {
    storage.set(PREFERENCE_KEYS.reduceMotion, 'true')
    const { svg, onDone } = renderFloppy('hide')
    expect(svg).toHaveAttribute('data-motion', 'reduced')
    expect(onDone).toHaveBeenCalledWith('hide')
  })

  it('moves when nothing asks for less motion', () => {
    const { svg, onDone } = renderFloppy('greet')
    expect(svg).toHaveAttribute('data-motion', 'full')
    expect(onDone).not.toHaveBeenCalled()
  })
})
