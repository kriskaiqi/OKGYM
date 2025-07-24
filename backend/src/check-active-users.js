// Script to check for active users in the database
const { Client } = require('pg');

async function checkActiveUsers() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'okgym',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check the structure of the users table
    console.log('\n--- USERS TABLE STRUCTURE ---');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    tableStructure.rows.forEach(col => {
      console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Query users
    console.log('\n--- USERS ---');
    const usersResult = await client.query(`
      SELECT id, email, "firstName", "lastName", "userRole", "isAdmin", "isPremium", "createdAt", "updatedAt"
      FROM users
      LIMIT 5
    `);
    
    if (usersResult.rows.length > 0) {
      console.log(`Found ${usersResult.rows.length} users:`);
      usersResult.rows.forEach(user => {
        console.log(`ID: ${user.id}, Name: ${user.firstName} ${user.lastName}, Email: ${user.email}, Role: ${user.userRole}`);
      });
    } else {
      console.log('No users found');
    }
    
    // Check total count
    const allUsersResult = await client.query(`
      SELECT COUNT(*) as count FROM users
    `);
    
    console.log(`\nTotal users in database: ${allUsersResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
checkActiveUsers(); 