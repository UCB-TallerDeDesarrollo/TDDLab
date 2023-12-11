import React, { useState, useEffect } from "react";
import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";

const mockUserData = [
  {
    id: 1,
    email: "aanesita@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 2,
    email: "christianriveroarnez@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 3,
    email: "ddcrene@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 4,
    email: "iantezana@ucb.edu.bo",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 5,
    email: "ichiro6864@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 6,
    email: "nicolascari.rz@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 7,
    email: "test@gmail.com",
    course: "testCourse",
    role: "admin",
  },
  {
    id: 8,
    email: "israelantezana@gmail.com",
    course: "mainCourse",
    role: "student",
  },
  {
    id: 9,
    email: "test44444@gmail.com",
    course: "5",
    role: "student",
  },
  {
    id: 10,
    email: "bruno.marquez@ucb.edu.bo",
    course: "mainCourse",
    role: "student",
  },
  {
    id: 11,
    email: "piopiotrio@gmail.com",
    course: "mainCourse",
    role: "admin",
  },
  {
    id: 12,
    email: "rodrigo.guardia316@gmail.com",
    course: "1",
    role: "student",
  },
];

export default function User() {
  const users = mockUserData;
  
  /*const [users, setUsers] = useState<UserDataObject[]>([]);
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
  }, [getUsers]);*/

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