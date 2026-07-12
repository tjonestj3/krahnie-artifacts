/* @ds-bundle: {"format":3,"namespace":"KrahnbornDesignSystem_019ddc","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"e3b23f606a63","components/core/Badge.jsx":"a4e0ad39a602","components/core/Button.jsx":"8dac387a7774","components/core/Card.jsx":"e1ec446abb90","components/core/IconButton.jsx":"c3f91e44b69b","components/core/StatCard.jsx":"181a8e8698a8","components/core/Tag.jsx":"6f6b309764c3","components/feedback/Dialog.jsx":"f5e418c2db9b","components/feedback/Toast.jsx":"9e5dab2b84e8","components/feedback/Tooltip.jsx":"53941e69336e","components/forms/Checkbox.jsx":"41890503aa4d","components/forms/Input.jsx":"97ab2df7eee5","components/forms/Select.jsx":"7bfb0d3ad096","components/forms/Switch.jsx":"1839ef17df94","components/forms/Textarea.jsx":"b266be0c51f4","components/navigation/Tabs.jsx":"4f1972a7365e","ui_kits/marketing/MarketingSite.jsx":"6d42b5ef3b47","ui_kits/marketing/icons.jsx":"8feb67947624","ui_kits/portal/PortalApp.jsx":"fa32801de9bf","ui_kits/portal/icons.jsx":"8feb67947624"},"inlinedExternals":[],"unexposedExports":[{"name":"labelStyle","sourcePath":"components/forms/Input.jsx"}]} */

(() => {

const __ds_ns = (window.KrahnbornDesignSystem_019ddc = window.KrahnbornDesignSystem_019ddc || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56
};
function initialsOf(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

/**
 * User / entity avatar. Falls back to initials on a teal-tinted disc.
 */
function Avatar({
  name = "",
  src,
  size = "md",
  style,
  ...rest
}) {
  const px = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      width: px,
      height: px,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      background: "linear-gradient(150deg, var(--teal-700), var(--navy-700))",
      border: "1px solid var(--border-default)",
      color: "var(--teal-300)",
      fontFamily: "var(--font-mono)",
      fontSize: px * 0.34,
      fontWeight: "var(--fw-medium)",
      letterSpacing: "0.02em",
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initialsOf(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "rgba(148,174,209,0.12)",
    fg: "var(--text-secondary)",
    bd: "var(--border-default)"
  },
  accent: {
    bg: "var(--accent-soft)",
    fg: "var(--text-accent)",
    bd: "rgba(153,213,202,0.35)"
  },
  success: {
    bg: "var(--success-soft)",
    fg: "var(--success)",
    bd: "rgba(95,214,166,0.35)"
  },
  warning: {
    bg: "var(--warning-soft)",
    fg: "var(--warning)",
    bd: "rgba(232,193,107,0.35)"
  },
  danger: {
    bg: "var(--danger-soft)",
    fg: "var(--danger)",
    bd: "rgba(240,128,110,0.35)"
  }
};

/**
 * Compact status / category label. `dot` shows a leading status dot.
 */
function Badge({
  tone = "neutral",
  dot = false,
  mono = true,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 9px",
      height: 22,
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--fw-medium)",
      letterSpacing: mono ? "var(--tracking-wide)" : 0,
      textTransform: mono ? "uppercase" : "none",
      color: t.fg,
      background: t.bg,
      border: `1px solid ${t.bd}`,
      borderRadius: "var(--radius-pill)",
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: t.fg,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: "0 14px",
    height: 34,
    font: "var(--text-sm)",
    gap: 7,
    radius: "var(--radius-sm)"
  },
  md: {
    padding: "0 18px",
    height: 42,
    font: "var(--text-sm)",
    gap: 8,
    radius: "var(--radius-md)"
  },
  lg: {
    padding: "0 24px",
    height: 52,
    font: "var(--text-base)",
    gap: 10,
    radius: "var(--radius-md)"
  }
};
const VARIANTS = {
  primary: {
    background: "var(--accent)",
    color: "var(--text-on-accent)",
    border: "1px solid var(--accent)",
    hoverBg: "var(--accent-hover)",
    activeBg: "var(--accent-active)"
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-strong)",
    hoverBg: "rgba(148,174,209,0.08)",
    activeBg: "rgba(148,174,209,0.14)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
    hoverBg: "rgba(148,174,209,0.08)",
    activeBg: "rgba(148,174,209,0.14)"
  },
  danger: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
    border: "1px solid rgba(240,128,110,0.35)",
    hoverBg: "rgba(240,128,110,0.20)",
    activeBg: "rgba(240,128,110,0.28)"
  }
};

