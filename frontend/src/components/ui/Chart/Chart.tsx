import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

// --- Context and Types ---

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartContainer');
  }
  return context;
}

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<string, string>;
  };
};

// --- Components ---

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactElement;
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, item]) => {
            const color = item.theme?.['light'] || item.color;
            return color ? `--color-${key}: ${color};` : null;
          })
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    labelFormatter?: (
      label: unknown,
      payload: TooltipPayloadItem[]
    ) => React.ReactNode;
    labelClassName?: string;
    formatter?: (value: unknown, name: unknown) => React.ReactNode;
    color?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || 'value'}`;
      const itemConfig = config[key];
      const value =
        !labelKey && typeof label === 'string'
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn('font-bold', labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return (
        <div
          className={cn(
            'font-bold uppercase tracking-widest text-[10px] text-base-content/40',
            labelClassName
          )}
        >
          {value}
        </div>
      );
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded border border-base-200 bg-base-100/90 backdrop-blur-md p-3 text-xs shadow-xl shadow-base-300/20',
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5 line-height-tight">
          {payload.map((item) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = config[key];
            const indicatorColor =
              color ||
              (item.payload?.['fill'] as string | undefined) ||
              item.color;

            const formattedValue = formatter
              ? formatter(item.value, item.name)
              : item.value;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  'flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  !hideIndicator && (
                    <div
                      className={cn(
                        'shrink-0 rounded-[2px] border-[1.5px] border-border bg-[--color-bg]',
                        {
                          'h-2.5 w-2.5': indicator === 'dot',
                          'w-1': indicator === 'line',
                          'w-0 border-[1.5px] border-dashed bg-transparent':
                            indicator === 'dashed',
                          'my-0.5': nestLabel && indicator === 'dashed',
                        }
                      )}
                      style={
                        {
                          '--color-bg': indicatorColor,
                          '--color-border': indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )
                )}
                <div
                  className={cn(
                    'flex flex-1 justify-between leading-none',
                    nestLabel ? 'items-end' : 'items-center'
                  )}
                >
                  <div className="grid gap-1">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-base-content/60 font-medium">
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                  {formattedValue != null && (
                    <span className="font-black font-mono tabular-nums text-base-content tracking-tight ml-4">
                      {typeof formattedValue === 'number'
                        ? formattedValue.toLocaleString()
                        : formattedValue}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

type LegendPayloadItem = {
  dataKey?: string | number;
  value?: string | number;
  color?: string;
  type?: string;
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    payload?: LegendPayloadItem[];
    verticalAlign?: 'top' | 'bottom' | 'middle';
    hideIcon?: boolean;
    nameKey?: string;
  }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4 py-2',
          verticalAlign === 'top' ? 'pb-4' : 'pt-4',
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || item.value || 'value'}`;
          const itemConfig = config[key];

          return (
            <div
              key={item.value}
              className={cn(
                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">
                {itemConfig?.label || item.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegend';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
