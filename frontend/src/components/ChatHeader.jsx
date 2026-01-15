import { XIcon, TrashIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, deleteChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          setSelectedUser(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, showDeleteConfirm]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeletingChat(true);
    try {
      await deleteChat(selectedUser._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeletingChat(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
      >
        <div className="flex items-center space-x-3">
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="w-12 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div>
            <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
            <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteClick}
            title="Delete chat"
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300 transition-colors cursor-pointer" />
          </button>
          <button onClick={() => setSelectedUser(null)}>
            <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Delete Chat</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete this chat with <span className="font-medium text-slate-300">{selectedUser.fullName}</span>? This action cannot be undone and all messages will be permanently deleted.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeletingChat}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeletingChat}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isDeletingChat ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default ChatHeader;
