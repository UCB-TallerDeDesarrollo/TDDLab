export interface PracticeDataObject {
    id: string;
    title: string;
    description: string | null;
    creation_date: Date | null;
    state: "pending" | "in progress" | "delivered";
    userid: number;
  }
  
  export interface PracticeCreationObject {
    title: string;
    description: string | null;
    creation_date: Date | null;
    state: "pending" | "in progress" | "delivered";
    userid: number;
  }
  