import React from 'react';
import UserItem from './UserItem';

const UserList = ({ users, selectedUser, onSelectUser }) => {
    return (
        <ul className="user-list">
            {users.map(user => (
                <UserItem
                    key={user.id}
                    user={user}
                    onSelectUser={onSelectUser}
                    isSelected={user === selectedUser} // Aquí verificas si el usuario está seleccionado
                />
            ))}
        </ul>
    );
};

export default UserList;
