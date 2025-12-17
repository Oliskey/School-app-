
import {
    Student,
    Teacher,
    StudentFeeInfo,
    Assignment,
    Submission,
    Notice,
    StudentAttendance,
    TimetableEntry,
    StudentPerformanceData,
    Notification,
    Role,
    Permission,
    AuditLog,
    Photo,
    DigitalResource,
    BusRoute,
    BusRosterEntry,
    Driver,
    PickupPoint,
    SubjectAverage,
    AttendanceCorrelationPoint,
    Exam,
    Conversation,
    PTAMeeting,
    SchoolPolicy,
    LearningResource,
    VolunteeringOpportunity,
    PermissionSlip,
    FeeBreakdownItem,
    PaymentHistoryItem,
    Badge,
    Certificate,
    Award,
    StoreProduct,
    StoreOrder,
    ForumTopic,
    PDResource,
    HealthLogEntry,
    AIGame,
    CBTTest,
    Activity,
    ExtracurricularEvent,
    ProgressReport,
    Quiz,
    Appointment,
    ClassInfo,
    Parent,
    RoleName,
    Complaint,
    AppointmentSlot
} from './types';
import {
    ExamIcon,
    AttendanceIcon,
    ReportIcon,
    MegaphoneIcon,
    BookOpenIcon,
    ViewGridIcon,
    BusIcon,
    ReceiptIcon,
    UsersIcon,
    AnalyticsIcon,
    AIIcon,
    GameControllerIcon,
    TrophyIcon,
    StarIcon
} from './constants';

export const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

export const getSubjectsForStudent = (student: Student): string[] => {
    if (student.grade >= 10) {
        if (student.department === 'Science') return ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Civic Education'];
        if (student.department === 'Arts') return ['Mathematics', 'English', 'Literature', 'Government', 'History', 'Civic Education'];
        if (student.department === 'Commercial') return ['Mathematics', 'English', 'Accounting', 'Commerce', 'Economics', 'Civic Education'];
    }
    return ['Mathematics', 'English', 'Basic Science', 'Basic Technology', 'Social Studies', 'Civic Education'];
};

export const mockClasses: ClassInfo[] = [];
export const mockStudents: Student[] = [];
export const mockTeachers: Teacher[] = [];
export const mockParents: Parent[] = [];
export const mockNotices: Notice[] = [];
export const mockNotifications: Notification[] = [];
export const mockStudentFees: StudentFeeInfo[] = [];
export const mockAssignments: Assignment[] = [];
export const mockSubmissions: Submission[] = [];
export const mockStudentAttendance: StudentAttendance[] = [];
export const mockTimetableData: TimetableEntry[] = [];
export const mockProgressReports: ProgressReport[] = [];
export const mockEnrollmentData: { year: number, count: number }[] = [];
export const mockAuditLogs: AuditLog[] = [];
export const mockSavedTimetable = { current: null as any };
export const mockBusRoster: BusRosterEntry[] = [];
export const mockBusRoutes: BusRoute[] = [];
export const mockDrivers: Driver[] = [];
export const mockPickupPoints: PickupPoint[] = [];
export const mockHealthLogs: HealthLogEntry[] = [];
export const mockExamsData: Exam[] = [];
export const mockCalendarEvents: any[] = [];
export const mockDigitalResources: DigitalResource[] = [];
export const mockPhotos: Photo[] = [];
export const mockConversations: Conversation[] = [];
export const mockAdminConversations: Conversation[] = [];
export const mockSubjectAverages: SubjectAverage[] = [];
export const mockTopStudents: StudentPerformanceData[] = [];
export const mockAttendanceCorrelation: AttendanceCorrelationPoint[] = [];
export const mockFeeBreakdown: FeeBreakdownItem[] = [];
export const mockPaymentHistory: PaymentHistoryItem[] = [];
export const mockBadges: Badge[] = [];
export const mockCertificates: Certificate[] = [];
export const mockAwards: Award[] = [];
export const mockLearningResources: LearningResource[] = [];
export const mockSchoolPolicies: SchoolPolicy[] = [];
export const mockPtaMeetings: PTAMeeting[] = [];
export const mockVolunteeringOpportunities: VolunteeringOpportunity[] = [];
export const mockPermissionSlip: PermissionSlip = {
    id: 1, title: 'Excursion (Placeholder)', description: '', date: new Date().toISOString(), location: '', status: 'Pending'
};
export const mockStoreProducts: StoreProduct[] = [];
export const mockStoreOrders: StoreOrder[] = [];
export const mockForumTopics: ForumTopic[] = [];
export const mockAppointmentSlots: AppointmentSlot[] = [];
export const mockAppointments: Appointment[] = [];
export const mockQuizzes: Quiz[] = [];
export const mockPdResources: PDResource[] = [];
export const mockCustomAIGames: AIGame[] = [];
export const mockActivities: Activity[] = [];
export const mockExtracurricularEvents: ExtracurricularEvent[] = [];
export const mockCBTTests: CBTTest[] = [];
export const mockComplaints: Complaint[] = [];
export const mockRolesAndPermissions: Role[] = [
    { id: 'Admin', name: 'Administrator', description: 'Full access', icon: UsersIcon, permissions: [{ id: 'manage-users', label: 'Manage Users', enabled: true }] },
    { id: 'Teacher', name: 'Teacher', description: 'Manage classes', icon: UsersIcon, permissions: [{ id: 'enter-results', label: 'Enter Results', enabled: true }] }
];
