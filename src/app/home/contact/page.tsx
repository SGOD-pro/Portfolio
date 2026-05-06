"use client";

import { Separator } from '@heroui/react'
import { useRef, useState } from 'react'

type FormState = {
	name: string
	email: string
	subject: string
	message: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const nodes = [
	{ id: 'node_01', label: 'email_uplink' },
	{ id: 'node_02', label: 'github_repo' },
	{ id: 'node_03', label: 'linkedin_prof' },
	{ id: 'node_04', label: 'secure_signal' },
]

function Contact() {
	const formRef = useRef<HTMLFormElement | null>(null)
	const [formState, setFormState] = useState<FormState>({
		name: '',
		email: '',
		subject: '',
		message: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

	const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormState((prev) => ({ ...prev, [field]: event.target.value }))
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	const validate = () => {
		const nextErrors: FormErrors = {}
		if (!formState.name.trim()) nextErrors.name = 'Name is required'
		if (!formState.email.trim()) nextErrors.email = 'Email is required'
		if (!formState.subject.trim()) nextErrors.subject = 'Subject is required'
		if (!formState.message.trim()) nextErrors.message = 'Message is required'

		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!validate()) {
			setStatus('error')
			return
		}
		setStatus('success')
	}

	return (
		<div className="contact-shell relative h-full overflow-hidden rounded-xl border border-segment bg-surface/80 shadow-[0_0_0_1px_var(--segment)]">
			<div className="contact-grid absolute inset-0" />
			<div className="relative flex h-full flex-col px-6 py-5">
				<header className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
					<div className="flex items-center gap-3">
						<span className="text-[10px] uppercase tracking-[0.35em] text-segment">uplink_terminal.v4.0.2</span>
					</div>
					<div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-segment">
						<span>encryption: aes-256</span>
						<span>packet_loss: 0.00%</span>
						<span>latency: 12ms</span>
					</div>
				</header>

				<div className="mt-6 text-xs uppercase tracking-[0.3em] text-muted">&gt;&gt; fetching remote_access_nodes...</div>

				<div className="mt-4 grid gap-3 lg:grid-cols-4">
					{nodes.map((node) => (
						<div
							key={node.id}
							className="rounded-lg border border-segment/70 bg-surface-secondary/60 p-4 text-xs uppercase tracking-[0.3em] text-segment"
						>
							<p className="text-[10px] text-muted">{node.id}</p>
							<p className="mt-2 text-foreground">{node.label}</p>
						</div>
					))}
				</div>

				<div className="mt-6 grid gap-5 lg:grid-cols-12">
					<section className="lg:col-span-7">
						<div className="space-y-2 text-xs text-muted">
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

						<Separator className="my-4" />

						<form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<label className="space-y-2 text-xs uppercase tracking-[0.3em] text-segment">
									Sender Identity
									<input
										className={`w-full rounded-md border bg-overlay/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
											errors.name ? 'border-danger/70 ring-1 ring-danger/60' : 'border-segment/70'
										}`}
										placeholder="Enter_Name_Records"
										value={formState.name}
										onChange={handleChange('name')}
										autoComplete="name"
									/>
									{errors.name && <span className="text-[10px] text-danger">{errors.name}</span>}
								</label>

								<label className="space-y-2 text-xs uppercase tracking-[0.3em] text-segment">
									Destination Hub
									<input
										className={`w-full rounded-md border bg-overlay/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
											errors.email ? 'border-danger/70 ring-1 ring-danger/60' : 'border-segment/70'
										}`}
										placeholder="return_path@email.com"
										value={formState.email}
										onChange={handleChange('email')}
										type="email"
										autoComplete="email"
									/>
									{errors.email && <span className="text-[10px] text-danger">{errors.email}</span>}
								</label>
							</div>

							<label className="space-y-2 text-xs uppercase tracking-[0.3em] text-segment">
								Transmission Subject
								<input
									className={`w-full rounded-md border bg-overlay/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
										errors.subject ? 'border-danger/70 ring-1 ring-danger/60' : 'border-segment/70'
									}`}
									placeholder="payload_stream"
									value={formState.subject}
									onChange={handleChange('subject')}
									autoComplete="off"
								/>
								{errors.subject && <span className="text-[10px] text-danger">{errors.subject}</span>}
							</label>

							<label className="space-y-2 text-xs uppercase tracking-[0.3em] text-segment">
								Payload Stream
								<textarea
									className={`min-h-[140px] w-full rounded-md border bg-overlay/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
										errors.message ? 'border-danger/70 ring-1 ring-danger/60' : 'border-segment/70'
									}`}
									placeholder="Awaiting raw text input for transmission cycle..."
									value={formState.message}
									onChange={handleChange('message')}
									onKeyDown={(event) => {
										if (event.key === 'Enter' && !event.shiftKey) {
											event.preventDefault()
											formRef.current?.requestSubmit()
										}
									}}
								/>
								{errors.message && <span className="text-[10px] text-danger">{errors.message}</span>}
							</label>

							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="text-xs text-muted">
									<p>CRC_CHECK: {status === 'error' ? 'fail' : 'pass'}</p>
									<p>BUF_STATE: {status === 'success' ? 'transmitted' : 'nominal'}</p>
								</div>

								<div className="flex items-center gap-3">
									{status === 'error' && (
										<span className="text-xs uppercase tracking-[0.3em] text-danger">[missing fields]</span>
									)}
									{status === 'success' && (
										<span className="text-xs uppercase tracking-[0.3em] text-success">[packet sent]</span>
									)}
									<button
										type="submit"
										className="rounded-md border border-accent/70 bg-accent/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-accent transition hover:border-accent hover:bg-accent/25"
									>
										Execute_Send
									</button>
								</div>
							</div>
						</form>
					</section>

					<aside className="lg:col-span-5">
						<div className="h-full rounded-xl border border-segment/70 bg-surface-secondary/60 p-5 shadow-[0_0_0_1px_var(--segment)]">
							<p className="text-[10px] uppercase tracking-[0.3em] text-muted">Uplink Status</p>
							<div className="mt-4 space-y-4 text-xs text-muted">
								<div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
									<p className="text-[10px] uppercase tracking-[0.3em] text-segment">Session</p>
									<p className="mt-2 text-foreground">secure_signal handshake established</p>
								</div>
								<div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
									<p className="text-[10px] uppercase tracking-[0.3em] text-segment">Channel</p>
									<p className="mt-2 text-foreground">uplink://priority/alpha</p>
								</div>
								<div className="rounded-lg border border-segment/60 bg-overlay/60 p-4">
									<p className="text-[10px] uppercase tracking-[0.3em] text-segment">Availability</p>
									<p className="mt-2 text-foreground">ready for secure transmission</p>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	)
}

export default Contact
