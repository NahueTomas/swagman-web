import { useEffect, useRef, useState } from "react";

// Animation variants
type AnimationVariant = "slide" | "fade" | "slide-fade" | "zoom" | "bounce";

interface CollapseProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
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
  variant = "slide-fade",
  duration = 300,
}: CollapseProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(active ? "auto" : "0px");

  useEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    const onTransitionEnd = () => {
      // When animation completes and element is active, set height to auto
      if (active) {
        setHeight("auto");
      }
    };

    content.addEventListener("transitionend", onTransitionEnd);

    // First set a fixed height regardless of state change direction
    const scrollHeight = content.scrollHeight;

    // Use requestAnimationFrame to make the animation smoother
    requestAnimationFrame(() => {
      if (active) {
        // First explicitly set height to 0
        setHeight("0px");
        // Force a reflow
        content.offsetHeight;
        // Then animate to full height
        setHeight(`${scrollHeight}px`);
      } else {
        // First set current height explicitly
        setHeight(`${scrollHeight}px`);
        // Force a reflow
        content.offsetHeight;
        // Then animate to 0
        requestAnimationFrame(() => {
          setHeight("0px");
        });
      }
    });

    return () => {
      content.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [active]);

  // Handle content changes by updating height when active
  useEffect(() => {
    if (active && height === "auto" && contentRef.current) {
      // Update height if content changes while expanded
      const scrollHeight = contentRef.current.scrollHeight;

      setHeight(`${scrollHeight}px`);
      // We need to trigger a reflow to ensure animation works
      contentRef.current.offsetHeight;
      // Then immediately set back to auto to adapt to changes
      setHeight("auto");
    }
  }, [children, active]);

  // Generate animation classes based on the variant
  const getAnimationClasses = () => {
    // Base transition classes
    const transitionBase = `transition-all duration-${duration} overflow-hidden`;

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
      transitionProperty: "height, opacity, transform",
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

  return (
    <div
      ref={contentRef}
      className={getAnimationClasses()}
      style={getAnimationStyles()}
    >
      <div
        className={
          variant === "zoom" || variant === "bounce"
            ? "transform transition-transform duration-300"
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
};
