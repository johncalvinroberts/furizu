import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import React, { useEffect, useState } from 'react';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1 minute',
    mm: '%d minutes',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
});

interface TimeDisplayProps {
  date: number | Date;
  className?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ date, className }) => {
  const [, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs()); // Update the current time every minute
    }, 60000);

    return () => {
      clearInterval(timer); // Clean up the interval on component unmount
    };
  }, []);

  const formatDate = (date: dayjs.Dayjs) => {
    const now = dayjs();
    const diffDays = now.diff(date, 'day');
    const withinLast24Hours = now.diff(date, 'hour') < 24;

    if (withinLast24Hours) {
      return date.from(now);
    } else {
      return `${date.format('DD/MM/YYYY')} (${diffDays} days ago)`;
    }
  };

  const inputDate = dayjs(date);
  return <div className={className}>{formatDate(inputDate)}</div>;
};

export default TimeDisplay;
