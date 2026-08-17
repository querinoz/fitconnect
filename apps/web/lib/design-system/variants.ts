import { cva, type VariantProps } from "class-variance-authority";

export const eliteButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-iris/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-eos-voltline text-eos-floor hover:shadow-[0_0_15px_rgba(200,255,0,0.4)] active:scale-[0.98]",
        secondary:
          "border border-eos-iris bg-eos-carbon text-eos-on-surface hover:border-eos-iris-soft/60 hover:bg-eos-elevated",
        ghost:
          "bg-transparent font-mono text-xs uppercase tracking-widest text-eos-on-surface-muted hover:text-eos-on-surface",
        telemetry:
          "border border-eos-telemetry/30 bg-eos-telemetry-dim text-eos-telemetry hover:border-eos-telemetry/50",
        danger:
          "border border-eos-alert/40 bg-eos-alert/10 text-eos-alert hover:bg-eos-alert/20 active:scale-[0.98]",
        link: "bg-transparent text-eos-connect underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-[var(--eos-radius-nested)]",
        md: "h-11 px-6 text-sm rounded-[var(--eos-radius-control)]",
        lg: "h-12 px-8 text-base rounded-[var(--eos-radius-control)]",
        icon: "h-10 w-10 rounded-[var(--eos-radius-control)]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export type EliteButtonVariants = VariantProps<typeof eliteButtonVariants>;

export const bentoCardVariants = cva(
  "eos-bento-card relative overflow-hidden transition-colors duration-[var(--eos-duration-ui)]",
  {
    variants: {
      elevation: {
        "1": "bg-eos-carbon",
        "2": "bg-eos-elevated",
        glass: "eos-glass"
      },
      interactive: {
        true: "cursor-pointer hover:border-eos-outline-strong hover:bg-eos-elevated/80",
        false: ""
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6"
      }
    },
    defaultVariants: {
      elevation: "1",
      interactive: false,
      padding: "md"
    }
  }
);

export type BentoCardVariants = VariantProps<typeof bentoCardVariants>;

export const eliteInputVariants = cva(
  "w-full rounded-[var(--eos-radius-nested)] border bg-eos-floor text-sm text-eos-on-surface placeholder:text-eos-on-surface-subtle transition focus:outline-none",
  {
    variants: {
      size: {
        md: "h-11 px-3",
        lg: "h-12 px-4"
      },
      state: {
        default: "border-eos-outline focus:border-eos-iris focus:shadow-[0_0_8px_var(--eos-iris-glow)]",
        error: "border-eos-alert/50 focus:border-eos-alert"
      }
    },
    defaultVariants: {
      size: "md",
      state: "default"
    }
  }
);

export type EliteInputVariants = VariantProps<typeof eliteInputVariants>;

export const eliteChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--eos-radius-pill)] border px-3 py-1 text-xs font-semibold transition",
  {
    variants: {
      tone: {
        neutral: "border-eos-outline bg-eos-surface-container text-eos-on-surface-muted",
        volt: "border-eos-voltline/30 bg-eos-voltline-dim text-eos-voltline",
        telemetry: "border-eos-telemetry/30 bg-eos-telemetry-dim text-eos-telemetry",
        performance: "border-eos-performance/30 bg-emerald-500/10 text-emerald-500",
        recovery: "border-eos-recovery/30 bg-amber-400/10 text-amber-400",
        alert: "border-eos-alert/30 bg-crimson-500/10 text-crimson-500",
        iris: "border-eos-iris/30 bg-eos-iris-glow/20 text-eos-iris-soft"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

export type EliteChipVariants = VariantProps<typeof eliteChipVariants>;

export const glassPanelVariants = cva("eos-glass", {
  variants: {
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6"
    },
    radius: {
      card: "rounded-[var(--eos-radius-card)]",
      modal: "rounded-[var(--eos-radius-modal)]",
      control: "rounded-[var(--eos-radius-control)]"
    }
  },
  defaultVariants: {
    padding: "md",
    radius: "card"
  }
});

export type GlassPanelVariants = VariantProps<typeof glassPanelVariants>;
