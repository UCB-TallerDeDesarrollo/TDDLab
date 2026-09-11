import { FilterOperator } from "../../QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../QueryBuilder/IQueryOptions";
import { QueryOptions } from "../TableSchema";
import { TeacherCommentsFields } from "../TeacherComments";

export class TeacherCommentsOptions extends QueryOptions<TeacherCommentsFields> {
  byId(id: number): TeacherCommentsOptions {
    this.filters.push({ field: TeacherCommentsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  bySubmissionId(submissionId: number): TeacherCommentsOptions {
    this.filters.push({ field: TeacherCommentsFields.SubmissionId, operator: FilterOperator.Equals, value: submissionId });
    return this;
  }

  byTeacherId(teacherId: number): TeacherCommentsOptions {
    this.filters.push({ field: TeacherCommentsFields.TeacherId, operator: FilterOperator.Equals, value: teacherId });
    return this;
  }

  withContent(content: string): TeacherCommentsOptions {
    this.filters.push({ field: TeacherCommentsFields.Content, operator: FilterOperator.Like, value: `%${content}%` });
    return this;
  }

  orderByCreatedAt(descending: boolean = true): TeacherCommentsOptions {
    this.orderBy = TeacherCommentsFields.CreatedAt;
    this.orderDescending = descending;
    return this;
  }
}

export type TeacherCommentsQueryOptions = IQueryOptions<TeacherCommentsFields>;
