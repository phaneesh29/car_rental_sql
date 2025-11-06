CREATE TABLE IF NOT EXISTS Branch (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL UNIQUE,
    street VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('worker', 'manager') NOT NULL,
    status ENUM('working', 'not_working') NOT NULL DEFAULT 'not_working',
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    branch_id INT,
    FOREIGN KEY (branch_id) REFERENCES Branch (branch_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS EmployeeAddress (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    zip VARCHAR(10),
    FOREIGN KEY (employee_id) REFERENCES Employee (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS EmployeePhone (
    employee_id INT,
    phone_num VARCHAR(20),
    PRIMARY KEY (employee_id, phone_num),
    FOREIGN KEY (employee_id) REFERENCES Employee (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Car (
    car_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    year YEAR,
    make VARCHAR(50),
    model VARCHAR(50),
    reg_num VARCHAR(50) UNIQUE,
    status ENUM(
        'available',
        'rented',
        'maintenance'
    ) NOT NULL DEFAULT 'available',
    rental_rate DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branch (branch_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Service (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    service_date DATE,
    detail VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    cost DECIMAL(10, 2),
    FOREIGN KEY (car_id) REFERENCES Car (car_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Customer (
    cust_id INT AUTO_INCREMENT PRIMARY KEY,
    licence_num VARCHAR(50) UNIQUE,
    f_name VARCHAR(50) NOT NULL,
    l_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CustomerAddress (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    zip VARCHAR(10),
    FOREIGN KEY (customer_id) REFERENCES Customer (cust_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS CustomerPhone (
    cust_id INT,
    phone_num VARCHAR(20),
    PRIMARY KEY (cust_id, phone_num),
    FOREIGN KEY (cust_id) REFERENCES Customer (cust_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Rental (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT,
    customer_id INT,
    rental_duration INT,
    total_amount DECIMAL(10, 2),
    rental_date DATE,
    return_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (car_id) REFERENCES Car (car_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Customer (cust_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Payment (
    pay_id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT UNIQUE,
    amount DECIMAL(10, 2),
    payment_date DATE,
    method ENUM('upi', 'card', 'cash') NOT NULL,
    status ENUM('pending', 'completed') NOT NULL,
    FOREIGN KEY (rental_id) REFERENCES Rental (rental_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS EmployeeCar (
    empcar_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    car_id INT,
    date_assigned DATE,
    deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES Employee (employee_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (car_id) REFERENCES Car (car_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE VIEW all_customer_details AS
SELECT c.cust_id, c.licence_num, c.email, c.f_name, c.l_name, ca.street, ca.city, ca.state, ca.zip, cp.phone_num
FROM
    customer AS c
    JOIN customeraddress AS ca ON c.cust_id = ca.customer_id
    JOIN customerphone AS cp ON c.cust_id = cp.cust_id;

CREATE OR REPLACE VIEW all_employee_details AS
SELECT
    e.employee_id,
    b.branch_id,
    b.branch_name,
    b.city AS branch_city,
    e.first_name,
    e.last_name,
    e.role,
    e.status,
    e.email,
    ea.street,
    ea.city,
    ea.state,
    ea.zip,
    ep.phone_num
FROM
    employee AS e
    JOIN branch AS b ON e.branch_id = b.branch_id
    JOIN employeeaddress AS ea ON e.employee_id = ea.employee_id
    JOIN employeephone AS ep ON e.employee_id = ep.employee_id;

CREATE OR REPLACE VIEW all_car_details AS
SELECT
    c.car_id,
    c.year,
    c.make,
    c.model,
    c.reg_num,
    c.status,
    c.rental_rate,
    b.branch_id,
    b.branch_name,
    b.city AS branch_city
FROM car AS c
    JOIN branch AS b ON c.branch_id = b.branch_id;

CREATE OR REPLACE VIEW all_employeecar_details AS
SELECT
    ec.employee_id,
    ec.car_id,
    ec.date_assigned,
    ec.deleted,
    e.first_name AS employee_first_name,
    e.last_name AS employee_last_name,
    e.email AS employee_email,
    e.role AS employee_role,
    e.status AS employee_status,
    e.branch_id AS employee_branch_id,
    e.branch_name AS employee_branch_name,
    e.phone_num AS employee_phone,
    c.make AS car_make,
    c.model AS car_model,
    c.year AS car_year,
    c.reg_num AS car_reg_num,
    c.status AS car_status,
    c.rental_rate AS car_rental_rate,
    c.branch_id AS car_branch_id,
    c.branch_name AS car_branch_name
FROM
    employeecar AS ec
    JOIN all_employee_details AS e ON ec.employee_id = e.employee_id
    JOIN all_car_details AS c ON ec.car_id = c.car_id;

CREATE OR REPLACE VIEW all_service_details AS
SELECT
    s.service_id,
    s.car_id,
    s.service_date,
    s.detail AS service_detail,
    s.is_completed,
    s.cost AS service_cost,
    c.branch_id,
    c.year,
    c.make,
    c.model,
    c.reg_num,
    c.status AS car_status,
    c.rental_rate
FROM
    service AS s
    JOIN all_car_details AS c ON s.car_id = c.car_id;

CREATE OR REPLACE VIEW all_rental_details AS
SELECT
    r.rental_id,
    r.car_id,
    r.customer_id,
    r.rental_duration,
    r.total_amount,
    r.rental_date,
    r.return_date,
    r.is_completed,
    c.f_name AS customer_first_name,
    c.l_name AS customer_last_name,
    c.email AS customer_email,
    c.licence_num AS customer_licence_num,
    c.street AS customer_street,
    c.city AS customer_city,
    c.state AS customer_state,
    c.zip AS customer_zip,
    c.phone_num AS customer_phone,
    ec.car_year AS car_year,
    ec.car_make AS car_make,
    ec.car_model AS car_model,
    ec.car_reg_num AS car_reg_num,
    ec.car_status AS car_status,
    ec.car_rental_rate AS car_rental_rate,
    ec.car_branch_id AS car_branch_id,
    ec.employee_id AS assigned_employee_id,
    ec.employee_first_name AS assigned_employee_first_name,
    ec.employee_last_name AS assigned_employee_last_name,
    ec.employee_email AS assigned_employee_email,
    ec.employee_phone AS assigned_employee_phone
FROM
    rental AS r
    JOIN all_customer_details AS c ON r.customer_id = c.cust_id
    LEFT JOIN all_employeecar_details AS ec ON r.car_id = ec.car_id
WHERE
    ec.deleted = FALSE;

CREATE OR REPLACE VIEW all_payment_details AS
SELECT
    p.pay_id,
    p.rental_id,
    p.amount,
    p.payment_date,
    p.method,
    p.status,
    r.car_id,
    r.customer_id,
    r.rental_date,
    r.return_date,
    r.total_amount,
    r.car_year AS car_year,
    r.car_make AS car_make,
    r.car_model AS car_model,
    r.car_reg_num AS car_reg_num,
    r.car_status AS car_status,
    r.car_rental_rate AS car_rental_rate,
    r.assigned_employee_email AS assigned_employee_email,
    r.assigned_employee_phone AS assigned_employee_phone,
    r.assigned_employee_first_name AS assigned_employee_first_name,
    r.customer_first_name AS customer_first_name,
    r.customer_last_name AS customer_last_name,
    r.customer_email AS customer_email,
    r.customer_licence_num AS customer_licence_num,
    r.customer_phone AS customer_phone
FROM
    payment AS p
    JOIN all_rental_details AS r ON p.rental_id = r.rental_id;