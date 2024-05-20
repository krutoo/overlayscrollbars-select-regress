import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  defineRoot?: () => HTMLElement;
  children?: ReactNode;
  onMount?: VoidFunction;
}

export function Portal({ children, defineRoot = () => document.body, onMount }: PortalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const root = defineRoot();

    ref.current = document.createElement('div');

    root.appendChild(ref.current);
    setMounted(true);

    return () => {
      ref.current && ref.current.remove();
    };
  }, []);

  const onMountRef = useRef(onMount);

  onMountRef.current = onMount;

  useLayoutEffect(() => {
    if (mounted) {
      onMountRef.current?.();
    }
  }, [mounted]);

  return mounted && ref.current ? createPortal(children, ref.current) : null;
}
