import { useState, useRef, useEffect } from 'react';
import './SantaCall.css';

function SantaCall() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSantaSpeaking, setIsSantaSpeaking] = useState(false);
  const [status, setStatus] = useState('Hold to Talk');
  const [subStatus, setSubStatus] = useState('Press and hold the microphone button');
  const [callTimer, setCallTimer] = useState('00:00');
  const [conversationHistory, setConversationHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const santaVoiceRef = useRef(new Audio());
  const callStartTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    return () => {
      stopEverything();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const updateCallTimer = () => {
    if (callStartTimeRef.current) {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallTimer(
        `${Math.floor(elapsed / 60)
          .toString()
          .padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`
      );
    }
  };

  const initMicrophone = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      setStatus('Hold to Talk');
      setSubStatus('Microphone ready!');
      return true;
    } catch (error) {
      console.error('Microphone init error:', error);
      setStatus('Mic Access Needed');
      setSubStatus('Please allow microphone access');
      return false;
    }
  };

  const startRecording = async () => {
    if (!callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(updateCallTimer, 1000);
    }

    if (isSantaSpeaking || isRecording) return;

    const success = await initMicrophone();
    if (!success) return;

    audioChunksRef.current = [];

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping old recorder:', e);
      }
      mediaRecorderRef.current = null;
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : MediaRecorder.isTypeSupported('audio/ogg')
      ? 'audio/ogg'
      : '';

    try {
      mediaRecorderRef.current = new MediaRecorder(
        mediaStreamRef.current,
        mimeType ? { mimeType } : {}
      );

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processRecordedAudio();
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setStatus('Listening...');
      setSubStatus('Recording...');
    } catch (error) {
      console.error('Error starting recorder:', error);
      setStatus('Hold to Talk');
      setSubStatus('Error starting recorder');
      cleanupMediaRecorder();
    }
  };

  const cleanupMediaRecorder = () => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setStatus('Hold to Talk');
        setSubStatus('Error stopping recording');
      }
    }
  };

  const processRecordedAudio = async () => {
    setIsRecording(false);

    cleanupMediaRecorder();

    if (audioChunksRef.current.length === 0) {
      setStatus('Hold to Talk');
      setSubStatus('No audio recorded');
      return;
    }

    setStatus('Processing...');
    setSubStatus('Transcribing audio...');

    try {
      const mimeType = audioChunksRef.current[0].type || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const blobSize = audioBlob.size;
      audioChunksRef.current = [];

      if (blobSize < 1000) {
        setStatus('Hold to Talk');
        setSubStatus('Audio too short, try again!');
        return;
      }

      const formData = new FormData();
      formData.append(
        'file',
        audioBlob,
        'audio.' +
          (mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm')
      );

      const transcriptionResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.status}`);
      }

      const transcription = await transcriptionResponse.json();
      const textToSend = transcription.text?.trim() || '';

      if (textToSend.length > 1) {
        const newHistory = [...conversationHistory, { role: 'user', content: textToSend }];
        setConversationHistory(newHistory);
        getSantaResponse(newHistory);
      } else {
        setStatus('Hold to Talk');
        setSubStatus('Nothing heard, try again!');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setStatus('Hold to Talk');
      setSubStatus('Error - please try again');
    }
  };

  const getSantaResponse = async (history) => {
    setIsSantaSpeaking(true);
    setStatus('Santa thinking...');
    setSubStatus('Checking list...');

    try {
      const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/santa-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: history,
        }),
      });

      const aiData = await aiResponse.json();
      const santaText = aiData.text;
      setConversationHistory([...history, { role: 'assistant', content: santaText }]);

      const voiceResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/santa-voice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: santaText }),
        }
      );

      const audioBlob = await voiceResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      santaVoiceRef.current.src = audioUrl;

      santaVoiceRef.current.onended = () => {
        setIsSantaSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setStatus('Hold to Talk');
        setSubStatus('Ready for your reply');
      };

      santaVoiceRef.current.play().then(() => {
        setStatus('Santa speaking');
        setSubStatus('🎅');
      });
    } catch (error) {
      console.error('Error getting Santa response:', error);
      setIsSantaSpeaking(false);
      setStatus('Hold to Talk');
      setSubStatus('Error - please try again');
    }
  };

  const stopEverything = () => {
    cleanupMediaRecorder();
    setIsRecording(false);
    setIsSantaSpeaking(false);
    santaVoiceRef.current.pause();
    santaVoiceRef.current.currentTime = 0;
    audioChunksRef.current = [];
  };

  const endCall = () => {
    stopEverything();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setStatus('Call Ended');
    setSubStatus('Goodbye!');
    setTimeout(() => {
      setConversationHistory([]);
      callStartTimeRef.current = null;
      setCallTimer('00:00');
      setStatus('Hold to Talk');
      setSubStatus('Press and hold the microphone button');
    }, 3000);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    stopRecording();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopRecording();
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    stopRecording();
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="call-container">
        <div className="error-box">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Configuration Error</h2>
          <p className="error-message">
            Supabase configuration is missing. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="call-container">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="call-header">
            <h2 className="caller-name">🎅 Santa Claus</h2>
            <div className="call-time">{callTimer}</div>
          </div>

          <div className="santa-avatar">
            <div className={`avatar-circle ${isRecording ? 'listening' : ''} ${isSantaSpeaking ? 'speaking' : ''}`}>
              🎅
            </div>
          </div>

          <div className="status-display">
            <div className="status-text">{status}</div>
            <div className="sub-status">{subStatus}</div>
          </div>

          <div className="call-controls">
            <button
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              disabled={isSantaSpeaking}
            >
              <span className="mic-icon">🎤</span>
              <span className="mic-label">{isRecording ? 'RELEASE' : 'HOLD'}</span>
            </button>

            <button className="end-button" onClick={endCall}>
              <span className="end-icon">📞</span>
              <span className="end-label">END CALL</span>
            </button>
          </div>

          {conversationHistory.length > 0 && (
            <div className="conversation-log">
              <h3 className="log-title">Conversation:</h3>
              <div className="log-messages">
                {conversationHistory.slice(-4).map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <span className="message-label">
                      {msg.role === 'user' ? 'You' : 'Santa'}:
                    </span>
                    <span className="message-text">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="instructions-box">
        <h3 className="instructions-title">📱 HOW TO CALL SANTA</h3>
        <ol className="instructions-list">
          <li>Press and HOLD the microphone button</li>
          <li>Speak your message to Santa</li>
          <li>Release the button when done</li>
          <li>Wait for Santa to respond!</li>
        </ol>
      </div>
    </div>
  );
}

export default SantaCall;
