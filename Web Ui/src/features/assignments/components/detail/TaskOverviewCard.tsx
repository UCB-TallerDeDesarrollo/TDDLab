import GroupsIcon from "@mui/icons-material/Groups";
import { SvgIcon, SvgIconProps } from "@mui/material";

interface TaskOverviewCardProps {
  title: string;
  groupName: string;
  startDate: string;
  endDate: string;
}

function CalendarFilledIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 5120 5120">
      <g transform="translate(0,5120) scale(1,-1)" fill="currentColor" stroke="none">
        <path d="M1695 4786 c-72 -33 -95 -83 -95 -210 l0 -93 -172 -6 c-136 -4 -189 -9 -248 -27 -329 -95 -556 -375 -585 -720 -5 -66 -3 -80 17 -120 15 -29 37 -53 63 -67 l40 -23 1845 0 1845 0 40 23 c26 14 48 38 63 67 20 40 22 54 17 120 -29 345 -256 625 -585 720 -59 18 -112 23 -247 27 l-171 5 -4 109 c-3 116 -12 139 -72 183 -39 29 -133 29 -172 0 -60 -44 -69 -67 -72 -185 l-4 -109 -638 0 -638 0 -4 109 c-3 118 -12 141 -70 184 -34 25 -113 32 -153 13z" />
        <path d="M670 3189 c-33 -13 -68 -47 -87 -83 -41 -78 -18 -1599 28 -1861 54 -305 328 -580 634 -634 134 -23 845 -51 1310 -51 529 0 1207 29 1338 56 306 64 562 327 616 634 46 264 69 1778 28 1856 -19 37 -55 70 -90 83 -38 15 -3741 14 -3777 0z m1164 -481 c86 -26 166 -136 166 -228 0 -124 -116 -240 -240 -240 -124 0 -240 116 -240 240 0 63 23 114 75 165 70 71 145 90 239 63z m800 0 c55 -16 138 -99 154 -154 28 -94 8 -169 -63 -239 -101 -102 -229 -102 -330 0 -102 101 -102 229 0 330 70 71 145 90 239 63z m800 0 c86 -26 166 -136 166 -228 0 -124 -116 -240 -240 -240 -124 0 -240 116 -240 240 0 63 23 114 75 165 70 71 145 90 239 63z m-1600 -800 c86 -26 166 -136 166 -228 0 -124 -116 -240 -240 -240 -124 0 -240 116 -240 240 0 63 23 114 75 165 70 71 145 90 239 63z m800 0 c55 -16 138 -99 154 -154 28 -94 8 -169 -63 -239 -101 -102 -229 -102 -330 0 -102 101 -102 229 0 330 70 71 145 90 239 63z m800 0 c86 -26 166 -136 166 -228 0 -124 -116 -240 -240 -240 -124 0 -240 116 -240 240 0 63 23 114 75 165 70 71 145 90 239 63z" />
      </g>
    </SvgIcon>
  );
}

export function TaskOverviewCard({
  title,
  groupName,
  startDate,
  endDate,
}: Readonly<TaskOverviewCardProps>) {
  return (
    <section className="assignment-task-card" aria-label="Resumen de tarea">
      <div className="assignment-task-title-block">
        <h1 className="assignment-task-title">{title}</h1>
      </div>

      <div className="assignment-task-meta-block">
        <div className="assignment-task-meta-row">
          <GroupsIcon />
          <span className="assignment-task-meta-label">Grupo:</span>
          <span>{groupName}</span>
        </div>

        <div className="assignment-task-meta-row">
          <CalendarFilledIcon />
          <span className="assignment-task-meta-label">Inicio:</span>
          <span>{startDate}</span>
        </div>

        <div className="assignment-task-meta-row">
          <CalendarFilledIcon />
          <span className="assignment-task-meta-label">Finalización:</span>
          <span>{endDate}</span>
        </div>
      </div>
    </section>
  );
}
