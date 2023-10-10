class AssignetPostgressAdapter() {

    obtainAssignments() {
        try {
            // Use a pool client to connect to the database
            const client = await pool.connect();
        
            // Query to retrieve all assignments from the 'assignments' table
            const query = 'SELECT * FROM assignments';
        
            // Execute the query
            const result = await client.query(query);
        
            // Release the client back to the pool
            client.release();
            // Respond with the fetched assignments as JSON
            res.status(200).json(result.rows);
          } catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({ error: 'Server error' });
          }

          
          return [Assignment]
    }
}

