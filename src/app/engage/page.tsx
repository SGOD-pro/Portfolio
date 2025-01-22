
import React from "react";
import WavyBackground from "@/components/ui/wavy-background";
import ContactForm from "@/components/ContactForm";
import { motion } from "framer-motion";
export const metadata = {
	title: "Engage Me",
	description:
		"Contact Souvik Karmakar for any collaboration or development inquiries.",
};

function Contact() {
	return (
		<div className="w-full h-[100dvh] overflow-hidden flex items-center justify-center">
			<div className="fixed top-0 left-0 -z-10">
				<WavyBackground />
			</div>
			<div className="h-[85dvh] w-1/2 ">
				
				<ContactForm />
			</div>
		</div>
	);
}

export default Contact;
