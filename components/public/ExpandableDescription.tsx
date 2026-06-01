'use client';

import { useState } from 'react';

const URL_RE = /(https?:\/\/[^\s]+)/g;

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        URL_RE.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-link underline"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ExpandableDescription({ description }: { description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-mono transition-opacity hover:opacity-75"
        style={{ color: 'var(--accent)' }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <polygon points="2,1 9,5 2,9" />
        </svg>
        {open ? 'hide project details' : 'show project details'}
      </button>

      {open && (
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: 'var(--text-body)' }}
        >
          <Linkified text={description} />
        </p>
      )}
    </div>
  );
}
