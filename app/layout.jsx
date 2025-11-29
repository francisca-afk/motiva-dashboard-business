"use client";
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import MessageNotificationToast from '@/components/notifications/MessageNotificationToast'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const router = useRouter()
  

  useEffect(() => {
    const handleMessageNotification = (e) => {
      const { sessionId, message, sessionData } = e.detail;
      
      toast.custom((t) => (
        <MessageNotificationToast
          t={t}
          conversationId={sessionId}
          userName={sessionData?.userId?.name}
          messageContent={message.content}
          onNavigate={(id) => router.push(`/support/chat/${id}`)}
        />
      ), {
        duration: 8000,
        position: 'top-right',
      });
    };
    
    window.addEventListener('show_message_notification', handleMessageNotification);
    return () => window.removeEventListener('show_message_notification', handleMessageNotification);
  }, [router]);

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AppProvider>
            <SidebarProvider>
              {children}
              <Toaster containerStyle={{ top: 80 }}
                position="top-right"
              />
            </SidebarProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
