'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ContentItem } from '@/lib/db/schema';

const FRAME_W = 240;
const FRAME_H = 190;
const GAP = 14;
const STEP = FRAME_W + GAP;

export function FilmStrip({ projects }: { projects: ContentItem[] }) {
  const n = projects.length;
  // How many frames to clone on each side — enough to fill the visible peek
  const CLONE = Math.min(3, n);

  // Layout: [last CLONE projects] [all projects] [first CLONE projects]
  const cloned = [
    ...projects.slice(-CLONE),
    ...projects,
    ...projects.slice(0, CLONE),
  ];

  // Start at the first real project (index CLONE in the cloned array)
  const [activeClone, setActiveClone] = useState(CLONE);
  const [centerOffset, setCenterOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [animEnabled, setAnimEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const dragOriginRef = useRef(0);
  const totalDragRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCenterOffset(Math.max(0, entry.contentRect.width / 2 - FRAME_W / 2));
      setReady(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Which real project (0-indexed) is currently centered
  const realActive = ((activeClone - CLONE) % n + n) % n;
  const translateX = centerOffset - activeClone * STEP + (isDragging ? dragDelta : 0);

  const goTo = useCallback((cloneIdx: number) => {
    setAnimEnabled(true);
    setActiveClone(cloneIdx);
  }, []);

  // After a transition into a clone zone, silently jump to the equivalent real position
  const handleTransitionEnd = useCallback(() => {
    if (activeClone < CLONE) {
      setAnimEnabled(false);
      setActiveClone(activeClone + n);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimEnabled(true)));
    } else if (activeClone >= CLONE + n) {
      setAnimEnabled(false);
      setActiveClone(activeClone - n);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimEnabled(true)));
    }
  }, [activeClone, CLONE, n]);

  const startDrag = (clientX: number) => {
    setIsDragging(true);
    dragOriginRef.current = clientX;
    totalDragRef.current = 0;
    setDragDelta(0);
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - dragOriginRef.current;
    totalDragRef.current = Math.max(totalDragRef.current, Math.abs(delta));
    setDragDelta(delta);
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDelta < -STEP / 3) goTo(activeClone + 1);
    else if (dragDelta > STEP / 3) goTo(activeClone - 1);
    setDragDelta(0);
  };

  if (!n) {
    return (
      <p className="text-center text-sm py-8 font-mono" style={{ color: 'var(--text-muted)' }}>
        no projects yet
      </p>
    );
  }

  const activeProject = projects[realActive];

  return (
    <div style={{ position: 'relative' }}>
      {/* Arrows — only when multiple projects */}
      {n > 1 && (
        <>
          <button
            onClick={() => goTo(activeClone - 1)}
            aria-label="Previous project"
            style={{
              position: 'absolute',
              left: 0,
              top: `${FRAME_H / 2}px`,
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(var(--accent-rgb), 0.1)',
              border: '1px solid rgba(var(--accent-rgb), 0.3)',
              color: 'var(--accent)',
              fontFamily: 'Space Mono, monospace',
              fontSize: '18px',
              lineHeight: 1,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            ‹
          </button>
          <button
            onClick={() => goTo(activeClone + 1)}
            aria-label="Next project"
            style={{
              position: 'absolute',
              right: 0,
              top: `${FRAME_H / 2}px`,
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(var(--accent-rgb), 0.1)',
              border: '1px solid rgba(var(--accent-rgb), 0.3)',
              color: 'var(--accent)',
              fontFamily: 'Space Mono, monospace',
              fontSize: '18px',
              lineHeight: 1,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Frame track */}
      <div
        ref={wrapRef}
        style={{
          overflow: 'hidden',
          position: 'relative',
          height: FRAME_H + 'px',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientX); }}
        onTouchEnd={endDrag}
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: 'flex',
            gap: GAP + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            transform: `translateX(${translateX}px)`,
            transition: (isDragging || !animEnabled) ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {cloned.map((p, i) => {
            const isActive = i === activeClone;
            const img = (p.images as string[] | null)?.[0];

            return (
              <Link
                key={i}
                href={p.slug ? `/projects/${p.slug}` : '#'}
                draggable={false}
                onClick={(e) => {
                  if (totalDragRef.current > 5) {
                    e.preventDefault();
                    totalDragRef.current = 0;
                    return;
                  }
                  if (!isActive) {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: FRAME_W + 'px',
                  height: FRAME_H + 'px',
                  clipPath: 'polygon(14px 0%,100% 0%,100% calc(100% - 14px),calc(100% - 14px) 100%,0% 100%,0% 14px)',
                  background: isActive
                    ? 'linear-gradient(135deg,var(--accent) 0%,rgba(var(--accent-rgb),0.5) 40%,rgba(var(--accent-rgb),0.1) 100%)'
                    : 'rgba(var(--accent-rgb),0.15)',
                  padding: '1px',
                  transform: isActive ? 'scale(1.04)' : 'scale(0.96)',
                  transition: 'transform 0.35s ease, background 0.35s ease',
                  userSelect: 'none',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '1px',
                    clipPath: 'polygon(13px 0%,100% 0%,100% calc(100% - 13px),calc(100% - 13px) 100%,0% 100%,0% 13px)',
                    background: 'var(--surface)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {img ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={p.title}
                        style={{ width: '100%', flex: '1 1 0', objectFit: 'cover', display: 'block' }}
                        draggable={false}
                      />
                      <div
                        style={{
                          padding: '8px 10px',
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(6px)',
                          flexShrink: 0,
                        }}
                      >
                        <p
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'Space Mono,monospace',
                            fontWeight: 700,
                            color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: 'color 0.35s ease',
                            margin: 0,
                          }}
                        >
                          {p.title}
                        </p>
                        {p.summary && isActive && (
                          <p
                            style={{
                              fontSize: '0.62rem',
                              color: 'rgba(255,255,255,0.65)',
                              margin: '3px 0 0',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}
                          >
                            {p.summary}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '16px 14px',
                        background: isActive
                          ? 'linear-gradient(160deg, rgba(var(--accent-rgb),0.08) 0%, transparent 100%)'
                          : 'transparent',
                        transition: 'background 0.35s ease',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'Space Mono,monospace',
                          fontWeight: 700,
                          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                          margin: '0 0 6px',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                          lineHeight: 1.35,
                          transition: 'color 0.35s ease',
                        }}
                      >
                        {p.title}
                      </p>
                      {p.summary && (
                        <p
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-body)',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 4,
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}
                        >
                          {p.summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dot indicators — keyed to real projects */}
      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingTop: '12px' }}>
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(CLONE + i)}
              aria-label={`Go to project ${i + 1}`}
              style={{
                width: i === realActive ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === realActive ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.3s ease, background 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Active project caption */}
      {activeProject && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 14px',
            borderLeft: '2px solid rgba(var(--accent-rgb), 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {activeProject.title}
            </p>
            {activeProject.slug && (
              <a
                href={`/projects/${activeProject.slug}`}
                style={{ fontSize: '0.7rem', fontFamily: 'Space Mono,monospace', color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}
              >
                view project ↗
              </a>
            )}
          </div>
          {activeProject.summary && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', margin: '4px 0 0', lineHeight: 1.55 }}>
              {activeProject.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
