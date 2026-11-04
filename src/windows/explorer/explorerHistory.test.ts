import { describe, expect, it } from 'vitest'
import {
  canGoBack,
  canGoForward,
  currentEntry,
  EMPTY_HISTORY,
  goBack,
  goForward,
  visit,
} from './explorerHistory'

const visited = (...entries: string[]) => entries.reduce(visit, EMPTY_HISTORY)

describe('explorerHistory', () => {
  it('starts empty, with nowhere to go', () => {
    expect(currentEntry(EMPTY_HISTORY)).toBeUndefined()
    expect(canGoBack(EMPTY_HISTORY)).toBe(false)
    expect(canGoForward(EMPTY_HISTORY)).toBe(false)
  })

  it('records each new item and can go back to the previous ones', () => {
    const history = visited('a', 'b', 'c')
    expect(currentEntry(history)).toBe('c')
    expect(canGoBack(history)).toBe(true)
    expect(canGoForward(history)).toBe(false)
    expect(currentEntry(goBack(goBack(history)))).toBe('a')
  })

  it('does not record the item on screen twice', () => {
    const history = visited('a')
    expect(visit(history, 'a')).toBe(history)
  })

  it('goes forward again after going back', () => {
    const back = goBack(visited('a', 'b'))
    expect(currentEntry(back)).toBe('a')
    expect(canGoForward(back)).toBe(true)
    expect(currentEntry(goForward(back))).toBe('b')
  })

  it('drops the forward items when another one is shown after going back', () => {
    const history = visit(goBack(visited('a', 'b')), 'c')
    expect(history.entries).toEqual(['a', 'c'])
    expect(canGoForward(history)).toBe(false)
  })

  it('stays put at either end', () => {
    const history = visited('a')
    expect(goBack(history)).toBe(history)
    expect(goForward(history)).toBe(history)
  })
})
