import { Group } from "../types";
import { GroupItem } from "./GroupItem";

import FeatureItemsLayout from "../../../shared/components/FeatureItemsLayout";

interface Props {
  groups: Group[];
  onCopy: (id: number) => void;
  onLink: (id: number) => void;
  onParticipants: (id: number) => void;
  onDelete: (index: number) => void;
}

export function GroupsList({
  groups,
  onCopy,
  onLink,
  onParticipants,
  onDelete,
}: Props) {
  return (
    <div className="groups-list">
      <FeatureItemsLayout>
        {groups.map((group, index) => (
          <GroupItem
            key={group.id}
            group={group}
            onCopy={() => onCopy(group.id)}
            onLink={() => onLink(group.id)}
            onParticipants={() => onParticipants(group.id)}
            onDelete={() => onDelete(index)}
          />
        ))}
      </FeatureItemsLayout>
    </div>
  );
}