import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React, { useEffect } from "react";
import { MagicCard } from "./magicui/magic-card";

const SkillCards = ({ children }: { children: React.ReactNode }) => {
	const controls = useAnimation();
	const { ref, inView } = useInView({ threshold: 0.1 });

	useEffect(() => {
		if (inView) {
			controls.start({
				opacity: 1,
				y: 0,
				transition: { duration: 0.5 },
			});
		} else {
			controls.start({
				opacity: 0,
				y: 50,
			});
		}
	}, [inView, controls]);
	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 50 }}
			
			animate={controls}
			className="skill-card"
		>
			<MagicCard
				className="cursor-pointer flex-col items-center shadow-2xl whitespace-nowrap text-4xl w-96"
				gradientColor="#1E293B"
			>
				{children}
			</MagicCard>
		</motion.div>
	);
};

export default SkillCards;
