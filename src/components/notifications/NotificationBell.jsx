import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { HiBell } from 'react-icons/hi';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <HiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {showNotifications && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-2 text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <a
                    key={notification.id}
                    href={notification.link}
                    className={`block px-4 py-2 text-sm ${notification.read ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp?.toDate()).toLocaleString()}
                    </p>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 