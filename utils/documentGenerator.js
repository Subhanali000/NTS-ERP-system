const supabase = require('../config/supabase');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

exports.generateDocument = async (user_id, type, details) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;

        let content = '';
        switch (type) {
            case 'offer_letter':
                content = `
                    Offer Letter
                    To: ${details.name}
                    Position: ${details.position}
                    Department: ${details.department}
                    Start Date: ${details.start_date}
                    
                    Dear ${details.name},
                    We are pleased to offer you the position of ${details.position} in our ${details.department} department...
                `;
                break;
            case 'experience_certificate':
                content = `
                    Experience Certificate
                    To Whom It May Concern,
                    This is to certify that ${details.name} was employed as ${details.position} from ${details.start_date} to ${details.end_date}...
                `;
                break;
            case 'lor':
                content = `
                    Letter of Recommendation
                    To Whom It May Concern,
                    It is with great pleasure that we recommend ${details.name} for their outstanding contributions as ${details.position}...
                `;
                break;
            case 'internship_certificate':
                content = `
                    Internship Completion Certificate
                    This is to certify that ${details.name} successfully completed an internship from ${details.start_date} to ${details.end_date}...
                `;
                break;
            default:
                throw new Error('Invalid document type');
        }

        page.drawText(content, {
            x: 50,
            y: height - 50,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        const fileName = `${type}_${user_id}_${Date.now()}.pdf`;

        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, pdfBytes, { contentType: 'application/pdf' });

        if (error) throw error;

        const { data: docData, error: dbError } = await supabase
            .from('documents')
            .insert([{ user_id, type, file_url: data.path }])
            .select();

        if (dbError) throw dbError;

        return docData[0];
    } catch (error) {
        throw new Error(`Document generation failed: ${error.message}`);
    }
};