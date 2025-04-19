import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  doc, 
  getDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { HiPaperAirplane } from 'react-icons/hi';

const ChatInterface = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or create conversation
  useEffect(() => {
    const fetchOrCreateConversation = async () => {
      try {
        // Check if conversation exists
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid)
        );
        const querySnapshot = await getDocs(conversationsQuery);
        
        let existingConversation = null;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.participants.includes(userId)) {
            existingConversation = { id: doc.id, ...data };
          }
        });

        if (existingConversation) {
          setConversationId(existingConversation.id);
        } else {
          // Create new conversation
          const newConversationRef = await addDoc(collection(db, 'conversations'), {
            participants: [user.uid, userId],
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
          });
          setConversationId(newConversationRef.id);
        }

        // Fetch chat partner details
        const partnerDoc = await getDoc(doc(db, 'users', userId));
        if (partnerDoc.exists()) {
          setChatPartner(partnerDoc.data());
        }
      } catch (error) {
        toast.error('Error setting up conversation');
        console.error(error);
      }
    };

    if (user && userId) {
      fetchOrCreateConversation();
    }
  }, [user, userId]);

  // Listen for messages
  useEffect(() => {
    if (!conversationId) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update conversation with last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-300 flex-shrink-0"></div>
        <div className="ml-3">
          <p className="font-medium">{chatPartner?.fullName || 'Chat Partner'}</p>
          <p className="text-xs opacity-75">{chatPartner?.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.senderId === user.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user.uid
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp?.toDate().toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 