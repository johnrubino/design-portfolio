import { CONTACT, WORK_HISTORY, RESUME_INTRO } from '../content/resume';
import { Reveal } from '../components/Manual/Reveal';

export function Resume() {
  return (
    <>
      <Reveal i={3} as="p" className="body">{RESUME_INTRO}</Reveal>
      <Reveal i={4} className="board">
        <table>
          <caption className="sr-only">Work history</caption>
          <thead>
            <tr className="board-h mono tt">
              <th scope="col">When</th>
              <th scope="col">Where</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            {WORK_HISTORY.map((r) => (
              <tr key={r.where} className="board-r tt">
                <td className="mono">{r.when}</td>
                <td className="b-name">{r.where}</td>
                <td>{r.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
      <Reveal i={5} className="contact">
        {CONTACT.map((c) => (
          <a key={c.label} href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
            {c.label}
          </a>
        ))}
      </Reveal>
    </>
  );
}
