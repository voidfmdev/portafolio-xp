import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderSession } from '../../os/test-utils'

beforeEach(() => {
  localStorage.clear()
})

describe('RecycleBinWindow', () => {
  it('is empty', () => {
    renderSession({ initialApps: [{ id: 'recycle-bin' }] })
    const dialog = screen.getByRole('dialog', { name: 'Papelera de reciclaje' })
    expect(within(dialog).getByText('La papelera está vacía')).toBeVisible()
    expect(within(dialog).getByText('0 objetos')).toBeVisible()
  })

  it('follows the language', () => {
    renderSession({ lang: 'en', initialApps: [{ id: 'recycle-bin' }] })
    const dialog = screen.getByRole('dialog', { name: 'Recycle Bin' })
    expect(within(dialog).getByText('The Recycle Bin is empty')).toBeVisible()
    expect(within(dialog).getByText('0 objects')).toBeVisible()
  })
})
