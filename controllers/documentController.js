const supabase = require('../config/supabase');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  const { user_id, document_type } = req.body;
  const file = req.file;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${user_id}/${document_type}-${Date.now()}.pdf`, file.buffer);

  if (error) return res.status(400).json({ error: error.message });

  const { error: dbError } = await supabase.from('documents').insert({
    user_id,
    document_type,
    file_path: data.path,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(201).json({ message: 'Document uploaded' });
};

exports.generateOfferLetter = async (req, res) => {
  const { user_id } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('name, designation, department, doj')
    .eq('id', user_id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const doc = new PDFDocument();
  const fileName = `offer-letter-${user_id}.pdf`;
  const filePath = path.join(__dirname, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Offer Letter', { align: 'center' });
  doc.text(`Dear ${user.name},`);
  doc.text(`We are pleased to offer you the position of ${user.designation} in the ${user.department} department, starting from ${user.doj}.`);
  doc.text('We look forward to your contributions to our team.');
  doc.end();

  const fileBuffer = fs.readFileSync(filePath);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`generated/${fileName}`, fileBuffer);

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  fs.unlinkSync(filePath);

  const { error: dbError } = await supabase.from('documents').insert({
    user_id,
    document_type: 'offer_letter',
    file_path: uploadData.path,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'Offer letter generated' });
};

exports.generateExperienceCertificate = async (req, res) => {
  const { user_id } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('name, designation, department, doj, role')
    .eq('id', user_id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const doc = new PDFDocument();
  const fileName = `experience-certificate-${user_id}.pdf`;
  const filePath = path.join(__dirname, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Experience Certificate', { align: 'center' });
  doc.text(`This is to certify that ${user.name} has worked as a ${user.designation} in the ${user.department} department from ${user.doj} to ${new Date().toISOString().split('T')[0]}.`);
  doc.text(`During their tenure, ${user.name} demonstrated professionalism and dedication.`);
  doc.text('We wish them success in their future endeavors.');
  doc.end();

  const fileBuffer = fs.readFileSync(filePath);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`generated/${fileName}`, fileBuffer);

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  fs.unlinkSync(filePath);

  const { error: dbError } = await supabase.from('documents').insert({
    user_id,
    document_type: 'experience_certificate',
    file_path: uploadData.path,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'Experience certificate generated' });
};

exports.generateLetterOfRecommendation = async (req, res) => {
  const { user_id } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('name, designation, department, doj')
    .eq('id', user_id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const doc = new PDFDocument();
  const fileName = `lor-${user_id}.pdf`;
  const filePath = path.join(__dirname, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Letter of Recommendation', { align: 'center' });
  doc.text(`To Whom It May Concern,`);
  doc.text(`I am pleased to recommend ${user.name}, who served as a ${user.designation} in our ${user.department} department from ${user.doj}.`);
  doc.text(`${user.name} exhibited strong skills and a commendable work ethic.`);
  doc.text('I highly recommend them for any future opportunities.');
  doc.text('Sincerely,');
  doc.text('[Your Company Name]');
  doc.end();

  const fileBuffer = fs.readFileSync(filePath);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`generated/${fileName}`, fileBuffer);

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  fs.unlinkSync(filePath);

  const { error: dbError } = await supabase.from('documents').insert({
    user_id,
    document_type: 'letter_of_recommendation',
    file_path: uploadData.path,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'Letter of recommendation generated' });
};

exports.generateInternshipCompletionCertificate = async (req, res) => {
  const { user_id } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('name, college, internship_start_date, internship_end_date')
    .eq('id', user_id)
    .eq('role', 'intern')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const doc = new PDFDocument();
  const fileName = `internship-completion-${user_id}.pdf`;
  const filePath = path.join(__dirname, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Internship Completion Certificate', { align: 'center' });
  doc.text(`This is to certify that ${user.name} from ${user.college} has successfully completed an internship with us from ${user.internship_start_date} to ${user.internship_end_date}.`);
  doc.text(`${user.name} has shown commitment and learned valuable skills during their internship.`);
  doc.text('We appreciate their contributions and wish them the best in their future career.');
  doc.end();

  const fileBuffer = fs.readFileSync(filePath);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`generated/${fileName}`, fileBuffer);

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  fs.unlinkSync(filePath);

  const { error: dbError } = await supabase.from('documents').insert({
    user_id,
    document_type: 'internship_completion',
    file_path: uploadData.path,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'Internship completion certificate generated' });
};