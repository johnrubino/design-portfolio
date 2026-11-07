import { ABOUT } from '../content/about';
import { LINES, byDisc } from '../content/lines';
import { Disc } from '../components/Disc';
import { Reveal } from '../components/Manual/Reveal';

export function About() {
  const lines = byDisc(LINES.map((l) => l.id));
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
              <th scope="col">{ABOUT.board.destination}</th>
              <th scope="col" className="b-to">{ABOUT.board.callsAt}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="board-r">
                <td>
                  <Disc line={l.id} size={22} fontSize={11} />
                  <span className="sr-only">Line {l.disc}</span>
                </td>
                <td className="b-name">{l.name}</td>
                <td className="mono b-to">{l.callsAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </>
  );
}
