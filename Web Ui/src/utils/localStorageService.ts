

export function saveSelectedGroup(selectedGroup: number | null) {
    localStorage.setItem("selectedGroup", JSON.stringify(selectedGroup));
  }
  
  export function loadSelectedGroup(): number | null {
    const storedValue = localStorage.getItem("selectedGroup");
    return storedValue !== null ? JSON.parse(storedValue) : null;
  }
  