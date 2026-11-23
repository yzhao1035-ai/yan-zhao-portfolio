import { useEffect, useRef } from 'react';

export default function TargetCursor({ targetRef, size = 36, spinDuration = 2, hoverDuration = 0.2, parallaxOn = true }) {
  const cursorRef = useRef(null);
  const clickTimer = useRef(null);
  const clickFrame = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    const cursor = cursorRef.current;
    const image = target?.querySelector('.portrait-bg');
    if (!target || !cursor) return undefined;

    const onPointerMove = (event) => {
      const bounds = target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const dx = (x / bounds.width - 0.5) * 2;
      const dy = (y / bounds.height - 0.5) * 2;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      if (image && parallaxOn) {
        image.style.setProperty('--portrait-x', `${dx * 4}px`);
        image.style.setProperty('--portrait-y', `${dy * 4}px`);
      }
    };
    const onPointerEnter = () => target.classList.add('is-target-active');
    const onPointerLeave = () => {
      target.classList.remove('is-target-active', 'is-target-clicking');
      if (image) {
        image.style.setProperty('--portrait-x', '0px');
        image.style.setProperty('--portrait-y', '0px');
      }
    };
    const onPointerDown = () => {
      target.classList.remove('is-target-clicking');
      clickFrame.current = window.requestAnimationFrame(() => target.classList.add('is-target-clicking'));
      window.clearTimeout(clickTimer.current);
      window.cancelAnimationFrame(clickFrame.current);
      clickTimer.current = window.setTimeout(() => target.classList.remove('is-target-clicking'), 600);
    };

    target.addEventListener('pointerenter', onPointerEnter);
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerleave', onPointerLeave);
    target.addEventListener('pointerdown', onPointerDown);
    target.style.setProperty('--target-cursor-size', `${size}px`);
    target.style.setProperty('--target-spin-duration', `${spinDuration}s`);
    target.style.setProperty('--target-hover-duration', `${hoverDuration}s`);

    return () => {
      target.removeEventListener('pointerenter', onPointerEnter);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerleave', onPointerLeave);
      target.removeEventListener('pointerdown', onPointerDown);
      window.clearTimeout(clickTimer.current);
      target.classList.remove('is-target-active', 'is-target-clicking');
      target.style.removeProperty('--target-cursor-size');
      target.style.removeProperty('--target-spin-duration');
      target.style.removeProperty('--target-hover-duration');
    };
  }, [hoverDuration, parallaxOn, size, spinDuration, targetRef]);

  return (
    <span className="target-cursor" ref={cursorRef} aria-hidden="true">
      <span className="target-cursor-frame" />
      <span className="target-cursor-dot" />
      <span className="target-cursor-label">查看照片</span>
    </span>
  );
}
