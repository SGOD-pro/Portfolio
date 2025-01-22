"use client";
import React from "react";
import Link from "next/link";
import {
	Code,
	HomeIcon,
	FolderGit2,
	Nfc,
	Github,
	Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { usePathname } from "next/navigation";

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
	navbar: [
		{ href: "/", icon: HomeIcon, label: "Home" },
		{ href: "/me", icon: Code, label: "Me" },
		{ href: "/projects", icon: FolderGit2, label: "Projects" },
	],
	contact: {
		social: {
			GitHub: {
				name: "GitHub",
				url: "https://github.com/SGOD-pro",
				icon: Github,
			},
			Linkedin: {
				name: "Linkedin",
				url: "https://www.linkedin.com/in/souvik-karmakar-578097274/",
				icon: Linkedin,
			},

			Engage: {
				name: "Engage",
				url: "/engage",
				icon: Nfc,
			},
		},
	},
};

function Docbar() {
	const pathname = usePathname();
	return (
		<TooltipProvider>
			<Dock direction="middle" className="bg-gray-900/30">
				{DATA.navbar.map((item) => (
					<DockIcon key={item.label}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									href={item.href}
									className={cn(
										buttonVariants({
											variant: "ghost",
											size: "icon",
											className:
												" size-12 rounded-full hover:bg-lime-500/70 hover:text-black" +
												(pathname == item.href
													? " bg-lime-500/90 text-black w-11 h-11"
													: ""),
										})
									)}
								>
									<item.icon className="size-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p>{item.label}</p>
							</TooltipContent>
						</Tooltip>
					</DockIcon>
				))}
				<Separator orientation="vertical" className="h-full" />
				{Object.entries(DATA.contact.social).map(([name, social]) => (
					<DockIcon key={name}>
						<Tooltip>
							<TooltipTrigger asChild>
								{name !== "Engage" ? (
									<Link
										href={social.url}
										className={cn(
											buttonVariants({
												variant: "ghost",
												size: "icon",
												className: "hover:bg-slate-800/30",
											}),
											"size-12 rounded-full"
										)}
									>
										<social.icon className="size-4" />
									</Link>
								) : (
									<Link
										href={social.url}
										className={cn(
											buttonVariants({
												variant: "ghost",
												size: "icon",
												className: "hover:bg-slate-800/30",
											}),
											"size-12 rounded-full"
										)}
									>
										<social.icon className="size-4" />
									</Link>
								)}
							</TooltipTrigger>
							<TooltipContent>
								<p>{name}</p>
							</TooltipContent>
						</Tooltip>
					</DockIcon>
				))}
			</Dock>
		</TooltipProvider>
	);
}
export default Docbar;
