import boyBase from '../assets/3d/boy-base.webp';
import clockBase from '../assets/3d/clock-base.webp';
import clockWrite from '../assets/3d/clock-write.webp';
import fileFowa from '../assets/3d/file-text-fowa.webp';
import fileFpl from '../assets/3d/file-text-fpl.webp';
import filePpr from '../assets/3d/file-text-ppr.webp';
import labLabs from '../assets/3d/lab-labs.webp';
import lockBase from '../assets/3d/lock-base.webp';
import notebookWrite from '../assets/3d/notebook-write.webp';
import toolPpr from '../assets/3d/tool-ppr.webp';
import type { IconId, LineId } from '../content/lines';

/**
 * 3D icons from 3dicons by Vijay Verma (https://3dicons.co, CC0 1.0), Clay style,
 * dynamic angle, tinted toward the line colours (see design/v5/assets/3d-icons/).
 * Used at John's request in place of the line icons; arrows stay as line glyphs.
 */
const SRC = {
  'case-fowa': fileFowa,
  'case-fpl': fileFpl,
  'case-ppr': filePpr,
  'case-default': fileFowa,
  'lab-default': labLabs,
  'essay-default': notebookWrite,
  'about-default': boyBase,
  'time-default': clockBase,
  'time-write': clockWrite,
  'progress-default': toolPpr,
  'lock-default': lockBase,
} as Record<string, string>;

export type Icon3DId = Exclude<IconId, 'arrow'> | 'lock';

export function icon3dSrc(id: Icon3DId, line?: LineId): string {
  return SRC[`${id}-${line}`] ?? SRC[`${id}-default`];
}

/** Decorative 3D icon: always hidden from screen readers. */
export function Icon3D({ id, line, size, className = '' }: { id: Icon3DId; line?: LineId; size: number; className?: string }) {
  return (
    <img
      className={`i3 ${className}`.trim()}
      src={icon3dSrc(id, line)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}
