import { GranType, millisecondsInHour } from './../constants';
import { Interval } from './../nf-dto';

export function convertMilSecondToEpoch(value: number): number {
  return isNaN(value) ? 0 : value / 1000;
}

export function convertEpochToMillisecond(value: number): number {
  return isNaN(value) ? 0 : value * 1000;
}

export function hourlyCeiling(value: number): number {
  if (isNaN(value)) return value;
  value += millisecondsInHour - (value % millisecondsInHour);
  return value;
}

export function roundToDaily(value: number): number {
  if (isNaN(value)) return value;

  const millisecondsInDay = 24 * millisecondsInHour;
  value -= value % millisecondsInDay;
  return value;
}

export function granType(interval: Interval): GranType {
  const { from, to } = interval;

  const hours = (to - from) / millisecondsInHour;
  return hours > 24 ? GranType.DAILY : GranType.HOURLY;
}

export function roundedTime(timeGran: GranType, value: number): number {
  if (timeGran === GranType.HOURLY) {
    return hourlyCeiling(value);
  } else if (timeGran === GranType.DAILY) {
    return roundToDaily(value);
  }
}

export function isoDateStrToMillSec(value: string): number {
  return new Date(value)?.getTime();
}
