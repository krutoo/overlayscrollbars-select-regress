import {
  HTMLAttributes,
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type { PartialOptions } from 'overlayscrollbars';
import {
  OverlayScrollbarsComponentProps as OSCompProps,
  OverlayScrollbarsComponentRef as OSCompRef,
  useOverlayScrollbars,
} from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';

interface CustomScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  rootRef?: Ref<HTMLDivElement>;
  viewportRef?: Ref<HTMLDivElement>;
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  overflow?: PartialOptions['overflow'];
}

type CustomOSCompProps = Omit<OSCompProps, 'element'> & {
  viewportProps?: HTMLAttributes<HTMLDivElement>;
};

/**
 * CustomScrollbars needs just for hide overlayscrollbars api for end users of this component.
 */
export function CustomScrollbars({
  children,
  style,
  className,
  overflow,
  rootRef,
  viewportRef,
  viewportProps,
  ...restProps
}: CustomScrollbarProps) {
  const ref = useRef<OSCompRef>(null);

  useImperativeHandle(rootRef, () => ref.current?.getElement() as any);

  useImperativeHandle(viewportRef, () => ref.current?.osInstance()?.elements().viewport as any);

  return (
    <OverlayScrollbarsComponent
      {...restProps}
      ref={ref}
      defer={false}
      style={style}
      className={className}
      viewportProps={viewportProps}
      options={{
        ...(overflow && { overflow }),
      }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}

/**
 * Custom version need just because of useLayoutEffect.
 */
const OverlayScrollbarsComponent = forwardRef<OSCompRef, CustomOSCompProps>((props, ref) => {
  const { options, events, defer, children, viewportProps, ...rootProps } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [initialize, getInstance] = useOverlayScrollbars({
    options,
    events,
    defer,
  });

  useImperativeHandle(
    ref,
    () => ({
      osInstance() {
        return getInstance();
      },

      getElement() {
        return rootRef.current;
      },
    }),
    [initialize, getInstance],
  );

  useLayoutEffect(() => {
    const { current: root } = rootRef;
    const { current: viewport } = viewportRef;

    if (root && viewport) {
      initialize({
        target: root,
        elements: {
          viewport,
          content: viewport,
        },
      });
    }

    return () => {
      getInstance()?.destroy();
    };
  }, [initialize, getInstance]);

  return (
    <div {...rootProps} ref={rootRef}>
      <div {...viewportProps} ref={viewportRef}>
        {children}
      </div>
    </div>
  );
});
