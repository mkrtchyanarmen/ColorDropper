import { RefCallback, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SubscriberCleanupFunction = () => void;
type SubscriberResponse = SubscriberCleanupFunction | void;
type ResizeObserverBoxOptions = 'border-box' | 'content-box' | 'device-pixel-content-box';
type HookResponse<T extends Element> = {
  ref: RefCallback<T>;
} & ObservedSize;

type RoundingFunction = (n: number) => number;

declare global {
  interface ResizeObserverEntry {
    readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
  }
}

export type ObservedSize = {
  height: number | undefined;
  width: number | undefined;
};

export type ResizeHandler = (size: ObservedSize) => void;

const useResolvedElement = <T extends Element>(
  subscriber: (element: T) => SubscriberResponse,
  refOrElement?: T | RefObject<T> | null,
): RefCallback<T> => {
  const lastReportRef = useRef<{
    cleanup?: SubscriberResponse;
    element: T | null;
    subscriber: typeof subscriber;
  } | null>(null);
  const refOrElementRef = useRef<typeof refOrElement>(null);

  refOrElementRef.current = refOrElement;
  const cbElementRef = useRef<T | null>(null);

  useEffect(() => {
    evaluateSubscription();
  });

  const evaluateSubscription = useCallback(() => {
    const cbElement = cbElementRef.current;
    const blockRefOrElement = refOrElementRef.current;

    let element: T | null = cbElement;

    if (!element && blockRefOrElement) {
      element =
        blockRefOrElement instanceof Element ? blockRefOrElement : blockRefOrElement.current;
    }

    if (
      lastReportRef.current &&
      lastReportRef.current.element === element &&
      lastReportRef.current.subscriber === subscriber
    ) {
      return;
    }

    if (lastReportRef.current && lastReportRef.current.cleanup) {
      lastReportRef.current.cleanup();
    }
    lastReportRef.current = {
      element,
      subscriber,
      cleanup: element ? subscriber(element) : undefined,
    };
  }, [subscriber]);

  useEffect(() => {
    return () => {
      if (lastReportRef.current && lastReportRef.current.cleanup) {
        lastReportRef.current.cleanup();
        lastReportRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (element) => {
      cbElementRef.current = element;
      evaluateSubscription();
    },
    [evaluateSubscription],
  );
};

const extractSize = (
  entry: ResizeObserverEntry,
  boxProp: 'borderBoxSize' | 'contentBoxSize' | 'devicePixelContentBoxSize',
  sizeType: keyof ResizeObserverSize,
): number | undefined => {
  if (!entry[boxProp]) {
    if (boxProp === 'contentBoxSize') {
      return entry.contentRect[sizeType === 'inlineSize' ? 'width' : 'height'];
    }

    return undefined;
  }

  return entry[boxProp][0]
    ? entry[boxProp][0][sizeType]
    : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      entry[boxProp][sizeType];
};

const useResizeObserver = <T extends Element>(
  opts: {
    box?: ResizeObserverBoxOptions;
    onResize?: ResizeHandler;
    ref?: RefObject<T> | T | null | undefined;
    round?: RoundingFunction;
  } = {},
): HookResponse<T> => {
  const { onResize } = opts;
  const onResizeRef = useRef<ResizeHandler | undefined>(undefined);

  onResizeRef.current = onResize;
  const round = opts.round || Math.round;

  const resizeObserverRef = useRef<{
    box?: ResizeObserverBoxOptions;
    instance: ResizeObserver;
    round?: RoundingFunction;
  }>();

  const [size, setSize] = useState<{
    height?: number;
    width?: number;
  }>({
    width: undefined,
    height: undefined,
  });

  const didUnmount = useRef(false);

  useEffect(() => {
    didUnmount.current = false;

    return () => {
      didUnmount.current = true;
    };
  }, []);

  const previous: {
    current: {
      height?: number;
      width?: number;
    };
  } = useRef({
    width: undefined,
    height: undefined,
  });

  const refCallback = useResolvedElement<T>(
    useCallback(
      (element) => {
        if (
          !resizeObserverRef.current ||
          resizeObserverRef.current.box !== opts.box ||
          resizeObserverRef.current.round !== round
        ) {
          resizeObserverRef.current = {
            box: opts.box,
            round,
            instance: new ResizeObserver((entries) => {
              const entry = entries[0];

              let boxProp: 'borderBoxSize' | 'contentBoxSize' | 'devicePixelContentBoxSize';

              switch (opts.box) {
                case 'border-box':
                  boxProp = 'borderBoxSize';
                  break;
                case 'device-pixel-content-box':
                  boxProp = 'devicePixelContentBoxSize';
                  break;
                default:
                  boxProp = 'contentBoxSize';
              }

              const reportedWidth = extractSize(entry, boxProp, 'inlineSize');
              const reportedHeight = extractSize(entry, boxProp, 'blockSize');

              const newWidth = reportedWidth ? round(reportedWidth) : undefined;
              const newHeight = reportedHeight ? round(reportedHeight) : undefined;

              if (previous.current.width !== newWidth || previous.current.height !== newHeight) {
                const newSize = { width: newWidth, height: newHeight };

                previous.current.width = newWidth;
                previous.current.height = newHeight;
                if (onResizeRef.current) {
                  onResizeRef.current(newSize);
                } else if (!didUnmount.current) {
                  setSize(newSize);
                }
              }
            }),
          };
        }

        resizeObserverRef.current.instance.observe(element, { box: opts.box });

        return () => {
          if (resizeObserverRef.current) {
            resizeObserverRef.current.instance.unobserve(element);
          }
        };
      },
      [opts.box, round],
    ),
    opts.ref,
  );

  return useMemo(
    () => ({
      ref: refCallback,
      width: size.width,
      height: size.height,
    }),
    [refCallback, size.width, size.height],
  );
};

export default useResizeObserver;
