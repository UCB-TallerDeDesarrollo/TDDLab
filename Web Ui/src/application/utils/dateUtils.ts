// dateUtils.ts

// Function to format a date string as "MM/DD/YYYY"
export function formatDate(dateString: string): string {

  
    const date = new Date(dateString).toLocaleDateString();
    return date;
    //new Date(date).toLocaleDateString();

  }
  
  