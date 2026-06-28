---
course_code: "IT 8100"
course_name: "Database Architecture and Design"
title: "Pharmaceutical Management System"
description: "Database design for a healthcare pharmaceutical management system, including ER modeling, normalization, DDL/DML implementation, and query testing"
date: 2024/11/24
learning_outcome: "Design and evaluate database architectures that meet enterprise requirements for performance, scalability, integrity, and security in data-intensive environments."
status: "complete"
category: "it"
---

**Pharmaceutical Management System**

*Kun Zhang, Alka Bhandari, Paavani Dua and Harsha Ravi Mudaliar*
Ottawa University · IT-8100: Database Architecture and Design
Professor Joel Short · November 24, 2024

---

## Introduction

The purpose of this database is to support healthcare facilities in managing medications, tracking prescriptions, and storing patient information. In medical settings, the risk of errors in medication administration is significant, making it crucial to have a centralized database that can organize and automate various aspects of medication management. This database will ensure that healthcare providers have access to accurate, real-time information, improving patient safety and supporting compliance with regulatory standards.

**Problem Domain:** The healthcare industry faces significant challenges in managing pharmaceutical inventory and patient medication records efficiently. A Pharmaceutical Management System (PMS) is designed to streamline these processes, ensuring healthcare providers can easily access and manage essential medication information. This proposal outlines the purpose of the database, its potential users, the types of input data, and the information that will be stored within the system. By using this system, healthcare facilities can reduce medication waste, prevent stockouts, and enhance patient safety through better medication tracking.

## Identify Users

For our Pharmaceutical Management System, the primary users include pharmacists, healthcare providers, patients and administrators, each with different information needs.

**Pharmacists** require access to real-time medication inventory to ensure medications are in stock when needed (Cannon, 2023). They also need to view, update and manage patient prescriptions to ensure accurate dispensing. Furthermore, pharmacists require detailed patient profiles that include medication histories and allergies to provide safe and effective care, along with reporting tools to generate insights on medication usage and trends (Mendez, 2014).

**Healthcare providers**, including doctors and nurses, need access to up-to-date patient medication histories to make informed prescribing decisions. They benefit from guidelines on drug dosing, contraindications, and potential interactions to ensure patient safety. Additionally, the system provides alerts and reminders about any medication allergies or interactions.

**Patients** require access to their profile including personal medication information, dosages, administration schedules, and potential side effects, as well as a straightforward way to request medication refills and check prescription status.

**Administrators** require access to system settings, user management and reporting tools to ensure proper functioning of the system. They are responsible for database operations, maintaining data security and ensuring data integrity (Watt, 2016). They also need access to user management tools to create, update, and assign appropriate access permissions to other users. Additionally, administrators should have access to audit logs and activity reports to monitor system use and compliance with internal policies and regulations.

## Input Data and Stored Information

In our Pharmaceutical Management System, the database will receive input data from various sources to support medication management, patient care, and reporting. This input data contains several key components:

- **Patient information:** personal details such as name, age, contact information, medical history, and allergy records
- **Prescription records:** sessions times, patient IDs, prescribed medications, dosage instructions, and the prescribing doctor's information
- **Medication details:** drug names, active ingredients, dosages, expiration dates, manufacturer information, and stock levels
- **Inventory data and user data:** login credentials, access roles, and permissions for pharmacists, healthcare providers, and administrators

The stored information will be organized in a structured format to meet user needs and ensure efficient data query (Kennedy, 2022), including patient profiles with detailed history and related records, medical inventory records with stock levels and expiration dates, and Prescription History for each patient including physician notes and dosage instructions.

## ER Diagram

Entities with tables and relationships are defined with Patient, Pharmacist, Healthcare Provider, Medication, and Prescription as the primary entities. The ER diagram showing the relations with aggregations is attached. All tables are standalone entities except the Prescription table which has foreign keys.

### 1. Patient

**Attributes:** patient_id (Primary Key), name, contact_info, age, medical_history

**Relationships:** One-to-Many with Prescription (a patient can have multiple prescriptions)

### 2. Pharmacist

**Attributes:** pharmacist_id (Primary Key), name, license_number

**Relationships:** One-to-Many with Prescription (a pharmacist can handle multiple prescriptions)

### 3. Healthcare Provider

**Attributes:** provider_id (Primary Key), name, specialty

**Relationships:** One-to-Many with Prescription (a provider can issue multiple prescriptions)

### 4. Medication

**Attributes:** medication_id (Primary Key), name, dosage, instructions

**Relationships:** One-to-Many with Prescription (a medication can be associated with multiple prescriptions)

### 5. Prescription

**Attributes:** prescription_id (Primary Key), date, patient_id (Foreign Key → Patient), provider_id (Foreign Key → Healthcare Provider), pharmacist_id (Foreign Key → Pharmacist), medication_id (Foreign Key → Medication)

**Relationships:** Acts as the central table, linking each Prescription to Patient, Provider, Pharmacist, and Medication.

## Normalized Database Design

