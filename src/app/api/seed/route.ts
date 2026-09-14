import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Event from '@/models/Event';
import Job from '@/models/Job';
import Announcement from '@/models/Announcement';
import Story from '@/models/Story';
import Donation from '@/models/Donation';

export async function GET() {
  try {
    await dbConnect();

    // Check if data already seeded
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already has data. Seeding skipped.' });
    }

    // 1. Create Admin Account
    const adminUser = await User.create({
      name: 'Portal Administrator',
      email: 'admin@alumni.com',
      password: 'adminpassword123',
      role: 'admin',
      graduationYear: 2018,
      department: 'Computer Science',
      currentLocation: 'Noida, India',
    });

    await Profile.create({
      userId: adminUser._id,
      fullName: 'Portal Administrator',
      email: 'admin@alumni.com',
      graduationYear: 2018,
      department: 'Computer Science',
      jobTitle: 'Alumni Network Director',
      company: 'Alma Mater College',
      bio: 'Managing global alumni networking and career mentorship initiatives.',
    });

    // 2. Create Sample Alumni Users
    const alumniData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        graduationYear: 2021,
        department: 'Computer Science',
        location: 'Bengaluru, India',
        jobTitle: 'Senior Software Engineer',
        company: 'Google',
        industry: 'Technology',
        skills: ['React', 'Node.js', 'System Design', 'Go', 'Distributed Systems'],
        bio: 'Passionate about building scalable cloud services and helping junior students crack coding interviews.',
        availableForMentorship: true,
        mentorshipAreas: ['Resume Review', 'Coding Interviews', 'System Design'],
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        graduationYear: 2020,
        department: 'Information Technology',
        location: 'San Francisco, USA',
        jobTitle: 'Staff Product Manager',
        company: 'Meta',
        industry: 'Social Media',
        skills: ['Product Strategy', 'UI/UX', 'Analytics', 'A/B Testing'],
        bio: 'Leading product initiatives for AI-driven user experiences. Happy to mentor students interested in product management.',
        availableForMentorship: true,
        mentorshipAreas: ['Product Management', 'Career Transition'],
      },
      {
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        graduationYear: 2022,
        department: 'Electronics & Communication',
        location: 'Noida, India',
        jobTitle: 'Robotics Hardware Architect',
        company: 'RoboTech Solutions',
        industry: 'Hardware & IoT',
        skills: ['Embedded Systems', 'PCB Design', 'C++', 'Robotics'],
        bio: 'Designing next-generation IoT robotics sensors. Enthusiastic about hardware innovations.',
        availableForMentorship: false,
        mentorshipAreas: [],
      },
      {
        name: 'Ananya Gupta',
        email: 'ananya.g@example.com',
        graduationYear: 2019,
        department: 'Business Administration',
        location: 'London, UK',
        jobTitle: 'Investment Associate',
        company: 'Goldman Sachs',
        industry: 'Fintech & Banking',
        skills: ['Financial Modeling', 'Venture Capital', 'Equity Research'],
        bio: 'Working in tech venture capital. Open for mentorship on finance careers.',
        availableForMentorship: true,
        mentorshipAreas: ['Finance & VC', 'Global Higher Studies'],
      },
    ];

    for (const a of alumniData) {
      const user = await User.create({
        name: a.name,
        email: a.email,
        password: 'password123',
        role: 'alumni',
        graduationYear: a.graduationYear,
        department: a.department,
        currentLocation: a.location,
      });

      await Profile.create({
        userId: user._id,
        fullName: a.name,
        email: a.email,
        graduationYear: a.graduationYear,
        department: a.department,
        currentCity: a.location,
        jobTitle: a.jobTitle,
        company: a.company,
        industry: a.industry,
        skills: a.skills,
        bio: a.bio,
        availableForMentorship: a.availableForMentorship,
        mentorshipAreas: a.mentorshipAreas,
      });
    }

    // 3. Create Sample Events
    await Event.create([
      {
        title: 'Global Alumni Tech Summit 2026',
        description: 'Join over 500+ global alumni leaders for a full-day summit covering AI innovation, startup funding trends, and cloud engineering best practices.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '05:00 PM',
        venue: 'Auditorium Hall A & Online Stream',
        eventType: 'hybrid',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        organizer: adminUser._id,
        maxParticipants: 500,
        registeredCount: 142,
        status: 'upcoming',
      },
      {
        title: 'Resume Review & Crack the Technical Interview Workshop',
        description: 'Interactive live session led by Google & Meta alumni. Get your resume live-critiqued and practice mock coding problems.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '06:00 PM',
        endTime: '08:00 PM',
        venue: 'Google Meet',
        eventType: 'online',
        meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
        organizer: adminUser._id,
        maxParticipants: 100,
        registeredCount: 88,
        status: 'upcoming',
      },
    ]);

    // 4. Create Sample Jobs
    await Job.create([
      {
        title: 'Full Stack React & Node.js Developer',
        company: 'RoboTech Solutions',
        description: 'We are hiring a mid-level Full Stack Developer to build our enterprise web dashboard. Great work culture, remote-first policy, and competitive ESOPs.',
        location: 'Noida / Remote',
        employmentType: 'full-time',
        experienceRequired: '1-3 years',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        salaryRange: '₹14L - ₹20L per annum',
        applicationUrl: 'https://example.com/careers/fullstack',
        postedBy: adminUser._id,
        status: 'active',
      },
      {
        title: 'Product Management Intern (Summer 2026)',
        company: 'Fintech Global',
        description: 'Seeking energetic final-year students for a 6-month paid PM internship with direct conversion opportunity.',
        location: 'Bengaluru, India',
        employmentType: 'internship',
        experienceRequired: '0-1 year',
        skillsRequired: ['Product Analytics', 'User Research', 'SQL'],
        salaryRange: '₹40,000 / month',
        applicationUrl: 'https://example.com/careers/pm-intern',
        postedBy: adminUser._id,
        status: 'active',
      },
    ]);

    // 5. Create Sample Announcements
    await Announcement.create([
      {
        title: 'College Ranked Top 10 National Institution in Engineering 2026',
        description: 'We are proud to announce that our college has achieved #8 rank in the National Innovation Framework rankings. Congratulations to all students and alumni!',
        category: 'college-news',
        date: new Date(),
        author: adminUser._id,
        published: true,
      },
      {
        title: 'Annual Alumni Homecoming Reunion Scheduled for December',
        description: 'Mark your calendars! The Annual Homecoming Reunion will bring together batches from 1995 to 2025 for a 2-day campus celebration.',
        category: 'alumni-news',
        date: new Date(),
        author: adminUser._id,
        published: true,
      },
    ]);

    // 6. Create Sample Stories
    await Story.create([
      {
        title: 'Building a $50M AI Startup: Lessons from my Campus Days',
        story: 'When I graduated in 2019, I started working in a small apartment with two batchmates. Our college incubators gave us our first server grant. Today we serve 1M+ active users worldwide!',
        author: adminUser._id,
        company: 'RoboTech Solutions',
        designation: 'Co-Founder & CEO',
        graduationYear: 2019,
        category: 'entrepreneurship',
        status: 'approved',
        published: true,
      },
    ]);

    // 7. Create Sample Donation Campaigns
    await Donation.create([
      {
        title: 'Student Merit Scholarship Fund 2026',
        description: 'Providing tuition fee grants to underprivileged students with exceptional academic performance.',
        targetAmount: 500000,
        currentAmount: 215000,
        category: 'student-scholarships',
        donorsCount: 42,
        status: 'active',
      },
    ]);

    return NextResponse.json({
      message: 'Database successfully seeded with realistic demo data!',
      defaultCredentials: {
        admin: 'admin@alumni.com / adminpassword123',
        alumni: 'rahul.sharma@example.com / password123',
      },
    });
  } catch (error: unknown) {
    console.error('Seeding error:', error);
    const message = error instanceof Error ? error.message : 'Server error during seeding';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
