"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = require("aws-sdk");
var dynamodb = new aws_sdk_1.DynamoDB.DocumentClient({
    region: 'us-east-1',
});
var TABLES = {
    PROFESSORS: 'd2l-plus-auth-professors',
    COURSES: 'd2l-plus-auth-courses',
    PROFESSOR_RANKINGS: 'd2l-plus-auth-professor-rankings',
    COURSE_RANKINGS: 'd2l-plus-auth-course-rankings',
};
function getAllProfessors() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dynamodb
                            .scan({
                            TableName: TABLES.PROFESSORS,
                        })
                            .promise()];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.Items || []];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching professors:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getAllCourses() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dynamodb
                            .scan({
                            TableName: TABLES.COURSES,
                        })
                            .promise()];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.Items || []];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching courses:', error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createProfessorRankings() {
    return __awaiter(this, void 0, void 0, function () {
        var professors, _i, professors_1, professor, randomRank, randomVotes, ranking, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getAllProfessors()];
                case 1:
                    professors = _a.sent();
                    console.log("Found ".concat(professors.length, " professors"));
                    if (professors.length === 0) {
                        console.log('No professors found. Please populate professors first.');
                        return [2 /*return*/];
                    }
                    _i = 0, professors_1 = professors;
                    _a.label = 2;
                case 2:
                    if (!(_i < professors_1.length)) return [3 /*break*/, 5];
                    professor = professors_1[_i];
                    randomRank = Math.floor(Math.random() * 5) + 1;
                    randomVotes = Math.floor(Math.random() * 30) + 1;
                    ranking = {
                        professorId: professor.id,
                        rank: randomRank,
                        numberOfVotes: randomVotes,
                    };
                    return [4 /*yield*/, dynamodb
                            .put({
                            TableName: TABLES.PROFESSOR_RANKINGS,
                            Item: ranking,
                        })
                            .promise()];
                case 3:
                    _a.sent();
                    console.log("Created ranking for professor ".concat(professor.firstName, " ").concat(professor.lastName, ": Rank ").concat(randomRank, " (").concat(randomVotes, " votes)"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Successfully populated professor rankings table!');
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error creating professor rankings:', error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function createCourseRankings() {
    return __awaiter(this, void 0, void 0, function () {
        var courses, _i, courses_1, course, randomRank, randomVotes, ranking, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getAllCourses()];
                case 1:
                    courses = _a.sent();
                    console.log("Found ".concat(courses.length, " courses"));
                    if (courses.length === 0) {
                        console.log('No courses found. Please populate courses first.');
                        return [2 /*return*/];
                    }
                    _i = 0, courses_1 = courses;
                    _a.label = 2;
                case 2:
                    if (!(_i < courses_1.length)) return [3 /*break*/, 5];
                    course = courses_1[_i];
                    randomRank = Math.floor(Math.random() * 5) + 1;
                    randomVotes = Math.floor(Math.random() * 50) + 1;
                    ranking = {
                        courseId: course.id,
                        rank: randomRank,
                        numberOfVotes: randomVotes,
                    };
                    return [4 /*yield*/, dynamodb
                            .put({
                            TableName: TABLES.COURSE_RANKINGS,
                            Item: ranking,
                        })
                            .promise()];
                case 3:
                    _a.sent();
                    console.log("Created ranking for course ".concat(course.title, ": Rank ").concat(randomRank, " (").concat(randomVotes, " votes)"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Successfully populated course rankings table!');
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error('Error creating course rankings:', error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function populateRankings() {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log('Starting to populate ranking tables...');
                    return [4 /*yield*/, createProfessorRankings()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createCourseRankings()];
                case 2:
                    _a.sent();
                    console.log('Successfully populated all ranking tables!');
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error populating ranking tables:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the script
populateRankings();
