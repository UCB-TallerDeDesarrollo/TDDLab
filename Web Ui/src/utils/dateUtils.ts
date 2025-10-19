export function formatDate(dateString: string): string {
  const datePart = dateString.substring(0, 10);
  const [year, month, day] = datePart.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}