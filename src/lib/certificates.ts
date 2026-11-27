export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: "Hackathon" | "Course Completion" | "Professional Certification";
  recipient: string;
  date: string;
  fileName: string;
  fileSize: string;
  credentialId?: string;
  description: string;
  skills: string[];
  pdfUrl?: string;
}

export const RESUME_URL =
  "https://drive.google.com/file/d/165G0scNbWuux1aZ_VwSSXlds1Hw2-AL6/view?usp=drive_link";

export const CERTIFICATES: Certificate[] = [
  {
    id: "team-bro-code",
    title: "Team Bro Code — National Hackathon Finalist",
    issuer: "National Hackathon Summit",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "09-TEAM-BRO-CODE.pdf",
    fileSize: "3.1 MB",
    pdfUrl:
      "https://drive.google.com/file/d/1_mdVutDZt_Gb-jvnJCBgWcB-rgyquO9K/view?usp=drive_link",
    description:
      "Engineered collaborative multi-tenant fullstack architecture under 24-hour hackathon constraints with real-time sync.",
    skills: ["Real-time Systems", "System Architecture", "Hackathon Finalist"],
  },
  {
    id: "hta-gdg",
    title: "Hack the App (HTA) — GDG Hackathon",
    issuer: "Google Developer Groups (GDG)",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "hta-gdg-certificate-souvik_karmakar (1).pdf",
    fileSize: "16 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1mWHtS5A7mGEs-t9Anwf8GHbWSv4XLnkA/view?usp=drive_link",
    description:
      "Awarded by Google Developer Groups (GDG) for engineering competition excellence and rapid prototype development in Hack the App.",
    skills: ["Fullstack Architecture", "API Integration", "Fast Prototyping", "GDG Hackathon"],
  },
  {
    id: "konverge",
    title: "Konverge Tech Hackathon & Innovation",
    issuer: "Konverge Technical Fest",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "Konverge_Certificate_668602 (1).pdf",
    fileSize: "301 KB",
    credentialId: "668602",
    pdfUrl:
      "https://drive.google.com/file/d/1weaQ7TXa5qtVFpC2GiWVGuru-vEmS6lT/view?usp=drive_link",
    description:
      "Competitive hackathon award for scalable software system architecture, component modularity, and applied developer tooling.",
    skills: ["Component Systems", "Modular Architecture", "Technical Delivery"],
  },
  {
    id: "launched-course",
    title: "LaunchED Fullstack & Systems Course Completion",
    issuer: "LaunchED Technical Academy",
    category: "Course Completion",
    recipient: "Souvik Karmakar",
    date: "2024",
    fileName: "LanchED course completion.pdf",
    fileSize: "251 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1k6gIVKhC5p7LCj84Rt5RZERuAn2vAx5y/view?usp=drive_link",
    description:
      "Rigorous technical course completion curriculum covering advanced TypeScript, distributed systems concepts, and production cloud pipelines.",
    skills: ["Fullstack Web Development", "Advanced TypeScript", "Cloud Deployment"],
  },
  {
    id: "launchpaded",
    title: "LaunchpadED Developer Engineering Certification",
    issuer: "LaunchpadED Accreditation",
    category: "Professional Certification",
    recipient: "Souvik Karmakar",
    date: "2024",
    fileName: "LanchpadED.pdf",
    fileSize: "750 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1pRZvD_DIrCO43jc0wBblyVWA40bH_1Qz/view?usp=drive_link",
    description:
      "Professional accreditation verifying engineering proficiency in frontend performance, type-safe APIs, and responsive design systems.",
    skills: ["Frontend Engineering", "Type Safety", "Performance Optimization"],
  },
];
