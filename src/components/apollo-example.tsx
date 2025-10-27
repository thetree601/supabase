'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
}

interface GetUsersData {
  users: User[];
}

interface CreateUserData {
  createUser: User;
}

interface CreateUserVariables {
  name: string;
  email: string;
}

// GraphQL 쿼리 예시
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

// GraphQL 뮤테이션 예시
const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

export function UserList() {
  const { loading, error, data } = useQuery<GetUsersData>(GET_USERS);
  const [createUser] = useMutation<CreateUserData, CreateUserVariables>(CREATE_USER);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          name: 'New User',
          email: 'newuser@example.com'
        },
        // 캐시 업데이트
        refetchQueries: [GET_USERS]
      });
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <button onClick={handleCreateUser}>Create User</button>
      <ul>
        {data?.users?.map((user: User) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
