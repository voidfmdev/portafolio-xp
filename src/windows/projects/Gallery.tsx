import { useState } from 'react'
import { assetUrl } from '../../content/assetUrl'
import type { Project } from '../../content/schema'
import { icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import styles from './Gallery.module.css'

interface GalleryProps {
  images: Project['images']
  /** Employer or client project: never shows screenshots (spec §5.2). */
  restricted: boolean
}

/**
 * Screenshots of a project: one large image, arrows that wrap around, and
 * thumbnails (spec §5.2). Without images it shows a placeholder.
 */
export function Gallery({ images, restricted }: GalleryProps) {
  const { t, localize } = useI18n()
  const [index, setIndex] = useState(0)

  if (restricted || images.length === 0) {
    return (
      <div className={styles.placeholder}>
        <img className={styles.placeholderIcon} src={icons.document} alt="" />
        <p className={styles.placeholderText}>
          {t(restricted ? 'projects.restricted' : 'projects.galleryEmpty')}
        </p>
      </div>
    )
  }

  const total = images.length
  const image = images[Math.min(index, total - 1)]
  const position = (at: number) =>
    t('projects.galleryPosition', { current: at + 1, total })
  // The arrows wrap around, so they never become disabled and lose the focus.
  const step = (delta: number) => setIndex((index + delta + total) % total)

  return (
    <section className={styles.gallery} aria-label={t('projects.gallery')}>
      <div className={styles.stage}>
        {total > 1 && (
          <button
            type="button"
            className={styles.arrow}
            aria-label={t('projects.galleryPrevious')}
            onClick={() => step(-1)}
          >
            <img className={styles.arrowIcon} src={icons.back} alt="" />
          </button>
        )}
        <img
          className={styles.image}
          src={assetUrl(image.src)}
          alt={localize(image.alt)}
          loading="lazy"
        />
        {total > 1 && (
          <button
            type="button"
            className={styles.arrow}
            aria-label={t('projects.galleryNext')}
            onClick={() => step(1)}
          >
            <img className={styles.arrowIcon} src={icons.forward} alt="" />
          </button>
        )}
      </div>
      <p className={styles.position} aria-live="polite">
        {position(index)}
      </p>
      {total > 1 && (
        <ul className={styles.thumbnails}>
          {images.map((thumbnail, at) => (
            <li key={thumbnail.src}>
              <button
                type="button"
                className={styles.thumbnail}
                aria-label={position(at)}
                aria-current={at === index ? 'true' : undefined}
                onClick={() => setIndex(at)}
              >
                <img
                  className={styles.thumbnailImage}
                  src={assetUrl(thumbnail.src)}
                  alt=""
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
