'use client';

import { useRef, useEffect, useState } from 'react';

// Must match --tco in globals.css
const TCO = 10;

export function TechTags({ tech }: { tech: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [firstSet, setFirstSet] = useState<Set<number>>(() => new Set([0]));
  const [lastSet, setLastSet] = useState<Set<number>>(() => new Set([tech.length - 1]));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function compute() {
      const children = Array.from(container!.children) as HTMLElement[];
      const rows = new Map<number, number[]>();
      children.forEach((el, i) => {
        const top = el.offsetTop;
        if (!rows.has(top)) rows.set(top, []);
        rows.get(top)!.push(i);
      });
      const newFirst = new Set<number>();
      const newLast = new Set<number>();
      rows.forEach(indices => {
        newFirst.add(indices[0]);
        newLast.add(indices[indices.length - 1]);
      });
      setFirstSet(newFirst);
      setLastSet(newLast);
    }

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [tech]);

  return (
    <div ref={containerRef} className="flex flex-wrap mb-2" style={{ columnGap: 0, rowGap: '3px' }}>
      {tech.map((t, ti) => {
        const isFirst = firstSet.has(ti);
        const isLast = lastSet.has(ti);
        const cls = ['tech-tag', isFirst && 'tech-tag--first', isLast && 'tech-tag--last']
          .filter(Boolean).join(' ');
        return (
          <span
            key={ti}
            className={cls}
            style={{ marginRight: isLast ? 0 : `-${TCO - 4}px`, position: 'relative' }}
          >
            <span className="tech-tag__inner">{t}</span>
          </span>
        );
      })}
    </div>
  );
}
