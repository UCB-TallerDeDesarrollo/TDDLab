import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { GroupItem } from "../../../src/features/groups/components/GroupItem";

describe("GroupItem", () => {
  const group = {
    id: 1,
    name: "whitebox",
    description: "Grupo principal",
    creationDate: new Date("2026-04-26"),
  };

  const onCopy = jest.fn();
  const onLink = jest.fn();
  const onParticipants = jest.fn();
  const onDelete = jest.fn();
  const onEdit = jest.fn();
  const onTasks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all visible actions with shared tooltips", async () => {
    const user = userEvent.setup();

    render(
      <GroupItem
        group={group}
        onCopy={onCopy}
        onLink={onLink}
        onParticipants={onParticipants}
        onDelete={onDelete}
        onEdit={onEdit}
        onTasks={onTasks}
      />,
    );

    expect(screen.getByText("whitebox")).toBeInTheDocument();

    await user.hover(screen.getByLabelText("copy-teacher-link"));
    expect(await screen.findByText("Copiar enlace docente")).toBeInTheDocument();
    await user.unhover(screen.getByLabelText("copy-teacher-link"));

    await user.hover(screen.getByLabelText("copy-student-link"));
    expect(
      await screen.findByText("Copiar enlace estudiante"),
    ).toBeInTheDocument();
    await user.unhover(screen.getByLabelText("copy-student-link"));

    await user.hover(screen.getByLabelText("view-participants"));
    expect(await screen.findByText("Ver participantes")).toBeInTheDocument();
    await user.unhover(screen.getByLabelText("view-participants"));

    await user.hover(screen.getByLabelText("view-tasks"));
    expect(await screen.findByText("Ver tareas")).toBeInTheDocument();
    await user.unhover(screen.getByLabelText("view-tasks"));

    await user.hover(screen.getByLabelText("delete-group"));
    expect(await screen.findByText("Eliminar grupo")).toBeInTheDocument();
    await user.unhover(screen.getByLabelText("delete-group"));

    await user.hover(screen.getByLabelText("edit-group"));
    expect(await screen.findByText("Editar grupo")).toBeInTheDocument();
  });

  it("triggers the expected callbacks for each action", async () => {
    const user = userEvent.setup();

    render(
      <GroupItem
        group={group}
        onCopy={onCopy}
        onLink={onLink}
        onParticipants={onParticipants}
        onDelete={onDelete}
        onEdit={onEdit}
        onTasks={onTasks}
      />,
    );

    await user.click(screen.getByLabelText("copy-teacher-link"));
    await user.click(screen.getByLabelText("copy-student-link"));
    await user.click(screen.getByLabelText("view-participants"));
    await user.click(screen.getByLabelText("view-tasks"));
    await user.click(screen.getByLabelText("delete-group"));
    await user.click(screen.getByLabelText("edit-group"));

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onLink).toHaveBeenCalledTimes(1);
    expect(onParticipants).toHaveBeenCalledTimes(1);
    expect(onTasks).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