/**
 * Krahnborn primary action control. Mono-spaced label optional via `mono`.
 */
function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  mono = false,
  as = "button",
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;
  const bg = active ? v.activeBg : hover ? v.hoverBg : v.background;
  const baseStyle = {
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
    fontSize: s.font,
    fontWeight: "var(--fw-semibold)",
    letterSpacing: mono ? "var(--tracking-wide)" : "0.01em",
    lineHeight: 1,
    color: v.color,
    background: bg,
    border: v.border,
    borderRadius: s.radius,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.45 : 1,
    transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
    transform: active && !isDisabled ? "translateY(1px)" : "none",
    boxShadow: variant === "primary" && hover && !isDisabled ? "var(--glow-teal)" : "none",
    textDecoration: "none",
    whiteSpace: "nowrap",
    userSelect: "none",
    ...style
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: baseStyle,
    disabled: Tag === "button" ? isDisabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false)
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children, !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 15,
      height: 15,
      borderRadius: "50%",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      display: "inline-block",
      animation: "kb-spin 0.7s linear infinite"
    }
  });
}
if (typeof document !== "undefined" && !document.getElementById("kb-spin-kf")) {
  const st = document.createElement("style");
  st.id = "kb-spin-kf";
  st.textContent = "@keyframes kb-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(st);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Surface container. `interactive` adds hover lift; `accent` adds a teal
 * top hairline. The base brand card: raised navy, hairline border, soft radius.
 */
function Card({
  interactive = false,
  accent = false,
  padding = "var(--space-6)",
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      position: "relative",
      background: "var(--bg-raised)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding,
      boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
      transform: hover ? "translateY(-2px)" : "none",
      transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
      borderColor: hover ? "var(--border-default)" : "var(--border-subtle)",
      cursor: interactive ? "pointer" : "default",
      overflow: "hidden",
      ...style
    }
  }, rest), accent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: "linear-gradient(90deg, var(--accent), transparent 70%)"
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 40,
  lg: 48
};

/**
 * Square icon-only button. Pass an SVG/icon node as children.
 */
function IconButton({
  size = "md",
  variant = "ghost",
  label,
  active = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const px = SIZES[size] || SIZES.md;
  const bg = active ? "var(--accent-soft)" : hover ? "rgba(148,174,209,0.10)" : variant === "solid" ? "var(--bg-raised)" : "transparent";
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: px,
      height: px,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      border: variant === "solid" ? "1px solid var(--border-default)" : "1px solid transparent",
      background: bg,
      color: active ? "var(--accent)" : "var(--text-secondary)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      padding: 0,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Metric tile — big mono number, label, optional delta. Used across
 * dashboards and marketing stat strips.
 */
function StatCard({
  label,
  value,
  unit,
  delta,
  deltaTone = "success",
  icon,
  style,
  ...rest
}) {
  const tone = deltaTone === "danger" ? "var(--danger)" : deltaTone === "warning" ? "var(--warning)" : "var(--success)";
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    padding: "var(--space-5)",
    style: {
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-wider)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-accent)",
      display: "inline-flex"
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--fw-bold)",
      letterSpacing: "var(--tracking-tight)",
      color: "var(--text-primary)",
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      fontFamily: "var(--font-mono)"
    }
  }, unit)), delta != null && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: "var(--text-xs)",
      color: tone,
      fontFamily: "var(--font-mono)",
      fontWeight: "var(--fw-medium)"
    }
  }, delta));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Removable keyword chip used in filters & tag inputs.
 */
