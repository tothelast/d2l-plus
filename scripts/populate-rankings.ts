import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
});

const TABLES = {
    PROFESSORS: 'd2l-plus-auth-professors',
    COURSES: 'd2l-plus-auth-courses',
    PROFESSOR_RANKINGS: 'd2l-plus-auth-professor-rankings',
    COURSE_RANKINGS: 'd2l-plus-auth-course-rankings',
};

async function getAllProfessors() {
    try {
        const result = await dynamodb
            .scan({
                TableName: TABLES.PROFESSORS,
            })
            .promise();

        return result.Items || [];
    } catch (error) {
        console.error('Error fetching professors:', error);
        return [];
    }
}

async function getAllCourses() {
    try {
        const result = await dynamodb
            .scan({
                TableName: TABLES.COURSES,
            })
            .promise();

        return result.Items || [];
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

async function createProfessorRankings() {
    try {
        // Get all professors
        const professors = await getAllProfessors();
        console.log(`Found ${professors.length} professors`);

        if (professors.length === 0) {
            console.log('No professors found. Please populate professors first.');
            return;
        }

        // Create rankings for each professor
        for (const professor of professors) {
            // Generate a random rank between 1 and 5 (5 being the highest)
            const randomRank = Math.floor(Math.random() * 5) + 1;
            // Generate a random number of votes between 1 and 30
            const randomVotes = Math.floor(Math.random() * 30) + 1;

            const ranking = {
                professorId: professor.id,
                rank: randomRank,
                numberOfVotes: randomVotes,
            };

            await dynamodb
                .put({
                    TableName: TABLES.PROFESSOR_RANKINGS,
                    Item: ranking,
                })
                .promise();

            console.log(
                `Created ranking for professor ${professor.firstName} ${professor.lastName}: Rank ${randomRank} (${randomVotes} votes)`
            );
        }

        console.log('Successfully populated professor rankings table!');
    } catch (error) {
        console.error('Error creating professor rankings:', error);
    }
}

async function createCourseRankings() {
    try {
        // Get all courses
        const courses = await getAllCourses();
        console.log(`Found ${courses.length} courses`);

        if (courses.length === 0) {
            console.log('No courses found. Please populate courses first.');
            return;
        }

        // Create rankings for each course
        for (const course of courses) {
            // Generate a random rank between 1 and 5 (5 being the highest)
            const randomRank = Math.floor(Math.random() * 5) + 1;
            // Generate a random number of votes between 1 and 50
            const randomVotes = Math.floor(Math.random() * 50) + 1;

            const ranking = {
                courseId: course.id,
                rank: randomRank,
                numberOfVotes: randomVotes,
            };

            await dynamodb
                .put({
                    TableName: TABLES.COURSE_RANKINGS,
                    Item: ranking,
                })
                .promise();

            console.log(
                `Created ranking for course ${course.title}: Rank ${randomRank} (${randomVotes} votes)`
            );
        }

        console.log('Successfully populated course rankings table!');
    } catch (error) {
        console.error('Error creating course rankings:', error);
    }
}

async function populateRankings() {
    try {
        console.log('Starting to populate ranking tables...');

        await createProfessorRankings();
        await createCourseRankings();

        console.log('Successfully populated all ranking tables!');
    } catch (error) {
        console.error('Error populating ranking tables:', error);
    }
}

// Run the script
populateRankings();
