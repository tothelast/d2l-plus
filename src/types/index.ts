export interface User {
    id: string;
    email: string;
}

export interface Professor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Course {
    id: string;
    title: string;
    lectures: string[];
    professorId: string;
    semester: string;
    weekdays?: string[];
    lectureTime?: string;
}

export interface Announcement {
    id: string;
    courseId: string;
    title: string;
    body: string;
    dateTime: string;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    body: string;
    weight: number;
    dateTime: string;
    deadline: string;
}

export interface Grade {
    id: string;
    userId: string;
    assignmentId: string;
    title: string;
    grade: number;
    dateTime: string;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    dateTime: string;
}

export interface CourseRanking {
    courseId: string;
    rank: number;
    numberOfVotes: number;
}

export interface ProfessorRanking {
    professorId: string;
    rank: number;
    numberOfVotes: number;
}
