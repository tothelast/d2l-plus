import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
});

const TABLES = {
    PROFESSORS: 'd2l-plus-auth-professors',
    COURSES: 'd2l-plus-auth-courses',
    ASSIGNMENTS: 'd2l-plus-auth-assignments',
    ANNOUNCEMENTS: 'd2l-plus-auth-announcements',
};

async function createProfessors() {
    const professors = [
        {
            id: uuidv4(),
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@university.edu',
        },
        {
            id: uuidv4(),
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@university.edu',
        },
    ];

    for (const professor of professors) {
        await dynamodb
            .put({
                TableName: TABLES.PROFESSORS,
                Item: professor,
            })
            .promise();
        console.log(`Created professor: ${professor.firstName} ${professor.lastName}`);
    }

    return professors;
}

async function createCourses(professors: any[]) {
    const courses = [
        {
            id: uuidv4(),
            title: 'Introduction to Computer Science',
            lectures: ['Algorithms', 'Data Structures', 'Programming Basics'],
            professorId: professors[0].id,
            semester: 'Fall 2024',
        },
        {
            id: uuidv4(),
            title: 'Advanced Mathematics',
            lectures: ['Calculus', 'Linear Algebra', 'Statistics'],
            professorId: professors[1].id,
            semester: 'Fall 2024',
        },
    ];

    for (const course of courses) {
        await dynamodb
            .put({
                TableName: TABLES.COURSES,
                Item: course,
            })
            .promise();
        console.log(`Created course: ${course.title}`);
    }

    return courses;
}

async function createAssignments(courses: any[]) {
    const assignments = [
        {
            id: uuidv4(),
            courseId: courses[0].id,
            title: 'Programming Assignment 1',
            body: 'Implement a binary search tree',
            weight: 20,
            dateTime: new Date().toISOString(),
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        },
        {
            id: uuidv4(),
            courseId: courses[1].id,
            title: 'Math Quiz 1',
            body: 'Solve calculus problems',
            weight: 15,
            dateTime: new Date().toISOString(),
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        },
    ];

    for (const assignment of assignments) {
        await dynamodb
            .put({
                TableName: TABLES.ASSIGNMENTS,
                Item: assignment,
            })
            .promise();
        console.log(`Created assignment: ${assignment.title}`);
    }
}

async function createAnnouncements(courses: any[]) {
    const announcements = [
        {
            id: uuidv4(),
            courseId: courses[0].id,
            title: 'Welcome to CS101',
            body: 'Welcome to Introduction to Computer Science! Please review the syllabus.',
            dateTime: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            courseId: courses[1].id,
            title: 'Office Hours Update',
            body: 'Office hours will be held on Mondays and Wednesdays from 2-4 PM.',
            dateTime: new Date().toISOString(),
        },
    ];

    for (const announcement of announcements) {
        await dynamodb
            .put({
                TableName: TABLES.ANNOUNCEMENTS,
                Item: announcement,
            })
            .promise();
        console.log(`Created announcement: ${announcement.title}`);
    }
}

async function populateTables() {
    try {
        console.log('Starting to populate tables...');

        const professors = await createProfessors();
        const courses = await createCourses(professors);
        await createAssignments(courses);
        await createAnnouncements(courses);

        console.log('Successfully populated all tables!');
    } catch (error) {
        console.error('Error populating tables:', error);
    }
}

populateTables();
