import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/middleware';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Create storage bucket on startup
const initializeStorage = async () => {
  const bucketName = 'make-b5bcac8d-citypulse';
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/*', 'video/*', 'audio/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });
      
      if (error) {
        console.log('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
  }
};

// Initialize storage on startup
initializeStorage();

// Auth helper
const authenticateUser = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
};

// User signup
app.post('/make-server-b5bcac8d/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get('/make-server-b5bcac8d/auth/profile', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: user.email?.includes('admin') ? 'admin' : 'citizen'
      }
    });
  } catch (error) {
    console.log('Profile error:', error);
    return c.json({ error: 'Internal server error while fetching profile' }, 500);
  }
});

// Create a report
app.post('/make-server-b5bcac8d/reports', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to create reports' }, 401);
    }
    
    const reportData = await c.req.json();
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const report = {
      ...reportData,
      id: reportId,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(reportId, report);
    
    // Create notification for admins
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      id: notificationId,
      title: 'New Report Submitted',
      message: `New ${report.urgency} priority report: ${report.title}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'admin'
    };
    
    await kv.set(notificationId, notification);
    
    return c.json({ report });
  } catch (error) {
    console.log('Create report error:', error);
    return c.json({ error: 'Internal server error while creating report' }, 500);
  }
});

// Get reports
app.get('/make-server-b5bcac8d/reports', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to view reports' }, 401);
    }
    
    const allReports = await kv.getByPrefix('report_');
    const userRole = user.email?.includes('admin') ? 'admin' : 'citizen';
    
    let reports = allReports;
    
    // Filter reports based on user role
    if (userRole === 'citizen') {
      reports = allReports.filter((report: any) => report.userId === user.id);
    }
    
    return c.json({ reports });
  } catch (error) {
    console.log('Get reports error:', error);
    return c.json({ error: 'Internal server error while fetching reports' }, 500);
  }
});

// Update report status (admin only)
app.patch('/make-server-b5bcac8d/reports/:id', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to update reports' }, 401);
    }
    
    const userRole = user.email?.includes('admin') ? 'admin' : 'citizen';
    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden - only admins can update report status' }, 403);
    }
    
    const reportId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingReport = await kv.get(reportId);
    if (!existingReport) {
      return c.json({ error: 'Report not found' }, 404);
    }
    
    const updatedReport = {
      ...existingReport,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(reportId, updatedReport);
    
    // Create notification for the report owner
    if (updates.status) {
      const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notification = {
        id: notificationId,
        title: 'Report Status Updated',
        message: `Your report "${existingReport.title}" has been updated to ${updates.status.replace('_', ' ')}`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        targetUserId: existingReport.userId
      };
      
      await kv.set(notificationId, notification);
    }
    
    return c.json({ report: updatedReport });
  } catch (error) {
    console.log('Update report error:', error);
    return c.json({ error: 'Internal server error while updating report' }, 500);
  }
});

// Upload media file
app.post('/make-server-b5bcac8d/upload', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to upload files' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const bucketName = 'make-b5bcac8d-citypulse';
    
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(fileArrayBuffer);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.log('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }
    
    // Generate signed URL for the uploaded file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days
    
    if (signedUrlError) {
      console.log('Signed URL error:', signedUrlError);
      return c.json({ error: 'Failed to generate file URL' }, 500);
    }
    
    return c.json({ 
      path: data.path,
      url: signedUrlData.signedUrl,
      fileName: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.log('Upload error:', error);
    return c.json({ error: 'Internal server error during file upload' }, 500);
  }
});

// Get notifications
app.get('/make-server-b5bcac8d/notifications', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to view notifications' }, 401);
    }
    
    const allNotifications = await kv.getByPrefix('notification_');
    const userRole = user.email?.includes('admin') ? 'admin' : 'citizen';
    
    // Filter notifications based on user role and target
    const userNotifications = allNotifications.filter((notification: any) => {
      return (notification.targetUserId === user.id) || 
             (notification.targetRole === userRole) ||
             (!notification.targetUserId && !notification.targetRole);
    });
    
    return c.json({ notifications: userNotifications });
  } catch (error) {
    console.log('Get notifications error:', error);
    return c.json({ error: 'Internal server error while fetching notifications' }, 500);
  }
});

// Mark notification as read
app.patch('/make-server-b5bcac8d/notifications/:id', async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: 'Unauthorized - user must be signed in to update notifications' }, 401);
    }
    
    const notificationId = c.req.param('id');
    const existingNotification = await kv.get(notificationId);
    
    if (!existingNotification) {
      return c.json({ error: 'Notification not found' }, 404);
    }
    
    const updatedNotification = {
      ...existingNotification,
      read: true,
      readAt: new Date().toISOString()
    };
    
    await kv.set(notificationId, updatedNotification);
    
    return c.json({ notification: updatedNotification });
  } catch (error) {
    console.log('Update notification error:', error);
    return c.json({ error: 'Internal server error while updating notification' }, 500);
  }
});

// Health check
app.get('/make-server-b5bcac8d/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);