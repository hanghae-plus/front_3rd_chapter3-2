import { setupWorker } from 'msw/browser';

import { handlers } from './BrowserHandler';

export const worker = setupWorker(...handlers);
