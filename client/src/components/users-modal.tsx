import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Users, Edit, Trash2, Plus } from "lucide-react";
import type { Child } from "@shared/schema";
import { colorOptions, avatarOptions } from "@/lib/profile-options";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  onEdit: (user: Child) => void;
  onDelete: (userId: number) => void;
  onAdd: () => void;
  deleteIsPending: boolean;
}

export function UsersModal({
  isOpen,
  onClose,
  children,
  onEdit,
  onDelete,
  onAdd,
  deleteIsPending
}: UsersModalProps) {
  const handleAdd = () => {
    onAdd();
    onClose();
  };

  const handleEdit = (user: Child) => {
    onEdit(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Manage Users
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove user profiles. Each user has their own tasks and point tracking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Current Users ({children.length})</h3>
            <Button 
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus size={16} className="mr-2" />
              Add New User
            </Button>
          </div>
          
          {children.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600 mb-2">No users yet</p>
              <p className="text-sm text-gray-400 mb-4">Add your first user to get started with the morning routine app</p>
              <Button 
                onClick={handleAdd}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((user) => {
                const selectedColor = colorOptions.find(c => c.id === user.colour);
                const selectedAvatar = avatarOptions.find(a => a.id === user.avatarUrl);
                
                return (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: selectedColor?.light }}
                      >
                        {selectedAvatar ? (
                          <selectedAvatar.icon size={24} style={{ color: selectedColor?.hex }} />
                        ) : (
                          <Users size={24} style={{ color: selectedColor?.hex }} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-lg">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          Age {user.age || "Not set"} • {user.points} points earned
                        </div>
                        <div className="text-xs text-gray-400">
                          Color: {selectedColor?.name} • Avatar: {selectedAvatar?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="h-10 px-3 border-green-200 hover:bg-green-50"
                      >
                        <Edit size={16} className="text-green-600 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deleteIsPending}
                            className="h-10 px-3 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="text-red-600 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{user.name}</strong>? This will permanently remove their profile, all their tasks, and point history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                onDelete(user.id);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteIsPending}
                            >
                              {deleteIsPending ? "Deleting..." : "Delete User"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}