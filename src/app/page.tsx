"use client";
const IntroSection = lazy(() => import("@/components/IntroSection"));
const TechGlobe = lazy(() => import("@/components/others/TechGlobe"));
import { motion } from "framer-motion";
import { lazy } from "react";

export default function Home() {
	return (
		<main className="flex items-center text-white h-[100dvh]">
			<div className=" pl-28">
				<IntroSection />
			</div>
			<motion.div
				className="absolute top-0 right-0 "
				initial={{ scale: 0, opacity: 0 }}
				animate={{
					scale: 1,
					opacity: 1,
					transition: { ease: "easeOut", duration: 0.6 },
				}}
			>
				<TechGlobe />
			</motion.div>
		</main>
	);
}
