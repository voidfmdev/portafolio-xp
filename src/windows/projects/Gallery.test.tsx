import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n/I18nProvider'
import { LANG_STORAGE_KEY } from '../../i18n/initialLang'
import { storage } from '../../lib/storage'
import { Gallery } from './Gallery'

const image = (name: string) => ({
  src: `projects/${name}.webp`,
  alt: { es: `Captura ${name}`, en: `Screenshot ${name}` },
})

function renderGallery(images: ReturnType<typeof image>[], restricted = false) {
  return render(
    <I18nProvider>
      <Gallery images={images} restricted={restricted} />
    </I18nProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  storage.set(LANG_STORAGE_KEY, 'es')
})

describe('Gallery', () => {
  it('shows the first image, lazily loaded, with its position', () => {
    renderGallery([image('a'), image('b'), image('c')])
    const shown = screen.getByRole('img', { name: 'Captura a' })
    expect(shown).toHaveAttribute('src', '/projects/a.webp')
    expect(shown).toHaveAttribute('loading', 'lazy')
    expect(screen.getByText('Imagen 1 de 3')).toBeVisible()
  })

  it('moves with the arrows and wraps around at both ends', () => {
    renderGallery([image('a'), image('b'), image('c')])
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }))
    expect(screen.getByRole('img', { name: 'Captura b' })).toBeVisible()

    const previous = screen.getByRole('button', { name: 'Imagen anterior' })
    fireEvent.click(previous)
    fireEvent.click(previous)
    expect(screen.getByRole('img', { name: 'Captura c' })).toBeVisible()
    expect(screen.getByText('Imagen 3 de 3')).toBeVisible()
  })

  it('jumps to an image from its thumbnail', () => {
    renderGallery([image('a'), image('b'), image('c')])
    const thumbnail = screen.getByRole('button', { name: 'Imagen 2 de 3' })
    fireEvent.click(thumbnail)
    expect(screen.getByRole('img', { name: 'Captura b' })).toBeVisible()
    expect(thumbnail).toHaveAttribute('aria-current', 'true')
  })

  it('has no arrows or thumbnails for a single image', () => {
    renderGallery([image('a')])
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows a placeholder without images', () => {
    renderGallery([])
    expect(screen.getByText('Sin capturas')).toBeVisible()
  })

  it('never shows screenshots of a restricted project', () => {
    renderGallery([image('a')], true)
    expect(screen.queryByRole('img', { name: 'Captura a' })).toBeNull()
    expect(
      screen.getByText(
        'Proyecto de empleador o cliente: sin capturas por confidencialidad',
      ),
    ).toBeVisible()
  })
})