Based on the ER diagram above, we ensure the tables adhere to 3NF by making sure that:

- Each attribute is atomic and dependent on the primary key
- Foreign keys are used to represent relationships without unnecessary redundancy
- No transitive dependencies, ensuring tables are free from redundant data and support accurate, efficient queries

This design helps with tracking patient prescriptions, healthcare provider details, and medications efficiently, supporting queries on prescriptions by patient, pharmacist, or healthcare provider.

## Define the Database through DDL Statements

### Patient Table

```sql
-- Table: Patient
CREATE TABLE Patient (
    patient_id   INT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    contact_info VARCHAR(150),
    age          INT CHECK (age > 0),
    medical_history TEXT
);
```

### Pharmacist Table

```sql
CREATE TABLE Pharmacist (
    pharmacist_id  INT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL
);
```

### Healthcare Provider Table

```sql
CREATE TABLE HealthcareProvider (
    provider_id INT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    specialty   VARCHAR(100)
);
```

### Medication Table

```sql
CREATE TABLE Medication (
    medication_id INT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    dosage        INT CHECK (dosage > 0),
    instructions  TEXT
);
```

### Prescription Table

```sql
CREATE TABLE Prescription (
    prescription_id INT PRIMARY KEY,
    date            DATE NOT NULL,
    patient_id      INT,
    provider_id     INT,
    pharmacist_id   INT,
    medication_id   INT,
    FOREIGN KEY (patient_id)    REFERENCES Patient(patient_id),
    FOREIGN KEY (provider_id)   REFERENCES HealthcareProvider(provider_id),
    FOREIGN KEY (pharmacist_id) REFERENCES Pharmacist(pharmacist_id),
    FOREIGN KEY (medication_id) REFERENCES Medication(medication_id)
);
```

## Populate the Database through DML Statements

### Insert data into Patient

```sql
INSERT INTO Patient (patient_id, name, contact_info, age, medical_history) VALUES
(1,  'John Doe',       '123-456-7890', 35, 'Diabetes'),
(2,  'Jane Smith',     '987-654-3210', 40, 'Hypertension'),
(3,  'Alice Roberts',  '123-555-7890', 45, 'Asthma'),
(4,  'Robert Evans',   '111-222-3333', 50, 'Arthritis'),
(5,  'Emily White',    '222-333-4444', 29, 'Migraine'),
(6,  'Michael Black',  '333-444-5555', 62, 'Heart Disease'),
(7,  'Jessica Smith',  '444-555-6666', 48, 'Thyroid Issues'),
(8,  'Daniel Craig',   '555-666-7777', 54, 'Cholesterol'),
(9,  'Laura Du',       '666-777-8888', 32, 'Anemia'),
(10, 'Chris Rea',      '777-888-9999', 27, 'None');
-- Expected Result: Success. patient_id values are unique.
```

### Insert data into Pharmacist

```sql
INSERT INTO Pharmacist (pharmacist_id, name, license_number) VALUES
(1,  'Alice Johnson',  'PH123456'),
(2,  'Bob Williams',   'PH654321'),
(3,  'Charlie Smith',  'PH789012'),
(4,  'Diana Jackson',  'PH345678'),
(5,  'Edward Lento',   'PH901234'),
(6,  'Fiona Luong',    'PH567890'),
(7,  'George Kelce',   'PH432109'),
(8,  'Hannah Ritter',  'PH876543'),
(9,  'Ian Nuta',       'PH210987'),
(10, 'Julia Guice',    'PH543210');
```

### Insert data into HealthcareProvider

```sql
INSERT INTO HealthcareProvider (provider_id, name, specialty) VALUES
(1,  'Dr. Sarah White',     'General Medicine'),
(2,  'Dr. James Earl',      'Pediatrics'),
(3,  'Dr. Emma Grey',       'Dermatology'),
(4,  'Dr. Oliver Trudeau',  'Cardiology'),
(5,  'Dr. Sophia Neeson',   'Orthopedics'),
(6,  'Dr. Liam Kelsey',     'Neurology'),
(7,  'Dr. Mia Payne',       'Oncology'),
(8,  'Dr. William Harris',  'Psychiatry'),
(9,  'Dr. Isabella Suarez', 'Ophthalmology'),
(10, 'Dr. Noah Diaz',       'Gastroenterology');
```

### Insert data into Medication

```sql
INSERT INTO Medication (medication_id, name, dosage, instructions) VALUES
(1,  'Aspirin',       500, 'Take one tablet daily'),
(2,  'Ibuprofen',     200, 'Take two tablets every 6 hours'),
(3,  'Paracetamol',   500, 'Take one tablet every 4-6 hours'),
(4,  'Amoxicillin',   250, 'Take one capsule every 8 hours'),
(5,  'Metformin',     500, 'Take one tablet with meals'),
(6,  'Atorvastatin',  10,  'Take one tablet at bedtime'),
(7,  'Lisinopril',    20,  'Take one tablet daily'),
(8,  'Albuterol',     90,  'Inhale as needed for wheezing'),
(9,  'Cetirizine',    10,  'Take one tablet daily for allergies'),
(10, 'Omeprazole',    20,  'Take one capsule before meals');
```

