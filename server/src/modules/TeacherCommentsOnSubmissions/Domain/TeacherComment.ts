export interface TeacherComment {
    id: number;
    submission_id: number;
    teacher_id: number;
    content: string;
    created_at: Date;
}