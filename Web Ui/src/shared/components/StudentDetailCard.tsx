import { ReactNode } from "react";

interface StudentDetailCardProps {
  title: string;
  titleClassName: string;
  sectionClassName: string;
  contentClassName: string;
  detailsClassName: string;
  actionsClassName: string;
  details: ReactNode;
  actions: ReactNode;
}

function StudentDetailCard({
  title,
  titleClassName,
  sectionClassName,
  contentClassName,
  detailsClassName,
  actionsClassName,
  details,
  actions,
}: Readonly<StudentDetailCardProps>) {
  return (
    <section className={sectionClassName}>
      <h2 className={titleClassName}>{title}</h2>
      <div className={contentClassName}>
        <div className={detailsClassName}>{details}</div>
        <div className={actionsClassName}>{actions}</div>
      </div>
    </section>
  );
}

export default StudentDetailCard;
