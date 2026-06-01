'use client';

import { useEffect, useRef, useState } from 'react';

const THEMES = [
  { id: 'cyan-dark',     label: 'Cyan Dark',     dotColor: '#006e80', accent: '#00e5ff' },
  { id: 'cyan-light',    label: 'Cyan Light',    dotColor: '#00e5ff', accent: '#0078a0' },
  { id: 'magenta-dark',  label: 'Magenta Dark',  dotColor: '#800038', accent: '#f0006e' },
  { id: 'magenta-light', label: 'Magenta Light', dotColor: '#f0006e', accent: '#c2005a' },
  { id: 'purple-dark',   label: 'Purple Dark',   dotColor: '#5a1a9e', accent: '#a855f7' },
  { id: 'purple-light',  label: 'Purple Light',  dotColor: '#a855f7', accent: '#7c3aed' },
  { id: 'yellow-dark',   label: 'Amber Dark',    dotColor: '#806000', accent: '#f5c518' },
  { id: 'yellow-light',  label: 'Amber Light',   dotColor: '#f5c518', accent: '#a06000' },
] as const;

type ThemeId = typeof THEMES[number]['id'];

// Flat-top hex: flat edges at top & bottom, pointy left & right
// Proper proportions: width : height = 2 : √3
const WHEEL_W = 152;
const WHEEL_H = Math.round(WHEEL_W * (Math.sqrt(3) / 2)); // ≈ 132
const BORDER = 2;
const DOT_RADIUS = 48;
const DOT_SIZE = 17;
const CX = WHEEL_W / 2;
const CY = WHEEL_H / 2;
const HEX = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