function Tag({
  children,
  onRemove,
  icon,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: onRemove ? "5px 7px 5px 12px" : "5px 12px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-primary)",
      background: hover ? "rgba(148,174,209,0.10)" : "var(--bg-raised)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      lineHeight: 1,
      transition: "background var(--dur-fast) var(--ease-out)",
      ...style
    }
  }, rest), icon, children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      borderRadius: "var(--radius-xs)",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      fontSize: 13,
      lineHeight: 1
    }
  }, "\u2715"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/**
 * Modal dialog with overlay. Renders nothing when `open` is false.
 */
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 460
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "var(--bg-overlay)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      animation: "kb-fade 0.2s var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    role: "dialog",
    style: {
      width: "100%",
      maxWidth: width,
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-xl)",
      padding: "var(--space-8)",
      animation: "kb-pop 0.24s var(--ease-snap)"
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      color: "var(--text-secondary)",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)"
    }
  }, description), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 28
    }
  }, footer)));
}
if (typeof document !== "undefined" && !document.getElementById("kb-dialog-kf")) {
  const st = document.createElement("style");
  st.id = "kb-dialog-kf";
  st.textContent = "@keyframes kb-fade{from{opacity:0}to{opacity:1}}@keyframes kb-pop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}";
  document.head.appendChild(st);
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const TONES = {
  neutral: {
    accent: "var(--text-secondary)",
    glyph: "•"
  },
  success: {
    accent: "var(--success)",
    glyph: "✓"
  },
  warning: {
    accent: "var(--warning)",
    glyph: "!"
  },
  danger: {
    accent: "var(--danger)",
    glyph: "✕"
  },
  accent: {
    accent: "var(--accent)",
    glyph: "✦"
  }
};

/**
 * Single toast notification. Compose a list yourself for a stack.
 */
function Toast({
  tone = "neutral",
  title,
  message,
  onClose,
  style
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      width: 340,
      padding: "14px 16px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderLeft: `2px solid ${t.accent}`,
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-inset)",
      color: t.accent,
      fontSize: 12,
      fontWeight: 700
    }
  }, t.glyph), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--text-sm)",
      color: "var(--text-primary)"
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, message)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      fontSize: 13,
      padding: 2,
      lineHeight: 1
    }
  }, "\u2715"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/**
 * Hover tooltip. Wraps a trigger; shows `label` above on hover/focus.
 */
