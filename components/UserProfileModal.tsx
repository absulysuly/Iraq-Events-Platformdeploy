import React from 'react';
import type { User } from '../types';
import { LazyImage } from './LazyImage';

interface UserProfileModalProps {
  user: User | null;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="user-profile-modal-title">
      <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-sm p-8 text-center relative">
        <button onClick={onClose} className="absolute top-3 right-3 rtl:left-3 rtl:right-auto text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        <LazyImage src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full mx-auto border-4 border-teal-400 shadow-lg" />
        <h2 id="user-profile-modal-title" className="text-2xl font-bold text-gray-100 mt-4">{user.name}</h2>
        <p className="text-teal-400 mt-1">Event Organizer</p>
        
        <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-100">Contact Info</h3>
            <p className="text-gray-400 mt-2 text-sm">Contact information is available via the event page.</p>
        </div>
      </div>
    </div>
  );
};
