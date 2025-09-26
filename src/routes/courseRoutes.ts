import { Router, type Request, type Response } from "express";
import { students } from "../db/db.js";
import { courses } from "../db/db.js";
import { 
    zStudentDeleteBody,
    zStudentPostBody,
    zStudentPutBody,
    zStudentId
} from "../schemas/studentValidator.js";
import type { Student } from "../libs/types.js";
import type { Course } from "../libs/types.js";
import { 
    zCourseId, 
    zCoursePostBody, 
    zCoursePutBody, 
    zCourseDeleteBody 
 } from "../schemas/courseValidator.js";






const router: Router = Router();

// READ all
router.get("/students", (req: Request, res: Response) => {
    try{
        return res.status(200).json({
            success: true,
            data: students.map((student) => student),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: error,
        });
    }
});

// Params URL 
router.get("/courses", (req: Request, res: Response) => {
    try {
        return res.status(200).json({
            success: true,
            data: courses.map((courses) => courses),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: error,
        });
    }
});

router.get("/students/:studentId/courses", (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId;
        const result = zStudentId.safeParse(studentId);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues[0]?.message,
            });
        }
        const student = students.findIndex((student) => student.studentId === studentId);
        if (student === -1) {
        return res.status(404).json({
            success: false,
            message: "Student does not exists",
        });
        }
        const resultCourses = students[student]?.courses?.map((courseId) => {
            const course = courses.find((c) => c.courseId === courseId);
            return {
                courseId: course?.courseId,
                courseTitle: course?.courseTitle
            };
        });

        res.set("Link",`/students/${studentId}/courses`);

        return res.status(200).json({
            success: true,
            message: `Get courses detail of student ${studentId}`,
            data: {
                studentId: studentId,
                courses: resultCourses,
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: error,
        });
    }
});

//
router.get("/api/v2/course/:courseId",(req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId;
        const result = zCourseId.safeParse(Number(courseId));
        const Body = req.body as Course;
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: "Invalid input: expected number, received NaN"
            });
        }

        const course = courses.findIndex((course) => course.courseId === Number(courseId));
        if ( course === -1) {
        return res.status(404).json({
            success: false,
            message: "Course does not exists",
        });
        }

        res.set("Link", `/courses/${courseId}`);

        return res.status(200).json({
        success: true,
        message: `Get courses ${courseId} successfully`,
        data: {
            courseId: courseId,
            courseTitle: courses[course]?.courseTitle,
            instructors: courses[course]?.instructors,
        }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Somthing is wrong, please try again",
            error: error,
        });
    }
})

router.post("/courses", (req: Request, res: Response) => {
    try {
        const body = req.body as Course;

        const result = zCoursePostBody.safeParse(body); 
        if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues[0]?.message,
        });
        }

        const found = courses.find(
        (course) => course.courseId === body.courseId
        );
        if (found) {
        return res.status(409).json({
            success: false,
            message: "Course Id is already exists",
        });
        }

        const new_course = body;
        courses.push(new_course);

        res.set("Link", `/courses/${new_course.courseId}`);

        return res.status(200).json({
        success: true,
        message: `Course ${body.courseId} has been added successfully`,
        data: new_course,
        });
    } catch (err) {
        return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
        });
    }
});
router.put("/courses", (req: Request, res: Response) => {
    try {
        const body = req.body as Course;
        const result = zCoursePutBody.safeParse(body); 
        if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues[0]?.message,
        });
        }
        const course = courses.findIndex(
        (course) => course.courseId === body.courseId
        );

        if (course === -1) {
        return res.status(404).json({
            success: false,
            message: "Course Id does not exists",
        });
        }
        courses[course] = { ...courses[course], ...body };

        res.set("Link", `/courses/${body.courseId}`);

        return res.status(200).json({
        success: true,
        message: `course ${body.courseId} has been updated successfully`,
        data: courses[course],
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: error,
        });
    }
});
router.delete("/courses", (req: Request, res: Response) => {
    try {
        const body = req.body;
        const parseResult = zCourseDeleteBody.safeParse(body);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: parseResult.error.issues[0]?.message,
            });
        }
        const course = courses.findIndex(
        (course: Course) => course.courseId === body.courseId
        );
        if (course === -1) {
            return res.status(404).json({
                success: false,
                message: "Course Id does not exists",
            });
        }
        const deletecourse = courses[course];
        courses.splice(course, 1);
        return res.status(200).json({
            success: true,
            message: `Course ${deletecourse?.courseId} has been deleted successfully`,
            data: deletecourse,
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: error,
        });
    }
});
export default router;
