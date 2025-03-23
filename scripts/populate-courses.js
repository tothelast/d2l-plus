'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.');
            while ((g && ((g = 0), op[0] && (_ = 0)), _))
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
Object.defineProperty(exports, '__esModule', { value: true });
var aws_sdk_1 = require('aws-sdk');
var uuid_1 = require('uuid');

var dynamodb = new aws_sdk_1.DynamoDB.DocumentClient({
    region: 'us-east-1',
});

var TABLES = {
    COURSES: 'd2l-plus-auth-courses',
    PROFESSORS: 'd2l-plus-auth-professors',
};

// Get existing professors or create some if needed
function getProfessors() {
    return __awaiter(this, void 0, void 0, function () {
        var result, professors, newProfessors, _i, newProfessors_1, professor, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [
                        4 /*yield*/,
                        dynamodb
                            .scan({
                                TableName: TABLES.PROFESSORS,
                            })
                            .promise(),
                    ];
                case 1:
                    result = _a.sent();
                    professors = result.Items || [];
                    if (professors.length > 0) {
                        console.log('Found '.concat(professors.length, ' existing professors'));
                        return [2 /*return*/, professors];
                    }
                    // If no professors, create some CS professors from University of Arizona
                    newProfessors = [
                        {
                            id: (0, uuid_1.v4)(),
                            name: 'Christian Collberg',
                            email: 'collberg@cs.arizona.edu',
                            department: 'Computer Science',
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            name: 'Beichuan Zhang',
                            email: 'bzhang@cs.arizona.edu',
                            department: 'Computer Science',
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            name: 'Saumya Debray',
                            email: 'debray@cs.arizona.edu',
                            department: 'Computer Science',
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            name: 'Carlos Scheidegger',
                            email: 'cscheid@cs.arizona.edu',
                            department: 'Computer Science',
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            name: 'Michelle Strout',
                            email: 'mstrout@cs.arizona.edu',
                            department: 'Computer Science',
                        },
                    ];
                    (_i = 0), (newProfessors_1 = newProfessors);
                    _a.label = 2;
                case 2:
                    if (!(_i < newProfessors_1.length)) return [3 /*break*/, 5];
                    professor = newProfessors_1[_i];
                    return [
                        4 /*yield*/,
                        dynamodb
                            .put({
                                TableName: TABLES.PROFESSORS,
                                Item: professor,
                            })
                            .promise(),
                    ];
                case 3:
                    _a.sent();
                    console.log('Created professor: '.concat(professor.name));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    return [2 /*return*/, newProfessors];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error getting or creating professors:', error_1);
                    return [2 /*return*/, []];
                case 7:
                    return [2 /*return*/];
            }
        });
    });
}

// Generate random weekdays
function getRandomWeekdays() {
    var allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    var numDays = 1 + Math.floor(Math.random() * 3); // 1-3 days
    var shuffled = allWeekdays.slice().sort(function () {
        return 0.5 - Math.random();
    });
    return shuffled.slice(0, numDays);
}

// Generate random lecture time
function getRandomLectureTime() {
    var hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    var startHour = hours[Math.floor(Math.random() * hours.length)];
    var endHour = startHour + 1 + Math.floor(Math.random() * 2); // 1-2 hour class

    return ''.concat(startHour, ':00-').concat(endHour, ':00');
}

function createCourses() {
    return __awaiter(this, void 0, void 0, function () {
        var professors, semesters, coursesToCreate, _i, coursesToCreate_1, course, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getProfessors()];
                case 1:
                    professors = _a.sent();
                    if (professors.length === 0) {
                        console.log('No professors available. Cannot create courses.');
                        return [2 /*return*/];
                    }
                    semesters = ['Fall 2023', 'Spring 2024', 'Fall 2024'];
                    coursesToCreate = [
                        {
                            id: (0, uuid_1.v4)(),
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
                            id: (0, uuid_1.v4)(),
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
                            id: (0, uuid_1.v4)(),
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
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 245 - Discrete Structures',
                            lectures: [
                                'Logic',
                                'Sets',
                                'Relations',
                                'Functions',
                                'Combinatorics',
                                'Graphs',
                            ],
                            professorId: professors[3].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 335 - Object-Oriented Programming and Design',
                            lectures: [
                                'Design Patterns',
                                'UML',
                                'Refactoring',
                                'Advanced OOP Concepts',
                            ],
                            professorId: professors[0].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 345 - Analysis of Discrete Structures',
                            lectures: [
                                'Algorithm Analysis',
                                'Graph Theory',
                                'Recurrence Relations',
                                'Generating Functions',
                            ],
                            professorId: professors[1].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 352 - Systems Programming and UNIX',
                            lectures: [
                                'Unix File System',
                                'Processes',
                                'Signals',
                                'Shell Programming',
                                'C Programming',
                            ],
                            professorId: professors[2].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 380 - Principles of Data Science',
                            lectures: [
                                'Data Mining',
                                'Machine Learning',
                                'Data Visualization',
                                'Statistical Analysis',
                            ],
                            professorId: professors[3].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 422 - Parallel and Distributed Programming',
                            lectures: [
                                'Concurrency',
                                'Parallelism',
                                'Distributed Computing',
                                'Message Passing',
                            ],
                            professorId: professors[0].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 433 - Computer Graphics',
                            lectures: [
                                '2D/3D Rendering',
                                'Transformations',
                                'Ray Tracing',
                                'Modeling',
                            ],
                            professorId: professors[1].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 445 - Algorithms',
                            lectures: [
                                'Advanced Algorithm Analysis',
                                'Greedy Algorithms',
                                'Dynamic Programming',
                                'NP-Completeness',
                            ],
                            professorId: professors[2].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            title: 'CSC 460 - Database Systems',
                            lectures: [
                                'Relational Model',
                                'SQL',
                                'Database Design',
                                'Query Optimization',
                            ],
                            professorId: professors[3].id,
                            semester: semesters[Math.floor(Math.random() * semesters.length)],
                            weekdays: getRandomWeekdays(),
                            lectureTime: getRandomLectureTime(),
                        },
                    ];
                    console.log('Preparing to create ' + coursesToCreate.length + ' courses');
                    (_i = 0), (coursesToCreate_1 = coursesToCreate);
                    _a.label = 2;
                case 2:
                    if (!(_i < coursesToCreate_1.length)) return [3 /*break*/, 5];
                    course = coursesToCreate_1[_i];
                    return [
                        4 /*yield*/,
                        dynamodb
                            .put({
                                TableName: TABLES.COURSES,
                                Item: course,
                            })
                            .promise(),
                    ];
                case 3:
                    _a.sent();
                    console.log('Created course: '.concat(course.title));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log(
                        'Successfully created '.concat(
                            coursesToCreate ? coursesToCreate.length : 0,
                            ' courses!'
                        )
                    );
                    return [3 /*break*/, 6];
                case 6:
                    return [2 /*return*/];
            }
        });
    });
}

// Run the script
createCourses();
