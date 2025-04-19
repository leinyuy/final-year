import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const conversationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(conversationsData);
      } catch (error) {
        toast.error('Error fetching messages');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {conversations.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No messages yet. Start a conversation!
            </li>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/dashboard/messages/${conversation.participants.find(id => id !== user.uid)}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.participants
                        .filter((id) => id !== user.uid)
                        .join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {new Date(conversation.timestamp?.toDate()).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Messages; 