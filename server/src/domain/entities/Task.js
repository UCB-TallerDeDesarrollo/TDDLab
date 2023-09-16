class Task {
  constructor({ id, title, description, start_date, end_date, state }) {
    this.id = id; // You can generate this id when creating a new task
    this.title = title;
    this.description = description;
    this.start_date = start_date;
    this.end_date = end_date;
    this.state = state; // Should be 'pending' or 'delivered'
  }
}

module.exports = Task;
