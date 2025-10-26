import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
import * as createCsvWriter from 'csv-writer';
import * as ExcelJS from 'exceljs';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY);

// Email Configuration
const emailConfig = {
  from: 'noreply@engage360.com',
  replyTo: 'support@engage360.com'
};

// Cloud Function: Send Welcome Email
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  try {
    const msg = {
      to: user.email,
      from: emailConfig.from,
      subject: 'Welcome to Engage360!',
      templateId: 'd-welcome-template-id', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        name: user.displayName || 'User',
        email: user.email,
        loginUrl: 'https://engage360.web.app/login'
      }
    };

    await sgMail.send(msg);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
});

// Cloud Function: Process Program Registration
export const processProgramRegistration = functions.firestore
  .document('programRegistrations/{registrationId}')
  .onCreate(async (snap, context) => {
    try {
      const registration = snap.data();
      const registrationId = context.params.registrationId;

      // Validate registration data
      if (!registration.email || !registration.firstName) {
        throw new Error('Invalid registration data');
      }

      // Send confirmation email
      const confirmationMsg = {
        to: registration.email,
        from: emailConfig.from,
        subject: 'Program Registration Confirmed - Engage360',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Registration Confirmed!</h2>
            <p>Dear ${registration.firstName},</p>
            <p>Thank you for registering for our fitness programs. Your registration has been confirmed.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Registration Details:</h3>
              <p><strong>Name:</strong> ${registration.firstName} ${registration.lastName || ''}</p>
              <p><strong>Email:</strong> ${registration.email}</p>
              <p><strong>Phone:</strong> ${registration.phone || 'Not provided'}</p>
              <p><strong>Fitness Level:</strong> ${registration.fitnessLevel || 'Not specified'}</p>
              <p><strong>Programs:</strong> ${registration.selectedPrograms?.join(', ') || 'None selected'}</p>
            </div>
            
            <p>We'll contact you soon with more details about your selected programs.</p>
            <p>Best regards,<br>The Engage360 Team</p>
          </div>
        `
      };

      await sgMail.send(confirmationMsg);

      // Log admin activity
      await admin.firestore().collection('adminActivityLog').add({
        adminEmail: 'system@engage360.com',
        action: 'PROGRAM_REGISTRATION',
        targetEmail: registration.email,
        details: `New program registration from ${registration.firstName} ${registration.lastName}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Program registration processed for:', registration.email);
    } catch (error) {
      console.error('Error processing program registration:', error);
    }
  });

// Cloud Function: Send Bulk Emails
export const sendBulkEmails = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { recipients, subject, content, templateId } = data;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Recipients array is required');
    }

    const results = [];
    
    for (const recipient of recipients) {
      try {
        const msg = {
          to: recipient.email,
          from: emailConfig.from,
          subject: subject || 'Engage360 Update',
          ...(templateId ? 
            { templateId, dynamicTemplateData: { ...recipient, content } } :
            { html: content || '<p>No content provided</p>' }
          )
        };

        await sgMail.send(msg);
        results.push({ email: recipient.email, status: 'sent' });
      } catch (error) {
        results.push({ email: recipient.email, status: 'failed', error: error.message });
      }
    }

    return { results, totalSent: results.filter(r => r.status === 'sent').length };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send bulk emails');
  }
});

// Cloud Function: Generate Data Export
export const generateDataExport = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { format, dataType, filters } = data;
    const db = admin.firestore();

    let collectionName = '';
    let fileName = '';

    switch (dataType) {
      case 'users':
        collectionName = 'users';
        fileName = 'users';
        break;
      case 'registrations':
        collectionName = 'programRegistrations';
        fileName = 'program-registrations';
        break;
      case 'programs':
        collectionName = 'programs';
        fileName = 'programs';
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid data type');
    }

    // Fetch data from Firestore
    const snapshot = await db.collection(collectionName).get();
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));

    let exportData: Buffer;

    switch (format) {
      case 'csv':
        exportData = await generateCSV(records);
        break;
      case 'pdf':
        exportData = await generatePDF(records, dataType);
        break;
      case 'excel':
        exportData = await generateExcel(records, dataType);
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid format');
    }

    // Store the export in Firebase Storage
    const bucket = admin.storage().bucket();
    const filePath = `exports/${fileName}-${Date.now()}.${format}`;
    const file = bucket.file(filePath);

    await file.save(exportData, {
      metadata: {
        contentType: getContentType(format),
        metadata: {
          generatedBy: context.auth.uid,
          generatedAt: new Date().toISOString(),
          recordCount: records.length.toString()
        }
      }
    });

    // Generate signed URL for download
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    return {
      downloadUrl: signedUrl,
      fileName: `${fileName}-${Date.now()}.${format}`,
      recordCount: records.length
    };
  } catch (error) {
    console.error('Error generating data export:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate export');
  }
});

// Cloud Function: Send Notification
export const sendNotification = functions.https.onCall(async (data, context) => {
  try {
    const { userIds, title, message, type = 'info' } = data;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'User IDs array is required');
    }

    const db = admin.firestore();
    const batch = db.batch();

    // Create notification documents for each user
    for (const userId of userIds) {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();

    return { success: true, notificationsCreated: userIds.length };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// Cloud Function: Data Validation and Cleanup
export const validateAndCleanupData = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      
      // Clean up old notifications (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldNotifications = await db.collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .get();
      
      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`Cleaned up ${oldNotifications.docs.length} old notifications`);
      
      // Validate user data integrity
      const usersSnapshot = await db.collection('users').get();
      let invalidUsers = 0;
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (!userData.email || !userData.displayName) {
          invalidUsers++;
          console.warn(`Invalid user data found: ${doc.id}`);
        }
      });
      
      console.log(`Data validation complete. Found ${invalidUsers} users with invalid data`);
      
    } catch (error) {
      console.error('Error in data validation and cleanup:', error);
    }
  });

// Helper Functions
async function generateCSV(records: any[]): Promise<Buffer> {
  if (records.length === 0) {
    return Buffer.from('No data available');
  }

  const headers = Object.keys(records[0]);
  const csvContent = [
    headers.join(','),
    ...records.map(record => 
      headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  return Buffer.from(csvContent, 'utf8');
}

async function generatePDF(records: any[], dataType: string): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(`Engage360 ${dataType} Report`, 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);
    doc.text(`Total Records: ${records.length}`, 50, 100);

    let yPosition = 130;
    records.forEach((record, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.fontSize(10).text(`Record ${index + 1}:`, 50, yPosition);
      yPosition += 20;
      
      Object.entries(record).forEach(([key, value]) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.text(`${key}: ${String(value)}`, 70, yPosition);
        yPosition += 15;
      });
      
      yPosition += 10;
    });

    doc.end();
  });
}

async function generateExcel(records: any[], dataType: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(dataType);

  if (records.length === 0) {
    worksheet.addRow(['No data available']);
    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  // Add headers
  const headers = Object.keys(records[0]);
  worksheet.addRow(headers);

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data rows
  records.forEach(record => {
    const row = headers.map(header => {
      const value = record[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });
    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  return await workbook.xlsx.writeBuffer() as Buffer;
}

function getContentType(format: string): string {
  switch (format) {
    case 'csv': return 'text/csv';
    case 'pdf': return 'application/pdf';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default: return 'application/octet-stream';
  }
}
