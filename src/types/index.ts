export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface Professor {
    id: string;
    name: string;
    email: string;
    department: string;
}

export interface Course {
    id: string;
    title: string;
    lectures: string[];
    professorId: string;
    semester: string;
    weekdays: string[];
    lectureTime: string | null;
}

export interface Announcement {
    id: string;
    courseId: string;
    title: string;
    content: string;
    dateTime: string;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    description: string;
    deadline: string;
    points: number;
    dateTime: string;
}

export interface Grade {
    id: string;
    userId: string;
    assignmentId: string;
    courseId: string;
    score: number;
    feedback: string;
    dateTime: string;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrollmentDate: string;
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

export interface Ranking {
    rating: number;
    reviewCount: number;
}

// AWS Bedrock Types
export interface BedrockModelSummary {
    modelId: string;
    modelName: string;
    providerName: string;
    modelArn?: string;
    inputModalities?: string[];
    outputModalities?: string[];
    customizationsSupported?: string[];
    inferenceTypesSupported?: string[];
    modelLifecycle?: {
        status: string;
    };
}

export interface BedrockTokenUsage {
    input_tokens: number;
    output_tokens: number;
}

export interface BedrockResponse {
    response: string;
    usage: BedrockTokenUsage;
}

// Extended Course interface for courses with additional data
export interface ExtendedCourse extends Course {
    professorDetails?: Professor | null;
    announcements?: Announcement[];
    assignments?: Assignment[];
    grades?: Grade[];
    ranking?: Ranking | null;
}

// Context data structure for AI assistant
export interface UserContextData {
    user: {
        id: string;
        email: string;
        name: string;
    };
    enrollments: Enrollment[];
    courses: ExtendedCourse[];
    summary: {
        enrolledCourseCount: number;
        upcomingAssignments: Assignment[];
        recentAnnouncements: (Announcement & { courseName: string })[];
    };
}
