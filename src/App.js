import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// PASTE YOUR RENDER BACKEND URL HERE INSIDE THE QUOTES
const socket = io('https://study-room-backend-syn8.onrender.com'); 

function App() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChatList((list) => [...list, data]);
    });

    socket.on('receive_note', (data) => {
      setNoteText(data);
    });
  }, []);

  const joinRoom = () => {
    if (username !== '' && roomCode !== '') {
      socket.emit('join_room', { username, roomCode });
      setIsInRoom(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== '') {
      const messageData = {
        roomCode,
        username,
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit('send_message', messageData);
      setChatList((list) => [...list, messageData]);
      setMessage('');
    }
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNoteText(text);
    socket.emit('update_note', { roomCode, text });
  };

  if (!isInRoom) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
        <h2>Join a Study Room</h2>
        <input
          type="text"
          placeholder="Your Name..."
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', margin: '10px', width: '200px' }}
        /><br />
        <input
          type="text"
          placeholder="Room Code (e.g. 123)..."
          onChange={(e) => setRoomCode(e.target.value)}
          style={{ padding: '10px', margin: '10px', width: '200px' }}
        /><br />
        <button onClick={joinRoom} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h3>Study Room: {roomCode} (User: {username})</h3>
        <div style={{ flex: 1, border: '1px solid #ddd', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
          {chatList.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{item.username}</strong> <span style={{ fontSize: '10px', color: '#888' }}>{item.time}</span>
              <p style={{ margin: '2px 0' }}>{item.message}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex' }}>
          <input
            type="text"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: '1', padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>Send</button>
        </form>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', background: '#f9f9f9' }}>
        <h3>Shared Workspace / Notes</h3>
        <textarea
          value={noteText}
          onChange={handleNoteChange}
          placeholder="Type notes here. Anyone in the room will see this update live!"
          style={{ flex: 1, padding: '15px', resize: 'none', fontSize: '16px' }}
        />
      </div>
    </div>
  );
}

export default App;
