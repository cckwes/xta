import { Agenda, Job } from "agenda";
import { MongoClient } from "mongodb";

let agenda: Agenda;

const initialize = async (mongoClient: MongoClient): Promise<void> => {
  if (agenda) {
    return;
  }

  agenda = new Agenda({ mongo: mongoClient.db("xta") });
  await agenda.start();
};

const stop = async (): Promise<void> => {
  return agenda.stop();
};

const scheduleRepeatingTask = (
  name: string,
  handler: () => Promise<void>,
  interval: string,
): void => {
  agenda.define(name, handler);
  agenda.every(interval, name);
};

const getJobs = async (): Promise<Array<Job>> => {
  return agenda.jobs();
};

export { initialize, stop, scheduleRepeatingTask, getJobs };
