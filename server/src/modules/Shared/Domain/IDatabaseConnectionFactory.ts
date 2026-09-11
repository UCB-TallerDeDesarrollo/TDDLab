export interface IDatabaseConnection{
  query(query: string, values?: any[]): Promise<{ rows: any[] }>;
  release(): void;
}

export interface IDatabaseConnectionFactory{
  getConnection(): Promise<IDatabaseConnection>;
}
