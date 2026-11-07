import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CASE_STUDIES, WALKTHROUGH_COPY as COPY } from '../content/caseStudies';
import { LINKS } from '../content/site';

/**
 * "Request walkthrough" form. Posts JSON to /api/walkthrough (Resend), or to
 * VITE_WALKTHROUGH_ENDPOINT if set (e.g. a Formspree URL). In `npm run dev`
 * with no endpoint configured it stubs a successful send.
 */
const ENDPOINT: string = import.meta.env.VITE_WALKTHROUGH_ENDPOINT || '/api/walkthrough';
const STUB =
  import.meta.env.VITE_WALKTHROUGH_STUB === '1' || (import.meta.env.DEV && !import.meta.env.VITE_WALKTHROUGH_ENDPOINT);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = 'editing' | 'sending' | 'sent' | 'error';
type Errors = Partial<Record<'name' | 'email' | 'project', string>>;

export function WalkthroughDialog({ project, onClose }: { project: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [status, setStatus] = useState<Status>('editing');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) {
      setStatus('editing');
      setErrors({});
      d.showModal();
    } else if (!project && d.open) d.close();
  }, [project]);

  const validate = (data: FormData): Errors => {
    const e: Errors = {};
    if (String(data.get('name') ?? '').trim().length < 2) e.name = 'Enter your name.';
    if (!EMAIL_RE.test(String(data.get('email') ?? '').trim())) e.email = 'Enter a valid work email, like name@company.com.';
    if (!String(data.get('project') ?? '')) e.project = 'Choose a project.';
    return e;
  };

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus('sending');
    try {
      if (STUB) await new Promise((r) => setTimeout(r, 500));
      else {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(data)),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const field = (name: keyof Errors) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-err` : undefined,
  });

  return (
    <dialog ref={ref} className="wt" aria-labelledby={`${id}-title`} onClose={onClose}>
      <div className="wt-plate">
        <h2 id={`${id}-title`} className="wt-title">
          {status === 'sent' ? COPY.doneTitle : COPY.title}
        </h2>
        <button type="button" className="wt-x" onClick={onClose} aria-label="Close">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 100 100">
            <path d="M14 14 L86 86 M86 14 L14 86" stroke="currentColor" strokeWidth="14" />
          </svg>
        </button>
      </div>
      {status === 'sent' ? (
        <div className="wt-body">
          <p className="body" role="status">{COPY.done}</p>
          <button type="button" className="wt-btn" onClick={onClose} autoFocus>Done</button>
        </div>
      ) : (
        <form className="wt-body" noValidate onSubmit={submit}>
          <p className="body">{COPY.intro}</p>
          <label htmlFor={`${id}-name`}>Name</label>
          <input {...field('name')} type="text" autoComplete="name" required />
          {errors.name && <p className="wt-err" id={`${id}-name-err`}>{errors.name}</p>}

          <label htmlFor={`${id}-email`}>Work email</label>
          <input {...field('email')} type="email" autoComplete="email" inputMode="email" required />
          {errors.email && <p className="wt-err" id={`${id}-email-err`}>{errors.email}</p>}

          <label htmlFor={`${id}-project`}>Project</label>
          <select {...field('project')} defaultValue={project ?? ''} key={project ?? ''} required>
            <option value="" disabled>Choose a project</option>
            {CASE_STUDIES.map((c) => (
              <option key={c.title} value={c.title}>{c.title}</option>
            ))}
          </select>
          {errors.project && <p className="wt-err" id={`${id}-project-err`}>{errors.project}</p>}

          {/* Honeypot: real people never see or fill this. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="wt-hp" aria-hidden="true" />

          {status === 'error' && (
            <p className="wt-err" role="alert">
              {COPY.error} <a href={LINKS.email}>Email</a>
            </p>
          )}
          <button type="submit" className="wt-btn" disabled={status === 'sending'}>
            {status === 'sending' ? COPY.sending : COPY.submit}
          </button>
        </form>
      )}
    </dialog>
  );
}
