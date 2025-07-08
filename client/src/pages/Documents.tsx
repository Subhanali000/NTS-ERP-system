import React, { useState } from 'react';
import { FileText, Download, Plus, Search, Lock, Eye, Shield, Key } from 'lucide-react';
import { getCurrentUser, isDirector, isManager } from '../utils/auth';
import { 
  generateOfferLetter, 
  generateExperienceCertificate, 
  generateLOR, 
  generateInternshipCertificate 
} from '../utils/documentGenerator';

const Documents: React.FC = () => {
  const user = getCurrentUser();
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isDir = isDirector(user.role);
  const isMgr = isManager(user.role);

  const documentTypes = [
    { id: 'offer_letter', name: 'Offer Letter', description: 'Generate offer letter for new hires' },
    { id: 'experience_certificate', name: 'Experience Certificate', description: 'Certificate of employment experience' },
    { id: 'letter_of_recommendation', name: 'Letter of Recommendation', description: 'Professional recommendation letter' },
    { id: 'internship_certificate', name: 'Internship Certificate', description: 'Certificate for completed internships' }
  ];

  const handleGenerate = (docType: string) => {
    switch (docType) {
      case 'offer_letter':
        generateOfferLetter(user, 'Software Engineer', '$75,000');
        break;
      case 'experience_certificate':
        generateExperienceCertificate(user);
        break;
      case 'letter_of_recommendation':
        generateLOR(user, 'Robert Davis');
        break;
      case 'internship_certificate':
        generateInternshipCertificate(user);
        break;
    }
    setShowGenerateForm(false);
  };

  const handleDocumentAccess = (document: any) => {
    // If it's the user's own document, allow direct access
    if (document.userId === user.id) {
      // Direct access to own documents
      console.log('Accessing own document:', document.name);
      return;
    }

    // For other users' documents, require password
    setSelectedDocument(document);
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = () => {
    // Simple password check - in production, this would be more secure
    const correctPassword = 'hr2024secure';
    
    if (password === correctPassword) {
      setShowPasswordPrompt(false);
      setPassword('');
      setPasswordError('');
      console.log('Accessing document:', selectedDocument.name);
      // Here you would actually open/download the document
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const GenerateDocumentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Document</h3>
        <div className="space-y-3">
          {documentTypes.map((docType) => (
            <button
              key={docType.id}
              onClick={() => handleGenerate(docType.id)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{docType.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGenerateForm(false)}
          className="w-full mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const PasswordPrompt = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Protected Document</h3>
          <p className="text-gray-600 mt-2">This document requires a password to access</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  passwordError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter document password"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            {passwordError && (
              <p className="text-red-600 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                <p className="text-sm text-yellow-700">
                  This document contains sensitive information and requires authorization to access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePasswordSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Document
            </button>
            <button
              onClick={() => {
                setShowPasswordPrompt(false);
                setPassword('');
                setPasswordError('');
                setSelectedDocument(null);
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock documents with ownership and access control
  const mockDocuments = [
    {
      id: '1',
      name: 'Employment Contract - Jennifer Lee.pdf',
      type: 'Contract',
      date: '2022-01-10',
      size: '245 KB',
      userId: user.id, // User's own document
      isProtected: false
    },
    {
      id: '2',
      name: 'Performance Review - Q4 2023.pdf',
      type: 'Review',
      date: '2023-12-15',
      size: '180 KB',
      userId: user.id, // User's own document
      isProtected: false
    },
    {
      id: '3',
      name: 'Training Certificate - React Advanced.pdf',
      type: 'Certificate',
      date: '2023-11-20',
      size: '320 KB',
      userId: user.id, // User's own document
      isProtected: false
    },
    {
      id: '4',
      name: 'Leave Application - Feb 2024.pdf',
      type: 'Leave',
      date: '2024-02-01',
      size: '95 KB',
      userId: user.id, // User's own document
      isProtected: false
    },
    // Other users' documents (protected)
    {
      id: '5',
      name: 'Salary Review - Alex Johnson.pdf',
      type: 'Confidential',
      date: '2024-01-15',
      size: '156 KB',
      userId: 'other-user-1',
      isProtected: true
    },
    {
      id: '6',
      name: 'HR Policy - Compensation Guidelines.pdf',
      type: 'Policy',
      date: '2024-01-20',
      size: '892 KB',
      userId: 'hr-admin',
      isProtected: true
    },
    {
      id: '7',
      name: 'Employee Handbook - Confidential.pdf',
      type: 'Handbook',
      date: '2024-01-25',
      size: '2.1 MB',
      userId: 'hr-admin',
      isProtected: true
    }
  ];

  // Filter documents based on user access
  const userDocuments = mockDocuments.filter(doc => doc.userId === user.id);
  const protectedDocuments = mockDocuments.filter(doc => doc.userId !== user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage and generate your employment documents</p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Document</span>
        </button>
      </div>

      {/* Document Generator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {documentTypes.map((docType) => (
          <div key={docType.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <button
                onClick={() => handleGenerate(docType.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{docType.name}</h3>
            <p className="text-sm text-gray-600">{docType.description}</p>
          </div>
        ))}
      </div>

      {/* My Documents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search my documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Types</option>
            <option value="contract">Contract</option>
            <option value="review">Review</option>
            <option value="certificate">Certificate</option>
            <option value="leave">Leave</option>
          </select>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>My Documents</span>
          </h3>
          {userDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDocumentAccess(doc)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Protected Documents Section (for Directors/Managers) */}
      {(isDir || isMgr) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>Protected Documents</span>
              <span className="text-sm font-normal text-gray-500">(Password Required)</span>
            </h3>
            {protectedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{new Date(doc.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="text-red-600 font-medium">Protected</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDocumentAccess(doc)}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                <p className="text-sm text-yellow-700">
                  Protected documents require password authentication. Contact HR for access credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Documents Message */}
      {userDocuments.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No documents found</p>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Generate your first document
          </button>
        </div>
      )}

      {/* Modals */}
      {showGenerateForm && <GenerateDocumentForm />}
      {showPasswordPrompt && <PasswordPrompt />}
    </div>
  );
};

export default Documents;