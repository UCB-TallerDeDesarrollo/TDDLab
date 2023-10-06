export class Assignment {
    id: number;
    title: string;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    state: 'pending' | 'delivered';
  
    constructor(
      id: number,
      title: string,
      description: string | null,
      start_date: Date | null,
      end_date: Date | null,
      state: 'pending' | 'delivered'
    ) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.start_date = start_date;
      this.end_date = end_date;
      this.state = state;
    }
  }
  