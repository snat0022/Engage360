<template>
    <div class="admin-view">
        <h1>Admin Dashboard</h1>
        <section>
            <h2>User Management</h2>
            <button @click="addUser">Add User</button>
            <ul>
                <li v-for="user in users" :key="user.id">
                    {{ user.name }} - {{ user.role }}
                    <button @click="editUser(user)">Edit</button>
                    <button @click="deleteUser(user.id)">Delete</button>
                </li>
            </ul>
        </section>
        <section>
            <h2>System Stats</h2>
            <p>Total Users: {{ users.length }}</p>
            <p>Active Sessions: {{ stats.activeSessions }}</p>
        </section>
    </div>
</template>

<script>
export default {
    name: 'AdminView',
    data() {
        return {
            users: [
                { id: 1, name: 'Alice', role: 'Admin' },
                { id: 2, name: 'Bob', role: 'Editor' },
                { id: 3, name: 'Charlie', role: 'Viewer' }
            ],
            stats: {
                activeSessions: 5
            }
        };
    },
    methods: {
        addUser() {
            // Sample logic for adding a user
            const newId = this.users.length + 1;
            this.users.push({ id: newId, name: `User${newId}`, role: 'Viewer' });
        },
        editUser(user) {
            // Sample logic for editing a user
            alert(`Edit user: ${user.name}`);
        },
        deleteUser(id) {
            this.users = this.users.filter(user => user.id !== id);
        }
    }
};
</script>

<style scoped>
.admin-view {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
}
h1, h2 {
    color: #333;
}
button {
    margin-left: 8px;
}
</style>
