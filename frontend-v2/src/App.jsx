import { useEffect } from 'react';
import { useAuthStore, useUIStore, useCallStore } from './stores';
import { socketService } from './api/socket';
import { AuthPage } from './components/auth';
import { ChatInterface } from './components/chat/ChatInterface';
import { IncomingCallDialog, ActiveCallInterface } from './components/calls';
import toast from 'react-hot-toast';



function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { setIsMobile, theme } = useUIStore();
  const { hasActiveCall, hasIncomingCall, receiveIncomingCall } = useCallStore();



  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobile(isMobile);
    };


    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);


  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);



  // Listen for incoming call notifications via WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let subscription = null;
    let isMounted = true;

    const setupCallListener = async () => {
      try {
        await socketService.connect();
        if (!isMounted) return;

        // Subscribe to call notifications as per API documentation
        const topic = `/user/queue/video/call-notification`;
        subscription = socketService.subscribe(topic, (callData) => {
          if (!isMounted) return;

          console.log('Received call notification:', callData);

          // Show incoming call dialog when someone calls us
          if (callData.receiverId === user.id) {
            receiveIncomingCall({
              id: callData.callId,
              callerId: callData.callerId,
              receiverId: callData.receiverId,
              type: callData.type,
              callType: callData.type?.toLowerCase(),
              conversationId: callData.conversationId,
              status: 'RINGING',
              callerName: `User ${callData.callerId}`,
            });

            // Show toast notification as well
            toast(`Incoming ${callData.type?.toLowerCase() || 'call'} from User ${callData.callerId}`, {
              icon: '📞',
              duration: 5000,
            });
          }
        });

        console.log('Call notification listener setup complete');
      } catch (error) {
        console.error('Failed to setup call listener:', error);
      }
    };

    setupCallListener();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated, user?.id, receiveIncomingCall]);


  if (!isAuthenticated) {
    return <AuthPage />;
  }


  return (
    <>

      {hasActiveCall() && <ActiveCallInterface />}


      {!hasActiveCall() && <ChatInterface />}


      {hasIncomingCall() && <IncomingCallDialog />}
    </>
  );
}

export default App;