function pointerAngle(e: { clientX: number; clientY: number }, rect: DOMRect): number {
  return (Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI;
}

export function ColorWheel() {
  const [theme, setTheme] = useState<ThemeId>('cyan-light');
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(-45);
  const [dragging, setDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('cv-theme') ?? 'cyan-light') as ThemeId;
    const idx = THEMES.findIndex(t => t.id === saved);
    if (idx >= 0) {
      setTheme(saved);
      setRotation(-idx * 45);
      document.documentElement.setAttribute('data-theme', saved);
    }
    setShowHint(true);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function applyTheme(id: ThemeId) {
    const idx = THEMES.findIndex(t => t.id === id);
    setTheme(id);
    setRotation(-idx * 45);
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('cv-theme', id);
    setShowHint(false);
  }

  function handleTriggerClick() {
    setOpen(o => !o);
    setShowHint(false);
  }

  function handleWheelMouseDown(e: React.MouseEvent) {
    if (!wheelRef.current) return;
    e.preventDefault();
    setShowHint(false);

    const rect = wheelRef.current.getBoundingClientRect();
    const startMouseAngle = pointerAngle(e, rect);
    const startRotation = rotation;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    let latestRotation = startRotation;

    setDragging(true);

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.sqrt(dx * dx + dy * dy) < 4) return;
      moved = true;
      const angle = pointerAngle(ev, wheelRef.current!.getBoundingClientRect());
      latestRotation = startRotation + (angle - startMouseAngle);
      setRotation(latestRotation);
    }

    function onUp() {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!moved) return;

      const snapped = Math.round(latestRotation / 45) * 45;
      const idx = (((Math.round(-snapped / 45)) % 8) + 8) % 8;
      const t = THEMES[idx];
      setRotation(snapped);
      setTheme(t.id);
      document.documentElement.setAttribute('data-theme', t.id);
      localStorage.setItem('cv-theme', t.id);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const current = THEMES.find(t => t.id === theme)!;

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50 flex items-start gap-4">
      {/* Hint callout */}
      {showHint && (
        <div
          className="flex items-center gap-3 mt-1"
          style={{ animation: 'fadeInHint 0.5s ease both' }}
        >
          <div
            className="px-5 py-4 font-mono leading-snug"
            style={{
              border: `1px solid ${current.dotColor}60`,
              background: `${current.dotColor}10`,
              color: current.dotColor,
              maxWidth: 260,
            }}
          >
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>customise your view</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.55, marginTop: 4 }}>click or drag the wheel</div>
          </div>
          <span
            style={{
              color: current.dotColor,
              fontSize: '2rem',
              lineHeight: 1,
              animation: 'nudgeRight 1.1s ease-in-out infinite',
              alignSelf: 'flex-start',
              marginTop: '0px',
            }}
          >
            →
          </span>
        </div>
      )}

      {/* Trigger + popup column */}
      <div className="flex flex-col items-center gap-2">
        {/* Trigger button — hexagonal, same proportions as wheel */}
        <button
          onClick={handleTriggerClick}
          title="Color theme"
          className="flex items-center justify-center transition-all duration-300"
          style={{
            width: 48,
            height: Math.round(48 * (Math.sqrt(3) / 2)), // ≈ 42
            clipPath: HEX,
            background: open
              ? `linear-gradient(135deg, ${current.dotColor}40, ${current.dotColor}18)`
              : `linear-gradient(135deg, ${current.dotColor}28, ${current.dotColor}0a)`,
            outline: 'none',
            filter: `drop-shadow(0 0 ${open ? 10 : 5}px ${current.dotColor}${open ? '70' : '40'})`,
          }}
        >
          {/* Hex border ring */}
          <div
            className="absolute"
            style={{
              width: 48,
              height: Math.round(48 * (Math.sqrt(3) / 2)),
              clipPath: HEX,
              background: `linear-gradient(135deg, ${current.dotColor}, ${current.dotColor}30)`,
              padding: 1.5,
            }}
          />
          <span style={{ fontSize: 16, color: current.dotColor, lineHeight: 1, position: 'relative' }}>◎</span>
        </button>

        {open && (
          <div className="flex flex-col items-center gap-2">
            {/* Top pointer */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `8px solid ${current.dotColor}`,
                filter: `drop-shadow(0 0 3px ${current.dotColor})`,
              }}
            />

            {/* Hex wheel — outer border layer */}
            <div
              style={{
                position: 'relative',
                width: WHEEL_W + BORDER * 2,
                height: WHEEL_H + BORDER * 2,
                clipPath: HEX,
                background: `linear-gradient(135deg, ${current.dotColor} 0%, ${current.dotColor}40 50%, ${current.dotColor}10 100%)`,
                filter: `drop-shadow(0 0 14px ${current.dotColor}50)`,
              }}
            >
              {/* Hex wheel — inner surface */}
              <div
                ref={wheelRef}
                style={{
                  position: 'absolute',
                  top: BORDER,
                  left: BORDER,
                  width: WHEEL_W,
                  height: WHEEL_H,
                  clipPath: HEX,
                  background: 'rgba(8,8,16,0.92)',
                  cursor: dragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleWheelMouseDown}
              >
                {/* Rotating dot ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `rotate(${rotation}deg)`,
                    transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {THEMES.map((t, i) => {
                    const angleRad = ((i * 45 - 90) * Math.PI) / 180;
                    const x = CX + DOT_RADIUS * Math.cos(angleRad) - DOT_SIZE / 2;
                    const y = CY + DOT_RADIUS * Math.sin(angleRad) - DOT_SIZE / 2;
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        title={t.label}
                        onClick={e => { e.stopPropagation(); applyTheme(t.id); }}
                        style={{
                          position: 'absolute',
                          width: DOT_SIZE,
                          height: DOT_SIZE,
                          borderRadius: '50%',
                          left: x,
                          top: y,
                          background: t.dotColor,
                          boxShadow: isSelected
                            ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 10px ${t.dotColor}`
                            : `0 0 5px ${t.dotColor}90`,
                          transform: isSelected ? 'scale(1.35)' : 'scale(1)',
                          transition: 'transform 0.15s',
                          outline: 'none',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Center glow */}
                <div
                  style={{
                    position: 'absolute',
                    width: 30,
                    height: 30,
                    top: CY - 15,
                    left: CX - 15,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.4), rgba(var(--accent-rgb), 0.05))`,
                    border: `1px solid rgba(var(--accent-rgb), 0.5)`,
                    boxShadow: `0 0 14px rgba(var(--accent-rgb), 0.3)`,
                    pointerEvents: 'none',
                    transition: 'all 0.4s',
                  }}
                />
              </div>
            </div>

            {/* Label */}
            <p
              className="font-mono text-xs"
              style={{ color: current.dotColor, opacity: 0.75, letterSpacing: '0.05em' }}
            >
              {current.label.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
