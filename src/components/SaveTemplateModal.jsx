import { useState } from 'react';
import { Folder, Plus, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function SaveTemplateModal({ isOpen, onClose, onSave }) {
    const { folders, createFolder } = useWorkout();
    const [name, setName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState('uncategorized');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a template name');
            return;
        }

        let finalFolderId = selectedFolderId === 'uncategorized' ? null : selectedFolderId;

        if (isCreatingFolder) {
            if (!newFolderName.trim()) {
                alert('Please enter a folder name');
                return;
            }
            finalFolderId = createFolder(newFolderName);
        }

        onSave(name, finalFolderId);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'hsl(var(--color-surface))',
                width: '100%', maxWidth: '400px',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Save Workout</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Template Name */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Workout Name</label>
                    <input
                        autoFocus
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Chest & Back"
                        style={{
                            width: '100%', padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'hsl(var(--color-bg))',
                            color: 'inherit',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {/* Folder Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Template</label>

                    {!isCreatingFolder ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <select
                                value={selectedFolderId}
                                onChange={e => {
                                    if (e.target.value === 'new') {
                                        setIsCreatingFolder(true);
                                    } else {
                                        setSelectedFolderId(e.target.value);
                                    }
                                }}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    color: 'inherit',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="uncategorized">No Template</option>
                                {folders.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                                <option value="new" style={{ fontWeight: 'bold' }}>+ Create New Template...</option>
                            </select>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="New template name..."
                                style={{
                                    flex: 1, padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    color: 'inherit'
                                }}
                            />
                            <button
                                onClick={() => setIsCreatingFolder(false)}
                                style={{
                                    padding: '0.5rem',
                                    color: 'hsl(var(--color-text-muted))'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'transparent',
                            color: 'hsl(var(--color-text-muted))',
                            fontWeight: 'bold'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1, padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'hsl(var(--color-primary))',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
