"use client";
import SkillCards from "@/components/SkillCards";
import { motion } from "framer-motion";
import React from "react";
import NumberTicker from "@/components/magicui/number-ticker";
import Image from "next/image";

const containerVariants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2, // Delay between each child animation
		},
	},
};

function About() {
	return (
		<div className="max-w-screen p-8">
			<motion.h1
				className="text-5xl font-bold text-lime-500 font-suse text-center my-9"
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				Crafting Solutions with Code & Creativity
			</motion.h1>
			<motion.p
				className="text-slate-700 w-2/3 text-center leading-tight m-auto mb-16"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				Combining the power of innovative coding with a creative mindset, I
				build solutions that are not only functional but also intuitive and
				visually engaging. From the initial concept to the final product, I aim
				to deliver seamless user experiences, leveraging the latest technologies
				and thoughtful design to solve real-world challenges.
			</motion.p>
			<section className="">
				<motion.h2
					className="text-3xl font-medium my-4"
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					Tools, Technologies & Techniques I Excel At
				</motion.h2>
				<motion.div
					className="flex flex-wrap gap-5 justify-around"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={76} />
								<div className="flex items-center justify-center gap-4 border-l pl-4">
									<h2 className="text-4xl">Next.js</h2>

									<Image
										src={"/images/nextjs.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>1.5 year experience with Next.js</li>
									<li>Worked with MongoDB for scalable databases</li>
									<li>Used Zod for schema validation</li>
									<li>Experience with Prisma ORM</li>
									<li>Integrated Firebase for auth and fire-store data</li>
									<li>Used Tailwind CSS for responsive styling</li>
									<li>Implemented animations with Framer Motion</li>
									<li>Used Zustand/Redux for state management</li>
									<li>Experience with React Hook Form for validation</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={55} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">Django</h2>

									<Image
										src={"/images/django.webp"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>6 Months experience with Django.</li>
									<li>
										Worked with sqllite{"("}default{")."}
									</li>
									<li>Using Bootstrap for ui.</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={70} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">Python</h2>

									<Image
										src={"/images/python.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>1 year experience with Python</li>
									<li>Worked with Numpy and Pandas</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={72} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">Java</h2>

									<Image
										src={"/images/java.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>1.5 year experience with Java</li>
									<li>Worked with Collection</li>
									<li>
										Develop web applications with Java{"("}JSP{")"}
									</li>
									<li>Using bootstrap for ui</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={70} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">C/C++</h2>

									<Image
										src={"/images/c.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>2 year experience with C/C++</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={45} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">Rust</h2>

									<Image
										src={"/images/rust.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>3 months experience with C/C++</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={45} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl">Go lang</h2>

									<Image
										src={"/images/golang.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>3 months experience with Go lang</li>
								</ul>
							</div>
						</div>
					</SkillCards>
					<SkillCards>
						<div className="w-80 h-[22rem] p-4">
							<div className="flex items-center gap-3 border-b pb-4">
								<NumberTicker value={50} />
								<div className="flex items-center justify-center gap-4 border-l pl-5">
									<h2 className="text-4xl tracking-tight">
										R Native<sub className="text-xs uppercase">cli</sub>
									</h2>

									<Image
										src={"/images/react.png"}
										alt="next"
										width={250}
										height={250}
										className=" w-20 h-20 p-2  border-2 border-white rounded-full object-fit"
									></Image>
								</div>
							</div>
							<div className="text-base mt-2 w-full border0">
								<ul className="list-disc font-light break-words text-sm">
									<li>3 months experience with React native</li>
									<li>Using tailwind for styling</li>
								</ul>
							</div>
						</div>
					</SkillCards>
				</motion.div>
			</section>
		</div>
	);
}

export default About;
