import { randomUUID } from 'crypto';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import express from 'express';

import { getNextDate } from './src/utils';

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(express.json());

const getEvents = async () => {
  const data = await readFile(`${__dirname}/src/__mocks__/response/realEvents.json`, 'utf8');

  return JSON.parse(data);
};

app.get('/api/events', async (_, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (error) {
    console.error('Error reading events:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/events', async (req, res) => {
  const events = await getEvents();
  const newEvent = { id: randomUUID(), ...req.body };

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, newEvent],
    })
  );

  res.status(201).json(newEvent);
});

app.post('/api/events/repeat', async (req, res) => {
  const events = await getEvents();
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat,
    notificationTime,
  } = req.body;

  const newEvents = [];
  let currentEventDate = new Date(date);
  const end = new Date(repeat.endDate || '2025-06-30');

  while (currentEventDate <= end) {
    // currentEventDate = adjustForLeapYear(currentEventDate);

    const eventToAdd = {
      id: randomUUID(),
      title,
      date: currentEventDate.toISOString().split('T')[0],
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
    };

    newEvents.push(eventToAdd);

    currentEventDate = getNextDate(currentEventDate, repeat.type, repeat.interval);
  }

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, ...newEvents],
    })
  );

  res.status(201).json(newEvents);
});

app.put('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const { id } = req.params;
  const eventIndex = events.events.findIndex((event) => event.id === id);
  if (eventIndex > -1) {
    const newEvents = [...events.events];
    newEvents[eventIndex] = { ...events.events[eventIndex], ...req.body };

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/realEvents.json`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events[eventIndex]);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const { id } = req.params;

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: events.events.filter((event) => event.id !== id),
    })
  );

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
