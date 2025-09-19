import React, { useState, useEffect } from 'react';
// Import Firebase Auth, config e GoogleProvider solo se usi Firebase
// In alternativa, usa la tua soluzione custom per il login Google!
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import UserManagement from './UserManagement';

// Whitelist admin
const ADMIN_EMAILS = [
    "giuseppe.defranceschi@gmail.com",
    "giuseppe@defranceschi.pro",
    "admin@ai-assistant.local"
];

// Callback per comunicare il ruolo all'app
interface LoginWithGoogleProps {
    onRoleChange: (role: 'admin' | 'user' | 'unauthorized') => void;
}

const LoginWithGoogle: React.FC<LoginWithGoogleProps> = ({ onRoleChange }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'user' | 'unauthorized'>('unauthorized');
    const [userWhitelist, setUserWhitelist] = useState<string[]>([]);

    // Carica whitelist utenti standard da localStorage
    useEffect(() => {
        const stored = localStorage.getItem('ai_assistant_user_whitelist');
        if (stored) {
            try {
                const whitelistArr = JSON.parse(stored) as { email: string }[];
                setUserWhitelist(whitelistArr.map(u => u.email));
            } catch {
                setUserWhitelist([]);
            }
        } else {
            setUserWhitelist([]);
        }
    }, []);

    // Aggiorna ruolo quando cambia user o whitelist
    useEffect(() => {
        if (!user?.email) {
            setRole('unauthorized');
            onRoleChange('unauthorized');
            return;
        }
        if (ADMIN_EMAILS.includes(user.email)) {
            setRole('admin');
            onRoleChange('admin');
        } else if (userWhitelist.includes(user.email)) {
            setRole('user');
            onRoleChange('user');
        } else {
            setRole('unauthorized');
            onRoleChange('unauthorized');
        }
    }, [user, userWhitelist, onRoleChange]);

    // Aggiorna whitelist da UserManagement
    const handleWhitelistChange = (newList: string[]) => {
        setUserWhitelist(newList);
        localStorage.setItem(
            'ai_assistant_user_whitelist',
            JSON.stringify(newList.map(email => ({ email })))
        );
    };

    // Login Google
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
        } catch (err) {
            alert("Errore login Google!");
        }
    };

    // Logout
    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <div className="login-with-google" style={{ marginBottom: 24 }}>
            {!user ? (
                <button onClick={handleLogin}>Login con Google</button>
            ) : (
                <div>
                    <div>
                        <strong>{user.displayName || user.email}</strong> ({user.email})
                    </div>
                    <div>
                        Ruolo: <span style={{ color: role === 'admin' ? 'green' : role === 'user' ? 'blue' : 'red' }}>
                            {role}
                        </span>
                    </div>
                    <button onClick={handleLogout} style={{ marginTop: 8 }}>Logout</button>
                </div>
            )}

            {role === 'unauthorized' && user && (
                <div style={{ color: "red", marginTop: 12 }}>
                    La tua email non è autorizzata.<br />Contatta un amministratore.
                </div>
            )}

            {role === 'admin' && (
                <UserManagement
                    // Puoi passare props alla tua UserManagement!
                    className="admin-panel"
                />
            )}
        </div>
    );
};

export default LoginWithGoogle;