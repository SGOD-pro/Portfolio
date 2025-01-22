"use client";
import { motion } from "framer-motion";
import ShinyButton from "@/components/magicui/shiny-button";
import Link from "next/link";

const staggerContainer = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.3, // Set the stagger duration here
		},
	},
};

const textVariant = {
	hidden: { opacity: 0, y: 60 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const IntroSection = () => (
	<motion.div
		className="z-10"
		variants={staggerContainer}
		initial="hidden"
		animate="show"
	>
		<motion.h1 className="z-10 text-5xl" variants={textVariant}>
			Hey, I&apos;m <strong className="text-lime-600">Souvik Karmakar</strong>
		</motion.h1>
		<motion.p className="font-suse w-[40vw]" variants={textVariant}>
			As a passionate developer with a focus on building dynamic full-stack
			applications, I aim to blend creativity and functionality.
		</motion.p>
		<motion.div className="" variants={textVariant}>
			<Link href={"/cv/souvik_karmakar_cv.pdf"}>
				<ShinyButton
					text="Download CV"
					className="px-4 py-3 rounded-full mt-4"
				/>
			</Link>
			<Link href="/projects">
				<button className="rounded-full w-24 py-[9px] hover:bg-lime-500 transition-colors ml-4 font-light">
					Projects
				</button>
			</Link>
		</motion.div>
	</motion.div>
);

export default IntroSection;
