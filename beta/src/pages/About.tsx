import { ABOUT } from '../content/about';
import { LINES, byOrder } from '../content/lines';
import { Chip } from '../components/Chip';
import { Reveal } from '../components/Manual/Reveal';

export function About() {
  const lines = byOrder(LINES.map((l) => l.id));
  return (
    <>
      <Reveal i={3} as="p" className="lede">{ABOUT.lede}</Reveal>
      <Reveal i={4} as="p" className="body">{ABOUT.body}</Reveal>
      <Reveal i={5} className="board">
        <table>
          <caption className="sr-only">Lines leaving this station</caption>
          <thead>
            <tr className="board-h mono">
              <th scope="col">{ABOUT.board.line}</th>
              <th scope="col">{ABOUT.board.project}</th>
              <th scope="col" className="b-to">{ABOUT.board.appearsOn}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="board-r">
                <td>
                  <Chip line={l.id} size={24} />
                  <span className="sr-only">Line {l.code}</span>
                </td>
                <td className="b-name">{l.name}</td>
                <td className="mono b-to">{l.appearsOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </>
  );
}
