import type React from 'react';
import { useEffect, useRef } from 'react';
import type { RideState } from '../ride/useRide';
import { NavSign } from './NavSign';
import { RouteMap } from './RouteMap/RouteMap';

/**
 * Small screens: the full route map as a full-screen sheet. Choosing a
 * station plays the ride here; the app closes the sheet on arrival.
 */
export function MapSheet({
  open,
  onClose,
  ride,
  hover,
  setHover,
  onGo,
  scale,
  offsetX,
}: {
  open: boolean;
  onClose: () => void;
  ride: RideState;
  hover: number;
  setHover: (i: number) => void;
  onGo: (i: number) => void;
  scale: number;
  offsetX: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="sheet" aria-label="Route map" onClose={onClose}>
      {open && (
        <div className="routemap routemap--sheet" data-c="false" style={{ '--ox': `${offsetX}px` } as React.CSSProperties}>
          <NavSign collapsed={false} onClose={onClose} />
          <RouteMap
            ride={{ ...ride, collapsed: false, morph: false }}
            hover={hover}
            setHover={setHover}
            onGo={onGo}
            scale={scale}
            intro={false}
          />
        </div>
      )}
    </dialog>
  );
}
