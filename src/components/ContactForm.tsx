"use client";
import { motion } from "framer-motion";
import React, { useState } from "react";

const ContactForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});

	const [errors, setErrors] = useState({
		name: "",
		email: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const validateForm = () => {
		let valid = true;
		let newErrors = { name: "", email: "", message: "" };

		if (!formData.name) {
			newErrors.name = "Name is required";
			valid = false;
		}

		if (
			!formData.email ||
			!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
		) {
			newErrors.email = "Valid email is required";
			valid = false;
		}

		if (!formData.message) {
			newErrors.message = "Message cannot be empty";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (validateForm()) {
			console.log("Form submitted successfully:", formData);
			// You can handle the form submission here (send to an API, etc.)
		}
	};

	return (
		<>
        <div className="text-center mb-8">
            
        
			<motion.h1
				className="text-4xl font-bold text-lime-500 leading-none"
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				Let’s Build Something Awesome Together!
			</motion.h1>
			<motion.p
				className="mt-4 g text-gray-600 leading-none"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				Got a project, question, or just want to say hi? I’m always open to new
				ideas and collaborations.
			</motion.p>
            </div>
			<motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
				onSubmit={handleSubmit}
				className="max-w-lg mx-auto p-4 border rounded-lg backdrop-blur-lg"
			>
				<div className="mb-4">
					<label className="block text-sm font-medium  " htmlFor="name">
						Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={formData.name}
						onChange={handleChange}
						className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
					/>
					{errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium  " htmlFor="email">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
					/>
					{errors.email && (
						<p className="text-red-500 text-xs">{errors.email}</p>
					)}
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium  " htmlFor="message">
						Message
					</label>
					<textarea
						id="message"
						name="message"
						rows={5}
						value={formData.message}
						onChange={handleChange}
						className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
					></textarea>
					{errors.message && (
						<p className="text-red-500 text-xs">{errors.message}</p>
					)}
				</div>

				<div className="text-right">
					<button
						type="submit"
						className="px-4 py-2 bg-lime-500 text-white rounded-full hover:bg-lime-600 transition"
					>
						Send Message
					</button>
				</div>
			</motion.form>
		</>
	);
};

export default ContactForm;
