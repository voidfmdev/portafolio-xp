import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../app/useReducedMotion'
import { ONE_SHOT_ANIMATIONS, type CharacterProps } from '../Character'
import styles from './FloppyCharacter.module.css'

/**
 * Floppy (D5): an own 3.5" floppy disk with eyes, drawn in SVG. The shapes live
 * here; colors, poses and motion live in its CSS Module.
 */
export function FloppyCharacter({
  animation,
  onDone,
  className,
}: CharacterProps) {
  const reducedMotion = useReducedMotion()
  const figureRef = useRef<SVGGElement>(null)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  // Nothing moves with reduced motion, so a one-shot animation is over at once.
  useEffect(() => {
    if (reducedMotion && ONE_SHOT_ANIMATIONS.has(animation)) {
      onDoneRef.current?.(animation)
    }
  }, [animation, reducedMotion])

  // Listened to on the figure itself: the eyes, mouth and shutter loop inside it
  // and their events bubble up, but only the whole figure's greet and hide end.
  useEffect(() => {
    const figure = figureRef.current
    if (!figure || !ONE_SHOT_ANIMATIONS.has(animation)) return
    function onAnimationEnd(event: Event) {
      if (event.target === figure) onDoneRef.current?.(animation)
    }
    figure.addEventListener('animationend', onAnimationEnd)
    return () => figure.removeEventListener('animationend', onAnimationEnd)
  }, [animation])

  return (
    <svg
      viewBox="0 0 64 64"
      className={[styles.floppy, className].filter(Boolean).join(' ')}
      data-animation={animation}
      data-motion={reducedMotion ? 'reduced' : 'full'}
      aria-hidden="true"
      focusable="false"
    >
      <g ref={figureRef} className={styles.figure}>
        <path
          className={styles.body}
          d="M10 4H50L60 14V54A6 6 0 0 1 54 60H10A6 6 0 0 1 4 54V10A6 6 0 0 1 10 4Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          className={styles.notch}
          x="7"
          y="49"
          width="4"
          height="4"
          rx="1"
        />
        <rect
          className={styles.notch}
          x="53"
          y="49"
          width="4"
          height="4"
          rx="1"
        />

        <g className={styles.shutter}>
          <rect
            className={styles.metal}
            x="19"
            y="4"
            width="26"
            height="19"
            rx="1.5"
            strokeWidth="2"
          />
          <rect
            className={styles.slot}
            x="34"
            y="8"
            width="6"
            height="11"
            rx="1"
          />
        </g>

        <rect
          className={styles.label}
          x="13"
          y="28"
          width="38"
          height="29"
          rx="2"
          strokeWidth="1.5"
        />
        <path
          className={styles.band}
          d="M15 28.75H49A1.25 1.25 0 0 1 50.25 30V32H13.75V30A1.25 1.25 0 0 1 15 28.75Z"
        />

        {[25, 39].map((x) => (
          <g key={x} className={styles.eye}>
            <ellipse
              className={styles.sclera}
              cx={x}
              cy="41.5"
              rx="4.6"
              ry="5.6"
              strokeWidth="1.4"
            />
            <g className={styles.pupil}>
              <circle className={styles.iris} cx={x + 0.6} cy="42.4" r="2.4" />
              <circle className={styles.glint} cx={x + 1.4} cy="41.4" r="0.8" />
            </g>
          </g>
        ))}

        <path
          className={styles.smile}
          d="M29 50.5Q32 53.5 35 50.5"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <ellipse
          className={styles.mouth}
          cx="32"
          cy="51.3"
          rx="2.8"
          ry="2.2"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  )
}
