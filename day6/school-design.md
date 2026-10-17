
# School Database Design

## 1. Tables

### Students
The `students` table stores information about each student. It contains `student_id` as the primary key, `full_name` for the student's name, and `email` for their email address. The email is required and must be unique so that two students cannot register using the same email address.

### Courses
The `courses` table stores the courses offered by the school. It contains `course_id` as the primary key, `course_name` for the course title, and `course_code` as a unique identifier for each course.

### Enrolments
The `enrolments` table records which students take which courses. It contains `enrolment_id` as the primary key, `student_id` and `course_id` as foreign keys, and `grade` for the student's result in that course. The combination of `student_id` and `course_id` is unique, preventing duplicate enrolments for the same student and course.

## 2. Relationships

### One-to-many relationships
A student can have many enrolments, but each enrolment belongs to one student. This creates a one-to-many relationship between `students` and `enrolments`.

A course can have many enrolments, but each enrolment refers to one course. This creates a one-to-many relationship between `courses` and `enrolments`.

### Many-to-many relationship
Students and courses have a many-to-many relationship because one student can take several courses, and one course can have several students.

The `enrolments` table is necessary to represent this relationship. It connects each student to each course and stores additional information, such as the grade. Without this join table, the database would be harder to maintain and could contain repeated or inconsistent data.

## 3. Recommended Index

I would add an index on `enrolments(course_id)` to help the database find enrolments for a particular course more efficiently. This is useful when listing all students taking a course or counting students per course. Although the unique constraint on `(student_id, course_id)` already creates an index in SQLite, that index starts with `student_id`, so a separate index beginning with `course_id` can improve course-based lookups.

## 4. SQL or NoSQL?

I would choose a relational SQL database such as SQLite for this school system. Students, courses, and enrolments have clear relationships, and the system needs reliable rules such as unique student emails, valid foreign keys, and no duplicate enrolments. SQL supports these constraints and makes it straightforward to retrieve related information using JOINs and calculate totals using GROUP BY. NoSQL could be useful for flexible or rapidly changing data structures, but a relational database is a more natural fit for this structured school enrolment system.
