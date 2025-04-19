import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlineClock } from 'react-icons/hi';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        }
      } catch (error) {
        toast.error('Error fetching user details');
      }
    };

    fetchOtherUser();
  }, [userId]);

  useEffect(() => {
    if (!user || !userId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(message => 
          message.participants.includes(userId) && 
          message.participants.includes(user.uid)
        );
      
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        senderId: user.uid,
        participants: [user.uid, userId],
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={otherUser?.photoURL || 'https://via.placeholder.com/40'}
              alt=""
            />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">
              {otherUser?.fullName || 'User'}
            </h2>
            <p className="text-sm text-gray-500">
              {otherUser?.role === 'developer' ? 'Developer' : 'Client'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === user.uid
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="mt-1 flex items-center justify-end">
                <HiOutlineClock className="h-3 w-3 mr-1" />
                <span className="text-xs opacity-75">
                  {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlinePaperAirplane className="h-5 w-5 mr-2" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 