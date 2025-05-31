-- Tabla para inscripciones a eventos
CREATE TABLE event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_location VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
); 