"use client";

import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({
  children,
  className = "",
  as: Component = "div",
}: {
  children: React.ReactNode[];
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const shouldAnimate = reduce === false;

  return (
    <Component className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
          animate={reduce === true ? { opacity: 1, y: 0 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={
            reduce === true
              ? { duration: 0 }
              : {
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          className="relative h-full"
        >
          {child}
        </motion.div>
      ))}
    </Component>
  );
}

export function RevealFade({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const shouldAnimate = reduce === false;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
      animate={reduce === true ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        reduce === true
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
