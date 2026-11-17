"use client";

import { Separator } from "@heroui/react";
import { useRef, useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const nodes = [
  { id: "node_01", label: "email_uplink" },
  { id: "node_02", label: "github_repo" },
  { id: "node_03", label: "linkedin_prof" },
  { id: "node_04", label: "secure_signal" },
];

function Contact() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

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
    if (!formState.name.trim()) nextErrors.name = "Name is required";
    if (!formState.email.trim()) nextErrors.email = "Email is required";
    if (!formState.subject.trim()) nextErrors.subject = "Subject is required";
    if (!formState.message.trim()) nextErrors.message = "Message is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setStatus("error");
      return;
    }
    setStatus("success");
  };

  return (
    <div className="relative flex flex-col grow">
      <div className="my-1.5 flex items-center gap-2 text-[11px] font-mono">
        <span className="text-field-placeholder font-bold">
          souvik@portfolio:~$
        </span>
        <span className="text-command">contact</span>
      </div>

      <div className="mt-2 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-wider text-muted font-mono"
          >
            <p className="text-[10px] text-muted/80">{node.id}</p>
            <p className="mt-1 text-foreground font-semibold">{node.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="space-y-1.5 text-xs text-muted font-mono">
            <p className="flex items-center justify-between">
              <span>AI: authenticating uplink...</span>
              <span className="text-success">[success]</span>
            </p>
            <p className="flex items-center justify-between">
              <span>AI: encrypting data packet...</span>
              <span className="text-success">[ready]</span>
            </p>
            <p>AI: standing by for transmission...</p>
          </div>

          <Separator className="my-3 border-white/10" />

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 font-mono">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs uppercase tracking-wider text-muted">
                Sender Identity
                <input
                  className={`w-full rounded border bg-white/[0.03] px-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent ${
                    errors.name
                      ? "border-danger/70 ring-1 ring-danger/60"
                      : "border-white/15"
                  }`}
                  placeholder="Enter_Name_Records"
                  value={formState.name}
                  onChange={handleChange("name")}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className="text-[10px] text-danger">{errors.name}</span>
                )}
              </label>

              <label className="space-y-1.5 text-xs uppercase tracking-wider text-muted">
                Destination Hub
                <input
                  className={`w-full rounded border bg-white/[0.03] px-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent ${
                    errors.email
                      ? "border-danger/70 ring-1 ring-danger/60"
                      : "border-white/15"
                  }`}
                  placeholder="return_path@email.com"
                  value={formState.email}
                  onChange={handleChange("email")}
                  type="email"
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="text-[10px] text-danger">
                    {errors.email}
                  </span>
                )}
              </label>
            </div>

            <label className="space-y-1.5 text-xs uppercase tracking-wider text-muted block">
              Transmission Subject
              <input
                className={`w-full rounded border bg-white/[0.03] px-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent ${
                  errors.subject
                    ? "border-danger/70 ring-1 ring-danger/60"
                    : "border-white/15"
                }`}
                placeholder="payload_stream"
                value={formState.subject}
                onChange={handleChange("subject")}
                autoComplete="off"
              />
              {errors.subject && (
                <span className="text-[10px] text-danger">
                  {errors.subject}
                </span>
              )}
            </label>

            <label className="space-y-1.5 text-xs uppercase tracking-wider text-muted block">
              Payload Stream
              <textarea
                className={`min-h-[110px] w-full rounded border bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent font-mono leading-relaxed ${
                  errors.message
                    ? "border-danger/70 ring-1 ring-danger/60"
                    : "border-white/15"
                }`}
                placeholder="Awaiting raw text input for transmission cycle..."
                value={formState.message}
                onChange={handleChange("message")}
              />
              {errors.message && (
                <span className="text-[10px] text-danger">
                  {errors.message}
                </span>
              )}
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-muted">
                <p>CRC_CHECK: {status === "error" ? "fail" : "pass"}</p>
                <p>
                  BUF_STATE: {status === "success" ? "transmitted" : "nominal"}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {status === "error" && (
                  <span className="text-xs uppercase tracking-wider text-danger">
                    [missing fields]
                  </span>
                )}
                {status === "success" && (
                  <span className="text-xs uppercase tracking-wider text-success">
                    [packet sent]
                  </span>
                )}
                <button
                  type="submit"
                  className="rounded border border-accent/70 bg-accent/20 px-3.5 py-1.5 text-xs uppercase tracking-wider text-accent transition hover:border-accent hover:bg-accent/30 font-mono font-semibold cursor-pointer"
                >
                  Execute_Send
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className="lg:col-span-5">
          <div className="h-full rounded-xl border border-segment/70 bg-surface-secondary/60 p-5 shadow-[0_0_0_1px_var(--segment)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
              Uplink Status
            </p>
            <div className="mt-4 space-y-4 text-xs text-muted">
              <div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-segment">
                  Session
                </p>
                <p className="mt-2 text-foreground">
                  secure_signal handshake established
                </p>
              </div>
              <div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-segment">
                  Channel
                </p>
                <p className="mt-2 text-foreground">uplink://priority/alpha</p>
              </div>
              <div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-segment">
                  Availability
                </p>
                <p className="mt-2 text-foreground">
                  ready for secure transmission
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
