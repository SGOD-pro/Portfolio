import TypingAnimation from "@/components/magicui/typing-animation";
function Heading() {
	return (
		<TypingAnimation
			className="text-4xl font-bold text-black dark:text-white"
			text="Building Seamless Digital Experiences"
            duration={200}
		/>
	);
}

export default Heading;
