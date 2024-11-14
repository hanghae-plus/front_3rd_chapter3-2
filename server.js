import { randomUUID } from 'crypto';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import express from 'express';

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(express.json());

let memoryEvents = { events: [] };

const getEvents = async () => {
  if (process.env.NODE_ENV === 'test') {
    return memoryEvents; // 테스트 환경에서는 메모리 내 데이터를 사용
  } else {
    const data = await readFile(`${__dirname}/src/__mocks__/response/realEvents.json`, 'utf8');
    return JSON.parse(data);
  }
};

const saveEvents = (events) => {
  if (process.env.NODE_ENV === 'test') {
    memoryEvents = events; // 테스트 환경에서는 메모리에 데이터 저장
  } else {
    fs.writeFileSync(`${__dirname}/src/__mocks__/response/realEvents.json`, JSON.stringify(events));
  }
};

app.get('/api/events', async (_, res) => {
  const events = await getEvents();
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  const events = await getEvents();
  const newEvent = { id: randomUUID(), ...req.body };
  const updatedEvents = { events: [...events.events, newEvent] };

  saveEvents(updatedEvents);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const eventIndex = events.events.findIndex((event) => event.id === id);

  if (eventIndex > -1) {
    const newEvents = [...events.events];
    newEvents[eventIndex] = { ...events.events[eventIndex], ...req.body };
    saveEvents({ events: newEvents });

    res.json(newEvents[eventIndex]);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const updatedEvents = { events: events.events.filter((event) => event.id !== id) };

  saveEvents(updatedEvents);
  res.status(204).send();
});

app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = `repeat-${Date.now()}`;

  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined,
      },
    };
  });

  saveEvents({ events: [...events.events, ...newEvents] });
  res.status(201).json(newEvents);
});

app.put('/api/events-list', async (req, res) => {
  const events = await getEvents();
  let isUpdated = false;

  const newEvents = [...events.events];
  req.body.events.forEach((event) => {
    const eventIndex = events.events.findIndex((target) => target.id === event.id);
    if (eventIndex > -1) {
      isUpdated = true;
      newEvents[eventIndex] = { ...events.events[eventIndex], ...event };
    }
  });

  if (isUpdated) {
    saveEvents({ events: newEvents });
    res.json(newEvents);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const id = req.body.eventId;
  const updatedEvents = { events: events.events.filter((event) => event.repeat.id !== id) };

  saveEvents(updatedEvents);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
