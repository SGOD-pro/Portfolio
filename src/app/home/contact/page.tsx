"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef);

  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!formState.name.trim()) nextErrors.name = "Please enter your name";
    if (!formState.email.trim()) {
      nextErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!formState.subject.trim()) nextErrors.subject = "Please enter a subject";
    if (!formState.message.trim()) nextErrors.message = "Please enter your message";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitted(true);
    // Create mailto URL
    const mailtoSubject = encodeURIComponent(`[Portfolio] ${formState.subject} from ${formState.name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`
    );
    window.location.href = `mailto:souvik.dev07@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("souvik.dev07@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt at top left */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">contact</span>
      </div>

      <header className="mt-1.5 mb-3">
        <TextReveal
          text="Contact"
          className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
          delay={0.16}
          stagger={0.025}
        />
        <p data-reveal className="mt-0.5 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
          Reach out for software engineering opportunities, contract projects, or technical collaboration.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-12 grow items-start">
        {/* Contact Form Section */}
        <section
          data-reveal
          className="lg:col-span-7 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        >
          <h2 className="text-base sm:text-lg font-sans font-semibold text-foreground mb-3">
            Send a Message
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-sans font-medium text-foreground mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Alex Chen"
                  value={formState.name}
                  onChange={handleChange("name")}
                  className={`w-full rounded-lg border bg-white/[0.03] px-3 py-1.5 text-xs font-sans text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent ${
                    errors.name ? "border-danger/70 ring-1 ring-danger/60" : "border-white/15"
                  }`}
                />
                {errors.name && <p className="mt-1 text-[11px] text-danger font-sans">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-sans font-medium text-foreground mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. alex@example.com"
                  value={formState.email}
                  onChange={handleChange("email")}
                  className={`w-full rounded-lg border bg-white/[0.03] px-3 py-1.5 text-xs font-sans text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent ${
                    errors.email ? "border-danger/70 ring-1 ring-danger/60" : "border-white/15"
                  }`}
                />
                {errors.email && <p className="mt-1 text-[11px] text-danger font-sans">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-sans font-medium text-foreground mb-1">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                placeholder="e.g. Fullstack Engineer Role / Project Inquiry"
                value={formState.subject}
                onChange={handleChange("subject")}
                className={`w-full rounded-lg border bg-white/[0.03] px-3 py-1.5 text-xs font-sans text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent ${
                  errors.subject ? "border-danger/70 ring-1 ring-danger/60" : "border-white/15"
                }`}
              />
              {errors.subject && <p className="mt-1 text-[11px] text-danger font-sans">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-sans font-medium text-foreground mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={3}
                placeholder="Describe your role, project, or question..."
                value={formState.message}
                onChange={handleChange("message")}
                className={`w-full rounded-lg border bg-white/[0.03] px-3 py-1.5 text-xs font-sans text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent leading-relaxed ${
                  errors.message ? "border-danger/70 ring-1 ring-danger/60" : "border-white/15"
                }`}
              />
              {errors.message && <p className="mt-1 text-[11px] text-danger font-sans">{errors.message}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-muted font-sans">
                Opens your default email client to send directly.
              </p>
              <button
                type="submit"
                className="rounded-lg bg-accent text-accent-foreground px-3.5 py-1.5 text-xs font-sans font-medium hover:opacity-95 transition shadow-[0_2px_12px_rgba(180,96,4,0.3)] cursor-pointer"
              >
                Send via Email →
              </button>
            </div>

            {submitted && (
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs font-sans text-foreground">
                Email draft opened in your email client. If it did not open automatically, you can also write directly to{" "}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="font-mono text-accent underline ml-1 cursor-pointer"
                >
                  souvik.dev07@gmail.com
                </button>
                .
              </div>
            )}
          </form>
        </section>

        {/* Direct Channels Sidebar */}
        <aside className="lg:col-span-5 flex flex-col gap-4" data-reveal>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h2 className="text-xs uppercase tracking-wider text-muted font-sans font-semibold pb-3 border-b border-white/10">
              Direct Channels
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5">
                <p className="text-xs font-sans text-muted">Email</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href="mailto:souvik.dev07@gmail.com"
                    className="text-sm font-mono text-foreground hover:text-accent truncate"
                  >
                    souvik.dev07@gmail.com
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="rounded border border-white/10 px-2 py-0.5 text-xs font-mono text-muted hover:text-foreground shrink-0 cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5">
                <p className="text-xs font-sans text-muted">GitHub</p>
                <div className="mt-1">
                  <Link
                    href="https://github.com/SGOD-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-accent hover:underline inline-flex items-center gap-1"
                  >
                    github.com/SGOD-pro ↗
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5">
                <p className="text-xs font-sans text-muted">LinkedIn</p>
                <div className="mt-1">
                  <Link
                    href="https://linkedin.com/in/souvik-karmakar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-accent hover:underline inline-flex items-center gap-1"
                  >
                    linkedin.com/in/souvik-karmakar ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
