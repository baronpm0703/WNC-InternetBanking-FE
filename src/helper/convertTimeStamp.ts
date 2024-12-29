const formatTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    year: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return date.toLocaleString('en-US', options);
}
function formatToMonthYear(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);

  // Extract the month and year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${month}/${year}`;
}

const timeStampHelper =  { formatTimestamp, formatToMonthYear }
export default timeStampHelper;