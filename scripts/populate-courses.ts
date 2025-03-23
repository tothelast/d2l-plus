import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../src/types';

const dynamodb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
});

const TABLES = {
    COURSES: 'd2l-plus-auth-courses',
    PROFESSORS: 'd2l-plus-auth-professors',
};

// Get existing professors or create some if needed
async function getProfessors() {
    try {
        const result = await dynamodb
            .scan({
                TableName: TABLES.PROFESSORS,
            })
            .promise();

        const professors = result.Items || [];
        if (professors.length > 0) {
            console.log(`Found ${professors.length} existing professors`);
            return professors;
        }

        // If no professors, create some CS professors from University of Arizona
        const newProfessors = [
            {
                id: uuidv4(),
                name: 'Christian Collberg',
                email: 'collberg@cs.arizona.edu',
                department: 'Computer Science',
            },
            {
                id: uuidv4(),
                name: 'Beichuan Zhang',
                email: 'bzhang@cs.arizona.edu',
                department: 'Computer Science',
            },
            {
                id: uuidv4(),
                name: 'Saumya Debray',
                email: 'debray@cs.arizona.edu',
                department: 'Computer Science',
            },
            {
                id: uuidv4(),
                name: 'Carlos Scheidegger',
                email: 'cscheid@cs.arizona.edu',
                department: 'Computer Science',
            },
            {
                id: uuidv4(),
                name: 'Michelle Strout',
                email: 'mstrout@cs.arizona.edu',
                department: 'Computer Science',
            },
        ];

        // Save to database
        for (const professor of newProfessors) {
            await dynamodb
                .put({
                    TableName: TABLES.PROFESSORS,
                    Item: professor,
                })
                .promise();
            console.log(`Created professor: ${professor.name}`);
        }

        return newProfessors;
    } catch (error) {
        console.error('Error getting or creating professors:', error);
        return [];
    }
}

// Generate random weekdays
function getRandomWeekdays() {
    const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const numDays = 1 + Math.floor(Math.random() * 3); // 1-3 days
    const shuffled = [...allWeekdays].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numDays);
}

// Generate random lecture time
function getRandomLectureTime() {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const startHour = hours[Math.floor(Math.random() * hours.length)];
    const endHour = startHour + 1 + Math.floor(Math.random() * 2); // 1-2 hour class

    return `${startHour}:00-${endHour}:00`;
}

async function createCourses() {
    try {
        const professors = await getProfessors();

        if (professors.length === 0) {
            console.log('No professors available. Cannot create courses.');
            return;
        }

        const semesters = ['Fall 2023', 'Spring 2024', 'Fall 2024'];

        const coursesToCreate: Course[] = [
            {
                id: uuidv4(),
                title: 'CSC 110 - Introduction to Computer Programming I',
                lectures: [
                    'Introduction to Programming',
                    'Variables and Data Types',
                    'Control Structures',
                    'Functions',
                ],
                professorId: professors[0].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 120 - Introduction to Computer Programming II',
                lectures: [
                    'Object-Oriented Programming',
                    'Data Structures',
                    'Algorithms',
                    'File I/O',
                ],
                professorId: professors[1].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 210 - Software Development',
                lectures: [
                    'Software Engineering Principles',
                    'Version Control',
                    'Testing',
                    'Project Management',
                ],
                professorId: professors[2].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 245 - Discrete Structures',
                lectures: ['Logic', 'Sets', 'Relations', 'Functions', 'Combinatorics', 'Graphs'],
                professorId: professors[3].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 335 - Object-Oriented Programming and Design',
                lectures: ['Design Patterns', 'UML', 'Refactoring', 'Advanced OOP Concepts'],
                professorId: professors[4].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 345 - Analysis of Discrete Structures',
                lectures: [
                    'Algorithm Analysis',
                    'Graph Theory',
                    'Recurrence Relations',
                    'Generating Functions',
                ],
                professorId: professors[0].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 352 - Systems Programming and UNIX',
                lectures: [
                    'Unix File System',
                    'Processes',
                    'Signals',
                    'Shell Programming',
                    'C Programming',
                ],
                professorId: professors[1].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 380 - Principles of Data Science',
                lectures: [
                    'Data Mining',
                    'Machine Learning',
                    'Data Visualization',
                    'Statistical Analysis',
                ],
                professorId: professors[2].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 422 - Parallel and Distributed Programming',
                lectures: [
                    'Concurrency',
                    'Parallelism',
                    'Distributed Computing',
                    'Message Passing',
                ],
                professorId: professors[3].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 433 - Computer Graphics',
                lectures: ['2D/3D Rendering', 'Transformations', 'Ray Tracing', 'Modeling'],
                professorId: professors[4].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 445 - Algorithms',
                lectures: [
                    'Advanced Algorithm Analysis',
                    'Greedy Algorithms',
                    'Dynamic Programming',
                    'NP-Completeness',
                ],
                professorId: professors[0].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
            {
                id: uuidv4(),
                title: 'CSC 460 - Database Systems',
                lectures: ['Relational Model', 'SQL', 'Database Design', 'Query Optimization'],
                professorId: professors[1].id,
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                weekdays: getRandomWeekdays(),
                lectureTime: getRandomLectureTime(),
            },
        ];

        // Save courses to database
        for (const course of coursesToCreate) {
            await dynamodb
                .put({
                    TableName: TABLES.COURSES,
                    Item: course,
                })
                .promise();
            console.log(`Created course: ${course.title}`);
        }

        console.log(`Successfully created ${coursesToCreate.length} courses!`);
    } catch (error) {
        console.error('Error creating courses:', error);
    }
}

// Run the script
createCourses();
