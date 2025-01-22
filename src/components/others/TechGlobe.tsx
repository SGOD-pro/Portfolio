import IconCloud from "@/components/magicui/icon-cloud";

const slugs = [
  "typescript",
  "javascript",
  "java",
  "react",
  "android",
  "html5",
  "css3",
  "express",
  "prisma",
  "firebase",
  "vercel",
  "docker",
  "git",
  "github",
  "visualstudiocode",
  "figma",
  "python",
  "nextjs",
  "nodejs",
  "mongodb",
  "django",
  "zod",
  "c",
  "go",
  "rust"

];

export default function TechGlobe() {
  return (
    <div className="relative flex h-full w-full max-w-[55rem] items-center justify-center overflow-hidden rounded-lg px-20 pb-20 pt-8 ">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
