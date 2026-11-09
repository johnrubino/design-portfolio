import { Hero } from './components/Hero';
import { HowIAI } from './components/HowIAI';
import { Rail } from './components/Rail';
import { StopList } from './components/StopList';

/** The v5 home page: a side rail (the map) and one content column. */
export function App() {
  return (
    <div className="app">
      <Rail />
      <main className="main">
        <Hero />
        <HowIAI />
        <StopList />
      </main>
    </div>
  );
}
