import { useState, type ReactNode } from 'react';

// Collapsible panel section. Open state persists per section in localStorage.
export function Collapse({ id, title, right, defaultOpen = true, children }: {
  id: string; title: string; right?: ReactNode; defaultOpen?: boolean; children: ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(() => {
    try { const v = localStorage.getItem('kcr-c-' + id); return v == null ? defaultOpen : v === '1'; }
    catch { return defaultOpen; }
  });
  const toggle = () => setOpen(o => {
    try { localStorage.setItem('kcr-c-' + id, o ? '0' : '1'); } catch { /* private mode */ }
    return !o;
  });
  return (
    <div className="panel collapse">
      <div className="collapse-head" onClick={toggle} role="button" aria-expanded={open}>
        <span className="collapse-title">{title}</span>
        <span className="collapse-right" onClick={e => e.stopPropagation()}>
          {right}
          <span className={'chev' + (open ? '' : ' closed')} onClick={toggle}>▾</span>
        </span>
      </div>
      {open && <div className="collapse-body">{children}</div>}
    </div>
  );
}
