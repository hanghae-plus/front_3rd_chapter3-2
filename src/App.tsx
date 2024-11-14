import { Providers } from './app/providers';

import { EventViewerPage } from '@/pages/event/EventViewerPage';
function App() {
  return (
    <Providers>
      <EventViewerPage />;
    </Providers>
  );
}

export default App;
