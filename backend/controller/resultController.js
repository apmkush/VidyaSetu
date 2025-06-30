
import ClassModel from "../models/Class.js";
import { UserModel } from "../models/user.js";
import Result from '../models/Result.js';
import PDFDocument from 'pdfkit';


export const GetStudents = async (req, res) => {
    try {
        const { semester, subjectName } = req.query;

        // 1. Find the class that matches semester (from context) and subject
        const classData = await ClassModel.findOne({
            'subject': subjectName,
            'context.semester': semester
        }).select('students');

        if (!classData) {
            return res.status(404).json({ 
                error: 'No class found for this subject and semester',
                details: `Subject: ${subjectName}, Semester: ${semester}`
            });
        }

        // 2. Get student details using the IDs from class
        const students = await UserModel.find({
            '_id': { $in: classData.students },
            'userRole': 'student'
        }).select('regno name');
        
        if (students.length === 0) {
            return res.status(404).json({ 
                error: 'No students enrolled in this class',
            });
        }

        res.json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch students',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};

export const SubmitResult=async (req,res)=>{
    try {
    const { semester, subjectName,batch, students, createdBy } = req.body;

    // 3. Prepare student data with ObjectId references
    const studentResults = await Promise.all(
      students.map(async ({ regno, grade }) => {
        // Find student by registration number
        const student = await UserModel.findOne({ regno, userRole: 'student' });
        if (!student) {
          throw new Error(`Student with regno ${regno} not found`);
        }
        return {
          studentId: student._id,
          grade
        };
      })
    );
    // 4. Create new result document
    const result = new Result({
      semester,
      subject: subjectName,
      Batch:batch,
      students: studentResults,
      createdBy:req.user.id,
    });

    // 5. Save to database
    await result.save();

    res.status(201).json({
      success: true,
      message: 'Results submitted successfully',
      data: {
        resultId: result._id,
        semester: result.semester,
        subject: subjectName,
        studentCount: result.students.length
      }
    });

  } catch (error) {
    console.error('Error submitting results:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit results',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// controllers/resultController.js
export const getResult = async (req, res) => {
    try {
        const student=await UserModel.findById(req.user.id);
        const studentId=student._id;
        
        // Get all results for this student in their current semester and batch
        const results = await Result.find({
            'semester': student.semester,
            'Batch': student.batchYear,
            'students.studentId': student._id
        });
        // console.log(results);
        // Organize by semester
        const transcriptData = {
            batch: student.batchYear,
            results: {}
        };
        
        results.forEach(result => {
            const studentResult = result.students.find(s => s.studentId.equals(studentId));
            if (!transcriptData.results[result.semester]) {
                transcriptData.results[result.semester] = [];
            }
            
            transcriptData.results[result.semester].push({
                subject: result.subject,
                grade: studentResult.grade
            });
        });
        
        res.json(transcriptData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate transcript',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getPDF = async (req, res) => {
    try {
        const student = await UserModel.findById(req.user.id);
        const studentId = student._id;
        
        // Get all results for this student
        const results = await Result.find({
            'students.studentId': student._id
        }).sort({ semester: 1 });
        
        // Organize by semester and calculate performance indices
        const transcriptData = {
            name: student.name,
            regno: student.regno,
            branch: student.branch,
            semesters: {},
            overallCPI: 0
        };

        let totalCredits = 0;
        let totalGradePoints = 0;
        
        results.forEach(result => {
            const studentResult = result.students.find(s => s.studentId.equals(studentId));
            if (!transcriptData.semesters[result.semester]) {
                transcriptData.semesters[result.semester] = {
                    subjects: [],
                    credits: 0,
                    gradePoints: 0
                };
            }
            
            const gradePoints = {
                'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'E': 4, 'F': 0
            }[studentResult.grade] || 0;
            
            const credits = result.credits || 3;
            
            transcriptData.semesters[result.semester].subjects.push({
                name: result.subject,
                credits: credits,
                grade: studentResult.grade
            });
            
            transcriptData.semesters[result.semester].credits += credits;
            transcriptData.semesters[result.semester].gradePoints += credits * gradePoints;
            
            totalCredits += credits;
            totalGradePoints += credits * gradePoints;
        });
        
        // Calculate SPI for each semester and overall CPI
        Object.keys(transcriptData.semesters).forEach(sem => {
            transcriptData.semesters[sem].SPI = 
                (transcriptData.semesters[sem].gradePoints / transcriptData.semesters[sem].credits).toFixed(2);
        });
        
        transcriptData.overallCPI = (totalGradePoints / totalCredits).toFixed(2);
        
        // Generate PDF
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Transcript_${student.regno}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Header
        doc.fontSize(14)
           .text('MOTILAL NEHRU NATIONAL INSTITUTE OF TECHNOLOGY', { align: 'center' })
           .fontSize(12)
           .text('ALLABAD (PRAYAGRAJ), INDIA', { align: 'center' })
           .moveDown(0.5)
           .fontSize(12)
           .text('WEB GENERATED TRANSCRIPT', { align: 'center' })
           .moveDown(1);
        
        // Student info
        doc.fontSize(10)
           .text(`Name: ${transcriptData.name}`, 50, doc.y)
           .text(`Branch: ${transcriptData.branch}`, 300, doc.y)
           .moveDown(1)
           .text(`Reg No: ${transcriptData.regno}`, 50, doc.y)
           .moveDown(1);
        
        // Semester results in table format
        Object.keys(transcriptData.semesters).sort().forEach(sem => {
            const semester = transcriptData.semesters[sem];
            
            // Semester header
            doc.fontSize(12)
               .text(`Semester ${sem} (${getSemesterDates(sem)})`, 50, doc.y)
               .moveDown(0.5);
            
            // Table header
            doc.font('Helvetica-Bold')
               .fillColor('#000000')
               .text('Subject Name', 50, doc.y)
               .text('Credits', 350, doc.y, { width: 60, align: 'center' })
               .text('Grade', 420, doc.y, { width: 60, align: 'center' })
               .moveDown(0.5);
            
            // Table rows
            doc.font('Helvetica')
               .fillColor('#333333');
            
            let y = doc.y;
            semester.subjects.forEach((subject, index) => {
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.fillColor('#F5F5F5')
                       .rect(50, y, 500, 20)
                       .fill();
                }
                
                doc.fillColor('#333333')
                   .text(subject.name, 50, y + 5, { width: 290 })
                   .text(subject.credits.toString(), 350, y + 5, { width: 60, align: 'center' })
                   .text(subject.grade, 420, y + 5, { width: 60, align: 'center' });
                
                y += 20;
            });
            
            doc.y = y + 10;
            
            // SPI for semester - Left aligned with bigger font
            doc.font('Helvetica-Bold')
               .fontSize(12)
               .fillColor('#006600')
               .text(`Semester Performance Index (SPI): ${semester.SPI}`, 50, doc.y)
               .moveDown(1);
        });
        
        // Overall CPI - Left aligned with bigger font
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor('#990000')
           .text(`Cumulative Performance Index (CPI): ${transcriptData.overallCPI}`, 50, doc.y)
           .moveDown(1);
        
        // Footer
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`Date of Generation: ${new Date().toLocaleDateString('en-IN')}`, 50, doc.y)
           .moveDown(0.5)
           .text('Note: The medium of instruction/communication in Institute is English.', 50, doc.y)
           .moveDown(0.5)
           .text('Disclaimer: Every effort has been made to keep the data authentic and up to date.', 50, doc.y);
        
        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate PDF',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to get semester dates
function getSemesterDates(semester) {
    const sem = parseInt(semester);
    const oddSemesters = ['July - Dec', 'Jan - May'];
    
    if (sem % 2 === 1) {
        const year = 2022 + Math.floor((sem - 1) / 2);
        return `${oddSemesters[0]} ${year}`;
    } else {
        const year = 2022 + Math.floor((sem - 1) / 2);
        return `${oddSemesters[1]} ${year}`;
    }
}