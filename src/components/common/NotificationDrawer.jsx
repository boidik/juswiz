import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Calendar, FileText, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';

export const NotificationDrawer = () => {
  const { 
    isNotificationOpen, 
    setIsNotificationOpen, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications,
    setSelectedCaseId,
    switchRole
  } = useApp();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-m3-3 flex flex-col border-l border-neutral-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 text-blue-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Notifications & Alerts</h3>
              <p className="text-xs text-neutral-500">
                {notifications.filter(n => !n.read).length} unread hearing & order triggers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1.5 text-xs text-neutral-500 hover:text-rose-600 rounded-md hover:bg-neutral-100 transition-colors"
                title="Clear All Notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <Bell className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs">No pending hearing alerts or order updates.</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-m3-xl border transition-all text-left ${
                  item.read 
                    ? 'bg-neutral-50/60 border-neutral-200/60 opacity-80' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full shrink-0 ${
                    item.type === 'HEARING_ALERT' ? 'bg-amber-100 text-amber-700' :
                    item.type === 'ORDER_SYNC' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.type === 'HEARING_ALERT' && <Calendar className="w-4 h-4" />}
                    {item.type === 'ORDER_SYNC' && <FileText className="w-4 h-4" />}
                    {item.type === 'ADMIN_ALERT' && <UserPlus className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100">
                      {item.caseId && (
                        <button
                          onClick={() => {
                            setSelectedCaseId(item.caseId);
                            switchRole('STAFF');
                            setIsNotificationOpen(false);
                          }}
                          className="text-[11px] font-semibold text-material-primary hover:underline"
                        >
                          Open Case Workspace →
                        </button>
                      )}
                      {item.type === 'ADMIN_ALERT' && (
                        <button
                          onClick={() => {
                            switchRole('SOFTWARE_ADMIN');
                            setIsNotificationOpen(false);
                          }}
                          className="text-[11px] font-semibold text-purple-700 hover:underline"
                        >
                          Review in Software Admin →
                        </button>
                      )}

                      {!item.read && (
                        <button
                          onClick={() => markNotificationRead(item.id)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Mark Read
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
          <p className="text-xs text-neutral-500">
            Automated alerts powered by High Court & Supreme Court monitoring workers
          </p>
        </div>

      </div>
    </div>
  );
};
