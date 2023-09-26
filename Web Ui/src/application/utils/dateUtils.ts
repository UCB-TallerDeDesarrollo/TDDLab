// dateUtils.ts

// Function to format a date string as "MM/DD/YYYY"
export function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
  
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }
  