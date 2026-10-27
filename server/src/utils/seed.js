const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const Review = require('../models/Review');
const DownloadHistory = require('../models/DownloadHistory');
const Report = require('../models/Report');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Function to generate sample PDF or document file if not present
const createSampleDoc = (filename, contentText) => {
  const filePath = path.join(uploadsDir, filename);
  // Simple PDF-like header / text payload for realistic demo
  const sampleContent = `%PDF-1.4
% NoteNest Educational Platform - Smart Study Material
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(${contentText}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF
`;
  fs.writeFileSync(filePath, sampleContent);
  const stats = fs.statSync(filePath);
  return {
    filename,
    size: stats.size,
    path: filePath,
  };
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notenest';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      Bookmark.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      DownloadHistory.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminPasswordHash = await User.hashPassword('Admin@123');
    const studentPasswordHash = await User.hashPassword('Student@123');

    const admin = await User.create({
      name: 'Prof. Arvind Sharma (Admin)',
      email: 'admin@notenest.edu',
      passwordHash: adminPasswordHash,
      branch: 'Computer Science',
      semester: 8,
      role: 'admin',
      bio: 'Head Moderator & Faculty Mentor for NoteNest College Knowledge Hub.',
    });

    const student1 = await User.create({
      name: 'Rohit Verma',
      email: 'rohit@notenest.edu',
      passwordHash: studentPasswordHash,
      branch: 'Computer Science',
      semester: 5,
      role: 'student',
      bio: 'B.Tech CSE student passionate about algorithms, systems design, and competitive coding.',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@notenest.edu',
      passwordHash: studentPasswordHash,
      branch: 'Information Technology',
      semester: 4,
      role: 'student',
      bio: 'Full-stack enthusiast, semester class representative, and open-source contributor.',
    });

    const student3 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'ananya@notenest.edu',
      passwordHash: studentPasswordHash,
      branch: 'Electronics & Communication',
      semester: 6,
      role: 'student',
      bio: 'ECE scholar working with embedded systems, IoT sensors, and VLSI circuit design.',
    });

    console.log('[Seed] Generating sample documents and resources...');

    const sampleFiles = [
      createSampleDoc(
        'dsa_complete_notes_module1_5.pdf',
        'Data Structures & Algorithms - Complete Comprehensive Guide (Trees, Graphs, DP)'
      ),
      createSampleDoc(
        'os_process_synchronization_notes.pdf',
        'Operating Systems: Semaphores, Deadlocks, Mutex and Scheduling Algorithms'
      ),
      createSampleDoc(
        'dbms_sql_normalization_practical_manual.pdf',
        'DBMS Lab Manual: ER Diagrams, SQL Queries, 3NF & BCNF Normalization Cases'
      ),
      createSampleDoc(
        'computer_networks_gate_pyq_2019_2024.pdf',
        'Computer Networks: Solved Previous Year Questions (OSI, TCP/IP, Routing)'
      ),
      createSampleDoc(
        'ai_machine_learning_handwritten_cheatsheet.pdf',
        'Machine Learning & Artificial Intelligence - Handwritten Core Concept Revision Notes'
      ),
      createSampleDoc(
        'dsp_signals_systems_midsem_pyq.pdf',
        'Digital Signal Processing - Mid-Semester Exam Previous Years Question Papers with Solutions'
      ),
      createSampleDoc(
        'thermodynamics_unit_1_4_handwritten.pdf',
        'Engineering Thermodynamics: Laws of Thermodynamics, Carnot Cycles, Rankine Cycle Notes'
      ),
      createSampleDoc(
        'web_tech_react_node_lab_file.pdf',
        'Web Technologies Practical File: REST APIs, React Single Page Applications & MongoDB'
      ),
    ];

    const resourcesData = [
      {
        title: 'Complete Data Structures & Algorithms Master Notes (Modules 1-5)',
        description:
          'Comprehensive semester notes covering Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, AVL Trees, Graphs, Dijkstra algorithm, and Dynamic Programming with clean diagrams and code snippets in C++ and Java.',
        subject: 'Data Structures and Algorithms',
        branch: 'Computer Science',
        semester: 3,
        resourceType: 'Notes',
        fileUrl: `/uploads/${sampleFiles[0].filename}`,
        storageIdentifier: sampleFiles[0].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[0].filename,
        fileSize: sampleFiles[0].size,
        mimeType: 'application/pdf',
        uploader: student1._id,
        moderationStatus: 'approved',
        downloadCount: 142,
        viewCount: 480,
        averageRating: 4.8,
        ratingCount: 12,
        tags: ['DSA', 'Trees', 'Graphs', 'Dynamic Programming', 'Semester 3'],
      },
      {
        title: 'Operating Systems: Process Synchronization, Deadlocks & Memory Management',
        description:
          'In-depth exam-oriented revision notes focusing on critical sections, Peterson algorithm, semaphores, Banker algorithm for deadlock avoidance, paging, segmentation, and virtual memory replacement algorithms.',
        subject: 'Operating Systems',
        branch: 'Computer Science',
        semester: 4,
        resourceType: 'Handwritten Notes',
        fileUrl: `/uploads/${sampleFiles[1].filename}`,
        storageIdentifier: sampleFiles[1].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[1].filename,
        fileSize: sampleFiles[1].size,
        mimeType: 'application/pdf',
        uploader: student2._id,
        moderationStatus: 'approved',
        downloadCount: 98,
        viewCount: 310,
        averageRating: 4.6,
        ratingCount: 8,
        tags: ['OS', 'Semaphores', 'Deadlocks', 'Virtual Memory', 'Exam Ready'],
      },
      {
        title: 'DBMS Laboratory Practical Manual & Verified SQL Queries',
        description:
          'Complete verified lab record for Database Management Systems lab. Contains 12 experiments covering DDL, DML, Nested Joins, Triggers, PL/SQL Procedures, and Normalized Hospital Management schema.',
        subject: 'Database Management Systems',
        branch: 'Information Technology',
        semester: 4,
        resourceType: 'Practical File',
        fileUrl: `/uploads/${sampleFiles[2].filename}`,
        storageIdentifier: sampleFiles[2].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[2].filename,
        fileSize: sampleFiles[2].size,
        mimeType: 'application/pdf',
        uploader: student2._id,
        moderationStatus: 'approved',
        downloadCount: 115,
        viewCount: 290,
        averageRating: 4.9,
        ratingCount: 15,
        tags: ['DBMS', 'SQL', 'Lab Manual', 'PL/SQL', 'Practical Exam'],
      },
      {
        title: 'Computer Networks Solved PYQ Collection (2019-2024)',
        description:
          'Five years of solved end-semester and competitive exam question papers. Thorough step-by-step calculations for subnetting, CRC polynomial error detection, sliding window protocols, and distance vector routing.',
        subject: 'Computer Networks',
        branch: 'Computer Science',
        semester: 5,
        resourceType: 'PYQ',
        fileUrl: `/uploads/${sampleFiles[3].filename}`,
        storageIdentifier: sampleFiles[3].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[3].filename,
        fileSize: sampleFiles[3].size,
        mimeType: 'application/pdf',
        uploader: student1._id,
        moderationStatus: 'approved',
        downloadCount: 87,
        viewCount: 240,
        averageRating: 4.7,
        ratingCount: 7,
        tags: ['Computer Networks', 'Subnetting', 'PYQ', 'TCP/IP', 'Solved Papers'],
      },
      {
        title: 'Machine Learning & AI Core Concepts Handwritten Revision Sheets',
        description:
          'Crisp formula sheets and high-yield intuition summaries for Supervised Learning, Logistic Regression, Decision Trees, Random Forests, Gradient Descent, Neural Networks, Loss Functions, and SVMs.',
        subject: 'Artificial Intelligence',
        branch: 'Information Technology',
        semester: 6,
        resourceType: 'Handwritten Notes',
        fileUrl: `/uploads/${sampleFiles[4].filename}`,
        storageIdentifier: sampleFiles[4].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[4].filename,
        fileSize: sampleFiles[4].size,
        mimeType: 'application/pdf',
        uploader: student2._id,
        moderationStatus: 'approved',
        downloadCount: 65,
        viewCount: 190,
        averageRating: 4.5,
        ratingCount: 6,
        tags: ['AI', 'Machine Learning', 'Formulas', 'Quick Revision'],
      },
      {
        title: 'Digital Signal Processing (DSP) Mid-Semester Solved Questions',
        description:
          'ECE semester 5 reference material featuring Z-transforms, Discrete Fourier Transform (DFT), FFT Decimation-in-Time and Decimation-in-Frequency derivations with solved numerical problems.',
        subject: 'Digital Signal Processing',
        branch: 'Electronics & Communication',
        semester: 5,
        resourceType: 'PYQ',
        fileUrl: `/uploads/${sampleFiles[5].filename}`,
        storageIdentifier: sampleFiles[5].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[5].filename,
        fileSize: sampleFiles[5].size,
        mimeType: 'application/pdf',
        uploader: student3._id,
        moderationStatus: 'approved',
        downloadCount: 52,
        viewCount: 160,
        averageRating: 4.4,
        ratingCount: 5,
        tags: ['DSP', 'Signals', 'ECE', 'Z-Transform', 'FFT'],
      },
      {
        title: 'Engineering Thermodynamics: Laws, Gas Power Cycles & Steam Properties',
        description:
          'Structured handwritten study guide for mechanical engineering students. Covers Zeroth, First, and Second laws, Carnot theorem, Otto, Diesel, and Dual cycles with clear T-s and P-v diagrams.',
        subject: 'Engineering Thermodynamics',
        branch: 'Mechanical Engineering',
        semester: 3,
        resourceType: 'Notes',
        fileUrl: `/uploads/${sampleFiles[6].filename}`,
        storageIdentifier: sampleFiles[6].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[6].filename,
        fileSize: sampleFiles[6].size,
        mimeType: 'application/pdf',
        uploader: student3._id,
        moderationStatus: 'approved',
        downloadCount: 44,
        viewCount: 135,
        averageRating: 4.3,
        ratingCount: 4,
        tags: ['Thermodynamics', 'Mechanical', 'Cycles', 'Formulas'],
      },
      {
        title: 'Web Technologies Full-Stack Lab File (React, Node, Express, MongoDB)',
        description:
          'Modern college practical lab file demonstrating REST API development, JWT authentication flow, state management with React hooks, and MongoDB Mongoose models with sample output screenshots.',
        subject: 'Web Technologies',
        branch: 'Computer Science',
        semester: 6,
        resourceType: 'Lab Manual',
        fileUrl: `/uploads/${sampleFiles[7].filename}`,
        storageIdentifier: sampleFiles[7].filename,
        storageProvider: 'local',
        originalFilename: sampleFiles[7].filename,
        fileSize: sampleFiles[7].size,
        mimeType: 'application/pdf',
        uploader: student1._id,
        moderationStatus: 'approved',
        downloadCount: 178,
        viewCount: 520,
        averageRating: 5.0,
        ratingCount: 20,
        tags: ['MERN', 'Web Tech', 'React', 'NodeJS', 'Lab Manual'],
      },
    ];

    const createdResources = await Resource.insertMany(resourcesData);

    console.log('[Seed] Seeding sample reviews and ratings...');
    await Review.insertMany([
      {
        user: student2._id,
        resource: createdResources[0]._id,
        rating: 5,
        comment: 'Brilliant notes! The tree and graph diagrams made my mid-sem revision so straightforward.',
      },
      {
        user: student3._id,
        resource: createdResources[0]._id,
        rating: 5,
        comment: 'Very cleanly structured, covers every single question asked in our university exam.',
      },
      {
        user: student1._id,
        resource: createdResources[2]._id,
        rating: 5,
        comment: 'All SQL triggers and nested queries ran without any syntax errors during our lab viva.',
      },
      {
        user: admin._id,
        resource: createdResources[7]._id,
        rating: 5,
        comment: 'Exemplary project documentation. Meets all academic requirements for web engineering.',
      },
    ]);

    console.log('[Seed] Seeding sample bookmarks & download history...');
    await Bookmark.insertMany([
      { user: student1._id, resource: createdResources[1]._id },
      { user: student1._id, resource: createdResources[2]._id },
      { user: student2._id, resource: createdResources[0]._id },
      { user: student2._id, resource: createdResources[7]._id },
      { user: student3._id, resource: createdResources[0]._id },
    ]);

    await DownloadHistory.insertMany([
      { user: student1._id, resource: createdResources[1]._id },
      { user: student1._id, resource: createdResources[2]._id },
      { user: student2._id, resource: createdResources[0]._id },
      { user: student3._id, resource: createdResources[0]._id },
    ]);

    console.log('[Seed] Seeding sample reports for admin moderation...');
    await Report.create({
      reporter: student3._id,
      resource: createdResources[5]._id,
      reason: 'Incorrect/Misleading Subject',
      details: 'Page 3 equation formula for FFT radix-2 decimation has a slight typo on coefficient W_N.',
      status: 'pending',
    });

    console.log('--------------------------------------------------');
    console.log('✅ NoteNest Database seeded successfully!');
    console.log('👤 Admin Account:');
    console.log('   Email:    admin@notenest.edu');
    console.log('   Password: Admin@123');
    console.log('👤 Student Account 1:');
    console.log('   Email:    rohit@notenest.edu');
    console.log('   Password: Student@123');
    console.log('👤 Student Account 2:');
    console.log('   Email:    priya@notenest.edu');
    console.log('   Password: Student@123');
    console.log('📚 Seeded Resources: 8 comprehensive academic materials');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