### Insert data into Prescription

```sql
INSERT INTO Prescription (prescription_id, date, patient_id, provider_id, pharmacist_id, medication_id) VALUES
(1,  '2024-11-01', 1,  1,  1,  1),
(2,  '2024-11-02', 2,  2,  2,  2),
(3,  '2024-11-03', 3,  3,  3,  3),
(4,  '2024-11-04', 4,  4,  4,  4),
(5,  '2024-11-05', 5,  5,  5,  5),
(6,  '2024-11-06', 6,  6,  6,  6),
(7,  '2024-11-07', 7,  7,  7,  7),
(8,  '2024-11-08', 8,  8,  8,  8),
(9,  '2024-11-09', 9,  9,  9,  9),
(10, '2024-11-10', 10, 10, 10, 10);
```

## Queries for Testing

### Verify all data

```sql
SELECT * FROM Patient;
SELECT * FROM Pharmacist;
SELECT * FROM HealthcareProvider;
SELECT * FROM Medication;
SELECT * FROM Prescription;
```

### Insert duplicate data test into Patient

```sql
-- Duplicate patient_id should not be accepted
INSERT INTO Patient (patient_id, name, contact_info, age, medical_history)
VALUES (1, 'Duplicate John Doe', '555-555-5555', 30, 'Hypertension');
-- Expected Error: Duplicate entry '1' for key 'PRIMARY'
```

### Retrieve patient details with their prescriptions and medications

```sql
SELECT p.name AS Patient, pr.date AS PrescriptionDate, m.name AS Medication
FROM Patient p
JOIN Prescription pr ON p.patient_id = pr.patient_id
JOIN Medication m ON pr.medication_id = m.medication_id;
```

### Retrieve all prescriptions handled by a pharmacist

```sql
SELECT ph.name AS Pharmacist, pr.date AS PrescriptionDate, p.name AS Patient
FROM Pharmacist ph
JOIN Prescription pr ON ph.pharmacist_id = pr.pharmacist_id
JOIN Patient p ON pr.patient_id = p.patient_id;
```

### Prescriptions for patient_id = 1

```sql
SELECT p.name AS PatientName, pr.date AS PrescriptionDate, m.name AS MedicationName
FROM Prescription pr
JOIN Patient p ON pr.patient_id = p.patient_id
JOIN Medication m ON pr.medication_id = m.medication_id
WHERE p.patient_id = 1;
```

### Prescription count by each pharmacist

```sql
SELECT ph.name AS PharmacistName, COUNT(pr.prescription_id) AS TotalPrescriptions
FROM Prescription pr
JOIN Pharmacist ph ON pr.pharmacist_id = ph.pharmacist_id
GROUP BY ph.name;
```

### Prescriptions by date

```sql
SELECT pr.date AS PrescriptionDate, COUNT(pr.prescription_id) AS TotalPrescriptions
FROM Prescription pr
GROUP BY pr.date
ORDER BY pr.date DESC;
```

### Bad data — foreign key violation

```sql
-- Test foreign key constraint (invalid patient_id)
INSERT INTO Prescription (prescription_id, date, patient_id, provider_id, pharmacist_id, medication_id)
VALUES (11, '2024-11-11', 998, 1, 1, 1);
-- Expected Error: Foreign key constraint fails
```

### Bad data — null value violation

```sql
-- Test NOT NULL constraint (missing required field)
INSERT INTO Patient (patient_id, name, contact_info, age, medical_history)
VALUES (11, NULL, '555-111-2222', 30, 'None');
-- Expected Error: NULL value in 'name' column
```

### Bad data — invalid age range

```sql
-- Age must be above 0
INSERT INTO Patient (patient_id, name, contact_info, age, medical_history)
VALUES (13, 'Invalid Age', '123-456-7890', -5, 'None');
-- Expected Error: Check constraint failed
```

## References

Cannon, M., Stevenson, J., Kuzma, K., Kiwala, S., Warner, J. L., Griffith, O. L., Griffith, M., & Wagner, A. H. (2023, November 8). Normalization of drug and therapeutic concepts with Thera-Py. *JAMIA Open, 6*(4). https://doi.org/10.1093/jamiaopen/ooad093

Kennedy, S. (2022, April 29). How to improve data normalization in healthcare. *Healthtech Analytics.* https://www.techtarget.com/healthtechanalytics/feature/How-to-Improve-Data-Normalization-in-Healthcare

Mendez, M. (2014). Chapter 40: Normalization. *The Missing Link.* Open SUNY Textbooks. https://milnepublishing.geneseo.edu/themissinglink/chapter/chapter-40-normalization/

Watt, A. (2016, October 24). Chapter 8: The Entity Relationship Data Model. *Database Design* (2nd ed.). BCcampus. https://opentextbc.ca/dbdesign01/chapter/chapter-8-entity-relationship-model/
