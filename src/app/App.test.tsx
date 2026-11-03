import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('mounts without rendering anything yet', () => {
    const { container } = render(<App />)
    expect(container).toBeEmptyDOMElement()
  })
})
