const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "exam",
  password: "panchal2004",
  port: 5432,
});

async function seedData() {
  try {
    console.log("Seeding started...");

    /* =========================
       PASSWORD HASHING
    ========================= */
    const candidatePassword = await bcrypt.hash("can123", 10);
    const adminPassword = await bcrypt.hash("adm123", 10);

    /* =========================
       INSERT DOMAINS
    ========================= */
    const domainResult = await pool.query(
      `INSERT INTO domains (domain_name, description)
       VALUES 
       ('Java', 'Java Programming'),
       ('Python', 'Python Programming'),
       ('Flutter', 'Mobile App Development')
       ON CONFLICT (domain_name) DO NOTHING
       RETURNING domain_id`
    );

    const domainId =
      domainResult.rows.length > 0 ? domainResult.rows[0].domain_id : 1;

    /* =========================
       INSERT CANDIDATE
    ========================= */
    await pool.query(
      `INSERT INTO candidates 
      (first_name, last_name, email, password_hash, phone_number, gender, city, domain_id)
      VALUES 
      ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (email) DO NOTHING`,
      [
        "Rahul",
        "Sharma",
        "rahul@gmail.com",
        candidatePassword,
        "9876543210",
        "Male",
        "Ahmedabad",
        domainId,
      ]
    );

    /* =========================
       INSERT QUESTIONS
    ========================= */
    await pool.query(
      `INSERT INTO questions 
      (domain_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level)
      VALUES
      ($1,'What is JVM?','Java Virtual Machine','Java Very Much','Just Virtual Machine','None','A','Easy'),
      ($1,'Which keyword is used to inherit class?','this','super','extends','implements','C','Easy')
      ON CONFLICT DO NOTHING`,
      [domainId]
    );

    /* =========================
       INSERT ADMIN
    ========================= */
    await pool.query(
      `INSERT INTO admins
      (full_name, email, password_hash, role, assigned_domain_id)
      VALUES
      ($1,$2,$3,$4,$5)
      ON CONFLICT (email) DO NOTHING`,
      [
        "System Admin",
        "admin@gmail.com",
        adminPassword,
        "Super Admin",
        null,
      ]
    );

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await pool.end();
  }
}

seedData();
