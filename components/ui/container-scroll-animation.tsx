"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";



// ================= CONTAINER =================

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative h-[120rem] md:h-[140rem] flex items-center justify-center p-2 md:p-20"
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />

        <Card rotate={rotate} scale={scale} translate={translate}>
          {children}
        </Card>
      </div>
    </div>
  );
};



// ================= HEADER =================

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};



// ================= CARD =================

export const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  const [hovered, setHovered] = React.useState(false);

  const smoothRotate = useSpring(rotate, {
    stiffness: 60,
    damping: 20,
  });

  const smoothScale = useSpring(scale, {
    stiffness: 60,
    damping: 20,
  });

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        rotateX: hovered ? 0 : smoothRotate.get(),
        scale: hovered ? 1.03 : smoothScale.get(),
      }}
      transition={{
        type: "spring",
        stiffness: 30,
        damping: 20,
        mass: 1.5,
      }}
      style={{
        translateY: translate,
        transformStyle: "preserve-3d",
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#FF6B35] p-2 md:p-6 bg-[#1C1917] rounded-[30px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#FAF9F7] dark:bg-[#1C1917] md:p-4">
        {children}
      </div>
    </motion.div>
  );
};