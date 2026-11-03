import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { MessageSquare, Heart, Eye, Plus, Filter, Pin, AlertTriangle, Calendar, FileImage, Upload } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  role: string;
  timestamp: string;
  type: 'announcement' | 'alert' | 'campaign' | 'update';
  priority: 'high' | 'medium' | 'low';
  visibility: 'district' | 'block' | 'facility';
  isPinned: boolean;
  likes: number;
  comments: number;
  views: number;
  attachments?: { name: string; type: string }[];
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Mission Indradhanush Drive - Week 3 Update',
    content: 'Great progress in our immunization campaign! We have achieved 87% coverage in the district. Special thanks to all field workers for their dedication.',
    author: 'Dr. Rajesh Kumar',
    role: 'District Health Officer',
    timestamp: '2024-01-15 14:30',
    type: 'campaign',
    priority: 'high',
    visibility: 'district',
    isPinned: true,
    likes: 24,
    comments: 8,
    views: 156,
    attachments: [{ name: 'coverage_report.pdf', type: 'pdf' }]
  },
  {
    id: '2',
    title: 'Alert: Measles Outbreak in Block B',
    content: 'Immediate action required. Measles cases reported in villages of Block B. All ANMs to prioritize vaccination drives and report any suspicious cases immediately.',
    author: 'Dr. Priya Sharma',
    role: 'Block Medical Officer',
    timestamp: '2024-01-15 09:45',
    type: 'alert',
    priority: 'high',
    visibility: 'block',
    isPinned: true,
    likes: 12,
    comments: 15,
    views: 98
  },
  {
    id: '3',
    title: 'New Guidelines for Antenatal Care',
    content: 'Updated protocols for ANC visits have been released. Please review the attached document and implement from next week.',
    author: 'Nurse Sunita Devi',
    role: 'ANM Supervisor',
    timestamp: '2024-01-14 16:20',
    type: 'update',
    priority: 'medium',
    visibility: 'facility',
    isPinned: false,
    likes: 7,
    comments: 3,
    views: 67,
    attachments: [{ name: 'anc_guidelines.pdf', type: 'pdf' }]
  }
];

export function CommunityWall() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'update' as Post['type'],
    priority: 'medium' as Post['priority'],
    visibility: 'facility' as Post['visibility']
  });

  const filteredPosts = posts.filter(post => {
    const typeMatch = filterType === 'all' || post.type === filterType;
    const visibilityMatch = filterVisibility === 'all' || post.visibility === filterVisibility;
    return typeMatch && visibilityMatch;
  }).sort((a, b) => {
    // Sort by pinned first, then by timestamp
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const post: Post = {
      id: (posts.length + 1).toString(),
      ...newPost,
      author: 'Current User',
      role: 'Field Worker',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isPinned: false,
      likes: 0,
      comments: 0,
      views: 1
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({
      title: '',
      content: '',
      type: 'update',
      priority: 'medium',
      visibility: 'facility'
    });
    setIsCreateDialogOpen(false);
    toast.success("Post created successfully!");
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const getTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-700';
      case 'campaign': return 'bg-blue-100 text-blue-700';
      case 'announcement': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: Post['priority']) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary mb-2">Community Wall</h1>
          <p className="text-foreground/70">
            Stay updated with announcements, alerts, and campaign news from your healthcare network
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your message..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newPost.type} onValueChange={(value: Post['type']) => 
                    setNewPost(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newPost.priority} onValueChange={(value: Post['priority']) => 
                    setNewPost(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={newPost.visibility} onValueChange={(value: Post['visibility']) => 
                  setNewPost(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-foreground/60" />
              <span className="text-sm text-foreground/70">Filters:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="campaign">Campaigns</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterVisibility} onValueChange={setFilterVisibility}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className={`${post.isPinned ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{post.title}</h3>
                      {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                      {getPriorityIcon(post.priority)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.role}</span>
                      <span>•</span>
                      <span>{new Date(post.timestamp).toLocaleDateString()} {new Date(post.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${getTypeColor(post.type)} capitalize`}>
                    {post.type}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {post.visibility}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-foreground/80 mb-4">{post.content}</p>
              
              {post.attachments && post.attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                  <FileImage className="h-4 w-4 text-foreground/60" />
                  <span className="text-sm text-foreground/70">
                    {post.attachments.length} attachment{post.attachments.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="h-8 text-foreground/60 hover:text-primary"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-foreground/60 hover:text-primary"
                    onClick={() => toast.info(`Comments thread for "${post.title}" (${post.comments} comments)`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  
                  <div className="flex items-center gap-1 text-sm text-foreground/60">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info(`Viewing post: "${post.title}" - ${post.author.name} (${post.author.facility})`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg mb-2">No Posts Found</h3>
          <p className="text-foreground/60">No posts match your current filters. Try adjusting the filters or create a new post.</p>
        </Card>
      )}
    </div>
  );
}

export default CommunityWall;