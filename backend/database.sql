-- 1. Table: Domains (Subjects)
CREATE TABLE domains (
    domain_id SERIAL PRIMARY KEY,
    domain_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_domain_name UNIQUE (domain_name)
);
-- 2. Table: Candidates (Detailed Personal Info)
CREATE TABLE candidates (
    candidate_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT,
    city VARCHAR(50),
    linkedin_profile VARCHAR(255),
    domain_id INT,
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_candidate_email UNIQUE (email),
    CONSTRAINT uk_candidate_phone UNIQUE (phone_number),
    CONSTRAINT fk_candidate_domain 
        FOREIGN KEY (domain_id) 
        REFERENCES domains(domain_id) 
        ON DELETE SET NULL
);
-- 3. Table: Questions (MCQ Repository)
CREATE TABLE questions (
    question_id BIGSERIAL PRIMARY KEY,
    domain_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'Medium',
    CONSTRAINT fk_question_domain 
        FOREIGN KEY (domain_id) 
        REFERENCES domains(domain_id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_correct_option 
        CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    CONSTRAINT chk_difficulty 
        CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard'))
);
-- 4. Table: Exam Results (Candidate Performance)
CREATE TABLE exam_results (
    result_id BIGSERIAL PRIMARY KEY,
    candidate_id INT NOT NULL,
    domain_id INT,
    exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    wrong_answers INT NOT NULL,
    score_obtained DECIMAL(5,2) NOT NULL,
    status VARCHAR(10) DEFAULT 'Fail',
    CONSTRAINT fk_result_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_result_domain 
        FOREIGN KEY (domain_id) 
        REFERENCES domains(domain_id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_score_positive 
        CHECK (score_obtained >= 0)
);
CREATE TABLE academic_history (
    history_id SERIAL PRIMARY KEY,
    candidate_id INT NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    board_or_university VARCHAR(150),
    passing_year INT CHECK (
        passing_year > 1900 
        AND passing_year <= EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    percentage_or_cgpa DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_history_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) 
        ON DELETE CASCADE,
    CONSTRAINT uk_candidate_exam 
        UNIQUE (candidate_id, exam_name)
);
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    assigned_domain_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_admin_email UNIQUE (email),
    CONSTRAINT chk_admin_role 
        CHECK (role IN ('Super Admin', 'HOD', 'Staff')),
    CONSTRAINT fk_admin_domain 
        FOREIGN KEY (assigned_domain_id) 
        REFERENCES domains(domain_id) 
        ON DELETE SET NULL
);
-- 1. Drop the existing difficulty check constraint
ALTER TABLE questions 
DROP CONSTRAINT chk_difficulty;

-- 2. Add the updated constraint including 'Expert'
ALTER TABLE questions 
ADD CONSTRAINT chk_difficulty 
CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard', 'Expert'));