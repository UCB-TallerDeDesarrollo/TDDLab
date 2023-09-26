// Function to format a Date object as MM/DD/YYYY
export const formatDate = (date: Date | undefined | null) => {
  if (!date) {
    return ''; // Return an empty string if the date is undefined or null
  }

  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString(undefined, options);
};
