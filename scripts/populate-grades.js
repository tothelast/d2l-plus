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
var uuid_1 = require("uuid");
var dynamodb = new aws_sdk_1.DynamoDB.DocumentClient({
    region: 'us-east-1',
});
var TABLES = {
    ASSIGNMENTS: 'd2l-plus-auth-assignments',
    ENROLLMENTS: 'd2l-plus-auth-enrollments',
    GRADES: 'd2l-plus-auth-grades',
};
function getAllAssignments() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dynamodb
                            .scan({
                            TableName: TABLES.ASSIGNMENTS,
                        })
                            .promise()];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.Items || []];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching assignments:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getEnrollments() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dynamodb
                            .scan({
                            TableName: TABLES.ENROLLMENTS,
                        })
                            .promise()];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.Items || []];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching enrollments:', error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createGrades() {
    return __awaiter(this, void 0, void 0, function () {
        var assignments, enrollments, courseEnrollments, _i, enrollments_1, enrollment, gradesToCreate, _a, assignments_1, assignment, enrolledStudents, _b, enrolledStudents_1, studentId, randomGrade, grade, _c, gradesToCreate_1, grade, error_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, getAllAssignments()];
                case 1:
                    assignments = _d.sent();
                    console.log("Found ".concat(assignments.length, " assignments"));
                    if (assignments.length === 0) {
                        console.log('No assignments found. Please populate assignments first.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getEnrollments()];
                case 2:
                    enrollments = _d.sent();
                    console.log("Found ".concat(enrollments.length, " enrollments"));
                    if (enrollments.length === 0) {
                        console.log('No enrollments found. Please populate enrollments first.');
                        return [2 /*return*/];
                    }
                    courseEnrollments = new Map();
                    for (_i = 0, enrollments_1 = enrollments; _i < enrollments_1.length; _i++) {
                        enrollment = enrollments_1[_i];
                        if (!courseEnrollments.has(enrollment.courseId)) {
                            courseEnrollments.set(enrollment.courseId, []);
                        }
                        courseEnrollments.get(enrollment.courseId).push(enrollment.userId);
                    }
                    gradesToCreate = [];
                    for (_a = 0, assignments_1 = assignments; _a < assignments_1.length; _a++) {
                        assignment = assignments_1[_a];
                        enrolledStudents = courseEnrollments.get(assignment.courseId) || [];
                        // Skip if no students are enrolled in this course
                        if (enrolledStudents.length === 0) {
                            console.log("No students enrolled in course ".concat(assignment.courseId, " for assignment ").concat(assignment.id));
                            continue;
                        }
                        console.log("Creating grades for assignment ".concat(assignment.title, " (").concat(assignment.id, ") for ").concat(enrolledStudents.length, " students"));
                        // Create grades for each enrolled student
                        for (_b = 0, enrolledStudents_1 = enrolledStudents; _b < enrolledStudents_1.length; _b++) {
                            studentId = enrolledStudents_1[_b];
                            randomGrade = Math.floor(Math.random() * 36) + 65;
                            grade = {
                                id: (0, uuid_1.v4)(),
                                userId: studentId,
                                assignmentId: assignment.id,
                                title: assignment.title,
                                grade: randomGrade,
                                dateTime: new Date().toISOString(),
                            };
                            gradesToCreate.push(grade);
                        }
                    }
                    // Save all grades to DynamoDB
                    console.log("Creating ".concat(gradesToCreate.length, " grades in DynamoDB"));
                    _c = 0, gradesToCreate_1 = gradesToCreate;
                    _d.label = 3;
                case 3:
                    if (!(_c < gradesToCreate_1.length)) return [3 /*break*/, 6];
                    grade = gradesToCreate_1[_c];
                    return [4 /*yield*/, dynamodb
                            .put({
                            TableName: TABLES.GRADES,
                            Item: grade,
                        })
                            .promise()];
                case 4:
                    _d.sent();
                    console.log("Created grade for assignment \"".concat(grade.title, "\" for user ").concat(grade.userId, ": ").concat(grade.grade));
                    _d.label = 5;
                case 5:
                    _c++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Successfully populated grades table!');
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _d.sent();
                    console.error('Error creating grades:', error_3);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run the script
createGrades();
