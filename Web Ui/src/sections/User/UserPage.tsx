import { useState, useEffect } from "react";
import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";

export default function User() {
  
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const getUsers = new GetUsers(new UsersRepository());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [getUsers]);

  return (
    <div>
      <h1>Página de los usuarios</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} - {user.course}
          </li>
        ))}
      </ul>
    </div>
  );
}