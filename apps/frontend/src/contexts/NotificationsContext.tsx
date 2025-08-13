import React, { createContext, useContext, useMemo, useState } from 'react';

export type Notification = { id: string; message: string; createdAt: number };

type Ctx = {
  notifications: Notification[];
  add: (message: string) => void;
  clear: () => void;
  remove: (id: string) => void;
};

const NotificationsContext = createContext<Ctx | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = (message: string) => setNotifications((prev) => [{ id: crypto.randomUUID(), message, createdAt: Date.now() }, ...prev].slice(0, 50));
  const clear = () => setNotifications([]);
  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const value = useMemo(() => ({ notifications, add, clear, remove }), [notifications]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};