function Tooltip({
  label,
  side = "top",
  children
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      ...pos,
      zIndex: 900,
      whiteSpace: "nowrap",
      padding: "6px 10px",
      background: "var(--navy-950)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "0.02em",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none",
      animation: "kb-fade 0.14s var(--ease-out)"
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Checkbox with label. Controlled via `checked` / `onChange`. */
function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  style
}) {
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      color: "var(--text-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 19,
      height: 19,
      borderRadius: "var(--radius-xs)",
      border: `1px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
      background: checked ? "var(--accent)" : "var(--bg-inset)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2 5 8.6 9.5 3.6",
    stroke: "var(--navy-900)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", {
    id: inputId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange?.(e.target.checked),
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with optional label, leading icon, and error state.
 */
function Input({
  label,
  hint,
  error,
  iconLeft,
  size = "md",
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === "lg" ? 52 : size === "sm" ? 36 : 44;
  const borderColor = error ? "var(--danger)" : focus ? "var(--accent)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: labelStyle
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      height: h,
      padding: iconLeft ? "0 14px 0 13px" : "0 14px",
      background: "var(--bg-inset)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "inline-flex",
      flexShrink: 0
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    }
  }, rest, {
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      height: "100%"
    }
  }))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)",
      fontFamily: "var(--font-body)"
    }
  }, error || hint));
}
const labelStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  fontWeight: "var(--fw-medium)",
  letterSpacing: "var(--tracking-wide)",
  textTransform: "uppercase",
  color: "var(--text-secondary)"
};
Object.assign(__ds_scope, { Input, labelStyle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to match the form system. */
function Select({
  label,
  hint,
  options = [],
  size = "md",
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === "lg" ? 52 : size === "sm" ? 36 : 44;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: __ds_scope.labelStyle
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      width: "100%",
      height: h,
      padding: "0 38px 0 14px",
      background: "var(--bg-inset)",
      border: `1px solid ${focus ? "var(--accent)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      outline: "none",
      appearance: "none",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
      cursor: "pointer"
    }
  }), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-muted)",
      fontSize: 11
    }
  }, "\u25BE")), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** On/off toggle. Teal when on. */
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 11,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      color: "var(--text-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange?.(!checked),
    style: {
      width: 40,
      height: 23,
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--accent)" : "var(--navy-600)",
      border: `1px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
      position: "relative",
      flexShrink: 0,
      transition: "background var(--dur-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 19 : 2,
      width: 17,
      height: 17,
      borderRadius: "50%",
      background: checked ? "var(--navy-900)" : "var(--slate-200)",
      transition: "left var(--dur-base) var(--ease-snap)",
      boxShadow: "var(--shadow-xs)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text input matching Input styling. */
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error ? "var(--danger)" : focus ? "var(--accent)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: __ds_scope.labelStyle
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    }
  }, rest, {
    style: {
      resize: "vertical",
      padding: "12px 14px",
      background: "var(--bg-inset)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)",
      outline: "none",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)"
    }
  })), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Tab bar. Controlled (`value`/`onChange`) or uncontrolled.
 * `variant="underline"` (default) or `"pill"`.
 */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  variant = "underline",
  style
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value);
  const active = value ?? internal;
  const select = v => {
    setInternal(v);
    onChange?.(v);
  };
  if (variant === "pill") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: "var(--bg-inset)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        ...style
      }
    }, tabs.map(t => {
      const on = t.value === active;
      return /*#__PURE__*/React.createElement("button", {
        key: t.value,
        onClick: () => select(t.value),
        style: {
          padding: "8px 16px",
          border: "none",
          borderRadius: "var(--radius-sm)",
          background: on ? "var(--bg-raised)" : "transparent",
          color: on ? "var(--text-primary)" : "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--fw-medium)",
          cursor: "pointer",
          transition: "all var(--dur-fast) var(--ease-out)",
          boxShadow: on ? "var(--shadow-xs)" : "none"
        }
      }, t.label);
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 28,
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, tabs.map(t => {
    const on = t.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      onClick: () => select(t.value),
      style: {
        padding: "0 0 14px",
        border: "none",
        background: "transparent",
        color: on ? "var(--text-primary)" : "var(--text-muted)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        fontWeight: on ? "var(--fw-semibold)" : "var(--fw-regular)",
        cursor: "pointer",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "color var(--dur-fast) var(--ease-out)"
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-2xs)",
        color: on ? "var(--text-accent)" : "var(--text-muted)",
        background: "var(--bg-inset)",
        padding: "1px 6px",
        borderRadius: "var(--radius-pill)"
      }
    }, t.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: "var(--accent)",
        borderRadius: "2px 2px 0 0",
        transform: on ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform var(--dur-base) var(--ease-out)"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/MarketingSite.jsx
try { (() => {
/* Krahnborn marketing site — composed from DS primitives + KBIcon.
   Exports window.MarketingSite. */
const DS = window.KrahnbornDesignSystem_019ddc;
const {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Dialog,
  Avatar
} = DS;
const Icon = window.KBIcon;
const MAXW = 1180;
const wrap = {
  maxWidth: MAXW,
  margin: "0 auto",
  padding: "0 40px"
};
const kicker = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-accent)"
};
function Logo({
  size = 30
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/krahnborn-mark.png",
    alt: "",
    style: {
      width: size,
      height: size
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 21,
      letterSpacing: "-0.03em",
      color: "var(--white)"
    }
  }, "Krahn", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-accent)"
    }
  }, "born")));
}
function Nav({
  onContact
}) {
  const links = ["Services", "Approach", "Work", "About"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(10,22,40,0.78)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 34
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--text-secondary)",
      fontWeight: 500
    },
    onMouseEnter: e => e.target.style.color = "var(--text-primary)",
    onMouseLeave: e => e.target.style.color = "var(--text-secondary)"
  }, l))), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 15
    }),
    onClick: onContact
  }, "Start a conversation")));
}
function Hero({
  onContact
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -180,
      right: -120,
      width: 620,
      height: 620,
      background: "radial-gradient(circle, rgba(153,213,202,0.10), transparent 62%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      paddingTop: 96,
      paddingBottom: 84,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: kicker
  }, "// Digital ecosystems \xB7 Long-term support"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 64,
      lineHeight: 1.04,
      letterSpacing: "-0.035em",
      color: "var(--text-primary)",
      margin: "22px 0 0"
    }
  }, "Technology that ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-accent)"
    }
  }, "evolves"), " with your business."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      margin: "24px 0 0",
      maxWidth: 600
    }
  }, "We build and maintain the digital ecosystem behind your operations \u2014 thoughtful implementations and ongoing support, without overcomplication, unnecessary tech debt, or one-size-fits-all solutions."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 38
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "primary",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 17
    }),
    onClick: onContact
  }, "Start a conversation"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary"
  }, "See how we work")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 26,
      marginTop: 44,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, ["99.98% uptime, sustained", "Avg. 6-yr partnership", "No lock-in, ever"].map(t => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 15,
    color: "var(--accent)"
  }), t))))));
}
const SERVICES = [{
  icon: "layers",
  title: "Platform architecture",
  body: "Foundations sized to your business — composable systems that scale without rework or sprawl."
}, {
  icon: "git-branch",
  title: "Thoughtful implementation",
  body: "We ship deliberately. Clean integrations, documented decisions, no shortcuts that become tomorrow's tech debt."
}, {
  icon: "life-buoy",
  title: "Long-term support",
  body: "A team that stays. Proactive maintenance, monitoring, and a roadmap that evolves alongside you."
}, {
  icon: "shield",
  title: "Security & reliability",
  body: "Hardened by default — observability, backups, and incident response built into every engagement."
}];
function Services() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      ...wrap,
      paddingTop: 40,
      paddingBottom: 84
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: kicker
  }, "// What we do"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: "-0.025em",
      color: "var(--text-primary)",
      margin: "14px 0 0"
    }
  }, "One partner for the whole ecosystem.")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: "0.08em",
      color: "var(--text-accent)",
      display: "flex",
      alignItems: "center",
      gap: 6,
      paddingBottom: 8
    }
  }, "ALL SERVICES ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 14,
    color: "var(--accent)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 18
    }
  }, SERVICES.map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    interactive: true,
    accent: i === 0,
    padding: "28px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: "var(--radius-md)",
      background: "var(--accent-soft)",
      border: "1px solid rgba(153,213,202,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 22,
    color: "var(--accent)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 21,
      color: "var(--text-primary)",
      margin: "20px 0 0"
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      margin: "10px 0 0"
    }
  }, s.body)))));
}
function Proof() {
  const stats = [{
    v: "99.98%",
    l: "Uptime across managed platforms"
  }, {
    v: "6 yrs",
    l: "Average client partnership"
  }, {
    v: "142ms",
    l: "Median API response, p50"
  }, {
    v: "0",
    l: "One-size-fits-all templates"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      paddingTop: 56,
      paddingBottom: 56,
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 32
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: "-0.03em",
      color: "var(--text-accent)",
      lineHeight: 1
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 12,
      lineHeight: 1.5,
      maxWidth: 200
    }
  }, s.l)))));
}
function Quote() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      ...wrap,
      paddingTop: 84,
      paddingBottom: 84
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: kicker
  }, "// In their words"), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 32,
      lineHeight: 1.35,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)",
      margin: "24px 0 0"
    }
  }, "\"They didn't sell us a platform \u2014 they grew one with us. Five years on, the system still fits how we actually work.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 13,
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marta Olsson"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Marta Olsson"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, "VP Engineering, Nordwind Logistics")))));
}
function CtaBand({
  onContact
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      ...wrap,
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    style: {
      overflow: "hidden",
      border: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      padding: "64px 56px",
      background: "linear-gradient(120deg, var(--navy-800), var(--navy-700))"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -120,
      right: -60,
      width: 420,
      height: 420,
      background: "radial-gradient(circle, rgba(153,213,202,0.14), transparent 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 40,
      letterSpacing: "-0.03em",
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Let's map your ecosystem."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      margin: "16px 0 32px"
    }
  }, "A 30-minute review of where your technology is today and where it should evolve. No pitch deck."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "primary",
    mono: true,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: onContact
  }, "BOOK A REVIEW")))));
}
function Footer() {
  const cols = [{
    h: "Services",
    items: ["Architecture", "Implementation", "Managed support", "Security"]
  }, {
    h: "Company",
    items: ["About", "Approach", "Careers", "Contact"]
  }, {
    h: "Resources",
    items: ["Case studies", "Documentation", "Status", "Changelog"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--bg-inset)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      paddingTop: 56,
      paddingBottom: 40,
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    size: 26
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-muted)",
      lineHeight: 1.6,
      margin: "16px 0 0",
      maxWidth: 240
    }
  }, "Digital ecosystems that evolve with your business.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      marginBottom: 16
    }
  }, c.h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 11
    }
  }, c.items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      fontSize: 14,
      color: "var(--text-secondary)"
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      paddingBottom: 32,
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Krahnborn"), /*#__PURE__*/React.createElement("span", null, "Privacy \xB7 Terms")));
}
function ContactDialog({
  open,
  onClose
}) {
  const [sent, setSent] = React.useState(false);
  React.useEffect(() => {
    if (open) setSent(false);
  }, [open]);
  return /*#__PURE__*/React.createElement(Dialog, {
    open: open,
    onClose: onClose,
    width: 460,
    title: sent ? "Thanks — we'll be in touch." : "Start a conversation",
    description: sent ? "A Krahnborn architect will reach out within one business day to schedule your review." : "Tell us a little about your ecosystem and we'll set up a 30-minute review.",
    footer: sent ? /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onClose
    }, "Done") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setSent(true)
    }, "Send request"))
  }, !sent && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    placeholder: "you@company.com",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 15
    })
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "What are you building?",
    rows: 3,
    placeholder: "A few words on your current setup\u2026"
  })));
}
function MarketingSite() {
  const [contact, setContact] = React.useState(false);
  const open = () => setContact(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-canvas)",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement(Nav, {
    onContact: open
  }), /*#__PURE__*/React.createElement(Hero, {
    onContact: open
  }), /*#__PURE__*/React.createElement(Services, null), /*#__PURE__*/React.createElement(Proof, null), /*#__PURE__*/React.createElement(Quote, null), /*#__PURE__*/React.createElement(CtaBand, {
    onContact: open
  }), /*#__PURE__*/React.createElement(Footer, null), /*#__PURE__*/React.createElement(ContactDialog, {
    open: contact,
    onClose: () => setContact(false)
  }));
}
window.MarketingSite = MarketingSite;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/MarketingSite.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/icons.jsx
try { (() => {
/* Krahnborn UI-kit icons — exact Lucide 2px-stroke paths, inline so kits
   stay self-contained. Exported to window for cross-script use. */
const KB_ICON_PATHS = {
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  "life-buoy": '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  "git-branch": '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "check-circle": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18.999 12.499 19 11a7 7 0 1 0-14 0c0 1.5-.41 2.956-1.738 4.326"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  "ticket": '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  "rocket": '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  "credit-card": '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>'
};
function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flexShrink: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: KB_ICON_PATHS[name] || ""
    }
  });
}
window.KBIcon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/PortalApp.jsx
try { (() => {
/* Krahnborn client portal — composed from DS primitives + KBIcon.
   Exports window.PortalApp. */
const PDS = window.KrahnbornDesignSystem_019ddc;
const {
  Button,
  Card,
  StatCard,
  Badge,
  Tabs,
  Avatar,
  Input,
  Textarea,
  Select,
  Dialog,
  IconButton,
  Tooltip
} = PDS;
const PIcon = window.KBIcon;
const NAV = [{
  id: "overview",
  label: "Overview",
  icon: "layout-dashboard"
}, {
  id: "tickets",
  label: "Support",
  icon: "life-buoy"
}, {
  id: "deploys",
  label: "Deployments",
  icon: "rocket"
}, {
  id: "activity",
  label: "Activity",
  icon: "activity"
}, {
  id: "billing",
  label: "Billing",
  icon: "credit-card"
}];
function Sidebar({
  active,
  setActive
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 232,
      flexShrink: 0,
      background: "var(--bg-inset)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 8px 22px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/krahnborn-mark.png",
    alt: "",
    style: {
      width: 26,
      height: 26
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 17,
      letterSpacing: "-0.02em",
      color: "var(--white)"
    }
  }, "Krahn", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-accent)"
    }
  }, "born"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      padding: "0 8px 10px"
    }
  }, "Workspace"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, NAV.map(n => {
    const on = n.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => setActive(n.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 10px",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: on ? "var(--accent-soft)" : "transparent",
        color: on ? "var(--text-accent)" : "var(--text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: on ? 600 : 500,
        cursor: "pointer",
        textAlign: "left",
        transition: "background var(--dur-fast) var(--ease-out)"
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = "rgba(148,174,209,0.07)";
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement(PIcon, {
      name: n.icon,
      size: 18,
      color: on ? "var(--accent)" : "var(--text-muted)"
    }), n.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "16px",
    accent: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Managed plan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)",
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Renews May 2027 \xB7 24 seats"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    fullWidth: true,
    style: {
      marginTop: 12
    }
  }, "Manage"))));
}
function Topbar({
  title,
  onNew
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 21,
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    dot: true
  }, "All systems operational")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240
    }
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "Search\u2026",
    iconLeft: /*#__PURE__*/React.createElement(PIcon, {
      name: "search",
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Notifications"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "solid"
  }, /*#__PURE__*/React.createElement(PIcon, {
    name: "bell",
    size: 17
  }))), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(PIcon, {
      name: "plus",
      size: 15
    }),
    onClick: onNew
  }, "New ticket"), /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Reuter",
    size: "sm"
  })));
}
const TICKETS = [{
  id: "KB-2041",
  title: "Intermittent 504 on checkout API",
  pri: "High",
  priTone: "danger",
  status: "In progress",
  who: "Sven L.",
  age: "2h"
}, {
  id: "KB-2039",
  title: "Add SSO for the analytics workspace",
  pri: "Medium",
  priTone: "warning",
  status: "Triaged",
  who: "Dana R.",
  age: "1d"
}, {
  id: "KB-2037",
  title: "Quarterly dependency upgrade window",
  pri: "Low",
  priTone: "neutral",
  status: "Scheduled",
  who: "Maya P.",
  age: "3d"
}, {
  id: "KB-2034",
  title: "Data export job runs slow over 1M rows",
  pri: "Medium",
  priTone: "warning",
  status: "In progress",
  who: "Sven L.",
  age: "4d"
}];
function TicketsTable() {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "92px 1fr 110px 130px 120px 60px",
      padding: "13px 20px",
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "ID"), /*#__PURE__*/React.createElement("span", null, "Issue"), /*#__PURE__*/React.createElement("span", null, "Priority"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Owner"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, "Age")), TICKETS.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "grid",
      gridTemplateColumns: "92px 1fr 110px 130px 120px 60px",
      alignItems: "center",
      padding: "15px 20px",
      borderBottom: i < TICKETS.length - 1 ? "1px solid var(--border-subtle)" : "none",
      cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease-out)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "rgba(148,174,209,0.05)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-accent)"
    }
  }, t.id), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--text-primary)"
    }
  }, t.title), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
    tone: t.priTone
  }, t.pri)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, t.status), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: t.who,
    size: "xs"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, t.who)), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, t.age))));
}
const DEPLOYS = [{
  env: "production",
  ver: "v2.4.1",
  when: "12m ago",
  ok: true,
  by: "ci/main"
}, {
  env: "production",
  ver: "v2.4.0",
  when: "2d ago",
  ok: true,
  by: "ci/main"
}, {
  env: "staging",
  ver: "v2.5.0-rc.2",
  when: "5h ago",
  ok: true,
  by: "sven.l"
}, {
  env: "staging",
  ver: "v2.5.0-rc.1",
  when: "1d ago",
  ok: false,
  by: "sven.l"
}];
function Deployments() {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    style: {
      overflow: "hidden"
    }
  }, DEPLOYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "15px 20px",
      borderBottom: i < DEPLOYS.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: d.ok ? "var(--success)" : "var(--danger)",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-primary)",
      width: 120
    }
  }, d.ver), /*#__PURE__*/React.createElement(Badge, {
    tone: d.env === "production" ? "accent" : "neutral"
  }, d.env), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, d.by), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, d.when))));
}
function SectionHead({
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "30px 0 14px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 16,
      color: "var(--text-primary)",
      margin: 0
    }
  }, children), action);
}
function Overview() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Uptime \xB7 30d",
    value: "99.98",
    unit: "%",
    delta: "+0.04 vs SLA",
    icon: /*#__PURE__*/React.createElement(PIcon, {
      name: "gauge",
      size: 18,
      color: "var(--accent)"
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Open tickets",
    value: "12",
    delta: "\u22124 this week",
    icon: /*#__PURE__*/React.createElement(PIcon, {
      name: "ticket",
      size: 18,
      color: "var(--accent)"
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "p50 latency",
    value: "142",
    unit: "ms",
    delta: "\u22128ms",
    icon: /*#__PURE__*/React.createElement(PIcon, {
      name: "activity",
      size: 18,
      color: "var(--accent)"
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Deploys \xB7 7d",
    value: "9",
    delta: "+2",
    deltaTone: "success",
    icon: /*#__PURE__*/React.createElement(PIcon, {
      name: "rocket",
      size: 18,
      color: "var(--accent)"
    })
  })), /*#__PURE__*/React.createElement(SectionHead, {
    action: /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--text-accent)"
      }
    }, "VIEW ALL")
  }, "Recent support"), /*#__PURE__*/React.createElement(TicketsTable, null), /*#__PURE__*/React.createElement(SectionHead, {
    action: /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--text-accent)"
      }
    }, "VIEW ALL")
  }, "Latest deployments"), /*#__PURE__*/React.createElement(Deployments, null));
}
function NewTicketDialog({
  open,
  onClose
}) {
  const [sent, setSent] = React.useState(false);
  React.useEffect(() => {
    if (open) setSent(false);
  }, [open]);
  return /*#__PURE__*/React.createElement(Dialog, {
    open: open,
    onClose: onClose,
    width: 480,
    title: sent ? "Ticket created" : "New support ticket",
    description: sent ? "KB-2042 is in the queue. Your team has been notified." : "Describe the issue — our on-call engineer is paged for High priority.",
    footer: sent ? /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onClose
    }, "Done") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setSent(true)
    }, "Create ticket"))
  }, !sent && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Summary",
    placeholder: "Short description of the issue"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Priority",
    options: ["Low", "Medium", "High"],
    defaultValue: "Medium"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Area",
    options: ["API", "Web app", "Data", "Infrastructure"]
  })), /*#__PURE__*/React.createElement(Textarea, {
    label: "Details",
    rows: 3,
    placeholder: "Steps to reproduce, impact, anything we should know\u2026"
  })));
}
const TITLES = {
  overview: "Overview",
  tickets: "Support",
  deploys: "Deployments",
  activity: "Activity",
  billing: "Billing"
};
function PortalApp() {
  const [active, setActive] = React.useState("overview");
  const [newTicket, setNewTicket] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      background: "var(--bg-canvas)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: active,
    setActive: setActive
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    title: TITLES[active],
    onNew: () => setNewTicket(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "8px 28px 40px"
    }
  }, active === "tickets" ? /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 22
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    defaultValue: "open",
    tabs: [{
      label: "Open",
      value: "open",
      count: 12
    }, {
      label: "Mine",
      value: "mine",
      count: 3
    }, {
      label: "Closed",
      value: "closed"
    }],
    style: {
      marginBottom: 22
    }
  }), /*#__PURE__*/React.createElement(TicketsTable, null)) : active === "deploys" ? /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 22
    }
  }, /*#__PURE__*/React.createElement(Deployments, null)) : /*#__PURE__*/React.createElement(Overview, null))), /*#__PURE__*/React.createElement(NewTicketDialog, {
    open: newTicket,
    onClose: () => setNewTicket(false)
  }));
}
window.PortalApp = PortalApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/PortalApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/icons.jsx
try { (() => {
/* Krahnborn UI-kit icons — exact Lucide 2px-stroke paths, inline so kits
   stay self-contained. Exported to window for cross-script use. */
const KB_ICON_PATHS = {
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  "life-buoy": '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  "git-branch": '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "check-circle": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18.999 12.499 19 11a7 7 0 1 0-14 0c0 1.5-.41 2.956-1.738 4.326"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  "ticket": '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  "rocket": '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  "credit-card": '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>'
};
function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flexShrink: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: KB_ICON_PATHS[name] || ""
    }
  });
}
window.KBIcon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
