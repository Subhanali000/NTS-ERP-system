import jsPDF from 'jspdf';
import { User } from '../types';
import { formatDate } from './dateUtils';

export const generateOfferLetter = (user: User, position: string, salary: string): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('NTS Technologies', 20, 30);
  doc.setFontSize(16);
  doc.text('Offer Letter', 20, 45);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(new Date())}`, 20, 65);
  
  // Content
  doc.text(`Dear ${user.name},`, 20, 85);
  
  const content = [
    `We are pleased to offer you the position of ${position} at NTS Technologies.`,
    '',
    'Position Details:',
    `• Position: ${position}`,
    `• Department: ${user.department.toUpperCase()}`,
    `• Salary: ${salary}`,
    `• Start Date: ${formatDate(new Date())}`,
    '',
    'We look forward to having you join our team.',
    '',
    'Sincerely,',
    'HR Department',
    'NTS Technologies'
  ];
  
  let yPosition = 105;
  content.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 15;
  });
  
  doc.save(`offer-letter-${user.name.replace(' ', '-').toLowerCase()}.pdf`);
};

export const generateExperienceCertificate = (user: User): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('NTS Technologies', 20, 30);
  doc.setFontSize(16);
  doc.text('Experience Certificate', 20, 45);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(new Date())}`, 20, 65);
  
  // Content
  doc.text('TO WHOM IT MAY CONCERN', 20, 85);
  
  const content = [
    '',
    `This is to certify that ${user.name} was employed with NTS Technologies`,
    `from ${formatDate(user.joinDate)} to ${formatDate(new Date())}.`,
    '',
    `During the tenure, ${user.name} worked as ${user.role.replace('_', ' ').toUpperCase()}`,
    `in the ${user.department.toUpperCase()} department.`,
    '',
    `${user.name} has been a valuable team member and has contributed`,
    'significantly to our organization.',
    '',
    'We wish them all the best for future endeavors.',
    '',
    'Sincerely,',
    'HR Department',
    'NTS Technologies'
  ];
  
  let yPosition = 105;
  content.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 15;
  });
  
  doc.save(`experience-certificate-${user.name.replace(' ', '-').toLowerCase()}.pdf`);
};

export const generateLOR = (user: User, recommenderName: string): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('NTS Technologies', 20, 30);
  doc.setFontSize(16);
  doc.text('Letter of Recommendation', 20, 45);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(new Date())}`, 20, 65);
  
  // Content
  doc.text('TO WHOM IT MAY CONCERN', 20, 85);
  
  const content = [
    '',
    `I am writing to recommend ${user.name}, who worked under my supervision`,
    `at NTS Technologies from ${formatDate(user.joinDate)} to ${formatDate(new Date())}.`,
    '',
    `${user.name} consistently demonstrated exceptional skills and dedication`,
    'in their role. They were reliable, professional, and contributed',
    'significantly to our team\'s success.',
    '',
    `I highly recommend ${user.name} for any future opportunities.`,
    '',
    'Sincerely,',
    recommenderName,
    'NTS Technologies'
  ];
  
  let yPosition = 105;
  content.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 15;
  });
  
  doc.save(`letter-of-recommendation-${user.name.replace(' ', '-').toLowerCase()}.pdf`);
};

export const generateInternshipCertificate = (user: User): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('NTS Technologies', 20, 30);
  doc.setFontSize(16);
  doc.text('Internship Completion Certificate', 20, 45);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(new Date())}`, 20, 65);
  
  // Content
  doc.text('CERTIFICATE OF COMPLETION', 20, 85);
  
  const content = [
    '',
    `This is to certify that ${user.name} has successfully completed`,
    `an internship program at NTS Technologies from ${formatDate(user.joinDate)}`,
    `to ${formatDate(new Date())}.`,
    '',
    `During the internship period, ${user.name} worked in the`,
    `${user.department.toUpperCase()} department and demonstrated excellent`,
    'learning capabilities and professional conduct.',
    '',
    'We wish them success in their future career.',
    '',
    'Sincerely,',
    'HR Department',
    'NTS Technologies'
  ];
  
  let yPosition = 105;
  content.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 15;
  });
  
  doc.save(`internship-certificate-${user.name.replace(' ', '-').toLowerCase()}.pdf`);
};