import { useEffect, useRef, useState } from "react";

// Animation variants
type AnimationVariant = "slide" | "fade" | "slide-fade" | "zoom" | "bounce";

interface CollapseProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
  classNameContent?: string;
  /**
   * Animation variant to use
   * @default 'slide-fade'
   */
  variant?: AnimationVariant;
  /**
   * Duration of the animation in milliseconds
   * @default 300
   */
  duration?: number;
}

export const Collapse = ({
  children,
  active,
  className = "",
  classNameContent = "",
  variant = "slide-fade",
  duration = 250,
}: CollapseProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>("0px");
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Initialize component with proper state on mount
  useEffect(() => {
    // Start with the correct initial state based on 'active' prop
    setHeight(active ? "auto" : "0px");

    // Mark initial render as complete after a frame
    requestAnimationFrame(() => {
      setIsInitialRender(false);

      // Mark component as ready after another frame
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    });
  }, []);

  // Handle active state changes after initial render
  useEffect(() => {
    // Skip effect during initial render
    if (isInitialRender || !isReady) return;

    const content = contentRef.current;

    if (!content) return;

    const onTransitionEnd = () => {
      // When animation completes and element is active, set height to auto
      if (active) {
        setHeight("auto");
      }
    };

    content.addEventListener("transitionend", onTransitionEnd);

    // Measure content height
    const scrollHeight = content.scrollHeight;

    if (active) {
      // First set fixed height if coming from auto
      if (height === "auto") {
        setHeight(`${scrollHeight}px`);
        // Force a reflow
        content.offsetHeight;
      }

      // For animation from closed to open
      // First ensure height is 0 if needed
      if (height === "0px") {
        // Then animate to full height (in next frame)
        requestAnimationFrame(() => {
          setHeight(`${scrollHeight}px`);
        });
      }
    } else {
      // For animation from open to closed

      // First ensure we have a fixed height
      if (height === "auto") {
        setHeight(`${scrollHeight}px`);
        // Force a reflow
        content.offsetHeight;
      }

      // Then animate to 0 (in next frame)
      requestAnimationFrame(() => {
        setHeight("0px");
      });
    }

    return () => {
      content.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [active, height, isInitialRender, isReady]);

  // Handle content changes by updating height when active
  useEffect(() => {
    if (
      !isInitialRender &&
      isReady &&
      active &&
      height === "auto" &&
      contentRef.current
    ) {
      // Update height if content changes while expanded
      const scrollHeight = contentRef.current.scrollHeight;

      setHeight(`${scrollHeight}px`);
      // We need to trigger a reflow to ensure animation works
      contentRef.current.offsetHeight;
      // Then immediately set back to auto to adapt to changes
      requestAnimationFrame(() => {
        setHeight("auto");
      });
    }
  }, [children, active, isInitialRender, isReady, height]);

  // Generate animation classes based on the variant
  const getAnimationClasses = () => {
    // Don't apply transitions during initial render
    const transitionBase = isReady
      ? `transition-all duration-${duration} overflow-hidden`
      : "overflow-hidden";

    const animationSpecific = {
      slide: "",
      fade: active ? "opacity-100" : "opacity-0",
      "slide-fade": active ? "opacity-100" : "opacity-0",
      zoom: active
        ? "opacity-100 scale-100 origin-top"
        : "opacity-0 scale-95 origin-top",
      bounce: active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
    };

    return `${transitionBase} ${
      animationSpecific[variant] || animationSpecific["slide-fade"]
    } ${className}`;
  };

  // Get dynamic styles based on variant
  const getAnimationStyles = () => {
    const baseStyles = {
      height,
      transitionProperty: isReady ? "height, opacity, transform" : "none",
      transitionTimingFunction:
        variant === "bounce"
          ? "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
          : "ease-in-out",
      transitionDuration: `${duration}ms`,
      overflow: "hidden", // Always use hidden to avoid content flash
    };

    // Add additional transform properties based on variant
    const variantStyles = {
      slide: {},
      fade: {},
      "slide-fade": {},
      zoom: {
        transform: active ? "scale(1)" : "scale(0.95)",
      },
      bounce: {
        transform: active ? "translateY(0)" : "translateY(-10px)",
      },
    };

    return {
      ...baseStyles,
      ...(variantStyles[variant] || variantStyles["slide-fade"]),
    };
  };

  // Apply immediate styles without animation for initial render
  if (isInitialRender) {
    return (
      <div
        ref={contentRef}
        className={`overflow-hidden ${className}`}
        style={{
          height: active ? "auto" : "0px",
          overflow: "hidden",
          visibility: active ? "visible" : "hidden",
          opacity: active ? 1 : 0,
        }}
      >
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={contentRef}
      className={getAnimationClasses()}
      style={getAnimationStyles()}
    >
      <div
        className={`${classNameContent} ${
          variant === "zoom" || variant === "bounce"
            ? "transform transition-transform duration-250"
            : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
