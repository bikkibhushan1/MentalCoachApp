import moment from 'moment';

export const getMonthRange = (currentDate = new Date(), range = 'month') => {
  currentDate = moment(currentDate);
  let year = currentDate.get('year');
  let month = currentDate.get('month') + 1;
  month = month < 10 ? `0${month}` : month;
  let startDate = `${year}-${month}-01`;
  let endDate = `${year}-${month}-31`;
  if (range == 'year') {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  }
  if (range == 'week') {
    endDate = currentDate.format('YYYY-MM-DD');
    startDate = currentDate.subtract(6, 'days').format('YYYY-MM-DD');
  }
  if (range === 'fortnight') {
    endDate = moment(currentDate)
      .add(7, 'days')
      .format('YYYY-MM-DD');
    startDate = moment(currentDate)
      .subtract(7, 'days')
      .format('YYYY-MM-DD');
  }
  console.log({
    startDate,
    endDate,
  });
  return {
    startDate,
    endDate,
  };
};

export function formatDateString(dateString, inputFormat, outputFormat) {
  let date = moment(dateString, inputFormat);
  return date.format(outputFormat);
}

export function isCurrentMonth(date) {
  return moment().format('M YYYY') === moment(date).format('M YYYY');
}

export function isFutureDate(date) {
  return moment().valueOf() < date.valueOf();
}
