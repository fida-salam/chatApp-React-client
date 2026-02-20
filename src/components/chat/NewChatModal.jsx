

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../../services/roomService.js';
import { userService } from '../../services/userService';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, X, Users } from 'lucide-react';

export default function NewChatModal({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatType, setChatType] = useState('dm');
  const [groupName, setGroupName] = useState('');
  const queryClient = useQueryClient();
  const { addRoom, setCurrentRoom } = useChatStore();


  const { data: allUsersData, isLoading: loadingAll } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => userService.searchUsers(''),  // empty = all users
    // ✅ runs immediately on mount
  });

  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });
  

  const isLoading = searchQuery.length >= 2 ? loadingSearch : loadingAll;
  const displayUsers = searchQuery.length >= 2
    ? searchResults?.users
    : allUsersData?.users;

  const createRoomMutation = useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: (data) => {
      addRoom(data.room || data);
      setCurrentRoom(data.room || data);
      queryClient.invalidateQueries(['rooms']);
      onClose();
    },
  });

  const handleUserSelect = (user) => {
    if (chatType === 'dm') {
      setSelectedUsers([user]);
    } else {
      if (selectedUsers.find(u => u._id === user._id)) {
        setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;

    if (chatType === 'dm') {

      createRoomMutation.mutate({
        type: 'dm',
        targetUserId: selectedUsers[0]._id
      });
    } else {
      createRoomMutation.mutate({
        type: 'group',
        name: groupName || `Group with ${selectedUsers.map(u => u.username).join(', ')}`,
        members: selectedUsers.map(u => u._id)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New Chat</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chat Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={chatType === 'dm' ? 'default' : 'outline'}
              onClick={() => {
                setChatType('dm');
                setSelectedUsers([]);
              }}
              className="flex-1"
            >
              Direct Message
            </Button>
            <Button
              variant={chatType === 'group' ? 'default' : 'outline'}
              onClick={() => {
                setChatType('group');
                setSelectedUsers([]);
              }}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Group Chat
            </Button>
          </div>

          {/* Group Name Input */}
          {chatType === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name (optional)"
              />
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div key={user._id} className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                    alt={user.username}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm">{user.username}</span>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {/* <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
            ) : searchResults?.users?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
            ) : (
              searchResults?.users?.map(user => {
                const isSelected = selectedUsers.find(u => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                      }`}
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div> */}
          {/* Search Results */}
<div className="max-h-64 overflow-y-auto space-y-2">
  {isLoading ? (
    <p className="text-sm text-muted-foreground text-center py-4">Loading users...</p>
  ) : displayUsers?.length === 0 ? (
    <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
  ) : (
    displayUsers?.map(user => {
      const isSelected = selectedUsers.find(u => u._id === user._id);
      return (
        <div
          key={user._id}
          onClick={() => handleUserSelect(user)}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10' : 'hover:bg-accent'
          }`}
        >
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {isSelected && (
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );
    })
  )}
</div>

          {/* Create Button */}
          <Button
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0 || createRoomMutation.isPending}
            className="w-full"
          >
            {createRoomMutation.isPending ? 'Creating...' : 'Create Chat'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
